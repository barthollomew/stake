import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { GestureController } from '@ionic/angular/standalone';

// How far (0-1) the thumb must travel to trigger completion
const COMPLETION_THRESHOLD = 0.9;
// Minimum pixels to move before registering as intentional drag
const DRAG_INTENT_THRESHOLD_PX = 3;
// Padding between thumb and track edge (px)
const TRACK_PADDING_PX = 4;
// Reset animation duration (ms)
const RESET_ANIMATION_MS = 200;

type SwipeState = 'idle' | 'dragging' | 'locked';

@Component({
  selector: 'app-swipe-button',
  standalone: true,
  templateUrl: './swipe-button.component.html',
  styleUrls: ['./swipe-button.component.scss'],
})
export class SwipeButtonComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() label = 'Swipe to buy';
  @Input() disabled = false;
  @Input() resetSignal = 0;
  @Output() completed = new EventEmitter<void>();

  @ViewChild('track', { static: true }) trackRef!: ElementRef<HTMLDivElement>;
  @ViewChild('thumb', { static: true }) thumbRef!: ElementRef<HTMLDivElement>;

  private gesture?: { destroy: () => void; enable: (state: boolean) => void };
  private state: SwipeState = 'idle';
  private maxX = 0;
  private dragX = 0;
  private startX = 0;
  private hasDragged = false;

  constructor(private readonly gestureController: GestureController) {}

  ngAfterViewInit(): void {
    this.createGesture();
    requestAnimationFrame(() => this.calculateBounds());
    window.addEventListener('resize', this.handleResize);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetSignal'] && !changes['resetSignal'].firstChange) {
      this.reset(true);
    }
  }

  ngOnDestroy(): void {
    this.gesture?.destroy();
    window.removeEventListener('resize', this.handleResize);
  }

  private handleResize = (): void => {
    this.calculateBounds();
    this.setThumbPosition(this.dragX, false);
  };

  private createGesture(): void {
    const thumb = this.thumbRef.nativeElement;

    this.gesture = this.gestureController.create({
      el: thumb,
      threshold: 0,
      gestureName: 'swipe-buy',
      onStart: () => {
        if (this.disabled || this.state === 'locked') {
          return;
        }

        this.calculateBounds();
        this.setState('dragging');
        this.startX = this.dragX;
        this.hasDragged = false;
      },
      onMove: (detail) => {
        if (this.disabled || this.state === 'locked') {
          return;
        }

        // Only register as drag if moved past threshold (prevents accidental taps)
        if (Math.abs(detail.deltaX) >= DRAG_INTENT_THRESHOLD_PX) {
          this.hasDragged = true;
        }
        this.setThumbPosition(this.startX + detail.deltaX, false);
      },
      onEnd: () => {
        if (this.disabled || this.state === 'locked') {
          return;
        }

        this.setState('idle');
        if (!this.hasDragged || this.maxX <= 0) {
          this.reset(true);
          return;
        }
        const threshold = this.maxX * COMPLETION_THRESHOLD;
        if (this.dragX >= threshold) {
          this.complete();
        } else {
          this.reset(true);
        }
      },
    });

    this.gesture.enable(true);
  }

  /** Calculates the max horizontal distance the thumb can travel. */
  private calculateBounds(): void {
    const track = this.trackRef.nativeElement;
    const thumb = this.thumbRef.nativeElement;
    this.maxX = Math.max(track.clientWidth - thumb.clientWidth - TRACK_PADDING_PX, 0);
  }

  /** Updates thumb position and progress CSS variables. */
  private setThumbPosition(value: number, animate: boolean): void {
    const track = this.trackRef.nativeElement;
    const thumb = this.thumbRef.nativeElement;
    const clamped = Math.min(Math.max(value, 0), this.maxX);
    this.dragX = clamped;
    thumb.style.transition = animate ? `transform ${RESET_ANIMATION_MS}ms ease` : 'none';
    thumb.style.transform = `translateX(${clamped}px)`;
    const progress = this.maxX > 0 ? clamped / this.maxX : 0;
    track.style.setProperty('--progress', progress.toFixed(4));
    track.style.setProperty('--progress-percent', `${(progress * 100).toFixed(2)}%`);
  }

  private reset(animate = false): void {
    this.setState('idle');
    this.gesture?.enable(true);
    this.setThumbPosition(0, animate);
  }

  private complete(): void {
    if (this.state === 'locked') {
      return;
    }

    this.setState('locked');
    this.gesture?.enable(false);
    this.setThumbPosition(this.maxX, true);
    this.completed.emit();
  }

  /** Updates internal state and applies corresponding CSS classes. */
  private setState(state: SwipeState): void {
    this.state = state;
    const track = this.trackRef.nativeElement;
    track.classList.toggle('swipe-button--dragging', state === 'dragging');
  }
}
