import { TestBed } from '@angular/core/testing';

import { ArrivalreviewService } from './arrivalreview.service';

describe('ArrivalreviewService', () => {
  let service: ArrivalreviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArrivalreviewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
