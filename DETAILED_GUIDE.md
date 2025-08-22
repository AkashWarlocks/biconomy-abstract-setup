
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

