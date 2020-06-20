App = {
    loading: false,
    account: '0x0',
    contracts: {},
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
        $.getJSON("PasswordManager.json", function(passwordManager) {
          App.contracts.PasswordManager = TruffleContract(passwordManager);
          App.contracts.PasswordManager.setProvider(App.web3Provider);
          App.contracts.PasswordManager.deployed().then(function(passwordManager) {
            console.log("Swap Token Sale Address:", passwordManager.address);
          });
        })
    },

    
    listenForEvents: function() {
        App.contracts.PasswordManager.deployed().then(function(instance) {
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
        });
    
        // Load Password Manager contract
        App.contracts.PasswordManager.deployed().then(function(instance) {
          
            App.loading = false;
            loader.hide();
            content.show();
        });    
    },

    createCredentials: function() {
        $('#content').hide();
        $('#loader').show();
        var credentialData = $('#credentialInput').val();
        App.contracts.PasswordManager.deployed().then(function(instance) {
          return instance.createCredential(credentialData, {
            from: App.account
          });
        }).then(function(result) {
          console.log("Credentials Saved...")
          $('form').trigger('reset') // reset number of tokens in form
          // Wait for Sell event
        });
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
        })
    });
  });
});