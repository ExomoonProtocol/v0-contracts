// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IExomoonERC721} from "../IExomoonERC721.sol";

/**
 * @title IExomoonERC721Layered Interface
 * @dev This interface explains the structure of the layered NFTs and the functions to manage the layers.
 *
 * `IExomoonERC721Layered` is able to manage the layers of the NFTs, where each layer can have multiple variations.
 * Layered NFTs introduce the concept of layers to the NFTs, where each NFT can consist of multiple layers and each layer can have multiple variations.
 * This allows for a high degree of customization and uniqueness for each NFT, as the combination of layers and variations can create a vast number of unique NFTs.
 *
 * The `IExomoonERC721Layered` interface defines the structure of the layered NFTs and the functions to manage the layers.
 * It includes functions to handle all aspects of the layers, such as adding new layers, setting the price of layers and variations, and getting information about the layers associated with a token.
 *
 * This standard is a part of the Exomoon Protocol, which aims to create a unique and customizable NFT experience.
 * It is designed to be open and extensible, allowing developers to build on top of it and create their own unique layered NFTs.
 */
interface IExomoonERC721Layered is IExomoonERC721 {
    /**
     * @dev Error thrown when the layer index is invalid.
     */
    error InvalidLayerIndex();

    /**
     * @dev Error thrown when the variation index is invalid.
     */
    error InvalidVariationIndex();

    /**
     * @dev This struct represents a layer of the NFT.
     */
    struct Layer {
        string name;
        uint256 price;
        uint8 variations;
        mapping(uint8 => uint256) priceOverrides;
    }

    /**
     * @dev This struct represents the information of a layer associated with a token.
     */
    struct TokenLayerInfo {
        uint8 layerIndex;
        uint8 variation;
        uint8 color;
    }

    /**
     * @dev This function adds a new layer to the NFT.
     * @param _name The name of the layer.
     * @param _price The price of the layer.
     * @param _variations The number of variations for the layer.
     */
    function addLayer(string memory _name, uint256 _price, uint8 _variations) external;

    /**
     * @dev This function sets the price of the layer at the specified index.
     * @param _index The index of the layer.
     * @param _price The new price of the layer.
     */
    function setLayerPrice(uint256 _index, uint256 _price) external;

    /**
     * @dev This function sets the price of the variation of the layer at the specified index.
     * @param _index The index of the layer.
     * @param _variation The index of the variation.
     * @param _price The new price of the variation.
     */
    function setLayerVariationPrice(uint256 _index, uint8 _variation, uint256 _price) external;

    /**
     * @dev This function sets the number of variations for the layer at the specified index.
     * @param _index The index of the layer.
     * @param _variations The new number of variations for the layer.
     */
    function setVariations(uint256 _index, uint8 _variations) external;

    /**
     * @dev This function returns the price of the specified variation of the layer at the specified index.
     * @param _index The index of the layer.
     * @param _variation The index of the variation.
     */
    function getVariationPrice(
        uint256 _index,
        uint8 _variation
    ) external view returns (uint256);

    /**
     * @dev This function returns the layer at the specified index.
     * @param _index The index of the layer.
     */
    function getLayerInfoByIndex(
        uint256 _index
    ) external view returns (uint256 price, uint8 variations, string memory name);

    /**
     * @dev This function returns the number of layers in the NFT.
     * @return uint256 The number of layers in the NFT.
     */
    function getLayersCount() external view returns (uint256);

    /**
     * @dev This function returns the list of layers associated with the token.
     * @param _tokenId The token ID.
     * @return TokenLayerInfo[] The list of layers associated with the token.
     */
    function getTokenLayersInfo(
        uint256 _tokenId
    ) external view returns (TokenLayerInfo[] memory);

    /**
     * @dev This function encodes the layers information into bytes.
     * @param _layersInfo The list of layers information.
     * @return bytes The encoded layers information.
     */
    function encodeLayersInfo(
        TokenLayerInfo[] memory _layersInfo
    ) external pure returns (bytes memory);
}
