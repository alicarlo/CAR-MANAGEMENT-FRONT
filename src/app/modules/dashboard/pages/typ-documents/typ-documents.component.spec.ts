import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypDocumentsComponent } from './typ-documents.component';

describe('TypDocumentsComponent', () => {
  let component: TypDocumentsComponent;
  let fixture: ComponentFixture<TypDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypDocumentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
