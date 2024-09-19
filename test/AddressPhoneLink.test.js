const AddressPhoneLink = artifacts.require("AddressPhoneLink");
const truffleAssert = require("truffle-assertions");

contract("AddressPhoneLink", function (accounts) {
  let addressPhoneLink;
  const owner = accounts[0];
  const user = accounts[1];

  before(async function () {
    addressPhoneLink = await AddressPhoneLink.deployed();
  });

  describe("Linking address to phone number", function () {
    it("should link an address to a phone number", async function () {
      const phoneNumber = "1234567890";
      const tx = await addressPhoneLink.linkAddressToPhoneNumber(phoneNumber, {
        from: user,
      });

      truffleAssert.eventEmitted(tx, "AddressLinked", (ev) => {
        return ev.userAddress === user;
      });

      const isLinked = await addressPhoneLink.isPhoneNumberLinked(user);
      assert.isTrue(isLinked, "Phone number should be linked");
    });

    it("should return false for an unlinked address", async function () {
      const isLinked = await addressPhoneLink.isPhoneNumberLinked(accounts[2]);
      assert.isFalse(isLinked, "Phone number should not be linked");
    });
  });

  describe("Random number generation", function () {
    it("should request a random number", async function () {
      const tx = await addressPhoneLink.requestRandomNumber();
      truffleAssert.eventEmitted(tx, "RandomNumberRequested");
    });
  });
});
