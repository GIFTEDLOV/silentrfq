// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Phase 1: One RFQ per contract, deployed directly.
// Production: Use a SilentRFQFactory that deploys one SilentRFQ per request,
// or a multi-RFQ manager contract mapping rfqId => RFQ state.

import {FHE, euint64, externalEuint64, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title SilentRFQ — Confidential procurement bidding on Zama FHEVM
/// @notice Buyers create RFQs; vendors submit encrypted bids; the contract selects
///         the best bid homomorphically. Losing bid amounts are never revealed.
contract SilentRFQ is ZamaEthereumConfig {
    address public buyer;
    string public description;
    uint256 public deadline;
    bool public finalized;
    uint256 public revealedWinnerIndex;

    // Vendor addresses in submission order. Public so the revealed winner index
    // can be mapped to an address after finalization.
    address[] public vendors;
    mapping(address => bool) public hasBid;

    // Encrypted running minimum bid and the index of the vendor who submitted it.
    // Private: losing bid amounts are never exposed to anyone.
    euint64 private _bestBid;
    euint64 private _bestVendorIndex;

    event RFQCreated(address indexed buyer, string description, uint256 deadline);
    event BidSubmitted(address indexed vendor, uint256 vendorIndex);
    event RFQFinalized(address indexed buyer);
    event WinnerRevealed(uint256 winnerIndex, address winner);

    error NotBuyer();
    error DeadlinePassed();
    error DeadlineNotPassed();
    error AlreadyBid();
    error AlreadyFinalized();
    error NoBids();
    error NotFinalized();
    error InvalidWinnerIndex();

    constructor(string memory _description, uint256 _deadline) {
        buyer = msg.sender;
        description = _description;
        deadline = _deadline;
        emit RFQCreated(msg.sender, _description, _deadline);
    }

    /// @notice Submit an encrypted bid. The bid amount is never stored or compared in plaintext.
    /// @param inputBid    Encrypted euint64 bid amount (produced by the Zama JS SDK)
    /// @param inputProof  Input validity proof from the SDK
    function submitBid(externalEuint64 inputBid, bytes calldata inputProof) external {
        if (block.timestamp >= deadline) revert DeadlinePassed();
        if (hasBid[msg.sender]) revert AlreadyBid();

        euint64 encryptedBid = FHE.fromExternal(inputBid, inputProof);

        // Use plaintext vendors.length before push to detect the first bid.
        // Avoids FHE.isInitialized; keeps first-bid branching entirely in plaintext.
        bool isFirstBid = (vendors.length == 0);
        vendors.push(msg.sender);
        uint256 newIndex = vendors.length - 1;
        hasBid[msg.sender] = true;

        if (isFirstBid) {
            // First bid: store directly — no FHE comparison needed.
            _bestBid = encryptedBid;
            _bestVendorIndex = FHE.asEuint64(uint64(newIndex));
        } else {
            // Compare new bid against current best homomorphically.
            // FHE.select chooses the lower bid and its vendor index
            // without revealing which candidate won the comparison.
            ebool isLower = FHE.lt(encryptedBid, _bestBid);
            _bestBid = FHE.select(isLower, encryptedBid, _bestBid);
            _bestVendorIndex = FHE.select(isLower, FHE.asEuint64(uint64(newIndex)), _bestVendorIndex);
        }

        // Grant the contract access to these ciphertexts in future transactions.
        FHE.allowThis(_bestBid);
        FHE.allowThis(_bestVendorIndex);

        emit BidSubmitted(msg.sender, newIndex);
    }

    /// @notice Buyer finalises the RFQ after the deadline. Grants buyer off-chain decrypt access.
    ///         Bid amounts remain private until the buyer explicitly decrypts off-chain.
    function finalize() external {
        if (msg.sender != buyer) revert NotBuyer();
        if (block.timestamp < deadline) revert DeadlineNotPassed();
        if (finalized) revert AlreadyFinalized();
        if (vendors.length == 0) revert NoBids();

        finalized = true;

        // Grant buyer permission to decrypt the winning index and bid amount off-chain.
        // No other party receives access; losing bid amounts remain permanently private.
        FHE.allow(_bestBid, buyer);
        FHE.allow(_bestVendorIndex, buyer);

        emit RFQFinalized(buyer);
    }

    /// @notice MVP LOCAL-MOCK ONLY: buyer submits the winner index they decrypted off-chain.
    ///         Does NOT cryptographically enforce on-chain that the index is the true best bidder.
    /// @dev    TODO: Before Sepolia deployment, replace with a Zama public decryption gateway callback:
    ///         emit a decryption request event → gateway calls back with KMS-verified plaintext
    ///         → callback stores revealedWinnerIndex trustlessly, with no buyer input required.
    function revealWinnerFromDecryptedIndex(uint256 index) external {
        if (msg.sender != buyer) revert NotBuyer();
        if (!finalized) revert NotFinalized();
        if (index >= vendors.length) revert InvalidWinnerIndex();

        revealedWinnerIndex = index;
        emit WinnerRevealed(index, vendors[index]);
    }

    function getBestBid() external view returns (euint64) {
        return _bestBid;
    }

    function getBestVendorIndex() external view returns (euint64) {
        return _bestVendorIndex;
    }

    function getVendors() external view returns (address[] memory) {
        return vendors;
    }

    function vendorCount() external view returns (uint256) {
        return vendors.length;
    }

    /// @notice Returns the winner address. Only meaningful after finalized == true
    ///         and revealWinnerFromDecryptedIndex has been called.
    function winnerAddress() external view returns (address) {
        return vendors[revealedWinnerIndex];
    }
}
