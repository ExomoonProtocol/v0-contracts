import { Wallet } from "ethers"
import { ethers } from "hardhat"
import { ExomoonERC721FixedSupplyFixture } from "../shared/fixtures"
import { expect } from "chai"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { ExomoonERC721 } from "../../typechain-types"

const baseDeploymentFixture = async () => {
  const instance = await ExomoonERC721FixedSupplyFixture()

  return instance
}

const launchDeploymentFixture = async () => {
  const instance = await ExomoonERC721FixedSupplyFixture()

  await instance.setPaused(false)
  await instance.setPrice(ethers.parseEther("0.1"))

  return instance
}

describe("ExomoonERC721", () => {
  let exomoonErc721: ExomoonERC721
  let accounts: Wallet[]

  before("create fixture loader", async () => {
    accounts = await (ethers as any).getSigners()
  })

  beforeEach(async () => {
    exomoonErc721 = await loadFixture(baseDeploymentFixture)
  })

  it("Should deploy", async () => {
    expect(await exomoonErc721.getAddress()).to.be.not.undefined
  })

  describe("Base ERC721", () => {
    beforeEach(async () => {
      await exomoonErc721.setPaused(false)
    })

    it("Should transfer an item", async () => {
      await exomoonErc721.mint(1, "0x")
      await exomoonErc721.transferFrom(accounts[0].address, accounts[1].address, 1)
      expect(await exomoonErc721.balanceOf(accounts[0].address)).to.be.equal(0n)
      expect(await exomoonErc721.balanceOf(accounts[1].address)).to.be.equal(1n)
    })

    it("Should approve an item", async () => {
      await exomoonErc721.mint(1, "0x")
      await exomoonErc721.approve(accounts[1].address, 1)
      expect(await exomoonErc721.getApproved(1)).to.be.equal(accounts[1].address)
    })

    it("Should set an operator", async () => {
      await exomoonErc721.setApprovalForAll(accounts[1].address, true)
      expect(await exomoonErc721.isApprovedForAll(accounts[0].address, accounts[1].address)).to.be.equal(true)
    })

    it("Should get an item owner", async () => {
      await exomoonErc721.mint(1, "0x")
      expect(await exomoonErc721.ownerOf(1)).to.be.equal(accounts[0].address)
    })

    it("Should get an item approved", async () => {
      await exomoonErc721.mint(1, "0x")
      expect(await exomoonErc721.getApproved(1)).to.be.equal(ethers.ZeroAddress)
    })

    it("Should get an operator", async () => {
      await exomoonErc721.setApprovalForAll(accounts[1].address, true)
      expect(await exomoonErc721.isApprovedForAll(accounts[0].address, accounts[1].address)).to.be.equal(true)
    })
  })

  describe("Functionalities", () => {
    beforeEach(async () => {
      exomoonErc721 = await loadFixture(launchDeploymentFixture)
    })

    describe("mint", () => {
      it("Should mint a single item", async () => {
        await exomoonErc721.mint(1, "0x", { value: ethers.parseEther("0.1") })
        expect(await exomoonErc721.balanceOf(accounts[0].address)).to.be.equal(1n)
      })

      it("Should mint multiple items", async () => {
        await exomoonErc721.setPrice(ethers.parseEther("0.1"))
        await exomoonErc721.mint(10, "0x", { value: ethers.parseEther("1") })

        expect(await exomoonErc721.balanceOf(accounts[0].address)).to.be.equal(10n)
      })

      it("Should not mint if not enough funds", async () => {
        await expect(exomoonErc721.mint(1, "0x")).to.be.revertedWithCustomError(exomoonErc721, "InsufficientFunds")

        await expect(exomoonErc721.mint(1, "0x", { value: ethers.parseEther("0.099") })).to.be.revertedWithCustomError(
          exomoonErc721,
          "InsufficientFunds",
        )
      })

      it("Should not mint if paused", async () => {
        await exomoonErc721.setPaused(true)
        await expect(exomoonErc721.mint(1, "0x", { value: ethers.parseEther("0.1") })).to.be.revertedWithCustomError(
          exomoonErc721,
          "Paused",
        )
      })

      it("Should mint and set token data", async () => {
        // Zero bytes
        await exomoonErc721.mint(1, "0x", { value: ethers.parseEther("0.1") })
        expect(await exomoonErc721.getTokenData(1)).to.be.equal("0x")

        // Non-zero bytes
        await exomoonErc721.mint(1, "0x0d5f001a", { value: ethers.parseEther("0.1") })
        expect(await exomoonErc721.getTokenData(2)).to.be.equal("0x0d5f001a")
      })
    })

    describe("paused / setPaused", () => {
      it("Should set new paused state", async () => {
        await exomoonErc721.setPaused(true)
        expect(await exomoonErc721.paused()).to.be.equal(true)
      })

      it("Should not allow to set paused if not owner", async () => {
        await expect(exomoonErc721.connect(accounts[1]).setPaused(true)).to.be.revertedWithCustomError(
          exomoonErc721,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    describe("token URI mode - set / get", () => {
      it("Should set new token URI mode", async () => {
        await exomoonErc721.setTokenUriMode(1)
        expect(await exomoonErc721.tokenUriMode()).to.be.equal(1)
      })

      it("Should not allow to set token URI mode if not owner", async () => {
        await expect(exomoonErc721.connect(accounts[1]).setTokenUriMode(1)).to.be.revertedWithCustomError(
          exomoonErc721,
          "OwnableUnauthorizedAccount",
        )
      })

      it("Should get default token URI mode", async () => {
        expect(await exomoonErc721.tokenUriMode()).to.be.equal(1)
      })

      it("Should revert if trying to set invalid token URI mode", async () => {
        await expect(exomoonErc721.setTokenUriMode(4)).to.be.reverted
      })
    })

    describe("prerevealUri / setPrerevealUri", () => {
      it("Should set new prereveal URI", async () => {
        await exomoonErc721.setPrerevealUri("https://example.com/")
        expect(await exomoonErc721.prerevealUri()).to.be.equal("https://example.com/")
      })

      it("Should not allow to set prereveal URI if not owner", async () => {
        await expect(
          exomoonErc721.connect(accounts[1]).setPrerevealUri("https://example.com/"),
        ).to.be.revertedWithCustomError(exomoonErc721, "OwnableUnauthorizedAccount")
      })
    })

    describe("price / setPrice", () => {
      it("Should set new price", async () => {
        await exomoonErc721.setPrice(ethers.parseEther("0.2"))
        expect(await exomoonErc721.price()).to.be.equal(ethers.parseEther("0.2"))
      })

      it("Should not allow to set price if not owner", async () => {
        await expect(
          exomoonErc721.connect(accounts[1]).setPrice(ethers.parseEther("0.1")),
        ).to.be.revertedWithCustomError(exomoonErc721, "OwnableUnauthorizedAccount")
      })
    })

    describe("withdraw", () => {
      it("Should withdraw funds", async () => {
        await exomoonErc721.mint(1, "0x", { value: ethers.parseEther("0.1") })
        await exomoonErc721.withdraw()
        expect(await ethers.provider.getBalance(await exomoonErc721.getAddress())).to.be.equal(0)
      })

      it("Should not allow to withdraw if not owner", async () => {
        await expect(exomoonErc721.connect(accounts[1]).withdraw()).to.be.revertedWithCustomError(
          exomoonErc721,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    describe("tokenURI", () => {
      describe("Prereveal mode (0)", () => {
        beforeEach(async () => {
          await exomoonErc721.setTokenUriMode(0)
          await exomoonErc721.setPrerevealUri("https://example.com/hidden.json")
        })

        it("Should return prereveal token URI", async () => {
          await exomoonErc721.mint(1, "0x", { value: ethers.parseEther("0.1") })
          expect(await exomoonErc721.tokenURI(1)).to.be.equal("https://example.com/hidden.json")
        })

        it("Should revert if trying to read token URI of non-existing token", async () => {
          expect(exomoonErc721.tokenURI(1)).to.be.reverted
        })
      })

      describe("Default mode (1)", () => {
        it("Should return default revealed token URI", async () => {
          await exomoonErc721.mint(1, "0x", { value: ethers.parseEther("0.1") })
          expect(await exomoonErc721.tokenURI(1)).to.be.equal("1.json")
        })

        it("Should return revealed token URI with custom prefix and suffix", async () => {
          await exomoonErc721.setBaseUri("https://example.com/")
          await exomoonErc721.setUriSuffix(".json")

          await exomoonErc721.mint(1, "0x", { value: ethers.parseEther("0.1") })
          expect(await exomoonErc721.tokenURI(1)).to.be.equal("https://example.com/1.json")

          await exomoonErc721.setBaseUri("https://api.example.com/")
          await exomoonErc721.setUriSuffix("")

          expect(await exomoonErc721.tokenURI(1)).to.be.equal("https://api.example.com/1")
        })

        it("Should read base URI", async () => {
          expect(await exomoonErc721.baseUri()).to.be.equal("")
          await exomoonErc721.setBaseUri("https://example.com/")
          expect(await exomoonErc721.baseUri()).to.be.equal("https://example.com/")
        })

        it("Should read URI suffix", async () => {
          expect(await exomoonErc721.uriSuffix()).to.be.equal(".json")
          await exomoonErc721.setUriSuffix("")
          expect(await exomoonErc721.uriSuffix()).to.be.equal("")
          await exomoonErc721.setUriSuffix(".custom-extension")
          expect(await exomoonErc721.uriSuffix()).to.be.equal(".custom-extension")
        })

        it("Should revert if trying to read token URI of non-existing token", async () => {
          expect(exomoonErc721.tokenURI(1)).to.be.reverted
        })

        it("Should revert if a non-owner tries to set base URI", async () => {
          await expect(
            exomoonErc721.connect(accounts[1]).setBaseUri("https://example.com/"),
          ).to.be.revertedWithCustomError(exomoonErc721, "OwnableUnauthorizedAccount")
        })

        it("Should revert if a non-owner tries to set URI suffix", async () => {
          await expect(exomoonErc721.connect(accounts[1]).setUriSuffix("")).to.be.revertedWithCustomError(
            exomoonErc721,
            "OwnableUnauthorizedAccount",
          )
        })
      })

      describe("Mint Data mode (2)", () => {
        beforeEach(async () => {
          await exomoonErc721.setTokenUriMode(2)
          await exomoonErc721.setBaseUri("https://example.com/")
        })

        it("Should return mint data token URI", async () => {
          await exomoonErc721.mint(1, "0x", { value: ethers.parseEther("0.1") })
          expect(await exomoonErc721.tokenURI(1)).to.be.equal("https://example.com/0x/1.json")
        })
      })
    })
  })
})
