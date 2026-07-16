import { procedureStappen, MANTELZORGER_TIP } from "@/lib/procedure";

export default function ProcedureUitleg({
  metMantelzorger = false,
}: {
  metMantelzorger?: boolean;
}) {
  const stappen = procedureStappen("je");

  return (
    <div className="mb-10 rounded-2xl border border-support/20 bg-support/5 p-6">
      <h2 className="text-xl font-bold text-ink">Zo gaat het verder</h2>
      <ol className="mt-3 space-y-3 text-lg leading-relaxed text-muted">
        {stappen.map((s, i) => (
          <li key={s.titel}>
            <span className="font-semibold text-ink">
              {i + 1}. {s.titel}
            </span>{" "}
            {s.tekst}
          </li>
        ))}
      </ol>
      {metMantelzorger && (
        <p className="mt-4 text-lg leading-relaxed text-muted">
          {MANTELZORGER_TIP}
        </p>
      )}
    </div>
  );
}
