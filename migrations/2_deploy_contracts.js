const SwapToken = artifacts.require("./SwapToken.sol");
const SwapTokenSale = artifacts.require("./SwapTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(SwapToken,1000000).then(function(){
    var tokenPrice = 1000000000000000;
    return deployer.deploy(SwapTokenSale,SwapToken.address,tokenPrice);
  });
  
};
