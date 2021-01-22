import fastify from 'fastify';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import xliff from 'xliff';
import { Api_GetProject } from '../../meta/api';
import { Config } from '../../meta/config';
import { XliffFile } from '../../meta/xliff';

const config: Config = JSON.parse(readFileSync(resolve('ngxe.json'), {encoding: 'UTF8'}));
console.log('Config', config);

const app = fastify({
  logger: true,
  bodyLimit: 10 * 1000000, // X * MB
});

app.register(async app => {
  app.get('/api/project', async (): Promise<Api_GetProject> => {
    return {
      config,
    };
  });

  app.get('/api/source', async (): Promise<XliffFile> => {
    const raw = readFileSync(resolve(config.source.path), {encoding: 'UTF8'});
    return await xliff.xliff2js(raw);
  });

  app.get<{Params: {locale: string}}>(
    '/api/translation/:locale',
    async (req): Promise<XliffFile | false> => {
      const translation = config.translations.find(t => t.locale === req.params.locale);
      if (!translation) {
        throw Error(`Translation for ${req.params.locale} is not defined in ngxe.json`);
      }
      const path = resolve(translation.path);
      if (existsSync(path)) {
        const raw = readFileSync(path, {encoding: 'UTF8'});
        return await xliff.xliff2js(raw);
      } else {
        return false;
      }
    });

  app.post<{Params: {locale: string}, Body: XliffFile}>(
    '/api/translation/:locale',
    async (req) => {
      const translation = config.translations.find(t => t.locale === req.params.locale);
      if (!translation) {
        throw Error(`Translation for ${req.params.locale} is not defined in ngxe.json`);
      }
      const xml = await xliff.js2xliff(req.body);
      writeFileSync(resolve(translation.path), xml);
      return true;
    });
});

app.listen('7600', '0.0.0.0', (err, address) => {
  if (err) {
    throw err;
  }
  app.log.info(`ngxe backend listening on ${address}`);
});
