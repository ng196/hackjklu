import { useMemo, useState } from "react";

function formatInr(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// New Regime FY 2025-26 slabs
const NEW_SLABS = [
  { min: 0, max: 400000, rate: 0, label: "Up to ₹4,00,000" },
  { min: 400000, max: 800000, rate: 5, label: "₹4,00,001 – ₹8,00,000" },
  { min: 800000, max: 1200000, rate: 10, label: "₹8,00,001 – ₹12,00,000" },
  { min: 1200000, max: 1600000, rate: 15, label: "₹12,00,001 – ₹16,00,000" },
  { min: 1600000, max: 2000000, rate: 20, label: "₹16,00,001 – ₹20,00,000" },
  { min: 2000000, max: 2400000, rate: 25, label: "₹20,00,001 – ₹24,00,000" },
  { min: 2400000, max: Infinity, rate: 30, label: "Above ₹24,00,000" },
];

// Old Regime slabs
const OLD_SLABS = [
  { min: 0, max: 250000, rate: 0, label: "Up to ₹2,50,000" },
  { min: 250000, max: 500000, rate: 5, label: "₹2,50,001 – ₹5,00,000" },
  { min: 500000, max: 1000000, rate: 20, label: "₹5,00,001 – ₹10,00,000" },
  { min: 1000000, max: Infinity, rate: 30, label: "Above ₹10,00,000" },
];

function computeSlabTax(income, slabs) {
  let totalTax = 0;
  const breakdown = [];
  for (const slab of slabs) {
    if (income <= slab.min) {
      breakdown.push({ ...slab, taxable: 0, tax: 0 });
      continue;
    }
    const taxable = Math.min(income, slab.max) - slab.min;
    const tax = (taxable * slab.rate) / 100;
    breakdown.push({ ...slab, taxable, tax });
    totalTax += tax;
  }
  return { totalTax, breakdown };
}

const TIPS = [
  { icon: "📚", title: "Section 80C", desc: "PPF, ELSS, Life Insurance, NSC — up to ₹1,50,000 deduction (Old Regime).", save: "Max Saving: ₹46,800" },
  { icon: "💪", title: "Health Insurance (80D)", desc: "Premium for self, family & parents. Up to ₹75,000 (Old Regime).", save: "Max Saving: ₹23,400" },
  { icon: "🏠", title: "Home Loan Interest", desc: "Section 24 — up to ₹2,00,000 interest deduction (Old Regime).", save: "Max Saving: ₹62,400" },
  { icon: "🎯", title: "NPS (80CCD)", desc: "Additional ₹50,000 over 80C for NPS. Available in both regimes.", save: "Max Saving: ₹15,600" },
];

export default function TaxesPage({ data }) {
  const estimatedIncome = Number(data?.insights?.last30Days?.credit || 0) * 12;

  const [regime, setRegime] = useState("new");
  const [income, setIncome] = useState(Math.max(estimatedIncome, 1500000));
  const [ded80C, setDed80C] = useState(150000);
  const [ded80D, setDed80D] = useState(25000);
  const [homeLoan, setHomeLoan] = useState(0);

  const calculation = useMemo(() => {
    const slabs = regime === "new" ? NEW_SLABS : OLD_SLABS;
    const stdDeduction = 75000;

    const taxableIncome =
      regime === "new"
        ? Math.max(0, income - stdDeduction)
        : Math.max(0, income - stdDeduction - Math.min(ded80C, 150000) - Math.min(ded80D, 75000) - Math.min(homeLoan, 200000));

    const { totalTax: incomeTax, breakdown } = computeSlabTax(taxableIncome, slabs);

    // Rebate u/s 87A
    let rebate = 0;
    if (regime === "new" && taxableIncome <= 1200000) {
      rebate = Math.min(incomeTax, 60000);
    } else if (regime === "old" && taxableIncome <= 500000) {
      rebate = Math.min(incomeTax, 12500);
    }

    const afterRebate = incomeTax - rebate;
    const cess = afterRebate * 0.04;
    const totalTax = afterRebate + cess;
    const takeHome = income - totalTax;
    const effectiveRate = income > 0 ? ((totalTax / income) * 100).toFixed(1) : "0";

    return { taxableIncome, incomeTax, rebate, cess, totalTax, takeHome, effectiveRate, breakdown };
  }, [regime, income, ded80C, ded80D, homeLoan]);

  const { taxableIncome, incomeTax, rebate, cess, totalTax, takeHome, effectiveRate, breakdown } = calculation;

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-2xl font-black text-slate-900">💼 Tax Summary</h2>
        <p className="text-sm text-slate-500">Interactive tax calculation — FY 2025-26</p>
      </header>

      {/* Income Editor */}
      <article className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h3 className="mb-3 text-sm font-bold text-slate-900">📝 Your Income Details</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="Annual Gross Income (₹)" value={income} onChange={setIncome} />
          <NumberField label="80C Deductions (₹)" value={ded80C} onChange={setDed80C} max={150000} />
          <NumberField label="Health Insurance 80D (₹)" value={ded80D} onChange={setDed80D} max={75000} />
          <NumberField label="Home Loan Interest (₹)" value={homeLoan} onChange={setHomeLoan} max={200000} />
        </div>
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tax Regime</p>
          <div className="flex gap-2">
            {["new", "old"].map((r) => (
              <button
                key={r}
                onClick={() => setRegime(r)}
                className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-xs font-bold transition-all ${regime === r ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600"
                  }`}
              >
                {r === "new" ? "New Regime (Default)" : "Old Regime"}
              </button>
            ))}
          </div>
        </div>
      </article>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Taxable Income" value={formatInr(taxableIncome)} color="emerald" note={regime === "new" ? "After ₹75K std deduction" : "After all deductions"} />
        <SummaryCard label="Total Tax" value={formatInr(totalTax)} color="rose" note={`Effective rate: ${effectiveRate}%`} />
        <SummaryCard label="Take Home" value={formatInr(takeHome)} color="sky" note={`Monthly: ${formatInr(takeHome / 12)}`} />
      </div>

      {/* Tax Breakdown */}
      <article className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h3 className="mb-4 text-sm font-bold text-slate-900">📊 Tax Breakdown</h3>
        <div className="space-y-2">
          <BreakdownRow icon="📋" label="Taxable Income" desc="After deductions" value={formatInr(taxableIncome)} />
          <BreakdownRow icon="🏛️" label="Income Tax (Slabs)" desc={`${breakdown.length} slabs`} value={formatInr(incomeTax)} />
          {rebate > 0 && <BreakdownRow icon="🎁" label="Rebate u/s 87A" desc="Tax relief" value={`-${formatInr(rebate)}`} isGreen />}
          <BreakdownRow icon="📐" label="Health & Education Cess" desc="4% on tax" value={formatInr(cess)} />
          <div className="border-t-2 border-teal-500 pt-3">
            <BreakdownRow icon="💸" label="Total Tax Payable" desc={`Effective: ${effectiveRate}%`} value={formatInr(totalTax)} isBold />
          </div>
        </div>

        {/* Visual Bar */}
        {incomeTax > 0 && (
          <div className="mt-4">
            <div className="flex h-3 overflow-hidden rounded-full bg-slate-200">
              {breakdown
                .filter((b) => b.tax > 0)
                .map((b, i) => {
                  const colors = ["bg-emerald-500", "bg-sky-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-pink-500", "bg-indigo-500"];
                  return (
                    <div
                      key={i}
                      className={`${colors[i % colors.length]} transition-all`}
                      style={{ width: `${(b.tax / Math.max(incomeTax, 1)) * 100}%` }}
                      title={`${b.rate}%: ${formatInr(b.tax)}`}
                    />
                  );
                })}
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              {breakdown
                .filter((b) => b.tax > 0)
                .map((b, i) => {
                  const dotColors = ["bg-emerald-500", "bg-sky-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-pink-500", "bg-indigo-500"];
                  return (
                    <span key={i} className="flex items-center gap-1 text-xs text-slate-500">
                      <span className={`inline-block h-2.5 w-2.5 rounded-sm ${dotColors[i % dotColors.length]}`} />
                      {b.rate}%: {formatInr(b.tax)}
                    </span>
                  );
                })}
            </div>
          </div>
        )}
      </article>

      {/* Slab Table */}
      <article className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h3 className="mb-3 text-sm font-bold text-slate-900">
          📋 {regime === "new" ? "New Regime" : "Old Regime"} Slabs
        </h3>
        <div className="space-y-1">
          <div className="grid grid-cols-3 gap-2 border-b-2 border-slate-200 pb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
            <span>Range</span>
            <span className="text-center">Rate</span>
            <span className="text-right">Tax</span>
          </div>
          {breakdown.map((b, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 gap-2 rounded-lg py-2 text-sm ${b.tax > 0 ? "bg-teal-50 px-2 font-semibold text-slate-900" : "text-slate-500"}`}
            >
              <span className="text-xs">{b.label}</span>
              <span className="text-center text-xs">{b.rate === 0 ? "Nil" : `${b.rate}%`}</span>
              <span className="text-right text-xs font-bold">{b.tax > 0 ? formatInr(b.tax) : "—"}</span>
            </div>
          ))}
        </div>
      </article>

      {/* Tips */}
      <section>
        <h3 className="mb-3 text-sm font-bold text-slate-900">💡 Tax Saving Tips</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {TIPS.map((tip) => (
            <article key={tip.title} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200 transition-all hover:shadow-md">
              <p className="text-xl">{tip.icon}</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{tip.title}</p>
              <p className="mt-1 text-xs text-slate-500">{tip.desc}</p>
              <p className="mt-2 text-xs font-bold text-teal-600">{tip.save}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function NumberField({ label, value, onChange, max }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          let v = Number(e.target.value) || 0;
          if (max !== undefined) v = Math.min(v, max);
          onChange(v);
        }}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
      />
    </div>
  );
}

function SummaryCard({ label, value, color, note }) {
  const colorMap = {
    emerald: "text-emerald-700",
    rose: "text-rose-700",
    sky: "text-sky-700",
  };

  return (
    <article className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-black ${colorMap[color]}`}>{value}</p>
      {note && <p className="mt-1 text-xs text-slate-400">{note}</p>}
    </article>
  );
}

function BreakdownRow({ icon, label, desc, value, isGreen, isBold }) {
  return (
    <div className="flex items-center justify-between rounded-lg py-1.5">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <div>
          <p className={`text-sm ${isBold ? "font-black" : "font-semibold"} text-slate-800`}>{label}</p>
          <p className="text-[11px] text-slate-400">{desc}</p>
        </div>
      </div>
      <p className={`text-sm font-black ${isGreen ? "text-emerald-600" : isBold ? "text-rose-600 text-lg" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
