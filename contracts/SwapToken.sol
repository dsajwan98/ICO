pragma solidity >=0.4.21 <0.7.0;

contract SwapToken{
    //Name of token
    string public name = 'Swap Token';
    //Symbol
    string public symbol = 'Swap';
    //Version
    string public standard = 'Swap Token v1.0';
    //Variables
    uint256 public totalSupply;
    mapping(address=>uint256) public balanceOf;
    mapping(address=>mapping(address=>uint256)) public allowance;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
    //Constructor
    constructor(uint256 _initialSupply) public{
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        //Exception if account doesn't have enough token
        require(balanceOf[msg.sender]>=_value,"Enough Token");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender,_to,_value);
        return true;
    }

    //approve
    function approve(address _spender, uint256 _value) public returns (bool success){
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender,_spender,_value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from],"Must send tokens within the balance limit");
        require(_value <= allowance[_from][msg.sender],"Must not send more than allowed");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);

        return true;
    }

    function transferTokens(address _to, uint256 _value, address owner) public returns (bool success) {
        //Exception if account doesn't have enough token
        require(balanceOf[owner]>=_value,"Enough Token");
        balanceOf[owner] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(owner,_to,_value);
        return true;
    }
}