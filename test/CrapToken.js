var CrapToken = artifacts.require("./CrapToken.sol");

contract("CrapToken",function(accounts){
    var tokenInstance;
   it('initializes the contract with the correct values',function(){
       return CrapToken.deployed().then(function(instance){
           tokenInstance=instance;
           return tokenInstance.name();
       }).then(function(name){
          assert.equal(name,'Crap Token','has the correct name');
          return tokenInstance.symbol();
       }).then(function(symbol){
           assert.equal(symbol,'Crap','Has the correct symbol');
           return tokenInstance.standard();
       }).then(function(standard){
           assert.equal(standard,'Crap Token v1.0','Has the correct symbol');
       });
   });
   
   it("Sets the number of tokens upon deployment",function(){
       return CrapToken.deployed().then(function(instance){
           tokenInstance = instance;
           return tokenInstance.totalSupply();
       }).then(function(totalSupply){
           assert.equal(totalSupply.toNumber(),1000000,"Sets the total supply to 1000000");
           return tokenInstance.balanceOf(accounts[0]);
       }).then(function(adminBalance){
           assert.equal(adminBalance.toNumber(),1000000,"Sets the balance of Admin");
       });
   }); 
});