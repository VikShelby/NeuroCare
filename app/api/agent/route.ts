import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface N8nWebhookEntry {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  query?: Record<string, string>;
  body?: Record<string, any>;
  webhookUrl?: string;
  executionMode?: string;
  chatMessage?: string | Record<string, any>;
  conversationId?: string;
  userId?: string;
}

function safeEqual(a = "", b = ""): boolean {
  try {
    const A = Buffer.from(String(a));
    const B = Buffer.from(String(b));
    if (A.length !== B.length) return false;
    return crypto.timingSafeEqual(A, B);
  } catch {
    return false;
  }
}

function normalizeIncoming(payload: any): N8nWebhookEntry {
  if (Array.isArray(payload) && payload.length > 0) return payload[0];
  return payload;
}

function parseChatMessage(maybeString: string | Record<string, any> | undefined) {
  if (!maybeString) return null;
  if (typeof maybeString === "object") return maybeString;
  try {
    return JSON.parse(maybeString);
  } catch {
    return maybeString;
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text();

  // Optional secret verification
  const expectedSecret = process.env.N8N_SHARED_SECRET;
  const receivedSecret = req.headers.get("x-n8n-secret");
  if (expectedSecret && (!receivedSecret || !safeEqual(receivedSecret, expectedSecret))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed: any;
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error("Invalid JSON from n8n webhook", err);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const entry: N8nWebhookEntry = normalizeIncoming(parsed);

  const forwardedHeaders = entry.headers || {};
  const n8nBody = entry.body || {};
  const chatMessage = parseChatMessage(entry.chatMessage || n8nBody.chatMessage);

  const record = {
    receivedAt: new Date().toISOString(),
    webhookUrl: entry.webhookUrl || null,
    executionMode: entry.executionMode || null,
    conversationId: entry.conversationId || null,
    userId: entry.userId || (n8nBody.userId as string) || null,
    forwardedHeaders,
    n8nBody,
    chatMessage,
  };

  // TODO: replace with DB insert / queue / processing logic
  console.log("n8n webhook received:", {
    userId: record.userId,
    keys: Object.keys(n8nBody),
    chatMessagePresent: !!chatMessage,
  });

  const traceId = crypto.randomBytes(8).toString("hex");
  return NextResponse.json({
    ok: true,
    traceId,
    received: {
      userId: record.userId,
      conversationId: record.conversationId,
      hasChatMessage: !!chatMessage,
      keys: Object.keys(n8nBody),
    },
  });
}
