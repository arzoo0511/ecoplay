import { buildSync } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SW_ENTRY = path.resolve(__dirname, '../public/service-worker.ts');
const SW_FILENAME = 'service-worker.js';

function compileServiceWorker(minify: boolean): string {
  const result = buildSync({
    entryPoints: [SW_ENTRY],
    bundle: true,
    format: 'iife',
    target: 'es2020',
    platform: 'browser',
    minify,
    write: false,
  });

  const output = result.outputFiles[0];
  if (!output) {
    throw new Error('Service worker compilation produced no output');
  }
  return output.text;
}

export function serviceWorkerPlugin(): Plugin {
  let compiled = '';

  const rebuild = (minify: boolean) => {
    compiled = compileServiceWorker(minify);
  };

  return {
    name: 'ecoplay-service-worker',
    configureServer(server) {
      rebuild(false);

      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url === `/${SW_FILENAME}`) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(compiled);
          return;
        }
        next();
      });

      server.watcher.add(SW_ENTRY);
      server.watcher.on('change', (file) => {
        if (path.resolve(file) === SW_ENTRY) {
          rebuild(false);
          server.ws.send({ type: 'full-reload' });
        }
      });
    },
    buildStart() {
      rebuild(true);
    },
    closeBundle() {
      const outDir = path.resolve(__dirname, '../dist');
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, SW_FILENAME), compiled);
    },
  };
}
