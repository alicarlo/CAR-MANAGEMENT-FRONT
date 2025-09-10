import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseClassificationComponent } from './expense-classification.component';

describe('ExpenseClassificationComponent', () => {
  let component: ExpenseClassificationComponent;
  let fixture: ComponentFixture<ExpenseClassificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseClassificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseClassificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
