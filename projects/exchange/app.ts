import fastify from 'fastify';
import {existsSync, readFileSync, writeFileSync, mkdirSync} from 'fs';
import {resolve} from 'path';
import {Api_GetProject} from '../meta/api';
import {formatExchangeFile} from '../meta/format-exchange-file';

const app = fastify({
  logger: true,
  bodyLimit: 10 * 10000, // X * MB
});

const projectsPath = resolve(__dirname, 'projects');
if (!existsSync(projectsPath)) {
  mkdirSync(projectsPath);
}

app.register(async app => {
  app.post<{Body: Api_GetProject; Params: {project: string; branch: string}}>(
    '/api/project/save/:project/:branch',
    async (req) => {
      const path = resolve(projectsPath, compileProjectFilename(req.params.project, req.params.branch));
      writeFileSync(path, JSON.stringify(req.body));
      return true;
    });

  app.post<{Params: {project: string; branch: string}}>(
    '/api/project/load/:project/:branch',
    async (req) => {
      const path = resolve(projectsPath, compileProjectFilename(req.params.project, req.params.branch));
      if (!existsSync(path)) {
        throw new Error(`File for project/branch not found`);
      }
      return JSON.parse(readFileSync(path, {encoding: 'utf8'}));
    });
});

app.register(require('fastify-disablecache'));
app.register(require('@fastify/cors'));

app.listen({
  port: 3080,
  host: '0.0.0.0',
}).then(async (url) => {
  app.log.info(`🗃️ ngxe exchange working on ${url}`);
}).catch(err => {
  console.error(err);
})

function compileProjectFilename(project: string, branch: string) {
  return `proj_${formatExchangeFile(project)}-branch_${formatExchangeFile(branch)}`;
}
