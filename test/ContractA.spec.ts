import { ContractA } from "../typechain-types/ContractA";
import { Wallet } from "ethers";
import { ethers } from "hardhat";
import { contractAFixture } from "./shared/fixtures";
import { createFixtureLoader } from "ethereum-waffle";
import { expect } from "chai";

import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("ContractA", () => {
  let contractA: ContractA;
  let accounts: Wallet[];

  before("create fixture loader", async () => {
    accounts = await (ethers as any).getSigners();
  });

  beforeEach(async () => {
    contractA = await loadFixture(contractAFixture);
  });

  it("should deploy", async () => {
    expect(await contractA.getAddress()).to.be.not.undefined;
  });
});
