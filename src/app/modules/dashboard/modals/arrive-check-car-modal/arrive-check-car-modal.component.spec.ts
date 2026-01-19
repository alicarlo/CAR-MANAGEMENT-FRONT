import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArriveCheckCarModalComponent } from './arrive-check-car-modal.component';

describe('ArriveCheckCarModalComponent', () => {
  let component: ArriveCheckCarModalComponent;
  let fixture: ComponentFixture<ArriveCheckCarModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArriveCheckCarModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArriveCheckCarModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
