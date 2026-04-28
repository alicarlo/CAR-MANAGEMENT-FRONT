import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalIncomeModalComponent } from './additional-income-modal.component';

describe('AdditionalIncomeModalComponent', () => {
  let component: AdditionalIncomeModalComponent;
  let fixture: ComponentFixture<AdditionalIncomeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalIncomeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdditionalIncomeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
