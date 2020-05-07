pragma solidity >=0.4.21 <0.7.0;

import "./SwapToken.sol";

contract SwapTokenSale{
    address payable admin;
    SwapToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(SwapToken _tokenContract, uint256 _tokenPrice) public{
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x,"Valid Multiplication");
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice),"Value of Tokens");
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens,"Admin must possess more tokens than demanded");
        require(tokenContract.transfer(msg.sender, _numberOfTokens),"Must transfer the requested tokens");

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin,"Only admin must end the sale");
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))),"Transfer back the Available tokens");

        selfdestruct(admin);
    }
}
