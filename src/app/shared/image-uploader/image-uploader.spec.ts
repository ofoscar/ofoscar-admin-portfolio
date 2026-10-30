import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageUploader } from './image-uploader';

describe('ImageUploader', () => {
  let component: ImageUploader;
  let fixture: ComponentFixture<ImageUploader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideRouter([])],
      imports: [ImageUploader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageUploader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
