"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Steps } from "@/components/ui/feature-carousel";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [role, setRole] = useState<"caree" | "caregiver" | null>(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [communicationStyle, setCommunicationStyle] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [availability, setAvailability] = useState("");

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("onboardingData") : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.role) setRole(parsed.role);
        if (parsed.name) setName(parsed.name);
        if (parsed.dateOfBirth) setDateOfBirth(parsed.dateOfBirth);
        if (parsed.pronouns) setPronouns(parsed.pronouns);
        if (parsed.communicationStyle) setCommunicationStyle(parsed.communicationStyle);
        if (parsed.experienceYears) setExperienceYears(parsed.experienceYears);
        if (parsed.specialties) setSpecialties(parsed.specialties);
        if (parsed.availability) setAvailability(parsed.availability);
      } catch {}
    }
  }, []);

  const steps = ["Basics", role === "caree" ? "Personalization" : "Experience", "Review"];

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const saveAndNext = () => {
    const data: any = {
      name: name?.trim() || undefined,
      dateOfBirth: dateOfBirth || undefined,
      pronouns: pronouns?.trim() || undefined,
      communicationStyle: communicationStyle?.trim() || undefined,
      experienceYears: experienceYears?.trim() || undefined,
      specialties: specialties?.trim() || undefined,
      availability: availability?.trim() || undefined,
    };
    const raw = typeof window !== "undefined" ? localStorage.getItem("onboardingData") : null;
    const prev = raw ? JSON.parse(raw) : {};
    if (typeof window !== "undefined") {
      localStorage.setItem("onboardingData", JSON.stringify({ ...prev, ...data }));
    }
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

  return (
    <div className="max-w-3xl mx-auto py-14">
      <div className="mb-8">
        <Steps steps={steps.map((t, i) => ({ id: String(i + 1), name: t, title: t, description: "" }))} current={step} onChange={() => {}} />
      </div>

      {step === 0 && (
        <Card className="mb-6">
          <CardHeader className="border-b">
            <CardTitle>Basics</CardTitle>
            <CardDescription>Just a couple fields to personalize your experience.</CardDescription>
          </CardHeader>
          <CardContent className="py-8 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Date of Birth (optional)</label>
              <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => router.push("/onboarding/role")}>Back</Button>
            <Button onClick={saveAndNext}>Next</Button>
          </CardFooter>
        </Card>
      )}

      {step === 1 && role === "caree" && (
        <Card className="mb-6">
          <CardHeader className="border-b">
            <CardTitle>Personalization</CardTitle>
            <CardDescription>Helps caregivers understand your preferences.</CardDescription>
          </CardHeader>
          <CardContent className="py-8 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Pronouns (optional)</label>
              <input value={pronouns} onChange={(e) => setPronouns(e.target.value)} placeholder="she/her, he/him, they/them" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Preferred communication style</label>
              <input value={communicationStyle} onChange={(e) => setCommunicationStyle(e.target.value)} placeholder="Short texts, visual aids, etc." className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
            <Button onClick={saveAndNext}>Next</Button>
          </CardFooter>
        </Card>
      )}

      {step === 1 && role === "caregiver" && (
        <Card className="mb-6">
          <CardHeader className="border-b">
            <CardTitle>Experience</CardTitle>
            <CardDescription>Share a bit about your background providing support.</CardDescription>
          </CardHeader>
          <CardContent className="py-8 grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Experience (years)</label>
              <input value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="e.g. 3" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Caregiver skills (comma-separated)</label>
              <input value={specialties} onChange={(e) => setSpecialties(e.target.value)} placeholder="ABA, sensory support" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Availability</label>
              <input value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="Weekdays after 3pm, weekends" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
            <Button onClick={saveAndNext}>Next</Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Review</CardTitle>
            <CardDescription>Looks good? We’ll continue to questions next.</CardDescription>
          </CardHeader>
          <CardContent className="py-6 text-sm space-y-2">
            <div><span className="text-muted-foreground">Role:</span> {role}</div>
            <div><span className="text-muted-foreground">Name:</span> {name || '-'}</div>
            <div><span className="text-muted-foreground">DOB:</span> {dateOfBirth || '-'}</div>
            {role === "caree" && <div><span className="text-muted-foreground">Pronouns:</span> {pronouns || '-'}</div>}
            {role === "caree" && <div><span className="text-muted-foreground">Communication style:</span> {communicationStyle || '-'}</div>}
            {role === "caregiver" && <div><span className="text-muted-foreground">Experience (years):</span> {experienceYears || '-'}</div>}
            {role === "caregiver" && <div><span className="text-muted-foreground">Skills:</span> {specialties || '-'}</div>}
            {role === "caregiver" && <div><span className="text-muted-foreground">Availability:</span> {availability || '-'}</div>}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={saveAndNext}>Continue to Questions</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
