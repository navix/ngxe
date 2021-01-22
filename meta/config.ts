export interface Config {
  name: string;
  source: ConfigLocale;
  translations: ConfigLocale[];
}

export interface ConfigLocale {
  locale: string;
  path: string;
}
