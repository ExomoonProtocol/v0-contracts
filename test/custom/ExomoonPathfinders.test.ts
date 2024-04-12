import { Wallet } from "ethers"
import { ethers } from "hardhat"
import { expect } from "chai"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { ExomoonPathfinders } from "../../typechain-types"

export async function ExomoonPathfindersFixedSupplyFixture(): Promise<ExomoonPathfinders> {
  const ExomoonPathfindersFactory = await ethers.getContractFactory("ExomoonPathfinders")
  const exomoonPathfinders = (await ExomoonPathfindersFactory.deploy()) as unknown as ExomoonPathfinders
  return exomoonPathfinders
}

const baseDeploymentFixture = async () => {
  const instance = await ExomoonPathfindersFixedSupplyFixture()
  instance.setPaused(false)
  return instance
}

describe("ExomoonPathfinders", () => {
  let exomoonPathfinders: ExomoonPathfinders
  let accounts: Wallet[]

  before("create fixture loader", async () => {
    accounts = await (ethers as any).getSigners()
  })

  beforeEach(async () => {
    exomoonPathfinders = await loadFixture(baseDeploymentFixture)
  })

  it("Should deploy", async () => {
    expect(await exomoonPathfinders.getAddress()).to.be.not.undefined
  })
})
