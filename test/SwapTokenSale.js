var SwapTokenSale = artifacts.require('./SwapTokenSale.sol');

contract("SwapTokenSale",function(accounts){
    var tokenSaleInstance;
    var tokenPrice = 1000000000000000; // in wei

    it("Initializes the contract with the correct values",function(){
        return SwapTokenSale.deployed().then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function(address){
            assert.notEqual(address,0x0,"Has contract address");
            return tokenSaleInstance.tokenContract();
        }).then(function(address){
            assert.notEqual(address,0x0,"Has Token contract address");
            return tokenSaleInstance.tokenPrice();
        }).then(function(price){
            assert.equal(price,tokenPrice,"Has the described token price");
        });
    });
});