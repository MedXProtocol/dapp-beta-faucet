const expectThrow = require('./helpers/expectThrow')
const YTKNToken = artifacts.require("./YTKNToken.sol")
const BetaFaucetArtifact = artifacts.require('./BetaFaucet.sol')

contract('BetaFaucet', function (accounts) {
  let recipient = accounts[1]
  let recipient2 = accounts[2]
  let recipient3 = accounts[3]

  let ytknTokenInstance, betaFaucetInstance

  before(async () => {
    ytknTokenInstance = await YTKNToken.new()
    betaFaucetInstance = await BetaFaucetArtifact.new()

    await betaFaucetInstance.initialize(ytknTokenInstance.address)
  })

  describe('initialize()', () => {
    it('should not be called again', async () => {
      await expectThrow(async () => {
        await betaFaucetInstance.initialize()
      })
    })
  })

  describe('withdrawEther()', () => {
    it('should work', async () => {
      await betaFaucetInstance.send(web3.toWei(20, "ether"))

      const ownerAddress = await betaFaucetInstance.owner.call()

      assert(await web3.eth.getBalance(betaFaucetInstance.address), web3.toWei(20, "ether"))
      assert(await web3.eth.getBalance(ownerAddress), 0)

      await betaFaucetInstance.withdrawEther()
      const ownerBalance = await web3.eth.getBalance(ownerAddress)

      // 1000000 is gas amount in wei
      assert(ownerBalance, web3.toWei(20, "ether") - 1000000)
    })
  })

  describe('sendEther()', () => {
    it('should work', async () => {
      await betaFaucetInstance.send(web3.toWei(20, "ether"))
      const recipientBalance = await web3.eth.getBalance(recipient)
      await betaFaucetInstance.sendEther(recipient, web3.toWei(0.2, "ether"))
      const newRecipientBalance = await web3.eth.getBalance(recipient)
      assert.equal(
        newRecipientBalance.toString(),
        recipientBalance.add(web3.toWei(0.2, "ether")).toString()
      )
    })

    it('should not allow double sends', async () => {
      await betaFaucetInstance.send(web3.toWei(200, "ether"))
      await betaFaucetInstance.sendEther(recipient2, web3.toWei(1, "ether"))
      await expectThrow(async () => {
        await betaFaucetInstance.sendEther(recipient2, web3.toWei(1, "ether"))
      })
    })

    it('should prevent an amount above the limit', async () => {
      await betaFaucetInstance.send(web3.toWei(200, "ether"))
      await expectThrow(async () => {
        await betaFaucetInstance.sendEther(recipient3, web3.toWei(30, "ether"))
      })
    })
  })

  describe('sendYTKN()', () => {
    it('should work', async () => {
      env.ytknTokenInstance.mint(betaFaucetInstance.address, 3000000)
      const betaFaucetDelegateYTKNBalance = await env.ytknTokenInstance.balanceOf(betaFaucetInstance.address)
      assert.equal(betaFaucetDelegateYTKNBalance, 3000000)

      const recipientsYtknBalance = await env.ytknTokenInstance.balanceOf(recipient)
      assert.equal(recipientsYtknBalance, 0)

      await betaFaucetInstance.sendYTKN(recipient, 15)
      const recipientsNewYtknBalance = await env.ytknTokenInstance.balanceOf(recipient)
      assert.equal(recipientsNewYtknBalance, 15)
    })

    it('should not allow double sends', async () => {
      await betaFaucetInstance.sendYTKN(recipient2, 15)
      expectThrow(async () => {
        await betaFaucetInstance.sendYTKN(recipient2, 15)
      })
    })
  })
})
