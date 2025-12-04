import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarBillsShowModalComponent } from './car-bills-show-modal.component';

describe('CarBillsShowModalComponent', () => {
  let component: CarBillsShowModalComponent;
  let fixture: ComponentFixture<CarBillsShowModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarBillsShowModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarBillsShowModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
