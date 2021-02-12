import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { JsonFile } from '../meta/formats';

export function saveJson({path, file, eofLine}: {
  path: string;
  file: JsonFile;
  eofLine?: boolean;
}) {
  const rPath = resolve(path);
  writeFileSync(rPath, JSON.stringify(file, null, 2) + (eofLine ? '\n' : ''));
}
