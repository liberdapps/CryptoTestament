const App = {

  testamentServiceContract: null,
  encryptionKey: null,
  jsEncrypt: new JSEncrypt(),

  data: {
    loadingError: null,
    processing: false,
    serviceFeeBalance: null,
    inputFeeAmount: "",
    inputServiceKey: "",
    testamentList: null 
  },

  vueApp: {
    template: '#dapp-template',
    data() {
      return App.data;
    },
    computed: {

      serviceFeesAvailable() {
        return this.serviceFeeBalance.toString() !== '0';
      },

      validServiceKey() {
        return this.inputServiceKey.trim().length > 0;
      },

      notifiableTestaments() {
        return this.testamentList && this.testamentList.notifiable.length > 0;
      },

      executableTestaments() {
        return this.testamentList && this.testamentList.executable.length > 0;
      },

      executedTestaments() {
        return this.testamentList && this.testamentList.executed.length > 0;
      }

    },
    methods: {

      isExecutableTestament(testament) {
        let now = Math.floor(new Date().getTime() / 1000);
        let timeSinceLastProofOfLife = now - testament.lastProofOfLifeTimestamp;
        return testament.status === '0' && timeSinceLastProofOfLife > testament.proofOfLifeThreshold;
      },

      isNotifiableTestament(testament) {
        let now = Math.floor(new Date().getTime() / 1000);
        let timeSinceLastProofOfLife = now - testament.lastProofOfLifeTimestamp;
        return testament.status === '0' && (timeSinceLastProofOfLife + Utils.TESTAMENT_NOTIFY_THRESHOLD) >= testament.proofOfLifeThreshold;
      },

      isExecutedTestament(testament) {
        return testament.status === '2';
      },

      processTestaments(testaments) {
        App.jsEncrypt.setPrivateKey(this.inputServiceKey);
        
        let testamentList = {
          notifiable: [],
          executable: [],
          executed: []
        };

        let id = 1;
        testaments.forEach(testament => {
          testament.id = id++;

          let decryptedEncryptionKey = App.jsEncrypt.decrypt(testament.encryptedKey);
          testament.lastProofOfLifeTimestamp = Number(testament.lastProofOfLifeTimestamp);
          testament.proofOfLifeThreshold = Number(testament.proofOfLifeThreshold);
          testament.decryptedInfo = JSON.parse(CryptoJS.AES.decrypt(testament.encryptedInfo, decryptedEncryptionKey).toString(CryptoJS.enc.Utf8));
 
          
          console.log(testament);
          if (this.isExecutedTestament(testament)) {
            testamentList.executed.push(testament);
          } else if (this.isExecutableTestament(testament)) {
            testamentList.executable.push(testament);
          } else if (this.isNotifiableTestament(testament)) {
            testamentList.notifiable.push(testament);
          }
        });

        return testamentList;
      },

      formatTimestamp(timestamp) {
        return new Date(timestamp * 1000).toISOString().replace('T', ' ').replace('.000Z', '') + ' UTC';
      },

      formatBalance(balance) {
        return Utils.formatUnit(Utils.toBN(balance), 18) + ' rBTC';
      },

      formatUnlockTimestamp(testament) {
        return this.formatTimestamp(testament.lastProofOfLifeTimestamp + testament.proofOfLifeThreshold);
      },

      async listTestaments() {
        this.processing = true;
        this.testamentList = null;

        try {
          let testaments = await App.testamentServiceContract.methods.testaments().call();
          this.testamentList = this.processTestaments(testaments);
          this.processing = false;
        } catch (err) {
          this.processing = false;
          console.log(err);

          // Error 4001 means that user just denied the signature of the transaction, no need to show an error.
          // The 'Invalid JSON RPC response' is a workaround for the RSK wallet which doesn't provide a good error code...
          if (err.code !== 4001 && String(err).indexOf("Invalid JSON RPC response") === -1) {
            let errorMsg = err;
            if (err.message && err.message.trim().length > 0) {
              errorMsg = err.message;
            }
            $("#errorMsg").text(errorMsg);
            $("#errorModal").modal('show');
          }
        }
      },

      async executeTestament(testatorAddress) {
        let ctx = this;
        this.processing = true;

        function onError(err) {
          ctx.processing = false;
          console.log(err);

          // Error 4001 means that user just denied the signature of the transaction, no need to show an error.
          // The 'Invalid JSON RPC response' is a workaround for the RSK wallet which doesn't provide a good error code...
          if (err.code !== 4001 && String(err).indexOf("Invalid JSON RPC response") === -1) {
            let errorMsg = err;
            if (err.message && err.message.trim().length > 0) {
              errorMsg = err.message;
            }
            $("#errorMsg").text(errorMsg);
            $("#errorModal").modal('show');
          }
        }

        Utils.invokeMethodAndWaitConfirmation(
          App.testamentServiceContract.methods.executeTestamentOf(testatorAddress),
          this.walletAddress,
          async function () {
            try {
              let testaments = await App.testamentServiceContract.methods.testaments().call();
              ctx.testamentList = ctx.processTestaments(testaments);    
              ctx.processing = false;
            } catch (err) {
              onError(err);
            }
          },
          function (err) {
            onError(err);
          }
        );
      },

      async withdrawServiceFees() {
        let ctx = this;
        this.processing = true;

        function onError(err) {
          ctx.processing = false;
          console.log(err);

          // Error 4001 means that user just denied the signature of the transaction, no need to show an error.
          // The 'Invalid JSON RPC response' is a workaround for the RSK wallet which doesn't provide a good error code...
          if (err.code !== 4001 && String(err).indexOf("Invalid JSON RPC response") === -1) {
            let errorMsg = err;
            if (err.message && err.message.trim().length > 0) {
              errorMsg = err.message;
            }
            $("#errorMsg").text(errorMsg);
            $("#errorModal").modal('show');
          }
        }

        Utils.invokeMethodAndWaitConfirmation(
          App.testamentServiceContract.methods.withdrawServiceFees(),
          this.walletAddress,
          async function () {
            try {
              ctx.serviceFeeBalance = Utils.toBN(await App.testamentServiceContract.methods.contractBalance().call());
              ctx.inputFeeAmount = "";
              ctx.processing = false;
            } catch (err) {
              onError(err);
            }
          },
          function (err) {
            onError(err);
          }
        );
      }
    }
  },

  init: async function () {

    try {

      if (!window.ethereum) {
        throw "Failure detecting wallet (err: 1)";
      }

      let response = await ethereum.request({ method: 'eth_requestAccounts' });
      window.web3 = new Web3(window.ethereum);

      if (!response) {
        throw "Failure detecting wallet (err: 2)";
      }

      let accounts = response;
      if (!accounts || !accounts.length) {
        throw "Failure detecting wallet (err: 3)";
      }

      App.encryptionKey = await web3.eth.personal.sign('Log-in to CryptoTestament', accounts[0]);
      App.jsEncrypt.setPublicKey(Utils.SERVICE_PUBLIC_KEY);
      App.testamentServiceContract = new web3.eth.Contract(Utils.TESTAMENT_SERVICE_ABI, Utils.TESTAMENT_SERVICE_ADDRESS);
      App.data.walletAddress = accounts[0];
      App.data.serviceFeeBalance = Utils.toBN(await App.testamentServiceContract.methods.contractBalance().call());

    } catch (err) {
      console.log(err);
      error = err;
      if (err.message) {
        error = err.message;
      }
      App.data.loadingError = error;
    }

    Vue.component('dapp-page', App.vueApp);

    new Vue({
      el: '#app'
    })
  }

};


$(window).load(function () {
  let attempts = 5;
  function detectWallet() {
    if (window.ethereum && window.ethereum.request || attempts === 0) {
      App.init();
    } else {
      attempts--;
      setTimeout(detectWallet, 2000);
    }
  }
  detectWallet();
});






