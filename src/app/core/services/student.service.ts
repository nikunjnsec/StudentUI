import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Student } from '../models/student.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/student`;

  getAll() {
    return this.http.get<Student[]>(this.base);
  }

  getById(id: number) {
    return this.http.get<Student>(`${this.base}/${id}`);
  }

  create(student: Omit<Student, 'id'>) {
    return this.http.post<Student>(this.base, student);
  }

  update(id: number, student: Omit<Student, 'id'>) {
    return this.http.put(`${this.base}/${id}`, { ...student, id });
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
