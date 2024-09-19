import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import Dashboard from "./components/Dashboard";
import { ethers } from "ethers";

// Mock the `ethers` library
jest.mock("ethers", () => ({
  BrowserProvider: jest.fn(() => ({
    getSigner: jest.fn(() => ({
      getAddress: jest.fn(() =>
        Promise.resolve("0x7A814cC61fb06Ea7fFBE858ADE4252428A5DbD53")
      ),
    })),
    request: jest.fn(() =>
      Promise.resolve(["0x7A814cC61fb06Ea7fFBE858ADE4252428A5DbD53"])
    ),
  })),
  Contract: jest.fn(() => ({
    isPhoneNumberLinked: jest.fn(() => Promise.resolve(false)),
    linkAddressToPhoneNumber: jest.fn(() =>
      Promise.resolve({ wait: jest.fn() })
    ),
  })),
}));

describe("Dashboard Component", () => {
  let renderResult;

  beforeEach(() => {
    renderResult = render(
      <ChakraProvider>
        <Dashboard />
      </ChakraProvider>
    );
  });

  test("connects and disconnects wallet, and links phone number", async () => {
    // Connect Wallet
    const connectButton = screen.getByText(/Connect Wallet/i);
    userEvent.click(connectButton);

    // Verify wallet connection
    await waitFor(() => {
      expect(
        screen.getByText(
          /Your Web3 Address: 0x7A814cC61fb06Ea7fFBE858ADE4252428A5DbD53/i
        )
      ).toBeInTheDocument();
    });

    // Link Phone Number
    const phoneNumberInput = screen.getByPlaceholderText(/Enter phone number/i);
    userEvent.type(phoneNumberInput, "123-456-7890");

    const linkButton = screen.getByText(/Link Address/i);
    userEvent.click(linkButton);

    // Verify success message
    await waitFor(() => {
      expect(
        screen.getByText(/Address linked to phone number successfully./i)
      ).toBeInTheDocument();
    });

    // Disconnect Wallet
    const disconnectButton = screen.getByText(/Disconnect Wallet/i);
    userEvent.click(disconnectButton);

    // Verify wallet disconnection
    await waitFor(() => {
      expect(
        screen.getByText(/Your Web3 Address: Not connected/i)
      ).toBeInTheDocument();
    });
  });
});
