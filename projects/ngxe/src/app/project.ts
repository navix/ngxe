import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { Api_Error, Api_GetProject } from '../../../meta/api';
import { JsonFile, JsonFileTranslations } from '../../../meta/formats';
import { TableRow, TableRowType, TableStats } from './meta';

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
      .get<Api_GetProject | Api_Error>('/api/project')
      .pipe(
        tap(res => {
          if (!res.success) {
            alert(res.message);
            return;
          }
          this.data = {
            success: true,
            config: res.config,
            input: {
              locale: res.input.locale,
              translations: this.processTranslationsObject(res.input.translations),
            },
            output: {
              source: {
                locale: res.output.source.locale,
                translations: this.processTranslationsObject(res.output.source.translations),
              },
              translations: res.output.translations.map(t => ({
                locale: t.locale,
                translations: this.processTranslationsObject(t.translations),
              })),
            },
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
        translations: this.processTranslationsObject(project.input.translations),
      },
      output: {
        translations: project.output.translations.map(t => ({
          locale: t.locale,
          // transfer messages only presented in the current source
          translations: this.processTranslationsObject(
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
    const inputKeys = Object.keys(inputSource.translations);
    const outputKeys = Object.keys(outputSource.translations);
    const updates: TableRow[] = inputKeys
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
        // Set for removing duplicated
        suggestions: [...new Set([
          // Messages that HAD the same source
          ...outputKeys
            .filter(sid => sid !== id && outputSource.translations[sid] === inputSource.translations[id])
            .map(sid => translation.translations[sid]),
          // Messages with same source
          ...inputKeys
            .filter(sid => sid !== id && inputSource.translations[sid] === inputSource.translations[id])
            .map(sid => translation.translations[sid]),
        ].filter(m => !!m && m !== translation.translations[id]))],
      }));
    const deletes: TableRow[] = Object.keys(outputSource.translations)
      .filter(id => !inputSource.translations[id])
      .map(id => ({
        id,
        type: 'deleted',
        prev: outputSource.translations[id],
        current: '',
        target: translation.translations[id],
        suggestions: [],
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

  private processTranslationsObject(translations: JsonFileTranslations) {
    return Object
      .keys(translations)
      .sort()
      .reduce<{[key: string]: string}>(
        (obj, key) => {
          obj[key] = translations[key]?.trim();
          return obj;
        }, {});
  }
}
