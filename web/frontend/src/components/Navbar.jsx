import { Bell, Search } from "lucide-react";

export default function Navbar({ title, subtitle }) {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        {subtitle ? <p className="text-sm text-slate-500 mt-1">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-52 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-emerald-400 focus:outline-none"
          />
        </div>
        <button className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100">
          <Bell size={18} />
        </button>
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-rose-500" />
      </div>
    </header>
  );
}
