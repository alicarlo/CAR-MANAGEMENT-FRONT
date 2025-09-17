import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarsModalComponent } from './cars-modal.component';

describe('CarsModalComponent', () => {
  let component: CarsModalComponent;
  let fixture: ComponentFixture<CarsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
