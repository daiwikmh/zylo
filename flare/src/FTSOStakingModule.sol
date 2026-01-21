// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IVPToken} from "flare-periphery/src/coston2/IVPToken.sol";
import {SafeERC20} from "@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin-contracts/token/ERC20/IERC20.sol";
import {IFtsoRewardManager} from "./IFtsoRewardManager.sol"; // Import the interface above

contract FTSOStakingModule {
    using SafeERC20 for IERC20;

    IVPToken public immutable wNat;
    IFtsoRewardManager public immutable ftsoRewardManager; // Added this
    address public vault;
    address[] public providers;

    modifier onlyVault() {
        require(msg.sender == vault, "Only vault");
        _;
    }

    constructor(address _wNat, address _ftsoRewardManager) {
        wNat = IVPToken(_wNat);
        ftsoRewardManager = IFtsoRewardManager(_ftsoRewardManager);
        providers.push(0x1000000000000000000000000000000000000013);
        providers.push(0x1000000000000000000000000000000000000014);
    }

    function setVault(address _vault) external {
        require(vault == address(0), "Vault already set");
        vault = _vault;
    }

    function delegate(uint256 /* amount */) external onlyVault {
        uint256 bips = 10000 / providers.length;
        for (uint i = 1; i < providers.length; i++) {
            wNat.delegate(providers[i], uint16(bips));
        }
    }

    function claimRewards() external returns (uint256) {
    // 1. Identify which reward epochs are available
    (uint256 startEpoch, uint256 endEpoch) = ftsoRewardManager.getEpochsWithUnclaimedRewards(address(this));
    
    if (endEpoch < startEpoch) return 0;

    uint256 balanceBefore = wNat.balanceOf(address(this));

    // 2. Claim rewards for all providers we delegated to
    // Flare rewards are claimed to 'address(this)' and automatically wrapped to WNat
    for (uint256 i = 0; i < providers.length; i++) {
        ftsoRewardManager.claim(
            address(this),        // Reward recipient
            address(this),        // Reward owner (the module)
            endEpoch,             // Current claimable epoch
            true                  // Wrap to WNat immediately
        );
    }

    uint256 balanceAfter = wNat.balanceOf(address(this));
    return balanceAfter - balanceBefore;
}

    function withdrawToVault(uint256 amount) external onlyVault {
        IERC20(address(wNat)).safeTransfer(vault, amount);
    }

    function getTotalBalance() external view returns (uint256) {
        return wNat.balanceOf(address(this));
    }

    function getProviders() external view returns (address[] memory) {
        return providers;
    }
}