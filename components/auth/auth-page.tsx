"use client";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
// https://magicui.design/docs/components/particles
import { Particles } from "@/components/ui/particles";
import { GithubIcon, GoogleIcon } from "@/lib/icons";
import { ChevronLeftIcon, Mail } from "lucide-react";
import type React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function AuthPage() {
	const router = useRouter();

	const handleGoogle = () => {
		signIn("google", { callbackUrl: "/onboarding/oauth-finish" });
	};

	const handleEmail = () => {
		// Require onboarding data before showing register form
		const raw = typeof window !== "undefined" ? localStorage.getItem("onboardingData") : null;
		if (!raw) {
			router.push("/onboarding/role");
			return;
		}
		router.push("/register");
	};
	return (
	
				<div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4">
					<Button asChild className="absolute top-4 left-4" variant="ghost">
						<a href="#">
							<ChevronLeftIcon />
							Home
						</a>
					</Button>
	
					<div className="mx-auto space-y-4 sm:w-sm">
						<Logo className="h-6" />
						<div className="flex flex-col space-y-1">
							<h1 className="font-bold text-2xl tracking-wide">
								Sign In or Join Now!
							</h1>
							<p className="text-base text-muted-foreground">
								login or create your efferd account.
							</p>
						</div>
							<div className="space-y-2">
							<Button className="w-full" size="lg" type="button" onClick={handleGoogle}>
								<GoogleIcon />
								Continue with Google
							</Button>
							<Button className="w-full" size="lg" type="button" onClick={handleEmail}>
								<Mail />
								Continue with Email
							</Button>
						</div>
						<p className="mt-8 text-muted-foreground text-sm">
							By clicking continue, you agree to our{" "}
							<a
								className="underline underline-offset-4 hover:text-primary"
								href="#"
							>
								Terms of Service
							</a>{" "}
							and{" "}
							<a
								className="underline underline-offset-4 hover:text-primary"
								href="#"
							>
								Privacy Policy
							</a>
							.
						</p>
					</div>
				</div>
		
	);
}

