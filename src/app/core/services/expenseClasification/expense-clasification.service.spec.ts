import { TestBed } from '@angular/core/testing';

import { ExpenseClasificationService } from './expense-clasification.service';

describe('ExpenseClasificationService', () => {
  let service: ExpenseClasificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseClasificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
