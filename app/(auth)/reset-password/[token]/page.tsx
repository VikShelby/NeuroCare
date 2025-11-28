"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResetPasswordTokenPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/auth/reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to reset password");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1200);
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-6">Set a new password</h1>
      {done ? (
        <p>Password reset successful. Redirecting to login...</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full border rounded px-3 py-2"
            required
            minLength={6}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full bg-black text-white rounded py-2">Update password</button>
        </form>
      )}
    </div>
  );
}
