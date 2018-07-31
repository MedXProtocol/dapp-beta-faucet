pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";

contract YTKNToken is MintableToken {
  string public constant name = "Your Token";
  string public constant symbol = "YTKN";
  uint8 public constant decimals = 18;
}
