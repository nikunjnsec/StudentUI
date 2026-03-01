import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Class } from '../models/class.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClassService {
  private http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/class`;

  getAll() {
    return this.http.get<Class[]>(this.base);
  }

  getById(id: number) {
    return this.http.get<Class>(`${this.base}/${id}`);
  }

  create(cls: Omit<Class, 'id'>) {
    return this.http.post<Class>(this.base, cls);
  }

  update(id: number, cls: Omit<Class, 'id'>) {
    return this.http.put(`${this.base}/${id}`, { ...cls, id });
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
