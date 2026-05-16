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
    if (req.method === 'POST' && req.url === '/api/sync-data') {
      const body = await readBody(req);
      const payload = JSON.parse(body || '{}');
      validateSyncPayload(payload);
      const updated = await syncVocabToLessonFiles(payload.vocab);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, updated }));
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
  console.log('Nút Đồng bộ data sẽ ghi cứng nghĩa vào data/quizlet-minna-bai-XX-lines.js');
});

async function syncVocabToLessonFiles(vocab) {
  const byKey = new Map();
  for (const item of vocab) {
    const lessons = Array.isArray(item.lessons) ? item.lessons : [];
    for (const lesson of lessons) {
      const key = `${lesson}::${item.word}::${item.kana}`;
      byKey.set(key, sanitizeMeaning(item.meaning));
    }
  }

  let updated = 0;
  for (let lesson = 1; lesson <= 25; lesson++) {
    const file = join(root, `data/quizlet-minna-bai-${String(lesson).padStart(2, '0')}-lines.js`);
    if (!existsSync(file)) continue;

    const original = await readFile(file, 'utf8');
    const next = original.replace(/`([\s\S]*?)`\);/m, (_, raw) => {
      const lines = raw.split('\n').map(line => {
        const indent = line.match(/^\s*/)?.[0] || '';
        const trimmed = line.trim();
        if (!trimmed) return line;
        const [word = '', kana = '', oldMeaning = ''] = trimmed.split('|').map(x => x.trim());
        if (!word || !kana) return line;

        const key = `${lesson}::${word}::${kana}`;
        const meaning = byKey.get(key) || oldMeaning || '';
        if (!meaning) return line;
        const nextLine = `${indent}${word}|${kana}|${meaning}`;
        if (nextLine !== line) updated++;
        return nextLine;
      });
      return '`' + lines.join('\n') + '`);';
    });

    if (next !== original) await writeFile(file, next, 'utf8');
  }

  await writeFile(join(root, 'data/user-meaning-edits.js'), 'window.USER_MEANING_EDITS = {};\n', 'utf8');
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
      if (body.length > 1024 * 1024 * 5) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function validateSyncPayload(payload) {
  if (!payload || !Array.isArray(payload.vocab)) throw new Error('Invalid sync payload');
  for (const item of payload.vocab) {
    if (typeof item.word !== 'string' || typeof item.kana !== 'string' || typeof item.meaning !== 'string') {
      throw new Error('Invalid vocab item');
    }
  }
}
