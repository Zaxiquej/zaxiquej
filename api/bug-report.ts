import type { VercelRequest, VercelResponse } from "@vercel/node";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
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
