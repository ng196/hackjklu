import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, MessageCircle, Search, Wallet } from "lucide-react";
import { API_BASE_URL, getDashboardContext, listUsers, seedDemoUsers } from "../services/backendApi";
import MainAppShell from "./mainApp/MainAppShell";

const PROFILE_STORAGE_KEY = "flowwallet.onboarding.profile";
const MAX_VISIBLE_BANKS = 10;
const MAX_VISIBLE_CARDS = 10;

const baseBanks = [
  "Axis Bank",
  "HDFC Bank",
  "SBI",
  "ICICI",
  "Kotak",
  "Yes Bank",
  "IndusInd",
  "IDFC First",
  "Federal Bank",
  "Bank of Baroda",
  "PNB",
  "Canara Bank",
];

const baseCards = [
  { id: "hdfc-credit", name: "HDFC Millennia", type: "Credit", last4: "4829" },
  { id: "icici-debit", name: "ICICI Coral", type: "Debit", last4: "3910" },
  { id: "axis-credit", name: "Axis Neo", type: "Credit", last4: "7701" },
  { id: "sbi-credit", name: "SBI SimplyCLICK", type: "Credit", last4: "1042" },
  { id: "kotak-debit", name: "Kotak Platinum", type: "Debit", last4: "9338" },
  { id: "yes-credit", name: "YES Prosperity", type: "Credit", last4: "5502" },
  { id: "indusind-credit", name: "IndusInd Legend", type: "Credit", last4: "2188" },
  { id: "federal-debit", name: "Federal Imperio", type: "Debit", last4: "6621" },
  { id: "bob-credit", name: "BoB Eterna", type: "Credit", last4: "7780" },
  { id: "pnb-debit", name: "PNB RuPay Select", type: "Debit", last4: "4019" },
  { id: "canara-credit", name: "Canara Visa Platinum", type: "Credit", last4: "3320" },
  { id: "idfc-credit", name: "IDFC FIRST Select", type: "Credit", last4: "9147" },
];

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

function maskPhone(value) {
  const digits = normalizePhone(value);
  if (digits.length !== 10) return "your phone number";
  return `${digits.slice(0, 2)}xxxxxx${digits.slice(-2)}`;
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "item";
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).filter(Boolean).map((value) => String(value).trim())));
}

function uniqueCards(values) {
  const map = new Map();
  for (const card of values || []) {
    if (!card?.id) continue;
    if (!map.has(card.id)) {
      map.set(card.id, card);
    }
  }
  return Array.from(map.values());
}

function loadStoredOnboardingSnapshot() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function saveStoredOnboardingSnapshot(snapshot) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(snapshot));
}

function deriveSuggestedProfile(context, fallbackUser = null) {
  const accounts = context?.accounts || [];
  const user = context?.user || fallbackUser || null;

  const suggestedBanks = uniqueStrings(
    accounts
      .filter((account) => account.fi_type === "DEPOSIT")
      .map((account) => account.account_name),
  ).slice(0, MAX_VISIBLE_BANKS);

  const fromAccounts = accounts
    .filter((account) => account.fi_type === "CREDIT_CARD")
    .map((account) => {
      const masked = String(account.masked_identifier || "");
      const last4Match = masked.match(/(\d{4})(?!.*\d)/);
      const last4 = last4Match ? last4Match[1] : "0000";
      const name = account.account_name || "Credit Card";
      return {
        id: `profile-${slugify(`${name}-${last4}`)}`,
        name,
        type: "Credit",
        last4,
      };
    });

  const suggestedCards = uniqueCards(fromAccounts).slice(0, MAX_VISIBLE_CARDS);

  return {
    user: user
      ? {
          id: user.id,
          full_name: user.full_name,
          mobile: user.mobile,
          email: user.email,
        }
      : null,
    suggestedBanks,
    suggestedCards,
  };
}

function useBackendConnectionStatus() {
  const [status, setStatus] = useState({
    connected: false,
    checking: true,
    lastCheckedAt: null,
    connectedAt: null,
  });

  useEffect(() => {
    if (status.connected) {
      return undefined;
    }

    let active = true;

    const checkConnection = async () => {
      const now = new Date().toISOString();
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`);
        }

        if (!active) return;
        setStatus({
          connected: true,
          checking: false,
          lastCheckedAt: now,
          connectedAt: now,
        });
      } catch (_err) {
        if (!active) return;
        setStatus((prev) => ({
          ...prev,
          connected: false,
          checking: false,
          lastCheckedAt: now,
        }));
      }
    };

    checkConnection();
    const intervalId = window.setInterval(checkConnection, 1000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [status.connected]);

  return status;
}

function BackendConnectionBanner({ status }) {
  const badgeClass = status.connected
    ? "border-emerald-300 bg-emerald-100 text-emerald-700"
    : "border-amber-300 bg-amber-100 text-amber-700";

  const message = status.connected
    ? "Connected"
    : status.checking
      ? "Checking backend connection..."
      : "Disconnected. Retrying every second...";

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2 px-4 py-2">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500">Backend</p>
          <p className="truncate text-xs font-semibold text-slate-700">{API_BASE_URL}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${badgeClass}`}>{message}</span>
          {status.connectedAt ? (
            <span className="text-[10px] text-slate-500">Connected at {new Date(status.connectedAt).toLocaleTimeString()}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

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

function InlinePopup({ popup, onClose }) {
  if (!popup?.open) return null;

  return (
    <div className="fixed inset-x-0 bottom-24 z-50 mx-auto w-full max-w-md px-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <span className="text-xl" aria-hidden="true">{popup.emoji || "⚠️"}</span>
            <div>
              <p className="text-sm font-bold text-amber-900">{popup.title || "Heads up"}</p>
              <p className="mt-0.5 text-xs text-amber-800">{popup.message}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-xs font-bold text-amber-800">Close</button>
        </div>
      </div>
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
            onClick={() => navigate("/onboarding/login")}
            className="mt-8 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
          >
            Start Free - Login
          </button>
        </div>
      </Container>
      <FloatingAssistant />
    </div>
  );
}

function LoginWithPhone({ backendStatus }) {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");
  const [seedAttempted, setSeedAttempted] = useState(false);

  useEffect(() => {
    if (users.length > 0) {
      setLoadingUsers(false);
      return undefined;
    }

    let active = true;
    const loadUsers = async () => {
      try {
        let response = await listUsers();
        let rows = response?.users || [];

        if (rows.length === 0 && !seedAttempted) {
          await seedDemoUsers(false);
          setSeedAttempted(true);
          response = await listUsers();
          rows = response?.users || [];
        }

        if (!active) return;

        const parsed = rows.filter((row) => normalizePhone(row.mobile).length === 10).slice(0, 10);
        if (parsed.length > 0) {
          setUsers(parsed);
          setLoadingUsers(false);
          setError("");
          return;
        }

        setError("No users found yet. Retrying every second...");
        setLoadingUsers(true);
      } catch (_err) {
        if (!active) return;
        setError("Unable to load users from backend. Retrying every second...");
        setLoadingUsers(true);
      }
    };

    loadUsers();
    const intervalId = window.setInterval(loadUsers, 1000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [users.length, seedAttempted]);

  const handleContinue = () => {
    const digits = normalizePhone(phone);
    if (digits.length !== 10) return;
    navigate("/onboarding/otp-consent", { state: { phone: digits } });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Container
        title="Login"
        subtitle="Enter your phone number to verify and continue"
        showBack
        backTo="/"
      >
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone Number</label>
          <div className="mt-2 flex items-center rounded-xl border border-slate-200 px-3 py-2.5">
            <span className="mr-2 text-sm font-semibold text-slate-500">+91</span>
            <input
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(event) => setPhone(normalizePhone(event.target.value))}
              placeholder="9876543210"
              className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">We will send a one-time password to this number.</p>
        </div>

        <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Test users from backend</p>
          {!backendStatus.connected ? (
            <p className="mt-2 text-sm text-amber-700">Backend not connected yet. Retrying every second...</p>
          ) : null}
          {loadingUsers ? <p className="mt-2 text-sm text-slate-500">Loading users...</p> : null}
          {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
          {!loadingUsers && !error && users.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No users found.</p>
          ) : null}

          <div className="mt-2 grid gap-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setPhone(normalizePhone(user.mobile))}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left"
              >
                <span className="text-sm font-semibold text-slate-800">{user.full_name}</span>
                <span className="text-xs font-bold text-teal-700">+91 {user.mobile}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={phone.length !== 10}
          className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
        </button>
      </Container>
      <FloatingAssistant />
    </div>
  );
}

function OtpConsent() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || "";
  const [otp, setOtp] = useState("");
  const [consentChecked, setConsentChecked] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyAndConsent = async () => {
    if (otp.length !== 6 || !consentChecked) return;
    setSubmitting(true);
    setError("");

    try {
      let usersResponse = await listUsers();
      let users = usersResponse?.users || [];
      if (users.length === 0) {
        await seedDemoUsers(false);
        usersResponse = await listUsers();
        users = usersResponse?.users || [];
      }

      const normalized = normalizePhone(phone);
      const matchedUser = users.find((user) => normalizePhone(user.mobile) === normalized);

      if (!matchedUser) {
        throw new Error("No backend user found for this phone number.");
      }

      const context = await getDashboardContext(matchedUser.id);
      const profile = deriveSuggestedProfile(context, matchedUser);
      const snapshot = {
        timestamp: new Date().toISOString(),
        phone: normalized,
        consented: true,
        profile,
      };

      saveStoredOnboardingSnapshot(snapshot);
      navigate("/onboarding/banks", { state: { snapshot } });
    } catch (err) {
      setError(err.message || "Unable to verify and fetch user context.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Container
        title="OTP & AA Consent"
        subtitle="Verify OTP and approve Account Aggregator access"
        showBack
        backTo="/onboarding/login"
      >
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs text-slate-500">OTP sent to</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{phone ? `+91 ${maskPhone(phone)}` : "your phone number"}</p>
          <p className="mt-1 text-[11px] text-slate-500">Use any 6-digit OTP for test flow.</p>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500">Enter OTP</label>
          <input
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900"
          />

          <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/60 p-3">
            <p className="text-sm font-semibold text-slate-800">Account Aggregator Consent</p>
            <p className="mt-1 text-xs text-slate-600">
              I authorize FlowWallet to fetch my account details from selected banks via RBI-licensed Account
              Aggregators for personal finance insights.
            </p>
            <label className="mt-3 flex items-start gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(event) => setConsentChecked(event.target.checked)}
                className="mt-0.5"
              />
              I agree to provide consent to share my financial information.
            </label>
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

        <button
          onClick={handleVerifyAndConsent}
          disabled={otp.length !== 6 || !consentChecked || submitting}
          className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Verifying..." : "Verify OTP & Continue"}
        </button>
      </Container>
      <FloatingAssistant />
    </div>
  );
}

function OnboardingHeader({ step }) {
  const percent = Math.round((step / 4) * 100);
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <span>Step {step} of 4</span>
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
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [popup, setPopup] = useState({ open: false, title: "", message: "", emoji: "" });
  const storedSnapshot = useMemo(() => loadStoredOnboardingSnapshot(), []);
  const runtimeSnapshot = location.state?.snapshot || storedSnapshot;

  const suggestedBanks = useMemo(
    () => uniqueStrings(runtimeSnapshot?.profile?.suggestedBanks || []),
    [runtimeSnapshot],
  );

  const allBanks = useMemo(
    () => uniqueStrings([...suggestedBanks, ...baseBanks]).slice(0, MAX_VISIBLE_BANKS),
    [suggestedBanks],
  );

  const [selected, setSelected] = useState(() => {
    const prior = runtimeSnapshot?.selection?.banks || [];
    if (prior.length > 0) {
      return uniqueStrings(prior).slice(0, MAX_VISIBLE_BANKS);
    }
    return suggestedBanks.slice(0, MAX_VISIBLE_BANKS);
  });

  useEffect(() => {
    if (suggestedBanks.length > 0) {
      setSelected((prev) => uniqueStrings([...suggestedBanks, ...prev]).slice(0, MAX_VISIBLE_BANKS));
    }
  }, [suggestedBanks]);

  useEffect(() => {
    const updatedSnapshot = {
      ...(runtimeSnapshot || {}),
      selection: {
        ...(runtimeSnapshot?.selection || {}),
        banks: selected.slice(0, MAX_VISIBLE_BANKS),
      },
    };
    saveStoredOnboardingSnapshot(updatedSnapshot);
  }, [runtimeSnapshot, selected]);

  const filtered = useMemo(
    () => allBanks.filter((bank) => bank.toLowerCase().includes(query.toLowerCase())),
    [allBanks, query],
  );

  useEffect(() => {
    if (!popup.open) return undefined;
    const timeoutId = window.setTimeout(() => {
      setPopup((prev) => ({ ...prev, open: false }));
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [popup]);

  const toggle = (bank) => {
    setSelected((prev) => {
      if (prev.includes(bank)) {
        return prev.filter((item) => item !== bank);
      }
      return [...prev, bank];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Container title="Choose Banks" subtitle="Link 1-3 accounts in under a minute" showBack backTo="/onboarding/otp-consent">
        <OnboardingHeader step={3} />
        <p className="mb-3 text-xs text-slate-500">Showing up to {MAX_VISIBLE_BANKS} banks.</p>
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
            const isSuggested = suggestedBanks.includes(bank);
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
                <span className={`text-xs font-bold ${isSuggested ? "text-teal-700" : "text-amber-700"}`}>
                  {isSuggested ? "Suggested" : "Not in your profile"}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            const invalidBanks = selected.filter((bank) => !suggestedBanks.includes(bank));
            if (invalidBanks.length > 0) {
              setPopup({
                open: true,
                title: "Hold up, quick fix",
                message: "You picked a bank that's not linked to this profile. Remove it before moving to cards.",
                emoji: "🏦",
              });
              return;
            }

            const updatedSnapshot = {
              ...(runtimeSnapshot || {}),
              selection: {
                ...(runtimeSnapshot?.selection || {}),
                banks: selected.slice(0, MAX_VISIBLE_BANKS),
              },
            };
            saveStoredOnboardingSnapshot(updatedSnapshot);
            navigate("/onboarding/cards", { state: { snapshot: updatedSnapshot } });
          }}
          className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
        >
          Continue
        </button>
      </Container>
      <InlinePopup popup={popup} onClose={() => setPopup((prev) => ({ ...prev, open: false }))} />
      <FloatingAssistant />
    </div>
  );
}

function OnboardingCards() {
  const navigate = useNavigate();
  const location = useLocation();
  const [popup, setPopup] = useState({ open: false, title: "", message: "", emoji: "" });
  const storedSnapshot = useMemo(() => loadStoredOnboardingSnapshot(), []);
  const runtimeSnapshot = location.state?.snapshot || storedSnapshot;

  const suggestedCards = useMemo(
    () => uniqueCards(runtimeSnapshot?.profile?.suggestedCards || []),
    [runtimeSnapshot],
  );

  const visibleCards = useMemo(
    () => uniqueCards([...suggestedCards, ...baseCards]).slice(0, MAX_VISIBLE_CARDS),
    [suggestedCards],
  );

  const [active, setActive] = useState(() => {
    const prior = runtimeSnapshot?.selection?.cards || [];
    if (prior.length > 0) {
      return Array.from(new Set(prior)).slice(0, MAX_VISIBLE_CARDS);
    }
    return suggestedCards.map((card) => card.id).slice(0, MAX_VISIBLE_CARDS);
  });

  useEffect(() => {
    if (suggestedCards.length > 0) {
      const suggestedIds = suggestedCards.map((card) => card.id);
      setActive((prev) => Array.from(new Set([...suggestedIds, ...prev])).slice(0, MAX_VISIBLE_CARDS));
    }
  }, [suggestedCards]);

  useEffect(() => {
    const updatedSnapshot = {
      ...(runtimeSnapshot || {}),
      selection: {
        ...(runtimeSnapshot?.selection || {}),
        cards: active.slice(0, MAX_VISIBLE_CARDS),
      },
    };
    saveStoredOnboardingSnapshot(updatedSnapshot);
  }, [active, runtimeSnapshot]);

  useEffect(() => {
    if (!popup.open) return undefined;
    const timeoutId = window.setTimeout(() => {
      setPopup((prev) => ({ ...prev, open: false }));
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [popup]);

  const toggleCard = (card) => {
    setActive((prev) => {
      const on = prev.includes(card.id);
      if (on) {
        return prev.filter((id) => id !== card.id);
      }
      return [...prev, card.id];
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Container title="Choose Cards" subtitle="Track card-wise spending with one toggle" showBack backTo="/onboarding/banks">
        <OnboardingHeader step={4} />
        <p className="mb-3 text-xs text-slate-500">Showing up to {MAX_VISIBLE_CARDS} cards.</p>

        <div className="space-y-3">
          {visibleCards.map((card) => {
            const on = active.includes(card.id);
            const isSuggested = suggestedCards.some((suggested) => suggested.id === card.id);
            return (
              <article key={card.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs text-slate-500">
                  {card.type} Card {isSuggested ? "- Suggested" : ""}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">{card.name}</p>
                <p className="text-xs text-slate-500">**** {card.last4}</p>
                <button
                  onClick={() => toggleCard(card)}
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
          onClick={() => {
            const invalidCards = active.filter(
              (cardId) => !suggestedCards.some((card) => card.id === cardId),
            );
            if (invalidCards.length > 0) {
              setPopup({
                open: true,
                title: "Not so fast",
                message: "Some selected cards are not linked to this profile. Fix them here before continuing.",
                emoji: "💳",
              });
              return;
            }

            const updatedSnapshot = {
              ...(runtimeSnapshot || {}),
              selection: {
                ...(runtimeSnapshot?.selection || {}),
                cards: active.slice(0, MAX_VISIBLE_CARDS),
              },
            };
            saveStoredOnboardingSnapshot(updatedSnapshot);
            navigate("/app/home", { state: { snapshot: updatedSnapshot } });
          }}
          className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
        >
          Go to Dashboard
        </button>
      </Container>
      <InlinePopup popup={popup} onClose={() => setPopup((prev) => ({ ...prev, open: false }))} />
      <FloatingAssistant />
    </div>
  );
}

function RoutedSetup() {
  const backendStatus = useBackendConnectionStatus();

  return (
    <div className="min-h-screen bg-slate-50">
      <BackendConnectionBanner status={backendStatus} />
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/onboarding/login" element={<LoginWithPhone backendStatus={backendStatus} />} />
        <Route path="/onboarding/otp-consent" element={<OtpConsent />} />
        <Route path="/onboarding/banks" element={<OnboardingBanks />} />
        <Route path="/onboarding/cards" element={<OnboardingCards />} />
        <Route path="/app/*" element={<MainAppShell />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function Setup() {
  return (
    <BrowserRouter>
      <RoutedSetup />
    </BrowserRouter>
  );
}
