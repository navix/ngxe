export interface Config {
  name: string;
  input: string;
  output: {
    source: string;
    translations: {
      locale: string;
      path: string;
    }[];
  };
}
