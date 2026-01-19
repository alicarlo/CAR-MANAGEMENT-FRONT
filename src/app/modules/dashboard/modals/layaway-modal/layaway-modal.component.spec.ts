import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayawayModalComponent } from './layaway-modal.component';

describe('LayawayModalComponent', () => {
  let component: LayawayModalComponent;
  let fixture: ComponentFixture<LayawayModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayawayModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayawayModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
