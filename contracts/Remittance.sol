pragma solidity ^0.4.23;

import './common/Destructible.sol';

contract Remittance is Destructible {

    uint public commissionPercentage = 0;

    mapping (bytes32=>uint) public remittances;

    event LogOwnerWithdrawal();
    event LogCommissionChange(uint commissionPercentage);
    event LogRemittanceClaim(address exchange, uint amount, address from, address recepient);
    event LogRemittance(address sender, address exchange, address recepient);

    function addRemittance(address _exchange, bytes32 _password, address _recepient) public payable {
        require(msg.value > 0);
        require(_exchange != address(0));
        require(_exchange != _recepient);
        require(_exchange != msg.sender);
        require(_exchange != owner);
        require(_recepient != address(0));
        require(msg.sender != _recepient);
        require(msg.sender != owner);

        bytes32 remitKey = keccak256(abi.encodePacked(_exchange, _password, msg.sender, _recepient));

        remittances[remitKey] = msg.value;

        emit LogRemittance(msg.sender, _exchange, _recepient);
    }

    function withdraw(bytes32 _recepientPassword, address _from, address _recepient) public {
        bytes32 key = keccak256(abi.encodePacked(msg.sender, _recepientPassword, _from, _recepient));
        uint value = remittances[key];
        
        require(value > 0);
        
        remittances[key] -= value;

        uint commission = (value * commissionPercentage) / 100;
        value -= commission;

        emit LogRemittanceClaim(msg.sender, value, _from, _recepient);

        msg.sender.transfer(value);
    }

    function ownerWithdraw() public onlyOwner {
        require(address(this).balance > 0);

        emit LogOwnerWithdrawal();

        owner.transfer(address(this).balance);
    }

    function setCommissionPercentage(uint _comm) public onlyOwner {
        commissionPercentage = _comm;

        emit LogCommissionChange(_comm);
    }

    function getValue(bytes32 key) public view returns (uint) {
        return remittances[key];
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }
}