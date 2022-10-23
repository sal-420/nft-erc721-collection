# NFT ERC721 Collection with partial free mint option

A fork of the [hashlips ERC721 collection](https://github.com/hashlips-lab/nft-erc721-collection) repo modified public sale option to include a hybrid of free and paid mints.

## Disclaimer

This project was created for educational purposes, please refer to the [LICENCE](LICENSE) file for further information.

## Main features

A public sale with free and paid mints. When the free mint supply is exhausted the contract switches to paid mints.

## Requirements

### Software

Please refer to the [hashlips ERC721 collection](https://github.com/hashlips-lab/nft-erc721-collection) for excellent video's.

### Services

Please refer to the [hashlips ERC721 collection](https://github.com/hashlips-lab/nft-erc721-collection) for excellent video's.

### Partial Free Mint Setup

This project follows the hashlips ERC721 collection set-up and deployment process for a seamless free mint to paid mint set-up.

Before deploying the contract update `CollectionFonfig.ts` 

|Step|Description|Field to update|
|---|---|---|
|`01`|Set the free mint supply|`maxFreeMintSupply: 10`|
|`02`|Set the mint cost to be used after free mints are exhausted| `publicSale: { ` **`price: 0.0042069,`**|

#### Deploy the contract with partial free mints set-up, **in this order:**

|Step|Description|
|---|---|
|`01`|Open the public sale, run script: `public-sale-open`|
|`02`|Head over to your contract on etherscan|
|`03`|Set the number of max free mints per transaction using function: `setMaxFreeMintAmountPerTxn`|
|`04`|Active the free mint option using function: `setHasFreeMint` to set `_state` to `true`|

The contract is now setup for partial free mints. When the free mint supply is exhaused the contract will switch to the paid amount