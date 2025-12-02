"use client";

import { motion } from "motion/react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepItem {
  title: string;
  short_description?: string;
}

interface StepTabProps {
  step: StepItem;
  isActive: boolean;
  onClick: () => void;
  isCompleted?: boolean;
  className?: string;
}

const hoverScale = {
  whileHover: { scale: 1.01 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2 },
};

const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const },
};

export function StepTab({ step, isActive, onClick, isCompleted, className }: StepTabProps) {
  return (
    <motion.button
      {...hoverScale}
      onClick={onClick}
      className={cn(
        "flex flex-col items-start rounded-lg px-4 py-2 text-left transition-colors w-full",
        isActive ? "bg-muted border border-border" : "hover:bg-muted/70",
        "relative",
        className
      )}
      aria-current={isActive ? "step" : undefined}
      aria-label={`${step.title}${isCompleted ? " (completed)" : ""}`}
    
    >
      <div className="mb-1 text-sm font-medium">{step.title}</div>
      {step.short_description && (
        <div className="text-xs hidden md:block text-muted-foreground line-clamp-2">
          {step.short_description}
        </div>
      )}
      {isCompleted && (
        <motion.div {...fadeInScale} className="absolute right-2 top-2">
          <div className="rounded-full bg-primary p-1">
            <CheckIcon className="w-2 h-2 text-primary-foreground" />
          </div>
        </motion.div>
      )}
    </motion.button>
  );
}
