import { Elysia, t } from "elysia";
import { setup } from "../setup";
import { db } from "../db/connection";
import {
  students,
  badges,
  createdBadges,
  user,
  session as sessionTable,
  account as accountTable,
  organizationUsers,
} from "../db/schema";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { userMiddleware } from "../middleware/auth-middleware";
import { auth as authInstance } from "../auth";

export const studentRoutes = new Elysia({ prefix: "/students" })
  .use(setup)
  .get("/all", async (context) => {
    try {
      const session = await userMiddleware(context);
      
      if (!session.user) {
        return { error: "Unauthorized" };
      }
      if (session.user.emailVerified === false) {
        return { error: "Email not verified" };
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
            organizationId: students.organizationId
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
        if (session.user.emailVerified === false) {
          return { error: "Email not verified" };
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
            organizationId: students.organizationId
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
        if (session.user.emailVerified === false) {
          return { error: "Email not verified" };
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

        const student = newStudent[0];

        // Auto-provision an auth user for this student using Better Auth signUp
        const existingUser = await db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.email, student.email))
          .limit(1);

        if (!existingUser.length) {
          // Use a fixed temporary password that we can reference later
          // This allows students to use changePassword with the known temp password
          const tempPassword = process.env.VITE_TEMP_PASSWORD!;
          
          try {
            // Use Better Auth signUp to create both user and account records
            const signupResult = await authInstance.api.signUpEmail({
              body: {
                email: student.email,
                password: tempPassword,
                name: student.name,
                role: "student",
              },
            });
            
            if (signupResult?.user) {
              const newUserId = signupResult.user.id;
              
              // Update the user's organizationId after creation
              if (student.organizationId) {
                await db
                  .update(user)
                  .set({ 
                    organizationId: student.organizationId,
                    updatedAt: new Date(),
                  })
                  .where(eq(user.id, newUserId));
                
                // Ensure membership in organizationUsers for org-scoped queries
                try {
                  await db.insert(organizationUsers).values({
                    organizationId: student.organizationId,
                    userId: newUserId,
                    role: "student",
                  });
                } catch (e) {
                  console.log("[students.create] organizationUsers insert skipped:", e);
                }
              }
              
              console.log(`[students.create] Created user account for student ${student.email}`);
            } else {
              console.error("[students.create] Failed to create user account via Better Auth");
            }
          } catch (error) {
            console.error("[students.create] Error creating user account:", error);
          }
        }

        return { student };
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
  .post(
    "/resend-badge",
    async (context) => {
      try {
        const session = await userMiddleware(context);

        if (!session.user) {
          context.set.status = 401;
          return { error: "Unauthorized" };
        }
        if (session.user.emailVerified === false) {
          context.set.status = 403;
          return { error: "Email not verified" };
        }
        if (session.user.role !== "administrator") {
          context.set.status = 403;
          return { error: "Only administrators can resend badge emails" };
        }

        const { studentId } = context.body;
        if (!studentId) {
          context.set.status = 400;
          return { error: "studentId is required" };
        }

        const studentResult = await db
          .select({
            studentId: students.studentId,
            email: students.email,
            name: students.name,
            hasBadge: students.hasBadge,
            badgeId: students.badgeId,
            organizationId: students.organizationId,
          })
          .from(students)
          .where(eq(students.studentId, studentId))
          .limit(1);

        if (!studentResult.length) {
          context.set.status = 404;
          return { error: "Student not found" };
        }

        const student = studentResult[0];

        if (
          session.user.organizationId &&
          student.organizationId &&
          session.user.organizationId !== student.organizationId
        ) {
          context.set.status = 403;
          return { error: "You can only resend badges for your organization" };
        }

        if (!student.hasBadge || !student.badgeId) {
          context.set.status = 400;
          return { error: "Student does not have an assigned badge" };
        }

        const badgeAssignmentResult = await db
          .select({
            id: badges.id,
            badgeId: badges.badgeId,
            userId: badges.userId,
          })
          .from(badges)
          .where(eq(badges.id, student.badgeId))
          .limit(1);

        if (!badgeAssignmentResult.length) {
          context.set.status = 404;
          return { error: "Badge assignment not found" };
        }

        const badgeAssignment = badgeAssignmentResult[0];

        const badgeRecipientResult = await db
          .select({
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
          })
          .from(user)
          .where(eq(user.id, badgeAssignment.userId))
          .limit(1);

        if (!badgeRecipientResult.length) {
          context.set.status = 404;
          return { error: "Badge recipient user not found" };
        }

        const badgeRecipient = badgeRecipientResult[0];

        const frontend = process.env.FRONTEND_URL || "http://localhost:3001";
        const backendOrigin = process.env.BACKEND_URL || "http://localhost:3000";
        const betterAuthBase =
          process.env.BETTER_AUTH_URL || `${backendOrigin}/api/auth`;

        let hasLoggedIn = badgeRecipient.emailVerified === true;

        if (!hasLoggedIn) {
          const existingSession = await db
            .select({ id: sessionTable.id })
            .from(sessionTable)
            .where(eq(sessionTable.userId, badgeRecipient.id))
            .limit(1);

          hasLoggedIn = existingSession.length > 0;
        }

        const assignmentId = badgeAssignment.id;

        const callbackURL = hasLoggedIn
          ? `${frontend}/badges/${encodeURIComponent(assignmentId)}?existing=1`
          : `${frontend}/create-account?assignmentId=${encodeURIComponent(
              assignmentId,
            )}`;

        const magicLinkResponse = await fetch(
          `${betterAuthBase}/sign-in/magic-link`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: badgeRecipient.email ?? student.email,
              callbackURL,
            }),
          },
        );

        if (!magicLinkResponse.ok) {
          const errorDetail = await magicLinkResponse.text();
          console.error(
            `[students.resend-badge] Failed to request magic link: ${magicLinkResponse.status} ${errorDetail}`,
          );
          context.set.status = 500;
          return { error: "Failed to resend badge email" };
        }

        console.log(
          `[students.resend-badge] Magic link resent for ${badgeRecipient.email} (assignment ${assignmentId})`,
        );

        return {
          success: true,
          assignmentId,
          message: "Badge email resent",
        };
      } catch (error) {
        console.error("Error resending badge email:", error);
        context.set.status = 500;
        return { error: String(error) };
      }
    },
    {
      body: t.Object({
        studentId: t.String(),
      }),
    },
  )
  .put(
    "/update/:studentId",
    async (context) => {
      try {
        const { params, body } = context;
        const session = await userMiddleware(context);
        
        if (!session.user) {
          return { error: "Unauthorized" };
        }
        if (session.user.emailVerified === false) {
          return { error: "Email not verified" };
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
        
        // Build update data, but only include badgeId if it was explicitly provided
        const updateData: any = {
          name: body.name,
          email: body.email,
          hasBadge: body.hasBadge,
          updatedAt: new Date(),
        };
        if (Object.prototype.hasOwnProperty.call(body, "badgeId")) {
          updateData.badgeId = body.badgeId;
        }

        const updatedStudent = await db
          .update(students)
          .set(updateData)
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
        if (session.user.emailVerified === false) {
          return { error: "Email not verified" };
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

        // Get the student's email before deletion
        const target = await db
          .select({ email: students.email })
          .from(students)
          .where(eq(students.studentId, params.studentId))
          .limit(1);

        if (target.length === 0) {
          return { error: "Student not found" };
        }

        const studentEmail = target[0].email;

        // Perform cascading deletes in a transaction: clear student FK -> badges -> user deps -> user -> student
        await db.transaction(async (tx) => {
          // Find associated user by email
          const u = await tx
            .select({ id: user.id, role: user.role })
            .from(user)
            .where(eq(user.email, studentEmail))
            .limit(1);

          // Clear student's badge reference first to satisfy FK (students.badge_id -> badges.id)
          await tx
            .update(students)
            .set({ badgeId: null, hasBadge: false, updatedAt: new Date() })
            .where(eq(students.studentId, params.studentId));

          if (u.length && u[0].role === "student") {
            const uid = u[0].id;
            // Delete their badge assignments
            await tx.delete(badges).where(eq(badges.userId, uid));
            // Delete user-dependent records to satisfy FKs
            await tx.delete(sessionTable).where(eq(sessionTable.userId, uid));
            await tx.delete(accountTable).where(eq(accountTable.userId, uid));
            await tx
              .delete(organizationUsers)
              .where(eq(organizationUsers.userId, uid));
            // Delete the user account
            await tx.delete(user).where(eq(user.id, uid));
          }

          // Finally, delete the student record
          await tx.delete(students).where(eq(students.studentId, params.studentId));
        });

        return { message: "Student and associated user/badges deleted" };
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
