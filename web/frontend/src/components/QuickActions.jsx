import { useNavigate } from "react-router-dom";

const actions = [
  { label: "Add Expense", section: "cashentry" },
  { label: "Review Goals", section: "goals" },
  { label: "Open Transactions", section: "transactions" },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
      <h2 className="text-lg font-bold">Quick Actions</h2>
      <p className="text-sm text-slate-300 mt-1">Jump directly to your most-used flows.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <button
            key={action.section}
            onClick={() => navigate(`/dashboard?section=${action.section}`)}
            className="rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-medium hover:bg-white/20"
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}
