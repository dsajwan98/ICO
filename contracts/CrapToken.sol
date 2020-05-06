pragma solidity >=0.4.21 <0.7.0;

contract CrapToken{
    //Name of token
    string public name = 'Crap Token';
    //Symbol
    string public symbol = 'Crap';
    //Version
    string public standard = 'Crap Token v1.0';
    //Variables
    uint256 public totalSupply;
    mapping(address=>uint256) public balanceOf;
    //Constructor
    constructor(uint256 _initialSupply) public{
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }
    //Set Tokens
    //Read the number of Tokens
}