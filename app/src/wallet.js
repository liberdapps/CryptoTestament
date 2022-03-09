import RLogin from '@rsksmart/rlogin';
import WalletConnectProvider from '@walletconnect/web3-provider'
import Portis from '@portis/web3'
import Torus from '@toruslabs/torus-embed'
import { trezorProviderOptions } from '@rsksmart/rlogin-trezor-provider'
import { ledgerProviderOptions } from '@rsksmart/rlogin-ledger-provider'
import { dcentProviderOptions } from '@rsksmart/rlogin-dcent-provider'

import Web3 from 'web3'
import * as Utils from './utils';
import AppData from './data';


const rpcUrls = {
    30: 'https://public-node.rsk.co',
    //31: 'https://public-node.testnet.rsk.co'
}

const supportedChains = Object.keys(rpcUrls).map(Number);
const rLogin = new RLogin({
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: rpcUrls
      }
    },
    portis: {
      package: Portis,
      options: {
        id: "a1c8672b-7b1c-476b-b3d0-41c27d575920",
        network: {
          nodeUrl: 'https://public-node.rsk.co',
          chainId: 30,
        }
        // network: {
        //   nodeUrl: 'https://public-node.testnet.rsk.co',
        //   chainId: 31,
        // }
      }
    },
    torus: {
        package: Torus,
    },
    'custom-ledger': ledgerProviderOptions,
    'custom-dcent': dcentProviderOptions,
    'custom-trezor': {
      ...trezorProviderOptions,
      options: {
        manifestEmail: 'info@iovlabs.org',
        manifestAppUrl: 'https://basic-sample.rlogin.identity.rifos.org/',
      }
    }
  },
  rpcUrls,
  supportedChains
});

export default {
    address: null,
    web3Instance: null,
    testamentContract: null,
    encryptionKey: null,

    async connect() {

        try {
            let resp = await rLogin.connect();
            let web3 = new Web3(resp.provider);
            let walletAddress = (await web3.eth.getAccounts())[0];

            this.web3Instance = web3;
            this.testamentServiceContract = new web3.eth.Contract(Utils.TESTAMENT_SERVICE_ABI, Utils.TESTAMENT_SERVICE_ADDRESS);
            this.encryptionKey = await web3.eth.personal.sign('Log-in to CryptoTestament', walletAddress);

            let testament = await this.testamentServiceContract.methods.testamentDetailsOf(walletAddress).call();
            AppData.instance.walletAddress = walletAddress;

            if (testament.exists) {
                Utils.parseTestament(AppData.instance, testament, this.encryptionKey);
            } else {
                AppData.instance.testament = null;
            }

        }
        catch (err) {
            console.log(err);
            let error = err;
            if (err.message) {
                error = err.message;
            }
            AppData.instance.loadingError = error;
        }
    }
};
