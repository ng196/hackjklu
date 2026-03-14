import { useState } from "react";
import { Check, Save, User } from "lucide-react";

const PROFILE_KEY = "flowwallet.user.profile";

function loadProfile() {
    try {
        const raw = localStorage.getItem(PROFILE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveProfileData(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function getInitials(name) {
    return (name || "U")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function ProfileTab({ data }) {
    const user = data?.user || {};
    const [saved, setSaved] = useState(false);
    const stored = loadProfile();

    const [form, setForm] = useState({
        fullName: stored.fullName || user.full_name || "",
        email: stored.email || user.email || "",
        phone: stored.phone || user.mobile || "",
        occupation: stored.occupation || "",
        annualIncome: stored.annualIncome || "",
        taxRegime: stored.taxRegime || "new",
        pan: stored.pan || "",
        aadhaar: stored.aadhaar || "",
        goalsSummary: stored.goalsSummary || "",
        riskAppetite: stored.riskAppetite || "moderate",
        savingsTarget: stored.savingsTarget || "",
    });

    const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleSave = () => {
        saveProfileData(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="mx-auto max-w-2xl space-y-5">
            {/* Header Card */}
            <article className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-2xl font-black">
                        {getInitials(form.fullName || user.full_name)}
                    </div>
                    <div>
                        <h2 className="text-xl font-black">{form.fullName || user.full_name || "User"}</h2>
                        <p className="text-sm text-slate-400">{form.email || user.email || "No email set"}</p>
                    </div>
                </div>
            </article>

            {/* Personal Details */}
            <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <div className="mb-4 flex items-center gap-2">
                    <User size={16} className="text-teal-600" />
                    <h3 className="text-sm font-bold text-slate-900">Personal Details</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full Name" value={form.fullName} onChange={(v) => update("fullName", v)} placeholder="Your full name" />
                    <Field label="Email" value={form.email} onChange={(v) => update("email", v)} type="email" placeholder="you@example.com" />
                    <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} type="tel" placeholder="+91 98765 43210" />
                    <Field label="Occupation" value={form.occupation} onChange={(v) => update("occupation", v)} placeholder="e.g. Software Engineer" />
                </div>
            </section>

            {/* Financial Details */}
            <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <div className="mb-4 flex items-center gap-2">
                    <span className="text-teal-600">💼</span>
                    <h3 className="text-sm font-bold text-slate-900">Financial Details</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Annual Income (₹)" value={form.annualIncome} onChange={(v) => update("annualIncome", v)} type="number" placeholder="1500000" />
                    <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tax Regime</label>
                        <select
                            value={form.taxRegime}
                            onChange={(e) => update("taxRegime", e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                        >
                            <option value="new">New Tax Regime</option>
                            <option value="old">Old Tax Regime</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Additional Details */}
            <section className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <div className="mb-4 flex items-center gap-2">
                    <span className="text-teal-600">📄</span>
                    <h3 className="text-sm font-bold text-slate-900">Additional Details</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="PAN Number" value={form.pan} onChange={(v) => update("pan", v.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} />
                    <Field label="Aadhaar Number" value={form.aadhaar} onChange={(v) => update("aadhaar", v)} placeholder="1234 5678 9012" maxLength={14} />
                    <Field label="Financial Goals Summary" value={form.goalsSummary} onChange={(v) => update("goalsSummary", v)} placeholder="e.g. Save for home, retire early" />
                    <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Risk Appetite</label>
                        <select
                            value={form.riskAppetite}
                            onChange={(e) => update("riskAppetite", e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                        >
                            <option value="conservative">Conservative</option>
                            <option value="moderate">Moderate</option>
                            <option value="aggressive">Aggressive</option>
                        </select>
                    </div>
                    <Field label="Monthly Savings Target (₹)" value={form.savingsTarget} onChange={(v) => update("savingsTarget", v)} type="number" placeholder="25000" />
                </div>
            </section>

            {/* Save */}
            <button
                onClick={handleSave}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-600/20 transition-all hover:shadow-lg hover:shadow-teal-600/30"
            >
                {saved ? <Check size={16} /> : <Save size={16} />}
                {saved ? "Saved!" : "Save Profile"}
            </button>
        </div>
    );
}

function Field({ label, value, onChange, type = "text", placeholder = "", maxLength }) {
    return (
        <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
        </div>
    );
}
