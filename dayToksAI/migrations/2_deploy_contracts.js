const Subastas = artifacts.require("Subastas");
const DayToksContract = artifacts.require("Daytoks");

module.exports = function(deployer) {
  deployer.deploy(Subastas);
  deployer.deploy(DayToksContract);
};
