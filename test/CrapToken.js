var CrapToken = artifacts.require("./CrapToken.sol");

contract("CrapToken",function(accounts){
   it("Sets the number of tokens upon deployment",function(){
       return CrapToken.deployed().then(function(instance){
           tokenInstance = instance;
           return tokenInstance.totalSupply();
       }).then(function(totalSupply){
           assert.equal(totalSupply.toNumber(),1000000,"Sets the total supply to 1000000");
       });
   }); 
});