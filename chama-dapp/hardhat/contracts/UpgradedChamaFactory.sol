// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {KRNL, KrnlPayload} from "./KRNL.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract UpgradedChamaFactory is KRNL, ReentrancyGuard {
    address public immutable tokenAuthority;

    uint256 public chamaCount;

    struct Chama {
        uint256 id;
        address creator;
        string name;
        string description;
        uint256 depositAmount;
        uint256 contributionAmount;
        uint256 penalty;
        uint256 maxMembers;
        uint256 membersCount;
        uint256 cycleDuration;
        uint256 currentRound;
        uint256 currentCycle;
        uint256 nextCycleStart;
        address[] members;
        bool isActive;
    }

    mapping(uint256 => Chama) public chamas;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public contributions;
    mapping(uint256 => mapping(address => uint256)) public memberDeposit;

    mapping(address => bool) public whitelist;
    bool public whitelistEnabled = false;

    event ChamaCreated(uint256 indexed chamaId, string name, address indexed creator);
    event JoinedChama(uint256 indexed chamaId, address indexed member);
    event ContributionMade(uint256 indexed chamaId, uint256 cycle, address indexed member, uint256 amount);
    event PayoutExecuted(uint256 indexed chamaId, uint256 cycle, address indexed recipient, uint256 totalPayout);
    event WhitelistUpdated(address indexed user, bool status);
    event WhitelistToggle(bool enabled);

    modifier onlyWhitelisted() {
        require(!whitelistEnabled || whitelist[msg.sender], "Access denied: Not whitelisted");
        _;
    }

    constructor(address _tokenAuthority) KRNL(_tokenAuthority) {
        require(_tokenAuthority != address(0), "TokenAuthority cannot be zero address");
        tokenAuthority = _tokenAuthority;
    }

    function updateWhitelist(address user, bool status) external onlyOwner {
        whitelist[user] = status;
        emit WhitelistUpdated(user, status);
    }

    function toggleWhitelist(bool enabled) external onlyOwner {
        whitelistEnabled = enabled;
        emit WhitelistToggle(enabled);
    }

    function createChama(
        string calldata name,
        string calldata description,
        uint256 depositAmount,
        uint256 contributionAmount,
        uint256 penalty,
        uint256 maxMembers,
        uint256 cycleDuration,
        KrnlPayload calldata krnlPayload
    )
        external
        onlyWhitelisted
        onlyAuthorized(krnlPayload, abi.encode(name, description, depositAmount, contributionAmount, penalty, maxMembers, cycleDuration))
        returns (uint256)
    {
        require(maxMembers > 0, "Max members must be > 0");
        require(depositAmount > 0 && contributionAmount > 0, "Invalid amounts");

        chamaCount++;
        Chama storage c = chamas[chamaCount];
        c.id = chamaCount;
        c.creator = msg.sender;
        c.name = name;
        c.description = description;
        c.depositAmount = depositAmount;
        c.contributionAmount = contributionAmount;
        c.penalty = penalty;
        c.maxMembers = maxMembers;
        c.cycleDuration = cycleDuration;
        c.currentRound = 1;
        c.currentCycle = 1;
        c.nextCycleStart = block.timestamp + cycleDuration;
        c.isActive = true;

        emit ChamaCreated(chamaCount, name, msg.sender);
        return chamaCount;
    }

    function joinChama(uint256 chamaId, KrnlPayload calldata krnlPayload)
        external
        payable
        onlyWhitelisted
        onlyAuthorized(krnlPayload, abi.encode(chamaId))
    {
        Chama storage c = chamas[chamaId];
        require(c.isActive, "Chama inactive");
        require(c.membersCount < c.maxMembers, "Chama full");
        require(msg.value == c.depositAmount, "Incorrect deposit");
        require(!isMember(chamaId, msg.sender), "Already joined");

        c.members.push(msg.sender);
        c.membersCount++;
        memberDeposit[chamaId][msg.sender] = c.depositAmount;

        emit JoinedChama(chamaId, msg.sender);
    }

    function contribute(uint256 chamaId, KrnlPayload calldata krnlPayload)
        external
        payable
        onlyWhitelisted
        onlyAuthorized(krnlPayload, abi.encode(chamaId))
    {
        Chama storage c = chamas[chamaId];
        require(c.isActive, "Inactive");
        require(isMember(chamaId, msg.sender), "Not a member");
        require(msg.value == c.contributionAmount, "Incorrect contribution");
        require(block.timestamp < c.nextCycleStart, "Cycle over");
        require(!contributions[chamaId][c.currentCycle][msg.sender], "Already contributed");

        contributions[chamaId][c.currentCycle][msg.sender] = true;
        emit ContributionMade(chamaId, c.currentCycle, msg.sender, msg.value);
    }

    function payout(uint256 chamaId, KrnlPayload calldata krnlPayload)
        external
        nonReentrant
        onlyAuthorized(krnlPayload, abi.encode(chamaId))
    {
        Chama storage c = chamas[chamaId];
        require(c.isActive, "Inactive");
        require(block.timestamp >= c.nextCycleStart, "Cycle not ended");
        require(c.membersCount == c.maxMembers, "Chama not full");

        uint256 totalPool = _calculateTotalPool(chamaId);
        address recipient = c.members[c.currentRound - 1];
        uint256 cyclePaid = c.currentCycle;

        c.currentRound = (c.currentRound % c.maxMembers) + 1;
        c.currentCycle++;
        c.nextCycleStart = block.timestamp + c.cycleDuration;

        (bool sent, ) = recipient.call{value: totalPool}("");
        require(sent, "Payout failed");

        emit PayoutExecuted(chamaId, cyclePaid, recipient, totalPool);
    }

    function _calculateTotalPool(uint256 chamaId) internal returns (uint256 pool) {
        Chama storage c = chamas[chamaId];
        for (uint256 i = 0; i < c.members.length; i++) {
            address m = c.members[i];
            if (contributions[chamaId][c.currentCycle][m]) {
                pool += c.contributionAmount;
            } else {
                uint256 penaltyFee = (c.depositAmount * c.penalty) / 100;
                require(memberDeposit[chamaId][m] >= penaltyFee, "Penalty too high");
                memberDeposit[chamaId][m] -= penaltyFee;
                pool += penaltyFee;
            }
        }
    }

    function isMember(uint256 chamaId, address user) public view returns (bool) {
        Chama storage c = chamas[chamaId];
        for (uint256 i = 0; i < c.members.length; i++) {
            if (c.members[i] == user) return true;
        }
        return false;
    }

    receive() external payable {}
}
