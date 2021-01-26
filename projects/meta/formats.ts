export interface XliffFile {
  sourceLanguage: string;
  targetLanguage?: string;
  resources: {
    ngi18n: {
      [key: string]: {
        source: string;
        note: string;
        target: string;
      };
    };
  };
}

export interface JsonFile {
  locale: string;
  translations: JsonFileTranslations;
}

export interface JsonFileTranslations {
  [key: string]: string;
}
