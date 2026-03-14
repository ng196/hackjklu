import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
    verificationCode: "",
  });

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const goNext = () => {
    setError("");
    if (!form.fullName || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!form.terms) {
      setError("Please accept the Terms of Service");
      return;
    }
    setStep(2);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("✓ Account created successfully! Redirecting...");
    setTimeout(() => navigate("/dashboard"), 800);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-4 shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-xl font-black text-emerald-600">
          <span className="grid h-8 w-8 place-items-center rounded bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm text-white">📈</span>
          FinEducate
        </Link>
        <p className="text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-semibold text-emerald-600">Login</Link>
        </p>
      </header>

      <main className="grid min-h-[calc(100vh-72px)] place-items-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-7">
          <div className="mb-5 flex items-center justify-center gap-2">
            <span className={`h-1.5 rounded ${step === 1 ? "w-8 bg-emerald-600" : "w-6 bg-slate-300"}`} />
            <span className={`h-1.5 rounded ${step === 2 ? "w-8 bg-emerald-600" : "w-6 bg-slate-300"}`} />
          </div>

          <header className="mb-6 text-center">
            <h1 className="text-3xl font-black">Create Account</h1>
            <p className="mt-1 text-sm text-slate-500">{step === 1 ? "Step 1: Basic Information" : "Step 2: Bank Link & Verification"}</p>
          </header>

          {error ? <p className="mb-3 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          {success ? <p className="mb-3 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

          {step === 1 ? (
            <>
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-slate-700">Full Name</span>
                  <input name="fullName" value={form.fullName} onChange={onChange} className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-slate-700">Email Address</span>
                  <input name="email" type="email" value={form.email} onChange={onChange} className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-slate-700">Phone Number</span>
                  <input name="phone" value={form.phone} onChange={onChange} className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-slate-700">Password</span>
                  <input name="password" type="password" value={form.password} onChange={onChange} className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-slate-700">Confirm Password</span>
                  <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange} className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5" />
                </label>
                <label className="inline-flex items-start gap-2 text-sm text-slate-700">
                  <input name="terms" type="checkbox" checked={form.terms} onChange={onChange} className="mt-0.5 accent-emerald-600" />
                  I agree to the <button type="button" className="text-emerald-600">Terms of Service</button> and <button type="button" className="text-emerald-600">Privacy Policy</button>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/login" className="grid place-items-center rounded-lg border-2 border-emerald-600 py-2.5 text-sm font-semibold text-emerald-600">Back to Login</Link>
                  <button type="button" onClick={goNext} className="rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 py-2.5 text-sm font-semibold text-white">Next Step →</button>
                </div>
              </div>

              <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
                <div className="h-px flex-1 bg-slate-200" />
                <span>or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button type="button" className="rounded-lg border border-slate-200 bg-slate-100 py-2 text-xl">G</button>
                <button type="button" className="rounded-lg border border-slate-200 bg-slate-100 py-2 text-xl"></button>
                <button type="button" className="rounded-lg border border-slate-200 bg-slate-100 py-2 text-xl">f</button>
              </div>
            </>
          ) : (
            <>
              <article className="mb-4 rounded-lg border border-sky-200 bg-sky-50 p-3 text-center">
                <p className="text-2xl">🏦</p>
                <p className="text-sm font-semibold text-sky-700">Link Your Bank Account</p>
                <p className="text-xs text-sky-700">Secure & encrypted connection</p>
              </article>

              <button type="button" className="mb-3 w-full rounded-lg bg-sky-700 py-2.5 font-semibold text-white">🔗 Link Bank Account</button>

              <div className="my-4 flex items-center gap-3 text-xs text-slate-500">
                <div className="h-px flex-1 bg-slate-200" />
                <span>or</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <button type="button" className="mb-4 w-full rounded-lg border-2 border-emerald-600 py-2.5 font-semibold text-emerald-600">Skip for Now</button>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-700">Email Verification Code (Optional)</span>
                <input name="verificationCode" value={form.verificationCode} onChange={onChange} placeholder="Enter 6-digit code" className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5" />
              </label>

              <button type="submit" className="mt-4 w-full rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 py-2.5 font-semibold text-white">Create Account</button>
              <button type="button" onClick={() => setStep(1)} className="mt-3 w-full rounded-lg border-2 border-emerald-600 py-2.5 font-semibold text-emerald-600">← Back</button>
            </>
          )}

          {step === 1 ? (
            <p className="mt-5 text-center text-sm text-slate-500">
              Already have an account? <Link to="/login" className="font-semibold text-emerald-600">Login here</Link>
            </p>
          ) : null}
        </form>
      </main>
    </div>
  );
}
