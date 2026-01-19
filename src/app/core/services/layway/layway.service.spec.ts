import { TestBed } from '@angular/core/testing';

import { LaywayService } from './layway.service';

describe('LaywayService', () => {
  let service: LaywayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LaywayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
