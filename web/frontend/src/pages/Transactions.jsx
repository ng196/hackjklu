const history = [
  { id: 1, icon: "👤", label: "Create Account", date: "Feb 4, 2024", amount: "+INR 4,150.00", tone: "text-emerald-700" },
  { id: 2, icon: "💳", label: "Credit Card", date: "Feb 3, 2024", amount: "-INR 12,500.00", tone: "text-rose-600" },
];

const cards = [
  { type: "Credit Card", number: "**** **** **** 4829", name: "John Doe", exp: "12/25", color: "from-emerald-500 to-emerald-700" },
  { type: "Debit Card", number: "**** **** **** 3421", name: "John Doe", exp: "08/24", color: "from-rose-500 to-rose-700" },
];

export default function Transactions() {
  return (
    <section className="space-y-6">
      <article className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white shadow-lg shadow-emerald-500/30">
        <p className="text-xs uppercase tracking-wider text-emerald-100">Account Balance</p>
        <p className="mt-2 text-4xl font-black">INR 24,650.00</p>
        <p className="mt-2 text-sm text-emerald-100">Balance as of Feb 4, 2024</p>
      </article>

      <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Transaction History</h2>
        <ul className="mt-4 space-y-3">
          {history.map((tx) => (
            <li key={tx.id} className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-white text-2xl ring-1 ring-slate-200">{tx.icon}</div>
              <div>
                <p className="font-semibold text-slate-800">{tx.label}</p>
                <p className="text-xs text-slate-500">{tx.date}</p>
              </div>
              <p className={`ml-auto font-bold ${tx.tone}`}>{tx.amount}</p>
            </li>
          ))}
        </ul>
      </article>

      <section>
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Transactions</h2>
        <div className="space-y-4">
          {cards.map((card) => (
            <article key={card.number} className={`rounded-2xl bg-gradient-to-br ${card.color} p-6 text-white shadow-md`}>
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">{card.type}</p>
                <span>●●●●</span>
              </div>
              <p className="mb-4 text-xl font-bold tracking-widest">{card.number}</p>
              <div className="flex items-end justify-between text-sm">
                <div>
                  <p className="text-xs uppercase text-white/80">Card Holder</p>
                  <p className="font-semibold">{card.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-white/80">Expires</p>
                  <p className="font-semibold">{card.exp}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
