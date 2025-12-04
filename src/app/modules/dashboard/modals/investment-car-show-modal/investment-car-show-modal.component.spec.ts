import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentCarShowModalComponent } from './investment-car-show-modal.component';

describe('InvestmentCarShowModalComponent', () => {
  let component: InvestmentCarShowModalComponent;
  let fixture: ComponentFixture<InvestmentCarShowModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestmentCarShowModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestmentCarShowModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
