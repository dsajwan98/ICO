var PasswordManager = artifacts.require("./PasswordManager.sol");
var SwapToken = artifacts.require("./SwapToken.sol");
var SwapTokenSale = artifacts.require('./SwapTokenSale.sol');

contract("PasswordManager",function(accounts){
    var pmInstance;
    var admin = accounts[0];
    var user = accounts[1];
    var tokenInstance;
    before(async () => {
        pmInstance = await PasswordManager.deployed()
    })
    it('deploys successfully', function(){
        return PasswordManager.deployed().then(function(instance){
            const address = instance.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
    });

   it('initializes the contract with the correct values',function(){
        return PasswordManager.deployed().then(function(instance){
            pmInstance = instance;
            return pmInstance.revealValue();
        }).then(function(value){
            assert.equal(value.toNumber(),1,'Has the correct reveal value');
        });
    });

    it('creates credentials', function() {
        return SwapToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return pmInstance.createCredential("password",{ from: admin });
        }).then(function(result){
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), 1, 'id is correct');
            assert.equal(event.value, 'password', 'credential value is correct');
            assert.equal(event.owner, admin , 'owner is correct');
            assert.equal(event.isDeleted, false, 'credential Exists');
            return pmInstance.credentialCount() ;
        }).then(function(count){
            assert.equal(count.toNumber(), 1, "One credential created");
            return tokenInstance.balanceOf(admin);
        }).then(function(balance){
            assert(balance >= 1,"Balance is enough");
        })  
        
      });
});

/*
sti = await SwapToken.deployed()
accs= await web3.eth.getAccounts()
a1 = accs[0]
pmi = await PasswordManager.deployed()
pmi.createCredential('hello',{from:a1})
b1 = await sti.balanceOf(a1)
b1.toNumber()
*/