import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// const PnftModule = buildModule("PnftModule", (m) => {
//   const pnft = m.contract("Pnft");

//   return { pnft };
// });

// export default PnftModule;

const PnftModule = buildModule("PnftModule", (m) => {
  const mnemonic =
    "test test test test test test test test test test test junk";
  const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic);

  const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(ethers.provider);

  // const pnft = m.contract("Pnft", ownerAddress);

  const Contract = await ethers.getContractFactory("Pnft", wallet);
  const contract = await Contract.deploy(); // параметры конструктора, если они нужны
  console.log("Contract deployed to:", contract.address);

  return { pnft };
});

export default PnftModule;

import { ContractFactory, HDNodeWallet, Wallet } from "ethers";
import { artifacts } from "hardhat";
import { Pnft } from "../typechain-types";

export function getDeployerWallet(): HDNodeWallet {
  const mnemonic =
    "test test test test test test test test test test test junk"; // TODO move to env
  return Wallet.fromPhrase(mnemonic);
}

export async function deploy(deployerWallet: HDNodeWallet): Promise<Pnft> {
  const pnft = await artifacts.readArtifact("Pnft");

  const factory = new ContractFactory(pnft.abi, pnft.bytecode, deployerWallet);

  const contractOwnerWallet = deployerWallet;

  // Deploy an instance of the contract
  console.log("Deploying contract Pnft... lol");
  const contract = (await factory.deploy(
    // "Pnft.eth",
    contractOwnerWallet.address
  )) as Pnft;
  console.log("contract address -> ", await contract.getAddress());

  const tx = contract?.deploymentTransaction();
  const transactionResponse = await tx?.wait();

  console.log("transactionResponse -->", transactionResponse);
  return contract;
}

export async function addFixtures(
  contract: Pnft,
  deployerWallet: HDNodeWallet
) {
  await mintFixtureNfts(contract, deployerWallet);
}

export async function mintFixtureNfts(
  contract: Pnft,
  deployerWallet: HDNodeWallet
) {
  console.log("Minting fixtures...");
  const nftOwnerAddress = await deployerWallet.getAddress();
  contract.mint(nftOwnerAddress, "url-1"); // TODO change to url
  contract.mint(nftOwnerAddress, "url-2"); // TODO change to url
}

// LOCAL DEV ONLY
async function main() {
  const deployerWallet = getDeployerWallet();
  const contract = await deploy(deployerWallet);
  await addFixtures(contract, deployerWallet);
}

main();
