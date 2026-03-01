import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from '../models/subject.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/subject`;

  getAll() {
    return this.http.get<Subject[]>(this.base);
  }

  getById(id: number) {
    return this.http.get<Subject>(`${this.base}/${id}`);
  }

  getByClass(classId: number) {
    return this.http.get<Subject>(`${this.base}/class/${classId}`);
  }

  create(subject: Omit<Subject, 'id'>) {
    return this.http.post<Subject>(this.base, subject);
  }

  update(id: number, subject: Omit<Subject, 'id'>) {
    return this.http.put(`${this.base}/${id}`, { ...subject, id });
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
