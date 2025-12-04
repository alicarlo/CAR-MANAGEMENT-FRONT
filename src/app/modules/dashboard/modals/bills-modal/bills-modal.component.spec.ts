import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillsModalComponent } from './bills-modal.component';

describe('BillsModalComponent', () => {
  let component: BillsModalComponent;
  let fixture: ComponentFixture<BillsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
