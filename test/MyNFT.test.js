const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT ERC721 合约测试", function () {
  let MyNFT;
  let myNFT;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // 获取签名者
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // 部署 MyNFT 合约
    MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy("https://ipfs.io/ipfs/");
    await myNFT.deployed();
  });

  describe("合约部署", function () {
    it("应该正确设置名称和符号", async function () {
      expect(await myNFT.name()).to.equal("MyNFT");
      expect(await myNFT.symbol()).to.equal("MNFT");
    });

    it("应该设置正确的铸造价格", async function () {
      const mintPrice = await myNFT.MINT_PRICE();
      expect(mintPrice).to.equal(ethers.utils.parseEther("0.001"));
    });

    it("应该设置正确的最大供应量", async function () {
      const maxSupply = await myNFT.MAX_SUPPLY();
      expect(maxSupply).to.equal(1000);
    });

    it("应该设置正确的基础 URI", async function () {
      const baseURI = await myNFT.baseTokenURI();
      expect(baseURI).to.equal("https://ipfs.io/ipfs/");
    });
  });

  describe("免费铸造", function () {
    it("应该允许所有者免费铸造 NFT", async function () {
      const tokenURI = "QmTestHash1";
      
      await myNFT.mintForFree(addr1.address, tokenURI);
      
      expect(await myNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await myNFT.tokenURI(0)).to.equal("https://ipfs.io/ipfs/QmTestHash1");
    });

    it("应该发出 NFTMinted 事件", async function () {
      const tokenURI = "QmTestHash2";
      
      await expect(myNFT.mintForFree(addr1.address, tokenURI))
        .to.emit(myNFT, "NFTMinted")
        .withArgs(addr1.address, 0, tokenURI);
    });

    it("应该拒绝非所有者免费铸造", async function () {
      const tokenURI = "QmTestHash3";
      
      await expect(
        myNFT.connect(addr1).mintForFree(addr2.address, tokenURI)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("付费铸造", function () {
    it("应该允许用户付费铸造 NFT", async function () {
      const tokenURI = "QmPaidHash";
      const mintPrice = await myNFT.MINT_PRICE();
      
      await myNFT.connect(addr1).mint(tokenURI, { value: mintPrice });
      
      expect(await myNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await myNFT.tokenURI(0)).to.equal("https://ipfs.io/ipfs/QmPaidHash");
    });

    it("应该拒绝支付不足的铸造", async function () {
      const tokenURI = "QmTestHash";
      
      await expect(
        myNFT.connect(addr1).mint(tokenURI, { value: ethers.utils.parseEther("0.0005") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("付费铸造时应该更新合约余额", async function () {
      const tokenURI = "QmTestHash";
      const mintPrice = await myNFT.MINT_PRICE();
      
      const initialBalance = await ethers.provider.getBalance(myNFT.address);
      
      await myNFT.connect(addr1).mint(tokenURI, { value: mintPrice });
      
      const finalBalance = await ethers.provider.getBalance(myNFT.address);
      expect(finalBalance).to.equal(initialBalance.add(mintPrice));
    });
  });

  describe("批量铸造", function () {
    it("应该允许批量铸造 NFT", async function () {
      const recipients = [addr1.address, addr2.address];
      const tokenURIs = ["QmBatch1", "QmBatch2"];
      
      await myNFT.batchMint(recipients, tokenURIs);
      
      expect(await myNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await myNFT.ownerOf(1)).to.equal(addr2.address);
      expect(await myNFT.totalSupply()).to.equal(2);
    });

    it("应该拒绝数组长度不匹配的批量铸造", async function () {
      const recipients = [addr1.address, addr2.address];
      const tokenURIs = ["QmBatch1"]; // 长度不匹配
      
      await expect(
        myNFT.batchMint(recipients, tokenURIs)
      ).to.be.revertedWith("Arrays length mismatch");
    });

    it("应该拒绝超过最大供应量的批量铸造", async function () {
      const recipients = [];
      const tokenURIs = [];
      
      // 创建1001个地址和URI（超过最大供应量1000）
      for (let i = 0; i < 1001; i++) {
        recipients.push(addr1.address);
        tokenURIs.push(`QmBatch${i}`);
      }
      
      await expect(
        myNFT.batchMint(recipients, tokenURIs)
      ).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("NFT 转账", function () {
    beforeEach(async function () {
      // 先铸造一个 NFT
      await myNFT.mintForFree(addr1.address, "QmTransferTest");
    });

    it("应该允许 NFT 所有者转账", async function () {
      await myNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 0);
      
      expect(await myNFT.ownerOf(0)).to.equal(addr2.address);
    });

    it("应该拒绝非所有者转账", async function () {
      await expect(
        myNFT.connect(addr2).transferFrom(addr1.address, addr2.address, 0)
      ).to.be.revertedWith("ERC721: caller is not token owner or approved");
    });

    it("转账时应该发出 Transfer 事件", async function () {
      await expect(myNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 0))
        .to.emit(myNFT, "Transfer")
        .withArgs(addr1.address, addr2.address, 0);
    });
  });

  describe("供应量限制", function () {
    it("应该拒绝超过最大供应量的铸造", async function () {
      // 铸造1000个NFT
      for (let i = 0; i < 1000; i++) {
        await myNFT.mintForFree(addr1.address, `QmTest${i}`);
      }
      
      // 尝试铸造第1001个
      await expect(
        myNFT.mintForFree(addr1.address, "QmOverflow")
      ).to.be.revertedWith("Max supply reached");
    });
  });

  describe("提现功能", function () {
    it("应该允许所有者提现", async function () {
      // 先铸造一些NFT获取收入
      const mintPrice = await myNFT.MINT_PRICE();
      await myNFT.connect(addr1).mint("QmWithdraw", { value: mintPrice });
      
      const contractBalance = await ethers.provider.getBalance(myNFT.address);
      expect(contractBalance).to.equal(mintPrice);
      
      // 所有者提现
      const ownerInitialBalance = await ethers.provider.getBalance(owner.address);
      await myNFT.withdraw();
      
      const contractFinalBalance = await ethers.provider.getBalance(myNFT.address);
      expect(contractFinalBalance).to.equal(0);
    });

    it("应该拒绝非所有者提现", async function () {
      await expect(
        myNFT.connect(addr1).withdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("应该拒绝余额为0的提现", async function () {
      await expect(
        myNFT.withdraw()
      ).to.be.revertedWith("No balance to withdraw");
    });
  });

  describe("基础 URI 更新", function () {
    it("应该允许所有者更新基础 URI", async function () {
      const newBaseURI = "https://example.com/";
      await myNFT.setBaseTokenURI(newBaseURI);
      
      expect(await myNFT.baseTokenURI()).to.equal(newBaseURI);
    });

    it("应该拒绝非所有者更新基础 URI", async function () {
      const newBaseURI = "https://example.com/";
      
      await expect(
        myNFT.connect(addr1).setBaseTokenURI(newBaseURI)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});