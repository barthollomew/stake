import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PortfolioStore } from './portfolio.store';
import { MockApiService } from './mock-api.service';
import { StockSummary, OrderDraft, Holding } from './models';

describe('PortfolioStore', () => {
  let store: PortfolioStore;
  let mockApi: jasmine.SpyObj<MockApiService>;

  const mockUser = { id: 'user-1', name: 'Test User', totalEquity: 5000 };
  const mockHoldings = {
    items: [
      { id: 'h1', symbol: 'AAPL', name: 'Apple Inc.', shares: 10, price: 150, changePercent: 2.5 },
    ],
  };
  const mockMarket = {
    trending: [{ id: 't1', symbol: 'TSLA', name: 'Tesla', price: 200, logoUrl: '', typeLabel: 'Stock' }],
    recentlySearched: [],
  };

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('MockApiService', [
      'getUserProfile',
      'getHoldingsData',
      'getMarketData',
    ]);
    mockApi.getUserProfile.and.returnValue(of(mockUser));
    mockApi.getHoldingsData.and.returnValue(of(mockHoldings));
    mockApi.getMarketData.and.returnValue(of(mockMarket));

    TestBed.configureTestingModule({
      providers: [
        PortfolioStore,
        { provide: MockApiService, useValue: mockApi },
      ],
    });

    store = TestBed.inject(PortfolioStore);
  });

  describe('initialization', () => {
    it('should load initial data from API', fakeAsync(() => {
      tick();
      let totalEquity = 0;
      store.totalEquity$.subscribe((value: number) => (totalEquity = value));
      expect(totalEquity).toBe(5000);
    }));

    it('should calculate equity from holdings if user equity is 0', fakeAsync(() => {
      mockApi.getUserProfile.and.returnValue(of({ ...mockUser, totalEquity: 0 }));
      
      const newStore = new PortfolioStore(mockApi);
      tick();
      
      let totalEquity = 0;
      newStore.totalEquity$.subscribe((value: number) => (totalEquity = value));
      // 10 shares * $150 = $1500
      expect(totalEquity).toBe(1500);
    }));

    it('should handle API errors gracefully', fakeAsync(() => {
      mockApi.getUserProfile.and.returnValue(throwError(() => new Error('Network error')));
      
      const errorStore = new PortfolioStore(mockApi);
      tick();
      
      let error = '';
      errorStore.error$.subscribe((value: string | null) => (error = value ?? ''));
      expect(error).toBe('Failed to load data. Please try again.');
    }));
  });

  describe('openOrderSheet', () => {
    const testStock: StockSummary = {
      id: 'stock-1',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 140,
    };

    it('should set selected stock and open sheet', fakeAsync(() => {
      tick();
      store.openOrderSheet(testStock);

      let isOpen = false;
      let selectedSymbol = '';
      store.orderSheetOpen$.subscribe((value: boolean) => (isOpen = value));
      store.selectedStock$.subscribe((value: StockSummary | null) => (selectedSymbol = value?.symbol ?? ''));

      expect(isOpen).toBeTrue();
      expect(selectedSymbol).toBe('GOOGL');
    }));

    it('should reset order draft to defaults', fakeAsync(() => {
      tick();
      store.openOrderSheet(testStock);

      let priceType = '';
      let amount = 0;
      store.orderDraft$.subscribe((value: OrderDraft) => {
        priceType = value.priceType;
        amount = value.amount;
      });

      expect(priceType).toBe('market');
      expect(amount).toBe(500);
    }));
  });

  describe('closeOrderSheet', () => {
    it('should close sheet and clear selected stock', fakeAsync(() => {
      const testStock: StockSummary = { id: '1', symbol: 'TEST', name: 'Test', price: 100 };
      tick();
      
      store.openOrderSheet(testStock);
      store.closeOrderSheet();

      let isOpen = false;
      let hasSelectedStock = true;
      store.orderSheetOpen$.subscribe((value: boolean) => (isOpen = value));
      store.selectedStock$.subscribe((value: StockSummary | null) => (hasSelectedStock = value !== null));

      expect(isOpen).toBeFalse();
      expect(hasSelectedStock).toBeFalse();
    }));
  });

  describe('updateOrderAmount', () => {
    const testStock: StockSummary = { id: '1', symbol: 'TEST', name: 'Test', price: 100 };

    it('should calculate shares from amount', fakeAsync(() => {
      tick();
      store.openOrderSheet(testStock);
      store.updateOrderAmount(250);

      let amount = 0;
      let shares = 0;
      store.orderDraft$.subscribe((value: OrderDraft) => {
        amount = value.amount;
        shares = value.shares;
      });

      expect(amount).toBe(250);
      expect(shares).toBe(2.5); // 250 / 100
    }));

    it('should not update if no stock selected', fakeAsync(() => {
      tick();
      
      store.updateOrderAmount(1000);

      let amount = 0;
      store.orderDraft$.subscribe((value: OrderDraft) => (amount = value.amount));
      
      // Should remain at default
      expect(amount).toBe(500);
    }));

    it('should not update if stock price is 0', fakeAsync(() => {
      const zeroStock: StockSummary = { id: '1', symbol: 'TEST', name: 'Test', price: 0 };
      tick();
      store.openOrderSheet(zeroStock);
      
      store.updateOrderAmount(1000);

      let amount = 0;
      store.orderDraft$.subscribe((value: OrderDraft) => (amount = value.amount));
      
      expect(amount).toBe(500); // default
    }));
  });

  describe('updateOrderShares', () => {
    const testStock: StockSummary = { id: '1', symbol: 'TEST', name: 'Test', price: 50 };

    it('should calculate amount from shares', fakeAsync(() => {
      tick();
      store.openOrderSheet(testStock);
      store.updateOrderShares(4);

      let shares = 0;
      let amount = 0;
      store.orderDraft$.subscribe((value: OrderDraft) => {
        shares = value.shares;
        amount = value.amount;
      });

      expect(shares).toBe(4);
      expect(amount).toBe(200); // 4 * 50
    }));

    it('should not update if no stock selected', fakeAsync(() => {
      tick();
      store.updateOrderShares(10);

      let shares = 0;
      store.orderDraft$.subscribe((value: OrderDraft) => (shares = value.shares));
      
      // Should remain at default
      expect(shares).toBe(8.55);
    }));
  });

  describe('confirmOrder', () => {
    const testStock: StockSummary = { id: '1', symbol: 'NVDA', name: 'NVIDIA Corp', price: 100 };

    it('should add new holding and close sheet', fakeAsync(() => {
      tick();
      store.openOrderSheet(testStock);
      store.updateOrderAmount(500);
      
      const result = store.confirmOrder();
      tick(500); // Wait for confirmation delay

      result.then((success: boolean) => {
        expect(success).toBeTrue();
      });

      let holdings: Holding[] = [];
      store.holdings$.subscribe((value: Holding[]) => (holdings = value));
      
      const nvdaHolding = holdings.find((h) => h.symbol === 'NVDA');
      expect(nvdaHolding).toBeTruthy();
      expect(nvdaHolding?.shares).toBe(5); // 500 / 100
    }));

    it('should update existing holding shares', fakeAsync(() => {
      // Start with existing AAPL holding
      tick();
      
      const appleStock: StockSummary = { id: '1', symbol: 'AAPL', name: 'Apple Inc.', price: 150 };
      store.openOrderSheet(appleStock);
      store.updateOrderShares(5);
      
      store.confirmOrder();
      tick(500);

      let holdings: Holding[] = [];
      store.holdings$.subscribe((value: Holding[]) => (holdings = value));
      
      const appleHolding = holdings.find((h) => h.symbol === 'AAPL');
      expect(appleHolding?.shares).toBe(15); // 10 original + 5 new
    }));

    it('should show toast message on success', fakeAsync(() => {
      tick();
      store.openOrderSheet(testStock);
      store.confirmOrder();
      tick(500);

      let toast = '';
      store.toastMessage$.subscribe((value: string | null) => (toast = value ?? ''));
      
      expect(toast).toBe('NVIDIA successfully purchased');
    }));

    it('should return false if no stock selected', fakeAsync(() => {
      tick();
      
      store.confirmOrder().then((success: boolean) => {
        expect(success).toBeFalse();
      });
      tick(500);
    }));

    it('should update total equity', fakeAsync(() => {
      tick();
      store.openOrderSheet(testStock);
      store.updateOrderShares(10);
      
      store.confirmOrder();
      tick(500);

      let totalEquity = 0;
      store.totalEquity$.subscribe((value: number) => (totalEquity = value));
      
      // 5000 + (100 * 10) = 6000
      expect(totalEquity).toBe(6000);
    }));
  });

  describe('clearToast', () => {
    it('should clear toast message', fakeAsync(() => {
      const testStock: StockSummary = { id: '1', symbol: 'TEST', name: 'Test', price: 100 };
      tick();
      store.openOrderSheet(testStock);
      store.confirmOrder();
      tick(500);
      
      store.clearToast();

      let toast: string | null = null;
      store.toastMessage$.subscribe((value: string | null) => (toast = value));
      
      expect(toast).toBeNull();
    }));
  });

  describe('getOrderPendingSnapshot', () => {
    it('should return current pending state', fakeAsync(() => {
      tick();
      expect(store.getOrderPendingSnapshot()).toBeFalse();
    }));
  });
});
