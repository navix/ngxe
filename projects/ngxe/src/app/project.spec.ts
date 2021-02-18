import { of } from 'rxjs';
import { Project } from './project';

describe('Project', () => {
  let service: Project;
  let http: HttpStub;

  beforeEach(() => {
    http = new HttpStub();
    service = new Project(http as any);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('load()', () => {
    it('should load data via http', () => {
      const spy = spyOn(http, 'get').and.callThrough();
      service.load().subscribe(() => {
      });
      expect(spy).toHaveBeenCalledWith('/api/project');
    });

    it('should store data', () => {
      service.load().subscribe(() => {
      });
      expect(service.data).toEqual(http.project as any);
    });

    it('should run setCurrent() with first locale', () => {
      const spy = spyOn(service, 'setCurrent');
      service.load().subscribe(() => {
      });
      expect(spy).toHaveBeenCalledWith(http.project.output.translations[0].locale);
    });
  });

  describe('setCurrent()', () => {
    it('should throw Error if not translation found', () => {
      expect(() => {
        service.load().subscribe(() => {
        });
        service.setCurrent('NO_TRANS');
      }).toThrow();
    });

    describe('compileCurrent()', () => {
      it('should compile table', () => {
        service.load().subscribe(() => {
        });
        expect(service.table).toEqual([
          {
            id: 'KEY_NEW',
            type: 'new',
            prev: undefined,
            current: 'New',
            target: undefined,
            suggestions: [],
          },
          {
            id: 'KEY_CHANGED',
            type: 'changed',
            prev: 'ChangedPrev',
            current: 'Changed',
            target: 'ChangedTr',
            suggestions: [],
          },
          {
            id: 'KEY_DELETED',
            type: 'deleted',
            prev: 'Deleted',
            current: '',
            target: undefined,
            suggestions: [],
          },
          {
            id: 'KEY_STALE',
            type: 'same',
            prev: 'Stale',
            current: 'Stale',
            target: 'StaleTr',
            suggestions: [],
          },
        ] as any);
      });

      it('should trim messages', () => {
        http.project.input.translations = {
          'KEY': '   Source',
        };
        http.project.output.source.translations = {
          'KEY': 'Source    ',
        };
        http.project.output.translations[0].translations = {
          'KEY': 'Target',
        };
        service.load().subscribe(() => {
        });
        expect(service.table).toEqual([
          {
            id: 'KEY',
            type: 'same',
            prev: 'Source',
            current: 'Source',
            target: 'Target',
            suggestions: [],
          },
        ] as any);
      });

      it('should suggest', () => {
        http.project.input.translations = {
          'KEY_1': 'Input Source 1',
          'KEY_2': 'Input Source 2',
        };
        http.project.output.source.translations = {
          'KEY_1': 'Input Source 2',
          'KEY_2': 'Input Source 1',
          'KEY_3': 'Input Source 2',
        };
        http.project.output.translations[0].translations = {
          'KEY_1': 'Target 1',
          'KEY_2': 'Target 2',
          'KEY_3': 'Target 3',
        };
        service.load().subscribe(() => {
        });
        expect(service.table).toEqual([
          {
            id: 'KEY_1',
            type: 'changed',
            prev: 'Input Source 2',
            current: 'Input Source 1',
            target: 'Target 1',
            suggestions: ['Target 2'],
          },
          {
            id: 'KEY_2',
            type: 'changed',
            prev: 'Input Source 1',
            current: 'Input Source 2',
            target: 'Target 2',
            suggestions: ['Target 1', 'Target 3'],
          },
          {
            id: 'KEY_3',
            type: 'deleted',
            prev: 'Input Source 2',
            current: '',
            target: 'Target 3',
            suggestions: [],
          },
        ] as any);
      });

      it('should compile stats', () => {
        service.load().subscribe(() => {
        });
        expect(service.stats).toEqual({
          total: 4,
          new: 1,
          changed: 1,
          deleted: 1,
          emptyTarget: 1,
        });
      });
    });
  });

  describe('save()', () => {
    it('should compile body and send via http', () => {
      const spy = spyOn(http, 'post').and.callThrough();
      service.load().subscribe(() => {
      });
      service.save().subscribe(() => {
      });
      expect(spy).toHaveBeenCalledWith(
        '/api/project',
        {
          input: {
            locale: 'INP_LOC',
            translations: {KEY_CHANGED: 'Changed', KEY_NEW: 'New', KEY_STALE: 'Stale'},
          },
          output: {
            translations: [{
              locale: 'TR_LOC_1',
              translations: {KEY_CHANGED: 'ChangedTr', KEY_NEW: undefined, KEY_STALE: 'StaleTr'},
            }],
          },
        },
      );
    });

    it('should sort messages by ID', () => {
      http.project.input.translations = {
        'KEY_3': 'Key3',
        'KEY_1': 'Key1',
        'A_KEY': 'AKey',
        'Z_KEY': 'ZKey',
        'KEY_2': 'Key2',
      };
      http.project.output.source.translations = {
        'KEY_3': 'Key3',
        'KEY_1': 'Key1',
        'A_KEY': 'AKey',
        'Z_KEY': 'ZKey',
        'KEY_2': 'Key2',
      };
      http.project.output.translations[0].translations = {
        'KEY_3': 'Key3',
        'KEY_1': 'Key1',
        'A_KEY': 'AKey',
        'Z_KEY': 'ZKey',
        'KEY_2': 'Key2',
      };
      const spy = spyOn(http, 'post').and.callThrough();
      service.load().subscribe(() => {
      });
      service.save().subscribe(() => {
      });
      expect(spy).toHaveBeenCalledWith(
        '/api/project',
        {
          input: {
            locale: 'INP_LOC',
            translations: {A_KEY: 'AKey', KEY_1: 'Key1', KEY_2: 'Key2', KEY_3: 'Key3', Z_KEY: 'ZKey'},
          },
          output: {
            translations: [{
              locale: 'TR_LOC_1',
              translations: {A_KEY: 'AKey', KEY_1: 'Key1', KEY_2: 'Key2', KEY_3: 'Key3', Z_KEY: 'ZKey'},
            }],
          },
        },
      );
    });

    it('should remove non existed messages in source from target', () => {
      http.project.input.translations = {
        'KEY': 'Source',
      };
      http.project.output.source.translations = {
        'KEY': 'Source',
      };
      http.project.output.translations[0].translations = {
        'KEY': 'Target',
        'UNEX_KEY': 'Unex',
      };
      const spy = spyOn(http, 'post').and.callThrough();
      service.load().subscribe(() => {
      });
      service.save().subscribe(() => {
      });
      expect(spy).toHaveBeenCalledWith(
        '/api/project',
        {
          input: {
            locale: 'INP_LOC',
            translations: {KEY: 'Source'},
          },
          output: {
            translations: [{
              locale: 'TR_LOC_1',
              translations: {KEY: 'Target'},
            }],
          },
        },
      );
    });
  });
});

class HttpStub {
  project: any = {
    success: true,
    config: 'CONFIG',
    input: {
      locale: 'INP_LOC',
      translations: {
        'KEY_NEW': 'New',
        'KEY_CHANGED': 'Changed',
        'KEY_STALE': 'Stale',
      },
    },
    output: {
      source: {
        locale: 'SOU_LOC',
        translations: {
          'KEY_CHANGED': 'ChangedPrev',
          'KEY_STALE': 'Stale',
          'KEY_DELETED': 'Deleted',
        },
      },
      translations: [
        {
          locale: 'TR_LOC_1',
          translations: {
            'KEY_CHANGED': 'ChangedTr',
            'KEY_STALE': 'StaleTr',
          },
        },
      ],
    },
  };

  get(url: string) {
    return of(this.project);
  }

  post(url: string, body: any) {
    return of(true);
  }
}
