const App = {
  init: async function () {
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("CryptoTestament.json", function (cryptoTestament) {

      let appData = {
        walletAddress: null,
        cryptoTestamentContract: null,
        loadingTestaments: false,
        loadingError: null,
        makerTestaments: null,
        beneficiaryTestaments: null,
        lang: 'pt',
        langs: {
          'en': {
            title: 'Crypto Testament',
            subtitle: 'Your keys, your coins, your testament!',
            launchDApp: 'Launch DApp',
            intro: 'Bla bla',
            broughtBy: 'Brought by '
          },
          'pt': {
            title: 'Crypto Testament',
            subtitle: 'Your keys, your coins, your testament!',
            launchDApp: 'Acessar DApp',
            intro1: 'Com as criptomoedas, você assume o controle sobre o seu próprio dinheiro.',
            intro2: 'Com o Crypto Testament, você define quem fica com ele na sua ausência.',
            broughtBy: 'Oferecido por '
          }
        }
      };

      Vue.component('main-page', {
        template: '#main-template',
        data() {
          return appData;
        }
      });

      Vue.component('dapp-page', {
        template: '#dapp-template',
        data() {
          return appData;
        },
        methods: {

          toETH(weiValue) {
            return web3.utils.fromWei(weiValue, 'ether') + ' ETH';
          },

          formatAddress(address) {
            return "0x" + address.toUpperCase().substring(2);
          },

          async connectWebWallet() {
            try {

              if (!window.ethereum) {
                throw "Não foi possível detectar sua carteira MetaMask. Certifique-se que ela tenha sido corretamente instalada.";
              }

              let response = await ethereum.request({ method: 'eth_requestAccounts' });
              window.web3 = new Web3(window.ethereum);
              console.log(response);

              if (!response) {
                throw "Não foi possível detectar sua carteira MetaMask. Certifique-se que ela tenha sido corretamente instalada.";
              }

              let accounts = response;
              if (!accounts || !accounts.length) {
                throw "Não foi possível detectar sua carteira MetaMask. Certifique-se que ela tenha sido corretamente instalada.";
              }

              this.cryptoTestamentContract = new web3.eth.Contract(cryptoTestament.abi, '0x5E91dBD1aFEdcE6ad6CE30543dC52121fA9488f1');
              await this.loadTestaments(accounts[0]);
              this.walletAddress = this.formatAddress(accounts[0]);

            } catch (err) {
              console.log(err);

              let $modal = $("#errorModal");
              let title = "Erro";
              let error = err;
              if (err.message) {
                error = err.message;
              }

              if (err.code === -32002) {
                title = "Autorização pendente";
                error = "Por favor, permita que este aplicativo se conecte à sua carteira MetaMask. Verifique o ícone da mesma.";
              } else if (err.code === 4001) {
                // User just canceled...
                return;
              }

              $modal.find('.modal-body').text(error);
              $modal.find('.modal-title').text(title);
              $modal.modal('show');
            };
          },

          async loadTestaments(walletAddress) {
            this.loadingTestaments = true;
            this.loadingError = null;
            this.makerTestaments = null;
            this.beneficiaryTestaments = null;


            this.$nextTick(async () => {
              try {
                let latestBlock = await web3.eth.getBlock('latest');
                let testamentsTuple = await this.cryptoTestamentContract.methods.getTestaments().call();
                let id = 0;
                let testaments = [];

                testamentsTuple.forEach(t => {
                  let testament = {
                    id: id++,
                    dateTime: new Date(t.timestamp * 1000).toISOString(),
                    senderAddress: this.formatAddress(t.senderAddress),
                    beneficiaryAddress: this.formatAddress(t.beneficiaryAddress),
                    testamentAmount: t.testamentAmount,
                    unlockTimestamp: +t.unlockTimestamp,
                    encryptedTestament: t.encryptedTestament,
                    testamentHash: t.testamentHash,
                    message: null,
                    status: t.status
                  };
                  testaments.push(testament);
                });

                let mt = testaments.filter(t => t.senderAddress.toLowerCase() == walletAddress.toLowerCase());
                let bt = testaments.filter(t => t.beneficiaryAddress.toLowerCase() == walletAddress.toLowerCase());

                bt = bt.filter(t => (t.status === "0" && latestBlock.timestamp >= t.unlockTimestamp) || t.status === "2");

                // if (Math.random() < 0.5) {
                //   throw "ops";
                // }

                this.makerTestaments = mt;
                this.beneficiaryTestaments = bt;
                this.loadingTestaments = false;
              } catch (err) {
                this.loadingError = err;
                if (err.message) {
                  this.loadingError = err.message;
                }
                this.loadingTestaments = false;
              }
            });
          },

          showMakeTestamentDialog() {
            $("#createTestamentModal").modal({ backdrop: 'static', keyboard: false }).modal('show');
            $("#btnMakeTestament").text('Criar testamento').removeClass('disabled').prop('disabled', false);
            $("#createTestamentModal").find('[data-bs-dismiss]').prop('disabled', false);
            $("#createTestamentModal").find('input, textarea').prop('disabled', false);
            $("#createTestamentModal").on('shown.bs.modal', function () {
              setTimeout(() => {
                $("#txtBeneficiaryAddress").focus();
              }, 200);
            });
          },

          async makeTestament() {
            let toAddress = $("#txtBeneficiaryAddress").val().trim();
            let weiAmount;
            let minExecDays = $("#txtMinExecDays").val().trim();
            let msg = $("#txtMsg").val().trim();
            let passphrase = $("#txtPassphrase").val().trim();

            $("#txtBeneficiaryAddress").removeClass('is-invalid');
            $("#txtAmount").removeClass('is-invalid');
            $("#txtMinExecDays").removeClass('is-invalid');
            $("#txtMsg").removeClass('is-invalid');
            $("#txtPassphrase").removeClass('is-invalid');

            if (!web3.utils.isAddress(toAddress)) {
              $("#txtBeneficiaryAddress").addClass('is-invalid');
              $("#errorModal").find('.modal-body').text('Por favor, insira um endereço de carteira válido.');
              $("#errorModal").modal('show');
              $("#errorModal").off().on('hidden.bs.modal', function () {
                $("#errorModal").off();
                $("#txtBeneficiaryAddress").focus();
              });
              return;
            }

            try {
              weiAmount = web3.utils.toWei($("#txtAmount").val().trim(), 'ether');
              if (weiAmount < 1) {
                throw 'weiAmount should be > 0.'
              }
            } catch (err) {
              $("#txtAmount").addClass('is-invalid');
              $("#errorModal").find('.modal-body').text('Por favor, insira uma quantia em ETH válida.');
              $("#errorModal").modal('show');
              $("#errorModal").off().on('hidden.bs.modal', function () {
                $("#errorModal").off();
                $("#txtAmount").focus();
              });
              return;
            }

            if (!isInt(minExecDays) || +minExecDays < 1) {
              $("#txtMinExecDays").addClass('is-invalid');
              $("#errorModal").find('.modal-body').text('Por favor, especifique corretamente o número mínimo de dias necessários para executar o testamento.');
              $("#errorModal").modal('show');
              $("#errorModal").off().on('hidden.bs.modal', function () {
                $("#errorModal").off();
                $("#txtMinExecDays").focus();
              });
              return;
            }

            minExecDays = +minExecDays;

            if (!msg || msg.length === 0) {
              $("#txtMsg").addClass('is-invalid');
              $("#errorModal").find('.modal-body').text('Por favor, insira uma mensagem no seu testamento.');
              $("#errorModal").modal('show');
              $("#errorModal").off().on('hidden.bs.modal', function () {
                $("#errorModal").off();
                $("#txtMsg").focus();
              });
              return;
            }

            if (!passphrase || passphrase.length === 0) {
              $("#txtPassphrase").addClass('is-invalid');
              $("#errorModal").find('.modal-body').text('Por favor, insira uma senha para decodificar sua mensagem.');
              $("#errorModal").modal('show');
              $("#errorModal").off().on('hidden.bs.modal', function () {
                $("#errorModal").off();
                $("#txtPassphrase").focus();
              });
              return;
            }


            $("#btnMakeTestament").addClass('disabled').prop('disabled', true).text('Criando testamento...');
            $("#createTestamentModal").find('[data-bs-dismiss]').prop('disabled', true);
            $("#createTestamentModal").find('input, textarea').prop('disabled', true);

            try {
              let testamentObj = this.encryptTestament(this.createTestamentV1(msg), passphrase);
              let networkId = await web3.eth.net.getId();
              await this.cryptoTestamentContract.methods.makeTestament(toAddress, minExecDays, testamentObj.encryptedTestament, testamentObj.testamentHash).estimateGas({ from: this.walletAddress, value: weiAmount });
              let obj = await this.cryptoTestamentContract.methods.makeTestament(toAddress, minExecDays, testamentObj.encryptedTestament, testamentObj.testamentHash).send({
                from: this.walletAddress,
                value: weiAmount
              });

              $("#createTestamentModal").modal('hide');
              $("#successModal").find('a').attr('href', (networkId === 1 ? 'https://etherscan.io/tx/' : 'https://ropsten.etherscan.io/tx/') + obj.transactionHash);
              $("#successModal").modal('show');

              console.log(obj);


            } catch (err) {
              console.log(err);
              let errorMessage = err;
              if (err.message) {
                errorMessage = err.message;
              }

              $("#btnMakeTestament").text('Criar testamento').removeClass('disabled').prop('disabled', false);
              $("#createTestamentModal").find('[data-bs-dismiss]').prop('disabled', false);
              $("#createTestamentModal").find('input, textarea').prop('disabled', false);

              if (err.code && err.code === 4001) {
                // User just canceled, no need to show an error.
              } else {
                $("#errorModal").find('.modal-body').text('Ocorreu um erro ao criar o testamento: ' + errorMessage);
                $("#errorModal").modal('show');
              }

            }
          },

          async cancelTestament(testamentId) {
            let testament = this.makerTestaments.find(t => t.id === testamentId);
            if (!testament) {
              testament = this.beneficiaryTestaments.find(t => t.id === testamentId);
            }

            try {

              if (!testament) {
                console.log("Testament not found.");
                throw "Ocorreu um erro ao cancelar este testamento. Por favor, atualize a página e tente novamente.";
              }

              let networkId = await web3.eth.net.getId();
              let gasEst = await this.cryptoTestamentContract.methods.cancelTestament(testamentId).estimateGas({ from: this.walletAddress });
              let obj = await this.cryptoTestamentContract.methods.cancelTestament(testamentId).send({
                from: this.walletAddress,
                value: 0
              });

              $("#createTestamentModal").modal('hide');
              $("#successModal").find('a').attr('href', (networkId === 1 ? 'https://etherscan.io/tx/' : 'https://ropsten.etherscan.io/tx/') + obj.transactionHash);
              $("#successModal").modal('show');

              console.log(obj);


            } catch (err) {
              console.log(err);
              let errorMessage = err;
              if (err.message) {
                errorMessage = err.message;
              }


              if (err.code && err.code === 4001) {
                // User just canceled, no need to show an error.
              } else {
                $("#errorModal").find('.modal-body').text('Falha ao cancelar testamento. Erro: ' + errorMessage);
                $("#errorModal").modal('show');
              }
            }
          },

          async executeTestament(testamentId) {
            let testament = this.makerTestaments.find(t => t.id === testamentId);
            if (!testament) {
              testament = this.beneficiaryTestaments.find(t => t.id === testamentId);
            }

            try {

              if (!testament) {
                console.log("Testament not found.");
                throw "Ocorreu um erro ao executar este testamento. Por favor, atualize a página e tente novamente.";
              }

              let networkId = await web3.eth.net.getId();
              let gasEst = await this.cryptoTestamentContract.methods.executeTestament(testamentId).estimateGas({ from: this.walletAddress });
              let obj = await this.cryptoTestamentContract.methods.executeTestament(testamentId).send({
                from: this.walletAddress,
                value: 0
              });

              $("#createTestamentModal").modal('hide');
              $("#successModal").find('a').attr('href', (networkId === 1 ? 'https://etherscan.io/tx/' : 'https://ropsten.etherscan.io/tx/') + obj.transactionHash);
              $("#successModal").modal('show');

              console.log(obj);


            } catch (err) {
              console.log(err);
              let errorMessage = err;
              if (err.message) {
                errorMessage = err.message;
              }


              if (err.code && err.code === 4001) {
                // User just canceled, no need to show an error.
              } else {
                $("#errorModal").find('.modal-body').text('Falha ao executar testamento. Erro: ' + errorMessage);
                $("#errorModal").modal('show');
              }
            }
          },

          createTestamentV1(message) {
            return JSON.stringify({
              version: "v1",
              message: message
            });
          },

          encryptTestament(testamentObjJSON, passphrase) {
            return {
              encryptedTestament: CryptoJS.AES.encrypt(testamentObjJSON, passphrase).toString(),
              testamentHash: sha256(testamentObjJSON)
            }
          },

          decryptTestament(testamentId) {
            let ctx = this;

            $("#txtDecryptPass").val('');
            $("#decryptMsgModal").modal('show');
            $("#decryptMsgModal").off().on('shown.bs.modal', function () {
              setTimeout(() => {
                $("#txtDecryptPass").focus();
              }, 200);
            });

            function doDecrypt() {
              let testament = ctx.makerTestaments.find(t => t.id === testamentId);
              if (!testament) {
                testament = ctx.beneficiaryTestaments.find(t => t.id === testamentId);
              }

              try {

                if (!testament) {
                  console.log("Testament not found.");
                  throw "Ocorreu um erro ao decodificar este testamento. Por favor, atualize a página e tente novamente.";
                }

                let passwordTxt = $("#txtDecryptPass").val().trim();
                let encryptedTestament = testament.encryptedTestament;
                let decryptedObjJSON = CryptoJS.AES.decrypt(encryptedTestament, passwordTxt).toString(CryptoJS.enc.Utf8);
                let descryptedTestament = JSON.parse(decryptedObjJSON);

                if (descryptedTestament.version === null || descryptedTestament.version === undefined) {
                  throw "No version found in the testament!";
                }

                if (descryptedTestament.version === "v1") {
                  let actualHash = sha256(decryptedObjJSON);
                  if (actualHash !== testament.testamentHash) {
                    throw "Message hash doesn't match. Expected: " + testament.testamentHash + ". Got: " + actualHash + ".";
                  }

                  $("#decryptMsgModal").modal('hide');
                  $("#decryptMsgModal").off().on('hidden.bs.modal', function () {
                    $("#decryptMsgModal").off();
                    testament.message = descryptedTestament.message;
                  });
                } else {
                  throw "Invalid version found in the testament: " + descryptedTestament.version;
                }

              } catch (err) {
                console.log(err);
                $("#errorModal").find('.modal-body').text('Não foi possível decodificar este testamento. Por favor, certifique-se que a senha esteja correta.');
                $("#errorModal").modal('show');
                $("#errorModal").off().on('hidden.bs.modal', function () {
                  $("#errorModal").off();
                  setTimeout(() => {
                    $("#txtDecryptPass").focus();
                  }, 200);
                });
              }

              return false;
            }

            $("#decryptMsgModal").find('form').on('submit',function() {
              return false;
            });

            $("#decryptMsgModal").find('[data-decrypt-btn]').off().on('click', doDecrypt);
          }
        }
      });

      new Vue({
        el: '#app'
      })
    });
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
