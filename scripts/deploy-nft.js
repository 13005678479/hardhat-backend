async function main() {
  console.log("开始部署 NFT 合约...");
  
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署者地址:", deployer.address);
  
  // 检查余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("余额:", ethers.utils.formatEther(balance), "ETH");
  
  if (balance < ethers.utils.parseEther("0.001")) {
    console.log("余额不足，请获取测试币");
    return;
  }

  // 部署 MyNFT 合约
  const MyNFT = await ethers.getContractFactory("MyNFT");
  
  // 设置基础 URI（可以使用 Pinata 或 IPFS URI）
  const baseURI = "https://ipfs.io/ipfs/";
  const myNFT = await MyNFT.deploy(baseURI);
  
  await myNFT.deployed();
  
  console.log("NFT 合约部署成功!");
  console.log("合约地址:", myNFT.address);
  console.log("合约名称:", await myNFT.name());
  console.log("合约符号:", await myNFT.symbol());
  console.log("最大供应量:", await myNFT.MAX_SUPPLY());
  console.log("铸造价格:", ethers.utils.formatEther(await myNFT.MINT_PRICE()), "ETH");
  console.log("基础 URI:", await myNFT.baseTokenURI());
  
  // 铸造一个测试 NFT
  console.log("\n铸造测试 NFT...");
  const testTokenURI = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"; // 示例 IPFS hash
  
  // 使用所有者权限免费铸造
  const mintTx = await myNFT.mintForFree(deployer.address, testTokenURI);
  await mintTx.wait();
  
  console.log("测试 NFT 铸造成功!");
  console.log("Token ID: 0");
  console.log("Token URI:", testTokenURI);
  console.log("总供应量:", await myNFT.totalSupply());
  
  // 验证 NFT 所有权
  const owner = await myNFT.ownerOf(0);
  console.log("NFT 0 的所有者:", owner);
  
  // 获取 NFT 的完整 URI
  const fullTokenURI = await myNFT.tokenURI(0);
  console.log("完整 Token URI:", fullTokenURI);
}

main().catch((error) => {
  console.error("部署失败:", error);
  process.exitCode = 1;
});