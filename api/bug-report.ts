import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
