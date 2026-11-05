/**
 * ThermalPrint Pro - Local Network Server
 * Listens on 0.0.0.0 to allow access and printing from other desktops/devices on the same LAN/Wi-Fi.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = 3000;
const PUBLIC_DIR = __dirname;

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Find IPv4 non-internal address
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // API to return server network IP to the frontend
  if (reqPath === '/api/network-info') {
    const ip = getLocalIp();
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      ip,
      port: PORT,
      localUrl: `http://localhost:${PORT}`,
      networkUrl: `http://${ip}:${PORT}`
    }));
    return;
  }

  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, reqPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

// Bind to 0.0.0.0 so all other desktops on the local Wi-Fi/Ethernet network can access it!
server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIp();
  console.log(`\n======================================================`);
  console.log(`🚀 ThermalPrint Pro Studio is LIVE on your Network!`);
  console.log(`------------------------------------------------------`);
  console.log(`💻 On this PC:             http://localhost:${PORT}`);
  console.log(`🌐 From ANY other desktop:  http://${ip}:${PORT}`);
  console.log(`======================================================\n`);

  // Open default browser on this PC
  exec(`start http://localhost:${PORT}`);
});
