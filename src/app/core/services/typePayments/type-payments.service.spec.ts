import { TestBed } from '@angular/core/testing';

import { TypePaymentsService } from './type-payments.service';

describe('TypePaymentsService', () => {
  let service: TypePaymentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypePaymentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
