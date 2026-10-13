import fs from 'node:fs';
import path from 'node:path';

const FILE = path.join(import.meta.dirname, 'data', 'books.json');

export function readBooks() {
  return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
}

export function writeBooks(books) {
  fs.writeFileSync(FILE, JSON.stringify(books, null, 2), 'utf-8');
}

export function nextId(books) {
  return books.reduce((max, b) => Math.max(max, b.id), 0) + 1;
}