import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ImageUploadResponse {
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  uploadImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();

    formData.append('file', file, file.name);

    return this.http.post<ImageUploadResponse>(`${this.apiUrl}/uploads/images`, formData);
  }
}
