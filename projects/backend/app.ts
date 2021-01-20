import fastify from 'fastify';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Config } from './meta';

const config: Config = JSON.parse(readFileSync(resolve('ngxe.json'), {encoding: 'UTF8'}));
console.log('Config', config);

const app = fastify({
  logger: true,
  bodyLimit: 10 * 1000000, // X * MB
});

app.register(async app => {
  app.get('/source', async () => {
    return readFileSync(resolve(config.source), {encoding: 'UTF8'});
  });

  app.post('/messages', async () => {
    return true;
  });
});

app.listen('7600', '0.0.0.0', (err, address) => {
  if (err) {
    throw err;
  }
  app.log.info(`ngxe backend listening on ${address}`);
});
