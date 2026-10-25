// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GravenToken
 * @dev Standard self-contained ERC-20 Token for Graven Protocol on Robinhood Chain Testnet (Chain ID 46630).
 * Ready to copy and paste directly into Remix IDE (remix.ethereum.org) with zero dependencies.
 */
contract GravenToken {
    string public name = "Graven Token";
    string public symbol = "GRAVEN";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "GravenToken: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Automatically mint 10,000,000 $GRAVEN directly to deployer wallet
        _mint(msg.sender, 10_000_000 * 10 ** 18);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "GravenToken: transfer to zero address");
        require(balanceOf[msg.sender] >= amount, "GravenToken: insufficient balance");

        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(to != address(0), "GravenToken: transfer to zero address");
        require(balanceOf[from] >= amount, "GravenToken: insufficient balance");
        require(allowance[from][msg.sender] >= amount, "GravenToken: insufficient allowance");

        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    /// @notice Free testnet faucet function: gives 25,000 $GRAVEN to whoever calls it
    function faucet() external {
        _mint(msg.sender, 25_000 * 10 ** 18);
    }

    /// @notice Mint additional tokens to any address for testing
    function mint(address to, uint256 amount) external returns (bool) {
        _mint(to, amount);
        return true;
    }

    function _mint(address to, uint256 amount) internal {
        require(to != address(0), "GravenToken: mint to zero address");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "GravenToken: new owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
