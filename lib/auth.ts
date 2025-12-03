import Google from "next-auth/providers/google";
import LinkedIn from "next-auth/providers/linkedin";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongo";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { JWT } from "next-auth/jwt";
import type { NextAuthOptions } from "next-auth";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  // Use adapter only when MONGODB_URI is configured
  adapter: process.env.MONGODB_URI ? MongoDBAdapter(clientPromise) : undefined,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        await connectToDatabase();
        const existing = await User.findOne({ email })
          .select("name email image password")
          .lean<{ _id: unknown } & { name?: string | null; email: string; image?: string | null; password?: string | null }>();
        if (!existing || !existing.password) return null;
        const valid = await bcrypt.compare(password, existing.password);
        if (!valid) return null;

        return {
          id: String(existing._id),
          name: existing.name ?? null,
          email: existing.email,
          image: existing.image ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        (token as JWT & { id?: string }).id = (user as { id?: string }).id;
      }
      // if Google sign-in, ensure user exists with email in DB for password-less
      if (account?.provider === "google") {
        await connectToDatabase();
        let dbUser = await User.findOne({ email: token.email as string | undefined });
        if (!dbUser) {
          dbUser = await User.create({
            email: token.email as string,
            name: token.name as string | null | undefined,
            image: (token as JWT & { picture?: string | null }).picture ?? undefined,
          });
        }
        (token as JWT & { profileCompleted?: boolean }).profileCompleted = dbUser.profileCompleted ?? false;
        (token as JWT & { category?: string }).category = dbUser.category ?? undefined;
        (token as JWT & { role?: "caree" | "caregiver" }).role = (dbUser as any).role ?? undefined;
      }
      // attach profileCompleted when we have user id but not via Google sign-up
      if ((token as JWT & { id?: string }).id) {
        await connectToDatabase();
        const dbUser = await User.findById((token as JWT & { id?: string }).id).select("profileCompleted category role");
        if (dbUser) {
          (token as JWT & { profileCompleted?: boolean }).profileCompleted = dbUser.profileCompleted ?? false;
          (token as JWT & { category?: string }).category = dbUser.category ?? undefined;
          (token as JWT & { role?: "caree" | "caregiver" }).role = (dbUser as any).role ?? undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if ((token as JWT & { id?: string }).id && session.user) {
        (session.user as unknown as { id?: string }).id = (token as JWT & { id?: string }).id;
      }
      if (session.user) {
        (session.user as unknown as { profileCompleted?: boolean }).profileCompleted = (token as JWT & { profileCompleted?: boolean }).profileCompleted ?? false;
        (session.user as unknown as { category?: string }).category = (token as JWT & { category?: string }).category ?? undefined;
        (session.user as unknown as { role?: "caree" | "caregiver" }).role = (token as JWT & { role?: "caree" | "caregiver" }).role ?? undefined;
      }
      return session;
    },
  },
};
