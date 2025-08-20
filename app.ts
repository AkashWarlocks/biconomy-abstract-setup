import { createMeeClient, toMultichainNexusAccount, getMEEVersion, MEEVersion } from "@biconomy/abstractjs";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, optimism, mainnet } from "viem/chains";

const eoa = privateKeyToAccount(Bun.env.KEY as `0x${string}`)

const orchestrator = await toMultichainNexusAccount({
    chainConfigurations: [
     
      {
        chain: mainnet,
        transport: http("http://localhost:8545"),
        version: getMEEVersion(MEEVersion.V2_1_0)  
      }
    ],
    signer: eoa
  })

  const meeClient = await createMeeClient({
    account: orchestrator,
    url: 'http://localhost:3000/v3',
  })

  console.log(meeClient.info.supportedChains);