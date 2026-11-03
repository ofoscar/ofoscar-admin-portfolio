import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { VideosService } from '../../../core/services/videos';
import { Video } from '../video.model';

@Component({
  selector: 'app-edit-video',
  imports: [RouterLink, DatePipe],
  templateUrl: './edit-video.html',
  styleUrl: './edit-video.scss',
})
export class EditVideo {
  private route = inject(ActivatedRoute);
  private videosService = inject(VideosService);

  videoId = Number(this.route.snapshot.paramMap.get('id'));
  video = signal<Video | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    if (!Number.isSafeInteger(this.videoId) || this.videoId <= 0) {
      this.error.set('Invalid video ID.');
      this.loading.set(false);
      return;
    }

    this.loadVideo();
  }

  loadVideo(): void {
    this.loading.set(true);
    this.error.set(null);

    this.videosService
      .getVideo(this.videoId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (video) => this.video.set(video),
        error: (err: HttpErrorResponse) => {
          this.error.set(err.status === 404 ? 'Video not found.' : 'Failed to load video.');
        },
      });
  }
}
