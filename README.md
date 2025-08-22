# Mee Node Quick Start & Testing Guide

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
   ```
   KEY=<your_eoa_private_key>
   USDC=0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
   AUSDC=0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c
   AAVE_POOL_ADDRESS=0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2
   ```
3. Install dependencies:
   ```sh
   bun install
   ```
**Fund USDC to your account using Cast and Whale:**
1. Update up your environment variables in `.env`:
   ```
   USDC=<usdc_contract_address>
   USDC_WHALE=<whale_address>
   AKASH=<your_account_address>
   AMOUNT=<amount_in_usdc>
   ETHER_AMOUNT=<amount_in_ether>
   ETHER_WHALE=<ether_whale_address>
   ```
2. Use the provided script to transfer USDC from the whale to your account:
   ```sh
   ./transfer_usdc.sh
   ```
   This script impersonates the whale and sends USDC to your account using Foundry's cast.
3. Use the provided script to transfer ether from the whale to your account:
   ```sh
   ./transfer_ether.sh
   ```
   This script impersonates the whale and sends ether to your account using Foundry's cast.


## 2. Scripts for Forking Mainnet and Starting MEE Node

**Fork Mainnet with Anvil:**
```sh
anvil --fork-url https://rpc.ankr.com/eth --block-base-fee-per-gas 0 --chain-id 1 --port 8545
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

## 5. Documentation & Approach

**Approach:**
- Used Bun for fast TypeScript execution.
- Used Foundry’s Anvil to fork Ethereum mainnet locally for safe testing.
- Used Docker Compose to run the MEE node and Redis.
- The script demonstrates a multi-step supertransaction using the MEE node’s API and prints all relevant balances.

**Challenges:**
- Ensuring all contract addresses and ABIs are correct for mainnet fork.
- Handling Docker networking (`host.docker.internal`) for RPC access.
- Managing environment variables for private keys and token addresses securely.

---
 ## RESULTS

 