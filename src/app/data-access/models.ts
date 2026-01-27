export interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  price: number;
  changePercent: number;
}

export interface HoldingsData {
  items: Holding[];
}

export interface TrendingStock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  logoUrl?: string;
  typeLabel: string;
}

export interface RecentlySearchedItem {
  id: string;
  symbol: string;
  subtitle: string;
  price: number;
  changePercent?: number;
}

export interface MarketData {
  trending: TrendingStock[];
  recentlySearched: RecentlySearchedItem[];
}

export interface SearchResult {
  id: string;
  symbol: string;
  name: string;
  price: number;
  logoUrl?: string;
}

export interface StockSummary {
  id: string;
  symbol: string;
  name: string;
  price: number;
  logoUrl?: string;
}

export interface OrderDraft {
  priceType: 'market' | 'limit';
  amount: number;
  shares: number;
}

export interface UserProfile {
  id: string;
  name: string;
  totalEquity: number;
}
