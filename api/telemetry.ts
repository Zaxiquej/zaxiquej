export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false });
    return;
  }

  const webhook = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  const secret = process.env.TELEMETRY_SECRET || '';
  if (!webhook) {
    res.status(500).json({ ok: false, error: 'missing webhook' });
    return;
  }

  const target = secret
    ? `${webhook}${webhook.includes('?') ? '&' : '?'}secret=${encodeURIComponent(secret)}`
    : webhook;

  const response = await fetch(target, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });

  if (!response.ok) {
    res.status(502).json({ ok: false });
    return;
  }
  res.status(200).json({ ok: true });
}
