import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonList } from '@ionic/angular/standalone';
import { map } from 'rxjs/operators';
import { InstrumentRowComponent } from '../../components/instrument-row/instrument-row.component';
import { SectionHeaderComponent } from '../../components/section-header/section-header.component';
import { StatusBarComponent } from '../../components/status-bar/status-bar.component';
import { StockCardComponent, StockMetric } from '../../components/stock-card/stock-card.component';
import { RecentlySearchedItem, TrendingStock } from '../../data-access/models';
import { PortfolioStore } from '../../data-access/portfolio.store';

@Component({
  selector: 'app-discover-page',
  standalone: true,
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonList,
    StatusBarComponent,
    SectionHeaderComponent,
    InstrumentRowComponent,
    StockCardComponent,
  ],
})
export class DiscoverPage {
  readonly recentlySearched$ = this.portfolioStore.recentlySearched$;
  readonly featuredStocks$ = this.portfolioStore.trending$.pipe(
    map((stocks) => stocks.slice(0, 3))
  );
  readonly featuredMetrics: StockMetric[] = [
    { icon: 'assets/default/circle-dollar.svg', value: '$36.9m' },
    { icon: 'assets/default/target.svg', value: '$1.2b' },
    { icon: 'assets/default/square-dollar.svg', value: '$30-32' },
  ];

  constructor(
    private readonly portfolioStore: PortfolioStore,
    private readonly router: Router
  ) {}

  onSearch(): void {
    this.router.navigate(['/search']);
  }

  onSelectRecent(item: RecentlySearchedItem): void {
    this.portfolioStore.openOrderSheet({
      id: item.id,
      symbol: item.symbol,
      name: item.subtitle,
      price: item.price,
    });
  }

  onSelectFeatured(stock: TrendingStock): void {
    this.portfolioStore.openOrderSheet({
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      logoUrl: stock.logoUrl,
    });
  }
}
