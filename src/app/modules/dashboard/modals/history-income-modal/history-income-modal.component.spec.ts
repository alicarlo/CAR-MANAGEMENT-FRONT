import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryIncomeModalComponent } from './history-income-modal.component';

describe('HistoryIncomeModalComponent', () => {
  let component: HistoryIncomeModalComponent;
  let fixture: ComponentFixture<HistoryIncomeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryIncomeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryIncomeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
