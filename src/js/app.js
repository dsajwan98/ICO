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

        return App.render();
      });
    })
  },

  render: function() {
    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })

  },

}

$(function() {
  $(window).load(function() {
    App.init();
  })
});
