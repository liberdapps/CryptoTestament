App = {
  web3Provider: null,
  contracts: {},
  vueApp: null,
  init: async function () {
    // // Load pets.
    // $.getJSON('../pets.json', function(data) {
    //   var petsRow = $('#petsRow');
    //   var petTemplate = $('#petTemplate');

    //   for (i = 0; i < data.length; i ++) {
    //     petTemplate.find('.panel-title').text(data[i].name);
    //     petTemplate.find('img').attr('src', data[i].picture);
    //     petTemplate.find('.pet-breed').text(data[i].breed);
    //     petTemplate.find('.pet-age').text(data[i].age);
    //     petTemplate.find('.pet-location').text(data[i].location);
    //     petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

    //     petsRow.append(petTemplate.html());
    //   }
    // });

    Vue.component('main-page', {
      template: '#main-page-template',
      data () {
        return {
          lang: 'pt',
          langs: {
            'en': {
              title: 'Smart Legacy',
              subtitle: 'Your keys, your coins, your legacy!',
              launchDApp: 'Launch DApp',
              intro: 'Bla bla',
            },
            'pt': {
              title: 'Smart Legacy',
              subtitle: 'Your keys, your coins, your legacy!',
              launchDApp: 'Acessar DApp',
              intro1: 'Com as criptomoedas, você assume o controle sobre o seu próprio dinheiro.',
              intro2: 'Com o Smart Legacy, você garante que apenas seus herdeiros tenham acesso a ele na sua ausência.',
            }
          }
        }
      }
    });

    vueApp = new Vue({
      el: '#app'
    })
    return await App.initWeb3();
  },

initWeb3: async function () {
  /*
   * Replace me...
   */

  return App.initContract();
},

initContract: function () {
  /*
   * Replace me...
   */

  return App.bindEvents();
},

bindEvents: function () {
  $(document).on('click', '.btn-adopt', App.handleAdopt);
},

markAdopted: function () {
  /*
   * Replace me...
   */
},

handleAdopt: function (event) {
  event.preventDefault();

  var petId = parseInt($(event.target).data('id'));

  /*
   * Replace me...
   */
}

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
