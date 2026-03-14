import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSuccess("✓ Login successful! Redirecting...");
    setTimeout(() => navigate("/dashboard"), 600);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-4 shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-xl font-black text-emerald-600">
          <span className="grid h-8 w-8 place-items-center rounded bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm text-white">📈</span>
          FinEducate
        </Link>
        <p className="text-sm text-slate-500">
          Don't have an account? <Link to="/signup" className="font-semibold text-emerald-600">Sign Up</Link>
        </p>
      </header>

      <main className="grid min-h-[calc(100vh-72px)] place-items-center p-4">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-7">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-black">Welcome Back</h1>
            <p className="mt-1 text-sm text-slate-500">Login to your FinEducate account</p>
          </header>

          {error ? <p className="mb-3 rounded-lg bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          {success ? <p className="mb-3 rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Email Address</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5 focus:border-emerald-500 focus:bg-white focus:outline-none" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-700">Password</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5 focus:border-emerald-500 focus:bg-white focus:outline-none" />
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-slate-700">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-emerald-600" />
                Remember me
              </label>
              <button type="button" className="font-medium text-emerald-600 hover:underline">Forgot password?</button>
            </div>
            <button type="submit" className="w-full rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 py-2.5 font-semibold text-white">Login to Account</button>
          </div>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
            <div className="h-px flex-1 bg-slate-200" />
            <span>or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button type="button" className="rounded-lg border border-slate-200 bg-slate-100 py-2 text-xl hover:border-emerald-300">G</button>
            <button type="button" className="rounded-lg border border-slate-200 bg-slate-100 py-2 text-xl hover:border-emerald-300"></button>
            <button type="button" className="rounded-lg border border-slate-200 bg-slate-100 py-2 text-xl hover:border-emerald-300">f</button>
          </div>

          <p className="mt-5 text-center text-sm text-slate-500">
            New to FinEducate? <Link to="/signup" className="font-semibold text-emerald-600">Create an account</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
