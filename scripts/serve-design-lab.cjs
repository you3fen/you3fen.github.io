const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../experiments/motion-lab');
const staticRoot = path.resolve(__dirname, '../static');
const publicRoot = path.resolve(__dirname, '../public');
const routes = new Set(['/', '/light/', '/atlas/', '/index-room/', '/journal/', '/echo/']);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
    let url;
    try { url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); res.end(); return; }
    const relative = routes.has(url) ? 'index.html' : url === '/current/' ? 'index.html' : url.replace(/^\/+/, '');
    const base = url === '/current/' || url.startsWith('/objects/') || url.startsWith('/about/') || /^\/collection\.[a-f0-9]+\./.test(url) ? publicRoot : url.startsWith('/collection/') ? staticRoot : root;
    let file = path.resolve(base, relative);
    if (!file.startsWith(base + path.sep)) { res.writeHead(403); res.end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    fs.readFile(file, (error, data) => {
        if (error) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('页面未找到'); return; }
        res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        res.end(data);
    });
}).listen(Number(process.env.DESIGN_PORT || 4173), '127.0.0.1', () => console.log(`Design lab: http://127.0.0.1:${process.env.DESIGN_PORT || 4173}/`));
