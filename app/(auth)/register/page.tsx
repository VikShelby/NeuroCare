"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const { status, data } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [onboarding, setOnboarding] = useState<any | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      const profileCompleted = (data?.user as { profileCompleted?: boolean })?.profileCompleted;
      if (profileCompleted) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [status, data, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("onboardingData");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setOnboarding(parsed);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
      } catch {}
    }
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const body: any = { name, email, password };
    if (onboarding) {
      body.role = onboarding.role;
      if (onboarding.dateOfBirth) body.dateOfBirth = onboarding.dateOfBirth;
      if (onboarding.gender) body.gender = onboarding.gender;
      if (onboarding.pronouns) body.pronouns = onboarding.pronouns;
      // Backward-compat: if older key 'communicationStyle' exists, map to gender
      if (!body.gender && onboarding.communicationStyle) body.gender = onboarding.communicationStyle;
      if (onboarding.autismProfile) {
        const ap = onboarding.autismProfile;
        const mapped: any = { ...ap };
        // Backward compat: legacy supportNeeds -> formalDiagnosis
        if (mapped.supportNeeds && !mapped.formalDiagnosis) {
          mapped.formalDiagnosis = mapped.supportNeeds;
          delete mapped.supportNeeds;
        }
        mapped.interests = Array.isArray(mapped.interests)
          ? mapped.interests
          : (mapped.interests ? String(mapped.interests).split(/[\n,]/).map((s: string) => s.trim()).filter(Boolean) : []);
        body.autismProfile = mapped;
      }
    }
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to register");
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("onboardingData");
    }
    router.push("/login");
  };

  if (status === "loading") {
    return <div className="max-w-md mx-auto py-12">Loading...</div>;
  }
  if (status === "authenticated") return null;

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-semibold mb-6">Create account</h1>
      {onboarding ? (
        <p className="text-sm text-muted-foreground mb-4">We’ll apply your onboarding details after sign up.</p>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">Want a tailored setup? <a className="underline" href="/onboarding">Start onboarding</a>.</p>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          className="w-full border rounded px-3 py-2"
        />
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
          placeholder="Password (min 6 chars)"
          className="w-full border rounded px-3 py-2"
          required
          minLength={6}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded py-2"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <div className="mt-2">
        <a className="text-sm underline" href="/login">Already have an account?</a>
      </div>
      <div className="mt-4">
        <button onClick={() => signIn("google", { callbackUrl: "/onboarding/oauth-finish" })} className="w-full border rounded py-2">Continue with Google</button>
      </div>
    </div>
  );
}
