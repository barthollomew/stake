import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { OrderSheetComponent } from './components/order-sheet/order-sheet.component';
import { ToastComponent } from './components/toast/toast.component';
import { PortfolioStore } from './data-access/portfolio.store';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  imports: [
    IonApp,
    IonRouterOutlet,
    AsyncPipe,
    NgIf,
    OrderSheetComponent,
    ToastComponent,
  ],
})
export class AppComponent implements OnDestroy {
  readonly orderSheetOpen$ = this.portfolioStore.orderSheetOpen$;
  readonly selectedStock$ = this.portfolioStore.selectedStock$;
  readonly orderDraft$ = this.portfolioStore.orderDraft$;
  readonly toastMessage$ = this.portfolioStore.toastMessage$;
  readonly orderPending$ = this.portfolioStore.orderPending$;
  resetSignal = 0;
  private dismissTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isConfirming = false;

  constructor(
    private readonly portfolioStore: PortfolioStore,
    private readonly router: Router
  ) {}

  onOrderDismiss(): void {
    if (this.isConfirming) {
      this.isConfirming = false;
      return;
    }
    if (this.portfolioStore.getOrderPendingSnapshot()) {
      return;
    }
    this.resetSignal += 1;
    if (this.dismissTimeoutId) {
      clearTimeout(this.dismissTimeoutId);
    }
    this.dismissTimeoutId = setTimeout(() => {
      this.portfolioStore.closeOrderSheet();
      this.dismissTimeoutId = null;
    }, 300);
  }

  onOrderConfirm(): void {
    this.isConfirming = true;
    void this.portfolioStore.confirmOrder().then((confirmed) => {
      if (confirmed) {
        this.resetSignal += 1;
        void this.router.navigate(['/invest']);
      }
      this.isConfirming = false;
    });
  }

  onToastDismiss(): void {
    this.portfolioStore.clearToast();
  }

  onAmountChange(amount: number): void {
    this.portfolioStore.updateOrderAmount(amount);
  }

  onSharesChange(shares: number): void {
    this.portfolioStore.updateOrderShares(shares);
  }

  ngOnDestroy(): void {
    if (this.dismissTimeoutId) {
      clearTimeout(this.dismissTimeoutId);
    }
  }
}
