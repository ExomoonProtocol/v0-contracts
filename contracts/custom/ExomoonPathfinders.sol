// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ExomoonERC721Layered} from "../lib/extensions/ExomoonERC721Layered.sol";

contract ExomoonPathfinders is ExomoonERC721Layered {
    constructor() ExomoonERC721Layered("Exomoon Pathfinders", "PATH", 10000) {
        // General configuration
        setPrice(0);

        // Layers configuration
        addLayer("Background", 0, 10, true);
    }
}
