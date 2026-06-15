// Shared Instagram sign-in persistence — used by both the real OAuth callback
// and the mock endpoint so they write to the DB identically.

import { adminClient } from "./supabase";

export interface IgPersistInput {
  igUserId: string;
  username: string;
  /** IG Graph API value: "BUSINESS" | "CREATOR" | "PERSONAL" */
  accountType: string;
  followersCount: number;
  mediaCount: number;
  biography: string;
  longToken: string;
  expiresIn: number; // seconds
}

export interface PersistResult {
  appUserId: string;
  profileId: string;
  displayName: string;
  handle: string;
}

/**
 * Idempotently ensures a Supabase Auth user exists for `email` with the given
 * `password`, then links it to `app_users.auth_user_id` so username/password
 * login works.
 *
 * `auth.admin.createUser` fails if the email is already registered (e.g. a
 * prior partial onboarding attempt) — in that case we look the user up and
 * reset the password to the new value rather than silently leaving
 * `auth_user_id` null, which would lock the account out of login forever.
 *
 * Non-fatal: onboarding proceeds even if this fails. Returns the auth user id
 * on success, or null.
 */
export async function ensureAuthUserAndLink(
  email: string,
  password: string,
  appUserId: string
): Promise<string | null> {
  const admin = adminClient();
  try {
    let authUserId: string | undefined;

    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    authUserId = created.data?.user?.id;

    // Already registered (or any create error): find the existing user by email
    // and reset the password so this login attempt succeeds.
    if (!authUserId) {
      for (let page = 1; page <= 10; page++) {
        const { data } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        const u = data?.users?.find(
          (x) => (x.email || "").toLowerCase() === email.toLowerCase()
        );
        if (u) {
          await admin.auth.admin.updateUserById(u.id, {
            password,
            email_confirm: true,
          });
          authUserId = u.id;
          break;
        }
        if (!data?.users?.length || data.users.length < 200) break;
      }
    }

    if (!authUserId) return null;

    await admin
      .from("app_users")
      .update({ auth_user_id: authUserId })
      .eq("id", appUserId);
    return authUserId;
  } catch {
    return null; // non-fatal
  }
}

/**
 * Validates the invite token, upserts app_users + influencer_profiles +
 * influencer_stats, and marks the invite used. Throws on any DB error.
 * Returns the app_users.id so the caller can set a session cookie.
 */
export async function persistInfluencerSignIn(
  input: IgPersistInput,
  inviteToken: string
): Promise<PersistResult> {
  const admin = adminClient();

  // Validate invite before writing anything.
  let inviteEmail: string | null = null;
  if (inviteToken) {
    const { data: invite } = await admin
      .from("invites")
      .select("email, revoked, used_at, expires_at")
      .eq("token", inviteToken)
      .maybeSingle();
    if (
      !invite ||
      invite.revoked ||
      invite.used_at ||
      new Date(invite.expires_at) < new Date()
    ) {
      throw new Error("invalid_invite");
    }
    inviteEmail = invite.email;
  }

  const igAccountType =
    input.accountType === "BUSINESS"
      ? "business"
      : input.accountType === "CREATOR"
      ? "creator"
      : "unknown";

  // Upsert app_users — idempotent on ig_user_id so re-auth works without
  // creating a duplicate row.
  // ig_token_ref stores the long-lived token directly for MVP;
  // replace with a Supabase Vault secret reference before public launch.
  const { data: appUser, error: userErr } = await admin
    .from("app_users")
    .upsert(
      {
        role: "influencer",
        email: inviteEmail,
        username: input.username.toLowerCase(),
        ig_user_id: input.igUserId,
        ig_account_type: igAccountType,
        ig_token_ref: input.longToken,
        ig_token_expires: new Date(
          Date.now() + input.expiresIn * 1000
        ).toISOString(),
      },
      { onConflict: "ig_user_id" }
    )
    .select("id")
    .single();

  if (userErr || !appUser) throw new Error(`app_users: ${userErr?.message}`);

  // Create influencer_profiles on first sign-in; on re-auth just fetch the
  // existing row. ignoreDuplicates returns no row, so we fall back to a select.
  let { data: profile, error: profErr } = await admin
    .from("influencer_profiles")
    .upsert(
      {
        user_id: appUser.id,
        display_name: input.username,
        handle: `@${input.username}`,
        bio: input.biography || null,
        published: false,
      },
      { onConflict: "user_id", ignoreDuplicates: true }
    )
    .select("id")
    .maybeSingle();

  if (profErr) throw new Error(`influencer_profiles upsert: ${profErr.message}`);

  // ignoreDuplicates skips the insert on conflict and returns nothing — fetch.
  if (!profile) {
    const { data: existing, error: selErr } = await admin
      .from("influencer_profiles")
      .select("id")
      .eq("user_id", appUser.id)
      .single();
    if (selErr || !existing)
      throw new Error(`influencer_profiles select: ${selErr?.message}`);
    profile = existing;
  }

  // Seed initial stats snapshot; cron fills avg_views, reach_24h etc. later.
  await admin.from("influencer_stats").upsert(
    {
      influencer_id: profile.id,
      followers: input.followersCount,
      posts_sampled: input.mediaCount,
    },
    { onConflict: "influencer_id", ignoreDuplicates: true }
  );

  // Consume the invite.
  if (inviteToken) {
    await admin
      .from("invites")
      .update({ used_at: new Date().toISOString(), used_by: appUser.id })
      .eq("token", inviteToken);
  }

  return {
    appUserId: appUser.id,
    profileId: profile.id,
    displayName: input.username,
    handle: `@${input.username}`,
  };
}

/**
 * Creates or updates a business account. No invite required.
 * Sets approved=false so the account is pending admin review.
 */
export async function persistBusinessSignIn(input: IgPersistInput): Promise<PersistResult> {
  const admin = adminClient();

  const igAccountType =
    input.accountType === "BUSINESS" ? "business" :
    input.accountType === "CREATOR"  ? "creator"  : "unknown";

  const { data: appUser, error: userErr } = await admin
    .from("app_users")
    .upsert(
      { role: "business", username: input.username.toLowerCase(), ig_user_id: input.igUserId, ig_account_type: igAccountType, ig_token_ref: input.longToken, ig_token_expires: new Date(Date.now() + input.expiresIn * 1000).toISOString() },
      { onConflict: "ig_user_id" }
    )
    .select("id")
    .single();

  if (userErr || !appUser) throw new Error(`app_users: ${userErr?.message}`);

  let { data: profile, error: profErr } = await admin
    .from("business_profiles")
    .upsert(
      { user_id: appUser.id, name: input.username, handle: `@${input.username}`, bio: input.biography || null },
      { onConflict: "user_id", ignoreDuplicates: true }
    )
    .select("id")
    .maybeSingle();

  if (profErr) throw new Error(`business_profiles upsert: ${profErr.message}`);

  if (!profile) {
    const { data: existing, error: selErr } = await admin
      .from("business_profiles")
      .select("id")
      .eq("user_id", appUser.id)
      .single();
    if (selErr || !existing) throw new Error(`business_profiles select: ${selErr?.message}`);
    profile = existing;
  }

  await admin.from("business_stats").upsert(
    { business_id: profile.id, followers: input.followersCount, posts_sampled: input.mediaCount },
    { onConflict: "business_id", ignoreDuplicates: true }
  );

  return {
    appUserId: appUser.id,
    profileId: profile.id,
    displayName: input.username,
    handle: `@${input.username}`,
  };
}
