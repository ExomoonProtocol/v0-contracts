import { Wallet } from "ethers"
import { ethers } from "hardhat"
import { ExomoonERC721FixedSupplyFixture } from "../shared/fixtures"
import { expect } from "chai"
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { ExomoonERC721, ExomoonERC721Layered, IExomoonERC721Layered } from "../../typechain-types"

export async function ExomoonERC721LayeredFixedSupplyFixture(): Promise<ExomoonERC721Layered> {
  const ExomoonERC721LayeredFactory = await ethers.getContractFactory("ExomoonERC721Layered")
  const exomoonErc721Layered = (await ExomoonERC721LayeredFactory.deploy(
    "NAME",
    "SYMBOL",
    10000n,
  )) as unknown as ExomoonERC721Layered
  return exomoonErc721Layered
}

const baseDeploymentFixture = async () => {
  const instance = await ExomoonERC721LayeredFixedSupplyFixture()

  instance.setPaused(false)

  return instance
}

const launchDeploymentFixture = async () => {
  const instance = await ExomoonERC721LayeredFixedSupplyFixture()

  await instance.setPaused(false)
  // await instance.setPrice(ethers.parseEther("0.1"));

  return instance
}

describe("ExomoonERC721Layered", () => {
  let exomoonErc721Layered: ExomoonERC721Layered
  let accounts: Wallet[]

  before("create fixture loader", async () => {
    accounts = await (ethers as any).getSigners()
  })

  beforeEach(async () => {
    exomoonErc721Layered = await loadFixture(baseDeploymentFixture)
  })

  it("Should deploy", async () => {
    expect(await exomoonErc721Layered.getAddress()).to.be.not.undefined
  })

  describe("Functionalities", () => {
    beforeEach(async () => {
      exomoonErc721Layered = await loadFixture(launchDeploymentFixture)
    })

    describe("addLayer", () => {
      it("Should add a layer", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        expect(await exomoonErc721Layered.getLayerInfoByIndex(0)).to.be.deep.equal([
          ethers.parseEther("0.2"),
          4,
          "Background",
        ])
      })

      it("Should revert when not owner", async () => {
        await expect(
          exomoonErc721Layered.connect(accounts[1]).addLayer("Background", ethers.parseEther("0.2"), 4, true),
        ).to.be.revertedWithCustomError(exomoonErc721Layered, "OwnableUnauthorizedAccount")
      })

      it("Should revert if too many variations count", async () => {
        await expect(
          exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 32, false),
        ).to.be.revertedWithCustomError(exomoonErc721Layered, "TooManyVariations")
      })
    })

    describe("getLayersCount", () => {
      it("Should get 0 when no layers are set", async () => {
        expect(await exomoonErc721Layered.getLayersCount()).to.be.equal(0)
      })

      it("Should get layers count", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        expect(await exomoonErc721Layered.getLayersCount()).to.be.equal(1)
      })
    })

    describe("setLayerPrice", () => {
      it("Should set a layer price", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.setLayerPrice(0, ethers.parseEther("0.3"))
        expect(await exomoonErc721Layered.getLayerInfoByIndex(0)).to.be.deep.equal([
          ethers.parseEther("0.3"),
          4,
          "Background",
        ])
      })

      it("Should revert when layer does not exist", async () => {
        await expect(exomoonErc721Layered.setLayerPrice(0, ethers.parseEther("0.3"))).to.be.reverted
      })

      it("Should revert when not owner", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await expect(
          exomoonErc721Layered.connect(accounts[1]).setLayerPrice(0, ethers.parseEther("0.3")),
        ).to.be.revertedWithCustomError(exomoonErc721Layered, "OwnableUnauthorizedAccount")
      })
    })

    describe("getLayerPrices", () => {
      it("Should get layer prices - empty", async () => {
        expect(await exomoonErc721Layered.getLayerPrices()).to.be.deep.equal([])
      })

      it("Should get layer prices - single price", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        expect(await exomoonErc721Layered.getLayerPrices()).to.be.deep.equal([ethers.parseEther("0.2")])
      })

      it("Should get layer prices - multiple prices", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.addLayer("Character", ethers.parseEther("0.3"), 4, false)
        expect(await exomoonErc721Layered.getLayerPrices()).to.be.deep.equal([
          ethers.parseEther("0.2"),
          ethers.parseEther("0.3"),
        ])
      })
    })

    describe("getVariationPrices", () => {
      it("Should get variation prices", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)

        // Sets the variation prices
        await exomoonErc721Layered.setLayerVariationPrice(0, 0, ethers.parseEther("0.3"))
        await exomoonErc721Layered.setLayerVariationPrice(0, 1, ethers.parseEther("0.4"))

        expect(await exomoonErc721Layered.getVariationPrices(0)).to.be.deep.equal([
          ethers.parseEther("0.3"),
          ethers.parseEther("0.4"),
          ethers.parseEther("0"),
          ethers.parseEther("0"),
        ])
      })

      it("Should get variation prices - all variations with default prices", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 31, false)

        const expectedPrices = Array(31).fill(ethers.parseEther("0"))

        expect(await exomoonErc721Layered.getVariationPrices(0)).to.be.deep.equal(expectedPrices)
      })

      it("Should revert if passing a non existing layer index", async () => {
        await expect(exomoonErc721Layered.getVariationPrices(0)).to.be.revertedWithCustomError(
          exomoonErc721Layered,
          "InvalidLayerIndex",
        )
      })
    })

    describe("setLayerVariations", () => {
      it("Should set variations", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.setVariations(0, 8)
        expect(await exomoonErc721Layered.getLayerInfoByIndex(0)).to.be.deep.equal([
          ethers.parseEther("0.2"),
          8,
          "Background",
        ])
      })

      it("Should revert when layer does not exist", async () => {
        await expect(exomoonErc721Layered.setVariations(0, 8)).to.be.revertedWithCustomError(
          exomoonErc721Layered,
          "InvalidLayerIndex",
        )
      })

      it("Should revert when not owner", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await expect(exomoonErc721Layered.connect(accounts[1]).setVariations(0, 8)).to.be.revertedWithCustomError(
          exomoonErc721Layered,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    describe("setVariations", () => {
      it("Should set variations", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.setVariations(0, 8)
        expect(await exomoonErc721Layered.getLayerInfoByIndex(0)).to.be.deep.equal([
          ethers.parseEther("0.2"),
          8,
          "Background",
        ])
      })

      it("Should revert when layer does not exist", async () => {
        await expect(exomoonErc721Layered.setVariations(0, 8)).to.be.revertedWithCustomError(
          exomoonErc721Layered,
          "InvalidLayerIndex",
        )
      })

      it("Should revert when not owner", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await expect(exomoonErc721Layered.connect(accounts[1]).setVariations(0, 8)).to.be.revertedWithCustomError(
          exomoonErc721Layered,
          "OwnableUnauthorizedAccount",
        )
      })
    })

    describe("setLayerVariationPrice", () => {
      it("Should set variation price", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.setLayerVariationPrice(0, 0, ethers.parseEther("0.3"))
        expect(await exomoonErc721Layered.getVariationPrice(0, 0)).to.be.equal(ethers.parseEther("0.3"))
      })

      it("Should revert when layer does not exist", async () => {
        await expect(
          exomoonErc721Layered.setLayerVariationPrice(0, 0, ethers.parseEther("0.3")),
        ).to.revertedWithCustomError(exomoonErc721Layered, "InvalidLayerIndex")
      })

      it("Should revert when variation does not exist", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await expect(
          exomoonErc721Layered.setLayerVariationPrice(0, 4, ethers.parseEther("0.3")),
        ).to.revertedWithCustomError(exomoonErc721Layered, "InvalidVariationIndex")

        await expect(
          exomoonErc721Layered.setLayerVariationPrice(0, 5, ethers.parseEther("0.3")),
        ).to.revertedWithCustomError(exomoonErc721Layered, "InvalidVariationIndex")
      })

      it("Should revert when not owner", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.setVariations(0, 8)
        await expect(
          exomoonErc721Layered.connect(accounts[1]).setLayerVariationPrice(0, 0, ethers.parseEther("0.3")),
        ).to.be.revertedWithCustomError(exomoonErc721Layered, "OwnableUnauthorizedAccount")
      })
    })

    describe("getVariationPrice", () => {
      it("Should get default variation price", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        expect(await exomoonErc721Layered.getVariationPrice(0, 0)).to.be.equal(ethers.parseEther("0"))
      })

      it("Should revert when layer does not exist", async () => {
        await expect(exomoonErc721Layered.getVariationPrice(0, 0)).to.revertedWithCustomError(
          exomoonErc721Layered,
          "InvalidLayerIndex",
        )
      })

      it("Should revert when variation does not exist", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await expect(exomoonErc721Layered.getVariationPrice(0, 4)).to.revertedWithCustomError(
          exomoonErc721Layered,
          "InvalidVariationIndex",
        )

        await expect(exomoonErc721Layered.getVariationPrice(0, 5)).to.revertedWithCustomError(
          exomoonErc721Layered,
          "InvalidVariationIndex",
        )
      })
    })

    describe("encodeLayersInfo", () => {
      it("Should encode empty layers info", async () => {
        expect(await exomoonErc721Layered.encodeLayersInfo([])).to.be.equal("0x")
      })

      it("Should encode layers info", async () => {
        let tests: {
          input: IExomoonERC721Layered.TokenLayerInfoStruct[]
          expected: string
        }[] = [
          {
            input: [
              {
                layerIndex: 0,
                variation: 0,
                color: 0,
              },
            ],
            expected: "0x00",
          },
          {
            input: [
              {
                layerIndex: 0,
                variation: 1,
                color: 0,
              },
            ],
            expected: "0x08",
          },
          {
            input: [
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
            ],
            expected: "0x0000",
          },
          {
            input: [
              {
                layerIndex: 0,
                variation: 1,
                color: 0,
              },
              {
                layerIndex: 1,
                variation: 0,
                color: 0,
              },
            ],
            expected: "0x0800",
          },
          {
            input: [
              {
                layerIndex: 0,
                variation: 1,
                color: 0,
              },
              {
                layerIndex: 1,
                variation: 1,
                color: 0,
              },
            ],
            expected: "0x0808",
          },
          {
            input: [
              {
                layerIndex: 0,
                variation: 1,
                color: 0,
              },
              {
                layerIndex: 1,
                variation: 1,
                color: 0,
              },
              {
                layerIndex: 2,
                variation: 1,
                color: 0,
              },
            ],
            expected: "0x080808",
          },
          {
            input: [
              {
                layerIndex: 0,
                variation: 8,
                color: 0,
              },
            ],
            expected: "0x40",
          },
          {
            input: [
              {
                layerIndex: 1,
                variation: 31,
                color: 0,
              },
              {
                layerIndex: 2,
                variation: 18,
                color: 0,
              },
              {
                layerIndex: 0,
                variation: 8,
                color: 0,
              },
            ],
            expected: "0x40f890",
          },
        ]

        for (let test of tests) {
          expect(await exomoonErc721Layered.encodeLayersInfo(test.input)).to.be.equal(test.expected)
        }
      })
    })

    describe("mint", () => {
      it("Should mint an item with the correct layer data", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.addLayer("Character", ethers.parseEther("0.3"), 4, false)
        await exomoonErc721Layered.setVariations(0, 8)
        await exomoonErc721Layered.setVariations(1, 8)

        const data = await exomoonErc721Layered.encodeLayersInfo([
          {
            layerIndex: 0,
            variation: 1,
            color: 0,
          },
          {
            layerIndex: 1,
            variation: 2,
            color: 0,
          },
        ])

        await exomoonErc721Layered.mint(1, data, { value: ethers.parseEther("0.5") })
      })

      it("Should mint with base, and traits price", async () => {
        await exomoonErc721Layered.setPrice(ethers.parseEther("0.6"))
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.addLayer("Character", ethers.parseEther("0.3"), 4, false)
        await exomoonErc721Layered.setVariations(0, 8)
        await exomoonErc721Layered.setVariations(1, 8)

        const data = await exomoonErc721Layered.encodeLayersInfo([
          {
            layerIndex: 0,
            variation: 1,
            color: 0,
          },
          {
            layerIndex: 1,
            variation: 2,
            color: 0,
          },
        ])

        await exomoonErc721Layered.mint(1, data, { value: ethers.parseEther("1.1") })
      })

      it("Should mint with base, traits and variation price", async () => {
        await exomoonErc721Layered.setPrice(ethers.parseEther("0.6"))
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.addLayer("Character", ethers.parseEther("0.3"), 4, false)
        await exomoonErc721Layered.setVariations(0, 8)
        await exomoonErc721Layered.setVariations(1, 8)
        await exomoonErc721Layered.setLayerVariationPrice(1, 2, ethers.parseEther("0.4"))

        const data = await exomoonErc721Layered.encodeLayersInfo([
          {
            layerIndex: 0,
            variation: 1,
            color: 0,
          },
          {
            layerIndex: 1,
            variation: 2,
            color: 0,
          },
        ])

        await exomoonErc721Layered.mint(1, data, { value: ethers.parseEther("1.5") })
      })

      it("Should revert if incorrect price - base", async () => {
        await exomoonErc721Layered.setPrice(ethers.parseEther("0.6"))
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0"), 4, false)
        await exomoonErc721Layered.addLayer("Character", ethers.parseEther("0"), 4, false)
        await exomoonErc721Layered.setVariations(0, 8)
        await exomoonErc721Layered.setVariations(1, 8)

        const data = await exomoonErc721Layered.encodeLayersInfo([
          {
            layerIndex: 0,
            variation: 1,
            color: 0,
          },
          {
            layerIndex: 1,
            variation: 2,
            color: 0,
          },
        ])

        await expect(
          exomoonErc721Layered.mint(1, data, { value: ethers.parseEther("0.599") }),
        ).to.be.revertedWithCustomError(exomoonErc721Layered, "InsufficientFunds")
      })

      it("Should revert if incorrect price - traits", async () => {
        await exomoonErc721Layered.setPrice(ethers.parseEther("0.6"))
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.addLayer("Character", ethers.parseEther("0.3"), 4, false)
        await exomoonErc721Layered.setVariations(0, 8)
        await exomoonErc721Layered.setVariations(1, 8)

        const data = await exomoonErc721Layered.encodeLayersInfo([
          {
            layerIndex: 0,
            variation: 1,
            color: 0,
          },
          {
            layerIndex: 1,
            variation: 2,
            color: 0,
          },
        ])

        await expect(
          exomoonErc721Layered.mint(1, data, { value: ethers.parseEther("1.0999") }),
        ).to.be.revertedWithCustomError(exomoonErc721Layered, "InsufficientFunds")
      })

      it("Should revert if incorrect price - variation", async () => {
        await exomoonErc721Layered.setPrice(ethers.parseEther("0.6"))
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.addLayer("Character", ethers.parseEther("0.3"), 4, false)
        await exomoonErc721Layered.setVariations(0, 8)
        await exomoonErc721Layered.setVariations(1, 8)
        await exomoonErc721Layered.setLayerVariationPrice(1, 2, ethers.parseEther("0.4"))

        const data = await exomoonErc721Layered.encodeLayersInfo([
          {
            layerIndex: 0,
            variation: 1,
            color: 0,
          },
          {
            layerIndex: 1,
            variation: 2,
            color: 0,
          },
        ])

        await expect(
          exomoonErc721Layered.mint(1, data, { value: ethers.parseEther("1.499") }),
        ).to.be.revertedWithCustomError(exomoonErc721Layered, "InsufficientFunds")
      })

      it("Should revert if incorrect number of layers", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.addLayer("Character", ethers.parseEther("0.3"), 4, false)
        await exomoonErc721Layered.setVariations(0, 8)
        await exomoonErc721Layered.setVariations(1, 8)

        let data = await exomoonErc721Layered.encodeLayersInfo([
          {
            layerIndex: 0,
            variation: 1,
            color: 0,
          },
        ])

        await expect(
          exomoonErc721Layered.mint(1, data, { value: ethers.parseEther("0.4") }),
        ).to.be.revertedWithCustomError(exomoonErc721Layered, "InvalidDataLength")

        data = await exomoonErc721Layered.encodeLayersInfo([
          {
            layerIndex: 0,
            variation: 1,
            color: 0,
          },
        ])

        await expect(
          exomoonErc721Layered.mint(1, data, { value: ethers.parseEther("0.4") }),
        ).to.be.revertedWithCustomError(exomoonErc721Layered, "InvalidDataLength")
      })

      it("Should revert if incorrect variations", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.addLayer("Character", ethers.parseEther("0.3"), 4, false)
        await exomoonErc721Layered.setVariations(0, 5)
        await exomoonErc721Layered.setVariations(1, 5)

        let data = await exomoonErc721Layered.encodeLayersInfo([
          {
            layerIndex: 0,
            variation: 8,
            color: 0,
          },
          {
            layerIndex: 1,
            variation: 2,
            color: 0,
          },
        ])

        await expect(
          exomoonErc721Layered.mint(1, data, { value: ethers.parseEther("0.5") }),
        ).to.be.revertedWithCustomError(exomoonErc721Layered, "InvalidVariationIndex")

        data = await exomoonErc721Layered.encodeLayersInfo([
          {
            layerIndex: 0,
            variation: 1,
            color: 0,
          },
          {
            layerIndex: 1,
            variation: 8,
            color: 0,
          },
        ])

        await expect(
          exomoonErc721Layered.mint(1, data, { value: ethers.parseEther("0.5") }),
        ).to.be.revertedWithCustomError(exomoonErc721Layered, "InvalidVariationIndex")
      })

      it("Should revert if missing required layer", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 31, true)
        await exomoonErc721Layered.addLayer("Character", ethers.parseEther("0.3"), 31, false)

        let data = await exomoonErc721Layered.encodeLayersInfo([
          {
            layerIndex: 0,
            variation: 31,
            color: 0,
          },
          {
            layerIndex: 1,
            variation: 2,
            color: 0,
          },
        ])

        await expect(
          exomoonErc721Layered.mint(1, data, { value: ethers.parseEther("0.5") }),
        ).to.be.revertedWithCustomError(exomoonErc721Layered, "RequiredLayerMissing")
      })
    })

    describe("Token URI", () => {
      it("Should return default revealed token URI", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.addLayer("Character", ethers.parseEther("0.3"), 4, false)
        await exomoonErc721Layered.setVariations(0, 8)
        await exomoonErc721Layered.setVariations(1, 8)

        const data = await exomoonErc721Layered.encodeLayersInfo([
          {
            layerIndex: 0,
            variation: 1,
            color: 0,
          },
          {
            layerIndex: 1,
            variation: 2,
            color: 0,
          },
        ])

        await exomoonErc721Layered.mint(1, data, { value: ethers.parseEther("0.5") })
        expect(await exomoonErc721Layered.tokenURI(1)).to.be.equal("0x0810/1.json")
      })

      it("Should return revealed token URI with custom prefix and suffix", async () => {
        await exomoonErc721Layered.addLayer("Background", ethers.parseEther("0.2"), 4, false)
        await exomoonErc721Layered.addLayer("Character", ethers.parseEther("0.3"), 4, false)
        await exomoonErc721Layered.setVariations(0, 8)
        await exomoonErc721Layered.setVariations(1, 8)

        const data = await exomoonErc721Layered.encodeLayersInfo([
          {
            layerIndex: 0,
            variation: 1,
            color: 0,
          },
          {
            layerIndex: 1,
            variation: 2,
            color: 0,
          },
        ])

        await exomoonErc721Layered.mint(1, data, { value: ethers.parseEther("0.5") })
        await exomoonErc721Layered.setBaseUri("https://example.com/")
        await exomoonErc721Layered.setUriSuffix(".json")
        expect(await exomoonErc721Layered.tokenURI(1)).to.be.equal("https://example.com/0x0810/1.json")
      })
    })
  })
})
