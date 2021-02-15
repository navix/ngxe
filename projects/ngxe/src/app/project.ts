import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Api_GetProject } from '../../../meta/api';
import { JsonFile } from '../../../meta/formats';
import { TableRow, TableRowType, TableStats } from './meta';
import { sortTranslations } from './sort-translations';

const typesWeight: { [key in TableRowType]: number } = {
  new: 3,
  changed: 2,
  deleted: 1,
  same: 0,
};

@Injectable({
  providedIn: 'root',
})
export class Project {
  data?: Api_GetProject;

  currentTranslation?: JsonFile;

  table?: TableRow[];

  stats: TableStats = {};

  constructor(
    private http: HttpClient,
  ) {
  }

  load() {
    return this.http
      .get<Api_GetProject>('/api/project')
      .pipe(
        tap(res => {
          this.data = {
            config: res.config,
            input: {
              locale: res.input.locale,
              translations: sortTranslations(res.input.translations),
            },
            output: res.output,
          };
          if (!this.data.output.translations.length) {
            alert('Config have no translations!');
          }
          this.setCurrent(this.data.output.translations[0].locale);
        }),
      );
  }

  setCurrent(locale: string) {
    if (!this.data) {
      return;
    }
    const translation = this.data.output.translations.find(t => t.locale === locale);
    if (!translation) {
      throw Error(`Trying to set locale ${locale} is not defined in the project`);
    }
    this.compileTable({
      inputSource: this.data.input,
      outputSource: this.data.output.source,
      translation,
    });
  }

  save() {
    const project = this.data;
    if (!project) {
      throw Error('Project is not loaded!');
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
    return this.http.post('/api/project', body);
  }

  private compileTable({inputSource, outputSource, translation}: {
    inputSource: JsonFile;
    outputSource: JsonFile;
    translation: JsonFile;
  }) {
    const updates: TableRow[] = Object.keys(inputSource.translations)
      .map<TableRow>(id => ({
        id,
        type: outputSource.translations[id]?.trim() === inputSource.translations[id]?.trim()
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
        return typesWeight[y.type] - typesWeight[x.type];
      });
    this.currentTranslation = translation;
    this.stats = {
      total: this.table.length,
      new: this.table.filter(r => r.type === 'new').length,
      changed: this.table.filter(r => r.type === 'changed').length,
      deleted: this.table.filter(r => r.type === 'deleted').length,
      emptyTarget: this.table.filter(r => r.type !== 'deleted').filter(r => !r.target).length,
    };
  }
}
