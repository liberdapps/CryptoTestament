import Web3Utils from 'web3-utils';
import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

export const TESTAMENT_SERVICE_ABI = [
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
];

export const TESTAMENT_SERVICE_ADDRESS = '0x6F5E511515e53dF613F5b372391242dFA71784f1';

export const TESTAMENT_NOTIFY_THRESHOLD = 7 * 24 * 3600;

export const SERVICE_PUBLIC_KEY =
    "-----BEGIN PUBLIC KEY-----\n" +
    "MIIBITANBgkqhkiG9w0BAQEFAAOCAQ4AMIIBCQKCAQB+b7qrWcuBkpmiCcUBO0RQ\n" +
    "ZjAi6kAivuXUZB5dcJ/HO8zbf9XkseRn3fJEmxXJz/G8qVis14VqPQkv07mEHisr\n" +
    "pweKHRl+YwIsKfOw7kQwzMfiF5X9hNZt9bHaszOPsOxBgKK3bE1W2K04V3MYmFxk\n" +
    "ft4wG2KgVL8czFlfk8COOwnl6tLg/0GqVBy4KWZCz6ZkJbONalAH2zZ6gkCIySio\n" +
    "xS7mZJMdHOZoZkSBEBOZXHY7SCfGze/+0ggzD9BgBHssivx9lET94XLfT7F0hvJQ\n" +
    "hj/GVuIojQ9oVW36c5JdJ5aoRdvkhiRVPf0LUh0SAMQapUdgGZ26MBxoBWR0x831\n" +
    "AgMBAAE=\n" +
    "-----END PUBLIC KEY-----";


export function isString(s) {
    return (typeof s === 'string' || s instanceof String)
}

export function isEmpty(str) {
    return (str === undefined || str === null || str.trim().length === 0);
}

export function isValidEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

export function isValidAddress(address) {
    return Web3Utils.isAddress(address);
}

export function toBaseUnit(value, decimals) {
    if (!isString(value)) {
        throw new Error('Pass strings to prevent floating point precision issues.');
    }

    const regexStr = '^(0|[1-9]\\d*)(\\.\\d{0,' + decimals + '})?$';

    if (new RegExp(regexStr).test(value) === false) {
        throw new Error('INVALID_NUMBER')
    }

    const BN = Web3Utils.BN;
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
}

export function toBN(value) {
    return new Web3Utils.BN(value);
}

export function exp(base, exp) {
    return toBN(base).pow(toBN(exp));
}

export function formatUnit(value, decimals) {
    let base = new Web3Utils.BN(10).pow(new Web3Utils.BN(decimals));
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
}

export function encryptUsingServiceKey(data) {
    let jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(SERVICE_PUBLIC_KEY);
    return jsEncrypt.encrypt(data);
}


export function parseTestament(data, testament, encryptionKey) {
    let decryptedInfo = JSON.parse(CryptoJS.AES.decrypt(testament.encryptedInfo, encryptionKey).toString(CryptoJS.enc.Utf8));

    data.inputName = decryptedInfo.name;
    data.inputEmail = decryptedInfo.email;
    data.inputBeneficiaryName = decryptedInfo.beneficiaryName;
    data.inputBeneficiaryEmail = decryptedInfo.beneficiaryEmail;
    data.inputBeneficiaryAddress = testament.beneficiaryAddress;
    data.inputProofOfLife = Number(testament.proofOfLifeThreshold) / (24 * 3600);
    data.status = testament.status;

    data.testament = testament;
}


export function encryptTestament(name, email, beneficiaryName, beneficiaryEmail, encryptionKey) {
    let info = {
        name: name,
        email: email,
        beneficiaryName: beneficiaryName,
        beneficiaryEmail: beneficiaryEmail
    };

    return CryptoJS.AES.encrypt(JSON.stringify(info), encryptionKey).toString();
}

export function invokeMethodAndWaitConfirmation(web3, contractMethod, walletAddress, onSuccessCallback, onErrorCallback) {
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
