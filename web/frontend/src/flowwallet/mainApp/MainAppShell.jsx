import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Bot, FileText, Goal, Home, Landmark, PenSquare, PieChart, Receipt, User, Wallet } from "lucide-react";
import { getDashboardContext } from "../../services/backendApi";
import MainAppSkeleton from "./MainAppSkeleton";
import HomeTab from "./tabs/HomeTab";
import GoalsTab from "./tabs/GoalsTab";
import BudgetTab from "./tabs/BudgetTab";
import AiTab from "./tabs/AiTab";
import ProfileTab from "./tabs/ProfileTab";
import TransactionsPage from "./legacyPages/TransactionsPage";
import TaxesPage from "./legacyPages/TaxesPage";
import AccountBalance from "../../pages/AccountBalance";
import Expenses from "../../pages/Expenses";
import ManualEntry from "../../pages/ManualEntry";
import GoalsPlanner from "../../pages/Goals";

const PROFILE_STORAGE_KEY = "flowwallet.onboarding.profile";

function loadStoredSnapshot() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function normalizeContext(context, fallbackUser) {
  const user = context?.user || fallbackUser || null;
  const insights = context?.inferred?.insights || context?.inferred || {};

  return {
    user,
    accounts: context?.accounts || [],
    transactions: context?.recentTransactions || [],
    insights,
  };
}

function AppBottomTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { to: "/app/home", label: "Home", icon: Home },
    { to: "/app/budget", label: "Budget", icon: PieChart },
    { to: "/app/goals", label: "Goals", icon: Goal },
    { to: "/app/ai", label: "AI", icon: Bot },
    { to: "/app/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between px-2 py-2">
        {items.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`grid place-items-center gap-0.5 rounded-lg px-3 py-1 ${active ? "text-teal-700" : "text-slate-500"}`}
            >
              <Icon size={17} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function DesktopSideRail() {
  const navigate = useNavigate();
  const location = useLocation();

  const groups = [
    {
      title: "Core",
      items: [
        { to: "/app/home", label: "Home Dashboard", icon: Home },
        { to: "/app/budget", label: "Budget", icon: PieChart },
        { to: "/app/goals", label: "Goals", icon: Goal },
        { to: "/app/ai", label: "AI Chat", icon: Bot },
      ],
    },
    {
      title: "Pages",
      items: [
        { to: "/app/account-balance", label: "Account Balance", icon: Landmark },
        { to: "/app/expenses", label: "Expenses", icon: Wallet },
        { to: "/app/transactions", label: "Transactions", icon: Receipt },
        { to: "/app/manual-entry", label: "Manual Entry", icon: PenSquare },
        { to: "/app/taxes", label: "Taxes", icon: FileText },
        { to: "/app/goals-planner", label: "Goals Planner", icon: Goal },
      ],
    },
    {
      title: "Account",
      items: [
        { to: "/app/profile", label: "User Profile", icon: User },
      ],
    },
  ];

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-black text-slate-900">FlowWallet</p>
        <div className="space-y-4">
          {groups.map((group) => (
            <section key={group.title}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">{group.title}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = location.pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      onClick={() => navigate(item.to)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold ${active ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      <Icon size={15} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function MainAppShell() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [lastSynced, setLastSynced] = useState("");

  const navSnapshot = location.state?.snapshot || null;
  const storedSnapshot = useMemo(() => loadStoredSnapshot(), []);
  const snapshot = navSnapshot || storedSnapshot;

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const userId = snapshot?.profile?.user?.id;
        if (!userId) {
          throw new Error("No linked user found from onboarding.");
        }

        const context = await getDashboardContext(userId);
        if (!active) return;

        setDashboard(normalizeContext(context, snapshot?.profile?.user || null));
        setLastSynced(new Date().toISOString());
      } catch (err) {
        if (!active) return;
        setError(err.message || "Unable to load dashboard data.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, [snapshot]);

  const data = dashboard || normalizeContext(null, snapshot?.profile?.user || null);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-4 lg:pb-8">
      <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <DesktopSideRail />
        <main>
          <header className="mb-4 rounded-2xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Main App</p>
            {loading ? <p className="text-sm font-semibold text-slate-700">Loading your full financial profile...</p> : null}
            {!loading && !error ? (
              <p className="text-sm font-semibold text-slate-700">
                Dashboard synced {lastSynced ? new Date(lastSynced).toLocaleTimeString() : "just now"}
              </p>
            ) : null}
            {error ? <p className="text-sm font-semibold text-rose-700">{error}</p> : null}
          </header>

          {loading ? (
            <MainAppSkeleton />
          ) : (
            <Routes>
              <Route path="home" element={<HomeTab data={data} />} />
              <Route path="budget" element={<BudgetTab data={data} />} />
              <Route path="goals" element={<GoalsTab data={data} />} />
              <Route path="ai" element={<AiTab data={data} />} />
              <Route path="profile" element={<ProfileTab data={data} />} />

              <Route path="account-balance" element={<AccountBalance />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="transactions" element={<TransactionsPage data={data} />} />
              <Route path="manual-entry" element={<ManualEntry />} />
              <Route path="taxes" element={<TaxesPage data={data} />} />
              <Route path="goals-planner" element={<GoalsPlanner />} />

              <Route path="*" element={<Navigate to="home" replace />} />
            </Routes>
          )}
        </main>
      </div>

      <AppBottomTabs />
    </div>
  );
}
