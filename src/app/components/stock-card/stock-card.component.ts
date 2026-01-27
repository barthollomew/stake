import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IonCard } from '@ionic/angular/standalone';

export interface StockMetric {
  icon: string;
  value: string;
}

@Component({
  selector: 'app-stock-card',
  standalone: true,
  templateUrl: './stock-card.component.html',
  styleUrls: ['./stock-card.component.scss'],
  imports: [CommonModule, IonCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockCardComponent {
  @Input() size: 'large' | 'small' = 'small';
  @Input() symbol = '';
  @Input() name = '';
  @Input() price = 0;
  @Input() logoUrl = '';
  @Input() typeLabel = 'Stock';
  @Input() metrics: StockMetric[] = [];

  logoError = false;

  onLogoError(): void {
    this.logoError = true;
  }

  get logoSizeClass(): string {
    const sym = this.symbol.toUpperCase();
    if (sym === 'FIG') return 'stock-card__logo--fig';
    if (sym === 'BABA') return 'stock-card__logo--baba';
    return '';
  }
}
