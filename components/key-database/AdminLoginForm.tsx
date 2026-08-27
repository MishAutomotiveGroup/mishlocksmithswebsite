"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

type MfaStage = "password" | "setup" | "verify";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mfaStage, setMfaStage] = useState<MfaStage>("password");
  const [mfaCode, setMfaCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");

  const qrImage = useMemo(() => {
    if (!qrCode) return "";
    return qrCode.startsWith("data:")
      ? qrCode
      : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCode)}`;
  }, [qrCode]);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = hash.get("access_token");
    const type = hash.get("type");
    if (token && (type === "recovery" || type === "invite")) {
      window.history.replaceState(null, "", "/admin-login");
      const timer = window.setTimeout(() => setRecoveryToken(token), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json()) as {
        error?: string;
        stage?: "setup" | "verify";
        qrCode?: string;
        secret?: string;
      };
      if (!response.ok || !body.stage) throw new Error(body.error ?? "Unable to sign in.");
      setPassword("");
      setMfaStage(body.stage);
      setQrCode(body.qrCode ?? "");
      setMfaSecret(body.secret ?? "");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyMfa(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: mfaCode }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Unable to verify the authenticator code.");
      }
      window.location.assign("/admin");
    } catch (mfaError) {
      setError(mfaError instanceof Error ? mfaError.message : "Unable to verify the authenticator code.");
    } finally {
      setLoading(false);
    }
  }

  async function sendPasswordEmail() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/password-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Unable to send the email.");
      }
      setMessage("Check your email for a secure link to create or reset your admin password.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to send the email.");
    } finally {
      setLoading(false);
    }
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 10) { setError("Use a password with at least 10 characters."); return; }
    if (password !== confirmPassword) { setError("The two passwords do not match."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/admin/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: recoveryToken, password }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error ?? "Unable to update the password.");
      }
      setRecoveryToken("");
      setPassword("");
      setConfirmPassword("");
      setMessage("Password saved. Sign in to set up Microsoft Authenticator.");
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : "Unable to update the password.");
    } finally {
      setLoading(false);
    }
  }

  function restartLogin() {
    setMfaStage("password");
    setMfaCode("");
    setQrCode("");
    setMfaSecret("");
    setError("");
  }

  const isMfa = !recoveryToken && mfaStage !== "password";
  const title = recoveryToken
    ? "Create a new password"
    : mfaStage === "setup"
      ? "Set up Microsoft Authenticator"
      : mfaStage === "verify"
        ? "Two-factor verification"
        : "Admin login";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#171C22] p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(22,119,255,0.22),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(22,119,255,0.1),transparent_34%)]" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white p-7 shadow-2xl sm:p-9">
        <img src="/logo-on-light.svg" alt="Mish Auto Locksmiths" className="h-9 w-auto" />
        <div className="mt-9 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1677FF]">
          {isMfa ? <ShieldCheck className="h-6 w-6" /> : <LockKeyhole className="h-6 w-6" />}
        </div>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-[#171C22]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {mfaStage === "setup" && !recoveryToken
            ? "Scan the QR code once, then enter the six-digit code shown in the app."
            : mfaStage === "verify" && !recoveryToken
              ? "Enter the current six-digit code from Microsoft Authenticator."
              : recoveryToken
                ? "Changing your password signs out every trusted browser."
                : "Sign in to manage the key database and review quote searches."}
        </p>

        <form onSubmit={recoveryToken ? savePassword : isMfa ? verifyMfa : submit} className="mt-7 space-y-5">
          {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div> : null}
          {message ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{message}</div> : null}

          {!recoveryToken && mfaStage === "password" ? <label className="block text-sm font-semibold text-slate-700">
            Email address
            <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100" />
          </label> : null}

          {recoveryToken || mfaStage === "password" ? <label className="block text-sm font-semibold text-slate-700">
            {recoveryToken ? "Create password" : "Password"}
            <div className="relative mt-2">
              <input type={showPassword ? "text" : "password"} autoComplete={recoveryToken ? "new-password" : "current-password"} required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 pr-12 text-base font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </label> : null}

          {recoveryToken ? <label className="block text-sm font-semibold text-slate-700">
            Confirm password
            <input type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base font-normal outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100" />
          </label> : null}

          {mfaStage === "setup" && !recoveryToken ? <div className="space-y-4">
            <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-6 text-slate-600">
              <li>Open Microsoft Authenticator and tap the plus button.</li>
              <li>Choose <strong>Other account</strong>, then scan this QR code.</li>
            </ol>
            {qrImage ? <div className="mx-auto w-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <img src={qrImage} alt="QR code for Microsoft Authenticator setup" className="h-48 w-48" />
            </div> : null}
            <details className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <summary className="cursor-pointer font-semibold text-slate-700">Cannot scan the QR code?</summary>
              <p className="mt-2">Choose manual setup and enter this key:</p>
              <code className="mt-2 block break-all rounded-lg bg-white p-2 font-mono text-xs text-slate-800">{mfaSecret}</code>
            </details>
          </div> : null}

          {isMfa ? <label className="block text-sm font-semibold text-slate-700">
            Six-digit authenticator code
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={mfaCode}
              onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              className="mt-2 h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-center font-mono text-2xl font-bold tracking-[0.35em] outline-none transition focus:border-[#1677FF] focus:ring-4 focus:ring-blue-100"
            />
          </label> : null}

          <button type="submit" disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1677FF] text-sm font-bold text-white shadow-sm transition hover:bg-[#0D63DA] disabled:opacity-60">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isMfa ? <ShieldCheck className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
            {loading
              ? recoveryToken ? "Saving…" : isMfa ? "Verifying…" : "Signing in…"
              : recoveryToken ? "Save password" : isMfa ? mfaStage === "setup" ? "Enable and sign in" : "Verify and sign in" : "Continue"}
          </button>

          {!recoveryToken && mfaStage === "password" ? <button type="button" disabled={loading || !email.trim()} onClick={() => void sendPasswordEmail()} className="w-full text-center text-sm font-semibold text-[#1677FF] hover:underline disabled:cursor-not-allowed disabled:opacity-40">Create or reset password</button> : null}
          {isMfa ? <button type="button" disabled={loading} onClick={restartLogin} className="inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back to password</button> : null}
        </form>
        <p className="mt-6 text-center text-xs leading-5 text-slate-400">Authorised staff only. Two-factor authentication is required.</p>
      </div>
    </main>
  );
}
