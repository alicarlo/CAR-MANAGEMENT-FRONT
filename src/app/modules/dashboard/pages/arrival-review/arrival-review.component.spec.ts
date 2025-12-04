import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArrivalReviewComponent } from './arrival-review.component';

describe('ArrivalReviewComponent', () => {
  let component: ArrivalReviewComponent;
  let fixture: ComponentFixture<ArrivalReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArrivalReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArrivalReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
