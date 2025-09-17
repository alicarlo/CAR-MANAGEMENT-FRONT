import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseClasificationModalComponent } from './expense-clasification-modal.component';

describe('ExpenseClasificationModalComponent', () => {
  let component: ExpenseClasificationModalComponent;
  let fixture: ComponentFixture<ExpenseClasificationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseClasificationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseClasificationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
