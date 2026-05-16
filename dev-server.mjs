import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 5173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg'
};

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/meaning-edits') {
      const body = await readBody(req);
      const edits = JSON.parse(body || '{}');
      validateEdits(edits);

      const updated = await persistEditsToLessonFiles(edits);
      const fallbackContent = `window.USER_MEANING_EDITS = ${JSON.stringify(edits, null, 2)};\n`;
      await writeFile(join(root, 'data/user-meaning-edits.js'), fallbackContent, 'utf8');

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, count: Object.keys(edits).length, updated }));
      return;
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405);
      res.end('Method Not Allowed');
      return;
    }

    const url = new URL(req.url || '/', `http://localhost:${port}`);
    const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const safePath = normalize(pathname).replace(/^([/\\])+/, '');
    const filePath = join(root, safePath);
    if (!filePath.startsWith(root) || !existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    res.writeHead(200, { 'Content-Type': mime[extname(filePath)] || 'application/octet-stream' });
    if (req.method === 'HEAD') return res.end();
    createReadStream(filePath).pipe(res);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(error instanceof Error ? error.message : String(error));
  }
});

server.listen(port, () => {
  console.log(`Kanji study dev server: http://localhost:${port}`);
  console.log('Edit nghĩa trên UI sẽ cập nhật data/quizlet-minna-bai-XX-lines.js');
});

async function persistEditsToLessonFiles(edits) {
  let updated = 0;
  for (let lesson = 1; lesson <= 25; lesson++) {
    const file = join(root, `data/quizlet-minna-bai-${String(lesson).padStart(2, '0')}-lines.js`);
    if (!existsSync(file)) continue;

    const original = await readFile(file, 'utf8');
    const next = original.replace(/`([\s\S]*?)`\);/m, (_, raw) => {
      const lines = raw.split('\n').map(line => {
        const trimmed = line.trim();
        if (!trimmed) return line;
        const [word = '', kana = '', oldMeaning = ''] = trimmed.split('|').map(x => x.trim());
        if (!word || !kana) return line;

        const key = `${encodeURIComponent(word)}|${encodeURIComponent(kana)}`;
        if (!Object.prototype.hasOwnProperty.call(edits, key)) return line;
        updated++;
        return `${word}|${kana}|${sanitizeMeaning(edits[key])}`;
      });
      return '`' + lines.join('\n') + '`);';
    });

    if (next !== original) await writeFile(file, next, 'utf8');
  }
  return updated;
}

function sanitizeMeaning(value) {
  return String(value || '')
    .replace(/[\r\n]+/g, ' / ')
    .replace(/\|/g, '/')
    .trim();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function validateEdits(edits) {
  if (!edits || typeof edits !== 'object' || Array.isArray(edits)) {
    throw new Error('Invalid edits payload');
  }
  for (const [key, value] of Object.entries(edits)) {
    if (typeof key !== 'string' || typeof value !== 'string') {
      throw new Error('Invalid edit entry');
    }
    if (value.length > 1000) {
      throw new Error('Meaning is too long');
    }
  }
}
