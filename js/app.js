const App = {

  testamentServiceContract: null,
  encryptionKey: null,
  jsEncrypt: new JSEncrypt(),

  data: {
    loadingError: null,
    walletAddress: null,
    editMode: false,
    processing: false,
    testament: null,
    status: null,
    formChanged: false,
    inputFundsAmount: "",
    inputName: "",
    inputEmail: "",
    inputBeneficiaryName: "",
    inputBeneficiaryEmail: "",
    inputBeneficiaryAddress: "",
    inputProofOfLife: 30
  },

  vueApp: {
    template: '#dapp-template',
    data() {
      return App.data;
    },
    computed: {

      nameValid() {
        return !Utils.isEmpty(this.inputName);
      },

      emailValid() {
        return !Utils.isEmpty(this.inputEmail) && Utils.isValidEmail(this.inputEmail);
      },

      beneficiaryNameValid() {
        return !Utils.isEmpty(this.inputBeneficiaryName);
      },

      beneficiaryEmailValid() {
        return !Utils.isEmpty(this.inputBeneficiaryEmail) && Utils.isValidEmail(this.inputBeneficiaryEmail);
      },

      beneficiaryAddressValid() {
        return !Utils.isEmpty(this.inputBeneficiaryAddress) && Utils.isValidAddress(this.inputBeneficiaryAddress);
      },

      formValid() {
        return (
          this.nameValid &&
          this.emailValid &&
          this.beneficiaryNameValid &&
          this.beneficiaryEmailValid &&
          this.beneficiaryAddressValid &&
          Number(this.inputProofOfLife) >= 1
        );
      },

      validFundsAmount() {
        try {
          let value = Utils.toBaseUnit(this.inputFundsAmount.trim(), 18);
          let testamentBalance = Utils.toBN(this.testament.testamentBalance);
          return (value.toString() !== '0' && value.lte(testamentBalance));  
        } catch (err) {
          return false;
        };
      },

      formattedUnlockTime() {
        if (this.testament) {
          let unlockTime = (Number(this.testament.lastProofOfLifeTimestamp) + Number(this.testament.proofOfLifeThreshold));
          let date = new Date(unlockTime * 1000);
          return date.toISOString().replace('T', ' ').replace('.000Z', '') + ' UTC';
        }

        return "";
      },

      formattedBalance() {
        let balance = '0';
        if (this.testament) {
          balance = String(this.testament.testamentBalance);
        }

        return Utils.formatUnit(Utils.toBN(balance), 18) + ' rBTC';
      },

      testamentStatusString() {
        if (this.testamentLocked) {
          return "locked";
        } else if (this.testamentUnlocked) {
          return "unlocked for execution";
        } else if (this.testamentCancelled) {
          return "cancelled";
        } else if (this.testamentExecuted) {
          return "executed";
        }
        return "";
      },

      testamentLocked() {
        if (this.testament) {
          let now = Math.floor(new Date().getTime() / 1000);
          let timeSinceLastProofOfLife = now - this.testament.lastProofOfLifeTimestamp;
          return this.testament.status === '0' && timeSinceLastProofOfLife <= this.testament.proofOfLifeThreshold;
        }
        return false;
      },

      testamentNotifiable() {
        if (this.testament) {
          let now = Math.floor(new Date().getTime() / 1000);
          let timeSinceLastProofOfLife = now - this.testament.lastProofOfLifeTimestamp;
          return this.testament.status === '0' && timeSinceLastProofOfLife + Utils.TESTAMENT_NOTIFY_THRESHOLD >= this.testament.proofOfLifeThreshold;
        }
        return false;
      },

      testamentUnlocked() {
        if (this.testament) {
          let now = Math.floor(new Date().getTime() / 1000);
          let timeSinceLastProofOfLife = now - this.testament.lastProofOfLifeTimestamp;
          return this.testament.status === '0' && timeSinceLastProofOfLife > this.testament.proofOfLifeThreshold;
        }
        return false;
      },

      testamentCancelled() {
        return this.testament && this.testament.status === '1';
      },

      testamentExecuted() {
        return this.testament && this.testament.status === '2';
      }

    },
    methods: {

      formInput() {
        this.formChanged = true;
      },

      setMaxFundsAmount() {
        this.inputFundsAmount = Utils.formatUnit(Utils.toBN(this.testament.testamentBalance), 18)
      },
      
      processTestament: function(appData, testament) {
        let decryptedInfo = JSON.parse(CryptoJS.AES.decrypt(testament.encryptedInfo, App.encryptionKey).toString(CryptoJS.enc.Utf8));
    
        appData.inputName = decryptedInfo.name;
        appData.inputEmail = decryptedInfo.email;
        appData.inputBeneficiaryName = decryptedInfo.beneficiaryName;
        appData.inputBeneficiaryEmail = decryptedInfo.beneficiaryEmail;
        appData.inputBeneficiaryAddress = testament.beneficiaryAddress;
        appData.inputProofOfLife = Number(testament.proofOfLifeThreshold) / (24 * 3600);
        appData.status = testament.status;

        appData.testament = testament;   
      },

      encryptDetails(name, email, beneficiaryName, beneficiaryEmail) {
        let info = {
          name: name,
          email: email,
          beneficiaryName: beneficiaryName,
          beneficiaryEmail: beneficiaryEmail
        };

        return CryptoJS.AES.encrypt(JSON.stringify(info), App.encryptionKey).toString();
      },

      async setupTestament() {

        let name = this.inputName.trim();
        let email = this.inputEmail.trim();
        let beneficiaryName = this.inputBeneficiaryName.trim();
        let beneficiaryEmail = this.inputBeneficiaryEmail.trim();
        let beneficiaryAddress = this.inputBeneficiaryAddress.trim();
        let proofOfLifeThreshold = Number(this.inputProofOfLife) * 24 * 3600;
        let ctx = this;

        let encryptedInfo = this.encryptDetails(name, email, beneficiaryName, beneficiaryEmail);

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

        this.processing = true;

        let encryptedEncryptionKey = App.jsEncrypt.encrypt(App.encryptionKey);
        
        Utils.invokeMethodAndWaitConfirmation(
          App.testamentServiceContract.methods.setupTestament(beneficiaryAddress, proofOfLifeThreshold, encryptedEncryptionKey, encryptedInfo), 
          this.walletAddress,
          async function() {
            try {
              ctx.processTestament(ctx, await App.testamentServiceContract.methods.testamentDetailsOf(ctx.walletAddress).call());
              ctx.processing = false;
              ctx.editMode = false;
            } catch (err) {
              onError(err);
            }
          },
          function(err) {
            onError(err);
          }
        );
      },

      editTestament() {
        this.editMode = true;
        this.$nextTick(() => this.$refs.txtName.focus());
      },

      cancelTestamentChanges() {
        this.editMode = false;
        this.processTestament(this, this.testament);
      },

      async cancelTestament() {
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
          App.testamentServiceContract.methods.cancelTestament(), 
          this.walletAddress,
          async function() {
            try {
              ctx.processTestament(ctx, await App.testamentServiceContract.methods.testamentDetailsOf(ctx.walletAddress).call());
              ctx.cancelTestamentChanges();         
              ctx.processing = false;
            } catch (err) {
              onError(err);
            }
          },
          function(err) {
            onError(err);
          }
        );       
      },

      async reactivateTestament() {
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
          App.testamentServiceContract.methods.reactivateTestament(), 
          this.walletAddress,
          async function() {
            try {
              ctx.processTestament(ctx, await App.testamentServiceContract.methods.testamentDetailsOf(ctx.walletAddress).call());
              ctx.cancelTestamentChanges();         
              ctx.processing = false;
            } catch (err) {
              onError(err);
            }
          },
          function(err) {
            onError(err);
          }
        );       
      },

      async withdrawFunds() {
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
          App.testamentServiceContract.methods.withdrawTestamentFunds(Utils.toBaseUnit(this.inputFundsAmount.trim(), 18).toString()), 
          this.walletAddress,
          async function() {
            try {
              ctx.processTestament(ctx, await App.testamentServiceContract.methods.testamentDetailsOf(ctx.walletAddress).call());
              ctx.cancelTestamentChanges();
              ctx.inputFundsAmount = "";         
              ctx.processing = false;
            } catch (err) {
              onError(err);
            }
          },
          function(err) {
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

      let testament = await App.testamentServiceContract.methods.testamentDetailsOf(accounts[0]).call();
      if (testament.exists) {
        App.vueApp.methods.processTestament(App.data, testament);
        App.data.testament = testament;
      }

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

