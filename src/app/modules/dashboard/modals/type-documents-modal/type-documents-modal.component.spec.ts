import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeDocumentsModalComponent } from './type-documents-modal.component';

describe('TypeDocumentsModalComponent', () => {
  let component: TypeDocumentsModalComponent;
  let fixture: ComponentFixture<TypeDocumentsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeDocumentsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeDocumentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
