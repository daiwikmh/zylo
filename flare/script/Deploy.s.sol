// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ZyloVault} from "../src/ZyloVault.sol";
import {FTSOStakingModule} from "../src/FTSOStakingModule.sol";

/**
 * @title DeployZylo
 * @notice Deployment script for Zylo yFLR MVP on Coston2 testnet
 * @dev Usage: forge script script/Deploy.s.sol --rpc-url coston2 --broadcast --private-key $PRIVATE_KEY
 */
contract DeployZylo is Script {
    // Coston2 testnet addresses
    address constant WNAT = 0xC67DCE33D7A8efA5FfEB961899C73fe01bCe9273;
    address constant FTSO_REWARD_MANAGER = 0xBF61Db1CDb43d196309824473fA82E5B17581159;

    function run() external {
        vm.startBroadcast();

        console.log("Deploying Zylo yFLR MVP...");
        console.log("Deployer:", msg.sender);

        // Deploy FTSO Staking Module
        console.log("\n1. Deploying FTSOStakingModule...");
        FTSOStakingModule ftsoModule = new FTSOStakingModule(
            WNAT,
            FTSO_REWARD_MANAGER
        );
        console.log("   FTSOStakingModule deployed at:", address(ftsoModule));

        // Deploy Vault
        console.log("\n2. Deploying ZyloVault...");
        ZyloVault vault = new ZyloVault(
            WNAT,
            payable(address(ftsoModule))
        );
        console.log("   ZyloVault deployed at:", address(vault));

        // Set vault in FTSO module
        console.log("\n3. Setting vault in FTSOStakingModule...");
        ftsoModule.setVault(address(vault));
        console.log("   Vault set successfully");

        // Verify deployment
        console.log("\n=== Deployment Complete ===");
        console.log("Vault:", address(vault));
        console.log("FTSO Module:", address(ftsoModule));
        console.log("WNat:", WNAT);
        console.log("FTSO Reward Manager:", FTSO_REWARD_MANAGER);

        // Display FTSO providers
        address[] memory providers = ftsoModule.getProviders();
        console.log("\nFTSO Providers:");
        for (uint i = 0; i < providers.length; i++) {
            console.log("  -", providers[i]);
        }

        console.log("\n=== Next Steps ===");
        console.log("1. Deposit FLR to vault:");
console.log(
    "   cast send %s \"depositFLR()\" --value 1ether --private-key $PRIVATE_KEY",
    address(vault)
);        console.log("\n2. Check exchange rate:");
        console.log("   cast call", address(vault), "exchangeRate()(uint256)");
        console.log("\n3. Wait 3.5 days, then claim rewards:");
        console.log(
            "   cast send %s \"claimRewards()(uint256)\" --private-key $PRIVATE_KEY",
            address(vault)
        );

        vm.stopBroadcast();
    }
}
