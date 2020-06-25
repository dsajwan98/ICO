const SwapToken = artifacts.require("./SwapToken.sol");
const SwapTokenSale = artifacts.require("./SwapTokenSale.sol");
const PasswordManager = artifacts.require("./PasswordManager.sol");
const CredentialPairs = artifacts.require("./CredentialPairs.sol");


module.exports = (deployer) => {
  var revealValue = 1;
  deployer.deploy(SwapToken,1000000).then(function() {
    var tokenPrice = 1000000000000000;
    return deployer.deploy(SwapTokenSale,SwapToken.address,tokenPrice);
  }).then(function(){
    return deployer.deploy(PasswordManager,SwapToken.address,SwapTokenSale.address,revealValue);
  }).then(function(){
    return deployer.deploy(CredentialPairs,SwapToken.address,SwapTokenSale.address,revealValue);
  })
};
