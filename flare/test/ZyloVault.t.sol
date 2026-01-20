// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {ZyloVault} from "../src/ZyloVault.sol";
import {FTSOStakingModule} from "../src/FTSOStakingModule.sol";

/**
 * @title ZyloVaultTest
 * @notice Basic tests for Zylo MVP
 * @dev Tests core functionality without reward claiming (requires 3.5 days)
 */
contract ZyloVaultTest is Test {
    ZyloVault public vault;
    FTSOStakingModule public ftsoModule;

    address constant WNAT = 0xC67DCE33D7A8efA5FfEB961899C73fe01bCe9273;
    address constant FTSO_REWARD_MANAGER = 0xBF61Db1CDb43d196309824473fA82E5B17581159
;

    address public user = address(0x1);

    function setUp() public {
        // Fork Coston2 testnet
        vm.createSelectFork("https://coston2-api.flare.network/ext/C/rpc");

        // Deploy FTSO module
        ftsoModule = new FTSOStakingModule(WNAT, FTSO_REWARD_MANAGER);

        // Deploy vault
        vault = new ZyloVault(WNAT, payable(address(ftsoModule)));

        // Set vault in FTSO module
        ftsoModule.setVault(address(vault));

        // Give user some FLR
        vm.deal(user, 100 ether);
    }

    /**
     * @notice Test 1: User deposits 10 FLR, receives 10 yFLR
     */
    function test_Deposit() public {
        uint256 depositAmount = 10 ether;

        vm.startPrank(user);

        // Deposit FLR
        uint256 shares = vault.depositFLR{value: depositAmount}();

        // Check shares received
        assertEq(shares, depositAmount, "Should receive 10 yFLR");
        
        uint256 userBal = vault.balanceOf(user);

        assertEq(vault.balanceOf(user), depositAmount, "User balance should be 10 yFLR");

        vm.stopPrank();

        console.log("Deposited:", depositAmount);
        console.log("Shares received:", shares);
    }

    /**
     * @notice Test 2: Exchange rate starts at 1.0
     */
    function test_ExchangeRateStartsAtOne() public {
        uint256 depositAmount = 10 ether;

        vm.startPrank(user);
        vault.depositFLR{value: depositAmount}();
        vm.stopPrank();

        uint256 rate = vault.exchangeRate();

        assertEq(rate, 1e18, "Exchange rate should be 1.0 (1e18)");

        console.log("Exchange rate:", rate);
        console.log("Exchange rate (human):", rate / 1e18);
    }

    /**
     * @notice Test 3: Verify WNat was delegated to FTSO providers
     */
    function test_Delegation() public {
        uint256 depositAmount = 10 ether;

        vm.startPrank(user);
        vault.depositFLR{value: depositAmount}();
        vm.stopPrank();

        // Check FTSO module received WNat
        uint256 moduleBalance = ftsoModule.getTotalBalance();
        assertEq(moduleBalance, depositAmount, "FTSO module should have 10 WNat");

        // Check providers are set
        address[] memory providers = ftsoModule.getProviders();
        assertEq(providers.length, 2, "Should have 2 providers");

        console.log("Module balance:", moduleBalance);
        console.log("Number of providers:", providers.length);
    }

    /**
     * @notice Test 4: User withdraws FLR (undelegates from FTSO)
     */
    function test_Withdraw() public {
    uint256 depositAmount = 10 ether;
    vm.startPrank(user);

    // 1. Deposit
    vault.depositFLR{value: depositAmount}();
    
    // 2. Prepare Withdrawal
    uint256 balanceBeforeWithdraw = user.balance;
    uint256 sharesToWithdraw = 5 ether; 

    // 3. Execution
    // This will trigger ZyloVault._withdraw -> Module.withdrawToVault
    uint256 assetsReceived = vault.withdrawFLR(sharesToWithdraw);
    // 4. Assertions
    assertEq(assetsReceived, 5 ether, "Should receive 5 WNat/FLR");
    assertEq(user.balance, balanceBeforeWithdraw + 5 ether, "Native FLR balance mismatch");
    assertEq(vault.balanceOf(user), 5 ether, "Vault share balance mismatch");
    
    vm.stopPrank();
}

    /**
     * @notice Test 5: Total assets calculation
     */
    function test_TotalAssets() public {
        uint256 depositAmount = 10 ether;

        vm.startPrank(user);
        vault.depositFLR{value: depositAmount}();
        vm.stopPrank();

        uint256 total = vault.totalAssets();

        assertEq(total, depositAmount, "Total assets should equal deposit");

        console.log("Total assets:", total);
    }

    /**
     * @notice Test 6: Multiple deposits maintain exchange rate
     */
    function test_MultipleDeposits() public {
        vm.startPrank(user);

        // First deposit
        vault.depositFLR{value: 5 ether}();

        uint256 rateAfterFirst = vault.exchangeRate();

        // Second deposit
        vault.depositFLR{value: 5 ether}();

        uint256 rateAfterSecond = vault.exchangeRate();

        // Rate should stay the same (no rewards yet)
        assertEq(rateAfterFirst, rateAfterSecond, "Exchange rate should remain 1.0");

        vm.stopPrank();

        console.log("Rate after first deposit:", rateAfterFirst);
        console.log("Rate after second deposit:", rateAfterSecond);
    }
}
