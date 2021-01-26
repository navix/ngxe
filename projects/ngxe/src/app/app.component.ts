import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Api_GetProject } from '../../../meta/api';
import { JsonFile } from '../../../meta/formats';

interface TableRow {
  id: string;
  type: 'same' | 'new' | 'changed' | 'deleted';
  prev: string;
  current: string;
  target: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  loading = false;

  project?: Api_GetProject;

  currentTranslation?: JsonFile;

  table?: TableRow[];

  idFilter = '';

  typeFilter = '';

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
        this.compileTable({
          inputSource: this.project.input,
          outputSource: this.project.output.source,
          translation: this.project.output.translations[0],
        });
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

  private compileTable({inputSource, outputSource, translation}: {
    inputSource: JsonFile;
    outputSource: JsonFile;
    translation: JsonFile;
  }) {
    const updates: TableRow[] = Object.keys(inputSource.translations).map(id => ({
      id,
      type: outputSource.translations[id] === inputSource.translations[id]
        ? 'same'
        : !!outputSource.translations[id] && !!inputSource.translations[id]
          ? 'changed'
          : 'new',
      prev: outputSource.translations[id],
      current: inputSource.translations[id],
      target: translation.translations[id],
    }));
    const deletes: TableRow[] = Object.keys(outputSource.translations)
      .filter(id => !inputSource.translations[id])
      .map(id => ({
        id,
        type: 'deleted',
        prev: outputSource.translations[id],
        current: '',
        target: translation.translations[id],
      }));
    // @todo sort by ID
    this.table = [...updates, ...deletes];
    this.currentTranslation = translation;
  }
}
