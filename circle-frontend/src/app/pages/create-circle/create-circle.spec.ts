import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCircle } from './create-circle';

describe('CreateCircle', () => {
  let component: CreateCircle;
  let fixture: ComponentFixture<CreateCircle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCircle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCircle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
