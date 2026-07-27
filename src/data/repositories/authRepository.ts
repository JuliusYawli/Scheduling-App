import { supabase } from "../supabase";
import type { AuthUser, Role } from "../../models";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Incorrect email or password.");
    this.name = "InvalidCredentialsError";
  }
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });
  if (error || !data.user) {
    throw new InvalidCredentialsError();
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", data.user.id)
    .single();
  if (profileError || !profile) {
    await supabase.auth.signOut();
    throw new InvalidCredentialsError();
  }

  const role = profile.role as Role;
  return {
    uid: data.user.id,
    email: normalizedEmail,
    role,
    staffId: role === "staff" ? data.user.id : undefined,
    name: profile.name,
  };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

// Uses Supabase's own built-in email sending, not Resend. `redirectTo` is
// the deep link the email opens back into — see RootNavigator.
export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
  if (error) throw error;
}

export async function establishRecoverySession(accessToken: string, refreshToken: string): Promise<boolean> {
  const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  return !error;
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
