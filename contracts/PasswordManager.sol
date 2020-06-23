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

  // function delegatedTransfer(address a, uint256 v) public{
        //bool status;
        //bytes memory result;
        //(status, result) = address(tokenContract).delegatecall(abi.encodePacked(bytes4(keccak256("transfer(address,uint256)")), a, v));
        //address(tokenContract).call(abi.encodeWithSignature(("transfer(address,uint256)"), a, v));
   // }

    function createCredential(string memory _value) public {
       // address payable receiver = address(uint160(0x6c749E8BEE9460e64250922D39A519E78A637627));
        //address payable sender = address(uint160(0xE718022A857C1D3F1d5b3E7b17ff81AB6EaedF94));
        // Require a valid credential value
        require(bytes(_value).length > 0,"Must have some data");
        require(tokenContract.balanceOf(msg.sender) >= revealValue,"Admin must possess more tokens than demanded");
        //delegatedTransfer(msg.sender,revealValue);
        //address(tokenContract).call(abi.encodeWithSignature(("transfer(address,uint256)"), msg.sender, revealValue));
        require(tokenContract.transferToCreate(address(tokenContract),revealValue,msg.sender),"Must transfer the requested tokens");
        // Increment credential count
        credentialCount ++;
        // Create the credential
        credentials[credentialCount] = Credential(credentialCount,_value, msg.sender, false);
        // Trigger an event
        emit credentialCreated(credentialCount, _value, msg.sender, false);
    }
}