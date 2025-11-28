"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Steps } from "@/components/ui/feature-carousel";
import { signIn, signOut, useSession } from "next-auth/react";

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      <span>{label}</span>
    </label>
  );
}

function OptionGroup({ title, options, value, onChange }: { title: string; options: string[]; value: string[]; onChange: (arr: string[]) => void }) {
  const toggle = (opt: string, v: boolean) => {
    if (v) onChange(Array.from(new Set([...value, opt])));
    else onChange(value.filter((x) => x !== opt));
  };
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-2">{title}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <Checkbox key={opt} checked={value.includes(opt)} onChange={(v) => toggle(opt, v)} label={opt} />
        ))}
      </div>
    </div>
  );
}

export default function OnboardingQAPage() {
  const router = useRouter();
  const { status } = useSession();
  const [role, setRole] = useState<"caree" | "caregiver" | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("onboardingData") : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.role) setRole(parsed.role);
      } catch {}
    }
  }, []);

  const steps = useMemo(() => ["Communication", "Sensory & Triggers", "Routines & Calming", "Interests & Goals", "Review"], []);
  const [step, setStep] = useState(0);

  // selections
  const [communication, setCommunication] = useState<string[]>([]);
  const [sensory, setSensory] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [calming, setCalming] = useState<string[]>([]);
  const [routinesImportance, setRoutinesImportance] = useState<string>("");
  const [interests, setInterests] = useState<string>("");
  const [careGoals, setCareGoals] = useState<string>("");
  const [supportNeeds, setSupportNeeds] = useState<string[]>([]);

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const persist = () => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("onboardingData") : null;
    const prev = raw ? JSON.parse(raw) : {};
    const autismProfile = {
      communicationNotes: communication.join(", "),
      sensoryPreferences: sensory.join(", "),
      triggers: triggers.join(", "),
      calmingStrategies: calming.join(", "),
      routines: routinesImportance,
      interests: interests
        ? interests.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
        : [],
      careGoals: careGoals || undefined,
      supportNeeds: supportNeeds.join(", "),
    };
    const data = { ...prev, autismProfile };
    if (typeof window !== "undefined") localStorage.setItem("onboardingData", JSON.stringify(data));
    return data;
  };

  const continueToEmail = async () => {
    persist();
    if (status === "authenticated") {
      // Ensure reaching register by signing out first.
      await signOut({ callbackUrl: "/register" });
      return;
    }
    router.push("/register");
  };

  const startNewAccount = async () => {
    // For cases where user is already authenticated but wants to create a NEW account.
    persist();
    if (typeof window !== "undefined") {
      // Keep onboardingData; after signOut redirect to register and allow reuse.
    }
    await signOut({ callbackUrl: "/register" });
  };
  const continueWithGoogle = () => {
    persist();
    signIn("google", { callbackUrl: "/onboarding/oauth-finish" });
  };

  return (
    <div className="max-w-3xl mx-auto py-14">
      <div className="mb-8">
        <Steps steps={steps.map((t, i) => ({ id: String(i + 1), name: t, title: t, description: "" }))} current={step} onChange={() => {}} />
      </div>

      {step === 0 && (
        <Card className="mb-6">
          <CardHeader className="border-b">
            <CardTitle>Communication</CardTitle>
            <CardDescription>How do you prefer to communicate?</CardDescription>
          </CardHeader>
          <CardContent className="py-8 space-y-6">
            <OptionGroup
              title="Methods"
              options={["Text messages", "Voice calls", "Video calls", "In-person", "Visual aids", "Short concise messages"]}
              value={communication}
              onChange={setCommunication}
            />
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => router.push("/onboarding/profile")}>Back</Button>
            <Button onClick={next}>Next</Button>
          </CardFooter>
        </Card>
      )}

      {step === 1 && (
        <Card className="mb-6">
          <CardHeader className="border-b">
            <CardTitle>Sensory & Triggers</CardTitle>
            <CardDescription>What should caregivers be mindful of?</CardDescription>
          </CardHeader>
          <CardContent className="py-8 space-y-6">
            <OptionGroup
              title="Sensory sensitivities"
              options={["Loud sounds", "Bright lights", "Strong smells", "Crowds", "Textures", "Temperature"]}
              value={sensory}
              onChange={setSensory}
            />
            <OptionGroup
              title="Triggers"
              options={["Unexpected changes", "Time pressure", "Interruptions", "Certain topics", "Certain places"]}
              value={triggers}
              onChange={setTriggers}
            />
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={back}>Back</Button>
            <Button onClick={next}>Next</Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card className="mb-6">
          <CardHeader className="border-b">
            <CardTitle>Routines & Calming</CardTitle>
            <CardDescription>Share the structure and strategies that help.</CardDescription>
          </CardHeader>
          <CardContent className="py-8 space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">How important are routines?</div>
              <div className="grid gap-2 sm:grid-cols-5">
                {["Flexible", "Somewhat", "Important", "Very", "Essential"].map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setRoutinesImportance(o)}
                    className={`rounded border px-3 py-2 text-sm ${routinesImportance === o ? "ring-2 ring-primary" : "hover:bg-muted/50"}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <OptionGroup
              title="Calming strategies"
              options={["Quiet space", "Deep pressure", "Headphones", "Stimming", "Breathing exercises", "Weighted blanket"]}
              value={calming}
              onChange={setCalming}
            />
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={back}>Back</Button>
            <Button onClick={next}>Next</Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card className="mb-6">
          <CardHeader className="border-b">
            <CardTitle>Interests & Goals</CardTitle>
            <CardDescription>What brings joy and what are your goals?</CardDescription>
          </CardHeader>
          <CardContent className="py-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Interests (comma or newline)</label>
              <textarea value={interests} onChange={(e) => setInterests(e.target.value)} className="w-full min-h-20 rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Care goals</label>
              <textarea value={careGoals} onChange={(e) => setCareGoals(e.target.value)} className="w-full min-h-20 rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <OptionGroup
              title="Support needs"
              options={["Routine planning", "Sensory-friendly environments", "Social support", "Executive function support", "Transportation", "Health appointments"]}
              value={supportNeeds}
              onChange={setSupportNeeds}
            />
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={back}>Back</Button>
            <Button onClick={next}>Next</Button>
          </CardFooter>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Review</CardTitle>
            <CardDescription>We’ll save after you sign up or sign in.</CardDescription>
          </CardHeader>
          <CardContent className="py-6 text-sm space-y-2">
            <div><span className="text-muted-foreground">Role:</span> {role || '-'}</div>
            <div><span className="text-muted-foreground">Communication:</span> {communication.join(", ") || '-'}</div>
            <div><span className="text-muted-foreground">Sensory:</span> {sensory.join(", ") || '-'}</div>
            <div><span className="text-muted-foreground">Triggers:</span> {triggers.join(", ") || '-'}</div>
            <div><span className="text-muted-foreground">Calming:</span> {calming.join(", ") || '-'}</div>
            <div><span className="text-muted-foreground">Routines:</span> {routinesImportance || '-'}</div>
            <div><span className="text-muted-foreground">Interests:</span> {interests || '-'}</div>
            <div><span className="text-muted-foreground">Care goals:</span> {careGoals || '-'}</div>
            <div><span className="text-muted-foreground">Support needs:</span> {supportNeeds.join(", ") || '-'}</div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="flex gap-3 order-2 sm:order-1">
              <Button variant="outline" onClick={back}>Back</Button>
            </div>
            <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
              {status !== "authenticated" && (
                <Button className="flex-1" onClick={continueToEmail}>Create Account</Button>
              )}
              {status === "authenticated" && (
                <Button className="flex-1" onClick={continueToEmail}>Finish & Save</Button>
              )}
              {status !== "authenticated" && (
                <Button className="flex-1" variant="outline" onClick={() => router.push("/login")}>Log In Instead</Button>
              )}
              <Button className="flex-1" variant="secondary" onClick={continueWithGoogle}>{status === "authenticated" ? "Update via Google" : "Continue with Google"}</Button>
            </div>
          </CardFooter>
        </Card>
      )}
      {step === 4 && status === "authenticated" && (
        <div className="mt-6 text-center text-xs text-muted-foreground">
          Want to create a different account? <button onClick={startNewAccount} className="underline">Sign out & register</button>
        </div>
      )}
    </div>
  );
}
