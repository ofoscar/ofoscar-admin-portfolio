import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Video } from '../../features/videos/video.model';

@Injectable({
  providedIn: 'root',
})
export class VideosService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getVideos(): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/videos`);
  }
}
