pragma solidity >=0.4.21 <0.7.0;

import "./SwapToken.sol";

contract SwapTokenSale{
    address admin;
    SwapToken public tokenContract;
    uint256 public tokenPrice;

    constructor(SwapToken _tokenContract, uint256 _tokenPrice) public{
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }
}
