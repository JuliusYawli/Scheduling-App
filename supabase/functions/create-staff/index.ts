// Creates a staff Auth account + staff/profiles rows, then a welcome email.
// Runs server-side because it needs the service role key to call the Auth
// Admin API and bypass RLS — that key can't ship inside the app.
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "onboarding@resend.dev";

async function sendWelcomeEmail(to: string, name: string, password: string): Promise<void> {
  if (!RESEND_API_KEY) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject: "Your Staff Scheduling account is ready",
        text:
          `Hi ${name}, your account has been created.\n\n` +
          `Email: ${to}\n` +
          `Password: ${password}\n\n` +
          `Sign in with these to see your timetable.`,
      }),
    });
  } catch {
    // best-effort — account creation already succeeded by the time this runs
  }
}

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

  // getUser() needs the caller's JWT passed explicitly — it won't pick it
  // up from a client's global headers.
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

  const { name, email, contactNumber, password, subjectIds } = await req.json();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError) {
    const isDuplicate = createError.message?.toLowerCase().includes("already");
    return json({ error: isDuplicate ? "email-taken" : "create-failed" }, isDuplicate ? 409 : 500);
  }

  const uid = created.user.id;
  const { error: staffError } = await admin.from("staff").insert({
    id: uid,
    name,
    email,
    contact_number: contactNumber,
    subject_ids: subjectIds,
  });
  if (staffError) {
    await admin.auth.admin.deleteUser(uid);
    return json({ error: "create-failed" }, 500);
  }

  const { error: profileError } = await admin.from("profiles").insert({ id: uid, role: "staff", name });
  if (profileError) {
    await admin.auth.admin.deleteUser(uid);
    await admin.from("staff").delete().eq("id", uid);
    return json({ error: "create-failed" }, 500);
  }

  await sendWelcomeEmail(email, name, password);

  return json(
    { id: uid, name, email, contact_number: contactNumber, subject_ids: subjectIds },
    200
  );
});
