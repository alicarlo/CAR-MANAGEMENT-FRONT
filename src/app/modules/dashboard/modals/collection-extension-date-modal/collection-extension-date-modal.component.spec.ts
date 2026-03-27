import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionExtensionDateModalComponent } from './collection-extension-date-modal.component';

describe('CollectionExtensionDateModalComponent', () => {
  let component: CollectionExtensionDateModalComponent;
  let fixture: ComponentFixture<CollectionExtensionDateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionExtensionDateModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectionExtensionDateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
