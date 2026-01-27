import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { IonContent, IonItem, IonList } from '@ionic/angular/standalone';
import { SectionHeaderComponent } from '../../components/section-header/section-header.component';
import { StatusBarComponent } from '../../components/status-bar/status-bar.component';
import { StockCardComponent } from '../../components/stock-card/stock-card.component';
import { Holding, TrendingStock } from '../../data-access/models';
import { PortfolioStore } from '../../data-access/portfolio.store';

@Component({
  selector: 'app-invest-page',
  standalone: true,
  templateUrl: './invest.page.html',
  styleUrls: ['./invest.page.scss'],
  animations: [
    trigger('equitySwap', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('220ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('220ms ease-out', style({ opacity: 0 }))]),
    ]),
    trigger('rowEnter', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
  imports: [
    CommonModule,
    IonContent,
    IonList,
    IonItem,
    StatusBarComponent,
    SectionHeaderComponent,
    StockCardComponent,
  ],
})
export class InvestPage {
  readonly totalEquity$ = this.portfolioStore.totalEquity$;
  readonly holdings$ = this.portfolioStore.holdings$;
  readonly trending$ = this.portfolioStore.trending$;

  constructor(
    private readonly portfolioStore: PortfolioStore
  ) {}

  trackByHolding(index: number, holding: Holding): string {
    return holding.id;
  }

  trackByValue(index: number, value: number): number {
    return value;
  }

  formatChange(changePercent: number): string {
    const sign = changePercent >= 0 ? '+' : '-';
    return `${sign}${Math.abs(changePercent).toFixed(2)}%`;
  }

  onSelectHolding(holding: Holding): void {
    this.portfolioStore.openOrderSheet({
      id: holding.id,
      symbol: holding.symbol,
      name: holding.name,
      price: holding.price,
    });
  }

  onSelectTrending(stock: TrendingStock): void {
    this.portfolioStore.openOrderSheet({
      id: stock.id,
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      logoUrl: stock.logoUrl,
    });
  }
}
