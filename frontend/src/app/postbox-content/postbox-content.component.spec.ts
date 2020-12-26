import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostboxContentComponent } from './postbox-content.component';

describe('PostboxContentComponent', () => {
  let component: PostboxContentComponent;
  let fixture: ComponentFixture<PostboxContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostboxContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostboxContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
