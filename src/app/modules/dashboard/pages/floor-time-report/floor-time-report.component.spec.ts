import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorTimeReportComponent } from './floor-time-report.component';

describe('FloorTimeReportComponent', () => {
  let component: FloorTimeReportComponent;
  let fixture: ComponentFixture<FloorTimeReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorTimeReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorTimeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
