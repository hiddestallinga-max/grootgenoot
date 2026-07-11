// Mail versturen via Resend (https://resend.com), zonder extra dependency —
// gewoon via hun REST API. Zolang RESEND_API_KEY niet is ingesteld doet dit
// niets (de site blijft gewoon werken, er wordt alleen geen mail verstuurd).
//
// Setup (eenmalig):
// 1. Gratis account op resend.com
// 2. Domein grootgenoot.nl verifiëren: Resend geeft DNS-records (DKIM/SPF)
//    die je toevoegt bij mijndomein.nl > DNS-beheer
// 3. API-key in .env.local en in Vercel (Settings > Environment Variables)

type Mail = {
  naar: string;
  onderwerp: string;
  tekst: string;
};

export async function stuurMail({ naar, onderwerp, tekst }: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const van = process.env.EMAIL_VAN ?? "Grootgenoot <info@grootgenoot.nl>";

  if (!key) {
    console.warn("RESEND_API_KEY ontbreekt — mail niet verstuurd:", onderwerp);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: van, to: [naar], subject: onderwerp, text: tekst }),
    });
    if (!res.ok) {
      console.error("Mail versturen mislukt:", res.status, await res.text());
    }
    return res.ok;
  } catch (err) {
    console.error("Mail versturen mislukt:", err);
    return false;
  }
}

/** Waar meldingen over nieuwe aanmeldingen/berichten heen gaan. */
export function eigenaarEmail(): string {
  return process.env.EMAIL_NAAR ?? "info@grootgenoot.nl";
}
