import { TestBed } from '@angular/core/testing';

import { TypeDocumentsService } from './type-documents.service';

describe('TypeDocumentsService', () => {
  let service: TypeDocumentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypeDocumentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
