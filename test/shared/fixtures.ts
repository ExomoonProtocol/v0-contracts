import { ContractA } from "../../typechain-types/ContractA";
import { ethers } from "hardhat";

export async function contractAFixture(): Promise<ContractA> {
  const contractAFactory = await ethers.getContractFactory("ContractA");
  const contractA = (await contractAFactory.deploy()) as unknown as ContractA;
  return contractA;
}
