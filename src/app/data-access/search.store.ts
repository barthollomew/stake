import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, take } from 'rxjs/operators';
import { SearchResult } from './models';
import { MockApiService } from './mock-api.service';

interface SearchState {
  query: string;
  results: SearchResult[];
}

const initialState: SearchState = {
  query: '',
  results: [],
};

@Injectable({ providedIn: 'root' })
export class SearchStore {
  private readonly stateSubject = new BehaviorSubject<SearchState>(initialState);
  readonly state$ = this.stateSubject.asObservable();
  private allResults: SearchResult[] = [];

  readonly query$ = this.select((state) => state.query);
  readonly results$ = this.select((state) => state.results);

  constructor(private readonly api: MockApiService) {
    this.api
      .getSearchResults()
      .pipe(take(1))
      .subscribe((results) => {
        this.allResults = results;
        this.setState({ results });
      });
  }

  /** Filters search results by symbol or name (case-insensitive). */
  setQuery(query: string): void {
    const trimmed = query.trim().toLowerCase();
    const base = this.allResults;

    // Show all results if query is empty, otherwise filter by symbol/name
    const results = trimmed
      ? base.filter((result) =>
          result.symbol.toLowerCase().includes(trimmed) ||
          result.name.toLowerCase().includes(trimmed)
        )
      : base;

    this.setState({ query, results });
  }

  clearQuery(): void {
    this.setState({ query: '', results: this.allResults });
  }

  private select<T>(selector: (state: SearchState) => T): Observable<T> {
    return this.state$.pipe(map(selector), distinctUntilChanged());
  }

  private setState(partial: Partial<SearchState>): void {
    const state = this.stateSubject.value;
    this.stateSubject.next({ ...state, ...partial });
  }
}
