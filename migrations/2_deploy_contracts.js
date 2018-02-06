var Health = artifacts.require('./Health.sol')

// module.exports = function(deployer) {
//   deployer.deploy(Health)
// }

module.exports = function(deployer) {
  // Pass 42 to the contract as the first constructor parameter
  deployer.deploy(Health, {privateFor: ["ROAZBWtSacxXQrOe3FGAqJDyJjFePR5ce4TSIzmJ0Bc="]})
};