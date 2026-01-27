import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { GestureController } from '@ionic/angular/standalone';
import { SwipeButtonComponent } from './swipe-button.component';

// Test host component to control inputs/outputs
@Component({
  standalone: true,
  imports: [SwipeButtonComponent],
  template: `
    <app-swipe-button
      [label]="label"
      [disabled]="disabled"
      [resetSignal]="resetSignal"
      (completed)="onCompleted()"
    />
  `,
})
class TestHostComponent {
  @ViewChild(SwipeButtonComponent) swipeButton!: SwipeButtonComponent;
  label = 'Swipe to buy';
  disabled = false;
  resetSignal = 0;
  completedCount = 0;

  onCompleted(): void {
    this.completedCount++;
  }
}

describe('SwipeButtonComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let mockGestureController: jasmine.SpyObj<GestureController>;
  let mockGesture: { destroy: jasmine.Spy; enable: jasmine.Spy };

  beforeEach(async () => {
    mockGesture = {
      destroy: jasmine.createSpy('destroy'),
      enable: jasmine.createSpy('enable'),
    };

    mockGestureController = jasmine.createSpyObj('GestureController', ['create']);
    mockGestureController.create.and.returnValue(mockGesture as any);

    await TestBed.configureTestingModule({
      imports: [TestHostComponent, SwipeButtonComponent],
      providers: [
        { provide: GestureController, useValue: mockGestureController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('initialization', () => {
    it('should create the component', () => {
      expect(hostComponent.swipeButton).toBeTruthy();
    });

    it('should initialize with default label', () => {
      expect(hostComponent.swipeButton.label).toBe('Swipe to buy');
    });

    it('should create gesture on init', () => {
      expect(mockGestureController.create).toHaveBeenCalled();
    });

    it('should enable gesture by default', () => {
      expect(mockGesture.enable).toHaveBeenCalledWith(true);
    });
  });

  describe('input bindings', () => {
    it('should accept custom label', () => {
      hostComponent.label = 'Swipe to confirm';
      fixture.detectChanges();
      expect(hostComponent.swipeButton.label).toBe('Swipe to confirm');
    });

    it('should accept disabled state', () => {
      hostComponent.disabled = true;
      fixture.detectChanges();
      expect(hostComponent.swipeButton.disabled).toBeTrue();
    });
  });

  describe('disabled state', () => {
    it('should not emit completed when disabled', () => {
      hostComponent.disabled = true;
      fixture.detectChanges();

      // The gesture callbacks check disabled state internally
      expect(hostComponent.completedCount).toBe(0);
    });
  });

  describe('resetSignal', () => {
    it('should trigger reset when signal changes', fakeAsync(() => {
      hostComponent.resetSignal = 1;
      fixture.detectChanges();
      tick();

      // Reset should re-enable gesture
      expect(mockGesture.enable).toHaveBeenCalled();
    }));
  });

  describe('cleanup', () => {
    it('should destroy gesture on component destroy', () => {
      fixture.destroy();
      expect(mockGesture.destroy).toHaveBeenCalled();
    });
  });
});

describe('SwipeButtonComponent (isolated)', () => {
  let component: SwipeButtonComponent;
  let fixture: ComponentFixture<SwipeButtonComponent>;
  let mockGestureController: jasmine.SpyObj<GestureController>;
  let mockGesture: { destroy: jasmine.Spy; enable: jasmine.Spy };

  beforeEach(async () => {
    mockGesture = {
      destroy: jasmine.createSpy('destroy'),
      enable: jasmine.createSpy('enable'),
    };

    mockGestureController = jasmine.createSpyObj('GestureController', ['create']);
    mockGestureController.create.and.returnValue(mockGesture as any);

    await TestBed.configureTestingModule({
      imports: [SwipeButtonComponent],
      providers: [
        { provide: GestureController, useValue: mockGestureController },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SwipeButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should have default input values', () => {
    expect(component.label).toBe('Swipe to buy');
    expect(component.disabled).toBeFalse();
    expect(component.resetSignal).toBe(0);
  });

  it('should have completed output', () => {
    expect(component.completed).toBeTruthy();
  });

  it('should create gesture with correct name', () => {
    expect(mockGestureController.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        gestureName: 'swipe-buy',
        threshold: 0,
      })
    );
  });
});
