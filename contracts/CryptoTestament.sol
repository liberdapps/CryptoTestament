// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.7;

// Testament statuses.
enum TestamentStatus {LOCKED, CANCELLED, EXECUTED}
  
contract CryptoTestament {
 
    // Service details.
    address immutable public serviceAddress;
    uint256 immutable public serviceFeeRate;
  
    // Testament details.
    uint256 immutable public creationTimestamp; 
    address immutable public testatorAddress;
    address public beneficiaryAddress;
    uint256 public proofOfLifeThreshold; 
    uint256 public lastProofOfLifeTimestamp; 
    string  public encryptedKey;
    string  public encryptedInfo;
    uint256 public executionTimestamp;
    uint256 public executionBalance; 
    TestamentStatus public status; 
 
    /**
      * Constructor.
      * Set service and testament details.
      */ 
    constructor (address _serviceAddress, uint256 _serviceFeeRate,
                 address _testatorAddress, address _beneficiaryAddress, uint256 _proofOfLifeThreshold,
                 string memory _encryptedKey, string memory _encryptedInfo) {

        // Sanity checks.             
        require (_serviceAddress != address(0x0), "Cannot deploy testament: service address must be non-null.");
        require (_serviceFeeRate > 0, "Cannot deploy testament: service fee rate must be > 0.");
        require (_testatorAddress != address(0x0), "Cannot deploy testament: testator address must be non-null.");
        require (_beneficiaryAddress != address(0x0), "Cannot deploy testament: beneficiary address must be non-null.");
        require (_proofOfLifeThreshold >= 30 days, "Cannot deploy testament: proof of life threshold must be >= 30 days.");
        require (bytes(_encryptedKey).length > 0, "Cannot deploy testament: encrypted key must be set.");
        require (bytes(_encryptedInfo).length > 0, "Cannot deploy testament: encrypted testament info must be set.");

        // Set service details.
        serviceAddress = _serviceAddress;
        serviceFeeRate = _serviceFeeRate;

        // Set testament details.
        creationTimestamp = block.timestamp;
        testatorAddress = _testatorAddress;
        beneficiaryAddress = _beneficiaryAddress;
        proofOfLifeThreshold = _proofOfLifeThreshold;
        lastProofOfLifeTimestamp = block.timestamp;
        encryptedKey = _encryptedKey;
        encryptedInfo = _encryptedInfo;
        status = TestamentStatus.LOCKED;
    }

    /**
      * Receive deposits in the testament.
      */ 
    receive() external payable {
        // Only allow the testator to make deposits.
        require (msg.sender == testatorAddress, "Cannot deposit funds: sender is not the testator.");

        // Only allow deposits if testament is still locked and the last proof of life is still active.
        require (status == TestamentStatus.LOCKED, "Cannot deposit funds: testament is not LOCKED.");
        require (block.timestamp - lastProofOfLifeTimestamp <= proofOfLifeThreshold, "Cannot deposit funds: last proof of life has expired.");
 
        // Calculate and pay service fees.
        uint256 serviceFee = (msg.value * serviceFeeRate) / 10000;
        if (serviceFee > 0) {
            (bool sent, ) = serviceAddress.call{value: serviceFee}("");
            require (sent, "Cannot deposit funds: send failed.");
        }

        // Update proof of life.
        lastProofOfLifeTimestamp = block.timestamp;
    }

    /**
      * Retrieve the balance available in the testament.
      */ 
    function contractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
      * Allow testators to withdraw funds locked in their testaments.
      */
    function withdrawFunds(uint256 amount) external {
        // Only allow the testator to withdraw testament funds, either directly or via service contract.
        require (msg.sender == testatorAddress || msg.sender == serviceAddress, "Cannot withdraw testament funds: sender is not the testator.");

        // Funds can only be withdrawn if the testament is either LOCKED or CANCELLED.
        require (status == TestamentStatus.LOCKED || status == TestamentStatus.CANCELLED, "Cannot withdraw testament funds: testament is not LOCKED/CANCELLED.");

        // Validate amount.
        require (amount <= this.contractBalance(), "Cannot withdraw testament funds: amount should be <= the testament balance.");

        // If the status is LOCKED, make sure that the last proof of life is still active,
        // otherwise, the testament is effectively unlocked for execution, and withdrawn will not be possible.
        if (status == TestamentStatus.LOCKED) {
            require (block.timestamp - lastProofOfLifeTimestamp <= proofOfLifeThreshold, "Cannot withdraw testament funds: last proof of life has expired.");

            // Withdrawing funds from a locked testament counts as a proof of life.
            lastProofOfLifeTimestamp = block.timestamp;
        }

        // Transfer funds to the testator.
        (bool sent, ) = testatorAddress.call{value: amount}("");
        require (sent, "Cannot withdraw testament funds: send failed.");
    }

    /**
      * Update testament details.
      */ 
    function updateDetails(address _beneficiaryAddress, uint256 _proofOfLifeThreshold, 
                           string memory _encryptedKey, string memory _encryptedInfo) external {

        // Only allow the testator to make changes in the testament, either directly or via service contract.
        require (msg.sender == testatorAddress || msg.sender == serviceAddress, "Cannot update testament: sender is not the testator.");

        // Allow changes only if the testament is still locked and the last proof of life is still active.
        require (status == TestamentStatus.LOCKED, "Cannot update testament: testament is not LOCKED.");
        require (block.timestamp - lastProofOfLifeTimestamp <= proofOfLifeThreshold, "Cannot update testament: last proof of life has expired.");

        // Sanity checks.
        require (_beneficiaryAddress != address(0x0), "Cannot update testament: beneficiary address must be non-null.");
        require (_proofOfLifeThreshold >= 30 days, "Cannot update testament: proof of life threshold must be >= 30 days.");
        require (bytes(_encryptedKey).length > 0, "Cannot update testament: encrypted key must be set.");
        require (bytes(_encryptedInfo).length > 0, "Cannot update testament: encrypted testament info must be set.");

        // Update details.
        beneficiaryAddress = _beneficiaryAddress;
        proofOfLifeThreshold = _proofOfLifeThreshold;
        encryptedKey = _encryptedKey;
        encryptedInfo = _encryptedInfo;

        // Update proof of life.
        lastProofOfLifeTimestamp = block.timestamp;
    }

    /**
      *  Cancel a testament.
      */
    function cancelTestament() external {
        // Only allow the testator to cancel the testament, either directly or via service contract.
        require (msg.sender == testatorAddress || msg.sender == serviceAddress, "Cannot cancel testament: sender is not the testator.");

        // In order to cancel a testament:
        //   - Status should still be LOCKED.
        //   - Last proof of life should still be active.
        require (status == TestamentStatus.LOCKED, "Cannot cancel testament: testament is not LOCKED.");
        require (block.timestamp - lastProofOfLifeTimestamp <= proofOfLifeThreshold, "Cannot cancel testament: last proof of life has expired.");

        // Update status.
        status = TestamentStatus.CANCELLED;
    }

    /**
      * Reactivate a testament.
      */ 
    function reactivateTestament() external {
        // Only allow the testator to cancel the testament, either directly or via service contract.
        require (msg.sender == testatorAddress || msg.sender == serviceAddress, "Cannot reactivate testament: sender is not the testator.");

        // Only cancelled testaments can be reactivated.
        require (status == TestamentStatus.CANCELLED, "Cannot reactivate testament: testament is not CANCELLED.");

        // Update status and proof of life.
        status = TestamentStatus.LOCKED;
        lastProofOfLifeTimestamp = block.timestamp;
    }

    /**
      * Execute a testament.
      */ 
    function executeTestament() external {
        // In order to execute a testament:
        //   - Status should still be LOCKED.
        //   - Last proof of life should be expired.
        //
        // Under such conditions, testament will be effectively unlocked for execution.
        require (status == TestamentStatus.LOCKED, "Cannot execute testament: testament is not LOCKED.");
        require (block.timestamp - lastProofOfLifeTimestamp > proofOfLifeThreshold, "Cannot execute testament: last proof of life is still active.");

        // Update execution status.
        status = TestamentStatus.EXECUTED;
        executionTimestamp = block.timestamp;
        executionBalance = this.contractBalance();

        // Transfer funds to the beneficiary.
        (bool sent, ) = beneficiaryAddress.call{value: executionBalance}("");
        require (sent, "Cannot execute testament: send failed.");
    }
}

contract CryptoTestamentService {
 
    // Service fee details.
    address immutable public serviceOwner;
    uint256 public serviceFeeRate;
 
    // Deployed testaments.
    mapping (address => CryptoTestament) internal testamentOf; 
    address[] internal testators;

    // Testament details.
    struct Testament {
        uint256 creationTimestamp;
        address testamentAddress; 
        address testatorAddress;
        address beneficiaryAddress;
        uint256 testamentBalance;
        uint256 proofOfLifeThreshold;
        uint256 lastProofOfLifeTimestamp; 
        string encryptedKey;
        string encryptedInfo;
        uint256 executionTimestamp;
        uint256 executionBalance;
        TestamentStatus status; 
        bool exists;
    }

    /**
      * Constructor.
      * Set the service owner.
      */ 
    constructor() {
        serviceOwner = msg.sender;
        serviceFeeRate = 25;
    }

    /**
      * Receive service fees.
      */ 
    receive() external payable{
        // Just accept funds.
    }
 
     /**
      * Retrieve the balance available as service fees.
      */ 
    function contractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
      * Allow the service owner to set the service fee rate for newly deployed testaments.
      * The fee is scaled by 10000, i.e, 1% fee should be specified as 100.
      * Note: this will not change the service fees for already deployed testaments.
      */ 
    function setServiceFeeRate(uint256 _serviceFeeRate) external {
        // Only the service owner can call this function.
        require (msg.sender == serviceOwner, "Cannot set service fee rate: sender is not the service owner.");
        serviceFeeRate = _serviceFeeRate;
    }

     /**
      * Allow the service owner to withdraw all service fees available.
      */ 
    function withdrawServiceFees() external {
        // Only the service owner can call this function.
        require (msg.sender == serviceOwner, "Cannot withdraw service fees: sender is not the service owner.");

        // Transfer funds.
        (bool sent, ) = serviceOwner.call{value: this.contractBalance()}("");
        require (sent, "Cannot withdraw service fees: send failed.");
    }

    /**
      * Setup a testament for the sender.
      * If a testament doesn't exist, one will be deployed. Otherwise, the details of the existing
      * testament will be updated.
      */ 
    function setupTestament(address beneficiaryAddress, uint256 proofOfLifeThreshold,
                            string calldata encryptedKey, string calldata encryptedInfo) external {
    
        // Check for existing testament.                            
        CryptoTestament testament = testamentOf[msg.sender];

        // Testament doesn't exist for the sender yet, so we'll deploy one.
        if (address(testament) == address(0x0)) {
            testamentOf[msg.sender] = new CryptoTestament(
                address(this),
                serviceFeeRate,
                msg.sender,
                beneficiaryAddress,
                proofOfLifeThreshold,
                encryptedKey,
                encryptedInfo
            );
            testators.push(msg.sender);
        }
        // Update existing testament.
         else {
            testament.updateDetails(beneficiaryAddress, proofOfLifeThreshold, encryptedKey, encryptedInfo);
        }
    }
    
    /**
      * Allow testators to cancel their testaments.
      */ 
    function cancelTestament() external {
        // Check existing testament for sender.                            
        CryptoTestament testament = testamentOf[msg.sender];
        require (address(testament) != address(0x0), "Cannot cancel testament: testament not found.");

        // Cancel testament.
        testament.cancelTestament();
    }

    /**
      * Allow testators to reactivate testaments.
      */ 
    function reactivateTestament() external {
        // Check existing testament for sender.                            
        CryptoTestament testament = testamentOf[msg.sender];
        require (address(testament) != address(0x0), "Cannot reactivate testament: testament not found.");

        // Reactivate testament.
        testament.reactivateTestament();
    }
 
    /**
      * Allow testators to withdraw funds locked in their testaments.
      */ 
    function withdrawTestamentFunds(uint256 amount) external {
        // Check existing testament for sender.                            
        CryptoTestament testament = testamentOf[msg.sender];
        require (address(testament) != address(0x0), "Cannot withdraw testament funds: testament not found.");

        // Reactivate testament.
        testament.withdrawFunds(amount);    
    }

    /**
      * Allow anyone to execute a testament given a testator address, transfering funds to the
      * beneficiary specified in the testament.
      */ 
    function executeTestamentOf(address testatorAddress) external {
        // Check existing testament for specified testator address.                            
        CryptoTestament testament = testamentOf[testatorAddress];
        require (address(testament) != address(0x0), "Cannot execute testament: testament not found.");

        // Execute testament.
        testament.executeTestament(); 
    }

    /**
      * Retrieve testament details for a given testator address.
      */ 
    function testamentDetailsOf(address testatorAddress) public view returns (Testament memory) {
        Testament memory info;

        // Check for existing testament.                            
        CryptoTestament testament = testamentOf[testatorAddress];
        if (address(testament) != address(0x0)) {
            info.creationTimestamp = testament.creationTimestamp();
            info.testamentAddress = address(testament);
            info.testatorAddress = testament.testatorAddress();
            info.testamentBalance = testament.contractBalance();
            info.beneficiaryAddress = testament.beneficiaryAddress();
            info.proofOfLifeThreshold = testament.proofOfLifeThreshold();
            info.lastProofOfLifeTimestamp = testament.lastProofOfLifeTimestamp();
            info.encryptedKey = testament.encryptedKey();
            info.encryptedInfo = testament.encryptedInfo();
            info.executionTimestamp = testament.executionTimestamp();
            info.executionBalance = testament.executionBalance();
            info.status = testament.status();
            info.exists = true;
        } else {
            info.exists = false;
        }

        return info;
    }

    /**
      * Retrieve details for all testaments deployed.
      */ 
    function testaments() public view returns (Testament[] memory) {
        Testament[] memory ret = new Testament[](testators.length);
        for (uint256 i = 0; i < testators.length; i++) {
            ret[i] = testamentDetailsOf(testators[i]);
        }
        return ret;
    }
} 