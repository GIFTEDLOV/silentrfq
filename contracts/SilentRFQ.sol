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
    bool public winnerRevealed;
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
    error InvalidDeadline();
    error DeadlinePassed();
    error DeadlineNotPassed();
    error AlreadyBid();
    error AlreadyFinalized();
    error NoBids();
    error NotFinalized();
    error InvalidWinnerIndex();
    error WinnerNotRevealed();
    error WinnerAlreadyRevealed();
    error TooManyVendors();
    error InvalidDecryptionHandles();

    constructor(string memory _description, uint256 _deadline) {
        if (_deadline <= block.timestamp) revert InvalidDeadline();
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

        // Guard against uint64 overflow before casting the vendor index.
        // In practice this limit (2^64 - 1 vendors) will never be reached,
        // but the cast must be safe.
        if (newIndex > type(uint64).max) revert TooManyVendors();

        hasBid[msg.sender] = true;

        if (isFirstBid) {
            // First bid: store directly — no FHE comparison needed.
            _bestBid = encryptedBid;
            _bestVendorIndex = FHE.asEuint64(uint64(newIndex));
        } else {
            // Compare new bid against current best homomorphically.
            // FHE.select chooses the lower bid and its vendor index
            // without revealing which candidate won the comparison.
            //
            // Tie policy: equal bids keep the earliest submitted bid.
            // FHE.lt is strictly less-than, so isLower is false for equal
            // amounts and FHE.select leaves _bestBid and _bestVendorIndex unchanged.
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

        // Mark _bestVendorIndex for public decryption by the Zama gateway.
        // After finalization, anyone with a valid KMS-signed proof can call
        // callbackRevealWinner to reveal the winner trustlessly.
        FHE.makePubliclyDecryptable(_bestVendorIndex);

        // Winning bid amount stays private — only the buyer receives decrypt access.
        // Losing bid ciphertexts remain on-chain but permanently unreadable without
        // an FHE.allow grant, which is never issued for losing bids.
        FHE.allow(_bestBid, buyer);

        emit RFQFinalized(buyer);
    }

    /// @notice Trustless winner reveal via Zama public decryption gateway callback.
    ///         This is the Sepolia-ready settlement path. Anyone can call this function
    ///         with a valid KMS-signed proof — no trust in the caller is required because
    ///         FHE.checkSignatures verifies the proof on-chain against the registered KMS.
    ///
    /// @param handlesList          Must be exactly one element: euint64.unwrap(_bestVendorIndex).
    ///                             Verified against this contract's actual handle to prevent
    ///                             an attacker from supplying a proof for a different ciphertext.
    /// @param abiEncodedCleartexts ABI-encoded decrypted value from the KMS gateway.
    ///                             Format: abi.encode(uint256 winnerIndex)
    ///                             NOTE: the KMS always encodes FHE types as uint256, not euint64.
    /// @param decryptionProof      Packed KMS signature bytes.
    ///                             Format: uint8(N) || sig_0 (65 bytes) || ... || sig_{N-1} || extraData (0x00)
    function callbackRevealWinner(
        bytes32[] calldata handlesList,
        bytes calldata abiEncodedCleartexts,
        bytes calldata decryptionProof
    ) external {
        if (!finalized) revert NotFinalized();
        if (winnerRevealed) revert WinnerAlreadyRevealed();

        // Verify the handles list targets exactly _bestVendorIndex for this contract.
        // Without this check an attacker could supply a valid KMS proof for a ciphertext
        // they control to set an arbitrary winner index.
        bytes32 expectedHandle = euint64.unwrap(_bestVendorIndex);
        if (handlesList.length != 1 || handlesList[0] != expectedHandle) revert InvalidDecryptionHandles();

        // Verify KMS signatures on-chain. Reverts with InvalidKMSSignatures if invalid.
        FHE.checkSignatures(handlesList, abiEncodedCleartexts, decryptionProof);

        // KMS encodes all FHE primitive types as uint256 in the ABI-encoded result.
        uint256 index = abi.decode(abiEncodedCleartexts, (uint256));
        if (index >= vendors.length) revert InvalidWinnerIndex();

        revealedWinnerIndex = index;
        winnerRevealed = true;
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

    /// @notice Returns the winner address. Reverts until callbackRevealWinner has been called.
    function winnerAddress() external view returns (address) {
        if (!winnerRevealed) revert WinnerNotRevealed();
        return vendors[revealedWinnerIndex];
    }
}
