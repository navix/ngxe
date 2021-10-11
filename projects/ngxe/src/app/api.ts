import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api_Error, Api_GetProject } from '../../../meta/api';

@Injectable({
  providedIn: 'root',
})
export class Api {
  constructor(
    private http: HttpClient,
  ) {
  }

  getProject(): Observable<Api_GetProject | Api_Error> {
    return this.http.get<Api_GetProject | Api_Error>('/api/project');
  }

  postProject(body: any): Observable<boolean> {
    return this.http.post<boolean>('/api/project', body);
  }
}
