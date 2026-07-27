// Creates a staff member's Auth account + staff/profiles rows.
//
// This has to run server-side: creating an Auth user via the Admin API and
// inserting into `profiles` need the service role key, which bypasses Row
// Level Security entirely and must never ship inside the app bundle. The
// client (src/data/repositories/staffRepository.ts) calls this via
// supabase.functions.invoke("create-staff", ...), which automatically
// forwards the admin's own session token — used below to check that
// whoever's calling is actually an admin before creating anything.
//
// Deploy with: supabase functions deploy create-staff
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

  // auth.getUser() only inspects a client's own stored session by default;
  // passing the caller's JWT explicitly is what actually verifies *their*
  // token (global.headers on the client does not feed into this call).
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

  return json(
    { id: uid, name, email, contact_number: contactNumber, subject_ids: subjectIds },
    200
  );
});
