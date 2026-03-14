import { useMemo, useState } from "react";

const seedGoals = [
  { id: 1, name: "Emergency Fund", icon: "🛟", target: 300000, saved: 180000, months: 10, priority: "high", category: "other", description: "6-month emergency reserve." },
  { id: 2, name: "Laptop Upgrade", icon: "💻", target: 120000, saved: 48000, months: 8, priority: "medium", category: "tech", description: "For freelance work upgrade." },
];

export default function Goals() {
  const [goals, setGoals] = useState(seedGoals);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    goalName: "",
    goalIcon: "🎯",
    targetAmount: "",
    currentSavings: "",
    targetMonths: "",
    priority: "medium",
    goalCategory: "",
    goalDescription: "",
  });

  const visibleGoals = useMemo(() => {
    if (filter === "all") return goals;
    if (filter === "completed") return goals.filter((goal) => goal.saved >= goal.target);
    return goals.filter((goal) => goal.saved < goal.target);
  }, [filter, goals]);

  const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
  const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
  const monthlyIncome = 75000;
  const monthlyExpenses = 48200;
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const completionRate = totalTarget ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const avgTimeline = goals.length
    ? Math.round(goals.reduce((sum, goal) => sum + goal.months, 0) / goals.length)
    : 0;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const target = Number(form.targetAmount);
    const saved = Number(form.currentSavings || 0);
    const months = Number(form.targetMonths);

    if (!form.goalName || !form.goalIcon || Number.isNaN(target) || target <= 0 || Number.isNaN(months) || months <= 0) {
      return;
    }

    setGoals((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: form.goalName,
        icon: form.goalIcon,
        target,
        saved,
        months,
        priority: form.priority,
        category: form.goalCategory,
        description: form.goalDescription,
      },
    ]);

    setForm({
      goalName: "",
      goalIcon: "🎯",
      targetAmount: "",
      currentSavings: "",
      targetMonths: "",
      priority: "medium",
      goalCategory: "",
      goalDescription: "",
    });
  };

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900">Future Goals & Financial Planning</h1>
        <p className="mt-1 text-sm text-slate-500">Plan your future and see what you can afford based on your financial trends</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["💰", "Monthly Income", `INR ${monthlyIncome.toLocaleString("en-IN")}`, "Based on recent transactions"],
          ["💸", "Monthly Expenses", `INR ${monthlyExpenses.toLocaleString("en-IN")}`, "Average spending"],
          ["💳", "Monthly Savings", `INR ${monthlySavings.toLocaleString("en-IN")}`, `${Math.round((monthlySavings / monthlyIncome) * 100)}% of income`],
          ["🎯", "Active Goals", String(goals.length), "Tracking progress"],
        ].map(([icon, label, value, note]) => (
          <article key={label} className="flex gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-black text-emerald-600">{value}</p>
              <p className="text-xs text-slate-500">{note}</p>
            </div>
          </article>
        ))}
      </div>

      <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Create a New Goal</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Goal Name *
            <input name="goalName" value={form.goalName} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Icon/Emoji *
            <input name="goalIcon" maxLength={2} value={form.goalIcon} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Target Amount (INR) *
            <input name="targetAmount" type="number" value={form.targetAmount} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Current Savings (INR)
            <input name="currentSavings" type="number" value={form.currentSavings} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Timeline (Months) *
            <input name="targetMonths" type="number" min="1" value={form.targetMonths} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Priority
            <select name="priority" value={form.priority} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2">
              <option value="low">🔵 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
          </label>
          <label className="md:col-span-2 text-sm font-medium text-slate-700">
            Description
            <textarea name="goalDescription" rows="2" value={form.goalDescription} onChange={handleChange} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="reset" onClick={() => setForm({ goalName: "", goalIcon: "🎯", targetAmount: "", currentSavings: "", targetMonths: "", priority: "medium", goalCategory: "", goalDescription: "" })} className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Clear</button>
            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Add Goal</button>
          </div>
        </form>
      </article>

      <section>
        <h2 className="text-xl font-bold text-slate-900">Your Goals</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["all", "All Goals"],
            ["active", "Active"],
            ["completed", "Completed"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                filter === key ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {visibleGoals.length === 0 ? (
            <article className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm ring-1 ring-slate-200 md:col-span-2">
              🎯 No goals yet. Create your first goal above!
            </article>
          ) : (
            visibleGoals.map((goal) => {
              const progress = Math.min(100, Math.round((goal.saved / goal.target) * 100));
              return (
                <article key={goal.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{goal.icon}</span>
                      <p className="font-bold text-slate-900">{goal.name}</p>
                    </div>
                    <span className="rounded px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600">{goal.priority}</span>
                  </div>
                  <p className="mb-2 text-sm text-slate-500">Target: INR {goal.target.toLocaleString("en-IN")}</p>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>Saved: INR {goal.saved.toLocaleString("en-IN")}</span>
                    <span>{progress}%</span>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-slate-900">What Can You Afford?</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg bg-slate-50 p-5">
            <h3 className="font-bold text-slate-900">Savings Projection (12 Months)</h3>
            <p className="mt-1 text-xs text-slate-500">Based on your current savings rate</p>
            <div className="mt-4 h-2 rounded-full bg-slate-200">
              <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700" />
            </div>
            <p className="mt-3 text-sm text-slate-600">Projected yearly savings: INR {(monthlySavings * 12).toLocaleString("en-IN")}</p>
          </article>
          <article className="rounded-lg bg-slate-50 p-5">
            <h3 className="font-bold text-slate-900">Monthly Savings Breakdown</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded bg-white p-3 ring-1 ring-slate-200"><p className="text-xs text-slate-500">Monthly</p><p className="font-bold">INR {monthlySavings.toLocaleString("en-IN")}</p></div>
              <div className="rounded bg-white p-3 ring-1 ring-slate-200"><p className="text-xs text-slate-500">Quarterly</p><p className="font-bold">INR {(monthlySavings * 3).toLocaleString("en-IN")}</p></div>
              <div className="rounded bg-white p-3 ring-1 ring-slate-200"><p className="text-xs text-slate-500">Yearly</p><p className="font-bold">INR {(monthlySavings * 12).toLocaleString("en-IN")}</p></div>
              <div className="rounded bg-white p-3 ring-1 ring-slate-200"><p className="text-xs text-slate-500">2 Years</p><p className="font-bold">INR {(monthlySavings * 24).toLocaleString("en-IN")}</p></div>
            </div>
            <div className="mt-4 rounded border-l-4 border-amber-400 bg-amber-50 p-3 text-sm text-slate-700">
              <p className="font-semibold">💡 Suggestions:</p>
              <ul className="mt-1 space-y-1 text-xs text-slate-600">
                <li>Start saving more to reach your goals faster</li>
                <li>Auto-transfer monthly surplus into goal buckets</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Key Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["📊", "Savings Rate", `${Math.round((monthlySavings / monthlyIncome) * 100)}%`, "Percentage of income saved"],
            ["⏱️", "Avg Goal Timeline", `${avgTimeline} mo`, "Average months to goal"],
            ["🎯", "Total Goal Amount", `INR ${totalTarget.toLocaleString("en-IN")}`, "Combined goal targets"],
            ["✅", "Completion Rate", `${completionRate}%`, "Total progress on all goals"],
          ].map(([icon, title, value, note]) => (
            <article key={title} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <span className="text-3xl">{icon}</span>
              <div>
                <p className="text-xs text-slate-500">{title}</p>
                <p className="text-xl font-black text-emerald-600">{value}</p>
                <p className="text-xs text-slate-500">{note}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <article className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
        © 2024 Personal Finance Platform. All rights reserved.
      </article>
    </section>
  );
}
