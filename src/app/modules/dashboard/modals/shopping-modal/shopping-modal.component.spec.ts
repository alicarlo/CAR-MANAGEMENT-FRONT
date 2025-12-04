import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingModalComponent } from './shopping-modal.component';

describe('ShoppingModalComponent', () => {
  let component: ShoppingModalComponent;
  let fixture: ComponentFixture<ShoppingModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoppingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
