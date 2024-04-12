// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721A} from "erc721a/contracts/IERC721A.sol";

/**
 * @title IExomoonERC721 Interface
 * @dev This interface extends the IERC721A interface and includes additional functions specific to the Exomoon ERC721 token.
 */
interface IExomoonERC721 is IERC721A {
    /**
     * @dev Enum representing the different modes for the token URI.
     */
    enum TokenUriMode {
        /**
         * @dev Pre-reveal mode, where the token URI is set to a pre-reveal URI, without the token ID nor the extension and/or token data.
         */
        Prereveal,
        /**
         * @dev Default mode, where the token URI is set to the base URI, followed by the token ID and the extension.
         */
        Default,
        /**
         * @dev Mint data mode, where the token URI is set to the base URI, followed by the token ID, the extension, and the token data.
         */
        MintData
    }

    /**
     * @dev This error is thrown when the maximum supply of tokens is exceeded.
     */
    error MaxSupplyExceeded();

    /**
     * @dev Error thrown when the contract is paused, and the called function is not allowed to execute.
     */
    error Paused();

    /**
     * @dev Error thrown when the caller does not have enough funds to execute the function.
     */
    error InsufficientFunds();

    /**
     * @dev Error thrown when the data length is invalid.
     */
    error InvalidDataLength();

    /**
     * @dev This function returns the maximum supply of tokens.
     * @return uint256 The maximum supply of tokens.
     */
    function maxSupply() external view returns (uint256);

    /**
     * @dev Gets the current paused state. When paused, minting is not allowed.
     */
    function paused() external view returns (bool);

    /**
     * @dev This function sets the paused state of the contract.
     * @param _paused The new paused state of the contract.
     */
    function setPaused(bool _paused) external;

    /**
     * @dev This function returns the token URI mode.
     * @return TokenUriMode The token URI mode.
     */
    function tokenUriMode() external view returns (TokenUriMode);

    /**
     * @dev This function sets the token URI mode.
     * @param _mode The new token URI mode.
     */
    function setTokenUriMode(TokenUriMode _mode) external;

    /**
     * @dev This function returns the pre-reveal URI.
     * @return string The pre-reveal URI.
     */
    function prerevealUri() external view returns (string memory);

    /**
     * @dev This function sets the pre-reveal URI.
     * @param _newPrerevealUri The new pre-reveal URI.
     */
    function setPrerevealUri(string memory _newPrerevealUri) external;

    /**
     * @dev Gets the price of the token.
     * @return uint256 The price of the token.
     */
    function price() external view returns (uint256);

    /**
     * @dev Sets the price of the token.
     * @param _newPrice The new price of the token.
     */
    function setPrice(uint256 _newPrice) external;

    /**
     * @dev This function returns the base URI for the token.
     * @return string The base URI for the token.
     */
    function baseUri() external view returns (string memory);

    /**
     * @dev This function returns the URI suffix for the token.
     * @return string The URI suffix for the token.
     */
    function uriSuffix() external view returns (string memory);

    /**
     * @dev Sets the base URI for the token.
     * @param _newBaseUri The new base URI for the token.
     */
    function setBaseUri(string memory _newBaseUri) external;

    /**
     * @dev This function sets the URI suffix for the token.
     * @param _newUriSuffix The new URI suffix for the token.
     */
    function setUriSuffix(string memory _newUriSuffix) external;

    /**
     * @dev This function mints a specified amount of tokens for a specified address.
     * @param _to The address to mint the tokens to.
     * @param _amount The amount of tokens to mint.
     * @param _data Additional data to pass to the mint
     */
    function mintForAddress(address _to, uint256 _amount, bytes memory _data) external payable;

    /**
     * @dev This function mints a specified amount of tokens.
     * @param _amount The amount of tokens to mint.
     * @param _data Additional data to pass to the minted token.
     */
    function mint(uint256 _amount, bytes memory _data) external payable;

    /**
     * @dev This function returns the data associated with the token ID.
     * @param _tokenId The token ID to get the data for.
     * @return bytes The data associated with the token ID.
     */
    function getTokenData(uint256 _tokenId) external view returns (bytes memory);

    /**
     * @dev This function allows the owner to withdraw funds from the contract.
     */
    function withdraw() external;
}
