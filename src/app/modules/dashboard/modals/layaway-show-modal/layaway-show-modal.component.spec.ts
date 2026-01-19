import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayawayShowModalComponent } from './layaway-show-modal.component';

describe('LayawayShowModalComponent', () => {
  let component: LayawayShowModalComponent;
  let fixture: ComponentFixture<LayawayShowModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayawayShowModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayawayShowModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
