import "@typechain/hardhat"
import "solidity-coverage"
import "@nomicfoundation/hardhat-ethers"
import "@nomicfoundation/hardhat-chai-matchers"
import "@nomicfoundation/hardhat-verify"
import "hardhat-gas-reporter"
import "solidity-docgen"
import "hardhat-tracer"

import { config as dotEnvConfig } from "dotenv"
dotEnvConfig()

export default {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  sourcify: {
    enabled: true,
  },
  docgen: {
    pages: "files",
    templates: "utils/theme",
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    reportFormat: "markdown",
    outputFile: "gasReport.md",
    forceTerminalOutput: true,
    forceTerminalOutputFormat: "terminal",
    reportPureAndViewMethods: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    L1Etherscan: process.env.ETHERSCAN_API_KEY,
  },
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
}
