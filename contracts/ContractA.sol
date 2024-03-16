// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ContractA
 * @dev This contract allows for storage and retrieval of a single uint256 value.
 */
contract ContractA {
    // The stored value
    uint256 public value;

    /**
     * @dev Sets the value of the stored `value`.
     * @param _value The value to set `value` to.
     */
    function setValue(uint256 _value) public {
        value = _value;
    }

    function helloWorldFunction() public pure returns (string memory) {
        return "Hello, World!";
    }
}
