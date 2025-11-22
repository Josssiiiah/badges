import { db } from "../db/connection";
import { invitations, organizations, user, organizationUsers } from "../db/schema";
import { eq, and, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { randomBytes } from "crypto";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";

// Generate a cryptographically secure invitation token
export function generateInvitationToken(): string {
  return randomBytes(32).toString("hex");
}

// Create invitation for org creator (you send this manually)
export async function createOrgCreatorInvitation(
  email: string,
  organizationName: string,
  expiresInHours: number = 48
) {
  const token = generateInvitationToken();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const [invitation] = await db
    .insert(invitations)
    .values({
      token,
      email: email.toLowerCase().trim(),
      type: "org_creator",
      organizationName,
      status: "pending",
      expiresAt,
      createdBy: null, // You create this manually
    })
    .returning();

  return {
    invitation,
    invitationUrl: `${FRONTEND_URL}/onboard/create-org?token=${token}`,
  };
}

// Create invitation for administrator
export async function createAdminInvitation(
  email: string,
  organizationId: string,
  createdBy: string,
  expiresInHours: number = 168 // 7 days
) {
  const token = generateInvitationToken();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const [invitation] = await db
    .insert(invitations)
    .values({
      token,
      email: email.toLowerCase().trim(),
      type: "administrator",
      organizationId,
      status: "pending",
      expiresAt,
      createdBy,
    })
    .returning();

  return {
    invitation,
    invitationUrl: `${FRONTEND_URL}/onboard/join-admin?token=${token}`,
  };
}

// Create invitation for student
export async function createStudentInvitation(
  email: string,
  organizationId: string,
  createdBy: string,
  expiresInHours: number = 720 // 30 days
) {
  const token = generateInvitationToken();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const [invitation] = await db
    .insert(invitations)
    .values({
      token,
      email: email.toLowerCase().trim(),
      type: "student",
      organizationId,
      status: "pending",
      expiresAt,
      createdBy,
    })
    .returning();

  return {
    invitation,
    invitationUrl: `${FRONTEND_URL}/onboard/join?token=${token}`,
  };
}

// Validate invitation token
export async function validateInvitation(token: string) {
  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, token))
    .limit(1);

  if (!invitation) {
    return { valid: false, error: "Invalid invitation token" };
  }

  if (invitation.status !== "pending") {
    return { valid: false, error: `Invitation has been ${invitation.status}` };
  }

  if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
    // Mark as expired
    await db
      .update(invitations)
      .set({ status: "expired", updatedAt: new Date() })
      .where(eq(invitations.id, invitation.id));

    return { valid: false, error: "Invitation has expired" };
  }

  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, invitation.email))
    .limit(1);

  if (existingUser) {
    return { valid: false, error: "User with this email already exists" };
  }

  // Get organization name if applicable
  let orgName = invitation.organizationName;
  if (invitation.organizationId) {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, invitation.organizationId))
      .limit(1);

    if (org) {
      orgName = org.name;
    }
  }

  return {
    valid: true,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      type: invitation.type,
      organizationId: invitation.organizationId,
      organizationName: orgName,
    },
  };
}

// Mark invitation as used
export async function markInvitationAsUsed(token: string, userId: string) {
  const [updated] = await db
    .update(invitations)
    .set({
      status: "used",
      usedAt: new Date(),
      metadata: JSON.stringify({ userId }),
      updatedAt: new Date(),
    })
    .where(eq(invitations.token, token))
    .returning();

  return updated;
}

// Revoke invitation
export async function revokeInvitation(invitationId: string) {
  const [updated] = await db
    .update(invitations)
    .set({
      status: "revoked",
      updatedAt: new Date(),
    })
    .where(eq(invitations.id, invitationId))
    .returning();

  return updated;
}

// List invitations for an organization
export async function listInvitations(
  organizationId: string,
  filters?: {
    status?: "pending" | "used" | "expired" | "revoked";
    type?: "org_creator" | "administrator" | "student";
  }
) {
  let query = db
    .select()
    .from(invitations)
    .where(eq(invitations.organizationId, organizationId));

  const results = await query;

  // Apply filters in memory (simple approach)
  let filtered = results;
  if (filters?.status) {
    filtered = filtered.filter((inv) => inv.status === filters.status);
  }
  if (filters?.type) {
    filtered = filtered.filter((inv) => inv.type === filters.type);
  }

  return filtered;
}

// Cleanup expired invitations (can be run as a cron job)
export async function cleanupExpiredInvitations() {
  const now = new Date();

  const updated = await db
    .update(invitations)
    .set({
      status: "expired",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(invitations.status, "pending"),
        // expiresAt < now
        // Note: We need to compare timestamps
      )
    )
    .returning();

  return { expiredCount: updated.length, invitations: updated };
}

// Resend invitation email (regenerate token and extend expiry)
export async function resendInvitation(invitationId: string) {
  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.id, invitationId))
    .limit(1);

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status === "used") {
    throw new Error("Cannot resend used invitation");
  }

  // Generate new token and extend expiry
  const newToken = generateInvitationToken();
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const [updated] = await db
    .update(invitations)
    .set({
      token: newToken,
      expiresAt: newExpiresAt,
      status: "pending",
      updatedAt: new Date(),
    })
    .where(eq(invitations.id, invitationId))
    .returning();

  // Build invitation URL based on type
  let invitationUrl = "";
  switch (updated.type) {
    case "org_creator":
      invitationUrl = `${FRONTEND_URL}/onboard/create-org?token=${newToken}`;
      break;
    case "administrator":
      invitationUrl = `${FRONTEND_URL}/onboard/join-admin?token=${newToken}`;
      break;
    case "student":
      invitationUrl = `${FRONTEND_URL}/onboard/join?token=${newToken}`;
      break;
  }

  return {
    invitation: updated,
    invitationUrl,
  };
}
