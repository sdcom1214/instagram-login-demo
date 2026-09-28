'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000;
const root = __dirname;
const demoUsername = 'demo-user';
const demoPassword = 'demo-pass';
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  response.end(JSON.stringify(body));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > 10_000) request.destroy();
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function serveFile(request, response) {
  const requestedPath = request.url === '/' ? '/index.html' : request.url;
  const filePath = path.resolve(root, `.${requestedPath}`);
  if (!filePath.startsWith(root + path.sep)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, 'utf8', (error, content) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500);
      response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }

    if (filePath.endsWith('.html')) {
      content = content.replace("connect-src 'none'; form-action 'none'", "connect-src 'self'; form-action 'self'");
    }
    const type = contentTypes[path.extname(filePath)] || 'text/plain; charset=utf-8';
    response.writeHead(200, { 'Content-Type': type });
    response.end(content);
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/api/login') {
    try {
      const data = JSON.parse(await readRequestBody(request));
      const fields = Object.keys(data).sort();
      if (fields.length !== 2 || fields[0] !== 'password' || fields[1] !== 'username') {
        sendJson(response, 400, { message: '아이디와 비밀번호만 전송해야 합니다.' });
        return;
      }
      console.log(`[login request] username=${JSON.stringify(data.username)} password=${JSON.stringify(data.password)}`);
      const valid = data.username === demoUsername && data.password === demoPassword;
      sendJson(response, valid ? 200 : 401, {
        message: valid ? '로그인 성공: 로컬 모의 계정입니다.' : '아이디 또는 비밀번호가 올바르지 않습니다.'
      });
    } catch (error) {
      sendJson(response, 400, { message: '잘못된 요청입니다.' });
    }
    return;
  }

  if (request.method === 'GET') {
    serveFile(request, response);
    return;
  }

  response.writeHead(405);
  response.end('Method not allowed');
});

server.listen(port, () => {
  console.log(`Local demo server: http://localhost:${port}`);
  console.log(`Test account: ${demoUsername} / ${demoPassword}`);
});
