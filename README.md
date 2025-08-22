# Mee Node Quick Start & Testing Guide

## Index
- [Mee Node Quick Start \& Testing Guide](#mee-node-quick-start--testing-guide)
  - [Index](#index)
  - [1. Initial Steps: Fork Mainnet and Fund Accounts](#1-initial-steps-fork-mainnet-and-fund-accounts)
  - [2. Scripts for Forking Mainnet and Starting MEE Node](#2-scripts-for-forking-mainnet-and-starting-mee-node)
  - [3. Test Script Demonstrating the Supertransaction](#3-test-script-demonstrating-the-supertransaction)
  - [4. Documentation \& Approach](#4-documentation--approach)

**Prerequisites:**
- Docker & Docker Compose installed
- Node.js & Bun installed
- Foundry (`cast`, `anvil`) installed

## 1. Initial Steps: Fork Mainnet and Fund Accounts

**Fork Mainnet with Anvil:**

```sh
anvil --fork-url <MAINNET_RPC_URL>
```

This command will start a local Ethereum node that simulates mainnet by forking from a live RPC endpoint. You can use it for safe testing and development with real mainnet state and contracts.

**Clear Setup Instructions:**

**Steps:**
1. Clone the repo:
   ```sh
   git clone https://github.com/AkashWarlocks/biconomy-abstract-setup.git
   cd biconomy-abstract-setup
   ```
2. Create a `.env` file with:
```sh
KEY=<PVT_KEY>
PORT=3000
REDIS_HOST=redis
REDIS_PORT=6379
DOCS_URL=https://documenter.getpostman.com/view/33713944/2sAYBd99Ec


ETHER_WHALE=<ETHER_WHALE_ADDRESS>
USDC_WHALE=<USDC_WHALE_ADDRESS>
AKASH=<EOA_ACCOUNT_ADDRESS>
AMOUNT=<USDC_TRANSFER_AMOUNT>
ETH_AMOUNT=100ether
USDC=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
AUSDC=0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c
AAVE_POOL_ADDRESS=0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2
```
1. Install dependencies:
   ```sh
   bun install
   ```
**Fund USDC to your account using Cast and Whale:**

1. Use the provided script to transfer USDC from the whale to your account:
   ```sh
   ./transfer_usdc.sh
   ```
   This script impersonates the whale and sends USDC to your account using Foundry's cast.
2. Use the provided script to transfer ether from the whale to your account:
   ```sh
   ./transfer_ether.sh
   ```
   This script impersonates the whale and sends ether to your account using Foundry's cast.


## 2. Scripts for Forking Mainnet and Starting MEE Node

```
## Local Chain Configuration Example

To ensure the Mee Node and scripts interact with your local Anvil fork, you must configure your chain JSON file correctly. Here’s how changes were made in `chains-local/1.json`:

OR USE `chains-prod/1.json` Copy paste inside `chains-local/1.json` and change `rpc` as mentioned below

```json
{
  "name": "Anvil Mainnet Fork",
  "rpc": "http://host.docker.internal:8545",
  "chainId": "1",
  "type": "evm",
  "eip1559": true,
  ...
}
```
- **name**: Set to "Anvil Mainnet Fork" for clarity.
- **rpc**: Uses `http://host.docker.internal:8545` so Docker containers can access the Anvil node running on your host machine.
- **chainId**: Set to "1" to match Ethereum mainnet.
- **Other fields**: Match mainnet token addresses and oracles for realistic simulation.

**Start MEE Node (Docker):**
```sh
docker compose up -d
```

## 3. Test Script Demonstrating the Supertransaction

Run the test script:
```sh
bun run app.ts
```
This script:
- Checks balances before and after
- Executes a supertransaction: USDC transfer, AAVE supply, aUSDC transfer

## 4. Documentation & Approach

[See the Detailed Guide](./DETAILED_GUIDE.md)