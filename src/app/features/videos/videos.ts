import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { VideosService } from '../../core/services/videos';
import { Video } from './video.model';

type VideosState = {
  videos: Video[];
  loading: boolean;
  error: string | null;
};
@Component({
  selector: 'app-videos',
  imports: [],
  templateUrl: './videos.html',
  styleUrl: './videos.scss',
})
export class Videos {
  private videosService = inject(VideosService);
  private refresh$ = new Subject<void>();

  private initialState: VideosState = {
    videos: [],
    loading: true,
    error: null,
  };

  private state$: Observable<VideosState> = this.refresh$.pipe(
    startWith(undefined),

    switchMap(() =>
      this.videosService.getVideos().pipe(
        map(
          (videos): VideosState => ({
            videos,
            loading: false,
            error: null,
          }),
        ),

        startWith({
          videos: [],
          loading: true,
          error: null,
        } as VideosState),

        catchError(() =>
          of<VideosState>({
            videos: [],
            loading: false,
            error: 'Failed to load videos',
          } satisfies VideosState),
        ),
      ),
    ),
  );

  state = toSignal(this.state$, {
    initialValue: this.initialState,
  });
}
