import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeExpenseModalComponent } from './type-expense-modal.component';

describe('TypeExpenseModalComponent', () => {
  let component: TypeExpenseModalComponent;
  let fixture: ComponentFixture<TypeExpenseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeExpenseModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeExpenseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
