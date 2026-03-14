import { Home, Wallet, PieChart, Target, PlusCircle, ArrowLeftRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "home" },
  { icon: Wallet, label: "Account Balance", path: "balance" },
  { icon: PieChart, label: "Expenses", path: "expenses" },
  { icon: Target, label: "Goals", path: "goals" },
  { icon: PlusCircle, label: "Cash Entry", path: "cashentry" },
  { icon: ArrowLeftRight, label: "Transactions", path: "transactions" },
];

export default function Sidebar({ currentSection = "home" }) {
  const navigate = useNavigate();

  return (
    <aside className="w-72 h-screen sticky top-0 bg-white/90 backdrop-blur border-r border-slate-200 p-6">
      <button
        onClick={() => navigate("/")}
        className="flex w-full items-center gap-3 rounded-2xl p-2 text-left hover:bg-emerald-50 transition-colors"
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-lime-500" />
        <div>
          <p className="text-xl font-black tracking-tight text-emerald-700">FinEducate</p>
          <p className="text-xs text-slate-500">Money habits made clear</p>
        </div>
      </button>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const active = item.path === currentSection;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(`/dashboard?section=${item.path}`)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                active
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-transparent text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
