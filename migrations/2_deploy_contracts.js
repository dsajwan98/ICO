const CrapToken = artifacts.require("./CrapToken.sol");

module.exports = function(deployer) {
  deployer.deploy(CrapToken,1000000);
};
