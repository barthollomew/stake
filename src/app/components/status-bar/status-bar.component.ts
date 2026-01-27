import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBarComponent implements OnInit, OnDestroy {
  /**
   * Display time shown in the status bar.
   * If not provided, shows the current system time (updates every minute).
   */
  @Input() time: string | null = null;

  displayTime = '';
  private intervalId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (this.time) {
      this.displayTime = this.time;
    } else {
      this.updateTime();
      // Update time every minute
      this.intervalId = setInterval(() => this.updateTime(), 60000);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateTime(): void {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.displayTime = `${hours}:${minutes}`;
  }
}
