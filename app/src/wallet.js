import RLogin from '@rsksmart/rlogin';
import Web3 from 'web3'
import * as Utils from './utils';
import AppData from './data';


const rpcUrls = {
    30: 'https://public-node.rsk.co',
    //31: 'https://public-node.testnet.rsk.co'
}

const supportedChains = Object.keys(rpcUrls).map(Number);
const rLogin = new RLogin({
    rpcUrls,
    supportedChains
});

export default {
    address: null,
    testamentContract: null,
    encryptionKey: null,

    async connect() {
        let resp = await rLogin.connect();
        let web3 = new Web3(resp.provider);
        let walletAddress = (await web3.eth.getAccounts())[0];

        this.testamentServiceContract = new web3.eth.Contract(Utils.TESTAMENT_SERVICE_ABI, Utils.TESTAMENT_SERVICE_ADDRESS);
        this.encryptionKey = await web3.eth.personal.sign('Log-in to CryptoTestament', walletAddress);
        
        let testament = await this.testamentServiceContract.methods.testamentDetailsOf(walletAddress).call();
        
        console.log(testament);
        AppData.instance.walletAddress = walletAddress;

        if (testament.exists) {
           Utils.parseTestament(AppData.instance, testament, this.encryptionKey);
        } else {
            AppData.instance.testament = null;
        }


        // try {

      
      
        //   } catch (err) {
        //     console.log(err);
        //     error = err;
        //     if (err.message) {
        //       error = err.message;
        //     }
        //     App.data.loadingError = error;
        //   }
      
        //   Vue.component('dapp-page', App.vueApp);
      
        //   new Vue({
        //     el: '#app'
        //   })
        // } 
  
        
      //const signedMessage = await web3.eth.personal.sign('bla', fromAddress);

      //let testamentServiceContract = ;
      //let testament = await testamentServiceContract.methods.testamentDetailsOf(fromAddress).call();


        // const ethQuery = new Eth(resp.provider)
        // alert(await  ethQuery.accounts());

    // const provider = new ethers.providers.Web3Provider(resp.provider)
    //   const signer = provider.getSigner()
    //   const signedMessage = await signer.signMessage('bla');
  
    }
};
