const AddressPhoneLink = artifacts.require("AddressPhoneLink");

module.exports = async function (deployer, network, accounts) {
  // Intersect testnet VRF Coordinator address (replace with actual address)
  const vrfCoordinator = process.env.VRF_COORDINATOR;
  // Intersect testnet PEARL token address (replace with actual address)
  const pearlToken = process.env.PEARL_TOKEN;
  const keyHash = process.env.KEY_HASH;
  const subscriptionId = 1;
  const callbackGasLimit = 100000;
  const requestConfirmations = 3;

  await deployer.deploy(
    AddressPhoneLink,
    vrfCoordinator,
    pearlToken,
    keyHash,
    subscriptionId,
    callbackGasLimit,
    requestConfirmations
  );
};
