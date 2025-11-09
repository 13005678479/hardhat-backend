async function main() {
  console.log("开始部署...");
  
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

  // 部署 MyToken 合约
  const MyToken = await ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy();
  
  await myToken.deployed();
  
  console.log("部署成功!");
  console.log("合约地址:", myToken.address);
}

main().catch((error) => {
  console.error("部署失败:", error);
  process.exitCode = 1;
});