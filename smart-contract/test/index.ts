import chai, { expect } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import { BigNumber, utils } from 'ethers';
import { ethers } from 'hardhat';
import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';
import CollectionConfig from './../config/CollectionConfig';
import ContractArguments from '../config/ContractArguments';
import { NftContractType } from '../lib/NftContractProvider';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

chai.use(ChaiAsPromised);

enum SaleType {
  WHITELIST = CollectionConfig.whitelistSale.price,
  PRE_SALE = CollectionConfig.preSale.price,
  PUBLIC_SALE = CollectionConfig.publicSale.price,
};

const whitelistAddresses = [
  // Hardhat test addresses...
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
  "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
  "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
  "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
  "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
  "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
  "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
  "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a",
  "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",
  "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
  "0xcd3B766CCDd6AE721141F452C550Ca635964ce71",
  "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
  "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
  "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
  "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
];

function getPrice(saleType: SaleType, mintAmount: number) {
  return utils.parseEther(saleType.toString()).mul(mintAmount);
}

describe(CollectionConfig.contractName, function () {
  let owner!: SignerWithAddress;
  let whitelistedUser!: SignerWithAddress;
  let holder!: SignerWithAddress;
  let externalUser!: SignerWithAddress;
  let contract!: NftContractType;

  before(async function () {
    [owner, whitelistedUser, holder, externalUser] = await ethers.getSigners();
  });

  it('Contract deployment', async function () {
    const Contract = await ethers.getContractFactory(CollectionConfig.contractName);
    contract = await Contract.deploy(...ContractArguments) as NftContractType;
    
    await contract.deployed();
  });

  it('Check initial data', async function () {
    expect(await contract.name()).to.equal(CollectionConfig.tokenName);
    expect(await contract.symbol()).to.equal(CollectionConfig.tokenSymbol);
    expect(await contract.cost()).to.equal(getPrice(SaleType.WHITELIST, 1));
    expect(await contract.maxSupply()).to.equal(CollectionConfig.maxSupply);
    expect(await contract.maxMintAmountPerTx()).to.equal(CollectionConfig.whitelistSale.maxMintAmountPerTx);
    expect(await contract.hiddenMetadataUri()).to.equal(CollectionConfig.hiddenMetadataUri);

    expect(await contract.paused()).to.equal(true);
    expect(await contract.whitelistMintEnabled()).to.equal(false);
    expect(await contract.revealed()).to.equal(false);

    //
    expect(await contract.hasFreeMint()).to.equal(CollectionConfig.hasFreeMint);
    expect(await contract.maxFreeMintSupply()).to.equal(CollectionConfig.maxFreeMintSupply);
    expect(await contract.maxFreeMintAmountPerTx()).to.equal(CollectionConfig.maxFreeMintAmountPerTx);
    expect(await contract.hasFreeMint()).to.equal(false);
    //

    await expect(contract.tokenURI(1)).to.be.revertedWith('ERC721Metadata: URI query for nonexistent token');
  });

//----------------------------------------
  
  // it('Free Mint', async function () {
  //   console.log("------------hello from free mint 0  ----------------------------- ");
  //   let startMaxSupply = await contract.maxSupply();
  //   let startTotalSupply = await contract.totalSupply();
  //   console.log("_start max supply --> ", startMaxSupply);
  //   console.log("_start total supply --> ", startTotalSupply);

  //   const maxFreeMintSupply = 5;
  //   const maxFreeMintAmountPerTx = 3;
  //   // Nobody should be able to mint from a paused contract
  //   await expect(contract.connect(holder).freeMint(1)).to.be.revertedWith('The contract is paused!');

  //   await contract.setPaused(false);
  //   await expect(contract.connect(holder).freeMint(1)).to.be.revertedWith('Free mint is not available!');
  //   await contract.setHasFreeMint(true);
  //   await contract.setMaxFreeMintSupply(maxFreeMintSupply);
  //   await contract.setMaxFreeMintAmountPerTx(maxFreeMintAmountPerTx);
  //   await expect(contract.connect(holder).freeMint(0)).to.be.revertedWith('Free mint amount must be 1 or more!');
  //   await expect(contract.connect(holder).freeMint(maxFreeMintAmountPerTx + 1)).to.be.revertedWith('Free mint amount execeeds max free mint per transaction!');
  
  //   console.log("xxxxxxxxxxxxxxxxxxmsg.sender balanceOfNFtTokenAmountInWallet(bef)-> ", await contract.balanceOfNFtTokenAmountInWallet(await holder.getAddress()));
  //   console.log("xxxxxxxxxxxxxxxxxxallowedFreeMintAmountPerTxn(bef)-> ", await contract. allowedFreeMintAmountPerTxn());
  //    await contract.connect(holder).freeMint(3);
  //    expect(await contract.balanceOf(await holder.getAddress())).to.equal(3);
  //   console.log("xxxxxxxxxxxxxxxxxxmsg.sender balanceOfNFtTokenAmountInWallet-> ", await contract.balanceOfNFtTokenAmountInWallet(await holder.getAddress()));
    
  //    await contract.setMaxFreeMintAmountPerTx(maxFreeMintAmountPerTx + 2); // =5


  //    //await expect(contract.connect(holder).freeMint(4)).to.be.revertedWith('The requested free mint amount will exceed your eligible free mint amount. Your eligible free mint amount is the same as as the free mint per tranasction amount');
  //   await expect(contract.connect(holder).freeMint(2));
  //    await expect(contract.connect(holder).freeMint(3)).to.be.revertedWith('Free mint amount will exceed max free mint supply');

  
    
  //   const endMaxSupply = await contract.maxSupply();
  //   const endTotalSupply = await contract.totalSupply();
  //   startMaxSupply = await contract.maxSupply();
  //   startTotalSupply = await contract.totalSupply();
  //   console.log("----------------------------------------- ");
  //   console.log("start max supply --> ", startMaxSupply);
  //   console.log("end max supply --> ", endMaxSupply);
  //   console.log("start total supply --> ", startTotalSupply);
  //   console.log("end total supply --> ", endTotalSupply);
  //   console.log("Max FreeMin amount per txn", await contract.allowedFreeMintAmountPerTxn());
  //   console.log("msg.sender balanceOfNFtTokenAmountInWallet-> ", await contract.balanceOfNFtTokenAmountInWallet(await holder.getAddress()));
  //    console.log("contract.balanceOf(owner.address-> ", contract.balanceOf(owner.address)); 
  //   console.log("----------------------------------------- ");

  //   console.log("Holder EthBal", await holder.getBalance());
  //   console.log("Holder txnCnt", await holder.getTransactionCount());
  //   console.log("contract TotSupply", await contract.totalSupply());

  //   //console.log("holder-> ", holder);
  //     // await expect(contract.connect(holder).freeMint(1)).to.be.revertedWith('You have reached your eligible free mint amount. Your eligible free mint amount is the same as as the free mint per tranasction amount');
  //    //await expect(contract.connect(holder).freeMint(2)).to.be.revertedWith('The requested free mint amount will exceed your eligible free mint amount. Your eligible free mint amount is the same as as the free mint per tranasction amount');

  //   // Check balances
  //   const balanceOfContractAddress = await contract.balanceOf(await owner.getAddress());
  //   const balanceOfOwnerAddress = await contract.balanceOf(await owner.getAddress());
  //   const balanceOfHolderAddress = await contract.balanceOf(await holder.getAddress());
  //   const balanceOfExternalUserAddress = await contract.balanceOf(await externalUser.getAddress());
  //    console.log("balanceOfContractAddress-> ", balanceOfContractAddress);
  //   console.log("balanceOfOwnerAddress-> ", balanceOfOwnerAddress);
  //   console.log("balanceOfHolderAddress-> ", balanceOfHolderAddress);
  //    console.log("balanceOfExternalUserAddress-> ", balanceOfExternalUserAddress);
    
  //   //expect(await contract.balanceOf(await owner.getAddress())).to.equal(1);
  //  // expect(await contract.balanceOf(await whitelistedUser.getAddress())).to.equal(1);
    
  //   //expect(await contract.balanceOf(await holder.getAddress())).to.equal(0);
  //   //expect(await contract.balanceOf(await externalUser.getAddress())).to.equal(0);
  // });
  


//------------------------------
  
  
  
  it('Before any sale', async function () {
    // Nobody should be able to mint from a paused contract
    await expect(contract.connect(whitelistedUser).mint(1, {value: getPrice(SaleType.WHITELIST, 1)})).to.be.revertedWith('The contract is paused!');
    await expect(contract.connect(whitelistedUser).whitelistMint(1, [], {value: getPrice(SaleType.WHITELIST, 1)})).to.be.revertedWith('The whitelist sale is not enabled!');
    await expect(contract.connect(holder).mint(1, {value: getPrice(SaleType.WHITELIST, 1)})).to.be.revertedWith('The contract is paused!');
    await expect(contract.connect(holder).whitelistMint(1, [], {value: getPrice(SaleType.WHITELIST, 1)})).to.be.revertedWith('The whitelist sale is not enabled!');
    await expect(contract.connect(owner).mint(1, {value: getPrice(SaleType.WHITELIST, 1)})).to.be.revertedWith('The contract is paused!');
    await expect(contract.connect(owner).whitelistMint(1, [], {value: getPrice(SaleType.WHITELIST, 1)})).to.be.revertedWith('The whitelist sale is not enabled!');

    // FreeMint
    await expect(contract.connect(owner).freeMint(1)).to.be.revertedWith('The contract is paused!');
     
    // The owner should always be able to run mintForAddress
    await (await contract.mintForAddress(1, await owner.getAddress())).wait();
    await (await contract.mintForAddress(1, await whitelistedUser.getAddress())).wait();
    // But not over the maxMintAmountPerTx
    await expect(contract.mintForAddress(
      await (await contract.maxMintAmountPerTx()).add(1),
      await holder.getAddress(),
    )).to.be.revertedWith('Invalid mint amount. Mint amount can not be greater than mint amount max per transaction!');

    // Check balances
    expect(await contract.balanceOf(await owner.getAddress())).to.equal(1);
    expect(await contract.balanceOf(await whitelistedUser.getAddress())).to.equal(1);
    expect(await contract.balanceOf(await holder.getAddress())).to.equal(0);
    expect(await contract.balanceOf(await externalUser.getAddress())).to.equal(0);
    console.log("total supply 'before any sale' check balances --> ",   await contract.totalSupply());
  });

  it('Whitelist sale', async function () {
    // Build MerkleTree
    const leafNodes = whitelistAddresses.map(addr => keccak256(addr));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    const rootHash = merkleTree.getRoot();
    // Update the root hash
    await (await contract.setMerkleRoot('0x' + rootHash.toString('hex'))).wait();

    await contract.setWhitelistMintEnabled(true);

    await contract.connect(whitelistedUser).whitelistMint(
      1,
      merkleTree.getHexProof(keccak256(await whitelistedUser.getAddress())),
      {value: getPrice(SaleType.WHITELIST, 1)},
    );
    // Trying to mint twice
    await expect(contract.connect(whitelistedUser).whitelistMint(
      1,
      merkleTree.getHexProof(keccak256(await whitelistedUser.getAddress())),
      {value: getPrice(SaleType.WHITELIST, 1)},
    )).to.be.revertedWith('Address already claimed!');
    // Sending an invalid mint amount
    await expect(contract.connect(whitelistedUser).whitelistMint(
      await (await contract.maxMintAmountPerTx()).add(1),
      merkleTree.getHexProof(keccak256(await whitelistedUser.getAddress())),
      {value: getPrice(SaleType.WHITELIST, await (await contract.maxMintAmountPerTx()).add(1).toNumber())},
    )).to.be.revertedWith('Invalid mint amount. Mint amount can not be greater than mint amount max per transaction!');
    // Sending insufficient funds
    await expect(contract.connect(whitelistedUser).whitelistMint(
      1,
      merkleTree.getHexProof(keccak256(await whitelistedUser.getAddress())),
      {value: getPrice(SaleType.WHITELIST, 1).sub(1)},
    )).to.be.rejectedWith(Error, 'insufficient funds for intrinsic transaction cost');
    // Pretending to be someone else
    await expect(contract.connect(holder).whitelistMint(
      1,
      merkleTree.getHexProof(keccak256(await whitelistedUser.getAddress())),
      {value: getPrice(SaleType.WHITELIST, 1)},
    )).to.be.revertedWith('Invalid proof!');
    // Sending an invalid proof
    await expect(contract.connect(holder).whitelistMint(
      1,
      merkleTree.getHexProof(keccak256(await holder.getAddress())),
      {value: getPrice(SaleType.WHITELIST, 1)},
    )).to.be.revertedWith('Invalid proof!');
    // Sending no proof at all
    await expect(contract.connect(holder).whitelistMint(
      1,
      [],
      {value: getPrice(SaleType.WHITELIST, 1)},
    )).to.be.revertedWith('Invalid proof!');
    
    // Pause whitelist sale
    await contract.setWhitelistMintEnabled(false);
    await contract.setCost(utils.parseEther(CollectionConfig.preSale.price.toString()));

    // Check balances
    expect(await contract.balanceOf(await owner.getAddress())).to.equal(1);
    expect(await contract.balanceOf(await whitelistedUser.getAddress())).to.equal(2);
    expect(await contract.balanceOf(await holder.getAddress())).to.equal(0);
    expect(await contract.balanceOf(await externalUser.getAddress())).to.equal(0);
    console.log("total supply 'whitelist sale' check balances --> ",   await contract.totalSupply());
  });
    
  it('Pre-sale (same as public sale)', async function () {
    await contract.setMaxMintAmountPerTx(CollectionConfig.preSale.maxMintAmountPerTx);
    await contract.setPaused(false);
    await contract.connect(holder).mint(2, {value: getPrice(SaleType.PRE_SALE, 2)});
    await contract.connect(whitelistedUser).mint(1, {value: getPrice(SaleType.PRE_SALE, 1)});
    // Sending insufficient funds
    await expect(contract.connect(holder).mint(1, {value: getPrice(SaleType.PRE_SALE, 1).sub(1)})).to.be.rejectedWith(Error, 'insufficient funds for intrinsic transaction cost');
    // Sending an invalid mint amount
    await expect(contract.connect(whitelistedUser).mint(
      await (await contract.maxMintAmountPerTx()).add(1),
      {value: getPrice(SaleType.PRE_SALE, await (await contract.maxMintAmountPerTx()).add(1).toNumber())},
    )).to.be.revertedWith('Invalid mint amount. Mint amount can not be greater than mint amount max per transaction!');
    // Sending a whitelist mint transaction
    await expect(contract.connect(whitelistedUser).whitelistMint(
      1,
      [],
      {value: getPrice(SaleType.WHITELIST, 1)},
    )).to.be.rejectedWith(Error, 'insufficient funds for intrinsic transaction cost');
    
    // Pause pre-sale
    await contract.setPaused(true);
    await contract.setCost(utils.parseEther(CollectionConfig.publicSale.price.toString()));

    console.log("total supply 'pre sale' check balances --> ",   await contract.totalSupply());
  });
    
  it('Owner only functions', async function () {
    await expect(contract.connect(externalUser).mintForAddress(1, await externalUser.getAddress())).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).setRevealed(false)).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).setCost(utils.parseEther('0.0000001'))).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).setMaxMintAmountPerTx(99999)).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).setHiddenMetadataUri('INVALID_URI')).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).setUriPrefix('INVALID_PREFIX')).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).setUriSuffix('INVALID_SUFFIX')).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).setPaused(false)).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).setMerkleRoot('0x0000000000000000000000000000000000000000000000000000000000000000')).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).setWhitelistMintEnabled(false)).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
    // FreeMint
    await expect(contract.connect(externalUser).setHasFreeMint(false)).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).setMaxFreeMintSupply(99999)).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(contract.connect(externalUser).setMaxFreeMintAmountPerTx(99999)).to.be.revertedWith('Ownable: caller is not the owner');
    //
  });
    
  it('Wallet of owner', async function () {
    expect(await contract.tokensOfOwner(await owner.getAddress())).deep.equal([
      BigNumber.from(1),
    ]);
    expect(await contract.tokensOfOwner(await whitelistedUser.getAddress())).deep.equal([
      BigNumber.from(2),
      BigNumber.from(3),
      BigNumber.from(6),
    ]);
    expect(await contract.tokensOfOwner(await holder.getAddress())).deep.equal([
      BigNumber.from(4),
      BigNumber.from(5),
    ]);
    expect(await contract.tokensOfOwner(await externalUser.getAddress())).deep.equal([]);

    console.log("total supply 'walet of owner' check --> ",   await contract.totalSupply());
  });
    
  it('Supply checks (long)', async function () {
    console.log("total supply 'supply checks' check --> ",   await contract.totalSupply());
    if (process.env.EXTENDED_TESTS === undefined) {
       console.log("process.env.EXTENDED_TESTS === undefined. Skipping Supply checks");
      this.skip();
    }
    console.log("process.env.EXTENDED_TESTS ===", process.env.EXTENDED_TESTS);
    const alreadyMinted = 6;
    const maxMintAmountPerTx = 1000;
    const iterations = Math.floor((CollectionConfig.maxSupply - alreadyMinted) / maxMintAmountPerTx);
    const expectedTotalSupply = iterations * maxMintAmountPerTx + alreadyMinted;
    const lastMintAmount = CollectionConfig.maxSupply - expectedTotalSupply;
    expect(await contract.totalSupply()).to.equal(alreadyMinted);

    await contract.setPaused(false);
    await contract.setMaxMintAmountPerTx(maxMintAmountPerTx);

    await Promise.all([...Array(iterations).keys()].map(async () => await contract.connect(whitelistedUser).mint(maxMintAmountPerTx, {value: getPrice(SaleType.PUBLIC_SALE, maxMintAmountPerTx)})));

    // Try to mint over max supply (before sold-out)
    await expect(contract.connect(holder).mint(lastMintAmount + 1, {value: getPrice(SaleType.PUBLIC_SALE, lastMintAmount + 1)})).to.be.revertedWith('Max supply exceeded!');
    await expect(contract.connect(holder).mint(lastMintAmount + 2, {value: getPrice(SaleType.PUBLIC_SALE, lastMintAmount + 2)})).to.be.revertedWith('Max supply exceeded!');

    expect(await contract.totalSupply()).to.equal(expectedTotalSupply);

    // Mint last tokens with owner address and test walletOfOwner(...)
    await contract.connect(owner).mint(lastMintAmount, {value: getPrice(SaleType.PUBLIC_SALE, lastMintAmount)});
    const expectedWalletOfOwner = [
      BigNumber.from(1),
    ];
    for (const i of [...Array(lastMintAmount).keys()].reverse()) {
      expectedWalletOfOwner.push(BigNumber.from(CollectionConfig.maxSupply - i));
    }
    expect(await contract.tokensOfOwner(
      await owner.getAddress(),
      {
        // Set gas limit to the maximum value since this function should be used off-chain only and it would fail otherwise...
        gasLimit: BigNumber.from('0xffffffffffffffff'),
      },
    )).deep.equal(expectedWalletOfOwner);

    // Try to mint over max supply (after sold-out)
    await expect(contract.connect(whitelistedUser).mint(1, {value: getPrice(SaleType.PUBLIC_SALE, 1)})).to.be.revertedWith('Max supply exceeded!');

    expect(await contract.totalSupply()).to.equal(CollectionConfig.maxSupply);
  });
    
  it('Token URI generation', async function () {
    const uriPrefix = 'ipfs://__COLLECTION_CID__/';
    const uriSuffix = '.json';
    const totalSupply = await contract.totalSupply();

    expect(await contract.tokenURI(1)).to.equal(CollectionConfig.hiddenMetadataUri);

    // Reveal collection
    await contract.setUriPrefix(uriPrefix);
    await contract.setRevealed(true);

    // ERC721A uses token IDs starting from 0 internally...
    await expect(contract.tokenURI(0)).to.be.revertedWith('ERC721Metadata: URI query for nonexistent token');

    // Testing first and last minted tokens
    expect(await contract.tokenURI(1)).to.equal(`${uriPrefix}1${uriSuffix}`);
    expect(await contract.tokenURI(totalSupply)).to.equal(`${uriPrefix}${totalSupply}${uriSuffix}`);
  });

  it('Free Mint should be firstxxxxx', async function () {
    let startMaxSupply = await contract.maxSupply();
    let startTotalSupply = await contract.totalSupply();
    console.log("_start max supply --> ", startMaxSupply);
    console.log("_start total supply --> ", startTotalSupply);

    const maxFreeMintSupply = 14;
    const maxFreeMintAmountPerTx = 5;
    // Nobody should be able to mint from a paused contract
    await expect(contract.connect(holder).freeMint(1)).to.be.revertedWith('The contract is paused!');

    await contract.setPaused(false);
    await expect(contract.connect(holder).freeMint(1)).to.be.revertedWith('Free mint is not available!');
    await contract.setHasFreeMint(true);
    await contract.setMaxFreeMintSupply(maxFreeMintSupply);
    await contract.setMaxFreeMintAmountPerTx(maxFreeMintAmountPerTx);
    await expect(contract.connect(holder).freeMint(0)).to.be.revertedWith('Free mint amount must be 1 or more!');
    await expect(contract.connect(holder).freeMint(maxFreeMintAmountPerTx + 1)).to.be.revertedWith('Free mint amount execeeds max per free mint transaction!');
    
     console.log("------------Attempt to MINT 3  ----------------------------- ");
     console.log("total supply before 3 mints --> ",   await contract.totalSupply());
    await contract.connect(holder).freeMint(3);
     console.log("total supply after 3 mints --> ",   await contract.totalSupply());
    // console.log("------------Minted 3  ----------------------------- ");
    // expect(await contract.balanceOf(await holder.getAddress())).to.equal(3);
    // console.log("------------Confirmed 3 mints  ----------------------------- ");

    await expect(contract.connect(holder).freeMint(2));
    await expect(contract.connect(holder).freeMint(2));
    await expect(contract.connect(holder).freeMint(5)).to.be.revertedWith('Free mint amount will exceed max free mint supply');
    await expect(contract.connect(holder).freeMint(1));
    
    const endMaxSupply = await contract.maxSupply();
    const endTotalSupply = await contract.totalSupply();
    startMaxSupply = await contract.maxSupply();
    startTotalSupply = await contract.totalSupply();
    console.log("----------------------------------------- ");
    console.log("start max supply --> ", startMaxSupply);
    console.log("end max supply --> ", endMaxSupply);
    console.log("start total supply --> ", startTotalSupply);
    console.log("end total supply --> ", endTotalSupply);
    console.log("Max FreeMin amount per txn", await contract.allowedFreeMintAmountPerTxn());
    console.log("msg.sender balanceOfNFtTokenAmountInWallet-> ", await contract.balanceOfNFtTokenAmountInWallet(await holder.getAddress()));
     console.log("contract.balanceOf(owner.address-> ", contract.balanceOf(owner.address)); 
    console.log("----------------------------------------- ");

    console.log("Holder EthBal", await holder.getBalance());
    console.log("Holder txnCnt", await holder.getTransactionCount());
    console.log("contract TotSupply", await contract.totalSupply());

    //console.log("holder-> ", holder);
      // await expect(contract.connect(holder).freeMint(1)).to.be.revertedWith('You have reached your eligible free mint amount. Your eligible free mint amount is the same as as the free mint per tranasction amount');
     //await expect(contract.connect(holder).freeMint(2)).to.be.revertedWith('The requested free mint amount will exceed your eligible free mint amount. Your eligible free mint amount is the same as as the free mint per tranasction amount');

    // Check balances
    const balanceOfContractAddress = await contract.balanceOf(await owner.getAddress());
    const balanceOfOwnerAddress = await contract.balanceOf(await owner.getAddress());
    const balanceOfHolderAddress = await contract.balanceOf(await holder.getAddress());
    const balanceOfExternalUserAddress = await contract.balanceOf(await externalUser.getAddress());
     console.log("balanceOfContractAddress-> ", balanceOfContractAddress);
    console.log("balanceOfOwnerAddress-> ", balanceOfOwnerAddress);
    console.log("balanceOfHolderAddress-> ", balanceOfHolderAddress);
     console.log("balanceOfExternalUserAddress-> ", balanceOfExternalUserAddress);
    
    //expect(await contract.balanceOf(await owner.getAddress())).to.equal(1);
   // expect(await contract.balanceOf(await whitelistedUser.getAddress())).to.equal(1);
    
    //expect(await contract.balanceOf(await holder.getAddress())).to.equal(0);
    //expect(await contract.balanceOf(await externalUser.getAddress())).to.equal(0);
  });
  
});
