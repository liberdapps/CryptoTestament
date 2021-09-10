App = {
  web3Provider: null,
  contracts: {},
  vueApp: null,
  ethAcc: null,
  init: async function () {
    return await App.initWeb3();
  },

initWeb3: async function () {
  if (window.ethereum) {
    await window.ethereum.send('eth_requestAccounts');
    window.web3 = new Web3(window.ethereum);
    App.web3Provider = window.web3.currentProvider;
  }

  return App.initContract();
},

initContract: function () {
  $.getJSON("CryptoWill.json", function(cryptoWill) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.CryptoWill = TruffleContract(cryptoWill);
      // Connect provider to interact with contract
      App.contracts.CryptoWill.setProvider(App.web3Provider);

      let langsObj = {
        lang: 'pt',
        langs: {
          'en': {
            title: 'Crypto Will',
            subtitle: 'Your keys, your coins, your will!',
            launchDApp: 'Launch DApp',
            intro: 'Bla bla',
            broughtBy: 'Brought by '
          },
          'pt': {
            title: 'Crypto Will',
            subtitle: 'Your keys, your coins, your will!',
            launchDApp: 'Acessar DApp',
            intro1: 'Com as criptomoedas, você assume o controle sobre o seu próprio dinheiro.',
            intro2: 'Com o Crypto Will, você define quem fica com ele na sua ausência.',
            broughtBy: 'Um produto da '
          }
        }
      };

      Vue.component('main-page', {
        template: '#main-template',
        data () {
          return langsObj;
        }
      });

      Vue.component('dapp-page', {
        template: '#dapp-template',
        data () {
          return langsObj;
        },
        mounted() {

        }
      });
  
    vueApp = new Vue({
      el: '#app'
    })
  });
},

connectWallet() {
  var ctx = this;
     // Load account data
     web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.ethAcc = account;

        App.contracts.CryptoWill.deployed().then(function(instance) {

          instance.bla({ from: App.ethAcc }).then(function(r){
           // alert(r);
          });

          instance.test({ from: App.ethAcc }).then(function(r){
            //alert(r);
          });

          instance.test3({ from: App.ethAcc }).then(function(r){
           // alert(r);
          });

        
  
        });

      }
    });

}

};

$(function () {
  $(window).load(function () {
    App.init();

    var tabs = $('.tabs');
    var selector = $('.tabs').find('a').length;
    //var selector = $(".tabs").find(".selector");
    var activeItem = tabs.find('.active');
    var activeWidth = activeItem.innerWidth();
    $(".selector").css({
      "left": activeItem.position.left + "px", 
      "width": activeWidth + "px"
    });

    $(".tabs").on("click","a",function(e){
      e.preventDefault();
      $('.tabs a').removeClass("active");
      $(this).addClass('active');
      var activeWidth = $(this).innerWidth();
      var itemPos = $(this).position();
      $(".selector").css({
        "left":itemPos.left + "px", 
        "width": activeWidth + "px"
      });
    });

  });
});
