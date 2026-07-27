// Sends one transactional email via Resend. Called by the client right
// after a slot is created (see slotRepository.ts) — runs here because the
// Resend API key can't ship in the app bundle.
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
// Resend's shared sandbox sender — works with no setup, but can only
// deliver to the email address on your own Resend account. Once you verify
// a sending domain, set FROM_EMAIL to an address on that domain instead.
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "method-not-allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "unauthorized" }, 401);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  const {
    data: { user: caller },
  } = await admin.auth.getUser(jwt);
  if (!caller) {
    return json({ error: "unauthorized" }, 401);
  }

  const { data: callerProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .single();
  if (callerProfile?.role !== "admin") {
    return json({ error: "forbidden" }, 403);
  }

  const { to, subject, text } = await req.json();
  if (!to || !subject || !text) {
    return json({ error: "missing-fields" }, 400);
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, text }),
  });

  if (!resendResponse.ok) {
    const detail = await resendResponse.text();
    return json({ error: "send-failed", detail }, 502);
  }

  return json({ ok: true }, 200);
});
