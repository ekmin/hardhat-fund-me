import { assert, expect } from "chai"
import { ethers, network, getNamedAccounts } from "hardhat"
import { FundMe } from "../../typechain-types"
import { BigNumber } from "ethers"
import { developmentChains } from "../../helper-hardhat-config"

developmentChains.includes(network.name) ? describe.skip :
describe("FundMe", async () => {
    let fundMe: FundMe
    let deployer: string
    const sendValue: BigNumber = ethers.utils.parseEther("1")
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
    })

    it("allows people to fund and withdraw", async () => {
        const fundTxResponse = await fundMe.fund({ value: sendValue })
        await fundTxResponse.wait(1)
        const withdrawTxResponse = await fundMe.withdraw()
        await withdrawTxResponse.wait(1)

        const endingFundMeBalance: BigNumber = await fundMe.provider.getBalance(fundMe.address)
        console.log(
            endingFundMeBalance.toString() + " should equal 0, running assert equal..."
        )

        assert.equal(endingFundMeBalance.toString(), "0")
    })
})