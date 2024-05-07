// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721A} from "erc721a/contracts/IERC721A.sol";
import {ERC721A} from "erc721a/contracts/ERC721A.sol";
import {IExomoonERC721} from "./IExomoonERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

// TODO: Handle price and funds

/**
 * @title ExomoonERC721 Contract
 * @dev This contract represents the base ERC721 Exomoon implementation. It extends the `ERC721A` contract.
 */
contract ExomoonERC721 is ERC721A, Ownable, IExomoonERC721 {
    uint256 private _maxSupply;

    bool private _paused = true;
    uint256 private _price;

    TokenUriMode internal _tokenUriMode = TokenUriMode.Default;
    string private _baseUri = "";
    string private _uriSuffix = ".json";
    string private _prerevealUri = "";

    bytes4 private constant _INTERFACE_ID_EXOMOON_ERC721 = type(IExomoonERC721).interfaceId;

    mapping(uint256 => bytes) private _tokenData;

    /**
     * @dev Constructor function that sets the name, symbol, and maximum supply of the token.
     * @param _name The name of the token.
     * @param _symbol The symbol of the token.
     * @param _maxSupplyVal The maximum supply of the token.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupplyVal
    ) ERC721A(_name, _symbol) Ownable(msg.sender) {
        _maxSupply = _maxSupplyVal;
    }

    /**
     * @dev Modifier that checks if the minting operation would exceed the maximum supply of tokens.
     * @param _mintAmount The amount of tokens to mint.
     */
    modifier canMint(uint256 _mintAmount) {
        if (_maxSupply > 0 && totalSupply() + _mintAmount > _maxSupply) {
            revert MaxSupplyExceeded();
        }
        _;
    }

    /**
     * @dev Modifier that checks if the contract is not paused.
     */
    modifier active() {
        if (_paused) {
            revert Paused();
        }
        _;
    }

    function _checkFunds(uint256 _minimumFunds) internal view {
        // Checks funds. If owner is the caller, no need to check funds.
        if (msg.sender != owner()) {
            if (msg.value < _minimumFunds) {
                revert InsufficientFunds();
            }
        }
    }

    /**
     * @dev Modifier that checks if the caller has sent enough funds to execute the function.
     * @param _amount The amount of funds required.
     */
    modifier enoughFunds(uint256 _amount) {
        if (msg.value < _price * _amount) {
            revert InsufficientFunds();
        }
        _;
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function maxSupply() external view override returns (uint256) {
        return _maxSupply;
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function paused() external view override returns (bool) {
        return _paused;
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function setPaused(bool _pausedVal) public override onlyOwner {
        _paused = _pausedVal;
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function tokenUriMode() external view override returns (TokenUriMode) {
        return _tokenUriMode;
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function setTokenUriMode(TokenUriMode _mode) external override onlyOwner {
        _tokenUriMode = _mode;
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function prerevealUri() external view override returns (string memory) {
        return _prerevealUri;
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function setPrerevealUri(string memory _newPrerevealUri) external override onlyOwner {
        _prerevealUri = _newPrerevealUri;
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function price() external view override returns (uint256) {
        return _price;
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function setPrice(uint256 _newPrice) public override onlyOwner {
        _price = _newPrice;
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function baseUri() external view override returns (string memory) {
        return _baseUri;
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function uriSuffix() external view override returns (string memory) {
        return _uriSuffix;
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function setBaseUri(string memory _newBaseUri) external override onlyOwner {
        _baseUri = _newBaseUri;
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function setUriSuffix(string memory _newUriSuffix) external override onlyOwner {
        _uriSuffix = _newUriSuffix;
    }

    /**
     * @dev Internal function that sets the token data.
     * @param _tokenId The id of the token.
     * @param _data The data to set.
     */
    function _setTokenData(uint256 _tokenId, bytes memory _data) internal virtual {
        _tokenData[_tokenId] = _data;
    }

    /**
     * @dev Internal function that processes the token data.
     * @param _amount The amount of tokens to mint.
     * @param _data The data to process.
     */
    function _processTokenData(uint256 _amount, bytes memory _data) internal virtual {
        for (uint256 i = 0; i < _amount; i++) {
            if (_data.length > 0) {
                _setTokenData(_nextTokenId() + i, _data);
            }
        }
    }

    /**
     * Internal function that mints a specified amount of tokens for a specified address.
     * @param _to The address to mint the tokens for.
     * @param _amount The amount of tokens to mint.
     * @param _data Additional data to pass to the mint
     */
    function _mintForAddress(address _to, uint256 _amount, bytes memory _data) internal virtual canMint(_amount) {
        _processTokenData(_amount, _data);
        _mint(_to, _amount);
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function mintForAddress(
        address _to,
        uint256 _amount,
        bytes memory _data
    ) external payable virtual override active enoughFunds(_amount) {
        _mintForAddress(_to, _amount, _data);
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function mint(uint256 _amount, bytes memory _data) external payable virtual override active enoughFunds(_amount) {
        _mintForAddress(msg.sender, _amount, _data);
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function getTokenData(uint256 _tokenId) public view virtual override returns (bytes memory) {
        return _tokenData[_tokenId];
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        // solhint-disable-next-line
        require(success);
    }

    function tokenURI(uint256 _tokenId) public view virtual override(ERC721A, IERC721A) returns (string memory) {
        if (_tokenUriMode == TokenUriMode.Prereveal) {
            return _prerevealUri;
        } else if (_tokenUriMode == TokenUriMode.Default) {
            return string(abi.encodePacked(_baseUri, Strings.toString(_tokenId), _uriSuffix));
        } else if (_tokenUriMode == TokenUriMode.MintData) {
            return
                string(
                    abi.encodePacked(
                        this.baseUri(),
                        _bytesToHex(getTokenData(_tokenId)),
                        "/",
                        Strings.toString(_tokenId),
                        this.uriSuffix()
                    )
                );
        }
        return "";
    }

    function _bytesToHex(bytes memory buffer) internal pure returns (string memory) {
        bytes memory converted = new bytes(buffer.length * 2);
        bytes memory _base = "0123456789abcdef";

        for (uint256 i = 0; i < buffer.length; i++) {
            converted[i * 2] = _base[uint8(buffer[i]) / _base.length];
            converted[i * 2 + 1] = _base[uint8(buffer[i]) % _base.length];
        }

        return string(abi.encodePacked("0x", converted));
    }

    /**
     * @dev Function that checks if the contract supports a specific interface.
     * @param interfaceId The id of the interface to check.
     * @return bool Whether the contract supports the interface or not.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721A, IERC721A) returns (bool) {
        return interfaceId == _INTERFACE_ID_EXOMOON_ERC721 || super.supportsInterface(interfaceId);
    }

    /**
     *  @inheritdoc ERC721A
     */
    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }
}
