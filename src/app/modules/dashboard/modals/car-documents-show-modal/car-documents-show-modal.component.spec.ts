import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarDocumentsShowModalComponent } from './car-documents-show-modal.component';

describe('CarDocumentsShowModalComponent', () => {
  let component: CarDocumentsShowModalComponent;
  let fixture: ComponentFixture<CarDocumentsShowModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarDocumentsShowModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarDocumentsShowModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
