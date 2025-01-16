import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

describe('GuessTheSecretNumberChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheSecretNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    
    //We know that the answer is stored at the first storage address:
    const answerHash = await target.provider.getStorageAt(target.address, 0);
    
    //We know what the hash is and it is deterministic, so we can iterate through all 255 numbers to get the answer.
    let secretNumber: number | undefined;

    for (let i = 0; i < 256; i++) {
      if (ethers.utils.keccak256([i]) === answerHash) {
        secretNumber = i;
        break;
      }
    }
    
    const tx = await target.guess(secretNumber, {
      value: utils.parseEther('1'),
    });

    await tx.wait();

    expect(await target.isComplete()).to.equal(true);
  });
});
