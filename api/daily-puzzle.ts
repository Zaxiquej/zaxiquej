import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Read-only delivery. Generation runs before publication, never in a GET request.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });
  const date = req.query.date;
  const schema = req.query.schema;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || schema !== '8') {
    return res.status(400).json({ error: 'invalid_request' });
  }
  try {
    const body = await readFile(join(process.cwd(), 'daily-puzzles', 'v8', `${date}.json`), 'utf8');
    const puzzle = JSON.parse(body);
    if (puzzle.schema !== 8 || puzzle.date !== date || typeof puzzle.board !== 'string') {
      return res.status(503).json({ error: 'invalid_publication' });
    }
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    return res.status(200).json(puzzle);
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store');
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return res.status(404).json({ error: 'not_published' });
    }
    return res.status(503).json({ error: 'unavailable' });
  }
}
