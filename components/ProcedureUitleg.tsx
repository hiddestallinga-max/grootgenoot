export default function ProcedureUitleg({
  metMantelzorger = false,
}: {
  metMantelzorger?: boolean;
}) {
  return (
    <div className="mb-10 rounded-2xl border border-support/20 bg-support/5 p-6">
      <h2 className="text-xl font-bold text-ink">Zo gaat het verder</h2>
      <ol className="mt-3 space-y-3 text-lg leading-relaxed text-muted">
        <li>
          <span className="font-semibold text-ink">
            1. We bellen je eerst.
          </span>{" "}
          We nemen telefonisch contact met je op om je vraag rustig door te
          spreken.
        </li>
        <li>
          <span className="font-semibold text-ink">
            2. Gratis kennismakingsgesprek.
          </span>{" "}
          Zodra er een passende match is, plannen we een gratis en vrijblijvend
          kennismakingsgesprek.
        </li>
      </ol>
      {metMantelzorger && (
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Fijn om te weten: als het relevant is, is het prettig als er een
          mantelzorger bij het kennismakingsgesprek aanwezig is. Die kan
          meehelpen bij het regelen van de administratie.
        </p>
      )}
    </div>
  );
}
