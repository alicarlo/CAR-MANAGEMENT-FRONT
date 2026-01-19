import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketPrintModalComponent } from './ticket-print-modal.component';

describe('TicketPrintModalComponent', () => {
  let component: TicketPrintModalComponent;
  let fixture: ComponentFixture<TicketPrintModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketPrintModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketPrintModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
