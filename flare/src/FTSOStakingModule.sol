// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IVPToken} from "flare-periphery/src/coston2/IVPToken.sol";
import {SafeERC20} from "@openzeppelin-contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin-contracts/token/ERC20/IERC20.sol";

contract FTSOStakingModule {
    using SafeERC20 for IERC20;

    IVPToken public immutable wNat;
    address public vault;
    address[] public providers;

    modifier onlyVault() {
        require(msg.sender == vault, "Only vault");
        _;
    }

    constructor(address _wNat, address /*_ftsoRewardManager*/) {
        wNat = IVPToken(_wNat);
        providers.push(0x1000000000000000000000000000000000000003);
        providers.push(0x1000000000000000000000000000000000000004);
    }

    function setVault(address _vault) external {
        require(vault == address(0), "Vault already set");
        vault = _vault;
    }

    function delegate(uint256 /* amount */) external onlyVault {
        uint256 bips = 10000 / providers.length;
        for (uint i = 0; i < providers.length; i++) {
            wNat.delegate(providers[i], uint16(bips));
        }
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