import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionAddPaymentInstallmentModalComponent } from './collection-add-payment-installment-modal.component';

describe('CollectionAddPaymentInstallmentModalComponent', () => {
  let component: CollectionAddPaymentInstallmentModalComponent;
  let fixture: ComponentFixture<CollectionAddPaymentInstallmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionAddPaymentInstallmentModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionAddPaymentInstallmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
