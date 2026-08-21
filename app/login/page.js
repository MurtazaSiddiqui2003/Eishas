"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("/");

  // Where to send someone after they sign in — whatever page they were on
  // when they clicked "Sign in" (StoreNav appends this), so they land back
  // somewhere that actually shows they're logged in. The bare landing page
  // has no nav bar at all, so redirecting there made it look like sign-in
  // silently failed even when it worked.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCallbackUrl(params.get("callbackUrl") || "/");
  }, []);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) throw new Error(result.error);

      window.location.href = callbackUrl;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--ivory)] flex items-center justify-center p-6">
      <div className="w-full max-w-[380px] flex flex-col gap-4">
        <a href="/" className="font-['Cormorant_Garamond'] text-3xl text-[var(--ink)] text-center mb-2 block">
          Eisha&rsquo;s
        </a>

        <h1 className="font-['Inter'] text-base text-[var(--ink)] opacity-80 text-center mb-2">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={update("name")}
              required
              className="px-4 py-3.5 bg-black/[0.03] border border-black/15 text-[var(--ink)] placeholder:text-[color-mix(in_srgb,var(--ink)_40%,transparent)] font-['Inter'] text-sm"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={update("email")}
            required
            className="px-4 py-3.5 bg-black/[0.03] border border-black/15 text-[var(--ink)] placeholder:text-[color-mix(in_srgb,var(--ink)_40%,transparent)] font-['Inter'] text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={update("password")}
            required
            minLength={6}
            className="px-4 py-3.5 bg-black/[0.03] border border-black/15 text-[var(--ink)] placeholder:text-[color-mix(in_srgb,var(--ink)_40%,transparent)] font-['Inter'] text-sm"
          />

          {error && <p className="text-[#e08585] font-['Inter'] text-xs">{error}</p>}

          <button type="submit" disabled={loading} className="py-3.5 bg-[var(--gold)] text-[var(--ink)] font-['Inter'] font-medium text-sm tracking-wide disabled:opacity-60">
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="py-3 border border-black/20 text-[var(--ink)] font-['Inter'] text-sm"
          type="button"
        >
          Continue with Google
        </button>

        <button
          type="button"
          className="text-center font-['Inter'] text-xs text-[color-mix(in_srgb,var(--ink)_60%,transparent)] hover:text-[var(--gold-deep)] mt-1"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
