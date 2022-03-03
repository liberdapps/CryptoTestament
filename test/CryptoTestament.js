
var CryptoTestamentService = artifacts.require("CryptoTestamentService");

contract('CryptoTestament', function(accounts) {
  let serviceInstance;
  let serviceOwnerAddress = accounts[0];
  let testatorAddress = accounts[1];
  let beneficiaryAddress = accounts[2];
  let randomAddress = accounts[3];

  it('Initialize the service contract.', async function() {
    serviceInstance = await CryptoTestamentService.deployed();

    let serviceOwner = await serviceInstance.serviceOwner();
    let serviceFeeRate = await serviceInstance.serviceFeeRate();
    let contractBalance = await serviceInstance.contractBalance();

    assert.equal(serviceOwner, serviceOwnerAddress, 'Check service owner.');
    assert.equal(serviceFeeRate.toString(), '25', 'Check service fee rate.');
    assert.equal(contractBalance.toString(), '0', 'Check service balance.');
  });

  it('Change service fee rate using owner account.', async function() {
    await serviceInstance.setServiceFeeRate(50, {from: serviceOwnerAddress});
    let serviceFeeRate = await serviceInstance.serviceFeeRate();
    assert.equal(serviceFeeRate.toString(), '50', 'Check new service fee rate.');
 
    await serviceInstance.setServiceFeeRate(25, {from: serviceOwnerAddress});
    serviceFeeRate = await serviceInstance.serviceFeeRate();
    assert.equal(serviceFeeRate.toString(), '25', 'Check new service fee rate.');
  });

  it('Try and fail to change service fee rate using non-owner account.', async function() {
    let errorRaised = false;
    try {
      await serviceInstance.setServiceFeeRate(50, {from: randomAddress});
    } catch (err) {
      assert.equal(err.reason, 'Cannot set service fee rate: sender is not the service owner.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to withdraw service fees using non-owner account.', async function() {
    let errorRaised = false;
    try {
      await serviceInstance.withdrawServiceFees({from: randomAddress});
    } catch (err) {
      assert.equal(err.reason, 'Cannot withdraw service fees: sender is not the service owner.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });


  it('Try and fail to cancel non-existing testament.', async function() {
    let errorRaised = false;
    try {
      await serviceInstance.cancelTestament({from: randomAddress});
    } catch (err) {
      assert.equal(err.reason, 'Cannot cancel testament: testament not found.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to reactivate non-existing testament.', async function() {
    let errorRaised = false;
    try {
      await serviceInstance.reactivateTestament({from: randomAddress});
    } catch (err) {
      assert.equal(err.reason, 'Cannot reactivate testament: testament not found.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to withdraw funds from non-existing testament.', async function() {
    let errorRaised = false;
    try {
      await serviceInstance.withdrawTestamentFunds(0, {from: randomAddress});
    } catch (err) {
      assert.equal(err.reason, 'Cannot withdraw testament funds: testament not found.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });

  it('Try and fail to execute non-existing testament.', async function() {
    let errorRaised = false;
    try {
      await serviceInstance.executeTestamentOf(randomAddress, {from: randomAddress});
    } catch (err) {
      assert.equal(err.reason, 'Cannot execute testament: testament not found.', 'Check error reason.');
      errorRaised = true;
    }
    assert.equal(errorRaised, true, 'Assert failure.');
  });


  it('No testaments scenario.', async function() {
    let testaments =  await serviceInstance.testaments();
    assert.equal(0, testaments.length, 'Check empty testament list.');

    let nonExistingTestament =  await serviceInstance.testamentDetailsOf(randomAddress);
    assert.equal(false, nonExistingTestament.exists, 'Check non-existing testament info.');
  });

  // it('allocates the initial supply upon deployment', function() {
  //   return LDAppToken.deployed().then(function(instance) {
  //     tokenInstance = instance;
  //     return tokenInstance.totalSupply();
  //   }).then(function(totalSupply) {
  //     assert.equal(totalSupply.toNumber(), 100000, 'sets the total supply to 100000');
  //     return tokenInstance.balanceOf(accounts[0]);
  //   }).then(function(adminBalance) {
  //     assert.equal(adminBalance.toNumber(), 100000, 'it allocates the initial supply to the admin account');
  //   });
  // });

  // it('transfers token ownership', function() {
  //   return LDAppToken.deployed().then(function(instance) {
  //     tokenInstance = instance;
  //     // Try to transfer more tokens than available in the sender's balance: should error out.
  //     return tokenInstance.transfer(accounts[1], 100001);
  //   }).then(assert.fail).catch(function(error) {
  //     assert(error.message.indexOf('ERC20: transfer amount exceeds balance') >= 0, 'error message must contain ERC20: transfer amount exceeds balance (1)');
  //     // Try to transfer another 25000 tokens: should work.
  //     return tokenInstance.transfer(accounts[1], 25000, { from: accounts[0] });
  //   }).then(function(tx) {
  //     let receipt = tx.receipt;
  //     assert.equal(receipt.logs.length, 1, 'triggers one event');
  //     assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
  //     assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
  //     assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
  //     assert.equal(receipt.logs[0].args._value, 25000, 'logs the transfer amount');
  //     // Check balance of the receiving address: should be 75000 tokens.
  //     return tokenInstance.balanceOf(accounts[1]);
  //   }).then(function(balance) {
  //     assert.equal(balance.toNumber(), 25000, 'adds the amount to the receiving account (1)');
  //     // Check balance of the sending address: should be 25000 tokens.
  //     return tokenInstance.balanceOf(accounts[0]);
  //   }).then(function(balance) {
  //     assert.equal(balance.toNumber(), 75000, 'deducts the amount from the sending account (2)');
  //     // Send out the remaining of 25000 tokens: should work.
  //     return tokenInstance.transfer(accounts[1], 75000, { from: accounts[0] });
  //   }).then(function(tx) {
  //       let receipt = tx.receipt;
  //       assert.equal(receipt.logs.length, 1, 'triggers one event');
  //       assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
  //       assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
  //       assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
  //       assert.equal(receipt.logs[0].args._value, 75000, 'logs the transfer amount');
  //       // Check balance of the receiving address: should be 100000 tokens.
  //     return tokenInstance.balanceOf(accounts[1]);
  //   }).then(function(balance) {
  //       assert.equal(balance.toNumber(), 100000, 'adds the amount to the receiving account (3)');
  //     // Check balance of the sending address: no tokens should be left.
  //     return tokenInstance.balanceOf(accounts[0]);
  //   }).then(function(balance) {
  //       assert.equal(balance.toNumber(), 0, 'deducts the amount from the sending account (4)');
  //       // Try to send tokens even when there are none available: should error out.
  //       return tokenInstance.transfer(accounts[1], 1);
  //   }).then(assert.fail).catch(function(error) {
  //     assert(error.message.indexOf('ERC20: transfer amount exceeds balance') >= 0, 'error message must contain ERC20: transfer amount exceeds balance (2)');
  //   });
  // });

  // it('approves tokens for delegated transfer', function() {
  //   return LDAppToken.deployed().then(function(instance) {
  //     tokenInstance = instance;
  //     return tokenInstance.approve.call(accounts[1], 100);
  //   }).then(function(success) {
  //     assert.equal(success, true, 'it returns true');
  //     return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
  //   }).then(function(tx) {
  //     let receipt = tx.receipt;
  //     assert.equal(receipt.logs.length, 1, 'triggers one event');
  //     assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
  //     assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
  //     assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
  //     assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
  //     return tokenInstance.allowance(accounts[0], accounts[1]);
  //   }).then(function(allowance) {
  //     assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
  //   });
  // });

  // it('handles delegated token transfers', function() {
  //   return LDAppToken.deployed().then(function(instance) {
  //     tokenInstance = instance;
  //     fromAccount = accounts[2];
  //     toAccount = accounts[3];
  //     spendingAccount = accounts[4];
  //     // Transfer some tokens to fromAccount
  //     return tokenInstance.transfer(fromAccount, 100, { from: accounts[1] });
  //   }).then(function(receipt) {
  //     // Approve spendingAccount to spend 10 tokens form fromAccount
  //     return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
  //   }).then(function(receipt) {
  //     // Try transferring something larger than the sender's balance
  //     return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount });
  //   }).then(assert.fail).catch(function(error) {
  //     assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance');
  //     // Try transferring something larger than the approved amount
  //     return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
  //   }).then(assert.fail).catch(function(error) {
  //     assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount');
  //     return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
  //   }).then(function(success) {
  //     assert.equal(success, true);
  //     return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
  //   }).then(function(tx) {
  //     let receipt = tx.receipt;
  //     assert.equal(receipt.logs.length, 1, 'triggers one event');
  //     assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
  //     assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
  //     assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
  //     assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
  //     return tokenInstance.balanceOf(fromAccount);
  //   }).then(function(balance) {
  //     assert.equal(balance.toNumber(), 90, 'deducts the amount from the sending account');
  //     return tokenInstance.balanceOf(toAccount);
  //   }).then(function(balance) {
  //     assert.equal(balance.toNumber(), 10, 'adds the amount from the receiving account');
  //     return tokenInstance.allowance(fromAccount, spendingAccount);
  //   }).then(function(allowance) {
  //     assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
  //   });
  // });
});