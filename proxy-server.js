const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 8090;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const target = decodeURIComponent(req.url.slice(1)); // strip leading /
  if (!target.startsWith('http')) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  const parsed = url.parse(target);
  const lib = parsed.protocol === 'https:' ? https : http;

  lib.get(target, (apiRes) => {
    res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    apiRes.pipe(res);
  }).on('error', (e) => {
    res.writeHead(500);
    res.end(e.message);
  });
});

server.listen(PORT, () => {
  console.log(`CORS proxy running at http://localhost:${PORT}`);
});
