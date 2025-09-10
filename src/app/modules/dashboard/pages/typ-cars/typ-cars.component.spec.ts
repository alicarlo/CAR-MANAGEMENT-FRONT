import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypCarsComponent } from './typ-cars.component';

describe('TypCarsComponent', () => {
  let component: TypCarsComponent;
  let fixture: ComponentFixture<TypCarsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypCarsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypCarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
