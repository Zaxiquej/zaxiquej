export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  const webhook = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  const secret = process.env.TELEMETRY_SECRET || '';

  if (!webhook) {
    res.status(500).json({ ok: false, error: 'missing_webhook' });
    return;
  }

  const target = secret
    ? `${webhook}${webhook.includes('?') ? '&' : '?'}secret=${encodeURIComponent(secret)}`
    : webhook;

  let payload = req.body;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      payload = { raw: payload };
    }
  }

  const response = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    res.status(502).json({ ok: false, error: 'sheet_failed' });
    return;
  }

  res.status(200).json({ ok: true });
}
