"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/logo";
import NeumorphButton from "@/components/ui/neumorph-button";

export default function RegisterPage() {
  const router = useRouter();
  const { status, data } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      if (!body.gender && onboarding.communicationStyle) body.gender = onboarding.communicationStyle;
      if (onboarding.autismProfile) {
        const ap = onboarding.autismProfile;
        const mapped: any = { ...ap };
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#0A0A0A]">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (status === "authenticated") return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0A0A0A] p-8">
      {/* Logo at top center */}
    <div className="flex justify-center pt-4 pb-8">
          <Logo className="h-8" />
        </div>
<div className="flex-1 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm "
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Create account
          </h1>
          {onboarding ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We'll apply your onboarding details after sign up.
            </p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Want a tailored setup?{" "}
              <a className="underline hover:text-gray-700 dark:hover:text-gray-300" href="/onboarding">
                Start onboarding
              </a>
            </p>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name Input */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name (optional)"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 transition-all"
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 transition-all"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 chars)"
              required
              minLength={6}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <NeumorphButton type="submit" disabled={loading} className="w-full">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Create account
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </NeumorphButton>
        </form>

        <div className="mt-6 text-center space-y-2">
          <a
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Already have an account? <span className="underline">Sign in</span>
          </a>
          <div>
            <a
              href="/choose"
              className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
            >
              Change method
            </a>
          </div>
        </div>
      </motion.div></div>
    </div>
  );
}
