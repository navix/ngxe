import fastify from 'fastify';
import { readFileSync } from 'fs';
import * as open from 'open';
import { resolve } from 'path';
import { Api_GetProject } from '../meta/api';
import { Config } from '../meta/config';
import { loadJson } from './load-json';
import { saveJson } from './save-json';

// @todo check ngxe.json exist and show proper error
const config: Config = JSON.parse(readFileSync(resolve('ngxe.json'), {encoding: 'UTF8'}));

const app = fastify({
  logger: !!config.debug,
  bodyLimit: 10 * 1000000, // X * MB
});

app.register(async app => {
  app.get('/api/project', async (): Promise<Api_GetProject> => {
    // @todo properly check each file
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
      saveJson(config.output.source, req.body.input);
      for (const translation of config.output.translations) {
        const data = req.body.output.translations.find(t => t.locale === translation.locale);
        if (!data) {
          throw Error(`Translation file (${translation.locale}) not found in payload`);
        }
        saveJson(translation.path, {
          locale: data.locale,
          translations: data.translations,
        });
      }
      return true;
    });
});

app.register(require('fastify-disablecache'));

app.register(require('fastify-static'), {
  root: resolve(__dirname, '../../ngxe'),
  prefix: '/ngxe/',
});

const port = 7600;
const url = `http://localhost:${port}/ngxe/index.html`;
app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    throw err;
  }
  app.log.info(`ngxe working on ${url}`);

  if (!config.notOpen) {
    open(url).then(() => {
    });
  }
});
