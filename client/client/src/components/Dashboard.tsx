import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Box, Button, Input, Text, VStack, useToast } from "@chakra-ui/react";

const CONTRACT_ADDRESS = process.env.CONTRACT_ADD || "";
const ABI = [
  "function isPhoneNumberLinked(address) view returns (bool)",
  "function linkAddressToPhoneNumber(string phoneNumber) public",
  "function getPhoneHash(address) view returns (bytes32)",
];

const INTERSECT_TESTNET_RPC_URL =
  "https://subnets.avax.network/pearl/testnet/rpc";

const Dashboard: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [isLinked, setIsLinked] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (provider && address) {
      checkLinkStatus(address);
    }
  }, [provider, address]);

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const signer = await newProvider.getSigner();
        const userAddress = await signer.getAddress();

        setProvider(newProvider);
        setAddress(userAddress);
        setIsConnected(true);

        toast({
          title: "Connected",
          description: "Wallet connected successfully.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } catch (err) {
        console.error("Failed to connect to wallet:", err);
        toast({
          title: "Connection Error",
          description: "Failed to connect to wallet. Please try again.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to use this dApp.",
        status: "warning",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setAddress("");
    setIsConnected(false);
    setIsLinked(false);
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully.",
      status: "info",
      duration: 9000,
      isClosable: true,
    });
  };

  const checkLinkStatus = async (address: string) => {
    if (provider) {
      try {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
        const linked = await contract.isPhoneNumberLinked(address);
        setIsLinked(linked);
      } catch (err) {
        console.error("Failed to check link status:", err);
        toast({
          title: "Error",
          description: "Failed to check link status. Please try again.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }
  };

  const handleLinkAddress = async () => {
    if (!phoneNumber) {
      toast({
        title: "Input Error",
        description: "Please enter a phone number before linking.",
        status: "warning",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    if (provider) {
      try {
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        const tx = await contract.linkAddressToPhoneNumber(phoneNumber);
        await tx.wait();
        setIsLinked(true);
        toast({
          title: "Success",
          description: "Address linked to phone number successfully.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } catch (err) {
        console.error("Failed to link address:", err);
        toast({
          title: "Error",
          description: "Failed to link address. Please try again.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Box maxWidth="400px" margin="auto">
      <VStack spacing={4} align="stretch">
        <Text>Your Web3 Address: {address || "Not connected"}</Text>
        {isConnected ? (
          <Button onClick={disconnectWallet} colorScheme="red">
            Disconnect Wallet
          </Button>
        ) : (
          <Button onClick={connectWallet} colorScheme="blue">
            Connect Wallet
          </Button>
        )}
        <Input
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <Button
          onClick={handleLinkAddress}
          disabled={!isConnected || isLinked}
          colorScheme="blue"
        >
          {isLinked ? "Address Linked" : "Link Address"}
        </Button>
        {isLinked && (
          <Text color="green.500">
            Your address is linked to a phone number.
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default Dashboard;
