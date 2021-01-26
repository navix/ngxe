import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { JsonFile } from '../meta/formats';

export function saveJson(path: string, file: JsonFile) {
  const rPath = resolve(path);
  writeFileSync(rPath, JSON.stringify(file, null, 2));
}
