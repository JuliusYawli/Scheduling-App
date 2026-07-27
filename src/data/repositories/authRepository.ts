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

/**
 * Sends a password-reset email (Supabase's own built-in email sending, not
 * Resend — GoTrue handles this one itself). `redirectTo` is the deep link
 * the email's link opens the app back into; see RootNavigator for the
 * handler that reads the recovery tokens off that URL.
 */
export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
  if (error) throw error;
}

/**
 * Activates the one-time recovery session from the tokens embedded in the
 * password-reset deep link, so updatePassword() below has something to act
 * on. Doesn't throw on failure — an expired/reused link should just fail
 * quietly and let the reset screen show its own error state.
 */
export async function establishRecoverySession(accessToken: string, refreshToken: string): Promise<boolean> {
  const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  return !error;
}

/** Used both by the reset-password flow and the logged-in "change password" screen. */
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
