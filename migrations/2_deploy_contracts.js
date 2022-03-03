var CryptoTestamentService = artifacts.require("CryptoTestamentService");

module.exports = function (deployer) {
  return deployer.deploy(CryptoTestamentService);
};