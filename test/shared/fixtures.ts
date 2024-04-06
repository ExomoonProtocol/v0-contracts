import { ExomoonERC721 } from "../../typechain-types";
import { ethers } from "hardhat";

export async function ExomoonERC721FixedSupplyFixture(): Promise<ExomoonERC721> {
  const ExomoonERC721Factory = await ethers.getContractFactory("ExomoonERC721");
  const exomoonErc721 = (await ExomoonERC721Factory.deploy(
    "NAME",
    "SYMBOL",
    10000n,
  )) as unknown as ExomoonERC721;
  return exomoonErc721;
}
