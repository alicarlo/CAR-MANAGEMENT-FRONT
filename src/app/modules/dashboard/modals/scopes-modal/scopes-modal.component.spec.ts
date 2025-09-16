import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScopesModalComponent } from './scopes-modal.component';

describe('ScopesModalComponent', () => {
  let component: ScopesModalComponent;
  let fixture: ComponentFixture<ScopesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScopesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScopesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
