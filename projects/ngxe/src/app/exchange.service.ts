import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api_Error, Api_GetProject } from '../../../meta/api';
import {formatExchangeFile} from '../../../meta/format-exchange-file';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExchangeService {
  constructor(
    private http: HttpClient,
  ) {
  }

  loadProject({project, branch}: {project: string; branch: string}): Observable<Api_GetProject | Api_Error> {
    return this.http.post<Api_GetProject | Api_Error>(`${environment.exchangeUrl}/api/project/load/${formatExchangeFile(project)}/${formatExchangeFile(branch)}`, {});
  }

  saveProject({project, branch, body}: {project: string; branch: string, body: any}): Observable<true | Api_Error> {
    return this.http.post<true | Api_Error>(`${environment.exchangeUrl}/api/project/save/${formatExchangeFile(project)}/${formatExchangeFile(branch)}`, body);
  }
}
