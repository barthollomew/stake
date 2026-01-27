import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { SearchStore } from './search.store';
import { MockApiService } from './mock-api.service';
import { SearchResult } from './models';

describe('SearchStore', () => {
  let store: SearchStore;
  let mockApi: jasmine.SpyObj<MockApiService>;

  const mockSearchResults: SearchResult[] = [
    { id: '1', symbol: 'AAPL', name: 'Apple Inc.', price: 150 },
    { id: '2', symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140 },
    { id: '3', symbol: 'MSFT', name: 'Microsoft Corporation', price: 380 },
    { id: '4', symbol: 'AMZN', name: 'Amazon.com Inc.', price: 175 },
    { id: '5', symbol: 'META', name: 'Meta Platforms Inc.', price: 500 },
  ];

  beforeEach(() => {
    mockApi = jasmine.createSpyObj('MockApiService', ['getSearchResults']);
    mockApi.getSearchResults.and.returnValue(of(mockSearchResults));

    TestBed.configureTestingModule({
      providers: [
        SearchStore,
        { provide: MockApiService, useValue: mockApi },
      ],
    });

    store = TestBed.inject(SearchStore);
  });

  describe('initialization', () => {
    it('should load all search results on init', fakeAsync(() => {
      tick();
      
      let results: SearchResult[] = [];
      store.results$.subscribe((value) => (results = value));
      
      expect(results.length).toBe(5);
      expect(results).toEqual(mockSearchResults);
    }));

    it('should start with empty query', fakeAsync(() => {
      tick();
      
      let query = '';
      store.query$.subscribe((value) => (query = value));
      
      expect(query).toBe('');
    }));
  });

  describe('setQuery - happy paths', () => {
    it('should filter results by symbol', fakeAsync(() => {
      tick();
      store.setQuery('AAPL');

      let results: SearchResult[] = [];
      store.results$.subscribe((value) => (results = value));

      expect(results.length).toBe(1);
      expect(results[0].symbol).toBe('AAPL');
    }));

    it('should filter results by name', fakeAsync(() => {
      tick();
      store.setQuery('Microsoft');

      let results: SearchResult[] = [];
      store.results$.subscribe((value) => (results = value));

      expect(results.length).toBe(1);
      expect(results[0].symbol).toBe('MSFT');
    }));

    it('should filter case-insensitively', fakeAsync(() => {
      tick();
      store.setQuery('aapl');

      let results: SearchResult[] = [];
      store.results$.subscribe((value) => (results = value));

      expect(results.length).toBe(1);
      expect(results[0].symbol).toBe('AAPL');
    }));

    it('should match partial strings', fakeAsync(() => {
      tick();
      store.setQuery('Inc');

      let results: SearchResult[] = [];
      store.results$.subscribe((value) => (results = value));

      // Apple Inc., Alphabet Inc., Amazon.com Inc., Meta Platforms Inc.
      expect(results.length).toBe(4);
    }));

    it('should update query value', fakeAsync(() => {
      tick();
      store.setQuery('test query');

      let query = '';
      store.query$.subscribe((value) => (query = value));

      expect(query).toBe('test query');
    }));
  });

  describe('setQuery - edge cases', () => {
    it('should return all results for empty query', fakeAsync(() => {
      tick();
      store.setQuery('AAPL');
      store.setQuery('');

      let results: SearchResult[] = [];
      store.results$.subscribe((value) => (results = value));

      expect(results.length).toBe(5);
    }));

    it('should return empty array when no matches found', fakeAsync(() => {
      tick();
      store.setQuery('NONEXISTENT');

      let results: SearchResult[] = [];
      store.results$.subscribe((value) => (results = value));

      expect(results.length).toBe(0);
    }));

    it('should trim whitespace from query', fakeAsync(() => {
      tick();
      store.setQuery('  AAPL  ');

      let results: SearchResult[] = [];
      store.results$.subscribe((value) => (results = value));

      expect(results.length).toBe(1);
      expect(results[0].symbol).toBe('AAPL');
    }));

    it('should handle whitespace-only query as empty', fakeAsync(() => {
      tick();
      store.setQuery('   ');

      let results: SearchResult[] = [];
      store.results$.subscribe((value) => (results = value));

      expect(results.length).toBe(5); // All results
    }));

    it('should handle special characters in query', fakeAsync(() => {
      tick();
      store.setQuery('Amazon.com');

      let results: SearchResult[] = [];
      store.results$.subscribe((value) => (results = value));

      expect(results.length).toBe(1);
      expect(results[0].symbol).toBe('AMZN');
    }));
  });

  describe('clearQuery', () => {
    it('should reset query to empty string', fakeAsync(() => {
      tick();
      store.setQuery('AAPL');
      store.clearQuery();

      let query = '';
      store.query$.subscribe((value) => (query = value));

      expect(query).toBe('');
    }));

    it('should restore all results', fakeAsync(() => {
      tick();
      store.setQuery('AAPL');
      store.clearQuery();

      let results: SearchResult[] = [];
      store.results$.subscribe((value) => (results = value));

      expect(results.length).toBe(5);
    }));

    it('should be idempotent', fakeAsync(() => {
      tick();
      store.clearQuery();
      store.clearQuery();

      let results: SearchResult[] = [];
      store.results$.subscribe((value) => (results = value));

      expect(results.length).toBe(5);
    }));
  });
});
