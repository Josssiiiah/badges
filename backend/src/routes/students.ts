import { Elysia, t } from "elysia";
import { setup } from "../setup";
import { db } from "../db/connection";
import { students, badges, createdBadges, pendingClaims } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { userMiddleware } from "../middleware/auth-middleware";
import { nanoid } from "nanoid";
import { sendStudentInviteEmail } from "../email";

export const studentRoutes = new Elysia({ prefix: "/students" })
  .use(setup)
  .get("/all", async (context) => {
    try {
      const session = await userMiddleware(context);
      
      if (!session.user) {
        return { error: "Unauthorized" };
      }

      // For administrators, filter students by organization
      if (session.user.role === "administrator" && session.user.organizationId) {
        const result = await db
          .select({
            studentId: students.studentId,
            name: students.name,
            email: students.email,
            hasBadge: students.hasBadge,
            badgeId: students.badgeId, // This is the badge assignment ID
            badge: createdBadges,
            createdAt: students.createdAt,
            updatedAt: students.updatedAt,
            organizationId: students.organizationId,
            invited: students.invited,
            invitedAt: students.invitedAt,
            signedUp: students.signedUp,
            signedUpAt: students.signedUpAt,
          })
          .from(students)
          .leftJoin(badges, eq(students.badgeId, badges.id))
          .leftJoin(createdBadges, eq(badges.badgeId, createdBadges.id))
          .where(eq(students.organizationId, session.user.organizationId));
        
        return { students: result };
      }
      
      // For non-administrators or if no organizationId is available
      const result = await db
        .select({
          studentId: students.studentId,
          name: students.name,
          email: students.email,
          hasBadge: students.hasBadge,
          badgeId: students.badgeId, // This is the badge assignment ID
          badge: createdBadges,
          createdAt: students.createdAt,
          updatedAt: students.updatedAt,
          invited: students.invited,
          invitedAt: students.invitedAt,
          signedUp: students.signedUp,
          signedUpAt: students.signedUpAt,
        })
        .from(students)
        .leftJoin(badges, eq(students.badgeId, badges.id))
        .leftJoin(createdBadges, eq(badges.badgeId, createdBadges.id));
      
      return { students: result };
    } catch (error) {
      console.error("Error fetching students:", error);
      return { error: String(error) };
    }
  })
  .get(
    "/find/:studentId",
    async (context) => {
      try {
        const { params } = context;
        const session = await userMiddleware(context);
        
        if (!session.user) {
          return { error: "Unauthorized" };
        }

        // Get student with optional organization filter for administrators
        let whereConditions = [eq(students.studentId, params.studentId)];
        
        // Add organization filter for administrators
        if (session.user.role === "administrator" && session.user.organizationId) {
          whereConditions.push(eq(students.organizationId, session.user.organizationId));
        }
        
        // Build the query with all conditions
        const student = await db
          .select({
            studentId: students.studentId,
            name: students.name,
            email: students.email,
            hasBadge: students.hasBadge,
            badgeId: students.badgeId,
            badge: createdBadges,
            createdAt: students.createdAt,
            updatedAt: students.updatedAt,
            organizationId: students.organizationId,
            invited: students.invited,
            invitedAt: students.invitedAt,
            signedUp: students.signedUp,
            signedUpAt: students.signedUpAt,
          })
          .from(students)
          .leftJoin(badges, eq(students.badgeId, badges.id))
          .leftJoin(createdBadges, eq(badges.badgeId, createdBadges.id))
          .where(and(...whereConditions))
          .limit(1);

        if (student.length === 0) {
          return { error: "Student not found" };
        }

        return { student: student[0] };
      } catch (error) {
        console.error("Error fetching student:", error);
        return { error: String(error) };
      }
    },
    {
      params: t.Object({
        studentId: t.String(),
      }),
    },
  )
  .post(
    "/create",
    async (context) => {
      try {
        const { body } = context;
        const session = await userMiddleware(context);
        
        if (!session.user) {
          return { error: "Unauthorized" };
        }
        
        // Check if user is an administrator
        if (session.user.role !== "administrator") {
          return { error: "Only administrators can create students" };
        }

        // Make sure administrator has an organizationId
        if (!session.user.organizationId) {
          return { error: "Administrator must be associated with an organization" };
        }
        
        const newStudent = await db
          .insert(students)
          .values({
            studentId: body.studentId,
            name: body.name,
            email: body.email,
            hasBadge: body.hasBadge || false,
            badgeId: body.badgeId,
            organizationId: session.user.organizationId, // Associate with organization
          })
          .returning();

        return { student: newStudent[0] };
      } catch (error) {
        console.error("Error creating student:", error);
        return { error: String(error) };
      }
    },
    {
      body: t.Object({
        studentId: t.String(),
        name: t.String(),
        email: t.String(),
        hasBadge: t.Optional(t.Boolean()),
        badgeId: t.Optional(t.String()),
      }),
    },
  )
  // Send invite email to a student, optionally with a claim token for a badge template
  .post(
    "/invite",
    async (context) => {
      try {
        const { body } = context;
        const { studentId, badgeId } = body as { studentId: string; badgeId?: string };
        const session = await userMiddleware(context);

        if (!session.user) {
          return { error: "Unauthorized" };
        }

        if (session.user.role !== "administrator") {
          return { error: "Only administrators can invite students" };
        }

        if (!session.user.organizationId) {
          return { error: "Administrator must be associated with an organization" };
        }

        // Look up the student and validate org
        const results = await db
          .select()
          .from(students)
          .where(eq(students.studentId, studentId))
          .limit(1);

        if (!results.length) {
          return { error: "Student not found" };
        }
        const student = results[0];
        if (student.organizationId !== session.user.organizationId) {
          return { error: "You can only invite students in your organization" };
        }

        let token: string | null = null;
        let badgeName: string | undefined = undefined;

        // If a badgeId (template) is provided, create a pending claim with a token
        if (badgeId) {
          const claimToken = nanoid(24);
          token = claimToken;

          // Fetch badge name for email
          const badge = await db
            .select({ id: createdBadges.id, name: createdBadges.name })
            .from(createdBadges)
            .where(eq(createdBadges.id, badgeId))
            .limit(1);

          if (!badge.length) {
            return { error: "Badge not found" };
          }
          badgeName = badge[0].name;

          await db.insert(pendingClaims).values({
            email: student.email,
            badgeId,
            organizationId: session.user.organizationId,
            token: claimToken,
          });
        }

        const frontendUrl = process.env.FRONTEND_URL || "";
        const inviteUrl = token
          ? `${frontendUrl}/claim/${token}`
          : `${frontendUrl}/login?email=${encodeURIComponent(student.email)}&signup=1`;

        await sendStudentInviteEmail({ to: student.email, inviteUrl, badgeName });

        // Mark student invited
        await db
          .update(students)
          .set({ invited: true, invitedAt: new Date(), updatedAt: new Date() })
          .where(eq(students.studentId, studentId));

        return { success: true };
      } catch (error) {
        console.error("Error inviting student:", error);
        return { error: String(error) };
      }
    },
    {
      body: t.Object({
        studentId: t.String(),
        badgeId: t.Optional(t.String()),
      }),
    },
  )
  .put(
    "/update/:studentId/",
    async (context) => {
      try {
        const { params, body } = context;
        const session = await userMiddleware(context);
        
        if (!session.user) {
          return { error: "Unauthorized" };
        }
        
        // For administrators, verify student belongs to their organization
        if (session.user.role === "administrator" && session.user.organizationId) {
          const existingStudent = await db
            .select({ organizationId: students.organizationId })
            .from(students)
            .where(eq(students.studentId, params.studentId))
            .limit(1);
          
          if (existingStudent.length === 0) {
            return { error: "Student not found" };
          }
          
          if (existingStudent[0].organizationId !== session.user.organizationId) {
            return { error: "You can only update students in your organization" };
          }
        }
        
        const updatedStudent = await db
          .update(students)
          .set({
            name: body.name,
            email: body.email,
            hasBadge: body.hasBadge,
            badgeId: body.badgeId,
            updatedAt: new Date(),
          })
          .where(eq(students.studentId, params.studentId))
          .returning();

        if (updatedStudent.length === 0) {
          return { error: "Student not found" };
        }

        return { student: updatedStudent[0] };
      } catch (error) {
        console.error("Error updating student:", error);
        return { error: String(error) };
      }
    },
    {
      params: t.Object({
        studentId: t.String(),
      }),
      body: t.Object({
        name: t.String(),
        email: t.String(),
        hasBadge: t.Boolean(),
        badgeId: t.Optional(t.String()),
      }),
    },
  )
  .delete(
    "/delete/:studentId",
    async (context) => {
      try {
        const { params } = context;
        const session = await userMiddleware(context);
        
        if (!session.user) {
          return { error: "Unauthorized" };
        }
        
        // For administrators, verify student belongs to their organization
        if (session.user.role === "administrator" && session.user.organizationId) {
          const existingStudent = await db
            .select({ organizationId: students.organizationId })
            .from(students)
            .where(eq(students.studentId, params.studentId))
            .limit(1);
          
          if (existingStudent.length === 0) {
            return { error: "Student not found" };
          }
          
          if (existingStudent[0].organizationId !== session.user.organizationId) {
            return { error: "You can only delete students in your organization" };
          }
        }
        
        const deleted = await db
          .delete(students)
          .where(eq(students.studentId, params.studentId))
          .returning();

        if (deleted.length === 0) {
          return { error: "Student not found" };
        }

        return { message: "Student deleted" };
      } catch (error) {
        console.error("Error deleting student:", error);
        return { error: String(error) };
      }
    },
    {
      params: t.Object({
        studentId: t.String(),
      }),
    },
  );
