pragma solidity >=0.4.21 <0.7.0;

import "./SwapToken.sol";
import "./SwapTokenSale.sol";

contract CredentialPairs {
    SwapToken public tokenContract;
    SwapTokenSale public tokenSaleContract;
    uint256 public revealValue;
    uint256 public credentialPairCount;
    mapping(uint => CredentialPair) public credentialPairs;

    struct CredentialPair {
        string accountName;
        string key;
        string value;
        address payable owner;
        bool isDeleted;
    }

    event credentialPairCreated(
        string accountName,
        string key,
        string value,
        address payable owner,
        bool isDeleted
    );

    constructor(SwapToken _tokenContract,SwapTokenSale _tokenSaleContract,uint256 _value) public{
        tokenContract = _tokenContract;
        tokenSaleContract = _tokenSaleContract;
        revealValue = _value;
    }

    function createCredentialPair(string memory _accountName, string memory _key, string memory _value ) public{
        // Require a valid credential value
        require(bytes(_accountName).length > 0,"Must have some data");
        require(bytes(_key).length > 0,"Must have some data");
        require(bytes(_value).length > 0,"Must have some data");
        require(tokenContract.balanceOf(msg.sender) >= revealValue,"Admin must possess more tokens than demanded");
        require(tokenContract.transferTokens(address(tokenSaleContract),revealValue,msg.sender),"Must transfer the requested tokens");
        // Increment credential count
        credentialPairCount ++;
        // Create the credential
        credentialPairs[credentialPairCount] = CredentialPair(_accountName,_key, _value, msg.sender, false);
        // Trigger an event
        emit credentialPairCreated(_accountName,_key, _value, msg.sender, false);
    }

    function revealCredentialPair() public returns (bool){
        require(tokenContract.balanceOf(msg.sender) >= revealValue,"Admin must possess more tokens than demanded");
        require(tokenContract.transferTokens(address(tokenSaleContract),revealValue,msg.sender),"Must transfer the requested tokens");
        return true;
    }
}