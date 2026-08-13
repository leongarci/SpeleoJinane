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
  const from =
    process.env.RESEND_FROM?.trim() || "Speleo Jinane <beth.t@example.com>";
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
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
  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
  };
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Web3Forms a refusé l'envoi");
  }
  return true;
}

/** Secours sans domaine ni clé : FormSubmit (1re fois : confirmer le mail reçu). */
async function sendFormSubmit(to: string, subject: string, text: string) {
  const res = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(to)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        _subject: subject,
        message: text,
        _template: "box",
        _captcha: "false",
      }),
    },
  );
  const data = (await res.json().catch(() => ({}))) as {
    success?: string | boolean;
    message?: string;
  };
  if (!res.ok || data.success === "false" || data.success === false) {
    throw new Error(data.message || "FormSubmit a refusé l'envoi");
  }
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
      { error: "RSVP_TO_EMAIL n'est pas configuré." },
      { status: 500 },
    );
  }

  const { subject, text } = summarize(body);
  const errors: string[] = [];

  if (process.env.RESEND_API_KEY) {
    try {
      await sendResend(to, subject, text);
      return NextResponse.json({ ok: true });
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Resend a échoué");
    }
  }

  try {
    if (await sendWeb3Forms(subject, text)) {
      return NextResponse.json({ ok: true });
    }
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Web3Forms a échoué");
  }

  try {
    await sendFormSubmit(to, subject, text);
    return NextResponse.json({ ok: true });
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "FormSubmit a échoué");
  }

  return NextResponse.json(
    {
      error:
        errors[0] ||
        "Envoi impossible. Ajoute RESEND_FROM (domaine vérifié sur resend.com/domains) ou WEB3FORMS_ACCESS_KEY.",
    },
    { status: 500 },
  );
}
