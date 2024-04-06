// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IExomoonERC721Layered} from "./IExomoonERC721Layered.sol";
import {ExomoonERC721} from "../ExomoonERC721.sol";

/**
 * @title ExomoonERC721Layered Contract
 * @dev This contract represents the official implementation of the ExomoonERC721Layered standard.
 * It implements the standard explained in the `IExomoonERC721Layered` interface.
 */
contract ExomoonERC721Layered is ExomoonERC721, IExomoonERC721Layered {
    Layer[] private _layers;

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
    ) ExomoonERC721(_name, _symbol, _maxSupplyVal) {}

    modifier isLayerValid(uint256 _index) {
        if (_index >= _layers.length) {
            revert InvalidLayerIndex();
        }
        _;
    }

    /**
     * @inheritdoc IExomoonERC721Layered
     */
    function addLayer(
        string memory _name,
        uint256 _price,
        uint8 _variations
    ) external override onlyOwner {
        _layers.push();
        Layer storage layer = _layers[_layers.length - 1];
        layer.name = _name;
        layer.price = _price;
        layer.variations = _variations;
    }

    /**
     * @inheritdoc IExomoonERC721Layered
     */
    function setLayerPrice(
        uint256 _index,
        uint256 _price
    ) external override isLayerValid(_index) onlyOwner {
        _layers[_index].price = _price;
    }

    /**
     * @inheritdoc IExomoonERC721Layered
     */
    function setLayerVariationPrice(
        uint256 _index,
        uint8 _variation,
        uint256 _price
    ) external override isLayerValid(_index) onlyOwner {
        if (_variation >= _layers[_index].variations) {
            revert InvalidVariationIndex();
        }
        _layers[_index].priceOverrides[_variation] = _price;
    }

    /**
     * @inheritdoc IExomoonERC721Layered
     */
    function getVariationPrice(
        uint256 _index,
        uint8 _variation
    ) external view override isLayerValid(_index) returns (uint256) {
        if (_variation >= _layers[_index].variations) {
            revert InvalidVariationIndex();
        }
        return _layers[_index].priceOverrides[_variation];
    }

    /**
     * @inheritdoc IExomoonERC721Layered
     */
    function setVariations(
        uint256 _index,
        uint8 _variations
    ) external override isLayerValid(_index) onlyOwner {
        _layers[_index].variations = _variations;
    }

    /**
     * @inheritdoc IExomoonERC721Layered
     */
    function getLayerInfoByIndex(
        uint256 _index
    )
        external
        view
        override
        isLayerValid(_index)
        returns (uint256 price, uint8 variations, string memory name)
    {
        Layer storage layer = _layers[_index];
        return (layer.price, layer.variations, layer.name);
    }

    /**
     * @inheritdoc IExomoonERC721Layered
     */
    function getLayersCount() external view override returns (uint256) {
        return _layers.length;
    }

    /**
     * @inheritdoc IExomoonERC721Layered
     */
    function getTokenLayersInfo(
        uint256 _tokenId
    ) external view returns (TokenLayerInfo[] memory) {
        bytes memory data = getTokenData(_tokenId);
        uint256 layersInfoCount = _layers.length;

        TokenLayerInfo[] memory layersInfo = new TokenLayerInfo[](layersInfoCount);
        for (uint256 i = 0; i < layersInfoCount; i++) {
            layersInfo[i].layerIndex = uint8(i);
            layersInfo[i].variation = uint8(data[i]);
        }

        return layersInfo;
    }

    /**
     * @inheritdoc IExomoonERC721Layered
     */
    function encodeLayersInfo(
        TokenLayerInfo[] memory _layersInfo
    ) external pure returns (bytes memory) {
        uint256 layersInfoCount = _layersInfo.length;
        bytes memory data = new bytes(layersInfoCount);
        for (uint256 i = 0; i < layersInfoCount; i++) {
            // Variation is the first 5 bits, color index is the last 3 bits
            data[_layersInfo[i].layerIndex] = bytes1(
                (_layersInfo[i].variation << 3) | _layersInfo[i].color
            );
        }
        return data;
    }

    function _processTokenData(uint256 _amount, bytes memory _data) internal override {
        uint256 layersCount = _layers.length;

        if (_data.length != layersCount * _amount) {
            revert InvalidDataLength();
        }

        uint256 nextToken = _nextTokenId();

        for (uint256 i = 0; i < _amount; i++) {
            bytes memory tokenData = new bytes(layersCount);
            for (uint256 j = 0; j < layersCount; j++) {
                // Variation index is the first 5 bits
                uint8 variationIndex = uint8(_data[i * layersCount + j] >> 3);

                // Color index is the last 3 bits
                uint8 colorIndex = uint8(_data[i * layersCount + j] & 0x07);

                if (variationIndex >= _layers[j].variations) {
                    revert InvalidVariationIndex();
                }

                tokenData[j] = bytes1((variationIndex << 3) | colorIndex);
            }
            _setTokenData(nextToken + i, tokenData);
        }
    }
}
