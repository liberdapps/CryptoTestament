<template>
  <!-- Navigation-->
  <nav class="navbar navbar-expand-lg navbar-light fixed-top shadow-sm" id="mainNav">
      <div class="container px-5">
          <a class="navbar-brand fw-bold" href="/">CryptoTestament</a>
      </div>
  </nav>
  <!-- Header-->
  <header class="masthead" style="padding-top: 2rem">
  </header>
  <!-- Headline -->
  <aside class="text-center bg-gradient-primary-to-secondary">
      <div class="container px-5">
          <div class="row gx-5 justify-content-center">
              <div class="col-sm-12">
                  <div class="h2 fs-3 text-white mb-0">
                      <p>With crypto, control your money.</p>
                      <p class="mb-0">With CryptoTestament, you decide who gets it after you're gone.</p>
                  </div>
              </div>
          </div>
      </div>
  </aside>
  <!-- Main content -->
  <div class="main" style="padding-top: 1.5rem; padding-bottom: 1rem">
      <div class="container-dapp container-sm" v-if="loadingError !== null">
          <div class="alert alert-danger mb-1" role="alert" style="word-break: break-word;">
              Failure loading dApp: {{loadingError}}.
          </div>
      </div>
      <div class="container-dapp container-sm text-muted" v-if="loadingError === null">
          <!-- Testaments -->
          <div class="alert alert-info mb-5 text-center" role="alert" v-if="testament === null">You don't have a testament yet. Please use the form below to create one.<br /></div>
          
          <div v-if="testament !== null">
              <!-- Testament status -->
              <div class="card shadow rounded mb-4">
                  <div class="card-body">
                      <h5 class="card-title text-primary text-center mb-3">Testament status</h5>
                      <div class="text-center">
                          <div v-if="testamentLocked">
                              <strong v-if="testamentLocked" :class="{'text-danger' : testamentNotifiable}">Locked until {{formattedUnlockTime}}</strong>
                              <div class="alert alert-danger text-center mt-3" v-if="testamentNotifiable">
                                  <strong>Your testament will soon be unlocked for execution!</strong><br/>
                                  You must make a deposit, a withdraw or edit the testament details to keep it locked.
                              </div>
                          </div>

                          <div v-if="testamentUnlocked">
                              <strong class="text-warning">UNLOCKED FOR EXECUTION</strong>
                              <div class="alert alert-warning text-center mt-3">
                                  Your testament will be executed soon.
                              </div>
                          </div>

                          <div v-if="testamentCancelled">
                              <strong class="text-danger">CANCELLED</strong>
                              <div class="alert alert-info text-center mt-3">
                                You can still withdraw your funds or reactivate the testament.
                              </div>
                          </div>

                          <div v-if="testamentExecuted">
                              <strong class="text-success">EXECUTED</strong>
                              <div class="alert alert-success text-center mt-3">
                                  Funds were transferred to the beneficiary.
                              </div>
                          </div>

                      </div>

                      <div class="text-center mt-3 mb-1">
                          <button type="button" class="btn btn-danger" v-if="testamentLocked" @click="cancelTestament" :disabled="processing">{{processing ? "Please, wait..." : "Cancel testament"}}</button>
                          <button type="button" class="btn btn-success" v-if="testamentCancelled" @click="reactivateTestament" :disabled="processing">{{processing ? "Please, wait..." : "Reactivate testament"}}</button>
                      </div>
                  </div>
              </div>

              <!-- Testament funds -->
              <div class="card shadow rounded mb-4" v-if="testamentLocked || testamentCancelled">
                  <div class="card-body">
                      <h5 class="card-title text-primary text-center mb-3">Testament funds</h5>

                      <div class="text-center mb-4" v-if="testamentLocked">
                          <strong>Deposit rBTC </strong><br />
                          <div class="d-flex align-items justify-content-center mt-2">
                              <input class="form-control text-center" style="width: 50%; display: inline-block" v-model="inputDepositAmount" :disabled="processing" />
                          </div>
                          <button type="button" class="btn btn-success mt-2" @click="depositFunds" :disabled="!validDepositAmount || processing">{{processing ? "Please, wait..." : "Deposit funds"}}</button>
                      </div>
                      <div class="alert alert-warning text-center" v-else>
                          You can't deposit funds because this testament has been {{testamentStatusString}}.
                      </div>

                      <div class="text-center mb-2">
                          <strong>Withdraw rBTC (<a href="javascript:void(0)" @click="setMaxWithdrawAmount" style="font-size: 90%">{{formattedBalance}}</a>) </strong>
                      </div>
                      <div class="text-center mb-1">
                          <div class="d-flex align-items justify-content-center">
                              <input class="form-control text-center" style="width: 50%; display: inline-block" v-model="inputWithdrawAmount" :disabled="processing" />
                          </div>
                          <button type="button" class="btn btn-warning mt-2" @click="withdrawFunds" :disabled="!validWithdrawAmount || processing">{{processing ? "Please, wait..." : "Withdraw funds"}}</button>
                      </div>
                  </div>
              </div>
              <div class="card shadow rounded mb-4" v-else>
                  <div class="card-body">
                      <h5 class="card-title text-primary text-center mb-3">Testament funds</h5>
                      <div class="alert alert-warning text-center mb-2">
                          You can't deposit or withdraw funds because this testament has been {{testamentStatusString}}.
                      </div>
                  </div>
              </div>
          </div>

          <!-- Testament details -->
          <div class="card shadow rounded mb-2">
              <div class="card-body">
                  <h5 class="card-title text-primary text-center mb-3">Testament details</h5>

                  <div class="alert alert-warning text-center mb-3" v-if="testament !== null && !testamentLocked">
                      You can't edit the details because this testament has been {{testamentStatusString}}.
                  </div>

                  <div class="mb-3">
                      <label for="txtName" autofocus class="form-label fw-bold">Your name:</label>
                      <input type="text" class="form-control" ref="txtName" :disabled="(!editMode && testament !== null) || processing" v-model="inputName" :class="{'bg-danger bg-opacity-50' : formInputChanged['testatorName'] && !nameValid}" @input="formChanged('testatorName')" />
                      <div class="form-text text-italic">When your testament is about to be executed, we'll warn you using this name.</div>
                  </div>
                  <div class="mb-3">
                      <label for="txtContact" class="form-label fw-bold">Your email:</label>
                      <input type="text" class="form-control" :disabled="(!editMode && testament !== null) || processing" v-model="inputEmail" :class="{'bg-danger bg-opacity-50' : formInputChanged['testatorEmail'] && !emailValid}" @input="formChanged('testatorEmail')" />
                      <div class="form-text">When your testament is about to be executed, we'll warn you using this email.</div>
                  </div>
                  <div class="mb-3">
                      <label for="txtName" autofocus class="form-label fw-bold">Beneficiary name:</label>
                      <input type="text" class="form-control" :disabled="(!editMode && testament !== null) || processing" v-model="inputBeneficiaryName" :class="{'bg-danger bg-opacity-50' : formInputChanged['beneficiaryName'] && !beneficiaryNameValid}" @input="formChanged('beneficiaryName')" />
                      <div class="form-text">When the funds in the testament are transferred, we'll notify the beneficiary using this name.</div>
                  </div>
                  <div class="mb-3">
                      <label for="txtContact" class="form-label fw-bold">Beneficiary email:</label>
                      <input type="text" class="form-control" :disabled="(!editMode && testament !== null) || processing" v-model="inputBeneficiaryEmail" :class="{'bg-danger bg-opacity-50' : formInputChanged['beneficiaryEmail'] && !beneficiaryEmailValid}" @input="formChanged('beneficiaryEmail')" />
                      <div class="form-text">When the funds in the testament are transferred, we'll notify the beneficiary using this email.</div>
                  </div>
                  <div class="mb-3">
                      <label for="txtContact" class="form-label fw-bold">Beneficiary wallet address:</label>
                      <input type="text" class="form-control" :disabled="(!editMode && testament !== null) || processing" v-model="inputBeneficiaryAddress" :class="{'bg-danger bg-opacity-50' : formInputChanged['beneficiaryAddress'] && !beneficiaryAddressValid}" @input="formChanged('beneficiaryAddress')" />
                      <div class="form-text">The wallet address of the beneficiary that should receive the funds locked in the testament.</div>
                  </div>
                  <div class="mb-3">
                      <label for="txtContact" class="form-label mb-0 fw-bold">Proof of life threshold: {{inputProofOfLife + ' days'}}</label>
                      <input type="range" class="form-range" min="30" max="365" :disabled="(!editMode && testament !== null) || processing" v-model="inputProofOfLife" @input="formInput" />
                      <div class="form-text mt-0">For how many days should the testament stay locked after you send a proof of life (make a deposit, a withdraw or change the testament details)? Example: if you choose 30 days, your testament will be unlocked if more than 30 days pass since your last transaction.</div>
                  </div>
                  <div class="text-center mb-1">
                      <button type="button" class="btn btn-primary" @click="editTestament" v-if="!editMode && testament !== null && testamentLocked" :disabled="processing">{{processing ? "Please, wait..." : "Edit details"}}</button>
                      <button type="button" class="btn btn-danger" style="margin-right: 1rem" @click="cancelTestamentChanges" v-if="editMode && testament !== null && testamentLocked" :disabled="processing">Cancel</button>
                      <button type="button" class="btn btn-success" @click="setupTestament" v-if="editMode || testament === null" :disabled="processing || !formValid">
                          {{processing ? "Please, wait..." : "Save"}}
                      </button>
                  </div>
              </div>
          </div>

      </div>
  </div>
  
  <!-- Footer-->
  <footer class="bg-black text-center py-5">
      <div class="container px-5">
          <div class="text-white-50 small">
              <div class="mb-0">CryptoTestament 2022</div>
          </div>
      </div>
  </footer>
</template>

<script>
import AppData from './data';
import wallet from './wallet.js';
import * as Utils from './utils';

const $ = window.jQuery;

export default {
  name: 'App',
  data() {
    return AppData.instance;
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
      return !Utils.isEmpty(this.inputBeneficiaryAddress) && Utils.isValidAddress(this.inputBeneficiaryAddress.toLowerCase());
    },

    formValid() {
      return (
        this.nameValid &&
        this.emailValid &&
        this.beneficiaryNameValid &&
        this.beneficiaryEmailValid &&
        this.beneficiaryAddressValid &&
        Number(this.inputProofOfLife) >= 30
      );
    },

    validDepositAmount() {
      try {
        let value = Utils.toBaseUnit(this.inputDepositAmount.trim(), 18);
        return (value.toString() !== '0');  
      } catch (err) {
        return false;
      }
    },

    validWithdrawAmount() {
      try {
        let value = Utils.toBaseUnit(this.inputWithdrawAmount.trim(), 18);
        let testamentBalance = Utils.toBN(this.testament.testamentBalance);
        return (value.toString() !== '0' && value.lte(testamentBalance));  
      } catch (err) {
        return false;
      }
    },

    formattedTestamentAddress() {
      if (this.testament) {
        return this.testament.testamentAddress.toLowerCase();
      }
      return null;
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

      formChanged(fieldName) {
        this.formInputChanged[fieldName] = true;
      },

      setMaxWithdrawAmount() {
        if (!this.processing) {
          this.inputWithdrawAmount = Utils.formatUnit(Utils.toBN(this.testament.testamentBalance), 18)
        }
      },
     
      async setupTestament() {

        let name = this.inputName.trim();
        let email = this.inputEmail.trim();
        let beneficiaryName = this.inputBeneficiaryName.trim();
        let beneficiaryEmail = this.inputBeneficiaryEmail.trim();
        let beneficiaryAddress = this.inputBeneficiaryAddress.trim().toLowerCase();
        let proofOfLifeThreshold = Number(this.inputProofOfLife) * 24 * 3600; 
        let ctx = this; 

        let encryptedInfo = Utils.encryptTestament(name, email, beneficiaryName, beneficiaryEmail, wallet.encryptionKey);

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

        let encryptedEncryptionKey = Utils.encryptUsingServiceKey(wallet.encryptionKey);
        
        Utils.invokeMethodAndWaitConfirmation(
          wallet.web3Instance,
          wallet.testamentServiceContract.methods.setupTestament(beneficiaryAddress, proofOfLifeThreshold, encryptedEncryptionKey, encryptedInfo), 
          this.walletAddress,
          async function() {
            try {
              let testament =  await wallet.testamentServiceContract.methods.testamentDetailsOf(ctx.walletAddress).call();
              Utils.parseTestament(ctx, testament, wallet.encryptionKey);
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
        Utils.parseTestament(this, this.testament, wallet.encryptionKey);
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
          wallet.web3Instance,
          wallet.testamentServiceContract.methods.cancelTestament(), 
          this.walletAddress,
          async function() {
            try {
              let testament =  await wallet.testamentServiceContract.methods.testamentDetailsOf(ctx.walletAddress).call();
              Utils.parseTestament(ctx, testament, wallet.encryptionKey);
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
          wallet.web3Instance,
          wallet.testamentServiceContract.methods.reactivateTestament(), 
          this.walletAddress,
          async function() {
            try {
              let testament =  await wallet.testamentServiceContract.methods.testamentDetailsOf(ctx.walletAddress).call();
              Utils.parseTestament(ctx, testament, wallet.encryptionKey);
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

      async depositFunds() {
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

        try {
          await wallet.web3Instance.eth.sendTransaction({from: this.walletAddress, to: this.formattedTestamentAddress, value: Utils.toBaseUnit(this.inputDepositAmount.trim(), 18).toString()});
          let testament =  await wallet.testamentServiceContract.methods.testamentDetailsOf(this.walletAddress).call();
          Utils.parseTestament(this, testament, wallet.encryptionKey);
          ctx.cancelTestamentChanges();
          ctx.inputDepositAmount = "";         
          ctx.processing = false;
        } catch (err) {
          onError(err);
        } 
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
          wallet.web3Instance,
          wallet.testamentServiceContract.methods.withdrawTestamentFunds(Utils.toBaseUnit(this.inputWithdrawAmount.trim(), 18).toString()), 
          this.walletAddress,
          async function() {
            try {
              let testament =  await wallet.testamentServiceContract.methods.testamentDetailsOf(ctx.walletAddress).call();
              Utils.parseTestament(ctx, testament, wallet.encryptionKey);
              ctx.cancelTestamentChanges();
              ctx.inputWithdrawAmount = "";         
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

}
</script>

<style>

</style>
