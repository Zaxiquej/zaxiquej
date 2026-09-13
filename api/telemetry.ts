import { createHash } from 'node:crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  let payload = req.body;
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); }
    catch { return res.status(400).json({ ok: false, error: 'invalid_json' }); }
  }
  if (!payload || Array.isArray(payload) || typeof payload !== 'object' ||
      !String(payload.kind || '').startsWith('cursed_ring_run_telemetry')) {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }
  const modes = ['normal', 'daily', 'challenge', 'tutorial'];
  if (!modes.includes(payload.mode)) return res.status(400).json({ ok: false, error: 'invalid_mode' });
  const schema = Number(payload.schema_version || 1);
  if (schema >= 3 && (!/^[a-f0-9]{32}$/.test(payload.player_id || '') ||
      !/^[a-f0-9]{32}$/.test(payload.run_id || '') ||
      !/^[a-zA-Z0-9:_-]{1,160}$/.test(payload.event_id || ''))) {
    return res.status(400).json({ ok: false, error: 'missing_identity' });
  }
  const body = JSON.stringify(payload);
  if (Buffer.byteLength(body, 'utf8') > 2 * 1024 * 1024) {
    return res.status(413).json({ ok: false, error: 'payload_too_large' });
  }
  // Preserve pre-v3 clients. The hash makes retries of the same legacy sample idempotent.
  payload.event_id ||= 'legacy-' + createHash('sha256').update(body).digest('hex');
  const historyTest = payload.event_type === 'history_test' || String(payload.kind).includes('_test');
  const dataset = historyTest ? 'tests' : payload.mode;
  const webhook = (dataset === 'daily' && process.env.GOOGLE_SHEET_DAILY_WEBHOOK_URL) || process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhook) return res.status(503).json({ ok: false, error: 'missing_webhook' });

  const target = new URL(webhook);
  if (process.env.TELEMETRY_SECRET) target.searchParams.set('secret', process.env.TELEMETRY_SECRET);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch(target, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: controller.signal,
    });
    const receipt = await response.json();
    if (!response.ok || receipt?.ok !== true || receipt?.event_id !== payload.event_id || receipt?.dataset !== dataset) {
      return res.status(502).json({ ok: false, error: 'sheet_not_acknowledged' });
    }
    return res.status(200).json({ ok: true, event_id: payload.event_id, dataset, duplicate: receipt.duplicate === true });
  } catch {
    return res.status(502).json({ ok: false, error: 'sheet_unavailable' });
  } finally {
    clearTimeout(timeout);
  }
}
