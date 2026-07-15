"use client";

import { useState } from "react";

type Rol = "hulpvrager" | "grootgenoot";

export default function GegevensForm() {
  const [rol, setRol] = useState<Rol>("hulpvrager");
  const [voornaam, setVoornaam] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [rekeninghouder, setRekeninghouder] = useState("");
  const [rekeningAangepast, setRekeningAangepast] = useState(false);
  const [status, setStatus] = useState<"idle" | "bezig" | "klaar">("idle");
  const [fout, setFout] = useState<string | null>(null);

  // Vul de rekeninghouder automatisch met de naam, tot de gebruiker 'm zelf wijzigt.
  function syncRekeninghouder(vn: string, an: string) {
    if (!rekeningAangepast) setRekeninghouder(`${vn} ${an}`.trim());
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFout(null);
    setStatus("bezig");
    const form = new FormData(e.currentTarget);
    if (String(form.get("website") ?? "")) {
      setStatus("klaar"); // honeypot
      return;
    }

    try {
      const res = await fetch("/api/stripe-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rol,
          voornaam,
          achternaam,
          email: String(form.get("email") ?? ""),
          telefoon: String(form.get("telefoon") ?? ""),
          straat: String(form.get("straat") ?? ""),
          postcode: String(form.get("postcode") ?? ""),
          woonplaats: String(form.get("woonplaats") ?? ""),
          geboortedatum: String(form.get("geboortedatum") ?? ""),
          kvk: String(form.get("kvk") ?? ""),
          iban: String(form.get("iban") ?? ""),
          rekeninghouder,
          machtiging_akkoord: form.get("machtiging_akkoord") === "on",
          toelichting: String(form.get("toelichting") ?? ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Er ging iets mis");
      setStatus("klaar");
    } catch (err) {
      setFout(err instanceof Error ? err.message : "Er ging iets mis");
      setStatus("idle");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-lg text-ink placeholder:text-muted/60 focus:border-support";
  const labelClass = "block text-lg font-semibold text-ink";

  if (status === "klaar") {
    return (
      <div className="glas p-8">
        <h2 className="text-2xl font-bold text-ink">Gelukt, bedankt!</h2>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          We hebben je gegevens goed ontvangen. Hidde zet de betaling voor je
          klaar en neemt contact op als er nog iets nodig is. Je hoeft nu niets
          meer te doen.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <p className={labelClass}>Voor wie zijn deze gegevens?</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {(
            [
              ["hulpvrager", "Ik ontvang hulp"],
              ["grootgenoot", "Ik ben grootgenoot"],
            ] as [Rol, string][]
          ).map(([w, label]) => (
            <button
              key={w}
              type="button"
              onClick={() => setRol(w)}
              className={`rounded-xl border p-4 text-lg font-semibold transition ${
                rol === w
                  ? "border-support bg-support/10 text-support"
                  : "border-ink/15 bg-white text-ink hover:border-support/40"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-base leading-relaxed text-muted">
          {rol === "hulpvrager"
            ? "Voor de maandelijkse automatische incasso van de hulp die je afneemt."
            : "Zodat je uitbetaling van je gewerkte uren klaargezet kan worden."}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="voornaam" className={labelClass}>
            Voornaam
          </label>
          <input
            id="voornaam"
            name="voornaam"
            required
            value={voornaam}
            onChange={(e) => {
              setVoornaam(e.target.value);
              syncRekeninghouder(e.target.value, achternaam);
            }}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="achternaam" className={labelClass}>
            Achternaam
          </label>
          <input
            id="achternaam"
            name="achternaam"
            required
            value={achternaam}
            onChange={(e) => {
              setAchternaam(e.target.value);
              syncRekeninghouder(voornaam, e.target.value);
            }}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>
            E-mailadres
          </label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="telefoon" className={labelClass}>
            Telefoonnummer
          </label>
          <input id="telefoon" name="telefoon" type="tel" required className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="straat" className={labelClass}>
          Straat en huisnummer
        </label>
        <input
          id="straat"
          name="straat"
          required
          placeholder="Bijv. Dorpsstraat 12"
          className={inputClass}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="postcode" className={labelClass}>
            Postcode
          </label>
          <input id="postcode" name="postcode" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="woonplaats" className={labelClass}>
            Woonplaats
          </label>
          <input id="woonplaats" name="woonplaats" required className={inputClass} />
        </div>
      </div>

      {rol === "grootgenoot" && (
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="geboortedatum" className={labelClass}>
              Geboortedatum
            </label>
            <input
              id="geboortedatum"
              name="geboortedatum"
              type="date"
              required
              className={inputClass}
            />
            <p className="mt-1 text-base text-muted">
              Nodig om je uitbetaling bij Stripe klaar te zetten.
            </p>
          </div>
          <div>
            <label htmlFor="kvk" className={labelClass}>
              KvK-nummer{" "}
              <span className="font-normal text-muted">(optioneel)</span>
            </label>
            <input id="kvk" name="kvk" className={inputClass} />
            <p className="mt-1 text-base text-muted">
              Alleen als je met een eigen bedrijf werkt.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="iban" className={labelClass}>
            IBAN (rekeningnummer)
          </label>
          <input
            id="iban"
            name="iban"
            required
            placeholder="NL00 BANK 0000 0000 00"
            autoComplete="off"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="rekeninghouder" className={labelClass}>
            Naam op de rekening
          </label>
          <input
            id="rekeninghouder"
            name="rekeninghouder"
            required
            value={rekeninghouder}
            onChange={(e) => {
              setRekeninghouder(e.target.value);
              setRekeningAangepast(true);
            }}
            className={inputClass}
          />
        </div>
      </div>

      {rol === "hulpvrager" && (
        <div className="rounded-2xl border border-support/20 bg-support/5 p-5">
          <label className="flex items-start gap-3 text-lg leading-relaxed text-ink">
            <input
              type="checkbox"
              name="machtiging_akkoord"
              className="mt-1.5 h-5 w-5 shrink-0 accent-support"
            />
            <span>
              Ik geef Grootgenoot toestemming om de maandelijkse kosten voor de
              hulp automatisch van mijn rekening af te schrijven (SEPA-
              incassomachtiging). Ik ontvang elke maand vooraf een overzicht. Ben
              ik het niet eens met een afschrijving? Dan kan ik die binnen acht
              weken bij mijn bank laten terugboeken.
            </span>
          </label>
        </div>
      )}

      <div>
        <label htmlFor="toelichting" className={labelClass}>
          Nog iets toe te lichten?{" "}
          <span className="font-normal text-muted">(optioneel)</span>
        </label>
        <textarea id="toelichting" name="toelichting" rows={3} className={inputClass} />
      </div>

      <p className="text-base leading-relaxed text-muted">
        Je gegevens komen veilig bij ons binnen en gebruiken we alleen om je
        betaling bij Stripe klaar te zetten.
      </p>

      {fout && (
        <p role="alert" className="text-lg font-semibold text-red-700">
          {fout}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "bezig"}
        className="w-full rounded-xl bg-support px-6 py-4 text-xl font-bold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
      >
        {status === "bezig" ? "Bezig…" : "Gegevens versturen"}
      </button>
    </form>
  );
}
