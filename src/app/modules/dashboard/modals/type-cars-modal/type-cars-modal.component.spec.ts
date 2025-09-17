import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeCarsModalComponent } from './type-cars-modal.component';

describe('TypeCarsModalComponent', () => {
  let component: TypeCarsModalComponent;
  let fixture: ComponentFixture<TypeCarsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeCarsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeCarsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
