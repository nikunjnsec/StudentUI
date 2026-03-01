import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Student } from '../models/student.model';
import { Class } from '../models/class.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/studentclassxref`;

  getStudentsByClass(classId: number) {
    return this.http.get<Student[]>(`${this.base}/class/${classId}`);
  }

  getClassesByStudent(studentId: number) {
    return this.http.get<Class[]>(`${this.base}/student/${studentId}`);
  }

  enroll(studentId: number, classId: number) {
    return this.http.post(`${this.base}`, { studentId, classId });
  }

  unenroll(studentId: number, classId: number) {
    return this.http.delete(`${this.base}/${studentId}/${classId}`);
  }
}
