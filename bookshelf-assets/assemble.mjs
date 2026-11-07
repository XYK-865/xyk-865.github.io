import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const books = JSON.parse(fs.readFileSync('bookshelf-assets/manifest.json', 'utf8'));
for (const book of books) {
  const content = Buffer.concat(book.chunks.map(chunk => fs.readFileSync(chunk)));
  assert.equal(content.length, book.bytes, book.path);
  assert.equal(crypto.createHash('sha256').update(content).digest('hex'), book.sha256, book.path);
  fs.mkdirSync(path.dirname(book.path), {recursive: true});
  fs.writeFileSync(book.path, content);
  console.log('Verified and assembled ' + book.path);
}
