const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken ERC20 合约测试", function () {
  let MyToken;
  let myToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // 获取签名者
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // 部署 MyToken 合约
    MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy();
    await myToken.deployed();
  });

  describe("合约部署", function () {
    it("应该正确设置名称和符号", async function () {
      expect(await myToken.name()).to.equal("JayToken");
      expect(await myToken.symbol()).to.equal("JayMKT");
    });

    it("应该为部署者铸造初始代币", async function () {
      const ownerBalance = await myToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.utils.parseEther("1000000"));
    });

    it("应该设置正确的总供应量", async function () {
      const totalSupply = await myToken.totalSupply();
      expect(totalSupply).to.equal(ethers.utils.parseEther("1000000"));
    });
  });

  describe("代币转账", function () {
    it("应该允许代币转账", async function () {
      const amount = ethers.utils.parseEther("100");
      
      // 从所有者转账给 addr1
      await myToken.transfer(addr1.address, amount);
      
      const addr1Balance = await myToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(amount);
    });

    it("应该更新余额", async function () {
      const amount = ethers.utils.parseEther("500");
      
      const initialOwnerBalance = await myToken.balanceOf(owner.address);
      await myToken.transfer(addr1.address, amount);
      
      const finalOwnerBalance = await myToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(amount));
    });

    it("应该拒绝余额不足的转账", async function () {
      const initialBalance = await myToken.balanceOf(addr1.address);
      
      // 尝试从 addr1 转账（余额为0）
      await expect(
        myToken.connect(addr1).transfer(addr2.address, ethers.utils.parseEther("1"))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("授权和转账", function () {
    it("应该允许授权代币", async function () {
      const amount = ethers.utils.parseEther("1000");
      
      // 所有者授权给 addr1
      await myToken.approve(addr1.address, amount);
      
      const allowance = await myToken.allowance(owner.address, addr1.address);
      expect(allowance).to.equal(amount);
    });

    it("应该允许授权转账", async function () {
      const amount = ethers.utils.parseEther("500");
      
      // 所有者授权给 addr1
      await myToken.approve(addr1.address, amount);
      
      // addr1 使用授权从所有者转账给 addr2
      await myToken.connect(addr1).transferFrom(owner.address, addr2.address, amount);
      
      const addr2Balance = await myToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(amount);
    });

    it("应该拒绝超额授权转账", async function () {
      const amount = ethers.utils.parseEther("100");
      
      // 所有者授权给 addr1
      await myToken.approve(addr1.address, amount);
      
      // 尝试转账超过授权金额
      await expect(
        myToken.connect(addr1).transferFrom(owner.address, addr2.address, ethers.utils.parseEther("200"))
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });
  });

  describe("事件", function () {
    it("转账时应该发出 Transfer 事件", async function () {
      const amount = ethers.utils.parseEther("100");
      
      await expect(myToken.transfer(addr1.address, amount))
        .to.emit(myToken, "Transfer")
        .withArgs(owner.address, addr1.address, amount);
    });

    it("授权时应该发出 Approval 事件", async function () {
      const amount = ethers.utils.parseEther("1000");
      
      await expect(myToken.approve(addr1.address, amount))
        .to.emit(myToken, "Approval")
        .withArgs(owner.address, addr1.address, amount);
    });
  });
});