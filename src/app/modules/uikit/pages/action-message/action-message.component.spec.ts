import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionMessageComponent } from './action-message.component';

describe('ActionMessageComponent', () => {
  let component: ActionMessageComponent;
  let fixture: ComponentFixture<ActionMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionMessageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
