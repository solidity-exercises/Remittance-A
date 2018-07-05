pragma solidity ^0.4.18;

contract Keccak256 {
	function encodeKey(
		address _exchange,
		bytes32 _password,
		address _sender,
		address _recepieny
	)
		public
		pure
		returns
		(bytes32) 
	{
		return keccak256(abi.encodePacked(_exchange, _password, _sender, _recepieny));
	}
}