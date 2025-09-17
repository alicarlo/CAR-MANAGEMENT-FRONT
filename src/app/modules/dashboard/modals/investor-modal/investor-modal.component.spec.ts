import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestorModalComponent } from './investor-modal.component';

describe('InvestorModalComponent', () => {
  let component: InvestorModalComponent;
  let fixture: ComponentFixture<InvestorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
