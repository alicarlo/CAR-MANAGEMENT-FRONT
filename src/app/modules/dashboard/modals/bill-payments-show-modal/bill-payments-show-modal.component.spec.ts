import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillPaymentsShowModalComponent } from './bill-payments-show-modal.component';

describe('BillPaymentsShowModalComponent', () => {
  let component: BillPaymentsShowModalComponent;
  let fixture: ComponentFixture<BillPaymentsShowModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillPaymentsShowModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillPaymentsShowModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
