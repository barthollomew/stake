import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonList } from '@ionic/angular/standalone';
import { InstrumentRowComponent } from '../../components/instrument-row/instrument-row.component';
import { StatusBarComponent } from '../../components/status-bar/status-bar.component';
import { PortfolioStore } from '../../data-access/portfolio.store';
import { SearchResult } from '../../data-access/models';
import { SearchStore } from '../../data-access/search.store';

@Component({
  selector: 'app-search-page',
  standalone: true,
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonList,
    StatusBarComponent,
    InstrumentRowComponent,
  ],
})
export class SearchPage {
  readonly results$ = this.searchStore.results$;
  query = '';

  constructor(
    private readonly searchStore: SearchStore,
    private readonly portfolioStore: PortfolioStore,
    private readonly router: Router
  ) {}

  onQueryChange(value: string): void {
    this.query = value;
    this.searchStore.setQuery(value);
  }

  onCancel(): void {
    this.query = '';
    this.searchStore.clearQuery();
    void this.router.navigate(['/discover']);
  }

  onSelectResult(result: SearchResult): void {
    this.portfolioStore.openOrderSheet({
      id: result.id,
      symbol: result.symbol,
      name: result.name,
      price: result.price,
      logoUrl: result.logoUrl,
    });
  }
}
