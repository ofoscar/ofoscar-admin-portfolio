import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CreateVideo } from './create-video';

describe('CreateVideo', () => {
  let component: CreateVideo;
  let fixture: ComponentFixture<CreateVideo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateVideo],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateVideo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
