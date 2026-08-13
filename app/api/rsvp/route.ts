import { Resend } from "resend";
import { NextResponse } from "next/server";
import { parcoursById } from "@/lib/parcours";
import { formatDateFr } from "@/lib/dates";
import type { DurationId } from "@/lib/types";

export const runtime = "nodejs";

type Body = {
  coming: boolean | null;
  duration: DurationId | null;
  date: string | null;
};

function summarize(body: Body) {
  if (!body.coming) {
    return {
      subject: "Jinane a répondu à l'invitation spéléo : non",
      text: "Jinane a terminé l'aventure pixel art et a répondu : NON.\nElle ne souhaite pas (pour l'instant) partir faire de la spéléo à Tellure.",
    };
  }
  const p = body.duration ? parcoursById(body.duration) : null;
  const day = body.date ? Number(body.date.slice(-2)) : null;
  const when = day ? formatDateFr(String(day)) : "date non choisie";
  const what = p ? `${p.hours} — ${p.title} (${p.subtitle})` : "durée non choisie";
  return {
    subject: `Jinane a dit OUI — ${what} — ${when}`,
    text: [
      "Jinane a terminé l'aventure pixel art et a répondu : OUI.",
      "",
      `Expédition : ${what}`,
      `Date : ${when}`,
      "",
      "Parc Tellure — Sainte-Marie-aux-Mines",
      "https://tellure.fr/le-parc-tellure/parcours-de-speleologie/",
    ].join("\n"),
  };
}

async function sendResend(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: "Invitation Speleo <beth.t@example.com>",
    to,
    subject,
    text,
  });
  if (error) throw new Error(error.message);
  return true;
}

async function sendWeb3Forms(subject: string, text: string) {
  const key = process.env.WEB3FORMS_ACCESS_KEY;
  if (!key) return false;
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: key,
      subject,
      from_name: "Invitation Speleo Jinane",
      message: text,
    }),
  });
  if (!res.ok) throw new Error("Web3Forms a refusé l'envoi");
  return true;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const to = process.env.RSVP_TO_EMAIL;
  if (!to) {
    return NextResponse.json(
      { error: "RSVP_TO_EMAIL n'est pas configuré sur Vercel." },
      { status: 500 },
    );
  }

  const { subject, text } = summarize(body);

  try {
    const viaResend = await sendResend(to, subject, text);
    const viaW3 = viaResend ? true : await sendWeb3Forms(subject, text);
    if (!viaResend && !viaW3) {
      return NextResponse.json(
        {
          error:
            "Ajoute RESEND_API_KEY (ou WEB3FORMS_ACCESS_KEY) dans les variables d'environnement Vercel.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Envoi impossible";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
