"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "#0e0e0e" }}
    >
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-5">
        <Image
          src="/images/logo/rosecityLogo.jpeg"
          alt="Rose City FC"
          width={100}
          height={100}
          className="rounded-full"
        />
        <div className="text-center">
          <p
            className="font-display font-black uppercase tracking-widest text-white"
            style={{ fontSize: "2rem", letterSpacing: "0.2em" }}
          >
            Rose City FC
          </p>
          <p
            className="font-display tracking-widest uppercase mt-1"
            style={{ fontSize: "1rem", color: "rgba(255,255,255,0.35)" }}
          >
            Admin Portal
          </p>
        </div>
      </div>

      {/* Card */}
      <div
        className="w-full mx-auto rounded-2xl p-10"
        style={{ maxWidth: 480, backgroundColor: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {sent ? (
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "rgba(220,38,38,0.15)" }}
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="font-display font-black uppercase text-white mb-3" style={{ fontSize: "1.6rem" }}>
              Check your email
            </h2>
            <p className="font-body" style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.45)" }}>
              We sent a magic link to <span style={{ color: "rgba(255,255,255,0.75)" }}>{email}</span>. Click it to sign in.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="mt-8 font-display tracking-widest uppercase transition-opacity duration-200 opacity-40 hover:opacity-100"
              style={{ fontSize: "0.95rem", color: "white" }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-display font-black uppercase text-white mb-2" style={{ fontSize: "1.8rem" }}>
              Sign in
            </h1>
            <p className="font-body mb-8" style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.4)" }}>
              Enter your email &mdash; we&apos;ll send a magic link.
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg px-4 py-4 font-body text-white outline-none transition-all duration-200"
                style={{
                  fontSize: "1.05rem",
                  backgroundColor: "#0e0e0e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  caretColor: "#dc2626",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(220,38,38,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
              />

              {error && (
                <p className="font-body" style={{ fontSize: "0.95rem", color: "#dc2626" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-lg font-display font-black uppercase tracking-widest text-white transition-opacity duration-200"
                style={{
                  fontSize: "1.1rem",
                  backgroundColor: "#dc2626",
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Sending…" : "Send Magic Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
