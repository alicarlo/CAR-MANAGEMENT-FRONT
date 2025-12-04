import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypePaymentsComponent } from './type-payments.component';

describe('TypePaymentsComponent', () => {
  let component: TypePaymentsComponent;
  let fixture: ComponentFixture<TypePaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypePaymentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypePaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
