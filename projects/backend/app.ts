import Ajv from 'ajv';
import fastify from 'fastify';
import { existsSync, readFileSync } from 'fs';
import * as meow from 'meow';
import * as open from 'open';
import { resolve } from 'path';
import { Api_Error, Api_GetProject } from '../meta/api';
import { Config, configSchema } from '../meta/config';
import { loadJson } from './load-json';
import { saveJson } from './save-json';
import betterAjvErrors from 'better-ajv-errors';

const cli = meow(`
  📜 ngxe

  Usage
    $ npx ngxe

  Options
    --project, -p Path to project file, default: ngxe.json
`, {
  flags: {
    project: {
      type: 'string',
      alias: 'p',
    },
  },
});

const configFile = cli.flags.project ?? 'ngxe.json';
const configPath = resolve(configFile);
if (!existsSync(configPath)) {
  throw new Error(`Config file not found. Create ${configFile}.`);
}

let config: Config;
try {
  config = JSON.parse(readFileSync(configPath, {encoding: 'utf8'}));
} catch (e) {
  throw new Error(`Can't load and parse config file: ${e.message}.`);
}

const ajv = new Ajv({
  useDefaults: true,
});
const validate = ajv.compile(configSchema);
if (!validate(config) && validate.errors) {
  console.log(betterAjvErrors(configSchema, config, validate.errors));
  process.exit(1);
}

const app = fastify({
  logger: config.debug,
  bodyLimit: 10 * 1000000, // X * MB
});

app.register(async app => {
  app.get('/api/project', async (): Promise<Api_GetProject | Api_Error> => {
    try {
      const input = loadJson({path: config.input});
      if (!input) {
        throw new Error(`loadJson should throw Error before!`);
      }
      return {
        success: true,
        config,
        input,
        output: {
          source: loadJson({
            path: config.output.source,
            shouldExist: false,
            forceLocale: input.locale,
          }) ?? {locale: input.locale, translations: {}},
          translations: config.output.translations
            .map(t => loadJson({
              path: t.path,
              shouldExist: false,
              forceLocale: t.locale,
            }) ?? {
              locale: t.locale,
              translations: {},
            }),
        },
      };
    } catch (e) {
      return {
        success: false,
        message: `Project reading error: ${e.message}.`,
      };
    }
  });

  app.post<{Body: Api_GetProject}>(
    '/api/project',
    async (req) => {
      saveJson({
        path: config.output.source,
        file: req.body.input,
        eofLine: config.eofLine,
      });
      for (const translation of config.output.translations) {
        const data = req.body.output.translations.find(t => t.locale === translation.locale);
        if (!data) {
          throw Error(`Translation file (${translation.locale}) not found in payload.`);
        }
        saveJson({
          path: translation.path,
          file: {
            locale: data.locale,
            translations: data.translations,
          },
          eofLine: config.eofLine,
        });
      }
      return true;
    });
});

app.register(require('fastify-disablecache'));

app.register(require('fastify-static'), {
  root: resolve(__dirname, '../../ngxe'),
  prefix: '/',
});

const url = `http://localhost:${config.port}`;
app.listen(config.port, '0.0.0.0', (err) => {
  if (err) {
    throw err;
  }
  app.log.info(`📜 ngxe working on ${url}`);

  if (config.open) {
    open(url).then(() => {
    });
  }
});
