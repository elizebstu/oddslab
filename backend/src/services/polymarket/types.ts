// Exported types for API consumers
export interface Activity {
  address: string;
  type: 'buy' | 'sell' | 'redeem';
  market: string;
  amount: number;
  timestamp: string;
  userName?: string;
}

export interface Position {
  market: string;
  outcome: string;
  totalValue: number;
  totalShares: number;
  avgPrice: number;
  currentPrice: number;
  cashPnl: number;
  percentPnl: number;
}

// Internal types for Polymarket API responses
export interface PolymarketTrade {
  proxyWallet: string;
  side: 'BUY' | 'SELL';
  asset: string;
  conditionId: string;
  size: number;
  price: number;
  timestamp: number;
  title: string;
  slug: string;
  outcome: string;
  outcomeIndex: number;
  transactionHash: string;
}

export interface PolymarketPosition {
  conditionId: string;
  outcome: string;
  title: string;
  slug: string;
  size: number;
  currentValue: number;
  avgPrice: number;
  curPrice: number;
  outcomeIndex: number;
  cashPnl: number;
  percentPnl: number;
}

export interface PolymarketProfile {
  displayUsernamePublic?: string;
  pseudonym?: string;
  name?: string;
  profileImage?: string;
  createdAt?: string;
  proxyWallet?: string;
}

export interface SearchResult {
  id: string;
  type: string;
  profile?: PolymarketProfile;
}
