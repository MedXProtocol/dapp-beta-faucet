let BetaFaucet = artifacts.require("./BetaFaucet.sol");
let YTKNToken = artifacts.require("./YTKNToken.sol");

module.exports = function(deployer) {
  deployer.deploy(BetaFaucet);
  deployer.deploy(YTKNToken);
};
