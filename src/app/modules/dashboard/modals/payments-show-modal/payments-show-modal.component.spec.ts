import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsShowModalComponent } from './payments-show-modal.component';

describe('PaymentsShowModalComponent', () => {
  let component: PaymentsShowModalComponent;
  let fixture: ComponentFixture<PaymentsShowModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsShowModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsShowModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
