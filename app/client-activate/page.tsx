import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export default async function ClientActivatePage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) redirect("/login");
  await connectToDatabase();
  await User.findOneAndUpdate(
    { email: session.user.email },
    { $set: { category: "client", profileCompleted: true } },
    { new: true }
  );
  redirect("/jobs/post");
}
