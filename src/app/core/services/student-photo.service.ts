import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StudentPhotoService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/studentphoto`;

  /** Direct URL usable in <img src> — GET is AllowAnonymous on the API */
  getPhotoUrl(studentId: number): string {
    return `${this.base}/${studentId}?t=${Date.now()}`;
  }

  upload(studentId: number, file: File) {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post(`${this.base}/${studentId}`, fd);
  }

  delete(studentId: number) {
    return this.http.delete(`${this.base}/${studentId}`);
  }
}
