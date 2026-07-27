// Deletes a staff member's Auth account + staff/profiles rows. Mirrors
// create-staff: needs the service role key server-side for the Auth Admin
// API. Slots/attendance for this staff member cascade away on their own.
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

  const { staffId } = await req.json();
  if (!staffId) {
    return json({ error: "missing-staff-id" }, 400);
  }

  await admin.from("staff").delete().eq("id", staffId);
  await admin.from("profiles").delete().eq("id", staffId);
  const { error } = await admin.auth.admin.deleteUser(staffId);
  if (error) {
    return json({ error: "delete-failed" }, 500);
  }

  return json({ ok: true }, 200);
});
