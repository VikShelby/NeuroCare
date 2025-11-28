import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function CareeDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!(session.user as any)?.profileCompleted) redirect("/onboarding/role");
  if ((session.user as any).role !== "caree") redirect("/dashboard");
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-semibold mb-4">Caree Dashboard</h1>
      <p className="text-muted-foreground mb-6">Welcome. Explore caregivers, share preferences, and manage your care journey.</p>
      <div className="rounded border p-6">Caree-specific features coming soon.</div>
    </div>
  );
}
