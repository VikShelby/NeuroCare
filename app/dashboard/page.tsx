import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!session.user?.profileCompleted) redirect("/onboarding/role");
  const role = (session.user as any).role as undefined | "caree" | "caregiver";
  if (role === "caree") redirect("/dashboard/caree");
  if (role === "caregiver") redirect("/dashboard/caregiver");
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>
      <p className="text-muted-foreground mb-6">Welcome, your profile is complete. This is the protected dashboard area.</p>
      <div className="rounded border p-6">Future dashboard content goes here.</div>
    </div>
  );
}
