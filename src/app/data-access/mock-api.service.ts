import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  HoldingsData,
  MarketData,
  SearchResult,
  UserProfile,
} from './models';
import {
  mockHoldingsData,
  mockMarketData,
  mockSearchResults,
  mockUserProfile,
} from './mock-data';

// Simulate API calls, would replace this in prod
@Injectable({ providedIn: 'root' })
export class MockApiService {
  getUserProfile(): Observable<UserProfile> {
    return of({ ...mockUserProfile }).pipe(delay(40));
  }

  getHoldingsData(): Observable<HoldingsData> {
    return of({
      items: mockHoldingsData.items.map((holding) => ({ ...holding })),
    }).pipe(delay(60));
  }

  getMarketData(): Observable<MarketData> {
    return of({
      trending: mockMarketData.trending.map((stock) => ({ ...stock })),
      recentlySearched: mockMarketData.recentlySearched.map((item) => ({
        ...item,
      })),
    }).pipe(delay(50));
  }

  getSearchResults(): Observable<SearchResult[]> {
    return of(mockSearchResults.map((result) => ({ ...result }))).pipe(delay(30));
  }
}
