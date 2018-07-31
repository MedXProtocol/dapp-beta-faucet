const Eth = require('ethjs')
const abi = require('ethjs-abi')
const SignerProvider = require('ethjs-provider-signer')
const sign = require('ethjs-signer').sign
const privateToAccount = require('ethjs-account').privateToAccount
const betaFaucetArtifact = require("../../../build/contracts/BetaFaucet.json")

function fail(msg) {
  throw new Error(msg)
}

export class FaucetClient {
  constructor (config = {}) {
    this._privateKey = config.privateKey || fail('You must configure the private key for the owner of the contract')

    if (this._privateKey.length !== 66)
      fail('privateKey is not the correct length (May need the leading "0x")')

    this._providerUrl = config.providerUrl || fail('You must pass a provider URL')
    this._networkId = config.networkId || fail('You must pass a network id')
    this._account = privateToAccount(this._privateKey)
    this._eth = new Eth(new Eth.HttpProvider(this._providerUrl))

    console.log('Using `this._privateKey`: ', this._privateKey)
    console.log('Using `this._providerUrl`: ', this._providerUrl)
    console.log('Using: `this._networkId`', this._networkId)

    if (
      betaFaucetArtifact === undefined
      || betaFaucetArtifact.networks[this._networkId] === undefined
    ) {
      fail('could not find betaFaucetArtifact (may need to run `npm run migrate` ?)')
    }
  }

  ownerAddress() {
    return this._account.address
  }

  deployedBetaFaucetContractAddress () {
    return betaFaucetArtifact.networks[this._networkId].address
  }

  buildTransaction(data) {
    // You may want to calculate GasPrice automatically using a
    // gas station API, or simply use more gwei for your GasPrice
    // (since it's only Ropsten/Rinkeby testnet)
    return {
      from: this.ownerAddress(),
      to: this.deployedBetaFaucetContractAddress(),
      gas: 4612388,
      gasPrice: Eth.toWei(20, 'gwei').toString(),
      data
    }
  }

  async sendTransaction (tx) {
    let nonce = tx.nonce
    if (!nonce) {
      nonce = await this._eth.getTransactionCount(this._account.address, 'pending')
      tx.nonce = nonce.toString()
    }

    for (let i = 0; i < 20; i++) {
      console.log('running sendTransaction')

      try {
        return await this._eth.sendRawTransaction(sign(tx, this._account.privateKey))
      } catch (error) {
        if (error.message.match(/known transaction|transaction underpriced/)) {
          tx.nonce++
          console.log(`retry: ${i+1}`)
        } else {
          console.error(error)
          throw error
        }
      }
    }
  }

  sendEther (ethAddress) {
    const method = betaFaucetArtifact.abi.find((obj) => obj.name === 'sendEther')
    var data = abi.encodeMethod(method, [ethAddress, Eth.toWei('1', 'ether')])
    const tx = this.buildTransaction(data)

    // console.info('sendEther tx: ', tx)

    return this.sendTransaction(tx)
  }

  sendYTKN (ethAddress) {
    const method = betaFaucetArtifact.abi.find((obj) => obj.name === 'sendYTKN')
    // Eth.toWei() with 'ether' as second argument simply returns a number
    // in this case, it would be 500 YTKN
    var data = abi.encodeMethod(method, [ethAddress, Eth.toWei('500', 'ether')])
    const tx = this.buildTransaction(data)

    console.info('sendYTKN tx: ', tx)

    return this.sendTransaction(tx)
  }
}
