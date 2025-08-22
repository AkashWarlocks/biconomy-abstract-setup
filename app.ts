/**
 * Mee Node Orchestrator Example
 *
 * This script demonstrates:
 * 1. Checking balances of ETH, USDC, and aUSDC for EOA and Nexus Smart Account
 * 2. Building and executing a multi-step transaction:
 *    - Transfer USDC from EOA to Nexus Smart Account
 *    - Approve AAVE pool to spend USDC
 *    - Supply USDC to AAVE pool
 *    - Transfer received aUSDC back to EOA
 * 3. Printing final balances after transaction execution
 *
 * Environment variables required in .env:
 *   KEY, KEY_2, USDC, AUSDC
 */

import { createMeeClient, toMultichainNexusAccount, getMEEVersion, MEEVersion, Trigger, runtimeERC20BalanceOf } from "@biconomy/abstractjs";
import { Address, http, defineChain } from "viem";
import { readContract, getBalance } from "viem/actions";
import { erc20Abi, parseAbi, parseUnits, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";

// Load EOA accounts from environment
const eoa = privateKeyToAccount(Bun.env.KEY as `0x${string}`);

// Contract addresses from environment
const aUsdcAddress: Address = Bun.env.AUSDC as `0x${string}`; // aUSDC address
const usdcAddress: Address = Bun.env.USDC as `0x${string}`;   // USDC address
const aavePoolAddress: Address = Bun.env.AAVE_POOL_ADDRESS as `0x${string}`; // Aave Pool address

// URLS
const RPC_URL = Bun.env.RPC_URL || 'http://localhost:8545';

// Define custom chain for Anvil mainnet fork
export const anvilMainnetFork = defineChain({
  id: 1,
  name: "Anvil Mainnet Fork",
  network: "anvil-mainnet-fork",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public:  { http: [RPC_URL] },
  },
});

// Create orchestrator smart account
const orchestrator = await toMultichainNexusAccount({
  chainConfigurations: [
    {
      chain: anvilMainnetFork,
      transport: http(RPC_URL),
      version: getMEEVersion(MEEVersion.V2_1_0)
    }
  ],
  signer: eoa
});

// Create Mee client for node interaction
const meeClient = await createMeeClient({
  account: orchestrator,
  url: 'http://localhost:3000/v3',
});      

// Create public client for direct balance queries
const cclient = createPublicClient({
  chain: anvilMainnetFork,
  transport: http(),
});

// Utility function to get ERC20 token balance
async function getTokenBalance(client: any, tokenAddress: Address, account: Address) {
  return await readContract(client, {
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account],
  });
}

// Print balances before transaction
console.log('---------------Before Transaction------------------');
console.log(`EOA USDC Balance: ${await getTokenBalance(cclient, usdcAddress, eoa.address)}`);
console.log(`Smart Account USDC Balance: ${await getTokenBalance(cclient, usdcAddress, orchestrator.addressOn(anvilMainnetFork.id, true))}`);
console.log(`EOA aUSDC Balance: ${await getTokenBalance(cclient, aUsdcAddress, eoa.address)}`);
console.log(`Smart Account aUSDC Balance: ${await getTokenBalance(cclient, aUsdcAddress, orchestrator.addressOn(anvilMainnetFork.id, true))}`);
console.log(`EOA ETH Balance: ${await getBalance(cclient, { address: eoa.address })}`);
console.log('---------------------------------------------------');

// Transaction parameters
const nexusAddress: Address = orchestrator.addressOn(anvilMainnetFork.id, true); // Nexus Smart account address
const amount = parseUnits("10", 6); // 10 USDC in smallest unit (6 decimals)

// Build transaction steps
const transferUsdc = await orchestrator.buildComposable({
  type: "transfer",
  data: {
    recipient: nexusAddress,
    tokenAddress: usdcAddress,
    amount: amount,
    chainId: anvilMainnetFork.id,
  },
});

const approve = await orchestrator.buildComposable({
  type: 'default',
  data: {
    abi: erc20Abi,
    chainId: anvilMainnetFork.id,
    to: usdcAddress,
    functionName: 'approve',
    args: [
      aavePoolAddress,
      runtimeERC20BalanceOf({ targetAddress: nexusAddress, tokenAddress: usdcAddress })
    ]
  }
});

const aaveV3Abi = parseAbi([
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external'
]);

const supply = await orchestrator.buildComposable({
  type: 'default',
  data: {
    abi: aaveV3Abi,
    to: aavePoolAddress,
    chainId: anvilMainnetFork.id,
    functionName: 'supply',
    args: [
      usdcAddress,
      runtimeERC20BalanceOf({ targetAddress: nexusAddress, tokenAddress: usdcAddress }),
      nexusAddress,
      0n
    ]
  }
});

const transferAUsdc = await orchestrator.buildComposable({
  type: "transfer",
  data: {
    recipient: eoa.address,
    tokenAddress: aUsdcAddress,
    amount: runtimeERC20BalanceOf({ targetAddress: nexusAddress, tokenAddress: aUsdcAddress }),
    chainId: anvilMainnetFork.id,
  },
});

// Trigger for fusion quote
const trigger: Trigger = {
  chainId: anvilMainnetFork.id,
  tokenAddress: usdcAddress,
  amount: amount
};

// Get fusion quote and execute transaction
const fusionQuote = await meeClient.getFusionQuote({
  instructions: [transferUsdc, approve, supply, transferAUsdc],
  trigger,
  feeToken: {
    address: usdcAddress,
    chainId: anvilMainnetFork.id
  }
});

console.log({ fusionQuote: fusionQuote.quote.paymentInfo });

const { hash } = await meeClient.executeFusionQuote({ fusionQuote });
console.log(`txn Hash Link: ${hash}`);

const receipt = await meeClient.waitForSupertransactionReceipt({ hash, confirmations: 2 });

if (receipt.transactionStatus === 'MINED_SUCCESS') {
  console.log('Transaction succeeded!');
  // Print balances after transaction
console.log('---------------After Transaction------------------');
console.log(`EOA USDC Balance: ${await getTokenBalance(cclient, usdcAddress, eoa.address)}`);
console.log(`Smart Account USDC Balance: ${await getTokenBalance(cclient, usdcAddress, nexusAddress)}`);
console.log('------------**********************----------------');

console.log(`EOA aUSDC Balance: ${await getTokenBalance(cclient, aUsdcAddress, eoa.address)}`);
console.log('------------**********************----------------');

console.log(`Smart Account aUSDC Balance: ${await getTokenBalance(cclient, aUsdcAddress, nexusAddress)}`);
console.log(`EOA ETH Balance: ${await getBalance(cclient, { address: eoa.address })}`);
console.log('---------------------------------------------------');
} else {
  console.error('Failed:', receipt.transactionStatus);
}


