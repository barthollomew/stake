import {
  Holding,
  HoldingsData,
  MarketData,
  RecentlySearchedItem,
  SearchResult,
  TrendingStock,
  UserProfile,
} from './models';

import detailsData from '../../assets/data/details.json';
import pricingData from '../../assets/data/pricing.json';

function getPrice(symbol: string): number {
  const pricing = pricingData.find((p) => p.symbol === symbol);
  return pricing?.ask ?? 0;
}

function getDetails(symbol: string) {
  return detailsData.find((d) => d.symbol === symbol);
}

const mockHoldings: Holding[] = [
  {
    id: 'holding-nvda',
    symbol: 'NVDA',
    name: getDetails('NVDA')?.fullName ?? 'NVIDIA Corporation',
    shares: 3.2291,
    price: getPrice('NVDA'),
    changePercent: 32.9,
  },
  {
    id: 'holding-googl',
    symbol: 'GOOGL',
    name: getDetails('GOOGL')?.fullName ?? 'Alphabet Inc.',
    shares: 1.3036,
    price: getPrice('GOOGL'),
    changePercent: 2.9,
  },
  {
    id: 'holding-abnb',
    symbol: 'ABNB',
    name: getDetails('ABNB')?.fullName ?? 'Airbnb, Inc.',
    shares: 0.16,
    price: getPrice('ABNB'),
    changePercent: 11.9,
  },
  {
    id: 'holding-tsla',
    symbol: 'TSLA',
    name: getDetails('TSLA')?.fullName ?? 'Tesla, Inc.',
    shares: 8.55,
    price: getPrice('TSLA'),
    changePercent: 0.01,
  },
];

export const mockTrendingStocks: TrendingStock[] = [
  {
    id: 'trend-fig',
    symbol: 'FIG',
    name: 'Figma Inc',
    price: 58.44,
    logoUrl: 'assets/logos/fig.svg',
    typeLabel: 'Stock',
  },
  {
    id: 'trend-abnb',
    symbol: 'ABNB',
    name: 'Airbnb Pty Ltd',
    price: 125.03,
    logoUrl: 'assets/logos/abnb.svg',
    typeLabel: 'Stock',
  },
  {
    id: 'trend-baba',
    symbol: 'BABA',
    name: 'Alibaba Group',
    price: 136.68,
    logoUrl: 'assets/logos/baba.svg',
    typeLabel: 'Stock',
  },
];

export const mockRecentlySearched: RecentlySearchedItem[] = [
  {
    id: 'recent-amzn',
    symbol: 'AMZN',
    subtitle: getDetails('AMZN')?.fullName ?? 'Amazon.com, Inc.',
    price: getPrice('AMZN'),
  },
  {
    id: 'recent-nflx',
    symbol: 'NFLX',
    subtitle: getDetails('NFLX')?.fullName ?? 'Netflix, Inc.',
    price: getPrice('NFLX'),
    changePercent: 1.5,
  },
  {
    id: 'recent-coin',
    symbol: 'COIN',
    subtitle: getDetails('COIN')?.fullName ?? 'Coinbase Global, Inc.',
    price: getPrice('COIN'),
    changePercent: -5.2,
  },
];

export const mockHoldingsData: HoldingsData = {
  items: mockHoldings,
};

export const mockMarketData: MarketData = {
  trending: mockTrendingStocks,
  recentlySearched: mockRecentlySearched,
};

export const mockUserProfile: UserProfile = {
  id: 'user-1',
  name: 'Alex',
  totalEquity: 8636,
};

export const mockSearchResults: SearchResult[] = [
  { id: 'search-tsla', symbol: 'TSLA', name: getDetails('TSLA')?.fullName ?? 'Tesla', price: getPrice('TSLA') },
  { id: 'search-nvda', symbol: 'NVDA', name: getDetails('NVDA')?.fullName ?? 'NVIDIA', price: getPrice('NVDA') },
  { id: 'search-aapl', symbol: 'AAPL', name: getDetails('AAPL')?.fullName ?? 'Apple', price: getPrice('AAPL') },
  { id: 'search-msft', symbol: 'MSFT', name: getDetails('MSFT')?.fullName ?? 'Microsoft', price: getPrice('MSFT') },
  { id: 'search-googl', symbol: 'GOOGL', name: getDetails('GOOGL')?.fullName ?? 'Alphabet', price: getPrice('GOOGL') },
];
