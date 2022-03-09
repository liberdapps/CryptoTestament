const Utils = {

    TESTAMENT_SERVICE_ABI: [
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "cancelTestament",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "contractBalance",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "testatorAddress",
                    "type": "address"
                }
            ],
            "name": "executeTestamentOf",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "reactivateTestament",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "serviceFeeRate",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "serviceOwner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_serviceFeeRate",
                    "type": "uint256"
                }
            ],
            "name": "setServiceFeeRate",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "beneficiaryAddress",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "proofOfLifeThreshold",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "encryptedKey",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "encryptedInfo",
                    "type": "string"
                }
            ],
            "name": "setupTestament",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "testatorAddress",
                    "type": "address"
                }
            ],
            "name": "testamentDetailsOf",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "creationTimestamp",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "testamentAddress",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "testatorAddress",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "beneficiaryAddress",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "testamentBalance",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "proofOfLifeThreshold",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "lastProofOfLifeTimestamp",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "encryptedKey",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "encryptedInfo",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "executionTimestamp",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "executionBalance",
                            "type": "uint256"
                        },
                        {
                            "internalType": "enum TestamentStatus",
                            "name": "status",
                            "type": "uint8"
                        },
                        {
                            "internalType": "bool",
                            "name": "exists",
                            "type": "bool"
                        }
                    ],
                    "internalType": "struct CryptoTestamentService.Testament",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "testaments",
            "outputs": [
                {
                    "components": [
                        {
                            "internalType": "uint256",
                            "name": "creationTimestamp",
                            "type": "uint256"
                        },
                        {
                            "internalType": "address",
                            "name": "testamentAddress",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "testatorAddress",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "beneficiaryAddress",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "testamentBalance",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "proofOfLifeThreshold",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "lastProofOfLifeTimestamp",
                            "type": "uint256"
                        },
                        {
                            "internalType": "string",
                            "name": "encryptedKey",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "encryptedInfo",
                            "type": "string"
                        },
                        {
                            "internalType": "uint256",
                            "name": "executionTimestamp",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "executionBalance",
                            "type": "uint256"
                        },
                        {
                            "internalType": "enum TestamentStatus",
                            "name": "status",
                            "type": "uint8"
                        },
                        {
                            "internalType": "bool",
                            "name": "exists",
                            "type": "bool"
                        }
                    ],
                    "internalType": "struct CryptoTestamentService.Testament[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "withdrawServiceFees",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "withdrawTestamentFunds",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "stateMutability": "payable",
            "type": "receive"
        }
    ],

    TESTAMENT_SERVICE_ADDRESS: '0x6F5E511515e53dF613F5b372391242dFA71784f1', //'0x9F386392833Fa09B9064cc49F0aCBB20d4D1937b',
 
    TESTAMENT_NOTIFY_THRESHOLD: 7 * 24 * 3600,

    SERVICE_PUBLIC_KEY:
        "-----BEGIN PUBLIC KEY-----\n" +
        "MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQB+b7qrWcuBkpmiCcUBO0RQ\n" +
        "ZjAi6kAivuXUZB5dcJ/HO8zbf9XkseRn3fJEmxXJz/G8qVis14VqPQkv07mEHisr\n" +
        "pweKHRl+YwIsKfOw7kQwzMfiF5X9hNZt9bHaszOPsOxBgKK3bE1W2K04V3MYmFxk\n" +
        "ft4wG2KgVL8czFlfk8COOwnl6tLg/0GqVBy4KWZCz6ZkJbONalAH2zZ6gkCIySio\n" +
        "xS7mZJMdHOZoZkSBEBOZXHY7SCfGze/+0ggzD9BgBHssivx9lET94XLfT7F0hvJQ\n" +
        "hj/GVuIojQ9oVW36c5JdJ5aoRdvkhiRVPf0LUh0SAMQapUdgGZ26MBxoBWR0x831\n" +
        "AgMBAAE=\n" +
        "-----END PUBLIC KEY-----",


    isString: function (s) {
        return (typeof s === 'string' || s instanceof String)
    },

    isEmpty(str) {
        return (str === undefined || str === null || str.trim().length === 0);
    },

    isValidEmail(email) {
        return /\S+@\S+\.\S+/.test(email);
    },

    isValidAddress(address) {
        return web3.utils.isAddress(address);
    },

    toBaseUnit: function (value, decimals) {
        if (!Utils.isString(value)) {
            throw new Error('Pass strings to prevent floating point precision issues.');
        }

        const regexStr = '^(0|[1-9]\\d*)(\\.\\d{0,' + decimals + '})?$';

        if (new RegExp(regexStr).test(value) === false) {
            throw new Error('INVALID_NUMBER')
        }

        const BN = web3.utils.BN;
        const ten = new BN(10);
        const base = ten.pow(new BN(decimals));

        // Is it negative?
        let negative = (value.substring(0, 1) === '-');
        if (negative) {
            value = value.substring(1);
        }

        if (value === '.') {
            throw new Error(
                `Invalid value ${value} cannot be converted to`
                + ` base unit with ${decimals} decimals.`);
        }

        // Split it into a whole and fractional part
        let comps = value.split('.');
        if (comps.length > 2) { throw new Error('Too many decimal points'); }

        let whole = comps[0], fraction = comps[1];

        if (!whole) { whole = '0'; }
        if (!fraction) { fraction = '0'; }
        if (fraction.length > decimals) {
            throw new Error('Too many decimal places');
        }

        while (fraction.length < decimals) {
            fraction += '0';
        }

        whole = new BN(whole);
        fraction = new BN(fraction);
        let wei = (whole.mul(base)).add(fraction);

        if (negative) {
            wei = wei.neg();
        }

        return new BN(wei.toString(10), 10);
    },

    toBN: function (value) {
        return new web3.utils.BN(value);
    },

    exp: function (base, exp) {
        return toBN(base).pow(toBN(exp));
    },

    formatUnit: function (value, decimals) {
        let base = new web3.utils.BN(10).pow(new web3.utils.BN(decimals));
        let fraction = value.mod(base).toString(10);

        while (fraction.length < decimals) {
            fraction = `0${fraction}`;
        }

        fraction = fraction.match(/^([0-9]*[1-9]|0)(0*)/)[1];

        let whole = value.div(base).toString(10);
        value = `${whole}.${fraction}`;

        let paddingZeroes = decimals - fraction.length;
        while (paddingZeroes > 0) {
            paddingZeroes--;
            value = `${value}0`;
        }

        return value;
    },

    invokeMethodAndWaitConfirmation: async function (contractMethod, walletAddress, onSuccessCallback, onErrorCallback) {
        let timer = null;
        let onErrorCalled = false;
        let onSuccessCalled = false;

        function stopTimer() {
            if (timer !== null) {
                clearInterval(timer);
                timer = null;
            }
        }

        function onError(err) {
            if (onErrorCalled) {
                return;
            }
            onErrorCalled = true;
            stopTimer();
            onErrorCallback(err);
        }

        async function monitorTx(hash) {
            let tx = await web3.eth.getTransactionReceipt(hash);
            if (tx) {
                if (tx.status) {
                    stopTimer();
                    if (onSuccessCalled) {
                        return;
                    }
                    onSuccessCalled = true;
                    onSuccessCallback();
                    $("#successModal").modal('show');
                } else {
                    onError('Transaction failed. Please try again later.');
                }
            }
        }

        contractMethod.send({ from: walletAddress, value: 0 })
            .on('transactionHash', function (hash) {
                timer = setInterval(function () { monitorTx(hash) }, 5000);
            })
            .on('error', onError);
    }

}
