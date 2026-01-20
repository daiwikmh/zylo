// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC4626} from "@openzeppelin-contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin-contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin-contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol";
import {FTSOStakingModule} from "./FTSOStakingModule.sol";

interface IWNat is IERC20 {
    function deposit() external payable;
    function withdraw(uint256 amount) external;
}

contract ZyloVault is ERC4626 {
    using SafeERC20 for IERC20;

    FTSOStakingModule public immutable ftsoModule;

    constructor(address _wNat, address payable _ftsoModule) 
        ERC4626(IERC20(_wNat)) 
        ERC20("Zylo Flare", "yFLR") 
    {
        ftsoModule = FTSOStakingModule(_ftsoModule);
    }

    function depositFLR() external payable returns (uint256 shares) {
        require(msg.value > 0, "Zero FLR");
        
        // 1. Preview shares BEFORE wrapping to maintain correct ratio
        shares = previewDeposit(msg.value);

        // 2. Wrap FLR inside Vault
        IWNat(address(asset())).deposit{value: msg.value}();
        
        // 3. Mint yFLR to user
        _mint(msg.sender, shares);

        // 4. Send to Module for delegation
        _stakeAssets(msg.value);

        emit Deposit(msg.sender, msg.sender, msg.value, shares);
    }

    function withdrawFLR(uint256 shares) external returns (uint256 assets) {
        require(shares > 0, "Zero shares");
        
        // redeem() calls internal _withdraw, which pulls funds from Module
assets = redeem(shares, address(this), msg.sender);
        // Unwrap WNat to native FLR
       
    }

    // --- ERC4626 Overrides ---

    function totalAssets() public view override returns (uint256) {
        return IERC20(asset()).balanceOf(address(this)) + ftsoModule.getTotalBalance();
    }

    function maxRedeem(address owner) public view override returns (uint256) {
        return balanceOf(owner);
    }

    function maxWithdraw(address owner) public view override returns (uint256) {
        return convertToAssets(balanceOf(owner));
    }

    // Standard entry points are disabled to force depositFLR usage for MVP
    function deposit(uint256, address) public pure override returns (uint256) { revert("Use depositFLR"); }
    function mint(uint256, address) public pure override returns (uint256) { revert("Use depositFLR"); }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        // 1. Check liquid balance
        uint256 vaultBal = IERC20(asset()).balanceOf(address(this));
        if (vaultBal < assets) {
            ftsoModule.withdrawToVault(assets - vaultBal);
        }

        // 2. BURN the shares (standard logic)
        if (caller != owner) {
            _spendAllowance(owner, caller, shares);
        }
        _burn(owner, shares);

        // 3. DO NOT call super._withdraw (to avoid the self-transfer/WNat transfer)
        // Instead, we unwrap the WNat directly from the vault and send FLR to receiver
        IWNat(address(asset())).withdraw(assets);
        
        (bool ok, ) = receiver.call{value: assets}("");
        require(ok, "FLR transfer failed");

        emit Withdraw(caller, receiver, owner, assets, shares);
    }

    function _stakeAssets(uint256 assets) internal {
        IERC20(asset()).safeTransfer(address(ftsoModule), assets);
        ftsoModule.delegate(assets);
    }

    function exchangeRate() public view returns (uint256) {
        uint256 supply = totalSupply();
        return (supply == 0) ? 1e18 : (totalAssets() * 1e18) / supply;
    }

    receive() external payable {}
}