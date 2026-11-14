import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import './build.mjs';
const port = Number(process.env.PORT || 4173);
const server = createServer(async (req, res) => {
  if (req.url === '/favicon.ico') { res.writeHead(204); res.end(); return; }
  if (req.url !== '/' && req.url !== '/index.html') { res.writeHead(404); res.end('Not found'); return; }
  try {
    const html = await readFile(new URL('../lib/index.html', import.meta.url));
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
    res.end(html);
  } catch {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Build unavailable. Run npm run build and reload.');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`灵感变异机 → http://127.0.0.1:${port}`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
