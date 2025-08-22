# Detailed Approach & Problems Faced

## Approach

### 1. Local Chain Setup with `defineChain`
To ensure the node and scripts interact with the local Anvil fork, we used viem's `defineChain`:
```typescript
import { defineChain } from "viem";

const anvilMainnetFork = defineChain({
  id: 1,
  name: "Anvil Mainnet Fork",
  network: "anvil-mainnet-fork",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
    public:  { http: ["http://localhost:8545"] },
  },
});
```
This ensures all RPC calls and contract interactions use the local fork, not the public mainnet.

### 2. Transaction Flow: USDC → Smart Account → AAVE → aUSDC → EOA
- **Transfer USDC to Smart Account:**
  ```typescript
  const transferUsdc = await orchestrator.buildComposable({
    type: "transfer",
    data: {
      recipient: nexusAddress,
      tokenAddress: usdcAddress,
      amount: amount,
      chainId: 1,
    },
  });
  ```
- **Approve AAVE Pool:**
  ```typescript
  const approve = await orchestrator.buildComposable({
    type: 'default',
    data: {
      abi: erc20Abi,
      chainId: mainnet.id,
      to: usdcAddress,
      functionName: 'approve',
      args: [aavePoolAddress, runtimeERC20BalanceOf({ targetAddress: nexusAddress, tokenAddress: usdcAddress })]
    }
  });
  ```
- **Supply USDC to AAVE:**
  ```typescript
  const supply = await orchestrator.buildComposable({
    type: 'default',
    data: {
      abi: aaveV3Abi,
      to: aavePoolAddress,
      chainId: 1,
      functionName: 'supply',
      args: [usdcAddress, runtimeERC20BalanceOf({ targetAddress: nexusAddress, tokenAddress: usdcAddress }), nexusAddress, 0n]
    }
  });
  ```
- **Transfer aUSDC back to EOA:**
  ```typescript
  const transferAUsdc = await orchestrator.buildComposable({
    type: "transfer",
    data: {
      recipient: eoa.address,
      tokenAddress: aUsdcAddress,
      amount: runtimeERC20BalanceOf({ targetAddress: nexusAddress, tokenAddress: aUsdcAddress }),
      chainId: 1,
    },
  });
  ```

### 3. Using `runtimeERC20BalanceOf` for Runtime Balance Checks
Instead of hardcoding amounts, we used:
```typescript
runtimeERC20BalanceOf({ targetAddress: nexusAddress, tokenAddress: usdcAddress })
```
This ensures the transaction uses the actual balance at execution time, making the flow dynamic and robust.

---

## Problems Faced & Solutions

### 1. Docker Compose & Private Key Exposure
**Problem:**
- Exposing the private key in the Docker Compose file is insecure.
**Solution:**
- Used an `.env` file and the `env_file` directive in `docker-compose.yml` to securely import environment variables, keeping secrets out of version control and config files.

### 2. Chain Configuration & Zero Balances
**Problem:**
- Initially used the built-in `mainnet` chain object with a local RPC URL, which led to zero balances and failed supertransactions because the chain config did not match the local fork.
**Solution:**
- Switched to using `defineChain` to create a custom chain object for the local Anvil fork, ensuring correct RPC routing and state, which fixed balance queries and transaction execution.

---
## Results

After running the supertransaction script, you can verify the outcome by checking balances using the provided script or by reviewing the logs.

### 1. Check Balances with Script
Use the following command to check your EOA's balances before and after the transaction:
```sh
./check_balance.sh <EOA_ACCOUNT_ADDRESS>
```
```sh
./check_balance_aave.sh <EOA_ACCOUNT_ADDRESS>
```
This will display the current USDC, aUSDC, and ETH balances for the specified account.

### 2. Example Log Output
Below are sample logs showing the state before and after a successful supertransaction:

#### Before Supertransaction
```
---------------Before Transaction------------------
EOA USDC Balance: 29940000000
Smart Account USDC Balance: 0
EOA aUSDC Balance: 80001017
Smart Account aUSDC Balance: 0
---------------------------------------------------
```

#### After Supertransaction
```
txn Hash Link: 0x50db5ab9ddaab37d0fbd07075a14eb394153d410696926ae8b546d084b38254e
Transaction succeeded!
---------------After Transaction------------------
EOA USDC Balance: 29930000000
Smart Account USDC Balance: 0
------------**********************----------------
EOA aUSDC Balance: 90001057
------------**********************----------------
Smart Account aUSDC Balance: 0
---------------------------------------------------
```

### What to Look For
- **USDC Balance:** Decreases in EOA, showing USDC was supplied to AAVE.
- **aUSDC Balance:** Increases in EOA, confirming receipt of interest-bearing tokens.
- **ETH Balance:** Slight decrease due to transaction gas costs.
- **Smart Account Balances:** Should be zero after the flow, as tokens are returned to EOA.

### Why This Matters
These checks confirm that:
- The supertransaction executed all steps atomically.
- Funds moved as expected between EOA, smart account, and AAVE.
- The runtime balance logic worked, using actual balances at execution time.

For troubleshooting, always compare your logs to these expected results. If balances do not update as shown, review your chain setup, environment variables, and transaction flow.
