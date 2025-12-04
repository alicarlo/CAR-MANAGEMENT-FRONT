import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypePaymentsModalComponent } from './type-payments-modal.component';

describe('TypePaymentsModalComponent', () => {
  let component: TypePaymentsModalComponent;
  let fixture: ComponentFixture<TypePaymentsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypePaymentsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypePaymentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
