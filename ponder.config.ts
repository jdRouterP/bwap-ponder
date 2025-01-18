import { createConfig } from "ponder";
import { http, webSocket } from "viem";
import { erc20ABI } from "./abis/erc20ABI";
import { avalancheFuji, holesky } from "viem/chains";

export default createConfig({
  networks: {
    holesky: {
      chainId: holesky.id,
      transport: http(process.env.PONDER_RPC_URL_17000),
    },
    avalancheFuji: {
      chainId: avalancheFuji.id,
      transport: http(process.env.PONDER_RPC_URL_43113),
    },
  },
  contracts: {
    ERC20: {
      abi: erc20ABI,
      network: {
        holesky: {
          address: ["0x9cCad419A897FD2D4C7aC34B0D0B89bE1E9A6f8b"],
          startBlock: 3170538,
        },
        avalancheFuji: {
          address: ["0x16a2779b4F52424C89CbC897E53e5e954A25E72F"],
          startBlock: 37639802,
        },
      },
    },
  },
});
