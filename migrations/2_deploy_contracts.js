const Destructible = artifacts.require('../contracts/common/Destructible.sol');
const Remittance = artifacts.require('../contracts/Remittance.sol');

module.exports = (deployer) => {
    deployer.deploy(Destructible);
    deployer.deploy(Remittance);
}