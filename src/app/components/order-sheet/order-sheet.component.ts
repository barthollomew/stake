import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { createAnimation, IonModal } from '@ionic/angular/standalone';
import { OrderDraft, StockSummary } from '../../data-access/models';
import { SwipeButtonComponent } from '../swipe-button/swipe-button.component';

// Animation timing constants
const ENTER_DURATION_MS = 280;
const LEAVE_DURATION_MS = 240;
const EASING_CURVE = 'cubic-bezier(0.32, 0.72, 0, 1)';

@Component({
  selector: 'app-order-sheet',
  standalone: true,
  templateUrl: './order-sheet.component.html',
  styleUrls: ['./order-sheet.component.scss'],
  imports: [CommonModule, FormsModule, IonModal, SwipeButtonComponent],
})
export class OrderSheetComponent {
  @Input() isOpen = false;
  @Input() stock: StockSummary | null = null;
  @Input() orderDraft: OrderDraft | null = null;
  @Input() isProcessing = false;
  @Input() resetSignal = 0;

  @Output() dismiss = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
  @Output() amountChange = new EventEmitter<number>();
  @Output() sharesChange = new EventEmitter<number>();

  readonly enterAnimation = (baseEl: HTMLElement) => {
    const parts = this.getModalParts(baseEl);
    if (!parts) {
      return createAnimation();
    }

    const { backdrop, wrapper } = parts;
    const backdropAnimation = createAnimation()
      .addElement(backdrop)
      .fromTo('opacity', '0.01', '0.15');

    const wrapperAnimation = createAnimation()
      .addElement(wrapper)
      .fromTo('transform', 'translateY(100%)', 'translateY(0)')
      .fromTo('opacity', '0.6', '1');

    return createAnimation()
      .addAnimation([backdropAnimation, wrapperAnimation])
      .duration(ENTER_DURATION_MS)
      .easing(EASING_CURVE);
  };

  readonly leaveAnimation = (baseEl: HTMLElement) => {
    const parts = this.getModalParts(baseEl);
    if (!parts) {
      return createAnimation();
    }

    const { backdrop, wrapper } = parts;
    const backdropAnimation = createAnimation()
      .addElement(backdrop)
      .fromTo('opacity', '0.15', '0');

    const wrapperAnimation = createAnimation()
      .addElement(wrapper)
      .fromTo('transform', 'translateY(0)', 'translateY(100%)')
      .fromTo('opacity', '1', '0');

    return createAnimation()
      .addAnimation([backdropAnimation, wrapperAnimation])
      .duration(LEAVE_DURATION_MS)
      .easing(EASING_CURVE);
  };

  get priceLabel(): string {
    if (!this.orderDraft) {
      return '';
    }

    return this.orderDraft.priceType === 'market' ? 'At market' : 'Limit';
  }

  onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    if (!isNaN(value) && value >= 0) {
      this.amountChange.emit(value);
    }
  }

  onSharesInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
    if (!isNaN(value) && value >= 0) {
      this.sharesChange.emit(value);
    }
  }

  private getModalParts(baseEl: HTMLElement): {
    backdrop: Element;
    wrapper: Element;
  } | null {
    const root = baseEl.shadowRoot;
    if (!root) {
      return null;
    }

    const backdrop = root.querySelector('ion-backdrop');
    const wrapper = root.querySelector('.modal-wrapper');

    if (!backdrop || !wrapper) {
      return null;
    }

    return { backdrop, wrapper };
  }
}
