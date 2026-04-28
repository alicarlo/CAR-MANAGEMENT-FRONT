import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceListReportComponent } from './price-list-report.component';

describe('PriceListReportComponent', () => {
  let component: PriceListReportComponent;
  let fixture: ComponentFixture<PriceListReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceListReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceListReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
