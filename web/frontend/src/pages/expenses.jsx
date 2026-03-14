import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useState } from "react";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

const periods = ["today", "weekly", "monthly", "yearly"];

const legendItems = [
  { label: "Food & Dining", color: "#3b82f6" },
  { label: "Transportation", color: "#ef4444" },
  { label: "Entertainment", color: "#fbbf24" },
  { label: "Utilities", color: "#a78bfa" },
  { label: "Shopping", color: "#14b8a6" },
  { label: "Other", color: "#c084fc" },
];

const categoryCards = [
  { icon: "🍔", name: "Food & Dining", percent: 30, amount: "INR 735.00", gradient: "from-blue-500 to-blue-700" },
  { icon: "🚗", name: "Transportation", percent: 20, amount: "INR 490.00", gradient: "from-rose-500 to-rose-700" },
  { icon: "🎬", name: "Entertainment", percent: 15, amount: "INR 367.50", gradient: "from-amber-400 to-amber-600" },
  { icon: "⚡", name: "Utilities", percent: 14, amount: "INR 343.00", gradient: "from-violet-400 to-violet-700" },
  { icon: "🛍️", name: "Shopping", percent: 12, amount: "INR 294.00", gradient: "from-teal-400 to-teal-700" },
  { icon: "📦", name: "Other", percent: 9, amount: "INR 220.50", gradient: "from-fuchsia-400 to-fuchsia-700" },
];

const daily = [
  { day: "Monday", amount: 450, width: 45 },
  { day: "Tuesday", amount: 320, width: 32 },
  { day: "Wednesday", amount: 580, width: 58 },
  { day: "Thursday", amount: 380, width: 38 },
  { day: "Friday", amount: 720, width: 72 },
];

export default function Expenses() {
  const [activePeriod, setActivePeriod] = useState("today");

  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    datasets: [
      {
        label: "Expenses Overview",
        data: [580, 620, 540, 690, 640, 710],
        borderColor: "#10B981",
        backgroundColor: "rgba(16,185,129,0.15)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const donutData = {
    labels: categoryCards.map((item) => item.name),
    datasets: [
      {
        data: [30, 20, 15, 14, 12, 9],
        backgroundColor: legendItems.map((item) => item.color),
      },
    ],
  };

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-slate-900">Expense Tracker</h1>
        <p className="mt-1 text-sm text-slate-500">Track your spending across different time periods</p>
      </header>

      <div className="flex flex-wrap gap-3">
        {periods.map((period) => (
          <button
            key={period}
            onClick={() => setActivePeriod(period)}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold capitalize ${
              activePeriod === period
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Expenses", "INR 2,450.00", "From last period", "text-rose-600"],
          ["Average Daily", "INR 816.67", "Per day", "text-slate-500"],
          ["Highest Category", "Housing", "INR 1,200.00", "text-slate-500"],
          ["Budget Status", "78%", "Under budget", "text-emerald-700"],
        ].map(([label, value, note, tone]) => (
          <article key={label} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black text-emerald-600">{value}</p>
            <p className={`mt-1 text-xs ${tone}`}>{note}</p>
          </article>
        ))}
      </div>

      <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Expenses Overview</h2>
          <div className="flex flex-wrap gap-3">
            {legendItems.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2 text-xs text-slate-600">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
        <div className="h-80">
          <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </article>

      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Category Breakdown</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categoryCards.map((item) => (
            <article key={item.name} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <p className="font-semibold text-slate-800">{item.name}</p>
              </div>
              <div className="mb-2 h-2 rounded-full bg-slate-200">
                <div className={`h-2 rounded-full bg-gradient-to-r ${item.gradient}`} style={{ width: `${item.percent}%` }} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">{item.percent}%</span>
                <span className="font-bold text-emerald-600">{item.amount}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Daily Breakdown</h2>
        <div className="space-y-3">
          {daily.map((item) => (
            <article key={item.day} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <div className="mb-2 flex items-center justify-between text-sm">
                <p className="font-semibold text-slate-800">{item.day}</p>
                <p className="font-bold text-emerald-600">INR {item.amount}</p>
              </div>
              <div className="h-1.5 rounded-full bg-slate-200">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700" style={{ width: `${item.width}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <article className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
        © 2024 Personal Finance Platform. All rights reserved.
      </article>

      <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Category Distribution</h2>
        <div className="mx-auto max-w-sm">
          <Doughnut data={donutData} />
        </div>
      </article>
    </section>
  );
}
