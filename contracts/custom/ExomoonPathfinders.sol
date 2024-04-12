// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ExomoonERC721Layered} from "../lib/extensions/ExomoonERC721Layered.sol";
import {ExomoonERC721} from "../lib/ExomoonERC721.sol";
import {IExomoonERC721} from "../lib/IExomoonERC721.sol";

/**
 * @title ExomoonPathfinders Contract
 * @dev This contract represents the official implementation of the ExomoonPathfinders standard.
 */
contract ExomoonPathfinders is ExomoonERC721Layered {
    mapping(address => address) internal _inviterOf;

    uint256 public inviterReward = 10;
    // uint256 public referralJoinBonus = 10;

    constructor() ExomoonERC721Layered("Exomoon Pathfinders", "PATH", 10000) {
        // General configuration
        setPrice(0.1 ether);

        // Layers configuration
        addLayer("Background", 0.05 ether, 10, true);
    }

    /**
     * @dev Returns the inviter of the given account.
     * @param _account The account to get the inviter of.
     */
    function inviterOf(address _account) external view returns (address) {
        return _inviterOf[_account];
    }

    /**
     * @dev Sets the inviter of the given account.
     * @param _account The account to set the inviter of.
     * @param _inviter The inviter to set.
     */
    function _setInviterIfNotSet(address _account, address _inviter) internal {
        if (_inviterOf[_account] == address(0)) {
            _inviterOf[_account] = _inviter;
        }
    }

    /**
     * Internal function that mints a specified amount of tokens for a specified address within the referral program.
     * @param _inviter The inviter of the account. If the account already has an inviter, this parameter is ignored.
     * @param _to The address to mint the tokens for.
     * @param _amount The amount of tokens to mint.
     * @param _data Additional data to pass to the mint
     */
    function _refMintForAddress(address _inviter, address _to, uint256 _amount, bytes memory _data) internal virtual {
        _setInviterIfNotSet(_to, _inviter);
        _mintForAddress(_to, _amount, _data);
    }

    /**
     * @dev Processes the referral action.
     * @param _account The account to process the referral action for. This account will receive the inviter reward, based on the transaction value and the inviter reward percentage.
     */
    function _processRefAction(address _account) internal virtual {
        // If the account has an inviter, split the reward
        address inviter = _inviterOf[_account];
        if (inviter != address(0)) {
            uint256 reward = (msg.value * inviterReward) / 100;
            (bool success, ) = payable(inviter).call{value: reward}("");
            // solhint-disable-next-line
            require(success);
        }
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function mintForAddress(
        address _to,
        uint256 _amount,
        bytes memory _data
    ) external payable override(ExomoonERC721, IExomoonERC721) active enoughFunds(_amount) {
        _mintForAddress(_to, _amount, _data);
        _processRefAction(msg.sender);
    }

    /**
     * @inheritdoc IExomoonERC721
     */
    function mint(
        uint256 _amount,
        bytes memory _data
    ) external payable override(ExomoonERC721, IExomoonERC721) active enoughFunds(_amount) {
        _mintForAddress(msg.sender, _amount, _data);
        _processRefAction(msg.sender);
    }

    /**
     * Executes a referral mint and sends the ID(s) to the provided address.
     * @param _inviter The inviter of the account. If the account already has an inviter, this parameter is ignored.
     * @param _to The address to mint the tokens for.
     * @param _amount The amount of tokens to mint.
     * @param _data Additional data to pass to the mint (in this case the layers data)
     */
    function refMintForAddress(
        address _inviter,
        address _to,
        uint256 _amount,
        bytes memory _data
    ) external payable virtual active enoughFunds(_amount) {
        _refMintForAddress(_inviter, _to, _amount, _data);
        _processRefAction(_to);
    }

    /**
     * Executes a referral mint and sends the ID(s) to the sender.
     * @param _inviter The inviter of the account. If the account already has an inviter, this parameter is ignored.
     * @param _amount The amount of tokens to mint.
     * @param _data Additional data to pass to the mint
     */
    function refMint(
        address _inviter,
        uint256 _amount,
        bytes memory _data
    ) external payable virtual active enoughFunds(_amount) {
        _refMintForAddress(_inviter, msg.sender, _amount, _data);
        _processRefAction(msg.sender);
    }
}
