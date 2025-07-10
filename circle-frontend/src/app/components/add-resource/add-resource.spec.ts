import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddResource } from './add-resource';

describe('AddResource', () => {
  let component: AddResource;
  let fixture: ComponentFixture<AddResource>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddResource]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddResource);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
