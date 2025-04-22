// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {KRNL, KrnlPayload} from "./KRNL.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";


contract ChamaFactory is KRNL, ReentrancyGuard {
    // TokenAuthority reference
    address public tokenAuthority;

        constructor(address _tokenAuthorityPublicKey) KRNL(_tokenAuthorityPublicKey) {
        tokenAuthority = _tokenAuthorityPublicKey;
    }

    // Original state variables
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

    // Original events
    event ChamaCreated(uint256 indexed chamaId, string name, address indexed creator);
    event JoinedChama(uint256 indexed chamaId, address indexed member);
    event ContributionMade(uint256 indexed chamaId, uint256 cycle, address indexed member, uint256 amount);
    event PayoutExecuted(uint256 indexed chamaId, uint256 cycle, address indexed recipient, uint256 totalPayout);

    // Whitelisting (optional)
    mapping(address => bool) public whitelist;
    bool public whitelistEnabled = true;

    // Events for whitelisting
    event WhitelistUpdated(address indexed user, bool status);



    // Modifier for whitelisting (optional)
    modifier onlyWhitelisted() {
        require(!whitelistEnabled || whitelist[msg.sender], "Access denied: Not whitelisted");
        _;
    }

    // Function to update whitelist (optional)
    function updateWhitelist(address user, bool _status) external onlyOwner {
        whitelist[user] = _status;
        emit WhitelistUpdated(user, _status);
    }

    // Function to toggle whitelist (optional)
    function toggleWhitelist(bool enabled) external onlyOwner {
        whitelistEnabled = enabled;
    }

    /**
     * @notice Creates a new Chama.
     * @dev Integrates KRNL validation for creating a Chama.
     */
    function createChama(
        string memory _name,
        string memory _description,
        uint256 _depositAmount,
        uint256 _contributionAmount,
        uint256 _penalty,
        uint256 _maxMembers,
        uint256 _cycleDuration,
        KrnlPayload memory krnlPayload
    ) external onlyWhitelisted onlyAuthorized(krnlPayload, abi.encode(_name, _description, _depositAmount, _contributionAmount, _penalty, _maxMembers, _cycleDuration)) returns (uint256) {
        require(_maxMembers > 0, "Max members must be > 0");
        require(_depositAmount > 0, "Deposit amount must be > 0");
        require(_contributionAmount > 0, "Contribution amount must be > 0");

        chamaCount++;
        Chama storage newChama = chamas[chamaCount];
        newChama.id = chamaCount;
        newChama.creator = msg.sender;
        newChama.name = _name;
        newChama.description = _description;
        newChama.depositAmount = _depositAmount;
        newChama.contributionAmount = _contributionAmount;
        newChama.penalty = _penalty;
        newChama.maxMembers = _maxMembers;
        newChama.cycleDuration = _cycleDuration;
        newChama.currentRound = 1;
        newChama.currentCycle = 1;
        newChama.nextCycleStart = block.timestamp + _cycleDuration;
        newChama.isActive = true;

        emit ChamaCreated(chamaCount, _name, msg.sender);
        return chamaCount;
    }

    /**
     * @notice Allows a user to join an active Chama.
     * @dev Integrates KRNL validation for joining.
     */
    function joinChama(uint256 _chamaId, KrnlPayload memory krnlPayload)
        external
        payable
        onlyWhitelisted
        onlyAuthorized(krnlPayload, abi.encode(_chamaId))
    {
        Chama storage chama = chamas[_chamaId];
        require(chama.isActive, "Chama is not active");
        require(chama.membersCount < chama.maxMembers, "Chama is full");
        require(msg.value == chama.depositAmount, "Incorrect deposit amount");
        require(!isMember(_chamaId, msg.sender), "Already a member");

        chama.members.push(msg.sender);
        chama.membersCount++;
        memberDeposit[_chamaId][msg.sender] = chama.depositAmount;
        emit JoinedChama(_chamaId, msg.sender);
    }

    /**
     * @notice Allows a member to make a scheduled contribution for the current cycle.
     * @dev Integrates KRNL validation for contributing.
     */
    function contribute(uint256 _chamaId, KrnlPayload memory krnlPayload)
        external
        payable
        onlyWhitelisted
        onlyAuthorized(krnlPayload, abi.encode(_chamaId))
    {
        Chama storage chama = chamas[_chamaId];
        require(chama.isActive, "Chama is not active");
        require(isMember(_chamaId, msg.sender), "Not a member of this Chama");
        require(msg.value == chama.contributionAmount, "Incorrect contribution amount");
        require(block.timestamp < chama.nextCycleStart, "Contribution period over for current cycle");
        require(!contributions[_chamaId][chama.currentCycle][msg.sender], "Contribution already made for current cycle");

        contributions[_chamaId][chama.currentCycle][msg.sender] = true;
        emit ContributionMade(_chamaId, chama.currentCycle, msg.sender, msg.value);
    }

    /**
     * @notice Executes a payout for the current cycle.
     * @dev Integrates KRNL validation for payout execution.
     */
    function payout(uint256 _chamaId, KrnlPayload memory krnlPayload) external nonReentrant onlyAuthorized(krnlPayload, abi.encode(_chamaId)) {
        Chama storage chama = chamas[_chamaId];
        require(chama.isActive, "Chama is not active");
        require(block.timestamp >= chama.nextCycleStart, "Current cycle not ended yet");
        require(chama.members.length == chama.maxMembers, "Chama is not full yet");

        uint256 totalPool = _calculateTotalPool(_chamaId);

        address recipient = chama.members[chama.currentRound - 1];
        chama.currentRound = (chama.currentRound % chama.maxMembers) + 1;

        uint256 executedCycle = chama.currentCycle;
        chama.currentCycle++;
        chama.nextCycleStart = block.timestamp + chama.cycleDuration;

        (bool sent, ) = recipient.call{value: totalPool}("");
        require(sent, "Payout failed");

        emit PayoutExecuted(_chamaId, executedCycle, recipient, totalPool);
    }

    /**
     * @dev Internal function to calculate the total pool for the current cycle.
     */
    function _calculateTotalPool(uint256 _chamaId) internal returns (uint256 totalPool) {
        Chama storage chama = chamas[_chamaId];
        uint256 penaltyAmount;
        for (uint256 i = 0; i < chama.members.length; i++) {
            address member = chama.members[i];
            if (contributions[_chamaId][chama.currentCycle][member]) {
                totalPool += chama.contributionAmount;
            } else {
                penaltyAmount = (chama.depositAmount * chama.penalty) / 100;
                require(memberDeposit[_chamaId][member] >= penaltyAmount, "Insufficient deposit for penalty");
                memberDeposit[_chamaId][member] -= penaltyAmount;
                totalPool += penaltyAmount;
            }
        }
    }

    /**
     * @notice Checks whether a specific address is a member of a given Chama.
     */
    function isMember(uint256 _chamaId, address _user) public view returns (bool) {
        Chama storage chama = chamas[_chamaId];
        for (uint256 i = 0; i < chama.members.length; i++) {
            if (chama.members[i] == _user) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Fallback function to accept ETH directly.
     */
    receive() external payable {}
}