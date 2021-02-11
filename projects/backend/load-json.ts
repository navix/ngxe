import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { JsonFile } from '../meta/formats';

export function loadJson(path: string): JsonFile | undefined {
  const rPath = resolve(path);
  if (existsSync(rPath)) {
    const raw = readFileSync(rPath, {encoding: 'UTF8'});
    const json: JsonFile = JSON.parse(raw);
    return {
      locale: json.locale,
      translations: json.translations,
    };
  }
}
