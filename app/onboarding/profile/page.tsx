"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Removed Steps carousel in favor of a simple progress bar
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { GradientHeading } from "@/components/ui/gradient-heading";
import { DatePicker } from "@/components/ui/datepicker";
import NeumorphButton from "@/components/ui/neumorph-button";
import { AuthMenu } from "@/components/auth/menu";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [role, setRole] = useState<"caree" | "caregiver" | null>(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [gender, setGender] = useState("");
  const [diagnosis, setDiagnosis] = useState("ASD Level 1");
  const [formalDiagnosis, setFormalDiagnosis] = useState("Yes");

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("onboardingData") : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.role) setRole(parsed.role);
        if (parsed.name) setName(parsed.name);
        if (parsed.dateOfBirth) setDateOfBirth(parsed.dateOfBirth);
        if (parsed.pronouns) setPronouns(parsed.pronouns);
        if (parsed.gender) setGender(parsed.gender);
        else if (parsed.communicationStyle) setGender(parsed.communicationStyle);
        if (parsed.autismProfile?.diagnosis) setDiagnosis(parsed.autismProfile.diagnosis);
        if (parsed.autismProfile?.formalDiagnosis) setFormalDiagnosis(parsed.autismProfile.formalDiagnosis);
        // Backward compat: legacy key supportNeeds -> formalDiagnosis
        else if (parsed.autismProfile?.supportNeeds) setFormalDiagnosis(parsed.autismProfile.supportNeeds);
      } catch {}
    }
  }, []);

  const steps = role === "caree"
    ? ["Basic Information", "Gender and Identity", "Autism Spectrum Disorder"]
    : ["Basic Information"];

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const saveAndNext = async () => {
    const data: any = {
      name: name?.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
      pronouns: pronouns?.trim() || undefined,
      gender: gender?.trim() || undefined,
    };
    const raw = typeof window !== "undefined" ? localStorage.getItem("onboardingData") : null;
    const prev = raw ? JSON.parse(raw) : {};
    // Merge ASD fields for caree
    const ap: any = {
      ...(diagnosis ? { diagnosis: diagnosis.trim() } : {}),
      ...(formalDiagnosis ? { formalDiagnosis: formalDiagnosis.trim() } : {}),
    };
    if (ap.diagnosis || ap.formalDiagnosis) {
      data.autismProfile = { ...(prev?.autismProfile || {}), ...ap };
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("onboardingData", JSON.stringify({ ...prev, ...data }));
    }
    // Note: We persist profile details after account creation in register flow
    if (step < steps.length - 1) next();
    else router.push("/onboarding/qa");
  };

  if (!role) {
    return (
      <div className="max-w-2xl mx-auto py-14">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Let’s start with your role</CardTitle>
            <CardDescription>Go back to choose your role first.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-end">
            <Button onClick={() => router.replace("/onboarding/role")}>Choose role</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  const ASDL =[
    {
      name: "ASD Level 1",
    },
    {
      name: "ASD Level 2",
    },
    {
      name: "ASD Level 3",

    }

  ]
  const asdLevels = ASDL.map((level) => level.name);
  const formal = ['Yes' , 'No' , 'Prefer not to say'];
  const progressPercent = Math.round(((step + 1) / steps.length) * 100)
  const stepSubtitle = (() => {
    if (step === 0)
      return "Tell us a bit about you so we can personalize your care experience and match helpful resources.";
    if (step === 1) {
      return role === "caree"
        ? "Share identity, gender, and pronoun preferences to guide inclusive interactions, comfort, and clarity with caregivers."
        : "Share your support background and availability to match with families effectively.";
    }
    return "You're set — continue to tailored questions to complete your onboarding.";
  })()
  return (
    <div className="max-w-3xl mx-auto py-14">
      <div className=" space-y-3">
        
        <Progress
          value={progressPercent}
          aria-label={`Progress: ${progressPercent}%`}
        />
        <div className="w-full mt-4 flex items-center justify-between">
          <div className="flex items-start justify-center max-w-[600px] flex-col">
             <GradientHeading size={'sm'} weight={'black'}>{steps[step]}</GradientHeading>
             <span className="text-sm text-muted-foreground ">{stepSubtitle}</span>
           </div>
             <div className="text-right text-xs text-muted-foreground" aria-live="polite">Step {step + 1} of {steps.length}</div>
        </div>

      
      </div>

      {step === 0 && (
       <div className="w-full flex flex-col gap-1">
        
          <CardContent className="pb-8 pt-3 px-0 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <DatePicker
                value={dateOfBirth}
                onChange={(v) => setDateOfBirth(v)}
                label="Date of Birth (optional)"
                id="dob"
                className="w-full"
              />
            </div>
          </CardContent>
         <div className="flex items-end justify-end gap-2">
            <NeumorphButton size={'small'} intent={'danger'} onClick={() => router.push("/onboarding/role")}>Back</NeumorphButton>
            <NeumorphButton size={'small'} onClick={saveAndNext}>Continue</NeumorphButton>
          </div> 
          
        </div>
      )}

      {step === 1 && role === "caree" && (
        <div className="w-full flex flex-col gap-1">
        
          <CardContent className="pb-8 pt-3 px-0 grid gap-6 sm:grid-cols-2">
           
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Pronouns (optional)</label>
              <Input value={pronouns} onChange={(e) => setPronouns(e.target.value)} placeholder="she/her, he/him, they/them" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Gender (optional)</label>
              <Input value={gender} onChange={(e) => setGender(e.target.value)} placeholder="e.g., woman, man, non-binary, prefer not to say" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </CardContent>
         <div className="flex items-end justify-end gap-2">
            <NeumorphButton size={'small'} intent={'danger'} onClick={() => setStep(0)}>Back</NeumorphButton>
            <NeumorphButton size={'small'} onClick={saveAndNext}>Continue</NeumorphButton>
          </div> 
          
        </div>
        
      )}

      {/* Caregiver path simplified: no experience fields */}

      {/* Autism Spectrum Disorder step for caree before review */}
      {role === "caree" && step === 2 && (
           <div className="w-full flex flex-col gap-1">
        
          <CardContent className="pb-8 pt-3 px-0 grid gap-6 sm:grid-cols-2">
           
           <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">ASD Level</label>
              <AuthMenu items={asdLevels} title="ASD Level" selected={diagnosis} setSelected={setDiagnosis} />
             
            </div>
            <div className="space-y-2 ">
              <label className="text-xs font-medium text-muted-foreground">Formal autism diagnosis</label>
              <AuthMenu items={formal} title="Formal diagnosis" selected={formalDiagnosis} setSelected={setFormalDiagnosis} />
            </div>
          </CardContent>
         <div className="flex items-end justify-end gap-2">
            <NeumorphButton size={'small'} intent={'danger'} onClick={() => setStep(1)}>Back</NeumorphButton>
            <NeumorphButton size={'small'} onClick={saveAndNext}>Continue</NeumorphButton>
          </div> 
          
        </div>
      
      )}

      {/* No review step; final Next/Continue moves directly to questions */}
    </div>
  );
}
