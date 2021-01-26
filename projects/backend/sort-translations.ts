import { JsonFileTranslations } from '../meta/formats';

export function sortTranslations(translations: JsonFileTranslations) {
  return Object
    .keys(translations)
    .sort()
    .reduce<{[key: string]: string}>(
      (obj, key) => {
        obj[key] = translations[key];
        return obj;
      }, {});
}
