export default function AccountBalance() {
  const sponsors = [
    { logo: "Kotak", name: "Kotak811" },
    { logo: "RC", name: "RummyCircle" },
    { logo: "SE", name: "Sh esy" },
    { logo: "A23", name: "A23 Rummy" },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-around gap-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-slate-500">Debit Balance</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">$875</p>
          </div>
          <p className="text-2xl text-slate-300">-</p>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-slate-500">Credit Balance</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">$200</p>
          </div>
          <p className="text-2xl text-slate-300">=</p>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide text-slate-500">Account Balance</p>
            <p className="mt-2 text-4xl font-black text-emerald-700">$675</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-4xl text-emerald-700">✓</p>
        <p className="mt-2 text-sm font-semibold text-emerald-700">Bank balance fetched successfully</p>
      </div>

      <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span>🏦</span>
          <span>Axis Bank - 4736</span>
        </div>
        <p className="mt-3 text-3xl font-black text-emerald-600">INR 15,00,000.46</p>
      </article>

      <section>
        <h2 className="mb-3 text-xl font-bold text-slate-900">Sponsored Links</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sponsors.map((sponsor) => (
            <article key={sponsor.name} className="rounded-xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200">
              <div className="rounded-md bg-slate-100 py-2 font-bold text-slate-800">{sponsor.logo}</div>
              <p className="mt-2 text-xs text-slate-500">{sponsor.name}</p>
            </article>
          ))}
        </div>
      </section>

      <article className="flex items-center gap-4 rounded-xl border-l-4 border-amber-300 bg-amber-50 p-5">
        <span className="text-3xl">💡</span>
        <p className="flex-1 text-sm font-semibold text-slate-800">
          Grow your money with Best SIP Funds. Start with just Rs. 100.
        </p>
        <span className="text-xl text-slate-500">›</span>
      </article>
    </section>
  );
}
