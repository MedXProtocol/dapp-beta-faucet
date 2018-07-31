/*https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/test/helpers/expectThrow.js*/

import assert from "assert"

module.exports = async fxn => {
  try {
    await fxn()
  } catch (error) {
    // TODO: Check jump destination to distinguish between a throw and an actual invalid jump.
    const invalidOpcode = error.message.search('invalid opcode') >= 0
    // TODO: When contract A calls contract B, and B throws, instead
    //       of an 'invalid jump', we get an 'out of gas' error. How do
    //       we distinguish this from an actual out of gas event? (The
    //       testrpc log actually show an 'invalid jump' event.)
    const outOfGas = error.message.search('out of gas') >= 0
    const revert = error.message.search('revert') >= 0
    assert(
        invalidOpcode || outOfGas || revert,
        "Expected throw, got '" + error + "' instead",
    )
    return
  }
  assert(false, 'Expected throw not received')
}
