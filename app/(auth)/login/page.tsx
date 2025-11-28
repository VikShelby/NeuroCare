"use client";

import { FormEvent, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { status, data } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect authenticated users away from login
  useEffect(() => {
    if (status === "authenticated") {
      const profileCompleted = (data?.user as { profileCompleted?: boolean })?.profileCompleted;
      if (profileCompleted) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding/role");
      }
    }
  }, [status, data, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
    }
  };

  if (status === "loading") {
    return <div className="max-w-md mx-auto py-12">Loading...</div>;
  }
  if (status === "authenticated") {
    return null; // redirect in effect
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-6">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded py-2"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => signIn("google")}
          className="flex-1 border rounded py-2"
        >
          Continue with Google
        </button>
        <a href="/register" className="flex-1 text-center border rounded py-2">Create account</a>
      </div>
      <div className="mt-2">
        <a className="text-sm underline" href="/forgot-password">Forgot password?</a>
      </div>
    </div>
  );
}
