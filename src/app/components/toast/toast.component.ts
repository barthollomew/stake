import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent implements OnChanges, OnDestroy {
  @Input() message: string | null = null;
  @Output() dismissed = new EventEmitter<void>();

  private timeoutId: number | null = null;
  private readonly toastDurationMs = 10000;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['message']) {
      return;
    }

    this.clearDismissTimer();

    if (changes['message'].currentValue) {
      // Keep the toast visible long enough to read.
      this.timeoutId = window.setTimeout(() => {
        this.timeoutId = null;
        this.dismissed.emit();
      }, this.toastDurationMs);
    }
  }

  ngOnDestroy(): void {
    this.clearDismissTimer();
  }

  private clearDismissTimer(): void {
    if (this.timeoutId === null) {
      return;
    }

    window.clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }
}
