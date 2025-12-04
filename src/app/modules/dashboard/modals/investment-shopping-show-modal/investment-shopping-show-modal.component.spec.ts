import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentShoppingShowModalComponent } from './investment-shopping-show-modal.component';

describe('InvestmentShoppingShowModalComponent', () => {
  let component: InvestmentShoppingShowModalComponent;
  let fixture: ComponentFixture<InvestmentShoppingShowModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentShoppingShowModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestmentShoppingShowModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
