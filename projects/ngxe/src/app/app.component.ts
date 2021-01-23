import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Api_GetProject } from '../../../../meta/api';
import { JsonFile } from '../../../../meta/formats';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  loading = false;

  project?: Api_GetProject;

  currentTranslation?: JsonFile;

  constructor(
    private http: HttpClient,
  ) {
  }

  ngOnInit() {
    this.loading = true;
    this.http
      .get<Api_GetProject>('/api/project')
      .pipe(
        finalize(() => this.loading = false),
      )
      .subscribe(res => {
        this.project = res;
      });
  }

  save() {
    this.http
      .post(`/api/project`, this.project)
      .subscribe(res => {
        if (res) {
          alert(`Project saved.`);
        } else {
          alert('Save failed!');
        }
      });
  }

//
//  loadTranslation(locale: string) {
//    this.http
//      .get<Api_GetTranslation>(`/api/translation/${locale}`)
//      .subscribe(res => {
//        console.log('RES', res);
//        if (res) {
//          this.translation = res;
//        } else {
//          this.translation = JSON.parse(JSON.stringify(this.source));
//          if (!this.translation) {
//            throw Error('Source deep copy failed');
//          }
//          this.translation.targetLanguage = locale;
//          console.log('TRNSL', this.translation);
//        }
//      });
//  }

}
