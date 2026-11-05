import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { VideoCategory, VideoType } from '../video.model';
import { EditVideo } from './edit-video';

describe('EditVideo', () => {
  let fixture: ComponentFixture<EditVideo>;
  let component: EditVideo;
  let httpTesting: HttpTestingController;
  let router: Router;

  const video = {
    id: 7,
    title: 'Original video',
    slug: 'original-video',
    type: VideoType.SHORT_FORM,
    date_uploaded: '2026-10-30T18:14:21.421Z',
    category: VideoCategory.SOFTWARE_DEVELOPMENT,
    link: 'https://example.com/video',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditVideo],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(EditVideo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => httpTesting.verify());

  function loadVideo(): void {
    httpTesting.expectOne(`${environment.apiUrl}/videos/7`).flush(video);
    fixture.detectChanges();
  }

  it('loads the selected video into the edit form', () => {
    loadVideo();

    expect(component.form.getRawValue()).toEqual({
      title: video.title,
      slug: video.slug,
      type: video.type,
      date_uploaded: jasmine.any(String),
      category: video.category,
      link: video.link,
      thumbnail_url: '',
    });
    expect(component.loading()).toBeFalse();
  });

  it('saves changes and returns to the videos list', () => {
    loadVideo();
    component.form.controls.title.setValue('Updated video');

    const navigate = spyOn(router, 'navigate').and.resolveTo(true);
    component.saveVideo();

    const request = httpTesting.expectOne(`${environment.apiUrl}/videos/7`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body.title).toBe('Updated video');
    expect(request.request.body.slug).toBe(video.slug);
    request.flush({ ...video, title: 'Updated video' });

    expect(navigate).toHaveBeenCalledWith(['/admin/videos']);
    expect(component.saving()).toBeFalse();
  });

  it('shows a not found error when the video does not exist', () => {
    httpTesting.expectOne(`${environment.apiUrl}/videos/7`).flush(
      { detail: 'Video not found' },
      { status: 404, statusText: 'Not Found' },
    );

    expect(component.error()).toBe('Video not found.');
    expect(component.loading()).toBeFalse();
  });
});
