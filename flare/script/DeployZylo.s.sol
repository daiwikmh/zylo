// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ZyloVault} from "../src/ZyloVault.sol";
import {FTSOStakingModule} from "../src/FTSOStakingModule.sol";

contract DeployZylo is Script {
    // Coston2 Constants
    address constant WNAT = 0xC67DCE33D7A8efA5FfEB961899C73fe01bCe9273;
    address constant FTSO_REWARD_MANAGER = 0xBF61Db1CDb43d196309824473fA82E5B17581159;

    function run() external {
        // Retrieve private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Staking Module
        FTSOStakingModule ftsoModule = new FTSOStakingModule(
            WNAT, 
            FTSO_REWARD_MANAGER
        );

        // 2. Deploy Vault (pointing to the module)
        ZyloVault vault = new ZyloVault(
            WNAT, 
            payable(address(ftsoModule))
        );

        // 3. Link them (Set the vault address in the module)
        ftsoModule.setVault(address(vault));

        vm.stopBroadcast();

        console.log("ZyloVault deployed to:", address(vault));
        console.log("FTSOStakingModule deployed to:", address(ftsoModule));
    }
}