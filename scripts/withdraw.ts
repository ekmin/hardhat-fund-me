import { Contract } from "ethers";
import { ethers, getNamedAccounts } from "hardhat";

const main = async () => {
    const { deployer } = await getNamedAccounts();
    const fundMe: Contract = await ethers.getContract("FundMe", deployer);
    console.log("Funding Contract...");
    const transactionReponse = await fundMe.withdraw();
    await transactionReponse.wait(1);
    console.log("Got it back!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });