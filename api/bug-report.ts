import { createHash } from 'node:crypto';

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REPORTS = 5;
// Finish with a JSON receipt before the 60-second Vercel execution deadline.
const MAIL_TIMEOUT_MS = 20000;
// Best-effort per-instance throttling. Identical email retries use a Resend idempotency key.
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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(503).json({ ok: false, error: 'missing_resend_key' });
  const email = {
    from: process.env.RESEND_FROM || 'Cursed Ring <onboarding@resend.dev>',
    to: ['zaxiquej@gmail.com'],
    subject: 'Cursed Ring Bug Report',
    text: payload.formatted_report.replace('玩家IP：由服务器记录', `玩家IP：${ip}`) +
      '\n\n现场数据 JSON：\n' + JSON.stringify({
        report_id: reportId, player_id: payload.player_id, run_id: payload.run_id,
        build_id: payload.build_id, version: payload.version, state: payload.state,
      }, null, 2),
  };
  const emailBody = JSON.stringify(email);
  const sendKey = 'bug-' + reportId + '-' + createHash('sha256').update(emailBody).digest('hex');
  const controller = new AbortController();
  const startedAt = Date.now();
  const timeout = setTimeout(() => controller.abort(), MAIL_TIMEOUT_MS);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': sendKey },
      signal: controller.signal, body: emailBody,
    });
    const receipt = await response.json().catch((error) => {
      if (controller.signal.aborted) throw error;
      return null;
    });
    if (!response.ok || typeof receipt?.id !== 'string' || !receipt.id) {
      const name = String(receipt?.name || '');
      const providerCode = /^[a-z][a-z0-9_]{0,63}$/.test(name) ? name : 'unknown';
      console.error('bug-report: resend rejected', {
        status: response.status, providerCode, reportId, elapsedMs: Date.now() - startedAt,
      });
      return res.status(502).json({
        ok: false, error: response.ok ? 'resend_invalid_receipt' : 'resend_rejected',
        provider_code: providerCode, upstream_status: response.status,
      });
    }
    return res.status(200).json({ ok: true, report_id: reportId });
  } catch (error) {
    const timedOut = controller.signal.aborted;
    const cause = String(error?.cause?.code || error?.code || '');
    const networkCode = /^[A-Z][A-Z0-9_]{0,63}$/.test(cause) ? cause : 'unknown';
    console.error('bug-report: resend request failed', { reportId, timedOut, networkCode, elapsedMs: Date.now() - startedAt });
    return res.status(timedOut ? 504 : 502).json({ ok: false, error: timedOut ? 'resend_timeout' : 'resend_unavailable' });
  } finally {
    clearTimeout(timeout);
  }
}
