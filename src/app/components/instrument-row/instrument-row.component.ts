import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IonItem } from '@ionic/angular/standalone';

@Component({
  selector: 'app-instrument-row',
  standalone: true,
  templateUrl: './instrument-row.component.html',
  styleUrls: ['./instrument-row.component.scss'],
  imports: [CommonModule, IonItem],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstrumentRowComponent {
  @Input() symbol = '';
  @Input() subtitle = '';
  @Input() price: number | null = null;
  @Input() changePercent: number | null = null;

  get changeLabel(): string {
    if (this.changePercent === null) {
      return '';
    }

    const sign = this.changePercent >= 0 ? '+' : '-';
    return `${sign}${Math.abs(this.changePercent).toFixed(2)}%`;
  }
}
