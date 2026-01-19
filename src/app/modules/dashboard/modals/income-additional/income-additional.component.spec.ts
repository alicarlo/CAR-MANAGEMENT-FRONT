import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeAdditionalComponent } from './income-additional.component';

describe('IncomeAdditionalComponent', () => {
  let component: IncomeAdditionalComponent;
  let fixture: ComponentFixture<IncomeAdditionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeAdditionalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeAdditionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
