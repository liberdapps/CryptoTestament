
const CryptoTestamentService = artifacts.require("CryptoTestamentService");
const CryptoTestament = artifacts.require('CryptoTestament');
const _ = require('lodash');

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const advanceTime = (time) => {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [time],
      id: new Date().getTime()
    }, (err, result) => {
      if (err) { return reject(err) }
      return resolve(result)
    })
  })
}

contract('CryptoTestament', function (accounts) {
  let serviceInstance;
  let serviceOwnerAddress = accounts[0];
  let testatorAddress = accounts[1];
  let beneficiaryAddress = accounts[2];
  let randomAddress = accounts[3];

  it('Initialize the service contract', async function () {
    serviceInstance = await CryptoTestamentService.deployed();

    let serviceOwner = await serviceInstance.serviceOwner();
    let serviceFeeRate = await serviceInstance.serviceFeeRate();
    let contractBalance = await serviceInstance.contractBalance();

    assert.equal(serviceOwner, serviceOwnerAddress, 'Check service owner.');
    assert.equal(serviceFeeRate.toString(), '25', 'Check service fee rate.');
    assert.equal(contractBalance.toString(), '0', 'Check service fee balance.');
  });

  it('Try and fail to change service fee rate using non-owner account', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.setServiceFeeRate(50, { from: randomAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot set service fee rate: sender is not the service owner.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to withdraw service fees using non-owner account', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.withdrawServiceFees({ from: randomAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot withdraw service fees: sender is not the service owner.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Change service fee rate using owner account', async function () {
    await serviceInstance.setServiceFeeRate(50, { from: serviceOwnerAddress });
    let serviceFeeRate = await serviceInstance.serviceFeeRate();
    assert.equal(serviceFeeRate.toString(), '50', 'Check new service fee rate.');

    await serviceInstance.setServiceFeeRate(25, { from: serviceOwnerAddress });
    serviceFeeRate = await serviceInstance.serviceFeeRate();
    assert.equal(serviceFeeRate.toString(), '25', 'Check new service fee rate.');
  });

  it('No testaments scenario', async function () {
    let testaments = await serviceInstance.testaments();
    assert.equal(0, testaments.length, 'Check empty testament list.');

    let nonExistingTestament = await serviceInstance.testamentDetailsOf(randomAddress);
    assert.equal(false, nonExistingTestament.exists, 'Check non-existing testament info.');
  });

  it('Try and fail to cancel a non-existing testament', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.cancelTestament({ from: randomAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot cancel testament: testament not found.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to reactivate a non-existing testament', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.reactivateTestament({ from: randomAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot reactivate testament: testament not found.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to execute a non-existing testament', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.executeTestamentOf(randomAddress, { from: randomAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot execute testament: testament not found.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to withdraw funds from a non-existing testament', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.withdrawTestamentFunds(web3.utils.toWei('0.01', 'ether'), { from: randomAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot withdraw testament funds: testament not found.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to create new testament - Invalid beneficiary address', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.setupTestament('0x0000000000000000000000000000000000000000', 30 * 24 * 3600, "", "", { from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot deploy testament: beneficiary address must be non-null.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to create new testament - Invalid proof of life threshold', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.setupTestament(beneficiaryAddress, (30 * 24 * 3600) - 1, "", "", { from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot deploy testament: proof of life threshold must be >= 30 days.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to create new testament - Encrypted key missing', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.setupTestament(beneficiaryAddress, 30 * 24 * 3600, "", "", { from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot deploy testament: encrypted key must be set.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to create new testament - Encrypted testament info missing', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.setupTestament(beneficiaryAddress, 30 * 24 * 3600, "encryptedKey", "", { from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot deploy testament: encrypted testament info must be set.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Create new testament', async function () {
    await serviceInstance.setupTestament(beneficiaryAddress, 30 * 24 * 3600, "encryptedKey", "encryptedInfo", { from: testatorAddress });
    let testaments = await serviceInstance.testaments();
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    assert.equal(1, testaments.length, 'Check testament list.');
    assert.equal(_.isEqual(testaments[0], testamentInfo), true, 'Check testament info.');

    let creationTimestamp = web3.utils.toBN(testamentInfo.creationTimestamp);
    let lastProofOfLifeTimestamp = web3.utils.toBN(testamentInfo.lastProofOfLifeTimestamp);

    assert(creationTimestamp.gt(web3.utils.toBN('0')), 'Check creation timestamp.');
    assert.equal(testamentInfo.testatorAddress, testatorAddress, 'Check testator address.');
    assert.equal(testamentInfo.testamentBalance, '0', 'Check testament balance.');
    assert.equal(testamentInfo.beneficiaryAddress, beneficiaryAddress, 'Check beneficiary address.');
    assert.equal(testamentInfo.proofOfLifeThreshold, 30 * 24 * 3600, 'Check proof of life threshold.');
    assert.equal(creationTimestamp.toString(), lastProofOfLifeTimestamp.toString(), 'Check last proof of life timestamp.');
    assert.equal(testamentInfo.encryptedKey, 'encryptedKey', 'Check encrypted key.');
    assert.equal(testamentInfo.encryptedInfo, 'encryptedInfo', 'Check encrypted information.');
    assert.equal(testamentInfo.executionTimestamp, '0', 'Check execution timestamp.');
    assert.equal(testamentInfo.executionBalance, '0', 'Check execution balance.');
    assert.equal(testamentInfo.status, '0', 'Check status.');
    assert.equal(testamentInfo.exists, true, 'Check existence flag.');
  });

  it('Try and fail to update a testament using a non-testator address', async function () {
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let cryptoTestament = await CryptoTestament.at(testamentInfo.testamentAddress);
    let errorRaised = false;
    try {
      await cryptoTestament.updateDetails(beneficiaryAddress, 30 * 24 * 3600, "encryptedKey", "encryptedInfo", { from: randomAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot update testament: sender is not the testator.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to cancel testament using a non-testator address', async function () {
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let cryptoTestament = await CryptoTestament.at(testamentInfo.testamentAddress);

    let errorRaised = false;
    try {
      await cryptoTestament.cancelTestament({ from: randomAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot cancel testament: sender is not the testator.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to reactivate testament using a non-testator address', async function () {
    let errorRaised = false;
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let cryptoTestament = await CryptoTestament.at(testamentInfo.testamentAddress);
    try {
      await cryptoTestament.reactivateTestament({ from: randomAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot reactivate testament: sender is not the testator.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to fund a testament using a non-testator address', async function () {
    let errorRaised = false;
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    try {
      await web3.eth.sendTransaction({ from: randomAddress, to: testamentInfo.testamentAddress, value: web3.utils.toWei('0.001', 'ether') });
    } catch (errObj) {
      let errKey = Object.keys(errObj.data)[0];
      let err = errObj.data[errKey];
      assert.equal(err.reason, 'Cannot deposit funds: sender is not the testator.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to withdraw testament funds from a non-testator address', async function () {
    let errorRaised = false;
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let cryptoTestament = await CryptoTestament.at(testamentInfo.testamentAddress);
    try {
      await cryptoTestament.withdrawFunds(web3.utils.toWei('0.01', 'ether'), { from: randomAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot withdraw testament funds: sender is not the testator.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to update testament - Invalid beneficiary address', async function () {
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let cryptoTestament = await CryptoTestament.at(testamentInfo.testamentAddress);
    let errorRaised = false;
    try {
      await cryptoTestament.updateDetails('0x0000000000000000000000000000000000000000', 30 * 24 * 3600, "", "", { from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot update testament: beneficiary address must be non-null.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });


  it('Try and fail to update testament - Invalid proof of life threshold', async function () {
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let cryptoTestament = await CryptoTestament.at(testamentInfo.testamentAddress);
    let errorRaised = false;
    try {
      await cryptoTestament.updateDetails(beneficiaryAddress, (30 * 24 * 3600) - 1, "", "", { from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot update testament: proof of life threshold must be >= 30 days.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to update testament - Encrypted key missing', async function () {
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let cryptoTestament = await CryptoTestament.at(testamentInfo.testamentAddress);
    let errorRaised = false;
    try {
      await cryptoTestament.updateDetails(beneficiaryAddress, 30 * 24 * 3600, "", "", { from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot update testament: encrypted key must be set.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to update new testament - Encrypted testament info missing', async function () {
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let cryptoTestament = await CryptoTestament.at(testamentInfo.testamentAddress);
    let errorRaised = false;
    try {
      await cryptoTestament.updateDetails(beneficiaryAddress, 30 * 24 * 3600, "encryptedKey", "", { from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot update testament: encrypted testament info must be set.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Update testament', async function () {
    let oldTestamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let cryptoTestament = await CryptoTestament.at(oldTestamentInfo.testamentAddress);
    let oldProofOfLifeTimestamp = web3.utils.toBN(oldTestamentInfo.lastProofOfLifeTimestamp);

    await sleep(1000);
    await serviceInstance.setupTestament(beneficiaryAddress, 60 * 24 * 3600, "encryptedKey2", "encryptedInfo2", { from: testatorAddress });
    let newTestamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let newProofOfLifeTimestamp = web3.utils.toBN(newTestamentInfo.lastProofOfLifeTimestamp);

    assert.equal(newTestamentInfo.creationTimestamp, oldTestamentInfo.creationTimestamp, 'Check creation timestamp.');
    assert.equal(newTestamentInfo.testatorAddress, testatorAddress, 'Check testator address.');
    assert.equal(newTestamentInfo.testamentBalance, '0', 'Check testament balance.');
    assert.equal(newTestamentInfo.beneficiaryAddress, beneficiaryAddress, 'Check beneficiary address.');
    assert.equal(newTestamentInfo.proofOfLifeThreshold, 60 * 24 * 3600, 'Check proof of life threshold.');
    assert(newProofOfLifeTimestamp.gt(oldProofOfLifeTimestamp), 'Check last proof of life timestamp.');
    assert.equal(newTestamentInfo.encryptedKey, 'encryptedKey2', 'Check encrypted key.');
    assert.equal(newTestamentInfo.encryptedInfo, 'encryptedInfo2', 'Check encrypted information.');
    assert.equal(newTestamentInfo.executionTimestamp, '0', 'Check execution timestamp.');
    assert.equal(newTestamentInfo.executionBalance, '0', 'Check execution balance.');
    assert.equal(newTestamentInfo.status, '0', 'Check status.');
    assert.equal(newTestamentInfo.exists, true, 'Check existence flag.');

    oldTestamentInfo = newTestamentInfo;
    newProofOfLifeTimestamp = oldProofOfLifeTimestamp;
    await sleep(1000);
    await cryptoTestament.updateDetails(beneficiaryAddress, 30 * 24 * 3600, "encryptedKey3", "encryptedInfo3", { from: testatorAddress })

    newTestamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    newProofOfLifeTimestamp = web3.utils.toBN(newTestamentInfo.lastProofOfLifeTimestamp);

    assert.equal(newTestamentInfo.creationTimestamp, oldTestamentInfo.creationTimestamp, 'Check creation timestamp.');
    assert.equal(newTestamentInfo.testatorAddress, testatorAddress, 'Check testator address.');
    assert.equal(newTestamentInfo.testamentBalance, '0', 'Check testament balance.');
    assert.equal(newTestamentInfo.beneficiaryAddress, beneficiaryAddress, 'Check beneficiary address.');
    assert.equal(newTestamentInfo.proofOfLifeThreshold, 30 * 24 * 3600, 'Check proof of life threshold.');
    assert(newProofOfLifeTimestamp.gt(oldProofOfLifeTimestamp), 'Check last proof of life timestamp.');
    assert.equal(newTestamentInfo.encryptedKey, 'encryptedKey3', 'Check encrypted key.');
    assert.equal(newTestamentInfo.encryptedInfo, 'encryptedInfo3', 'Check encrypted information.');
    assert.equal(newTestamentInfo.executionTimestamp, '0', 'Check execution timestamp.');
    assert.equal(newTestamentInfo.executionBalance, '0', 'Check execution balance.');
    assert.equal(newTestamentInfo.status, '0', 'Check status.');
    assert.equal(newTestamentInfo.exists, true, 'Check existence flag.');
  });

  it('Fund a testament using the testator address', async function () {
    let oldTestamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let oldProofOfLifeTimestamp = web3.utils.toBN(oldTestamentInfo.lastProofOfLifeTimestamp);

    await sleep(1000);
    await web3.eth.sendTransaction({ from: testatorAddress, to: oldTestamentInfo.testamentAddress, value: web3.utils.toWei('0.01', 'ether') });
    let newTestamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let newProofOfLifeTimestamp = web3.utils.toBN(newTestamentInfo.lastProofOfLifeTimestamp);
    let contractBalance = await serviceInstance.contractBalance();

    assert.equal(newTestamentInfo.testamentBalance, web3.utils.toWei('0.009975', 'ether').toString(), 'Check testament balance.');
    assert(newProofOfLifeTimestamp.gt(oldProofOfLifeTimestamp), 'Check new proof of life timestamp.');
    assert.equal(contractBalance.toString(), web3.utils.toWei('0.000025', 'ether').toString(), 'Check service fee balance.');
  });

  it('Withdraw service fees', async function () {
    let oldContractBalance = await serviceInstance.contractBalance();
    assert.equal(oldContractBalance.toString(), web3.utils.toWei('0.000025', 'ether').toString());

    let oldServiceOwnerBalance = web3.utils.toBN(await web3.eth.getBalance(serviceOwnerAddress));
    let txnReceipt = await serviceInstance.withdrawServiceFees({ from: serviceOwnerAddress });
    let txn = await web3.eth.getTransaction(txnReceipt.tx);
    let gasUsed = web3.utils.toBN(txnReceipt.receipt.gasUsed);
    let transactionCost = gasUsed.mul(web3.utils.toBN(txn.gasPrice));

    let expectedNewServiceOwnerBalance = oldServiceOwnerBalance.add(web3.utils.toBN(oldContractBalance)).sub(transactionCost);
    let currentServiceOwnerBalance = web3.utils.toBN(await web3.eth.getBalance(serviceOwnerAddress));
    assert.equal(expectedNewServiceOwnerBalance.toString(), currentServiceOwnerBalance.toString(), 'Check new account balance.')

    let newContractBalance = await serviceInstance.contractBalance();
    assert.equal(newContractBalance.toString(), '0', 'Check service fee balance.');
  });

  it('Try and fail to withdraw more funds than available in a testament', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.withdrawTestamentFunds(web3.utils.toWei('0.01', 'ether'), { from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot withdraw testament funds: amount should be <= the testament balance.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Withdraw testament funds', async function () {
    let amount = web3.utils.toWei('0.005', 'ether');
    let oldTestamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let cryptoTestament = await CryptoTestament.at(oldTestamentInfo.testamentAddress);
    assert.equal(oldTestamentInfo.testamentBalance, web3.utils.toWei('0.009975', 'ether').toString());

    let oldProofOfLifeTimestamp = web3.utils.toBN(oldTestamentInfo.lastProofOfLifeTimestamp);
    let oldTestatorBalance = web3.utils.toBN(await web3.eth.getBalance(testatorAddress));
    let txnReceipt = await serviceInstance.withdrawTestamentFunds(amount, { from: testatorAddress });
    let txn = await web3.eth.getTransaction(txnReceipt.tx);
    let gasUsed = web3.utils.toBN(txnReceipt.receipt.gasUsed);
    let transactionCost = gasUsed.mul(web3.utils.toBN(txn.gasPrice));

    let expectedNewTestatorBalance = oldTestatorBalance.add(web3.utils.toBN(amount)).sub(transactionCost);
    let currentTestatorBalance = web3.utils.toBN(await web3.eth.getBalance(testatorAddress));

    assert.equal(expectedNewTestatorBalance.toString(), currentTestatorBalance.toString(), 'Check new account balance.')

    let newTestamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    assert.equal(newTestamentInfo.testamentBalance, web3.utils.toWei('0.004975', 'ether').toString(), 'Check new testament balance.');

    let newProofOfLifeTimestamp = web3.utils.toBN(newTestamentInfo.lastProofOfLifeTimestamp);
    assert(newProofOfLifeTimestamp.gt(oldProofOfLifeTimestamp), 'Check new proof of life timestamp.');

    oldProofOfLifeTimestamp = newProofOfLifeTimestamp;
    amount = web3.utils.toWei('0.003975', 'ether');
    oldTestatorBalance = currentTestatorBalance;

    await sleep(1000);
    txnReceipt = await cryptoTestament.withdrawFunds(amount, { from: testatorAddress });
    txn = await web3.eth.getTransaction(txnReceipt.tx);
    gasUsed = web3.utils.toBN(txnReceipt.receipt.gasUsed);
    transactionCost = gasUsed.mul(web3.utils.toBN(txn.gasPrice));

    expectedNewTestatorBalance = oldTestatorBalance.add(web3.utils.toBN(amount)).sub(transactionCost);
    currentTestatorBalance = web3.utils.toBN(await web3.eth.getBalance(testatorAddress));

    assert.equal(expectedNewTestatorBalance.toString(), currentTestatorBalance.toString(), 'Check new account balance.')

    newTestamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    assert.equal(newTestamentInfo.testamentBalance, web3.utils.toWei('0.001', 'ether').toString(), 'Check new testament balance.');
    newProofOfLifeTimestamp = web3.utils.toBN(newTestamentInfo.lastProofOfLifeTimestamp);
    assert(newProofOfLifeTimestamp.gt(oldProofOfLifeTimestamp), 'Check new proof of life timestamp.');
  });

  it('Try and fail to reactivate a locked testament', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.reactivateTestament({ from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot reactivate testament: testament is not CANCELLED.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to execute a locked testament', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.executeTestamentOf(testatorAddress);
    } catch (err) {
      assert.equal(err.reason, 'Cannot execute testament: last proof of life is still active.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Cancel a testament', async function () {
    await serviceInstance.cancelTestament({ from: testatorAddress });
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    assert.equal(testamentInfo.status, '1', 'Check new status.');
  });

  it('Try and fail to update a cancelled testament', async function () {
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let cryptoTestament = await CryptoTestament.at(testamentInfo.testamentAddress);
    let errorRaised = false;
    try {
      await cryptoTestament.updateDetails(beneficiaryAddress, 30 * 24 * 3600, "encryptedKey", "encryptedInfo", { from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot update testament: testament is not LOCKED.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to cancel a cancelled testament', async function () {
    let errorRaised = false;
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let cryptoTestament = await CryptoTestament.at(testamentInfo.testamentAddress);
    try {
      await cryptoTestament.cancelTestament({ from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot cancel testament: testament is not LOCKED.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to fund a cancelled testament', async function () {
    let errorRaised = false;
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    try {
      await web3.eth.sendTransaction({ from: testatorAddress, to: testamentInfo.testamentAddress, value: web3.utils.toWei('0.01', 'ether') });
    } catch (errObj) {
      let errKey = Object.keys(errObj.data)[0];
      let err = errObj.data[errKey];
      assert.equal(err.reason, 'Cannot deposit funds: testament is not LOCKED.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to execute a cancelled testament', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.executeTestamentOf(testatorAddress);
    } catch (err) {
      assert.equal(err.reason, 'Cannot execute testament: testament is not LOCKED.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Withdraw funds from a cancelled testament', async function () {
    let amount = web3.utils.toWei('0.001', 'ether');
    let oldTestamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    assert.equal(oldTestamentInfo.testamentBalance, web3.utils.toWei('0.001', 'ether').toString());

    let oldProofOfLifeTimestamp = web3.utils.toBN(oldTestamentInfo.lastProofOfLifeTimestamp);
    let oldTestatorBalance = web3.utils.toBN(await web3.eth.getBalance(testatorAddress));
    let txnReceipt = await serviceInstance.withdrawTestamentFunds(amount, { from: testatorAddress });
    let txn = await web3.eth.getTransaction(txnReceipt.tx);
    let gasUsed = web3.utils.toBN(txnReceipt.receipt.gasUsed);
    let transactionCost = gasUsed.mul(web3.utils.toBN(txn.gasPrice));

    let expectedNewTestatorBalance = oldTestatorBalance.add(web3.utils.toBN(amount)).sub(transactionCost);
    let currentTestatorBalance = web3.utils.toBN(await web3.eth.getBalance(testatorAddress));

    assert.equal(expectedNewTestatorBalance.toString(), currentTestatorBalance.toString(), 'Check new account balance.')

    let newTestamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    assert.equal(newTestamentInfo.testamentBalance, web3.utils.toWei('0.00', 'ether').toString(), 'Check new testament balance.');

    let newProofOfLifeTimestamp = web3.utils.toBN(newTestamentInfo.lastProofOfLifeTimestamp);
    assert.equal(newProofOfLifeTimestamp.toString(), oldProofOfLifeTimestamp.toString(), 'Check proof of life.');
  });

  it('Reactivate a testament', async function () {
    let oldTestamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let oldProofOfLifeTimestamp = web3.utils.toBN(oldTestamentInfo.lastProofOfLifeTimestamp);
    await sleep(1000);
    await serviceInstance.reactivateTestament({ from: testatorAddress });
    let newTestamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let newProofOfLifeTimestamp = web3.utils.toBN(newTestamentInfo.lastProofOfLifeTimestamp);

    assert.equal(newTestamentInfo.status, '0', 'Check new status.');
    assert(newProofOfLifeTimestamp.gt(oldProofOfLifeTimestamp), 'Check last proof of life timestamp.');
  });

  it('Try and fail to update an expired testament', async function () {
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let cryptoTestament = await CryptoTestament.at(testamentInfo.testamentAddress);
    let errorRaised = false;
    await advanceTime(31 * 24 * 3600); // 31 days ahead
    try {
      await cryptoTestament.updateDetails(beneficiaryAddress, 30 * 24 * 3600, "encryptedKey", "encryptedInfo", { from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot update testament: last proof of life has expired.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to cancel an expired testament', async function () {
    let errorRaised = false;
    try {
      await advanceTime(31 * 24 * 3600); // 31 days ahead
      await serviceInstance.cancelTestament({ from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot cancel testament: last proof of life has expired.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to reactivate an expired testament', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.reactivateTestament({ from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot reactivate testament: testament is not CANCELLED.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to fund an expired testament', async function () {
    let errorRaised = false;
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    try {
      await web3.eth.sendTransaction({ from: testatorAddress, to: testamentInfo.testamentAddress, value: web3.utils.toWei('0.01', 'ether') });
    } catch (errObj) {
      let errKey = Object.keys(errObj.data)[0];
      let err = errObj.data[errKey];
      assert.equal(err.reason, 'Cannot deposit funds: last proof of life has expired.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to withdraw funds from an expired testament', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.withdrawTestamentFunds(web3.utils.toWei('0.00', 'ether'), { from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot withdraw testament funds: last proof of life has expired.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Execute a testament', async function () {
    let oldTestamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let oldExecutionTimestamp = web3.utils.toBN(oldTestamentInfo.executionTimestamp);
    let oldBeneficiaryBalance = web3.utils.toBN(await web3.eth.getBalance(beneficiaryAddress));
    let cryptoTestament = await CryptoTestament.at(oldTestamentInfo.testamentAddress);

    await cryptoTestament.executeTestament({ from: testatorAddress });
    let newTestamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let newExecutionTimestamp = web3.utils.toBN(newTestamentInfo.executionTimestamp);

    let expectedNewBeneficiaryBalance = oldBeneficiaryBalance.add(web3.utils.toBN(oldTestamentInfo.testamentBalance));
    let currentBeneficiaryTestatorBalance = web3.utils.toBN(await web3.eth.getBalance(beneficiaryAddress));

    assert.equal(newTestamentInfo.status, '2', 'Check new status.');
    assert(newExecutionTimestamp.gt(oldExecutionTimestamp), 'Check execution timestamp.');
    assert.equal(newTestamentInfo.executionBalance, oldTestamentInfo.testamentBalance, 'Check execution balance.');
    assert.equal(newTestamentInfo.testamentBalance, '0', 'Check new testament balance.');
    assert.equal(expectedNewBeneficiaryBalance.toString(), currentBeneficiaryTestatorBalance.toString(), 'Check new beneficiary balance.')
  });

  it('Try and fail to update an executed testament', async function () {
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    let cryptoTestament = await CryptoTestament.at(testamentInfo.testamentAddress);
    let errorRaised = false;
    try {
      await cryptoTestament.updateDetails(beneficiaryAddress, 30 * 24 * 3600, "encryptedKey", "encryptedInfo", { from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot update testament: testament is not LOCKED.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to cancel an executed testament', async function () {
    let errorRaised = false;
    try {
      await advanceTime(31 * 24 * 3600); // 31 days ahead
      await serviceInstance.cancelTestament({ from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot cancel testament: testament is not LOCKED.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to reactivate an executed testament', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.reactivateTestament({ from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot reactivate testament: testament is not CANCELLED.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to fund an executed testament', async function () {
    let errorRaised = false;
    let testamentInfo = await serviceInstance.testamentDetailsOf(testatorAddress);
    try {
      await web3.eth.sendTransaction({ from: testatorAddress, to: testamentInfo.testamentAddress, value: web3.utils.toWei('0.01', 'ether') });
    } catch (errObj) {
      let errKey = Object.keys(errObj.data)[0];
      let err = errObj.data[errKey];
      assert.equal(err.reason, 'Cannot deposit funds: testament is not LOCKED.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to withdraw funds from an executed testament', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.withdrawTestamentFunds(web3.utils.toWei('0.00', 'ether'), { from: testatorAddress });
    } catch (err) {
      assert.equal(err.reason, 'Cannot withdraw testament funds: testament is not LOCKED/CANCELLED.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to execute an executed testament', async function () {
    let errorRaised = false;
    try {
      await serviceInstance.executeTestamentOf(testatorAddress);
    } catch (err) {
      assert.equal(err.reason, 'Cannot execute testament: testament is not LOCKED.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

});