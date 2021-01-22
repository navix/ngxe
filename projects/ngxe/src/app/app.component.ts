import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { finalize, switchMap } from 'rxjs/operators';
import { Api_GetProject, Api_GetSource, Api_GetTranslation } from '../../../../meta/api';
import { XliffFile } from '../../../../meta/xliff';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  loading = false;

  project?: Api_GetProject;

  source?: XliffFile;

  translation?: XliffFile;

  constructor(
    private http: HttpClient,
  ) {
  }

  ngOnInit() {
    this.loading = true;
    this.http
      .get<Api_GetProject>('/api/project')
      .pipe(
        switchMap(res => {
          this.project = res;
          return this.http.get<Api_GetSource>('/api/source');
        }),
        finalize(() => this.loading = false),
      )
      .subscribe(res => {
        this.source = res;
      });
  }

  saveTranslation() {
    console.log('TRNSL', this.translation);
    this.http
      .post(`/api/translation/${this.translation?.targetLanguage}`, this.translation)
      .subscribe(res => {
        if (res) {
          alert(`${this.translation?.targetLanguage} saved.`);
        } else {
          alert('Save failed!');
        }
      });
  }

  loadTranslation(locale: string) {
    this.http
      .get<Api_GetTranslation>(`/api/translation/${locale}`)
      .subscribe(res => {
        console.log('RES', res);
        if (res) {
          this.translation = res;
        } else {
          this.translation = JSON.parse(JSON.stringify(this.source));
          if (!this.translation) {
            throw Error('Source deep copy failed');
          }
          this.translation.targetLanguage = locale;
          console.log('TRNSL', this.translation);
        }
      });
  }
}
