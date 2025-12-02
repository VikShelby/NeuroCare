"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon, ExternalLinkIcon } from "lucide-react"
import {
  AnimatePresence,
  motion,
  useAnimation,
  type PanInfo,
} from "motion/react"
import { cn } from "@/lib/utils";
import NeumorphButton from "@/components/ui/neumorph-button";
import { GradientHeading } from "@/components/ui/gradient-heading";
interface StepItem {
  title: string
  short_description: string
}

interface StepTabProps {
  step: StepItem
  isActive: boolean
  onClick: () => void
  isCompleted: boolean
}
const hoverScale = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2 },
}
const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const },
}

const slideInOut = (direction: 1 | -1) => ({
  initial: { opacity: 0, x: 20 * direction },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 * direction },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
})

function StepTab({ step, isActive, onClick, isCompleted }: StepTabProps) {
  return (
    <motion.button
      {...hoverScale}
      onClick={onClick}
      className={cn(
        "flex flex-col items-start rounded-lg px-4 py-2 text-left transition-colors w-full",
        isActive ? "bg-muted border border-border" : "hover:bg-muted/70",
        "relative"
      )}
      aria-current={isActive ? "step" : undefined}
      aria-label={`${step.title}${isCompleted ? " (completed)" : ""}`}
    >
      <div className="mb-1 text-sm font-medium">{step.title}</div>
      <div className="text-xs hidden md:block text-muted-foreground line-clamp-2">
        {step.short_description}
      </div>
      {isCompleted && (
        <motion.div {...fadeInScale} className="absolute right-2 top-2">
          <div className="rounded-full bg-primary p-1">
            <CheckIcon className="w-2 h-2 text-primary-foreground" />
          </div>
        </motion.div>
      )}
    </motion.button>
  )
}


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
  // Role options presented via StepTab components
  const roles: Array<{ key: "caree" | "caregiver"; step: StepItem }> = [
    {
      key: "caree",
      step: {
        title: "Caree",
        short_description: "I’m seeking support",
      },
    },
    {
      key: "caregiver",
      step: {
        title: "Caregiver",
        short_description: "I provide support",
      },
    },
  ]
  return (
    <div className="max-w-2xl h-screen mx-auto py-20">
   
      <div className="flex items-center h-full flex-col w-full  justify-center">

        <div className="flex w-full items-start flex-col justify-center px-6">
           <GradientHeading size={'md'} weight={'black'}>
            Welcome To NeuroLink
           </GradientHeading>
           <span>
            <div className="mt-2 text-sm text-muted-foreground">
              <p className="mb-2">
                Select your role to get started. Choosing "Caree" means you are seeking support; choosing "Caregiver" means you provide support to others.
              </p>
             
            </div>
           </span>
        </div>
        <CardContent className="pt-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
            {roles.map(({ key, step }) => (
              <StepTab
                key={key}
                step={step}
                isActive={role === key}
                isCompleted={role === key}
                onClick={() => setRole(key)}
              />
            ))}
          </div>
        </CardContent>
        <div className="flex w-full items-end justify-end px-6 gap-3 mb-[40px]">
          <NeumorphButton size={'small'} intent={'danger'} onClick={() => router.push("/")} >Cancel</NeumorphButton>
            <NeumorphButton size={'small'} disabled={!role} onClick={next} >Continue</NeumorphButton>
        </div>
          
        </div>
    </div>
  );
}
