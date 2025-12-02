import { Particles } from "@/components/ui/particles";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full md:h-screen md:overflow-hidden">
				<Particles
					className="absolute inset-0"
					color="#666666"
					ease={20}
					quantity={120}
				/>
                {children}
      </div>
  );
}
