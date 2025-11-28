"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Steps } from "@/components/ui/feature-carousel";

interface OnboardingData {
  role: "caree" | "caregiver" | null;
  name?: string;
  dateOfBirth?: string;
  experienceYears?: string; // caregiver-only, simple string for now
  specialties?: string; // caregiver-only
  pronouns?: string; // caree-only
  communicationStyle?: string;
  autismProfile: {
    aboutMe?: string;
    interests?: string; // comma-separated in UI, split before save
    sensoryPreferences?: string;
    routines?: string;
    triggers?: string;
    calmingStrategies?: string;
    communicationNotes?: string;
    careGoals?: string;
  };
}

export default function OnboardingPage() {
  if (typeof window !== "undefined") {
    window.location.replace("/onboarding/role");
  }
  return null;
}
