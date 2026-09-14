import { createHash } from 'node:crypto';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REPORTS = 5;
// Best-effort per-instance throttling; the sheet receipt is the durable dedupe record.
const buckets = new Map();
function rateLimited(ip) {
  const now = Date.now();
  for (const [key, bucket] of buckets) if (now >= bucket.resetAt) buckets.delete(key);
  const bucket = buckets.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  buckets.set(ip, bucket);
  return ++bucket.count > MAX_REPORTS;
}

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
  if (!payload || Array.isArray(payload) || payload.kind !== 'cursed_ring_bug_report' ||
      typeof payload.player_message !== 'string' || typeof payload.formatted_report !== 'string' ||
      !payload.state || typeof payload.state !== 'object' || Array.isArray(payload.state)) {
    return res.status(400).json({ ok: false, error: 'invalid_payload' });
  }
  const serialized = JSON.stringify(payload);
  if (Buffer.byteLength(serialized, 'utf8') > 2 * 1024 * 1024) {
    return res.status(413).json({ ok: false, error: 'payload_too_large' });
  }
  // Older clients lack a report ID; identical legacy payloads still deduplicate.
  const reportId = payload.report_id ?? ('legacy-' + createHash('sha256').update(serialized).digest('hex'));
  if (typeof reportId !== 'string' || !/^(?:[a-f0-9]{32}|legacy-[a-f0-9]{64})$/.test(reportId)) {
    return res.status(400).json({ ok: false, error: 'invalid_report_id' });
  }
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket?.remoteAddress || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ ok: false, error: 'too_many_reports' });
  const webhook = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhook) return res.status(503).json({ ok: false, error: 'missing_webhook' });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);
  try {
    const target = new URL(webhook);
    if (process.env.TELEMETRY_SECRET) target.searchParams.set('secret', process.env.TELEMETRY_SECRET);
    const eventId = 'bug:' + reportId;
    // Preserve the existing report and structured scene; do not send it to an email service.
    const response = await fetch(target, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({ ...payload, report_id: reportId, event_id: eventId,
        formatted_report: payload.formatted_report.replace('玩家IP：由服务器记录', `玩家IP：${ip}`) }),
    });
    const receipt = await response.json().catch(() => null);
    if (!response.ok || receipt?.ok !== true || receipt?.event_id !== eventId || receipt?.dataset !== 'bug_reports') {
      console.error('bug-report: sheet did not acknowledge', { status: response.status });
      return res.status(502).json({ ok: false, error: receipt?.error === 'busy' ? 'sheet_busy' : 'sheet_not_acknowledged' });
    }
    return res.status(200).json({ ok: true, report_id: reportId, duplicate: receipt.duplicate === true });
  } catch {
    console.error('bug-report: sheet request failed');
    return res.status(502).json({ ok: false, error: 'sheet_unavailable' });
  } finally {
    clearTimeout(timeout);
  }
}
