const mocha = require("mocha");
const { expect } = require("chai");
const {
  getAllBalances,
  getBalances,
  getCoins,
} = require("../../src/ftx/wallet");

describe("Get balances in FTX main account", () => {
  it("should return all coins with balances", async () => {
    const response = await getBalances();
    expect(response.error).to.be.false;
    expect(response.data).to.be.an("array");
    response.data.forEach((coin) => {
      expect(coin).to.have.keys([
        "coin",
        "total",
        "free",
        "availableForWithdrawal",
        "availableWithoutBorrow",
        "usdValue",
        "spotBorrow",
      ]);
    });
  });
});

describe("Get all balances in FTX including sub-accounts", () => {
  it("should return all coins in FTX accounts", async () => {
    const response = await getAllBalances();
    expect(response.error).to.be.false;
    response.data["main"].forEach((coin) => {
      expect(coin).to.have.keys([
        "coin",
        "total",
        "free",
        "availableForWithdrawal",
        "availableWithoutBorrow",
        "usdValue",
        "spotBorrow",
      ]);
    });
  });
});

describe("Get all balances in FTX including sub-accounts", () => {
  it("should return all coins support in FTX", async () => {
    const { error, data } = await getCoins();
    expect(error).to.be.false;
    data.forEach((coin) => {
      expect(coin).to.includes.keys([
        "id",
        "name",
        "collateral",
        "usdFungible",
        "isEtf",
        "isToken",
        "hidden",
        "canDeposit",
        "canWithdraw",
        "canConvert",
        "hasTag",
        "collateralWeight",
        "imfWeight",
        "fiat",
        "methods",
        "erc20Contract",
        "bep2Asset",
        "trc20Contract",
        "splMint",
        "creditTo",
        "spotMargin",
        "nftQuoteCurrencyEligible",
        "indexPrice",
        "imageUrl",
      ]);
    });
  });
});
