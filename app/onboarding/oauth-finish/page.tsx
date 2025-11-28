"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function OAuthFinishPage() {
  const router = useRouter();
  const { status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (status === "unauthenticated") {
        router.replace("/login");
        return;
      }
      if (status !== "authenticated") return;
      try {
        const raw = typeof window !== "undefined" ? localStorage.getItem("onboardingData") : null;
        if (!raw) {
          router.replace("/dashboard");
          return;
        }
        const data = JSON.parse(raw);
        // Map a subset to /api/profile schema
        const body: any = {
          role: data.role,
          name: data.name,
          dateOfBirth: data.dateOfBirth,
          autismProfile: data.autismProfile,
        };
        const res = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || "Failed to save profile");
        }
        // Clear cache and go
        localStorage.removeItem("onboardingData");
        router.replace("/dashboard");
      } catch (e: any) {
        setError(e?.message || "Something went wrong");
      }
    };
    run();
  }, [status, router]);

  return (
    <div className="max-w-md mx-auto py-16 text-center">
      <h1 className="text-2xl font-semibold mb-3">Finishing up…</h1>
      <p className="text-muted-foreground">We’re applying your onboarding details.</p>
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
    </div>
  );
}
