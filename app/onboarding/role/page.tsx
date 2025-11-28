"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OnboardingRolePage() {
  const router = useRouter();
  const [role, setRole] = useState<"caree" | "caregiver" | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("onboardingData");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.role) setRole(parsed.role);
      } catch {}
    }
  }, []);

  const next = () => {
    const data: any = { role };
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("onboardingData");
      const prev = raw ? JSON.parse(raw) : {};
      localStorage.setItem("onboardingData", JSON.stringify({ ...prev, ...data }));
    }
    router.push("/onboarding/profile");
  };

  return (
    <div className="max-w-2xl mx-auto py-14">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Choose your role</CardTitle>
          <CardDescription>You can switch later in settings.</CardDescription>
        </CardHeader>
        <CardContent className="py-8 grid gap-6 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setRole("caree")}
            className={`rounded-lg border p-5 text-left transition ${role === "caree" ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
          >
            <div className="text-sm">Caree</div>
            <div className="text-xs text-muted-foreground">I’m seeking support</div>
          </button>
          <button
            type="button"
            onClick={() => setRole("caregiver")}
            className={`rounded-lg border p-5 text-left transition ${role === "caregiver" ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
          >
            <div className="text-sm">Caregiver</div>
            <div className="text-xs text-muted-foreground">I provide support</div>
          </button>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" onClick={() => router.push("/")}>Cancel</Button>
          <Button disabled={!role} onClick={next}>Continue</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
