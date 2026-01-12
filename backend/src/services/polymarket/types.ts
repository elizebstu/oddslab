// Exported types for API consumers
export interface Activity {
  address: string;
  type: 'buy' | 'sell' | 'redeem' | 'split' | 'merge' | 'reward' | 'conversion' | 'maker_rebate';
  market: string;
  amount: number;
  timestamp: string;
  userName?: string;
  outcome?: string;
  icon?: string;
  transactionHash?: string;
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
export interface PolymarketActivity {
  proxyWallet: string;
  timestamp: number;
  conditionId: string;
  type: 'TRADE' | 'SPLIT' | 'MERGE' | 'REDEEM' | 'REWARD' | 'CONVERSION' | 'MAKER_REBATE';
  size: number;
  usdcSize: number;
  transactionHash: string;
  price: number;
  asset: string;
  side?: 'BUY' | 'SELL';
  outcomeIndex: number;
  title: string;
  slug: string;
  icon?: string;
  eventSlug?: string;
  outcome: string;
  name?: string;
  pseudonym?: string;
}

// Legacy type alias for backward compatibility
export type PolymarketTrade = PolymarketActivity;

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
