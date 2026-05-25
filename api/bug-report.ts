import type { VercelRequest, VercelResponse } from "@vercel/node";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REPORTS = 5;

const buckets = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: any) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

function rateLimited(ip: string) {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > MAX_REPORTS;
}

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: "Too many reports" });
  }

  const body = req.body;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Cursed Ring <onboarding@resend.dev>",
      to: ["zaxiquej@gmail.com"],
      subject: "Cursed Ring Bug Report",
      text: JSON.stringify(body, null, 2),
    }),
  });

  if (!response.ok) {
    return res.status(500).json({ ok: false });
  }

  return res.status(200).json({ ok: true });
}
