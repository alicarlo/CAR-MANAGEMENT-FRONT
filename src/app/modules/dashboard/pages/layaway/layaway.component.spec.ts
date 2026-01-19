import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayawayComponent } from './layaway.component';

describe('LayawayComponent', () => {
  let component: LayawayComponent;
  let fixture: ComponentFixture<LayawayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayawayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayawayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
