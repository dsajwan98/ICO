pragma solidity >=0.4.21 <0.7.0;

import "./SwapToken.sol";
import "./SwapTokenSale.sol";

contract PasswordManager {
    SwapToken public tokenContract;
    address payable receiver;
    uint256 public revealValue;
    uint256 public credentialCount;
    mapping(uint => Credential) public credentials;
    bool public transferred;

    struct Credential {
        uint id;
        string credentialValue;
        address payable owner;
        bool isDeleted;
    }

    event credentialCreated(
        uint id,
        string value,
        address payable owner,
        bool isDeleted
    );

    constructor(SwapToken _tokenContract,uint256 _value) public{
        tokenContract = _tokenContract;
        receiver = msg.sender;
        revealValue = _value;
    }

    function createCredential(string memory _value) public {
        // Require a valid credential value
        require(bytes(_value).length > 0,"Must have some data");
        require(tokenContract.balanceOf(msg.sender) >= revealValue,"Admin must possess more tokens than demanded");
        require(tokenContract.transferToCreate(address(tokenContract),revealValue,msg.sender),"Must transfer the requested tokens");
        // Increment credential count
        credentialCount ++;
        // Create the credential
        credentials[credentialCount] = Credential(credentialCount,_value, msg.sender, false);
        // Trigger an event
        emit credentialCreated(credentialCount, _value, msg.sender, false);
    }
}