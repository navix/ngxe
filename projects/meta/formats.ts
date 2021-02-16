import { JSONSchemaType } from 'ajv';

export interface JsonFile {
  locale: string;
  translations: JsonFileTranslations;
}

export interface JsonFileTranslations {
  [key: string]: string;
}

export const jsonFileSchema: JSONSchemaType<JsonFile> = {
  type: 'object',
  properties: {
    locale: {type: 'string'},
    translations: {
      type: 'object',
      additionalProperties: {type: 'string'},
      required: [],
    },
  },
  required: ['locale', 'translations'],
};
