pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Initializable.sol";
import "./YourToken.sol";

contract BetaFaucet is Ownable, Initializable {
  // Keep track of which Ethereum addresses we've sent Ether and our YTKN ERC20 token to
  mapping (address => bool) public sentEtherAddresses;
  mapping (address => bool) public sentYTKNAddresses;

  // Amount of gas we want to account for when doing require() checks
  uint256 public constant gasAmount = 1000000;

  event EtherSent(address indexed recipient, uint256 value);
  event YTKNSent(address indexed recipient, uint256 value);

  // A reference to your deployed token contract
  YourToken public yourToken;

  // Provides a better way to do calculations via .add(), .sub(), etc.
  using SafeMath for uint256;

  // Constructor which allows us to fund contract on creation
  constructor() public payable {
  }

  // `fallback` function called when eth is sent to this contract
  function () payable {
  }

  /**
   * @dev - Creates a new BetaFaucet contract with the given parameters
   * @param _yourToken - the address of the previously deployed YTKN token contract
   */
  function initialize(YourToken _yourToken) external notInitialized {
    setInitialized();
    owner = msg.sender;
    yourToken = _yourToken;
  }

  function withdrawEther() external onlyOwner {
    owner.transfer(address(this).balance.sub(gasAmount));
  }

  function sendEther(address _recipient, uint256 _amount) public onlyOwner {
    require(_recipient != address(0), "recipient address is empty");
    require(!sentEtherAddresses[_recipient], "recipient has already received ether");
    require(_amount > 0, "amount must be positive");
    require(_amount <= 1 ether, "amount must be below the upper limit");
    require(address(this).balance >= _amount.add(gasAmount), "contract is out of ether!");

    sentEtherAddresses[_recipient] = true;
    emit EtherSent(_recipient, _amount);

    _recipient.transfer(_amount);
  }

  function sendYTKN(address _recipient, uint256 _amount) public onlyOwner {
    require(_recipient != address(0), "recipient address is empty");
    require(!sentYTKNAddresses[_recipient], "recipient has already received YTKN");
    require(_amount > 0, "amount must be positive");
    require(_amount <= 500 ether, "amount must be below the upper limit");
    require(yourToken.balanceOf(address(this)) >= _amount, "contract is out of YTKN!");

    sentYTKNAddresses[_recipient] = true;
    emit YTKNSent(_recipient, _amount);

    yourToken.transfer(_recipient, _amount);
  }
}
