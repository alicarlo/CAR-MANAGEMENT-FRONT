import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsAddModalComponent } from './payments-add-modal.component';

describe('PaymentsAddModalComponent', () => {
  let component: PaymentsAddModalComponent;
  let fixture: ComponentFixture<PaymentsAddModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentsAddModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsAddModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
