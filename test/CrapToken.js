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
   
   it("Transfers token ownership",function(){
       return CrapToken.deployed().then(function(instance){
           tokenInstance = instance;
           return tokenInstance.transfer.call(accounts[1],999999999999999);
       }).then(assert.fail).catch(function(error){
           assert(error.message.indexOf('revert')>=0,'Error message must contain revert');
           return tokenInstance.transfer.call(accounts[1],250000,{from:accounts[0]});
       }).then(function(success){
           assert.equal(success,true,"Transfer succeed");
           return tokenInstance.transfer(accounts[1],250000,{from:accounts[0]});
       }).then(function(receipt){
           assert.equal(receipt.logs.length,1,'triggers one event');
           assert.equal(receipt.logs[0].event,'Transfer','Should be the Transfer event');
           assert.equal(receipt.logs[0].args._from,accounts[0],'Logs the account of sender');
           assert.equal(receipt.logs[0].args._to,accounts[1],'Logs the account of receiver');
           assert.equal(receipt.logs[0].args._value,250000,'Logs the transfer amount');
           return tokenInstance.balanceOf(accounts[1]);
       }).then(function(balance){
           assert.equal(balance.toNumber(),250000,'Adds the amount to the receiving account');
           return tokenInstance.balanceOf(accounts[0]);
       }).then(function(balance){
           assert.equal(balance.toNumber(),750000,'Balance of account after deduction');
       });
   });

   it('Approves tokens for delegated transfer',function(){
       return CrapToken.deployed().then(function(instance){
           tokenInstance = instance;
           return tokenInstance.approve.call(accounts[1],100);
       }).then(function(success){
           assert.equal(success,true,'it returns true');
           return tokenInstance.approve(accounts[1],100,{ from: accounts[0] });
       }).then(function(receipt){
           assert.equal(receipt.logs.length,1,"Triggers only one Event");
           assert.equal(receipt.logs[0].event,'Approval','It should be the Approval Event');
           assert.equal(receipt.logs[0].args._owner,accounts[0],'Logs the Account the token are authorized by');
           assert.equal(receipt.logs[0].args._spender,accounts[1],'Logs the account the token are authorized to');
           assert.equal(receipt.logs[0].args._value, 100,'logs the transfer amount');
           return tokenInstance.allowance(accounts[0],accounts[1]);
       }).then(function(allowance){
           assert.equal(allowance.toNumber(),100,'stores the allowance for delegated transfer');
       });
   });
});