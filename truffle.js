// const HDWalletProvider = require('truffle-hdwallet-provider')
const fs = require('fs')
const providerUrl =  'http://localhost:8545' //'https://rinkeby.infura.io:443' 
const WalletProvider = require("truffle-wallet-provider");

//const keystore = {"address":"03e277534906765629a2b278aff9a5cfb895045a","crypto":{"cipher":"aes-128-ctr","ciphertext":"d778a596cab2228a2d616c2f7d0dac085b9e414318f86015ee30bb30b414c3d4","cipherparams":{"iv":"28164b188a7a01e1c08053d9b327df83"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"f51a58f94bd8336aea99b2f6086e24be364a5c0c1ea6991c4da3d5e985c637ad"},"mac":"cd52f7bbef82d99dca48af290c43b61a47fc13ba3f426ce0e78b9295ffcdce66"},"id":"32ba9b01-b8c1-488d-85ac-70818b94275d","version":3}
const keystore = {"address":"82b4ac04e5c998f7a87887db4fc8881ddbf02435","crypto":{"cipher":"aes-128-ctr","ciphertext":"0d67e68761151e316ff9f92e3daf3bf73a94132685b7d10eb526f63e06c46476","cipherparams":{"iv":"c84955deb209ad0ea499180181606f94"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"aa540d6b111c91853ddc47a9cd4d2f207f6d9a9e026f94eb12b6d9162837b7be"},"mac":"7dc661adb33bf041067290642026631346f1034f86379bcb92d96e75b29e8ffb"},"id":"f1acc34d-6a3c-4d4d-ad19-80fc9ab09d5d","version":3}
var wallet = require('ethereumjs-wallet').fromV3(keystore,'');
// const provider = new WalletProvider(wallet, providerUrl)

let secrets
let mnemonic = ''

if (fs.existsSync('./secrets.json')) {
  secrets = require('./secrets.json')
  mnemonic = secrets.mnemonic
}

module.exports = {
  networks: {
    // For local
     development: {
      provider: new WalletProvider(wallet, providerUrl),
      network_id: '*',
      gas: 4500000,
      gasPrice: 25000000000
    }
    // For Private Quorum 
    //development: {
     // host: "54.214.107.168",
     // port: 8545, // was 8545
     // network_id: "*", // Match any network id
     // gasPrice: 0,
     // gas: 450000000
    //},
    // rinkeby: {
    //   provider: new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io'),
    //   network_id: '*',
    //   gas: 4500000,
    //   gasPrice: 25000000000
    // }
  }
}
