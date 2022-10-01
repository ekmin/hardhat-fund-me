import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";
import "hardhat-deploy"
import "solidity-coverage";
import "typechain"
import "dotenv/config"

let GOERLI_RPC_URL: string = process.env.GOERLI_RPC_URL!;
let PRIVATE_KEY: string = process.env.PRIVATE_KEY!;
let ETHERSCAN_API_KEY: string = process.env.ETHERSCAN_API_KEY!;
let COINMARKET_API_KEY: string = process.env.COINMARKET_API_KEY!;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    goerli: { 
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 5,
    },
  },
  solidity: {
    compilers: [
        {
            version: "0.8.17",
        },
        {
            version: "0.6.6",
        },
    ],
},
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKET_API_KEY,
    token: "ETH"
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    users: {
      default: 1,
    }
  }
};

export default config;
