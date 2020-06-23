const SwapToken = artifacts.require("./SwapToken.sol");
const SwapTokenSale = artifacts.require("./SwapTokenSale.sol");
const PasswordManager = artifacts.require("./PasswordManager.sol");

module.exports = (deployer) => {
  deployer.deploy(SwapToken,1000000).then(function() {
    var tokenPrice = 1000000000000000;
    return deployer.deploy(SwapTokenSale,SwapToken.address,tokenPrice);
  }).then(function(){
    var revealValue = 1;
    return deployer.deploy(PasswordManager,SwapToken.address,revealValue);
  })
};
