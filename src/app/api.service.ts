import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = '/api';
  constructor(private http: HttpClient) {}

  list<T>(resource: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.base}/${resource}`);
  }
  get<T>(resource: string, id: any): Observable<T> {
    return this.http.get<T>(`${this.base}/${resource}/${id}`);
  }
  create<T>(resource: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.base}/${resource}`, data);
  }
  update<T>(resource: string, id: any, data: any): Observable<T> {
    return this.http.put<T>(`${this.base}/${resource}/${id}`, data);
  }
  delete<T>(resource: string, id: any): Observable<T> {
    return this.http.delete<T>(`${this.base}/${resource}/${id}`);
  }
}
