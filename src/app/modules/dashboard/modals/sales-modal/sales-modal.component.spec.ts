import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesModalComponent } from './sales-modal.component';

describe('SalesModalComponent', () => {
  let component: SalesModalComponent;
  let fixture: ComponentFixture<SalesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
