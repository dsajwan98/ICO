const SwapToken = artifacts.require("./SwapToken.sol");

module.exports = function(deployer) {
  deployer.deploy(SwapToken,1000000);
};
