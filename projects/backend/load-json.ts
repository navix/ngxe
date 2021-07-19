import Ajv from 'ajv';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { configSchema } from '../meta/config';
import { JsonFile, jsonFileSchema } from '../meta/formats';
import betterAjvErrors = require('better-ajv-errors');

export function loadJson({path, shouldExist = true, forceLocale}: {
  path: string;
  shouldExist?: boolean;
  forceLocale?: string;
}): JsonFile | undefined {
  const rPath = resolve(path);
  if (!existsSync(rPath)) {
    if (shouldExist) {
      throw new Error(`File ${rPath} not found`);
    } else {
      return;
    }
  }

  try {
    const raw = readFileSync(rPath, {encoding: 'utf8'});
    const json: JsonFile = JSON.parse(raw);

    const ajv = new Ajv();
    const validate = ajv.compile(jsonFileSchema);
    if (!validate(json)) {
      const errors = betterAjvErrors(configSchema, json, validate.errors, {format: 'js'});
      throw new Error(`Schema errors: ${errors ? errors.map(e => e.error) : 'NO_DATA'}`);
    }

    return {
      locale: forceLocale ?? json.locale,
      translations: json.translations,
    };
  } catch (e) {
    throw new Error(`Can't load and parse file ${rPath}: ${e.message}`);
  }
}
