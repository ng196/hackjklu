import { useState } from "react";

export default function ManualEntry() {
  const [tab, setTab] = useState("expense");
  const [entries, setEntries] = useState([]);
  const [expense, setExpense] = useState({ amount: "", category: "", paymentMethod: "", date: "", time: "", merchant: "", description: "", tags: "" });
  const [income, setIncome] = useState({ amount: "", source: "", method: "", date: "", time: "", description: "", tags: "" });

  const submitExpense = (event) => {
    event.preventDefault();
    const value = Number(expense.amount);
    if (!expense.description || Number.isNaN(value) || value <= 0) {
      return;
    }
    setEntries((prev) => [
      {
        type: "expense",
        title: expense.description,
        amount: value,
        details: `${expense.category || "category"} • ${expense.date || "today"}`,
      },
      ...prev,
    ]);
    setExpense({ amount: "", category: "", paymentMethod: "", date: "", time: "", merchant: "", description: "", tags: "" });
  };

  const submitIncome = (event) => {
    event.preventDefault();
    const value = Number(income.amount);
    if (!income.description || Number.isNaN(value) || value <= 0) {
      return;
    }
    setEntries((prev) => [
      {
        type: "income",
        title: income.description,
        amount: value,
        details: `${income.source || "source"} • ${income.date || "today"}`,
      },
      ...prev,
    ]);
    setIncome({ amount: "", source: "", method: "", date: "", time: "", description: "", tags: "" });
  };

  const expenseFields = [
    ["Category *", "category", "select", ["food", "transport", "entertainment", "utilities", "shopping", "health", "education", "personal", "home", "other"]],
    ["Payment Method *", "paymentMethod", "select", ["cash", "credit", "debit", "upi", "bank", "wallet"]],
    ["Date *", "date", "date"],
    ["Time", "time", "time"],
    ["Merchant/Vendor", "merchant", "text"],
  ];

  const incomeFields = [
    ["Income Source *", "source", "select", ["salary", "freelance", "investment", "bonus", "refund", "gift", "other"]],
    ["Received By", "method", "select", ["cash", "bank", "upi", "check", "card"]],
    ["Date *", "date", "date"],
    ["Time", "time", "time"],
  ];

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900">Manual Transaction Entry</h1>
        <p className="mt-1 text-sm text-slate-500">Add transactions that cannot be automatically detected</p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("expense")}
          className={`rounded-lg border px-4 py-2 text-sm font-semibold ${tab === "expense" ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-white text-slate-700"}`}
        >
          💸 Add Expense
        </button>
        <button
          type="button"
          onClick={() => setTab("income")}
          className={`rounded-lg border px-4 py-2 text-sm font-semibold ${tab === "income" ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-white text-slate-700"}`}
        >
          💰 Add Income
        </button>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {tab === "expense" ? (
          <form onSubmit={submitExpense} className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2 text-sm font-medium text-slate-700">
              Amount *
              <div className="mt-1.5 flex rounded-lg border border-slate-300">
                <span className="grid place-items-center bg-slate-100 px-3 text-sm text-slate-600">INR</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={expense.amount}
                  onChange={(e) => setExpense((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full rounded-r-lg px-3 py-2"
                />
              </div>
            </label>

            {expenseFields.map(([label, key, type, options]) => (
              <label key={key} className="text-sm font-medium text-slate-700">
                {label}
                {type === "select" ? (
                  <select value={expense[key]} required={label.includes("*")} onChange={(e) => setExpense((prev) => ({ ...prev, [key]: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="">Select option</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input type={type} value={expense[key]} onChange={(e) => setExpense((prev) => ({ ...prev, [key]: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" />
                )}
              </label>
            ))}

            <label className="md:col-span-2 text-sm font-medium text-slate-700">
              Description *
              <textarea required rows="3" value={expense.description} onChange={(e) => setExpense((prev) => ({ ...prev, description: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <label className="md:col-span-2 text-sm font-medium text-slate-700">
              Tags
              <input value={expense.tags} onChange={(e) => setExpense((prev) => ({ ...prev, tags: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="e.g. recurring, travel" />
            </label>

            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="reset" onClick={() => setExpense({ amount: "", category: "", paymentMethod: "", date: "", time: "", merchant: "", description: "", tags: "" })} className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Clear</button>
              <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Add Expense</button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitIncome} className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2 text-sm font-medium text-slate-700">
              Amount *
              <div className="mt-1.5 flex rounded-lg border border-slate-300">
                <span className="grid place-items-center bg-slate-100 px-3 text-sm text-slate-600">INR</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={income.amount}
                  onChange={(e) => setIncome((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full rounded-r-lg px-3 py-2"
                />
              </div>
            </label>

            {incomeFields.map(([label, key, type, options]) => (
              <label key={key} className="text-sm font-medium text-slate-700">
                {label}
                {type === "select" ? (
                  <select value={income[key]} required={label.includes("*")} onChange={(e) => setIncome((prev) => ({ ...prev, [key]: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2">
                    <option value="">Select option</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input type={type} value={income[key]} onChange={(e) => setIncome((prev) => ({ ...prev, [key]: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" />
                )}
              </label>
            ))}

            <label className="md:col-span-2 text-sm font-medium text-slate-700">
              Description *
              <textarea required rows="3" value={income.description} onChange={(e) => setIncome((prev) => ({ ...prev, description: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <label className="md:col-span-2 text-sm font-medium text-slate-700">
              Tags
              <input value={income.tags} onChange={(e) => setIncome((prev) => ({ ...prev, tags: e.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="e.g. monthly, bonus" />
            </label>

            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="reset" onClick={() => setIncome({ amount: "", source: "", method: "", date: "", time: "", description: "", tags: "" })} className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Clear</button>
              <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Add Income</button>
            </div>
          </form>
        )}
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Recent Manual Entries</h2>
        {entries.length === 0 ? (
          <article className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">
            📝 No manual entries yet. Add your first transaction above!
          </article>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry, index) => (
              <li key={`${entry.title}-${index}`} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                <div>
                  <p className="font-semibold text-slate-800">{entry.title}</p>
                  <p className="text-xs text-slate-500">{entry.details}</p>
                </div>
                <p className={`font-bold ${entry.type === "income" ? "text-emerald-700" : "text-rose-600"}`}>
                  {entry.type === "income" ? "+" : "-"}INR {entry.amount}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <article className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
        © 2024 Personal Finance Platform. All rights reserved.
      </article>
    </section>
  );
}
