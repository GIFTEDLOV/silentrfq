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
- After finalization, the winning vendor index is **publicly decryptable** via the Zama gateway — anyone can submit a valid KMS-signed proof, but nobody can manually choose the winner. The proof is verified on-chain by `FHE.checkSignatures`.
- The winning bid amount stays **buyer-private** — only the buyer receives `FHE.allow` access via the Zama SDK.
- Encrypted ciphertexts and transaction data are public on-chain, but plaintext bid amounts remain private because decrypt permissions (`FHE.allow`) are not granted for losing bids. Without that permission, the ciphertext is unreadable.

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
| Final winner address, after reveal | `winnerAddress()` after `callbackRevealWinner` |
| Whether the RFQ has been finalized | `finalized` flag |

### Private (encrypted, never exposed)

| Data | Why it stays private |
|---|---|
| Individual bid amounts | Encrypted as `euint64`; only the encrypted handle is stored |
| Losing bid amounts | No `FHE.allow` is ever granted for losing bids |
| Winning bid amount | `_bestBid` is `euint64`; only the buyer receives `FHE.allow` access after `finalize()` |
| Which vendor is currently winning during the bidding period | `_bestVendorIndex` is encrypted and unreadable during the bid period |
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

**Tie policy:** `FHE.lt` is strictly less-than. If two vendors submit equal amounts, `isLower` evaluates to false and `FHE.select` leaves `_bestBid` and `_bestVendorIndex` unchanged. The earliest bid wins any tie.

After every bid, `FHE.allowThis` is called on both `_bestBid` and `_bestVendorIndex` so the contract retains access to the updated ciphertexts across future transactions.

### 3. Buyer finalizes after the deadline

After the deadline passes, the buyer calls `finalize()`. This:

- Verifies the caller is the buyer, the deadline has passed, and at least one bid exists.
- Sets `finalized = true`.
- Calls `FHE.makePubliclyDecryptable(_bestVendorIndex)` — registers the winning vendor index with the Zama ACL so anyone with a valid KMS-signed proof can reveal it trustlessly via `callbackRevealWinner`.
- Calls `FHE.allow(_bestBid, buyer)` — the winning bid amount stays private, readable only by the buyer.

Losing bid ciphertexts remain on-chain but permanently unreadable without an `FHE.allow` grant — which is never issued for losing bids.

### 4. Winner is revealed via public decryption callback

After `finalize()`, anyone queries the Zama relayer with `_bestVendorIndex` handle and receives `{ decrypted_value, signatures }` — the ABI-encoded winner index and KMS signatures. They then call:

```solidity
callbackRevealWinner(bytes32[] handlesList, bytes abiEncodedCleartexts, bytes decryptionProof)
```

This function:

1. Verifies `handlesList` contains exactly `_bestVendorIndex` for this contract — prevents substituting a proof for a different ciphertext.
2. Calls `FHE.checkSignatures(handlesList, abiEncodedCleartexts, decryptionProof)` — verifies KMS signatures on-chain. Reverts if invalid. No trust in the caller is needed.
3. Decodes `uint256 index = abi.decode(abiEncodedCleartexts, (uint256))` and stores it as `revealedWinnerIndex`.
4. Emits `WinnerRevealed`. `winnerAddress()` returns the vendor from `vendors[revealedWinnerIndex]`.

**This is the primary Sepolia settlement path.** Winner reveal requires no buyer action and no trusted third party — only a valid KMS-signed proof from the Zama gateway.

The `decryptionProof` byte layout (from `FHE.sol`):
```
byte[0]            = numSigners (uint8)
bytes[1..65]       = signature_0 (65 bytes, ECDSA)
bytes[66..130]     = signature_1 (if threshold > 1)
...
bytes[trailing]    = extraData (0x00 for v0)
```

---

## Architecture

SilentRFQ uses a factory pattern: buyers interact with `SilentRFQFactory` to create RFQs, and each RFQ lives in its own `SilentRFQ` contract.

```
Buyer
  │
  └─▶ SilentRFQFactory.createRFQ(description, deadline)
            │
            ├─▶ deploys new SilentRFQ(buyer, description, deadline)
            ├─▶ indexes address in _allRFQs and _rfqsByBuyer[buyer]
            └─▶ emits RFQCreated(rfq, buyer, description, deadline)

Frontend discovery
  └─▶ factory.getRFQs()             — all RFQs ever created
  └─▶ factory.getRFQsByBuyer(addr)  — buyer's own RFQs
  └─▶ factory.rfqCount()            — total count
```

Each `SilentRFQ` contract is independent and self-contained. The factory is stateless with respect to bidding — it only tracks addresses.

---

## Project Structure

```
silentrfq/
├── contracts/
│   ├── SilentRFQFactory.sol # App entry point — deploys and indexes SilentRFQ contracts
│   ├── SilentRFQ.sol        # Per-RFQ contract — confidential FHE bidding logic
│   └── FHECounter.sol       # Zama template example (unchanged)
├── test/
│   ├── SilentRFQFactory.ts  # Factory test suite (11 tests)
│   ├── SilentRFQ.ts         # SilentRFQ test suite (29 tests)
│   └── FHECounter.ts        # Template example tests (unchanged)
├── deploy/
│   └── deploy.ts            # Template deploy script
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
42 passing
 1 pending  ← Sepolia-only template test, correctly skipped on local
```

**SilentRFQ (29 tests):**
- Deployment: zero-buyer rejection (`InvalidBuyer`), past/equal-to-now deadline rejection (`InvalidDeadline`), correct initial state
- submitBid: deadline enforcement, duplicate prevention, first-bid path, FHE comparison correctness (lower/higher/equal), three-vendor selection, vendor ordering
- finalize: non-buyer, pre-deadline, no-bids, success, exact-boundary, double-finalize
- callbackRevealWinner: not-finalized, already-revealed, empty handles, length > 1, wrong handle, tampered proof, tampered cleartexts, valid proof success, permissionless caller, full three-vendor gateway flow

**SilentRFQFactory (11 tests):**
- createRFQ: buyer set correctly, address returned, RFQCreated event, invalid deadline propagation
- getRFQs: all RFQs across buyers, empty before first create
- getRFQsByBuyer: buyer-scoped results, empty for buyer with no RFQs
- rfqCount: zero initial, increments correctly

---

## Frontend Development (Phase 3A)

The frontend is a minimal Next.js app in the `frontend/` directory. It reads RFQ state and lets buyers create and finalize RFQs. Encrypted bid submission is Phase 3B.

### Setup

**1. Start a local Hardhat node (separate terminal)**

```bash
npx hardhat node
```

**2. Deploy SilentRFQFactory to the local node**

```bash
npx hardhat run scripts/deployFactory.ts --network localhost
```

Copy the printed `NEXT_PUBLIC_FACTORY_ADDRESS=0x...` line.

**3. Configure the frontend**

```bash
cd frontend
cp .env.local.example .env.local
# Paste the factory address into .env.local
```

**4. Install frontend dependencies and start the dev server**

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Pages

| Route | Description |
|---|---|
| `/` | Home — wallet connect, links to create/browse |
| `/create` | Create a new RFQ (description + deadline) |
| `/rfqs` | List all RFQs from the factory |
| `/rfq/[address]` | RFQ detail — state, finalize button |

### Build

```bash
cd frontend
npm run build
```

---

## Build Roadmap

| Phase | Status |
|---|---|
| Contract proof (`SilentRFQ.sol`) | Complete |
| Factory contract (`SilentRFQFactory.sol`) | Complete |
| TypeScript test suite | Complete |
| Local FHEVM mock testing | Complete |
| Zama public decryption gateway callback (`callbackRevealWinner`) | Complete |
| Sepolia deployment | Planned |
| Minimal frontend shell (Phase 3A — no encrypted bids) | Complete |
| Encrypted bid submission + gateway reveal (Phase 3B) | Planned |
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
