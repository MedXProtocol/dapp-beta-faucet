import 'idempotent-babel-polyfill'
import Eth from 'ethjs'
import { FaucetClient } from './lib/FaucetClient'

const faucetClient = new FaucetClient({
  privateKey: process.env.LAMBDA_CONFIG_PRIVKEY,
  providerUrl: process.env.LAMBDA_CONFIG_PROVIDER_URL,
  networkId: process.env.LAMBDA_CONFIG_NETWORK_ID
})

exports.handler = function (event, context, callback) {
  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.LAMBDA_CONFIG_CORS_ORIGIN
  }

  try {
    let ethAddress

    if (event.queryStringParameters !== null && event.queryStringParameters !== undefined) {
      if (event.queryStringParameters.ethAddress !== undefined &&
        event.queryStringParameters.ethAddress !== null &&
        event.queryStringParameters.ethAddress !== "") {
        ethAddress = event.queryStringParameters.ethAddress;
      }
    }

    console.log('Sending Ether to ', ethAddress)

    if (!Eth.isAddress(ethAddress)) {
      callback(`ethAddress is not a valid address: ${ethAddress}`)
    } else {
      faucetClient.sendEther(ethAddress)
        .then((transactionHash) => {
          console.log('Successfully sent transaction with hash: ', transactionHash)
          callback(null, {
            statusCode: 200,
            body: JSON.stringify({ txHash: transactionHash }),
            headers: responseHeaders
          })
        })
        .catch(error => {
          console.error('ERROR: ', error)
          callback(error)
        })
    }

  } catch (error) {
    console.error('MASSIVE ERROR: ', error)
    callback(error)
  }
}
