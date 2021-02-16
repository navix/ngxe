import { Config } from './config';
import { JsonFile } from './formats';

export interface Api_Error {
  success: false;
  message: string;
}

export interface Api_GetProject {
  success: true;
  config: Config;
  input: JsonFile;
  output: {
    source: JsonFile;
    translations: JsonFile[];
  };
}
