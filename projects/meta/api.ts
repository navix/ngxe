import { Config } from './config';
import { JsonFile } from './formats';

export interface Api_GetProject {
  config: Config;
  input: JsonFile;
  output: {
    source: JsonFile;
    translations: JsonFile[];
  };
}
