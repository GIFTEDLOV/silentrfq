# SilentRFQ Project Rules

SilentRFQ is a Zama Season 3 Builder Track dApp.

## Core idea

SilentRFQ is a confidential procurement bidding app.

A buyer creates an RFQ. Vendors submit encrypted bid amounts using Zama FHEVM. The smart contract compares encrypted bids and selects the best quote after the deadline. Losing bid amounts remain private.

## Main priority

Build a working Zama FHEVM smart contract proof first.

Do not build a frontend until the encrypted bidding logic passes tests.

## Tech stack

- Zama FHEVM Hardhat template
- Solidity
- TypeScript tests
- Next.js frontend later
- wagmi/viem later
- Zama SDK later
- Sepolia deployment later

## Rules

- Do not invent Zama APIs.
- Use the existing Zama FHEVM template patterns.
- Use tests as the source of truth.
- Do not fake privacy.
- Do not fake decryption.
- Do not fake Sepolia deployment.
- Keep scope small.
- No escrow.
- No payments.
- No KYC.
- No AI scoring.
- No file uploads.
- No messaging.
- No frontend until the contract proof works.

## MVP

1. Buyer creates RFQ.
2. Vendors submit encrypted bids.
3. Contract compares encrypted bids.
4. Contract stores encrypted best bid.
5. Contract stores encrypted best vendor index.
6. Deadline is enforced.
7. Buyer finalizes after deadline.
8. Winner is revealed.
9. Losing bid amounts stay private.

## Smart contract guidance

- Use euint64 for encrypted bid amounts.
- Use euint64 for encrypted best vendor index.
- Do not try to privately select an address directly.
- Store vendor addresses publicly in an array.
- Store the winning vendor index encrypted.
- Reveal the winning index after finalization.
- Map the revealed index to the vendor address.
- Handle the first bid carefully.
- Use FHE.allowThis where encrypted values must be stored and reused.
- Use input proofs correctly for encrypted user inputs.
- Add comments explaining FHE operations.

## Build order

1. Contract proof
2. Contract tests
3. Local testing
4. Sepolia deployment
5. Minimal frontend
6. Polished frontend
7. README
8. Demo video script
9. X thread

## First phase only

For the first phase, build only:

- SilentRFQ.sol
- TypeScript tests
- README notes

Do not build frontend files yet.
