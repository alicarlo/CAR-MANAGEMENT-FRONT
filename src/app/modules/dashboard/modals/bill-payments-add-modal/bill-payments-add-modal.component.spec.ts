import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillPaymentsAddModalComponent } from './bill-payments-add-modal.component';

describe('BillPaymentsAddModalComponent', () => {
  let component: BillPaymentsAddModalComponent;
  let fixture: ComponentFixture<BillPaymentsAddModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillPaymentsAddModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillPaymentsAddModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
