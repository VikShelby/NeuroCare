import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

const schema = z.object({ email: z.string().email() });

function getBaseUrl() {
  return process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
}

async function sendEmail(to: string, url: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({
      from: SMTP_FROM || "no-reply@example.com",
      to,
      subject: "Reset your password",
      html: `<p>Click the link below to reset your password:</p><p><a href="${url}">${url}</a></p>`
    });
  } else {
    // Fallback for local/dev: log the link
    console.log("Password reset link:", url);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    const { email } = parsed.data;

    await connectToDatabase();
    const user = await User.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      user.resetPasswordToken = tokenHash;
      user.resetPasswordExpires = expires;
      await user.save();

      const url = `${getBaseUrl()}/reset-password/${token}`;
      await sendEmail(email, url);
    }

    // Return success regardless to prevent user enumeration
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
