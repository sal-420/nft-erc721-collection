import CollectionConfigInterface from '../lib/CollectionConfigInterface';
import * as Networks from '../lib/Networks';
import * as Marketplaces from '../lib/Marketplaces';
import whitelistAddresses from './whitelist.json';

const CollectionConfig: CollectionConfigInterface = {
 testnet:  Networks.ethereumTestnet,
  mainnet: Networks.ethereumMainnet,
  // The contract name can be updated using the following command:
  // yarn rename-contract NEW_CONTRACT_NAME
  // Please DO NOT change it manually!
  contractName: 'NotoriousRugs',
  tokenName: 'Notorious Rugs',
  tokenSymbol: 'NR',
  hiddenMetadataUri: 'ipfs://QmTeoiinEyUKhmv58yed3yMXkvJ614QqoDav9t6Gy6sjfS/hidden.json',
  maxSupply: 20,
  // FreeMint
  hasFreeMint: false,
  maxFreeMintSupply: 10,
  maxFreeMintAmountPerTx: 0,
  //
  whitelistSale: {
    price: 0.05,
    maxMintAmountPerTx: 1,
  },
  preSale: {
    price: 0.07,
    maxMintAmountPerTx: 2,
  },
  publicSale: {
    price: 0.0042069, 
    maxMintAmountPerTx: 2,
  },
  contractAddress: '0xB0Cbe158913A307cC2B17921d4df244f13bE1e6c',
  marketplaceIdentifier: 'notorious-rugs',
  marketplaceConfig: Marketplaces.openSea,
  whitelistAddresses,
};

export default CollectionConfig;
