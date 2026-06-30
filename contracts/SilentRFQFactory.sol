// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SilentRFQ} from "./SilentRFQ.sol";

/// @title SilentRFQFactory — Deployment and discovery hub for SilentRFQ contracts
/// @notice The app entry point. Each call to createRFQ deploys a fresh SilentRFQ
///         contract owned by msg.sender. The factory indexes all deployed contracts
///         so frontends can discover and list RFQs without off-chain indexing.
contract SilentRFQFactory {
    address[] private _allRFQs;
    mapping(address => address[]) private _rfqsByBuyer;

    /// @notice Emitted when a new RFQ is created.
    /// @param rfq     Address of the deployed SilentRFQ contract.
    /// @param buyer   Address that called createRFQ (set as buyer in SilentRFQ).
    event RFQCreated(address indexed rfq, address indexed buyer, string description, uint256 deadline);

    /// @notice Deploy a new SilentRFQ contract. The caller becomes the buyer.
    /// @param description  Plain-text description of the procurement need.
    /// @param deadline     Unix timestamp after which bids are closed and settlement begins.
    /// @return rfq         Address of the newly deployed SilentRFQ contract.
    function createRFQ(string calldata description, uint256 deadline) external returns (address rfq) {
        SilentRFQ newRFQ = new SilentRFQ(msg.sender, description, deadline);
        rfq = address(newRFQ);
        _allRFQs.push(rfq);
        _rfqsByBuyer[msg.sender].push(rfq);
        emit RFQCreated(rfq, msg.sender, description, deadline);
    }

    /// @notice Returns all RFQ contract addresses ever deployed by this factory.
    function getRFQs() external view returns (address[] memory) {
        return _allRFQs;
    }

    /// @notice Returns all RFQ contract addresses created by a specific buyer.
    function getRFQsByBuyer(address buyer) external view returns (address[] memory) {
        return _rfqsByBuyer[buyer];
    }

    /// @notice Total number of RFQs deployed through this factory.
    function rfqCount() external view returns (uint256) {
        return _allRFQs.length;
    }
}
