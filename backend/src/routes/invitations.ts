import { Elysia, t } from "elysia";
import { db } from "../db/connection";
import { invitations, organizations, user, organizationUsers } from "../db/schema";
import { eq } from "drizzle-orm";
import { setup } from "../setup";
import { userMiddleware } from "../middleware/auth-middleware";
import * as invitationService from "../services/invitation";
import {
  sendOrgCreatorInvitation,
  sendAdminInvitation,
  sendStudentInvitation,
} from "../services/email";
import { nanoid } from "nanoid";

export const invitationRoutes = new Elysia({ prefix: "/invitations" })
  .use(setup)

  .post(
    "/validate-token",
    async ({ body, set }) => {
      try {
        const { token } = body;

        if (!token) {
          set.status = 400;
          return { error: "Token is required" };
        }

        const result = await invitationService.validateInvitation(token);

        if (!result.valid) {
          set.status = 400;
          return { error: result.error };
        }

        return {
          valid: true,
          invitation: result.invitation,
        };
      } catch (error) {
        console.error("[invitations] Error validating token:", error);
        set.status = 500;
        return { error: "Failed to validate invitation" };
      }
    },
    {
      body: t.Object({
        token: t.String(),
      }),
    }
  )

  .post(
    "/complete-org-creation",
    async ({ body, set, headers }) => {
      try {
        const { token, password, orgName, userName } = body;

        // Validate invitation
        const validation = await invitationService.validateInvitation(token);
        if (!validation.valid || !validation.invitation) {
          set.status = 400;
          return { error: validation.error || "Invalid invitation" };
        }

        const invitation = validation.invitation;

        if (invitation.type !== "org_creator") {
          set.status = 400;
          return { error: "This invitation is not for organization creation" };
        }

        // Create organization
        const [organization] = await db
          .insert(organizations)
          .values({
            name: orgName,
            short_code: nanoid(6).toUpperCase(),
          })
          .returning();

        // Create user account via BetterAuth
        const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
        const signupResponse = await fetch(`${backendUrl}/api/auth/sign-up/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userName,
            email: invitation.email,
            password,
            role: "administrator",
            organizationId: organization.id,
            organization: organization.name,
          }),
        });

        if (!signupResponse.ok) {
          const errorData = await signupResponse.json();
          set.status = 400;
          return { error: errorData.error || "Failed to create user account" };
        }

        const signupData = await signupResponse.json();

        // Create organization_users record
        await db.insert(organizationUsers).values({
          organizationId: organization.id,
          userId: signupData.user.id,
          role: "administrator",
        });

        // Mark invitation as used
        await invitationService.markInvitationAsUsed(token, signupData.user.id);

        // Sign in the user
        const signinResponse = await fetch(`${backendUrl}/api/auth/sign-in/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: invitation.email,
            password,
          }),
        });

        if (!signinResponse.ok) {
          set.status = 400;
          return { error: "Account created but failed to sign in. Please sign in manually." };
        }

        const signinData = await signinResponse.json();

        return {
          success: true,
          organization,
          user: signupData.user,
          session: signinData,
        };
      } catch (error) {
        console.error("[invitations] Error completing org creation:", error);
        set.status = 500;
        return { error: "Failed to complete organization creation" };
      }
    },
    {
      body: t.Object({
        token: t.String(),
        password: t.String({ minLength: 8 }),
        orgName: t.String(),
        userName: t.String(),
      }),
    }
  )

  .post(
    "/complete-admin-join",
    async ({ body, set }) => {
      try {
        const { token, password, userName } = body;

        // Validate invitation
        const validation = await invitationService.validateInvitation(token);
        if (!validation.valid || !validation.invitation) {
          set.status = 400;
          return { error: validation.error || "Invalid invitation" };
        }

        const invitation = validation.invitation;

        if (invitation.type !== "administrator") {
          set.status = 400;
          return { error: "This invitation is not for an administrator" };
        }

        if (!invitation.organizationId) {
          set.status = 400;
          return { error: "Invalid invitation: missing organization" };
        }

        // Get organization
        const [organization] = await db
          .select()
          .from(organizations)
          .where(eq(organizations.id, invitation.organizationId))
          .limit(1);

        if (!organization) {
          set.status = 400;
          return { error: "Organization not found" };
        }

        // Create user account via BetterAuth
        const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
        const signupResponse = await fetch(`${backendUrl}/api/auth/sign-up/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userName,
            email: invitation.email,
            password,
            role: "administrator",
            organizationId: organization.id,
            organization: organization.name,
          }),
        });

        if (!signupResponse.ok) {
          const errorData = await signupResponse.json();
          set.status = 400;
          return { error: errorData.error || "Failed to create user account" };
        }

        const signupData = await signupResponse.json();

        // Create organization_users record
        await db.insert(organizationUsers).values({
          organizationId: organization.id,
          userId: signupData.user.id,
          role: "administrator",
        });

        // Mark invitation as used
        await invitationService.markInvitationAsUsed(token, signupData.user.id);

        // Sign in the user
        const signinResponse = await fetch(`${backendUrl}/api/auth/sign-in/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: invitation.email,
            password,
          }),
        });

        if (!signinResponse.ok) {
          set.status = 400;
          return { error: "Account created but failed to sign in. Please sign in manually." };
        }

        const signinData = await signinResponse.json();

        return {
          success: true,
          organization,
          user: signupData.user,
          session: signinData,
        };
      } catch (error) {
        console.error("[invitations] Error completing admin join:", error);
        set.status = 500;
        return { error: "Failed to complete admin invitation" };
      }
    },
    {
      body: t.Object({
        token: t.String(),
        password: t.String({ minLength: 8 }),
        userName: t.String(),
      }),
    }
  )

  // Public endpoint: Complete student join invitation
  .post(
    "/complete-student-join",
    async ({ body, set }) => {
      try {
        const { token, password, userName } = body;

        // Validate invitation
        const validation = await invitationService.validateInvitation(token);
        if (!validation.valid || !validation.invitation) {
          set.status = 400;
          return { error: validation.error || "Invalid invitation" };
        }

        const invitation = validation.invitation;

        if (invitation.type !== "student") {
          set.status = 400;
          return { error: "This invitation is not for a student" };
        }

        if (!invitation.organizationId) {
          set.status = 400;
          return { error: "Invalid invitation: missing organization" };
        }

        // Get organization
        const [organization] = await db
          .select()
          .from(organizations)
          .where(eq(organizations.id, invitation.organizationId))
          .limit(1);

        if (!organization) {
          set.status = 400;
          return { error: "Organization not found" };
        }

        // Create user account via BetterAuth
        const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
        const signupResponse = await fetch(`${backendUrl}/api/auth/sign-up/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userName,
            email: invitation.email,
            password,
            role: "student",
            organizationId: organization.id,
            organization: organization.name,
          }),
        });

        if (!signupResponse.ok) {
          const errorData = await signupResponse.json();
          set.status = 400;
          return { error: errorData.error || "Failed to create user account" };
        }

        const signupData = await signupResponse.json();

        // Create organization_users record
        await db.insert(organizationUsers).values({
          organizationId: organization.id,
          userId: signupData.user.id,
          role: "student",
        });

        // Mark invitation as used
        await invitationService.markInvitationAsUsed(token, signupData.user.id);

        // Sign in the user
        const signinResponse = await fetch(`${backendUrl}/api/auth/sign-in/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: invitation.email,
            password,
          }),
        });

        if (!signinResponse.ok) {
          set.status = 400;
          return { error: "Account created but failed to sign in. Please sign in manually." };
        }

        const signinData = await signinResponse.json();

        return {
          success: true,
          organization,
          user: signupData.user,
          session: signinData,
        };
      } catch (error) {
        console.error("[invitations] Error completing student join:", error);
        set.status = 500;
        return { error: "Failed to complete student invitation" };
      }
    },
    {
      body: t.Object({
        token: t.String(),
        password: t.String({ minLength: 8 }),
        userName: t.String(),
      }),
    }
  )

  // Admin-only: List invitations for current organization
  .get("/list", async (context) => {
    try {
      const session = await userMiddleware(context);

      if (!session.user) {
        context.set.status = 401;
        return { error: "Unauthorized" };
      }

      if (session.user.role !== "administrator") {
        context.set.status = 403;
        return { error: "Only administrators can list invitations" };
      }

      if (!session.user.organizationId) {
        context.set.status = 400;
        return { error: "User has no organization" };
      }

      const allInvitations = await invitationService.listInvitations(
        session.user.organizationId,
        {
          status: context.query.status as any,
          type: context.query.type as any,
        }
      );

      return { invitations: allInvitations };
    } catch (error) {
      console.error("[invitations] Error listing invitations:", error);
      context.set.status = 500;
      return { error: "Failed to list invitations" };
    }
  })

  // Admin-only: Create invitation
  .post(
    "/create",
    async (context) => {
      try {
        const session = await userMiddleware(context);

        if (!session.user) {
          context.set.status = 401;
          return { error: "Unauthorized" };
        }

        if (session.user.role !== "administrator") {
          context.set.status = 403;
          return { error: "Only administrators can create invitations" };
        }

        if (!session.user.organizationId) {
          context.set.status = 400;
          return { error: "User has no organization" };
        }

        const { email, type } = context.body;

        if (type !== "administrator" && type !== "student") {
          context.set.status = 400;
          return { error: "Invalid invitation type" };
        }

        // Get organization details
        const [organization] = await db
          .select()
          .from(organizations)
          .where(eq(organizations.id, session.user.organizationId))
          .limit(1);

        if (!organization) {
          context.set.status = 400;
          return { error: "Organization not found" };
        }

        // Create invitation
        let result;
        if (type === "administrator") {
          result = await invitationService.createAdminInvitation(
            email,
            session.user.organizationId,
            session.user.id
          );

          // Send email
          await sendAdminInvitation({
            to: email,
            invitationUrl: result.invitationUrl,
            organizationName: organization.name,
            inviterName: session.user.name || undefined,
          });
        } else {
          result = await invitationService.createStudentInvitation(
            email,
            session.user.organizationId,
            session.user.id
          );

          // Send email
          await sendStudentInvitation({
            to: email,
            invitationUrl: result.invitationUrl,
            organizationName: organization.name,
          });
        }

        return {
          success: true,
          invitation: result.invitation,
        };
      } catch (error) {
        console.error("[invitations] Error creating invitation:", error);
        context.set.status = 500;
        return { error: "Failed to create invitation" };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        type: t.Union([t.Literal("administrator"), t.Literal("student")]),
      }),
    }
  )

  // Admin-only: Revoke invitation
  .delete("/revoke/:invitationId", async (context) => {
    try {
      const session = await userMiddleware(context);

      if (!session.user) {
        context.set.status = 401;
        return { error: "Unauthorized" };
      }

      if (session.user.role !== "administrator") {
        context.set.status = 403;
        return { error: "Only administrators can revoke invitations" };
      }

      const { invitationId } = context.params;

      // Verify invitation belongs to user's organization
      const [invitation] = await db
        .select()
        .from(invitations)
        .where(eq(invitations.id, invitationId))
        .limit(1);

      if (!invitation) {
        context.set.status = 404;
        return { error: "Invitation not found" };
      }

      if (invitation.organizationId !== session.user.organizationId) {
        context.set.status = 403;
        return { error: "Cannot revoke invitation from another organization" };
      }

      const updated = await invitationService.revokeInvitation(invitationId);

      return {
        success: true,
        invitation: updated,
      };
    } catch (error) {
      console.error("[invitations] Error revoking invitation:", error);
      context.set.status = 500;
      return { error: "Failed to revoke invitation" };
    }
  })

  // Admin-only: Resend invitation
  .post("/resend/:invitationId", async (context) => {
    try {
      const session = await userMiddleware(context);

      if (!session.user) {
        context.set.status = 401;
        return { error: "Unauthorized" };
      }

      if (session.user.role !== "administrator") {
        context.set.status = 403;
        return { error: "Only administrators can resend invitations" };
      }

      const { invitationId } = context.params;

      // Verify invitation belongs to user's organization
      const [invitation] = await db
        .select()
        .from(invitations)
        .where(eq(invitations.id, invitationId))
        .limit(1);

      if (!invitation) {
        context.set.status = 404;
        return { error: "Invitation not found" };
      }

      if (invitation.organizationId !== session.user.organizationId) {
        context.set.status = 403;
        return { error: "Cannot resend invitation from another organization" };
      }

      // Resend invitation
      const result = await invitationService.resendInvitation(invitationId);

      // Get organization details
      const [organization] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, invitation.organizationId!))
        .limit(1);

      if (!organization) {
        context.set.status = 400;
        return { error: "Organization not found" };
      }

      // Send email based on type
      if (invitation.type === "administrator") {
        await sendAdminInvitation({
          to: result.invitation.email,
          invitationUrl: result.invitationUrl,
          organizationName: organization.name,
          inviterName: session.user.name || undefined,
        });
      } else if (invitation.type === "student") {
        await sendStudentInvitation({
          to: result.invitation.email,
          invitationUrl: result.invitationUrl,
          organizationName: organization.name,
        });
      }

      return {
        success: true,
        invitation: result.invitation,
      };
    } catch (error) {
      console.error("[invitations] Error resending invitation:", error);
      context.set.status = 500;
      return { error: "Failed to resend invitation" };
    }
  });
