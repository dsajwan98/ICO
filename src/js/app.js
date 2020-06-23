App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("SwapTokenSale.json", function(swapTokenSale) {
      App.contracts.SwapTokenSale = TruffleContract(swapTokenSale);
      App.contracts.SwapTokenSale.setProvider(App.web3Provider);
      App.contracts.SwapTokenSale.deployed().then(function(swapTokenSale) {
        console.log("Swap Token Sale Address:", swapTokenSale.address);
      });
    }).done(function() {
      $.getJSON("SwapToken.json", function(swapToken) {
        App.contracts.SwapToken = TruffleContract(swapToken);
        App.contracts.SwapToken.setProvider(App.web3Provider);
        App.contracts.SwapToken.deployed().then(function(swapToken) {
          console.log("Swap Token Address:", swapToken.address);
        });
        App.listenForEvents();
        return App.render();
      });
    });

    $.getJSON("PasswordManager.json", function(passwordManager) {
      App.contracts.PasswordManager = TruffleContract(passwordManager);
      App.contracts.PasswordManager.setProvider(App.web3Provider);
      App.contracts.PasswordManager.deployed().then(function(passwordManager) {
        console.log("Swap Token Sale Address:", passwordManager.address);
      });
    })
  },


  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.SwapTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    });

    App.contracts.PasswordManager.deployed().then( function(instance) {
     
      instance.credentialCreated({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        if(account == null){
          $('#acc-row').hide();
          $('.alert-danger').show();
        }else{
          $('#acc-row').show();
          $('.alert-danger').hide();
        }
        $('#accountAddress').html("Your Account: " + account);
      }
    })

    // Load token sale contract
    App.contracts.SwapTokenSale.deployed().then(function(instance) {
      swapTokenSaleInstance = instance;
      return swapTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return swapTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);
      $('#tokens-left').html(App.tokensAvailable - App.tokensSold);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.SwapToken.deployed().then(function(instance) {
        swapTokenInstance = instance;
        return swapTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.swap-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      })
    });

    App.contracts.PasswordManager.deployed().then(async (instance)=>{
      const credentialCount = await instance.credentialCount();
      const $credentialTemplate = $('.credentialTemplate');
      for (var i = 1; i <= credentialCount.toNumber(); i++) {
      // Fetch the task data from the blockchain
      const credential = await instance.credentials(i);
      const credentialId = credential[0].toNumber();
      const credentialData = credential[1];
      const isCredentialDeleted = credential[3];

      // Create the html for the task
      const $newCredentialTemplate = $credentialTemplate.clone();
      $newCredentialTemplate.find('.credentialListId').html(credentialId);
      $newCredentialTemplate.find('.credentialListData').html(credentialData);
     
      $('#credentialList').append($newCredentialTemplate);
    
      $newCredentialTemplate.show();
    }
    })
  },

  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.SwapTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  },

  createCredential: function() {
    $('#content').hide();
    $('#loader').show();
    var credentialData = $('#credentialInput').val();
    var privateKey = $('#privateKey').val();
    var encryptedData =  CryptoJS.AES.encrypt(credentialData, privateKey).toString(); 
    App.contracts.PasswordManager.deployed().then(function(instance) {
      return instance.createCredential(encryptedData);
    }).then(function(result) {
      console.log("Credentials Saved...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  },

  revealCredential: function(){
    alert($('.btnReveal').prev().first().html());
   /* App.contracts.PasswordManager.deployed().then(function(instance){
      return instance.revealCredential();
    }).then(function(){
      $('.btnReveal').prev().first().html()
    });*/
  }

}

$(function() {
  $('.load-navbar').load("navbar.html");
  $('.load-footer').load("footer.html");
  $('#acc-row').hide();
  $('.alert-danger').hide();
  $(window).on('load',function(){
    App.init();
    $(function(){
      var current =location.pathname.split("/")[2];
      $('nav li a').each(function(){
          var $this = $(this);
          // if the current path is like this link, make it active
          if($this.attr('href').split("/")[1] == current){
              $this.addClass('active');
          }
        });
        $('#staticBackdrop').on('shown.bs.modal', function () {
          $('#modalPrivateKey').trigger('focus')
        });
        $('.btnReveal').on('click',function(){
          alert($(this).prev().first().html());
        });
    });
  });
});

/*
//<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.9-1/crypto-js.js">
// Try edit message
var message = 'Hell';  
var key= '3241a9fb6ac2d20421404fdcbd421da1832336d3d7f4340f4b3dae756b222af1';
var encrypted = CryptoJS.AES.encrypt(message, key);  
console.log(encrypted.toString());
var decrypted = CryptoJS.AES.decrypt(encrypted, '3241a9fb6ac2d20421404fdcbd421da1832336d3d7f4340f4b3dae756b222af1');
console.log(decrypted.toString(CryptoJS.enc.Utf8));
*/