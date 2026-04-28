import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsListReportComponent } from './documents-list-report.component';

describe('DocumentsListReportComponent', () => {
  let component: DocumentsListReportComponent;
  let fixture: ComponentFixture<DocumentsListReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentsListReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentsListReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
