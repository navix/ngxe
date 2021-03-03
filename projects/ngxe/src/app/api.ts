import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { map } from 'rxjs/operators';
import { Api_Error, Api_GetProject } from '../../../meta/api';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Api {
  constructor(
    private http: HttpClient,
  ) {
  }

  getProject(): Observable<Api_GetProject | Api_Error> {
    if (environment.demo) {
      return fromPromise(import('../demo.json'))
        .pipe(
          map(raw => raw as any),
        );
    } else {
      return this.http.get<Api_GetProject | Api_Error>('/api/project');
    }
  }

  postProject(body: any): Observable<boolean> {
    if (environment.demo) {
      alert('It is a demo instance, so nothing really changed.');
      return of(true);
    } else {
      return this.http.post<boolean>('/api/project', body);
    }
  }
}
