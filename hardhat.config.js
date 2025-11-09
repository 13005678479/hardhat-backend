require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.22",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/ea33fc8cbc4545d9ac08fba394c5046b",
      accounts: ["4323d9e4f879855a70a3c19b732dde4d1bdb0829b0c30be408ad4b8e24e45e60"]
    }
  }
};