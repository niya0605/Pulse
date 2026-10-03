"use client";

import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const endpoint = mode === "login" ? "/api/auth/sign-in/email" : "/api/auth/sign-up/email";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
          name: form.get("name") || String(form.get("email")).split("@")[0],
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.message ?? data.error?.message ?? "Authentication failed. Check your details and try again.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not reach Pulse. Please retry.");
    } finally {
      setLoading(false);
    }
  }


  return <main className="auth-page"><div className="auth-card"><Link href="/" style={{ color: "inherit", textDecoration: "none" }}><div className="brand-lockup"><div className="brand-mark"><svg width="22" height="22" viewBox="0 0 96 96" fill="none"><path d="M19 51.5H31L37.5 34L48 64L56 43L61 51.5H77" stroke="#101211" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div><div className="brand-name">pulse</div><div className="brand-sub">market signal desk</div></div></div></Link><div style={{ marginTop: 34 }}><div className="eyebrow">{mode === "login" ? "Welcome back" : "Create your desk"}</div><h1>{mode === "login" ? "Back to the signal." : "Your signal starts here."}</h1><p>{mode === "login" ? "Pick up where the market left off." : "One watchlist. Clearer context. Less noise."}</p></div><form className="auth-form" onSubmit={submit}>{mode === "signup" && <div className="field"><label htmlFor="name">Name</label><input id="name" name="name" placeholder="Jordan Davis" required /></div>}<div className="field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></div><div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" placeholder="At least 8 characters" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required /></div><button className="primary-button" type="submit" disabled={loading}>{loading ? <><LoaderCircle size={14} className="animate-spin" style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />Opening workspace…</> : <>{mode === "login" ? "Log in" : "Create account"} <ArrowRight size={13} style={{ display: "inline", verticalAlign: "-2px", marginLeft: 4 }} /></>}</button></form>{message && <div className="notice" style={{ marginTop: 15 }} role="alert">{message}</div>}<div className="auth-footer">{mode === "login" ? <>New to Pulse? <Link href="/signup">Create an account</Link></> : <>Already tracking? <Link href="/login">Log in</Link></>}</div></div></main>;
}
