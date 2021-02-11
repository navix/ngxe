import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { Api_GetProject } from '../../../meta/api';
import { JsonFile } from '../../../meta/formats';
import { TableRow, TableRowType, TableStats } from './meta';
import { sortTranslations } from './sort-translations';

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

  stats: TableStats = {};

  typesWeight: { [key in TableRowType]: number } = {
    new: 3,
    changed: 2,
    deleted: 1,
    same: 0,
  };

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
        this.project = {
          config: res.config,
          input: {
            locale: res.input.locale,
            translations: sortTranslations(res.input.translations),
          },
          output: res.output,
        };
        if (!this.project.output.translations.length) {
          alert('Config have no translations!');
        }
        this.setCurrent(this.project.output.translations[0].locale);
      }, err => {
        alert(`API error! The ngxe is still running?`);
        console.error(err);
      });
  }

  save() {
    const project = this.project;
    if (!project) {
      return;
    }
    const body = {
      input: {
        locale: project.input.locale,
        translations: sortTranslations(project.input.translations),
      },
      output: {
        translations: project.output.translations.map(t => ({
          locale: t.locale,
          // transfer messages only presented in the current source
          translations: sortTranslations(
            Object.keys(project.input.translations)
              .map(key => [key, t.translations[key]])
              .reduce((obj: any, prev) => {
                obj[prev[0]] = prev[1];
                return obj;
              }, {}),
          ),
        })),
      },
    };
    this.http
      .post(`/api/project`, body)
      .subscribe(res => {
        if (res) {
          alert(`Project saved.`);
        } else {
          alert('Save failed!');
        }
      }, err => {
        alert(`API error! The ngxe is still running?`);
        console.error(err);
      });
  }

  setCurrent(locale: string) {
    if (!this.project) {
      return;
    }
    const translation = this.project.output.translations.find(t => t.locale === locale);
    if (!translation) {
      throw Error(`Trying to set locale ${locale} is not defined in the project`);
    }
    this.compileTable({
      inputSource: this.project.input,
      outputSource: this.project.output.source,
      translation,
    });
  }

  private compileTable({inputSource, outputSource, translation}: {
    inputSource: JsonFile;
    outputSource: JsonFile;
    translation: JsonFile;
  }) {
    const updates: TableRow[] = Object.keys(inputSource.translations)
      .map<TableRow>(id => ({
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
    this.table = [...updates, ...deletes]
      .sort((x, y) => {
        return this.typesWeight[y.type] - this.typesWeight[x.type];
      });
    this.currentTranslation = translation;
    this.stats = {
      total: this.table.length,
      new: this.table.filter(r => r.type === 'new').length,
      changed: this.table.filter(r => r.type === 'changed').length,
      deleted: this.table.filter(r => r.type === 'deleted').length,
      emptyTarget: this.table.filter(r => !r.target).length,
    };
  }
}
