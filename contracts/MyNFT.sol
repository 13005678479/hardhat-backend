// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // 基础 URI 用于 tokenURI
    string private _baseTokenURI;
    
    // 铸造价格
    uint256 public constant MINT_PRICE = 0.001 ether;
    
    // 最大供应量
    uint256 public constant MAX_SUPPLY = 1000;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, string tokenURI_);
    
    constructor(string memory baseTokenURI_) 
        ERC721("MyNFT", "MNFT") 
        Ownable()
    {
        _baseTokenURI = baseTokenURI_;
    }
    
    // 公开铸造函数
    function mint(string memory tokenURI_) public payable {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        
        emit NFTMinted(msg.sender, tokenId, tokenURI_);
    }
    
    // 免费铸造（仅合约所有者）
    function mintForFree(address to, string memory tokenURI_) public onlyOwner {
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        
        emit NFTMinted(to, tokenId, tokenURI_);
    }
    
    // 批量铸造
    function batchMint(address[] memory recipients, string[] memory tokenURIs) public onlyOwner {
        require(recipients.length == tokenURIs.length, "Arrays length mismatch");
        require(_tokenIdCounter.current() + recipients.length <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            
            emit NFTMinted(recipients[i], tokenId, tokenURIs[i]);
        }
    }
    
    // 查询总供应量
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    // 提现函数
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    // 重写 tokenURI 函数
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    // 重写 _burn 函数
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    // 重写 supportsInterface 函数
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // 获取基础 URI
    function baseTokenURI() public view returns (string memory) {
        return _baseTokenURI;
    }
    
    // 更新基础 URI（仅所有者）
    function setBaseTokenURI(string memory newBaseTokenURI) public onlyOwner {
        _baseTokenURI = newBaseTokenURI;
    }
}