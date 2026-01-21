// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFtsoRewardManager {
    function getEpochsWithUnclaimedRewards(address _beneficiary) 
        external view returns (uint256 _startEpoch, uint256 _endEpoch);

    function claim(
        address _rewardRecipient,
        address _rewardOwner,
        uint256 _rewardEpoch,
        bool _wrap
    ) external returns (uint256 _rewardAmount);
}