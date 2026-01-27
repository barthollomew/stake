import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderSheetComponent } from './order-sheet.component';
import { StockSummary, OrderDraft } from '../../data-access/models';
import { IonModal } from '@ionic/angular/standalone';

describe('OrderSheetComponent', () => {
  let component: OrderSheetComponent;
  let fixture: ComponentFixture<OrderSheetComponent>;

  const mockStock: StockSummary = {
    id: 'stock-1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 150.5,
    logoUrl: 'https://github.githubassets.com/images/icons/emoji/unicode/1f34e.png?v8',
  };

  const mockOrderDraft: OrderDraft = {
    priceType: 'market',
    amount: 500,
    shares: 3.32,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderSheetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have default input values', () => {
      expect(component.isOpen).toBeFalse();
      expect(component.stock).toBeNull();
      expect(component.orderDraft).toBeNull();
      expect(component.isProcessing).toBeFalse();
      expect(component.resetSignal).toBe(0);
    });
  });

  describe('priceLabel getter', () => {
    it('should return empty string when orderDraft is null', () => {
      component.orderDraft = null;
      expect(component.priceLabel).toBe('');
    });

    it('should return "At market" for market orders', () => {
      component.orderDraft = { ...mockOrderDraft, priceType: 'market' };
      expect(component.priceLabel).toBe('At market');
    });

    it('should return "Limit" for limit orders', () => {
      component.orderDraft = { ...mockOrderDraft, priceType: 'limit' };
      expect(component.priceLabel).toBe('Limit');
    });
  });

  describe('onAmountInput', () => {
    it('should emit valid positive numbers', () => {
      spyOn(component.amountChange, 'emit');
      
      const mockEvent = {
        target: { value: '750' } as HTMLInputElement,
      } as unknown as Event;
      
      component.onAmountInput(mockEvent);
      
      expect(component.amountChange.emit).toHaveBeenCalledWith(750);
    });

    it('should emit zero values', () => {
      spyOn(component.amountChange, 'emit');
      
      const mockEvent = {
        target: { value: '0' } as HTMLInputElement,
      } as unknown as Event;
      
      component.onAmountInput(mockEvent);
      
      expect(component.amountChange.emit).toHaveBeenCalledWith(0);
    });

    it('should not emit for negative values', () => {
      spyOn(component.amountChange, 'emit');
      
      const mockEvent = {
        target: { value: '-100' } as HTMLInputElement,
      } as unknown as Event;
      
      component.onAmountInput(mockEvent);
      
      expect(component.amountChange.emit).not.toHaveBeenCalled();
    });

    it('should not emit for NaN values', () => {
      spyOn(component.amountChange, 'emit');
      
      const mockEvent = {
        target: { value: 'abc' } as HTMLInputElement,
      } as unknown as Event;
      
      component.onAmountInput(mockEvent);
      
      expect(component.amountChange.emit).not.toHaveBeenCalled();
    });

    it('should handle decimal values', () => {
      spyOn(component.amountChange, 'emit');
      
      const mockEvent = {
        target: { value: '123.45' } as HTMLInputElement,
      } as unknown as Event;
      
      component.onAmountInput(mockEvent);
      
      expect(component.amountChange.emit).toHaveBeenCalledWith(123.45);
    });
  });

  describe('onSharesInput', () => {
    it('should emit valid positive numbers', () => {
      spyOn(component.sharesChange, 'emit');
      
      const mockEvent = {
        target: { value: '10' } as HTMLInputElement,
      } as unknown as Event;
      
      component.onSharesInput(mockEvent);
      
      expect(component.sharesChange.emit).toHaveBeenCalledWith(10);
    });

    it('should emit fractional shares', () => {
      spyOn(component.sharesChange, 'emit');
      
      const mockEvent = {
        target: { value: '2.5678' } as HTMLInputElement,
      } as unknown as Event;
      
      component.onSharesInput(mockEvent);
      
      expect(component.sharesChange.emit).toHaveBeenCalledWith(2.5678);
    });

    it('should not emit for negative values', () => {
      spyOn(component.sharesChange, 'emit');
      
      const mockEvent = {
        target: { value: '-5' } as HTMLInputElement,
      } as unknown as Event;
      
      component.onSharesInput(mockEvent);
      
      expect(component.sharesChange.emit).not.toHaveBeenCalled();
    });

    it('should not emit for NaN values', () => {
      spyOn(component.sharesChange, 'emit');
      
      const mockEvent = {
        target: { value: 'invalid' } as HTMLInputElement,
      } as unknown as Event;
      
      component.onSharesInput(mockEvent);
      
      expect(component.sharesChange.emit).not.toHaveBeenCalled();
    });
  });

  describe('output events', () => {
    it('should have dismiss output', () => {
      expect(component.dismiss).toBeTruthy();
    });

    it('should have confirm output', () => {
      expect(component.confirm).toBeTruthy();
    });

    it('should have amountChange output', () => {
      expect(component.amountChange).toBeTruthy();
    });

    it('should have sharesChange output', () => {
      expect(component.sharesChange).toBeTruthy();
    });
  });

  describe('input bindings', () => {
    it('should accept stock input', () => {
      component.stock = mockStock;
      fixture.detectChanges();
      expect(component.stock).toEqual(mockStock);
    });

    it('should accept orderDraft input', () => {
      component.orderDraft = mockOrderDraft;
      fixture.detectChanges();
      expect(component.orderDraft).toEqual(mockOrderDraft);
    });

    it('should accept isOpen input', () => {
      component.isOpen = true;
      fixture.detectChanges();
      expect(component.isOpen).toBeTrue();
    });

    it('should accept isProcessing input', () => {
      component.isProcessing = true;
      fixture.detectChanges();
      expect(component.isProcessing).toBeTrue();
    });
  });

  describe('animations', () => {
    it('should have enterAnimation function', () => {
      expect(typeof component.enterAnimation).toBe('function');
    });

    it('should have leaveAnimation function', () => {
      expect(typeof component.leaveAnimation).toBe('function');
    });

    it('should handle missing shadowRoot in enterAnimation', () => {
      const mockElement = document.createElement('div');
      const animation = component.enterAnimation(mockElement);
      expect(animation).toBeTruthy();
    });

    it('should handle missing shadowRoot in leaveAnimation', () => {
      const mockElement = document.createElement('div');
      const animation = component.leaveAnimation(mockElement);
      expect(animation).toBeTruthy();
    });
  });
});
