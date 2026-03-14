import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  const navItems = ["Learn", "Tools", "Planning", "Advisory"];
  const stats = [
    ["50K+", "Active Learners"],
    ["INR 2.5Cr", "Money Planned"],
    ["200+", "Expert Articles"],
    ["98%", "Satisfaction Rate"],
  ];
  const features = [
    ["📘", "Learn Finance", "Comprehensive courses on budgeting, investing, tax planning, and personal wealth management."],
    ["🧮", "Smart Calculators", "EMI, investment returns, retirement planning, and tax calculators to make informed decisions."],
    ["📈", "Financial Planning", "Personalized financial plans that align with your goals and help you achieve financial freedom."],
    ["🎯", "Goal Tracking", "Set, monitor, and achieve your financial goals with insight-rich recommendations."],
    ["🧑‍💼", "Expert Advisory", "Get guidance from certified financial advisors and wealth professionals."],
    ["📱", "Mobile App", "Access your finances anytime, anywhere and track spending on the go."],
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <p className="text-xl font-black text-emerald-600">💰 FinEducate</p>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <button key={item} className="text-sm font-medium text-slate-600 hover:text-emerald-600">{item}</button>
            ))}
          </nav>
          <div className="flex gap-2">
            <button onClick={() => navigate("/login")} className="rounded-lg border-2 border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50">Login</button>
            <button onClick={() => navigate("/signup")} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Sign Up</button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl bg-gradient-to-br from-emerald-50/40 to-white px-4 py-20 text-center">
          <h1 className="text-4xl font-black leading-tight md:text-5xl">Master Your Finances, Build Your Future</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Learn personal finance, plan your goals, and get expert advice all in one place. Start your financial journey today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate("/signup")} className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700">Get Started for Free</button>
            <button onClick={() => navigate("/signup")} className="rounded-lg border-2 border-emerald-600 px-6 py-3 font-semibold text-emerald-600 hover:bg-emerald-50">Create Free Account</button>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(([number, label]) => (
              <article key={label}>
                <p className="text-3xl font-black text-emerald-600">{number}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-10 text-center text-3xl font-black">Everything You Need</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(([icon, title, text]) => (
              <article key={title} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
                <div className="mb-4 inline-grid h-14 w-14 place-items-center rounded-xl bg-emerald-50 text-2xl">{icon}</div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <article className="rounded-xl border-2 border-emerald-500 bg-white p-10 text-center">
            <h2 className="text-3xl font-black">Ready to Take Control of Your Finances?</h2>
            <p className="mt-2 text-slate-600">Join thousands who are building their financial future with FinEducate</p>
            <button onClick={() => navigate("/signup")} className="mt-6 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700">Start Your Journey Today</button>
          </article>
        </section>

        <footer className="bg-slate-900 px-4 py-10 text-slate-300">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
            {["Product", "Company", "Support", "Legal"].map((heading) => (
              <div key={heading}>
                <h4 className="mb-3 font-bold text-emerald-400">{heading}</h4>
                <p className="text-sm">Links and resources</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-6xl border-t border-slate-700 pt-6 text-center text-sm">
            © 2024 FinEducate. All rights reserved. | Empowering Financial Dreams
          </p>
        </footer>
      </main>
    </div>
  );
}
