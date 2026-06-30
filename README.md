# SilentRFQ

**Confidential procurement bidding on Zama FHEVM — Zama Season 3 Builder Track**

---

## What is SilentRFQ?

SilentRFQ is a confidential Request for Quotation (RFQ) protocol built on Zama's Fully Homomorphic Encryption Virtual Machine (FHEVM). It allows a buyer to create an RFQ on-chain and collect encrypted price quotes from competing vendors. The smart contract compares all submitted bids homomorphically — without ever decrypting them — and identifies the winning vendor. Losing bid amounts remain permanently private, even after the auction closes.

---

## The Problem: Public Blockchains Leak Supplier Quote Data

Traditional procurement involves sealed bids for a reason: suppliers compete more honestly when they cannot see each other's quotes. Putting an RFQ on a public blockchain reverses this entirely.

On a standard EVM chain, every transaction input is visible. If vendors submit bid amounts as calldata or store them in contract state, any competitor can:

- Read a rival's submitted price before the deadline and undercut it by one unit.
- Build a long-term price database on a supplier's quoting behaviour.
- Identify which suppliers are cheapest for specific categories, then approach them directly to negotiate around the buyer.

This is not a hypothetical risk. It is the default behaviour of every public EVM chain. A procurement dApp without encryption does not preserve the confidentiality model that sealed bidding exists to provide.

---

## The Solution: Homomorphic Encryption with Zama FHEVM

Zama FHEVM allows smart contracts to operate on encrypted data without ever decrypting it. Vendors encrypt their bid amounts locally using the Zama SDK before submitting. The ciphertext is sent on-chain, and the contract performs all comparisons inside the encryption layer.

The key properties this enables for SilentRFQ:

- A vendor's submitted bid amount is **never visible** to any other party at any point.
- The contract can determine which bid is lowest **without knowing what any individual bid is**.
- Only the buyer, after finalization, can decrypt the winning bid amount and winning vendor index using their wallet key.
- Losing bid amounts cannot be decrypted by anyone — not by other vendors, not by the buyer, not by a block explorer.

This is not obfuscation or off-chain privacy. It is cryptographic privacy enforced by the protocol itself.

---

## What is Public vs. Private

### Public (visible on-chain to anyone)

| Data | Where |
|---|---|
| Buyer address | Contract state |
| RFQ description | Contract state |
| Bid deadline (Unix timestamp) | Contract state |
| Vendor addresses, in submission order | `vendors[]` array |
| Number of bids submitted | `vendorCount()` |
| Final winner address, after buyer reveals | `winnerAddress()` after `revealWinnerFromDecryptedIndex` |
| Whether the RFQ has been finalized | `finalized` flag |

### Private (encrypted, never exposed)

| Data | Why it stays private |
|---|---|
| Individual bid amounts | Encrypted as `euint64`; only the encrypted handle is stored |
| Losing bid amounts | No `FHE.allow` is ever granted for losing bids |
| Encrypted best bid at any point | Stored as private `euint64`; only buyer receives decrypt access after `finalize()` |
| Which vendor is currently winning during the bidding period | `_bestVendorIndex` is encrypted; not readable until buyer decrypts after deadline |
| Bid ordering and ranking | The FHE comparison result is itself encrypted; no plaintext ranking is ever produced |

---

## How Encrypted Bidding Works

### 1. Buyer deploys the contract

The buyer deploys `SilentRFQ` with a plain-text description and a Unix timestamp deadline. Their address is recorded as the `buyer`. No bid amounts exist yet.

### 2. Vendors submit encrypted bids

Each vendor uses the Zama SDK to encrypt their bid amount locally into a `euint64` ciphertext along with a validity proof. They call `submitBid(externalEuint64 inputBid, bytes inputProof)`.

The contract verifies the proof with `FHE.fromExternal(inputBid, inputProof)` and runs the following logic entirely inside the encryption layer:

**First bid (plaintext branch, detected via `vendors.length == 0` before the push):**

```solidity
_bestBid = encryptedBid;
_bestVendorIndex = FHE.asEuint64(uint64(newIndex));
```

The first bid is stored directly. No FHE comparison is needed because there is no prior best to compare against. First-bid detection uses the plaintext `vendors.length` — not `FHE.isInitialized` — to keep the branch entirely outside the encryption layer.

**Subsequent bids (FHE comparison branch):**

```solidity
ebool isLower = FHE.lt(encryptedBid, _bestBid);
_bestBid = FHE.select(isLower, encryptedBid, _bestBid);
_bestVendorIndex = FHE.select(isLower, FHE.asEuint64(uint64(newIndex)), _bestVendorIndex);
```

`FHE.lt` compares two encrypted values and returns an encrypted boolean — the comparison result itself is never revealed. `FHE.select` acts as an encrypted conditional: it picks the lower bid and the corresponding vendor index using the encrypted boolean, without ever decrypting either candidate.

After every bid, `FHE.allowThis` is called on both `_bestBid` and `_bestVendorIndex` so the contract retains access to the updated ciphertexts across future transactions.

### 3. Buyer finalizes after the deadline

After the deadline passes, the buyer calls `finalize()`. This:

- Verifies the caller is the buyer, the deadline has passed, and at least one bid exists.
- Sets `finalized = true`.
- Calls `FHE.allow(_bestBid, buyer)` and `FHE.allow(_bestVendorIndex, buyer)` — granting the buyer (and only the buyer) off-chain decryption access to the winning bid amount and winning vendor index.

No other party is granted decrypt access. Losing bid amounts remain permanently inaccessible.

### 4. Buyer reveals the winner

The buyer decrypts `_bestVendorIndex` off-chain using their wallet and the Zama SDK. They then call `revealWinnerFromDecryptedIndex(uint256 index)` to record the winner index on-chain. `winnerAddress()` maps that index to the vendor's address from the public `vendors[]` array.

---

## Current Limitation: Winner Reveal is Mock/Local MVP Only

`revealWinnerFromDecryptedIndex` is a **local and mock testing shortcut only**. It accepts the winner index as a buyer-submitted parameter, which means it does not cryptographically enforce on-chain that the submitted index matches the actual encrypted best vendor index.

The production Sepolia version must replace this function with the **Zama public decryption gateway callback** pattern:

1. Contract emits a decryption request for `_bestVendorIndex`.
2. The Zama KMS gateway processes the request and calls back with a KMS-signed plaintext proof.
3. The callback function verifies the proof and stores `revealedWinnerIndex` trustlessly — with no buyer input required.

This is the correct trustless settlement path and is planned for the Sepolia deployment phase.

---

## Project Structure

```
silentrfq/
├── contracts/
│   ├── SilentRFQ.sol       # Main contract — confidential RFQ bidding
│   └── FHECounter.sol      # Zama template example (unchanged)
├── test/
│   ├── SilentRFQ.ts        # SilentRFQ test suite (19 tests)
│   └── FHECounter.ts       # Template example tests (unchanged)
├── deploy/
│   └── deploy.ts           # Template deploy script
├── hardhat.config.ts
└── package.json
```

---

## How to Run

### Prerequisites

- Node.js 20 or higher
- npm

### Install dependencies

```bash
npm install
```

### Compile contracts

```bash
npm run compile
```

### Run all tests

```bash
npm run test
```

---

## Test Status

```
20 passing
 1 pending  ← Sepolia-only template test, correctly skipped on local
```

All 19 SilentRFQ-specific tests pass on the local Hardhat FHEVM mock environment, covering:

- Deployment initial state
- Bid rejection after deadline
- Duplicate bid prevention
- First-bid direct encrypted store path
- Lower bid displacing current best (FHE.lt + FHE.select correctness)
- Higher bid not displacing current best
- Three-vendor scenario with middle vendor winning
- Vendor registration order
- Finalize: non-buyer rejection, pre-deadline rejection, no-bids rejection, success, double-finalize rejection
- Winner reveal: pre-finalize rejection, non-buyer rejection, invalid index rejection
- Full end-to-end happy path: Alice=100, Bob=50, Carol=200 → Bob wins → winner address confirmed → winning bid decrypted by buyer only

---

## Build Roadmap

| Phase | Status |
|---|---|
| Contract proof (`SilentRFQ.sol`) | Complete |
| TypeScript test suite | Complete |
| Local FHEVM mock testing | Complete |
| Sepolia deployment + Zama gateway callback | Planned |
| Minimal frontend (Next.js + Zama SDK) | Planned |
| Demo video | Planned |

---

## Tech Stack

- [Zama FHEVM](https://docs.zama.ai/fhevm) — fully homomorphic encryption for EVM
- [Hardhat](https://hardhat.org/) — development and testing framework
- [`@fhevm/solidity`](https://www.npmjs.com/package/@fhevm/solidity) v0.11.x — FHE Solidity library
- [`@fhevm/hardhat-plugin`](https://www.npmjs.com/package/@fhevm/hardhat-plugin) — mock FHEVM environment for local testing
- TypeScript — test suite
- Solidity 0.8.27 — contract language

---

## Template Base

This project was bootstrapped from the [Zama FHEVM Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template). The original template quick-start instructions and FHECounter example are preserved below.

---

## Original Template: Quick Start

For detailed instructions see:
[FHEVM Hardhat Quick Start Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   npx hardhat vars set MNEMONIC
   npx hardhat vars set INFURA_API_KEY
   npx hardhat vars set ETHERSCAN_API_KEY  # optional
   ```

3. **Deploy to local network**

   ```bash
   npx hardhat node
   npx hardhat deploy --network localhost
   ```

4. **Deploy to Sepolia Testnet**

   ```bash
   npx hardhat deploy --network sepolia
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

## Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests            |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## License

This project is licensed under the BSD-3-Clause-Clear License. See the [LICENSE](LICENSE) file for details.

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/zama-ai/fhevm/issues)
- **Documentation**: [FHEVM Docs](https://docs.zama.ai)
- **Community**: [Zama Discord](https://discord.gg/zama)
