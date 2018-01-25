const HDWalletProvider = require('truffle-hdwallet-provider')
const fs = require('fs')

let secrets
let mnemonic = ''

if (fs.existsSync('./secrets.json')) {
  secrets = require('./secrets.json')
  mnemonic = secrets.mnemonic
}

module.exports = {
  networks: {
    development: {
      provider: new HDWalletProvider(mnemonic, 'http://localhost:8545'),
      gas: 4500000,
      gasPrice: 25000000000,
      network_id: '*' // Match any network id
    },
    rinkeby: {
      provider: new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io'),
      network_id: '*',
      gas: 4500000,
      gasPrice: 25000000000
    }
  }
}
