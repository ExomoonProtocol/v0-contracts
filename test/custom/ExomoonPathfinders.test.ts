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

const launchDeploymentFixture = async () => {
  const instance = await ExomoonPathfindersFixedSupplyFixture()

  await instance.setPaused(false)

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

  describe("inviterOf", () => {
    beforeEach(async () => {
      exomoonPathfinders = await loadFixture(launchDeploymentFixture)
    })

    it("Should return the inviter of an new address", async () => {
      expect(await exomoonPathfinders.inviterOf(accounts[1].address)).to.be.equal(ethers.ZeroAddress)
    })

    it("Should return the inviter of an address that has been invited", async () => {
      /* layers:
        addLayer("Background", 0, 4, true);
        addLayer("Planet", 0, 6, false);
        addLayer("Earth", 0, 1, true);
        addLayer("Backpack", 0.02 ether, 3, true);
        setLayerVariationPrice(3, 2, 0.001 ether);
        addLayer("Body", 0, 2, true);
        addLayer("Suit", 0, 3, true);
        addLayer("Face", 0, 4, true);
        addLayer("Helmet", 0, 1, true);
        addLayer("Pipe", 0, 1, true);
        */
      const data = await exomoonPathfinders.encodeLayersInfo([
        {
          layerIndex: 0,
          variation: 0,
          color: 0,
        },
        {
          layerIndex: 1,
          variation: 0,
          color: 0,
        },
        {
          layerIndex: 2,
          variation: 0,
          color: 0,
        },
        {
          layerIndex: 3,
          variation: 0,
          color: 0,
        },
        {
          layerIndex: 4,
          variation: 0,
          color: 0,
        },
        {
          layerIndex: 5,
          variation: 0,
          color: 0,
        },
        {
          layerIndex: 6,
          variation: 0,
          color: 0,
        },
        {
          layerIndex: 7,
          variation: 0,
          color: 0,
        },
        {
          layerIndex: 8,
          variation: 0,
          color: 0,
        },
      ])

      await exomoonPathfinders
        .connect(accounts[1])
        .refMint(accounts[2].address, 1, data, { value: ethers.parseEther("0.15") })

      expect(await exomoonPathfinders.inviterOf(accounts[1].address)).to.be.equal(accounts[2].address)
      expect(await exomoonPathfinders.inviterOf(accounts[2].address)).to.be.equal(ethers.ZeroAddress)
    })
  })
})
