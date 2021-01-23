import fastify from 'fastify';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Api_GetProject } from '../../meta/api';
import { Config } from '../../meta/config';
import { JsonFile } from '../../meta/formats';
import { loadJson } from './load-json';
import { saveJson } from './save-json';

const config: Config = JSON.parse(readFileSync(resolve('ngxe.json'), {encoding: 'UTF8'}));
console.log('Config', config);

const app = fastify({
  logger: true,
  bodyLimit: 10 * 1000000, // X * MB
});

app.register(async app => {
  app.get('/api/project', async (): Promise<Api_GetProject> => {
    const input = loadJson(config.input);
    if (!input) {
      throw Error('Input file not loaded!');
    }
    return {
      config,
      input,
      output: {
        source: loadJson(config.output.source) ?? {locale: input.locale, translations: {}},
        translations: config.output.translations.map(t => loadJson(t.path) ?? {locale: t.locale, translations: {}}),
      },
    };
  });

  app.post<{Body: Api_GetProject}>(
    '/api/project',
    async (req) => {
      console.log('POST PROJ', req.body);
      saveJson(config.output.source, req.body.input);
      for (const translation of config.output.translations) {
        const data = req.body.output.translations.find(t => t.locale === translation.locale);
        if (!data) {
          throw Error(`Translation file (${translation.locale}) not found in payload`);
        }
        saveJson(translation.path, data);
      }
      return true;
    });
});

app.listen('7600', '0.0.0.0', (err, address) => {
  if (err) {
    throw err;
  }
  app.log.info(`ngxe backend listening on ${address}`);
});
