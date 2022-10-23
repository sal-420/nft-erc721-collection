import React from 'react';

interface Props {
  userAddress: string|null;
  totalSupply: number;
  maxSupply: number;
  isPaused: boolean;
  isWhitelistMintEnabled: boolean;
  isUserInWhitelist: boolean;
  isSoldOut: boolean;
  //
  hasFreeMint: boolean;
  maxFreeMintSupply: number;
  maxFreeMintAmountPerTx: number;
  //
}

interface State {
}

const defaultState: State = {
};

export default class CollectionStatus extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  private isSaleOpen(): boolean
  {
    return (this.props.isWhitelistMintEnabled || !this.props.isPaused) && !this.props.isSoldOut;
  }

  private totalFreeMintSupply(): number
  {
    if (this.props.totalSupply > this.props.maxFreeMintSupply)
    {
      return this.props.maxFreeMintSupply;
    }
    return this.props.totalSupply;
  }

  render() {
    return (
      <>
        <div className="collection-status">
          <div className="user-address">
            <span className="label">Wallet address:</span>
            <span className="address">{this.props.userAddress}</span>
            <hr/>
            <span className="label">Collection status is refreshed after each mint</span>
          </div>
          
          <div className="supply">
            <span className="label">Supply (Minted/Total)</span>
            {this.props.totalSupply}/{this.props.maxSupply}
             {this.props.hasFreeMint  ?
              <>
                <span className="label">Free Supply (Minted/Total)</span>
                {this.totalFreeMintSupply()}/{this.props.maxFreeMintSupply}
                <span className="label">{this.props.maxFreeMintAmountPerTx} free mints per wallet limit</span>
              </>
              :
              ''
            }
          </div>

          <div className="current-sale">
             <span className="label">Sale status</span>
             {this.isSaleOpen() ?
              <>
                  {this.props.isWhitelistMintEnabled ? 'Whitelist only' : 'Open'}
                  {this.props.hasFreeMint  ?
                   <>
                     <span className="label">Payable mints will be avaiable after total free mint supply is exhausted </span>
                   </>
                   :
                   ''
                  }
              </>
              :
              'Closed'
            }
          </div>
        </div>
      </>
    );
  }
}
