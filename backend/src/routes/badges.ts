import { Elysia, t } from "elysia";
import { db } from "../db/connection";
import {
  createdBadges,
  badges,
  user,
  session as sessionTable,
} from "../db/schema";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { setup } from "../setup";
import { userMiddleware } from "../middleware/auth-middleware";
import { sendBatchMagicLinkEmails } from "../services/email";

export const badgeRoutes = new Elysia({ prefix: "/badges" })
  .use(setup)
  // Get usage summary for a badge template
  .get("/usage/:id", async (context) => {
    try {
      const { params } = context;
      const badgeId = params.id;
      const session = await userMiddleware(context);

      if (!session.user) {
        return { error: "Unauthorized" };
      }
      if (session.user.emailVerified === false) {
        return { error: "Email not verified" };
      }

      if (session.user.role !== "administrator" || !session.user.organizationId) {
        return { error: "Only administrators can view badge usage" };
      }

      // Verify the badge belongs to the admin's org
      const existing = await db
        .select({ id: createdBadges.id })
        .from(createdBadges)
        .where(
          and(
            eq(createdBadges.id, badgeId),
            eq(createdBadges.organizationId, session.user.organizationId),
          ),
        )
        .limit(1);

      if (!existing.length) {
        return { error: "Badge not found or unauthorized" };
      }

      const assignmentRows = await db
        .select({ id: badges.id })
        .from(badges)
        .where(eq(badges.badgeId, badgeId));

      const assignmentCount = assignmentRows.length;

      return { assignmentCount, studentCount: assignmentCount };
    } catch (error) {
      console.error("Error fetching badge usage:", error);
      return { error: String(error) };
    }
  })
  // Get all badges - filtered by organization for administrators
  .get("/all", async (context) => {
    try {
      const session = await userMiddleware(context);
      if (!session.user) {
        return { error: "Unauthorized" };
      }
      if (session.user.emailVerified === false) {
        return { error: "Email not verified" };
      }

      // If user is an administrator, fetch all badge templates for their organization
      if (session.user.role === "administrator") {
        if (!session.user.organizationId) {
          return { error: "Administrator must be associated with an organization" };
        }

        const orgBadgeTemplates = await db
          .select({
            id: createdBadges.id,
            name: createdBadges.name,
            description: createdBadges.description,
            imageUrl: createdBadges.imageUrl,
            imageData: createdBadges.imageData,
            issuedBy: createdBadges.issuedBy,
            courseLink: createdBadges.courseLink,
            skills: createdBadges.skills,
            earningCriteria: createdBadges.earningCriteria,
            createdAt: createdBadges.createdAt,
            updatedAt: createdBadges.updatedAt,
          })
          .from(createdBadges)
          .where(eq(createdBadges.organizationId, session.user.organizationId));
        
        return { badges: orgBadgeTemplates };
      }

      // For regular users, get assigned badges for the current user with badge details
      const userBadges = await db
        .select({
          id: badges.id, // This is the assigned badge ID
          badgeId: badges.badgeId,
          earnedAt: badges.earnedAt,
          // Include all badge details from createdBadges
          name: createdBadges.name,
          description: createdBadges.description,
          imageUrl: createdBadges.imageUrl,
          imageData: createdBadges.imageData,
          issuedBy: createdBadges.issuedBy,
          courseLink: createdBadges.courseLink,
          skills: createdBadges.skills,
          earningCriteria: createdBadges.earningCriteria,
          createdAt: createdBadges.createdAt,
          updatedAt: createdBadges.updatedAt,
        })
        .from(badges)
        .innerJoin(createdBadges, eq(badges.badgeId, createdBadges.id))
        .where(eq(badges.userId, session.user.id));
      
      return { badges: userBadges };
    } catch (error) {
      console.error("Error fetching badges:", error);
      return { error: String(error) };
    }
  })
  // Add a new endpoint to get badges by user ID
  .get("/user/:userId", async (context) => {
    try {
      const { params } = context;
      const { userId } = params;
      const session = await userMiddleware(context);
      
      if (!session.user) {
        return { error: "Unauthorized" };
      }
      if (session.user.emailVerified === false) {
        return { error: "Email not verified" };
      }

      // Only allow fetching your own badges or if you're an admin
      if (session.user.id !== userId && session.user.role !== "administrator") {
        return { error: "You can only view your own badges" };
      }

      // Get assigned badges for the specified user with badge details
      const userBadges = await db
        .select({
          id: badges.id, // This is the assigned badge ID
          badgeId: badges.badgeId,
          earnedAt: badges.earnedAt,
          // Include all badge details from createdBadges
          name: createdBadges.name,
          description: createdBadges.description,
          imageUrl: createdBadges.imageUrl,
          imageData: createdBadges.imageData,
          issuedBy: createdBadges.issuedBy,
          courseLink: createdBadges.courseLink,
          skills: createdBadges.skills,
          earningCriteria: createdBadges.earningCriteria,
          sharesCount: badges.sharesCount,
          createdAt: createdBadges.createdAt,
          updatedAt: createdBadges.updatedAt,
        })
        .from(badges)
        .innerJoin(createdBadges, eq(badges.badgeId, createdBadges.id))
        .where(eq(badges.userId, userId));

      console.log(`Found ${userBadges.length} badges for user ${userId}`);
      
      return { badges: userBadges };
    } catch (error) {
      console.error("Error fetching user badges:", error);
      return { error: String(error) };
    }
  })
  // Get a specific badge with its user - now using the badge assignment ID
  .get("/:badgeId", async ({ params }) => {
    try {
      // Get the badge details and user info using the badge assignment ID
      const result = await db
        .select({
          badge: createdBadges,
          user: {
            name: user.name,
            email: user.email,
            image: user.image,
          },
          earnedAt: badges.earnedAt,
        })
        .from(badges)
        .innerJoin(createdBadges, eq(badges.badgeId, createdBadges.id))
        .innerJoin(user, eq(badges.userId, user.id))
        .where(eq(badges.id, params.badgeId)) // Changed: now searching by badge assignment ID
        .limit(1);

      if (!result.length) {
        return { error: "Badge not found" };
      }

      return {
        badge: result[0].badge,
        user: result[0].user,
        earnedAt: result[0].earnedAt,
      };
    } catch (error) {
      console.error("Error fetching badge:", error);
      return { error: String(error) };
    }
  })
  // Assign a badge to a user
  .post("/assign", async (context) => {
    try {
      const { body } = context;
      const { badgeId, userId } = body;
      const session = await userMiddleware(context);
      
      if (!session.user) {
        return { error: "Unauthorized" };
      }

      // Verify the badge exists
      const badge = await db
        .select()
        .from(createdBadges)
        .where(eq(createdBadges.id, badgeId))
        .limit(1);

      if (!badge.length) {
        return { error: "Badge not found" };
      }
      
      // If administrator, verify the badge belongs to their organization
      if (session.user.role === "administrator") {
        if (!session.user.organizationId) {
          return { error: "Administrator must be associated with an organization" };
        }

        if (badge[0].organizationId !== session.user.organizationId) {
          return { error: "Badge does not belong to your organization" };
        }
      }

      // Check if this user already has this specific badge assigned
      const existingAssignment = await db
        .select({ id: badges.id })
        .from(badges)
        .where(and(eq(badges.userId, userId), eq(badges.badgeId, badgeId)))
        .limit(1);

      if (existingAssignment.length > 0) {
        return {
          message: "User already has this badge assigned",
          assignment: existingAssignment[0],
          alreadyAssigned: true
        };
      }

      // Create the assignment
      const assignment = await db
        .insert(badges)
        .values({
          badgeId,
          userId,
          earnedAt: new Date(),
        })
        .returning();

      return { assignment: assignment[0] };
    } catch (error) {
      console.error("Error assigning badge:", error);
      return { error: String(error) };
    }
  }, {
    body: t.Object({
      badgeId: t.String(),
      userId: t.String()
    })
  })
  // Assign a badge to a user by email - new endpoint
  .post("/assign-by-email", async (context) => {
    try {
      const { body } = context;
      const { badgeId, email } = body;
      const session = await userMiddleware(context);
      
      if (!session.user) {
        return { error: "Unauthorized" };
      }
      if (session.user.emailVerified === false) {
        return { error: "Email not verified" };
      }

      // Find the user by email; if not found, try to create one from a matching student
      let userId: string | null = null;
      const userResult = await db
        .select({ id: user.id, emailVerified: user.emailVerified })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (userResult.length > 0) {
        userId = userResult[0].id;
      } else {
        // User should have been created when student was added
        // If not found, the student wasn't properly created
        return { error: "User not found. Please ensure the student was properly added to the system." };
      }

      // Verify the badge exists
      const badge = await db
        .select()
        .from(createdBadges)
        .where(eq(createdBadges.id, badgeId))
        .limit(1);

      if (!badge.length) {
        return { error: "Badge not found" };
      }
      
      // If administrator, verify the badge belongs to their organization
      if (session.user.role === "administrator") {
        if (!session.user.organizationId) {
          return { error: "Administrator must be associated with an organization" };
        }

        if (badge[0].organizationId !== session.user.organizationId) {
          return { error: "Badge does not belong to your organization" };
        }
      }

      // Check if user is an existing user BEFORE creating the assignment
      // (has verified email, sessions, or other badges)
      // Use Boolean() to handle SQLite integer (1/0) vs boolean (true/false)
      let hasLoggedIn = Boolean(userResult[0].emailVerified);

      if (!hasLoggedIn) {
        // Check for existing sessions
        const existingSession = await db
          .select({ id: sessionTable.id })
          .from(sessionTable)
          .where(eq(sessionTable.userId, userId))
          .limit(1);

        hasLoggedIn = existingSession.length > 0;
      }

      // If still not confirmed, check if they have other badge assignments
      // (if they have other badges, they're definitely an existing user)
      if (!hasLoggedIn) {
        const existingBadges = await db
          .select({ id: badges.id })
          .from(badges)
          .where(eq(badges.userId, userId))
          .limit(1);

        hasLoggedIn = existingBadges.length > 0;
      }

      // Check if this user already has this specific badge assigned
      const existingAssignment = await db
        .select({ id: badges.id })
        .from(badges)
        .where(and(eq(badges.userId, userId), eq(badges.badgeId, badgeId)))
        .limit(1);

      if (existingAssignment.length > 0) {
        return {
          message: "User already has this badge assigned",
          assignment: existingAssignment[0],
          alreadyAssigned: true,
          inviteSent: false
        };
      }

      // Create the assignment
      const assignment = await db
        .insert(badges)
        .values({
          badgeId,
          userId,
          earnedAt: new Date(),
        })
        .returning();

      // Send secure invite link to set password and view badge
      try {
        const frontend = process.env.FRONTEND_URL || "http://localhost:3001";
        const backendOrigin = process.env.BACKEND_URL || "http://localhost:3000";
        const betterAuthBase = process.env.BETTER_AUTH_URL || `${backendOrigin}/api/auth`;
        
        // Different callback URLs for existing vs new users
        let callbackURL;
        if (hasLoggedIn) {
          // Existing users go directly to view their badge
          callbackURL = `${frontend}/badges/${encodeURIComponent(assignment[0].id)}?existing=1`;
        } else {
          // New users need to create account first
          callbackURL = `${frontend}/create-account?assignmentId=${encodeURIComponent(assignment[0].id)}`;
        }
        
        const res = await fetch(`${betterAuthBase}/sign-in/magic-link`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, callbackURL }),
        });
        if (!res.ok) {
          console.error("Failed to send invite magic link:", res.status, await res.text());
        }
      } catch (e) {
        console.error("Error sending invite link:", e);
      }

      return { assignment: assignment[0], inviteSent: true };
    } catch (error) {
      console.error("Error assigning badge:", error);
      return { error: String(error) };
    }
  }, {
    body: t.Object({
      badgeId: t.String(),
      email: t.String()
    })
  })
  // Upload a badge image
  .post(
    "/upload",
    async (context) => {
      try {
        const { body } = context;
        const {
          name,
          description,
          image,
          issuedBy,
          courseLink,
          skills,
          earningCriteria,
        } = body;
        
        const session = await userMiddleware(context);
        
        if (!session.user) {
          return { error: "Unauthorized" };
        }
        
        // Check if user is an administrator and has an organization ID
        if (session.user.role !== "administrator") {
          return { error: "Only administrators can create badges" };
        }
        
        if (!session.user.organizationId) {
          return { error: "Administrator must be associated with an organization" };
        }

        // Validate file type (only images)
        const allowedTypes = ["image/png", "image/jpeg", "image/gif"];
        if (!allowedTypes.includes(image.type)) {
          return {
            error: "Invalid file type. Only PNG, JPEG, and GIF allowed.",
          };
        }

        // Convert image to base64
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString("base64");
        const imageDataUrl = `data:${image.type};base64,${base64Image}`;

        // Save badge metadata and image data to the database with organization ID
        const newBadge = await db
          .insert(createdBadges)
          .values({
            name,
            description,
            imageData: imageDataUrl, // Store the base64 data URL
            issuedBy,
            courseLink,
            skills,
            earningCriteria,
            organizationId: session.user.organizationId, // Associate with organization
          })
          .returning();

        return { badge: newBadge[0] };
      } catch (error) {
        console.error("Error uploading badge:", error);
        return { error: String(error) };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        image: t.File(),
        issuedBy: t.String(),
        courseLink: t.Optional(t.String()),
        skills: t.Optional(t.String()),
        earningCriteria: t.Optional(t.String()),
      }),
    },
  )
  // Update an existing badge
  .put(
    "/update/:id",
    async (context) => {
      try {
        const { params, body } = context;
        const badgeId = params.id;
        const {
          name,
          description,
          image,
          issuedBy,
          courseLink,
          skills,
          earningCriteria,
        } = body;
        
        const session = await userMiddleware(context);
        
        if (!session.user) {
          return { error: "Unauthorized" };
        }
        
        // Check if user is an administrator and has an organization ID
        if (session.user.role !== "administrator") {
          return { error: "Only administrators can update badges" };
        }
        
        if (!session.user.organizationId) {
          return { error: "Administrator must be associated with an organization" };
        }

        // Verify the badge exists and belongs to the administrator's organization
        const existingBadge = await db
          .select()
          .from(createdBadges)
          .where(
            and(
              eq(createdBadges.id, badgeId),
              eq(createdBadges.organizationId, session.user.organizationId)
            )
          )
          .limit(1);

        if (!existingBadge.length) {
          return { error: "Badge not found or you don't have permission to update it" };
        }

        // Prepare update data
        const updateData: any = {
          name,
          issuedBy,
          description,
          courseLink,
          skills,
          earningCriteria,
          updatedAt: new Date(),
        };

        // If image is provided, process it
        if (image) {
          // Validate file type (only images)
          const allowedTypes = ["image/png", "image/jpeg", "image/gif"];
          if (!allowedTypes.includes(image.type)) {
            return {
              error: "Invalid file type. Only PNG, JPEG, and GIF allowed.",
            };
          }

          // Convert image to base64
          const arrayBuffer = await image.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const base64Image = buffer.toString("base64");
          const imageDataUrl = `data:${image.type};base64,${base64Image}`;
          
          // Add to update data
          updateData.imageData = imageDataUrl;
        }

        // Update the badge
        const updatedBadge = await db
          .update(createdBadges)
          .set(updateData)
          .where(eq(createdBadges.id, badgeId))
          .returning();

        return { badge: updatedBadge[0] };
      } catch (error) {
        console.error("Error updating badge:", error);
        return { error: String(error) };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        image: t.Optional(t.File()),
        issuedBy: t.String(),
        courseLink: t.Optional(t.String()),
        skills: t.Optional(t.String()),
        earningCriteria: t.Optional(t.String()),
      }),
    },
  )
  // Delete a badge
  .delete(
    "/delete/:id",
    async (context) => {
      try {
        const { params } = context;
        const badgeId = params.id;
        
        const session = await userMiddleware(context);
        
        if (!session.user) {
          return { error: "Unauthorized" };
        }
        
        // Check if user is an administrator and has an organization ID
        if (session.user.role !== "administrator") {
          return { error: "Only administrators can delete badges" };
        }
        
        if (!session.user.organizationId) {
          return { error: "Administrator must be associated with an organization" };
        }

        // Verify the badge exists and belongs to the administrator's organization
        const existingBadge = await db
          .select()
          .from(createdBadges)
          .where(
            and(
              eq(createdBadges.id, badgeId),
              eq(createdBadges.organizationId, session.user.organizationId)
            )
          )
          .limit(1);

        if (!existingBadge.length) {
          return { error: "Badge not found or you don't have permission to delete it" };
        }

        // Delete assignments and badge template
        const deleted = await db.transaction(async (tx) => {
          // Delete badge assignments (cascade will handle cleanup)
          await tx.delete(badges).where(eq(badges.badgeId, badgeId));

          // Delete the badge template
          const del = await tx
            .delete(createdBadges)
            .where(eq(createdBadges.id, badgeId))
            .returning();
          return del[0];
        });

        return { success: true, deleted };
      } catch (error) {
        console.error("Error deleting badge:", error);
        return { error: String(error) };
      }
    }
  )
  // Remove specific badge assignment
  .delete(
    "/remove-assignment/:assignmentId",
    async (context) => {
      try {
        const { params } = context;
        const assignmentId = params.assignmentId;
        const session = await userMiddleware(context);
        if (!session.user) {
          return { error: "Unauthorized" };
        }

        // Only administrators can remove badge assignments
        if (session.user.role !== "administrator") {
          return { error: "Only administrators can remove badge assignments" };
        }

        if (!session.user.organizationId) {
          return { error: "Administrator must be associated with an organization" };
        }

        // Verify assignment belongs to a user in the organization
        const assignment = await db
          .select({
            id: badges.id,
          })
          .from(badges)
          .innerJoin(user, eq(badges.userId, user.id))
          .where(
            and(
              eq(badges.id, assignmentId),
              eq(user.organizationId, session.user.organizationId)
            )
          )
          .limit(1);

        if (assignment.length === 0) {
          return { error: "Badge assignment not found or not in your organization" };
        }

        // Delete only the specific badge assignment by assignment ID
        const deleted = await db
          .delete(badges)
          .where(
              eq(badges.id, assignmentId)
          )
          .returning();
        console.log(deleted);

        if (deleted.length === 0) {
          return { error: "Badge assignment not found" };
        }

        return { success: true, deleted: deleted.length };
      } catch (error) {
        console.error("Error removing badge assignment:", error);
        return { error: String(error) };
      }
    }
  )
  // Bulk assign badges to multiple users by email using batch email sending
  .post("/assign-bulk", async (context) => {
    try {
      const { body } = context;
      const { badgeId, emails } = body;
      const session = await userMiddleware(context);
      
      if (!session.user) {
        return { error: "Unauthorized" };
      }
      if (session.user.emailVerified === false) {
        return { error: "Email not verified" };
      }

      // Only administrators can bulk assign badges
      if (session.user.role !== "administrator") {
        return { error: "Only administrators can bulk assign badges" };
      }

      // Verify the badge exists
      const badge = await db
        .select()
        .from(createdBadges)
        .where(eq(createdBadges.id, badgeId))
        .limit(1);

      if (!badge.length) {
        return { error: "Badge not found" };
      }
      
      // If administrator, verify the badge belongs to their organization
      if (session.user.role === "administrator") {
        if (!session.user.organizationId) {
          return { error: "Administrator must be associated with an organization" };
        }

        if (badge[0].organizationId !== session.user.organizationId) {
          return { error: "Badge does not belong to your organization" };
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emails.filter((email: string) => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        return { error: `Invalid email format: ${invalidEmails.join(", ")}` };
      }

      // Limit batch size to Resend's limit of 100 emails
      if (emails.length > 100) {
        return { error: "Maximum 100 emails allowed per batch" };
      }

      const assignments: any[] = [];
      const magicLinksSuccessful: string[] = [];
      const failedAssignments: Array<{ email: string; error: string }> = [];

      // Process each email
      for (const email of emails) {
        try {
          // Find the user by email
          const userResult = await db
            .select({ id: user.id, emailVerified: user.emailVerified })
            .from(user)
            .where(eq(user.email, email))
            .limit(1);

          if (!userResult.length) {
            failedAssignments.push({ email, error: "User not found" });
            continue;
          }

          const userId = userResult[0].id;

          // Check if this user already has this specific badge assigned
          const existingAssignment = await db
            .select({ id: badges.id })
            .from(badges)
            .where(and(eq(badges.userId, userId), eq(badges.badgeId, badgeId)))
            .limit(1);

          if (existingAssignment.length > 0) {
            // User already has this badge, skip
            console.log(`[bulk-assign] User ${email} already has badge ${badgeId}, skipping`);
            continue;
          }

          // Create the assignment
          const assignment = await db
            .insert(badges)
            .values({
              badgeId,
              userId,
              earnedAt: new Date(),
            })
            .returning();

          assignments.push(assignment[0]);

          // Prepare magic link for batch sending
          const frontend = process.env.FRONTEND_URL || "http://localhost:3001";
          const backendOrigin = process.env.BACKEND_URL || "http://localhost:3000";
          const betterAuthBase = process.env.BETTER_AUTH_URL || `${backendOrigin}/api/auth`;
          
          // Check if user has verified email (existing user) or not (new student)
          // Use Boolean() to handle SQLite integer (1/0) vs boolean (true/false)
          let hasLoggedIn = Boolean(userResult[0].emailVerified);

          if (!hasLoggedIn) {
            const existingSession = await db
              .select({ id: sessionTable.id })
              .from(sessionTable)
              .where(eq(sessionTable.userId, userId))
              .limit(1);

            hasLoggedIn = existingSession.length > 0;
          }
          
          // Different callback URLs for existing vs new users
          let callbackURL;
          if (hasLoggedIn) {
            // Existing users go directly to view their badge
            callbackURL = `${frontend}/badges/${encodeURIComponent(assignment[0].id)}?existing=1`;
          } else {
            // New users need to create account first
            callbackURL = `${frontend}/create-account?assignmentId=${encodeURIComponent(assignment[0].id)}`;
          }

          // Generate proper magic link through Better Auth API
          try {
            const res = await fetch(`${betterAuthBase}/sign-in/magic-link`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, callbackURL }),
            });

            if (!res.ok) {
              console.error(`Failed to generate magic link for ${email}:`, await res.text());
              failedAssignments.push({ email, error: "Failed to generate magic link" });
              continue;
            }

            // Magic link is sent via email by Better Auth automatically
            magicLinksSuccessful.push(email);
            console.log(`[bulk-assign] Magic link sent for ${email}`);
          } catch (magicLinkError) {
            console.error(`Error generating magic link for ${email}:`, magicLinkError);
            failedAssignments.push({ email, error: "Magic link generation failed" });
            continue;
          }

        } catch (error) {
          console.error(`Failed to assign badge to ${email}:`, error);
          failedAssignments.push({ email, error: String(error) });
        }
      }

      return {
        success: true,
        assignments: assignments.length,
        magicLinksSent: magicLinksSuccessful.length,
        failed: failedAssignments,
      };
    } catch (error) {
      console.error("Error in bulk badge assignment:", error);
      return { error: String(error) };
    }
  }, {
    body: t.Object({
      badgeId: t.String(),
      emails: t.Array(t.String())
    })
  });
