import { assert, expect } from "chai"
import { deployments, ethers, network } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { FundMe, MockV3Aggregator } from "../../typechain-types"
import { BigNumber } from "ethers"
import { developmentChains } from "../../helper-hardhat-config"

!developmentChains.includes(network.name) ? describe.skip :
describe("FundMe", async () => {
    let fundMe: FundMe
    let deployer: SignerWithAddress
    let mockV3Aggregator: MockV3Aggregator
    const sendValue: BigNumber = ethers.utils.parseEther("1")
    beforeEach(async () => {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe")
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
    })
    describe("constructor", async () => {
        it("sets the aggregator addresses correctly",async () => {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })
    describe("fund",async () => {
        it("fails if you don't send enough ETH",async () => {
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
        })
        it("updated the amount funded data structure", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer.address)
            expect(response.toString()).to.equal(sendValue.toString())
        })
        it("Adds funder to array of funders", async () => {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.getFunder(0)
            assert.equal(funder, deployer.address)
        })
    })

    describe("withdraw", async () => {
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue })
        })
        it("withdraw ETH from a single founder",async () => {
            // Arrange
            const startingFundMeBalance: BigNumber = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance: BigNumber = await fundMe.provider.getBalance(deployer.address)

            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance: BigNumber = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance: BigNumber = await fundMe.provider.getBalance(deployer.address)

            // Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        })
        it("allows us to withdraw multiple funders", async () => {
            // Arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance: BigNumber = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance: BigNumber = await fundMe.provider.getBalance(deployer.address)

            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance: BigNumber = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance: BigNumber = await fundMe.provider.getBalance(deployer.address)

            // Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

            // Make sure that the funders are reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted

            for (let i = 1; i<6; i++) {
                assert.equal(await (await fundMe.getAddressToAmountFunded(accounts[i].address)).toString(), "0")
            }
        })
        it("Only allows the owner to withdraw", async () => {
            const accounts = await ethers.getSigners()
            const fundMeConnectedContract = await fundMe.connect(accounts[1])
            await expect(fundMeConnectedContract.withdraw()).to.be.reverted
        })
        it("cheaperWithdraw testing...", async () => {
            // Arrange
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(accounts[i])
                await fundMeConnectedContract.fund({ value: sendValue })
            }
            const startingFundMeBalance: BigNumber = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance: BigNumber = await fundMe.provider.getBalance(deployer.address)

            // Act
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance: BigNumber = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance: BigNumber = await fundMe.provider.getBalance(deployer.address)

            // Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

            // Make sure that the funders are reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted

            for (let i = 1; i<6; i++) {
                assert.equal(await (await fundMe.getAddressToAmountFunded(accounts[i].address)).toString(), "0")
            }
        })
        it("withdraw ETH from a single founder in cheaperWithdraw",async () => {
            // Arrange
            const startingFundMeBalance: BigNumber = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance: BigNumber = await fundMe.provider.getBalance(deployer.address)

            // Act
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance: BigNumber = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance: BigNumber = await fundMe.provider.getBalance(deployer.address)

            // Assert
            assert.equal(endingFundMeBalance.toString(), "0")
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        })
    })
})
