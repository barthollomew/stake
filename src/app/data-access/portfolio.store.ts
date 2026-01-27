import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import {
  Holding,
  HoldingsData,
  MarketData,
  OrderDraft,
  StockSummary,
  UserProfile,
} from './models';
import { MockApiService } from './mock-api.service';

// Simulated network delay for order confirmation (ms)
const ORDER_CONFIRM_DELAY_MS = 450;

interface PortfolioState {
  user: UserProfile;
  holdings: HoldingsData;
  market: MarketData;
  selectedStock: StockSummary | null;
  orderDraft: OrderDraft;
  orderSheetOpen: boolean;
  orderPending: boolean;
  toastMessage: string | null;
  loading: boolean;
  error: string | null;
}

const defaultOrderDraft: OrderDraft = {
  priceType: 'market',
  amount: 500,
  shares: 8.55,
};

const emptyHoldings: HoldingsData = { items: [] };
const emptyMarket: MarketData = { trending: [], recentlySearched: [] };
const emptyUser: UserProfile = { id: '', name: '', totalEquity: 0 };

const initialState: PortfolioState = {
  user: emptyUser,
  holdings: emptyHoldings,
  market: emptyMarket,
  selectedStock: null,
  orderDraft: defaultOrderDraft,
  orderSheetOpen: false,
  orderPending: false,
  toastMessage: null,
  loading: true,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class PortfolioStore {
  private readonly stateSubject = new BehaviorSubject<PortfolioState>(initialState);
  readonly state$ = this.stateSubject.asObservable();

  readonly totalEquity$ = this.select((state) => state.user.totalEquity);
  readonly holdings$ = this.select((state) => state.holdings.items);
  readonly trending$ = this.select((state) => state.market.trending);
  readonly recentlySearched$ = this.select((state) => state.market.recentlySearched);
  readonly selectedStock$ = this.select((state) => state.selectedStock);
  readonly orderDraft$ = this.select((state) => state.orderDraft);
  readonly orderSheetOpen$ = this.select((state) => state.orderSheetOpen);
  readonly orderPending$ = this.select((state) => state.orderPending);
  readonly toastMessage$ = this.select((state) => state.toastMessage);
  readonly loading$ = this.select((state) => state.loading);
  readonly error$ = this.select((state) => state.error);

  constructor(private readonly api: MockApiService) {
    this.loadInitialState();
  }

  openOrderSheet(stock: StockSummary): void {
    this.setState({
      selectedStock: stock,
      orderSheetOpen: true,
      orderPending: false,
      toastMessage: null,
      orderDraft: { ...defaultOrderDraft },
    });
  }

  closeOrderSheet(): void {
    this.setState({
      orderSheetOpen: false,
      selectedStock: null,
      orderPending: false,
    });
  }

  updateOrderDraft(partial: Partial<OrderDraft>): void {
    const state = this.stateSubject.value;
    this.setState({ orderDraft: { ...state.orderDraft, ...partial } });
  }

  updateOrderAmount(amount: number): void {
    const state = this.stateSubject.value;
    if (!state.selectedStock || state.selectedStock.price <= 0) {
      return;
    }
    const shares = Number((amount / state.selectedStock.price).toFixed(4));
    this.setState({
      orderDraft: { ...state.orderDraft, amount, shares },
    });
  }

  updateOrderShares(shares: number): void {
    const state = this.stateSubject.value;
    if (!state.selectedStock) {
      return;
    }
    const amount = Number((shares * state.selectedStock.price).toFixed(2));
    this.setState({
      orderDraft: { ...state.orderDraft, amount, shares },
    });
  }

  async confirmOrder(): Promise<boolean> {
    const state = this.stateSubject.value;
    if (!state.selectedStock) {
      return false;
    }

    const stock = state.selectedStock;
    const orderDraft = state.orderDraft;

    this.setState({ orderPending: true });
    await new Promise((resolve) => setTimeout(resolve, ORDER_CONFIRM_DELAY_MS));

    const nextHoldings = upsertHolding(state.holdings.items, stock, orderDraft);
    const totalEquity = Number(
      (state.user.totalEquity + stock.price * orderDraft.shares).toFixed(2)
    );
    // Use first word of stock name for toast, fallback to symbol if name is empty
    const toastName = stock.name?.split(' ')[0] || stock.symbol;

    this.stateSubject.next({
      ...state,
      holdings: { items: nextHoldings },
      user: { ...state.user, totalEquity },
      orderSheetOpen: false,
      selectedStock: null,
      orderPending: false,
      toastMessage: `${toastName} successfully purchased`,
    });
    return true;
  }

  clearToast(): void {
    this.setState({ toastMessage: null });
  }

  getOrderPendingSnapshot(): boolean {
    return this.stateSubject.value.orderPending;
  }

  private select<T>(selector: (state: PortfolioState) => T): Observable<T> {
    return this.state$.pipe(map(selector), distinctUntilChanged());
  }

  private setState(partial: Partial<PortfolioState>): void {
    const state = this.stateSubject.value;
    this.stateSubject.next({ ...state, ...partial });
  }

  private loadInitialState(): void {
    this.setState({ loading: true, error: null });

    forkJoin({
      user: this.api.getUserProfile(),
      holdings: this.api.getHoldingsData(),
      market: this.api.getMarketData(),
    })
      .pipe(take(1))
      .subscribe({
        next: ({ user, holdings, market }) => {
          const totalEquity =
            user.totalEquity > 0 ? user.totalEquity : calculateEquity(holdings.items);
          this.setState({
            user: { ...user, totalEquity },
            holdings,
            market,
            loading: false,
            error: null,
          });
        },
        error: (err) => {
          console.error('Failed to load portfolio data:', err);
          this.setState({
            loading: false,
            error: 'Failed to load data. Please try again.',
          });
        },
      });
  }
}

/** Calculates total equity value from all holdings. */
function calculateEquity(holdings: Holding[]): number {
  return holdings.reduce((total, holding) => total + holding.price * holding.shares, 0);
}

/**
 * Adds a new holding or updates an existing one.
 * If the stock already exists in holdings, adds the new shares to it.
 * Otherwise, creates a new holding entry.
 */
function upsertHolding(
  holdings: Holding[],
  stock: StockSummary,
  orderDraft: OrderDraft
): Holding[] {
  const existing = holdings.find((holding) => holding.symbol === stock.symbol);

  if (!existing) {
    // Create new holding
    return [
      ...holdings,
      {
        id: `holding-${stock.symbol.toLowerCase()}`,
        symbol: stock.symbol,
        name: stock.name,
        shares: orderDraft.shares,
        price: stock.price,
        changePercent: 0,
      },
    ];
  }

  // Update existing holding with additional shares
  return holdings.map((holding) =>
    holding.symbol === stock.symbol
      ? {
          ...holding,
          shares: Number((holding.shares + orderDraft.shares).toFixed(4)),
        }
      : holding
  );
}
