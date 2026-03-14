import { useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Building2,
  ChartPie,
  CircleDollarSign,
  CreditCard,
  Gift,
  Goal,
  Home,
  IndianRupee,
  MessageCircle,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Wallet,
} from "lucide-react";

const banks = ["Axis Bank", "HDFC Bank", "SBI", "ICICI", "Kotak", "Yes Bank", "IndusInd", "IDFC First"];

const detectedCards = [
  { id: "hdfc-credit", name: "HDFC Millennia", type: "Credit", last4: "4829" },
  { id: "icici-debit", name: "ICICI Coral", type: "Debit", last4: "3910" },
  { id: "axis-credit", name: "Axis Neo", type: "Credit", last4: "7701" },
];

const starterGoals = [
  { id: "vacation", name: "Vacation", emoji: "✈️" },
  { id: "car", name: "New Car", emoji: "🚗" },
  { id: "home", name: "Home Downpayment", emoji: "🏠" },
  { id: "emergency", name: "Emergency Fund", emoji: "🛟" },
  { id: "wedding", name: "Wedding", emoji: "💍" },
];

function Container({ title, subtitle, children, showBack = false, backTo = "/" }) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-24 pt-4">
      <header className="mb-5">
        {showBack ? (
          <button
            onClick={() => navigate(backTo)}
            className="mb-3 inline-flex items-center gap-1 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700"
          >
            <ArrowRight size={12} className="rotate-180" />
            Back
          </button>
        ) : null}
        {title ? <h1 className="text-2xl font-black tracking-tight text-slate-900">{title}</h1> : null}
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </header>
      {children}
    </div>
  );
}

function FloatingAssistant() {
  return (
    <button
      type="button"
      className="fixed bottom-20 right-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-600/30"
      title="Ask AI assistant"
    >
      <MessageCircle size={20} />
    </button>
  );
}

function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-teal-50">
      <Container>
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
            <Wallet />
          </div>
          <p className="text-3xl font-black tracking-tight text-slate-900">FlowWallet</p>
          <p className="mt-2 text-sm text-slate-600">Your money, one flow</p>

          <button
            onClick={() => navigate("/onboarding/banks")}
            className="mt-8 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
          >
            Start Free - Connect Banks
          </button>
          <button onClick={() => navigate("/north")} className="mt-3 text-sm font-semibold text-teal-700">
            I already have an account
          </button>
        </div>
      </Container>
      <FloatingAssistant />
    </div>
  );
}

function OnboardingHeader({ step }) {
  const percent = Math.round((step / 3) * 100);
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <span>Step {step} of 3</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function OnboardingBanks() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);

  const filtered = useMemo(
    () => banks.filter((bank) => bank.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const toggle = (bank) => {
    setSelected((prev) => (prev.includes(bank) ? prev.filter((item) => item !== bank) : [...prev, bank]));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Container title="Choose Banks" subtitle="Link 1-3 accounts in under a minute" showBack backTo="/">
        <OnboardingHeader step={1} />
        <label className="relative mb-4 block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search banks"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm"
          />
        </label>

        <div className="space-y-2">
          {filtered.map((bank) => {
            const isSelected = selected.includes(bank);
            return (
              <button
                key={bank}
                onClick={() => toggle(bank)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${
                  isSelected ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-white"
                }`}
              >
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Building2 size={15} />
                  {bank}
                </span>
                <span className="text-xs font-bold text-teal-700">Connect securely</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigate("/onboarding/cards")}
          className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
        >
          Continue
        </button>
      </Container>
      <FloatingAssistant />
    </div>
  );
}

function OnboardingCards() {
  const navigate = useNavigate();
  const [active, setActive] = useState([]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Container title="Choose Cards" subtitle="Track card-wise spending with one toggle" showBack backTo="/onboarding/banks">
        <OnboardingHeader step={2} />

        <div className="space-y-3">
          {detectedCards.map((card) => {
            const on = active.includes(card.id);
            return (
              <article key={card.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs text-slate-500">{card.type} Card</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{card.name}</p>
                <p className="text-xs text-slate-500">**** {card.last4}</p>
                <button
                  onClick={() => setActive((prev) => (on ? prev.filter((id) => id !== card.id) : [...prev, card.id]))}
                  className={`mt-3 rounded-lg px-3 py-1.5 text-xs font-bold ${
                    on ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {on ? "Added" : "Add this card"}
                </button>
              </article>
            );
          })}
        </div>

        <button className="mt-3 w-full rounded-xl border border-dashed border-slate-300 bg-white py-2 text-sm font-semibold text-slate-700">
          + Manually add new card
        </button>
        <button
          onClick={() => navigate("/onboarding/goals")}
          className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
        >
          Continue
        </button>
      </Container>
      <FloatingAssistant />
    </div>
  );
}

function OnboardingGoals() {
  const navigate = useNavigate();
  const [targets, setTargets] = useState({});

  return (
    <div className="min-h-screen bg-slate-50">
      <Container title="Choose Goals" subtitle="Set 1-2 goals to unlock personalized savings" showBack backTo="/onboarding/cards">
        <OnboardingHeader step={3} />

        <div className="flex gap-3 overflow-x-auto pb-2">
          {starterGoals.map((goal) => (
            <article key={goal.id} className="min-w-[200px] rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              <p className="text-2xl">{goal.emoji}</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{goal.name}</p>
              <label className="mt-2 block text-xs text-slate-500">Set target</label>
              <input
                placeholder="INR amount"
                value={targets[goal.id] || ""}
                onChange={(event) => setTargets((prev) => ({ ...prev, [goal.id]: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </article>
          ))}
        </div>

        <button
          onClick={() => navigate("/north")}
          className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
        >
          Finish Setup
        </button>
        <button onClick={() => navigate("/north")} className="mt-3 w-full text-sm font-semibold text-slate-600">
          Skip for now
        </button>
      </Container>
      <FloatingAssistant />
    </div>
  );
}

function NorthHome() {
  return (
    <Container title="North" subtitle="Your daily money command center">
      <article className="rounded-3xl bg-gradient-to-br from-teal-500 to-cyan-500 p-5 text-white">
        <p className="text-xs uppercase tracking-wide text-teal-100">Total Balance</p>
        <p className="mt-1 text-4xl font-black">INR 86,940.20</p>
        <p className="mt-2 text-xs text-teal-100">Auto-refreshed just now</p>
      </article>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {[
          ["Savings", "INR 24,000"],
          ["Salary", "INR 38,420"],
          ["Credit", "INR -11,900"],
          ["Wallet", "INR 1,220"],
        ].map(([name, value]) => (
          <article key={name} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <p className="text-xs text-slate-500">{name}</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </div>

      <article className="mt-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs text-slate-500">Monthly summary</p>
        <div className="mt-2 flex justify-between text-sm">
          <span>Spent this month</span>
          <span className="font-bold text-rose-600">INR 18,200</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span>Left to budget</span>
          <span className="font-bold text-teal-700">INR 11,800</span>
        </div>
      </article>

      <button className="fixed bottom-24 left-1/2 z-20 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white shadow-lg">
        Transfer
      </button>
    </Container>
  );
}

function TasksScreen() {
  const [done, setDone] = useState([]);
  const tasks = [
    "Pay electricity bill",
    "Transfer to savings",
    "Review last week's spending",
    "Add manual cash expense",
    "Check goal progress",
  ];

  return (
    <Container title="Monthly Tasks" subtitle="Smart nudges based on your flow">
      <div className="space-y-2">
        {tasks.map((task) => {
          const isDone = done.includes(task);
          return (
            <article key={task} className="flex items-center justify-between rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <p className={`text-sm ${isDone ? "text-slate-400 line-through" : "text-slate-800"}`}>{task}</p>
              <button
                onClick={() => setDone((prev) => (isDone ? prev.filter((item) => item !== task) : [...prev, task]))}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                  isDone ? "bg-slate-100 text-slate-500" : "bg-teal-600 text-white"
                }`}
              >
                {isDone ? "Done" : "Mark Done"}
              </button>
            </article>
          );
        })}
      </div>
    </Container>
  );
}

function TransferScreen() {
  return (
    <Container title="Transfer Tools" subtitle="Move money in 3 seconds">
      <div className="grid grid-cols-2 gap-3">
        {[
          ["UPI Transfer", Send],
          ["Bank Transfer", Building2],
          ["Split Bill", CreditCard],
          ["Request Money", CircleDollarSign],
        ].map(([label, Icon]) => (
          <button key={label} className="rounded-xl bg-white p-4 text-left ring-1 ring-slate-200">
            <Icon size={16} className="text-teal-600" />
            <p className="mt-2 text-sm font-bold text-slate-800">{label}</p>
          </button>
        ))}
      </div>

      <article className="mt-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs text-slate-500">Recent contacts</p>
        <div className="mt-2 flex gap-2 text-xs">
          {[
            "Amit",
            "Riya",
            "Dev",
            "Nihar",
          ].map((name) => (
            <span key={name} className="rounded-full bg-slate-100 px-3 py-1.5">{name}</span>
          ))}
        </div>
      </article>
      <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white">
        <QrCode size={14} />
        Scan QR
      </button>
    </Container>
  );
}

function BudgetScreen() {
  const [mode, setMode] = useState("simple");
  const categories = ["Food", "Transport", "Shopping", "Bills", "Health", "Entertainment"];

  return (
    <Container title="Make Budget" subtitle="Position Action to Budget">
      <article className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs text-slate-500">Both Preferred</p>
        <div className="mt-2 inline-flex rounded-lg bg-slate-100 p-1 text-xs font-bold">
          <button
            onClick={() => setMode("zero")}
            className={`rounded-md px-3 py-1.5 ${mode === "zero" ? "bg-white text-teal-700" : "text-slate-600"}`}
          >
            Zero-Based
          </button>
          <button
            onClick={() => setMode("simple")}
            className={`rounded-md px-3 py-1.5 ${mode === "simple" ? "bg-white text-teal-700" : "text-slate-600"}`}
          >
            Simple %
          </button>
        </div>
      </article>

      <div className="mt-3 space-y-2">
        {categories.map((category) => (
          <article key={category} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-800">{category}</p>
            <input type="range" min="0" max="10000" defaultValue="2500" className="mt-2 w-full accent-teal-600" />
          </article>
        ))}
      </div>

      <button className="mt-4 w-full rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white">Create Budget</button>
    </Container>
  );
}

function GoalsScreen() {
  const goals = [
    { name: "Home Downpayment", progress: 62, saved: "INR 1,24,000", left: "10 mo" },
    { name: "Vacation", progress: 46, saved: "INR 52,000", left: "6 mo" },
    { name: "Emergency Fund", progress: 80, saved: "INR 80,000", left: "2 mo" },
  ];

  return (
    <Container title="Goals" subtitle="Stay on track, every month">
      <div className="space-y-3">
        {goals.map((goal) => (
          <article key={goal.name} className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900">{goal.name}</p>
              <p className="text-xs font-bold text-teal-700">{goal.progress}%</p>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-200">
              <div className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500" style={{ width: `${goal.progress}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>{goal.saved}</span>
              <span>{goal.left} left</span>
            </div>
            <button className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">Add money to goal</button>
          </article>
        ))}
      </div>
      <button className="mt-3 w-full rounded-2xl border border-dashed border-slate-300 bg-white py-2 text-sm font-bold text-slate-700">
        + New Goal
      </button>
    </Container>
  );
}

function ReportsScreen() {
  const [tab, setTab] = useState("month");

  return (
    <Container title="Afters" subtitle="What happened after this month">
      <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
        <button onClick={() => setTab("month")} className={`rounded-lg px-3 py-1.5 ${tab === "month" ? "bg-white text-teal-700" : "text-slate-600"}`}>This Month</button>
        <button onClick={() => setTab("q") } className={`rounded-lg px-3 py-1.5 ${tab === "q" ? "bg-white text-teal-700" : "text-slate-600"}`}>Last 3 Months</button>
        <button onClick={() => setTab("year") } className={`rounded-lg px-3 py-1.5 ${tab === "year" ? "bg-white text-teal-700" : "text-slate-600"}`}>Year</button>
      </div>

      <article className="mt-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-sm font-bold text-slate-900">You saved INR 1,200 compared to last month</p>
        <p className="mt-1 text-xs text-slate-500">Spending trend and category mix improved in food and transport.</p>
      </article>

      <article className="mt-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs text-slate-500">Trend chart</p>
        <div className="mt-3 h-36 rounded-lg bg-gradient-to-r from-slate-100 via-teal-100 to-cyan-100" />
      </article>
    </Container>
  );
}

function StoreScreen() {
  return (
    <Container title="Store & Rewards" subtitle="Earn from healthy money habits">
      <article className="rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 p-4 ring-1 ring-amber-200">
        <p className="text-xs text-amber-700">You earned this month</p>
        <p className="mt-1 text-3xl font-black text-amber-900">INR 347</p>
      </article>

      <div className="mt-3 space-y-2">
        {[
          "Amazon voucher 5% off",
          "Myntra cashback booster",
          "Swiggy instant rewards",
          "Spend & Earn weekend offer",
        ].map((offer) => (
          <article key={offer} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <p className="text-sm font-semibold text-slate-800">{offer}</p>
            <button className="mt-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">Redeem points</button>
          </article>
        ))}
      </div>
    </Container>
  );
}

function AppBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { to: "/north", label: "North", icon: Home },
    { to: "/tasks", label: "Tasks", icon: Bell },
    { to: "/transfer", label: "Transfer", icon: Send },
    { to: "/budget", label: "Budget", icon: ChartPie },
    { to: "/goals", label: "Goals", icon: Goal },
    { to: "/reports", label: "Afters", icon: Target },
    { to: "/store", label: "Store", icon: Gift },
  ];

  const show = !location.pathname.startsWith("/onboarding") && location.pathname !== "/";
  if (!show) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-2 py-2">
        {items.map((item) => {
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`grid place-items-center gap-0.5 rounded-lg px-2 py-1 ${active ? "text-teal-700" : "text-slate-500"}`}
            >
              <Icon size={15} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function RoutedApp() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/onboarding/banks" element={<OnboardingBanks />} />
        <Route path="/onboarding/cards" element={<OnboardingCards />} />
        <Route path="/onboarding/goals" element={<OnboardingGoals />} />
        <Route path="/north" element={<NorthHome />} />
        <Route path="/tasks" element={<TasksScreen />} />
        <Route path="/transfer" element={<TransferScreen />} />
        <Route path="/budget" element={<BudgetScreen />} />
        <Route path="/goals" element={<GoalsScreen />} />
        <Route path="/reports" element={<ReportsScreen />} />
        <Route path="/store" element={<StoreScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AppBottomNav />
      <FloatingAssistant />
    </div>
  );
}

export default function FlowWalletApp() {
  return (
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  );
}
