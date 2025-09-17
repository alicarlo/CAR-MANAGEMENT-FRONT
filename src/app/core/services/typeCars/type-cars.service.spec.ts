import { TestBed } from '@angular/core/testing';

import { TypeCarsService } from './type-cars.service';

describe('TypeCarsService', () => {
  let service: TypeCarsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeCarsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
