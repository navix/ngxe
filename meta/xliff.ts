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
