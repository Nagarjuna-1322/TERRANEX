import { defineConfig, mergeConfig } from 'vite';
import baseConfig from '../vite.config';
import { fileURLToPath } from 'node:url';
import { INITIAL_ROADS, INITIAL_VEHICLES, INITIAL_DELIVERIES, INITIAL_INCIDENTS, INITIAL_ALERTS, INITIAL_WEATHER } from '../src/data/nerData';
import { INITIAL_INDIA_NEWS_ARTICLES } from '../src/data/newsData';

const firebaseFixture = fileURLToPath(new URL('./firebase.ts', import.meta.url));
const readData: Record<string, unknown> = {
  '/roads': { roads: INITIAL_ROADS }, '/vehicles': { vehicles: INITIAL_VEHICLES },
  '/deliveries': { deliveries: INITIAL_DELIVERIES }, '/incidents': { incidents: INITIAL_INCIDENTS },
  '/alerts': { alerts: INITIAL_ALERTS }, '/weather': { weather: INITIAL_WEATHER },
  '/dashboard': {}, '/news': { articles: INITIAL_INDIA_NEWS_ARTICLES }, '/audit-logs': { auditLogs: [] }
};

export default defineConfig((env) => {
  if (env.command !== 'serve') throw new Error('The review demo is development-only; use the normal config for production.');
  return mergeConfig(baseConfig(env), {
    cacheDir: 'node_modules/.vite-review',
    resolve: { alias: [
      { find: /^firebase\/auth$/, replacement: firebaseFixture },
      { find: /^(?:\.\/services\/firebase|\.\.\/services\/firebase|\.\/firebase)$/, replacement: firebaseFixture }
    ] },
    plugins: [{
      name: 'read-only-review',
      transformIndexHtml(html: string) {
        return html.replace('<body ', '<body style="padding-top:60px" ').replace('</body>', '<div role="note" style="position:fixed;inset:0 0 auto;z-index:99999;background:#ff3e00;color:white;padding:12px;text-align:center;font:700 13px sans-serif">REVIEW DEMO · Sample data and simulated sign-in · No live account or backend changes</div></body>');
      },
      configureServer(server) {
        server.middlewares.use('/api', (req, res) => {
          res.setHeader('Content-Type', 'application/json');
          const value = readData[(req.url || '').split('?')[0]];
          if (req.method !== 'GET' || !value) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: 'This action is unavailable in the read-only review demo.' }));
            return;
          }
          res.end(JSON.stringify(value));
        });
      }
    }]
  });
});
