// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AddressPhoneLink is VRFConsumerBaseV2, Ownable {
    VRFCoordinatorV2Interface private vrfCoordinator;
    LinkTokenInterface private pearlToken;
    bytes32 private keyHash;
    uint64 private subscriptionId;
    uint32 private callbackGasLimit;
    uint16 private requestConfirmations;
    uint256 public randomResult;

    // Mapping of Web3 addresses to Web2 phone numbers (hashed for privacy)
    mapping(address => bytes32) private addressToPhoneHash;

    // Event to log the linking process
    event AddressLinked(address indexed userAddress, bytes32 phoneHash);
    event RandomNumberRequested(uint256 requestId);
    event RandomNumberFulfilled(uint256 requestId, uint256 randomNumber);

    constructor(
        address _vrfCoordinator,
        address _pearlToken,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations
    )
        VRFConsumerBaseV2(_vrfCoordinator)
        Ownable(msg.sender)
    {
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        pearlToken = LinkTokenInterface(_pearlToken);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
    }

    // Function to link Web3 address to Web2 phone number
    function linkAddressToPhoneNumber(string calldata phoneNumber) external {
        uint256 fee = 0; // Set fee if applicable
        require(pearlToken.balanceOf(address(this)) >= fee, "Not enough Pearl tokens");
        
        // Hash the phone number for privacy
        bytes32 phoneHash = keccak256(abi.encodePacked(phoneNumber));
        addressToPhoneHash[msg.sender] = phoneHash;
        emit AddressLinked(msg.sender, phoneHash);
    }

    // Function to get linked phone hash (for verification purposes)
    function getPhoneHash(address userAddress) external view returns (bytes32) {
        return addressToPhoneHash[userAddress];
    }

    // Function to check if phone number is linked to an address
    function isPhoneNumberLinked(address userAddress) external view returns (bool) {
        return addressToPhoneHash[userAddress] != bytes32(0);
    }

    // Function to request a random number from Chainlink VRF
    function requestRandomNumber() external returns (uint256 requestId) {
        requestId = vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            1
        );
        emit RandomNumberRequested(requestId);
    }

    // Chainlink VRF callback function
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        randomResult = randomWords[0];
        emit RandomNumberFulfilled(requestId, randomResult);
    }

    // Function to withdraw Pearl tokens from the contract
    function withdrawPearlTokens(address to, uint256 amount) external onlyOwner {
        require(pearlToken.transfer(to, amount), "Transfer failed");
    }
}