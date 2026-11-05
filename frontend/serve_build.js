const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const BUILD_DIR = path.join(__dirname, 'build');
const PUBLIC_DIR = path.join(__dirname, 'public');
const BACKEND_TARGET = process.env.REACT_APP_MOODLE_URL || 'http://127.0.0.1/outlmstheme/moodle-backend';

const ASSET_EXTENSIONS = new Set([
  '.js', '.css', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.map', '.webp', '.mp4', '.webm'
]);

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// In-memory cache for index.html to eliminate 500 errors during rebuilds
let cachedIndexHtml = null;
const indexPath = path.join(BUILD_DIR, 'index.html');

function primeIndexCache() {
  fs.readFile(indexPath, (err, data) => {
    if (!err && data && data.length > 0) {
      cachedIndexHtml = data;
    }
  });
}
primeIndexCache();

function readWithRetry(targetPath, maxRetries = 10, delayMs = 150) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    function attempt() {
      attempts++;
      fs.readFile(targetPath, (err, data) => {
        if (!err && data) {
          if (targetPath.endsWith('index.html')) {
            cachedIndexHtml = data;
          }
          return resolve(data);
        }
        if (attempts < maxRetries) {
          setTimeout(attempt, delayMs);
        } else {
          reject(err);
        }
      });
    }
    attempt();
  });
}

function proxyRequestToBackend(req, res, targetUrl) {
  const parsedTarget = new URL(targetUrl);
  const options = {
    hostname: parsedTarget.hostname || '127.0.0.1',
    port: parsedTarget.port || (parsedTarget.protocol === 'https:' ? 443 : 80),
    path: parsedTarget.pathname + parsedTarget.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: parsedTarget.host || '127.0.0.1',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    const responseHeaders = { ...proxyRes.headers };
    // Remove existing CORS headers to eliminate duplicate header rejection in modern browsers
    delete responseHeaders['access-control-allow-origin'];
    delete responseHeaders['access-control-allow-methods'];
    delete responseHeaders['access-control-allow-headers'];
    delete responseHeaders['access-control-allow-credentials'];
    delete responseHeaders['Access-Control-Allow-Origin'];
    delete responseHeaders['Access-Control-Allow-Methods'];
    delete responseHeaders['Access-Control-Allow-Headers'];

    responseHeaders['Access-Control-Allow-Origin'] = '*';
    responseHeaders['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE';
    responseHeaders['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';

    res.writeHead(proxyRes.statusCode, responseHeaders);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Proxy Gateway Error', message: err.message }));
  });

  if (['GET', 'HEAD'].includes(req.method)) {
    proxyReq.end();
  } else {
    req.pipe(proxyReq, { end: true });
  }
}

const server = http.createServer(async (req, res) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    });
    res.end();
    return;
  }

  const reqUrl = req.url || '/';
  let urlPath = reqUrl.split('?')[0];
  try {
    urlPath = decodeURIComponent(urlPath);
  } catch {}

  // Reverse-proxy Moodle backend, API, or SSO requests
  if (
    urlPath.startsWith('/moodle-backend') ||
    urlPath.startsWith('/admin_api.php') ||
    urlPath.startsWith('/sso.php') ||
    urlPath.startsWith('/webservice') ||
    urlPath.startsWith('/login/token.php')
  ) {
    const backendSubPath = (urlPath.startsWith('/admin_api.php') || urlPath.startsWith('/sso.php') || urlPath.startsWith('/webservice') || urlPath.startsWith('/login/token.php'))
      ? reqUrl
      : reqUrl.replace(/^\/moodle-backend/, '');
    const fullTarget = `${BACKEND_TARGET.replace(/\/+$/, '')}${backendSubPath.startsWith('/') ? backendSubPath : '/' + backendSubPath}`;
    return proxyRequestToBackend(req, res, fullTarget);
  }

  const ext = path.extname(urlPath).toLowerCase();
  const isAssetRequest = ASSET_EXTENSIONS.has(ext) || urlPath.startsWith('/assets/') || urlPath.startsWith('/static/');

  // Check BUILD_DIR first, then fallback to PUBLIC_DIR
  let targetFile = null;
  const buildFile = path.join(BUILD_DIR, urlPath);
  if (fs.existsSync(buildFile)) {
    try {
      if (fs.statSync(buildFile).isFile()) {
        targetFile = buildFile;
      }
    } catch {}
  }
  if (!targetFile) {
    const publicFile = path.join(PUBLIC_DIR, urlPath);
    if (fs.existsSync(publicFile)) {
      try {
        if (fs.statSync(publicFile).isFile()) {
          targetFile = publicFile;
        }
      } catch {}
    }
  }

  // Auto-alias: If a main JS bundle was requested with an older cached hash or generic path
  // (e.g. /static/js/main.<oldhash>.js or /static/js/main.js), resolve to the current main.*.js on disk!
  if (!targetFile && urlPath.includes('/static/js/main.') && ext === '.js') {
    const jsDir = path.join(BUILD_DIR, 'static', 'js');
    if (fs.existsSync(jsDir)) {
      try {
        const files = fs.readdirSync(jsDir);
        const latestMain = files.find((f) => f.startsWith('main.') && f.endsWith('.js') && !f.endsWith('.LICENSE.txt'));
        if (latestMain) {
          targetFile = path.join(jsDir, latestMain);
        }
      } catch {}
    }
  }

  // Auto-alias: If a main CSS bundle was requested with an older cached hash or generic path
  // (e.g. /static/css/main.<oldhash>.css or /static/css/main.css), resolve to the current main.*.css on disk!
  if (!targetFile && urlPath.includes('/static/css/main.') && ext === '.css') {
    const cssDir = path.join(BUILD_DIR, 'static', 'css');
    if (fs.existsSync(cssDir)) {
      try {
        const files = fs.readdirSync(cssDir);
        const latestCss = files.find((f) => f.startsWith('main.') && f.endsWith('.css'));
        if (latestCss) {
          targetFile = path.join(cssDir, latestCss);
        }
      } catch {}
    }
  }

  if (targetFile) {
    const fileExt = path.extname(targetFile).toLowerCase();
    const contentType = MIME_TYPES[fileExt] || 'application/octet-stream';
    try {
      const data = await readWithRetry(targetFile);
      res.writeHead(200, {
        'Content-Type': contentType,
        // Eliminates immutable freeze so updated JS, CSS, and SVG thumbnails load immediately
        'Cache-Control': 'no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
      res.end(data);
      return;
    } catch (readErr) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Asset read error');
      return;
    }
  }

  // If this was an asset request (e.g. .svg, .js, .css, .png, .json) and was not found on disk,
  // NEVER return index.html! Return appropriate Content-Type so browsers never parse HTML as JS or CSS.
  if (isAssetRequest) {
    let fallbackType = 'text/plain; charset=UTF-8';
    let fallbackBody = 'Asset Not Found: ' + urlPath;
    if (ext === '.js') {
      fallbackType = 'application/javascript; charset=UTF-8';
      fallbackBody = `/* Asset Not Found: ${urlPath} */\nconsole.warn('OUT LMS: Script asset not found on server:', ${JSON.stringify(urlPath)});`;
    } else if (ext === '.css') {
      fallbackType = 'text/css; charset=UTF-8';
      fallbackBody = `/* CSS Not Found: ${urlPath} */`;
    } else if (ext === '.json') {
      fallbackType = 'application/json; charset=UTF-8';
      fallbackBody = JSON.stringify({ error: 'Asset not found', path: urlPath });
    }
    res.writeHead(404, {
      'Content-Type': fallbackType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(fallbackBody);
    return;
  }

  // Otherwise, handle as SPA client-side route and serve index.html
  try {
    const data = await readWithRetry(indexPath);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.end(data);
  } catch (readErr) {
    if (cachedIndexHtml) {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      });
      res.end(cachedIndexHtml);
      return;
    }

    // Clean auto-refreshing loading state while compilation completes
    res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
    res.end(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="2">
  <title>OUT LMS • Loading</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; }
    .card { background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.08); text-align: center; max-width: 440px; }
    .spinner { border: 3px solid #e2e8f0; border-top: 3px solid #0284c7; border-radius: 50%; width: 36px; height: 36px; animation: spin 0.8s linear infinite; margin: 0 auto 1.5rem; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    h2 { margin: 0 0 0.5rem; color: #0f172a; font-size: 1.25rem; }
    p { margin: 0; color: #64748b; font-size: 0.9rem; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>Open University of Tanzania (OUT LMS)</h2>
    <p>Synchronizing latest application bundle. Please wait a moment...</p>
  </div>
</body>
</html>`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`OUT LMS Server running at http://localhost:${PORT}/`);
  console.log(`Proxying backend requests to ${BACKEND_TARGET}`);
});
