pragma solidity >=0.4.21 <0.7.0;

contract PasswordManager{
    uint256 public revealValue;
    uint256 public credentialCount;
    mapping(uint => Credential) public credentials;

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

    constructor(uint256 _value) public{
        revealValue = _value;
    }

    function createCredential(string memory _value) public {
        // Require a valid credential value
        require(bytes(_value).length > 0,"Must have some data");
        // Increment credential count
        credentialCount ++;
        // Create the credential
        credentials[credentialCount] = Credential(credentialCount,_value, msg.sender, false);
        // Trigger an event
        emit credentialCreated(credentialCount, _value, msg.sender, false);
    }
}