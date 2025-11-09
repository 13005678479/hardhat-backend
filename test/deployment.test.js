const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("部署脚本测试", function () {
  describe("ERC20 代币部署", function () {
    it("应该成功部署 MyToken 合约", async function () {
      const [deployer] = await ethers.getSigners();
      
      const MyToken = await ethers.getContractFactory("MyToken");
      const myToken = await MyToken.deploy();
      await myToken.deployed();
      
      // 验证合约基本信息
      expect(await myToken.name()).to.equal("MyToken");
      expect(await myToken.symbol()).to.equal("MTK");
      
      // 验证初始代币分配
      const deployerBalance = await myToken.balanceOf(deployer.address);
      expect(deployerBalance).to.equal(ethers.utils.parseEther("1000000"));
      
      // 验证总供应量
      const totalSupply = await myToken.totalSupply();
      expect(totalSupply).to.equal(ethers.utils.parseEther("1000000"));
    });
  });

  describe("ERC721 NFT 部署", function () {
    it("应该成功部署 MyNFT 合约", async function () {
      const [deployer] = await ethers.getSigners();
      
      const MyNFT = await ethers.getContractFactory("MyNFT");
      const baseURI = "https://ipfs.io/ipfs/";
      const myNFT = await MyNFT.deploy(baseURI);
      await myNFT.deployed();
      
      // 验证合约基本信息
      expect(await myNFT.name()).to.equal("MyNFT");
      expect(await myNFT.symbol()).to.equal("MNFT");
      
      // 验证配置参数
      expect(await myNFT.MAX_SUPPLY()).to.equal(1000);
      expect(await myNFT.MINT_PRICE()).to.equal(ethers.utils.parseEther("0.001"));
      expect(await myNFT.baseTokenURI()).to.equal(baseURI);
      
      // 验证初始供应量
      expect(await myNFT.totalSupply()).to.equal(0);
    });

    it("应该能够铸造测试 NFT", async function () {
      const [deployer] = await ethers.getSigners();
      
      const MyNFT = await ethers.getContractFactory("MyNFT");
      const myNFT = await MyNFT.deploy("https://ipfs.io/ipfs/");
      await myNFT.deployed();
      
      // 铸造测试 NFT
      const testTokenURI = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
      await myNFT.mintForFree(deployer.address, testTokenURI);
      
      // 验证 NFT 信息
      expect(await myNFT.ownerOf(0)).to.equal(deployer.address);
      expect(await myNFT.tokenURI(0)).to.equal("https://ipfs.io/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco");
      expect(await myNFT.totalSupply()).to.equal(1);
    });
  });

  describe("余额检查", function () {
    it("应该正确检查部署者余额", async function () {
      const [deployer] = await ethers.getSigners();
      
      const balance = await ethers.provider.getBalance(deployer.address);
      
      // 余额应该大于0
      expect(balance.gt(0)).to.be.true;
      
      // 格式化余额显示
      const formattedBalance = ethers.utils.formatEther(balance);
      expect(parseFloat(formattedBalance)).to.be.greaterThan(0);
    });
  });

  describe("网络配置", function () {
    it("应该能够连接到本地网络", async function () {
      const [deployer] = await ethers.getSigners();
      
      // 验证网络连接
      const blockNumber = await ethers.provider.getBlockNumber();
      expect(blockNumber).to.be.a("number");
      
      // 验证账户地址
      expect(deployer.address).to.match(/^0x[a-fA-F0-9]{40}$/);
    });
  });
});