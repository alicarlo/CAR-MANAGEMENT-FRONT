import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrivalReviewModalComponent } from './arrival-review-modal.component';

describe('ArrivalReviewModalComponent', () => {
  let component: ArrivalReviewModalComponent;
  let fixture: ComponentFixture<ArrivalReviewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrivalReviewModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrivalReviewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
