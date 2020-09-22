App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,
    revealElement: null,
    nextRevealElement: null,
  
    init: function() {
      console.log("App initialized...");
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
        });
      }).done(function(){
        $.getJSON("PasswordManager.json", function(passwordManager) {
          App.contracts.PasswordManager = TruffleContract(passwordManager);
          App.contracts.PasswordManager.setProvider(App.web3Provider);
          App.contracts.PasswordManager.deployed().then(function(passwordManager) {
            console.log("Password Manager Address:", passwordManager.address);
          });
        });
      }).done(function(){
        $.getJSON("CredentialPairs.json", function(credentialPair) {
          App.contracts.CredentialPairs= TruffleContract(credentialPair);
          App.contracts.CredentialPairs.setProvider(App.web3Provider);
          App.contracts.CredentialPairs.deployed().then(function(credentialPair) {
            console.log("Credential Pair Address:", credentialPair.address);
          });
          App.listenForEvents();
          return App.render();
        });
      });
      
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
      });
  
      App.contracts.CredentialPairs.deployed().then( function(instance) {
        instance.credentialPairCreated({}, {
          fromBlock: 0,
          toBlock: 'latest',
        }).watch(function(error, event) {
          console.log("event triggered", event);
          App.render();
        })
      });
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
          if(App.account == credential[2] ){
            const credentialId = credential[0].toNumber();
            const credentialData = credential[1];
            const isCredentialDeleted = credential[3];
  
            // Create the html for the task
            const $newCredentialTemplate = $credentialTemplate.clone();
            $newCredentialTemplate.find('.credentialListId').html(credentialId);
            $newCredentialTemplate.find('.credentialListData').html(credentialData);
          
            $('#credentialList').append($newCredentialTemplate);
            $newCredentialTemplate.attr("id",i);
            $newCredentialTemplate.show();
          }
        }
      });
  
      App.contracts.CredentialPairs.deployed().then(async (instance)=>{
        const credentialPairCount = await instance.credentialPairCount();
        const $credentialPairTemplate = $('.credentialPairTemplate');
        for (var i = 1; i <= credentialPairCount.toNumber(); i++) {
          // Fetch the task data from the blockchain
          const credentialPair = await instance.credentialPairs(i);
          if(App.account == credentialPair[3] ){
            const credentialAccount= credentialPair[0];
            const credentialKeyData = credentialPair[1];
            const credentialValueData = credentialPair[2];
            const credentialOwnerData = credentialPair[3];
            const isCredentialDeleted = credentialPair[4];
  
            // Create the html for the task
            const $newCredentialPairTemplate = $credentialPairTemplate.clone();
            $newCredentialPairTemplate.find('.credentialPairListAccount').html(credentialAccount);
            $newCredentialPairTemplate.find('.credentialPairListKeyData').html(credentialKeyData);
            $newCredentialPairTemplate.find('.credentialPairListValueData').html(credentialValueData);
            $('#credentialPairList').append($newCredentialPairTemplate);
          
            $newCredentialPairTemplate.show();
            
          }
          
        }
      });
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
  
    generateIV: function(){
      const MAX_IV = 1e16;
      return Math.floor(Math.random() * MAX_IV)
    },
  
    encryptData: function(text,keyArg){
      var key = CryptoJS.SHA256(keyArg);
      console.log(key.toString());
      var iv =  CryptoJS.enc.Hex.parse(App.generateIV().toString());
      //var ivHash = CryptoJS.SHA256(iv.toString());
      var encrypted = CryptoJS.AES.encrypt(text, key, {
        mode: CryptoJS.mode.CTR,
        iv: iv,
        padding: CryptoJS.pad.NoPadding
      });
  
      return encrypted;
    },
  
    createCredential: function() {
      $('#content').hide();
      $('#loader').show();
      var credentialData = $('#credentialInput').val();
      var privateKey = $('#privateKey').val();
      privateKey = CryptoJS.SHA256(privateKey.substring(0,10)).toString();
      var encryptedData =   CryptoJS.AES.encrypt(credentialData,privateKey,{
        mode: CryptoJS.mode.CTR
      });
      App.contracts.PasswordManager.deployed().then(function(instance) {
        return instance.createCredential(encryptedData.ciphertext.toString());
      }).then(function(result) {
        console.log("Credentials Saved...")
        $('form').trigger('reset') // reset number of tokens in form
        // Wait for Sell event
      });
    },
  
    revealCredential: function(){
      var privateKey = $('#modalPrivateKey').val();
      var decrypted = CryptoJS.AES.decrypt(App.revealElement.html(), privateKey);
    
      App.contracts.PasswordManager.deployed().then(function(instance){
        return instance.revealCredential();
      }).then(function(){
        App.revealElement.first().html(decrypted.toString(CryptoJS.enc.Utf8));
        console.log(decrypted.toString(CryptoJS.enc.Utf8));
      });
    },
  
    createCredentialPair: function() {
      $('#content').hide();
      $('#loader').show();
      var credentialAccount = $('#txtAccountInput').val();
      var credentialKeyData = $('#txtKeyInput').val();
      var credentialValueData = $('#txtValueInput').val();
      var privateKey = $('#privateKey').val();
      var encryptedKeyData =  CryptoJS.AES.encrypt(credentialKeyData, privateKey).toString();
      var encryptedValueData =  CryptoJS.AES.encrypt(credentialValueData, privateKey).toString();  
      App.contracts.CredentialPairs.deployed().then(function(instance) {
        return instance.createCredentialPair(credentialAccount,encryptedKeyData,encryptedValueData);
      }).then(function(result) {
        console.log("Credential Pair Saved...")
        $('form').trigger('reset') // reset number of tokens in form
        // Wait for Sell event
      });
    },
  
    revealCredentialPair: function(){
      var privateKey = $('#modalPrivateKey').val();
      var decryptedKey = CryptoJS.AES.decrypt(App.revealElement.innerHTML, privateKey);
      var decryptedValue = CryptoJS.AES.decrypt(App.nextRevealElement.innerHTML, privateKey);
    
      App.contracts.CredentialPairs.deployed().then(function(instance){
        return instance.revealCredentialPair();
      }).then(function(){
        App.revealElement.innerHTML=decryptedKey.toString(CryptoJS.enc.Utf8);
        App.nextRevealElement.innerHTML=decryptedValue.toString(CryptoJS.enc.Utf8);
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
          });
          $('#staticBackdrop').on('shown.bs.modal', function () {
            $('#modalPrivateKey').trigger('focus')
          });
          $('#btnModalReveal').on('click',function(){
            $('#staticBackdrop').modal('toggle');
          });
          $('#staticBackdrop').on('hidden.bs.modal', function () {
            $('#modalPrivateKey').val("");
          });
          
          $(document).on("click", '.btnReveal', function(event){
            App.revealElement = $(this).next().children(); 
          });
  
          $('#pairRevealModal').on('shown.bs.modal', function () {
            $('#modalPrivateKey').trigger('focus')
          });
          $('#btnModalReveal').on('click',function(){
            $('#pairRevealModal').modal('toggle');
          });
          $('#pairRevealModal').on('hidden.bs.modal', function () {
            $('#modalPrivateKey').val("");
          });
          
          
  
          $(document).on("click", '.btnPairReveal', function(event){
            
            
            console.log(encrypted.toString());
            console.log(encrypted.iv.toString());
            var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
              mode: CryptoJS.mode.CTR,
              iv: ivHash,
              padding: CryptoJS.pad.NoPadding
            });
            
            console.log(decrypted.toString(CryptoJS.enc.Utf8));
            App.revealElement = $(this).first().next().children()[0];
            App.nextRevealElement = $(this).first().next().children()[2];
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
  
  var key = CryptoJS.enc.Hex.parse('32323334353637383930313233343536');
  var iv = CryptoJS.enc.Hex.parse('0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f');
  var encrypted = CryptoJS.AES.encrypt("text can be a random lenght", key, {
    mode: CryptoJS.mode.CTR,
    iv: iv,
    padding: CryptoJS.pad.NoPadding
  });
  
  document.getElementById("id").innerHTML = encrypted.ciphertext.toString();
  document.getElementById("id2").innerHTML = encrypted.toString();
  
  var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    mode: CryptoJS.mode.CTR,
    iv: iv,
    padding: CryptoJS.pad.NoPadding
  });
  document.getElementById("decrypt").innerHTML = decrypted.toString(CryptoJS.enc.Utf8); // text can be a random lenght
  */