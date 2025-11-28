"use client";

import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      setError("Failed to submit request");
      return;
    }
    setDone(true);
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-6">Forgot password</h1>
      {done ? (
        <p>Check your email for a reset link (or console in dev).</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full border rounded px-3 py-2"
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full bg-black text-white rounded py-2">Send reset link</button>
        </form>
      )}
    </div>
  );
}
