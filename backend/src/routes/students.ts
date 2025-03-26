import { Elysia, t } from "elysia";
import { setup } from "../setup";
import { db } from "../db/connection";
import { students, badges } from "../db/schema";
import { eq } from "drizzle-orm";

export const studentRoutes = new Elysia({ prefix: "/students" })
  .use(setup)
  .get("/all", async () => {
    try {
      const result = await db
        .select({
          studentId: students.studentId,
          name: students.name,
          email: students.email,
          hasBadge: students.hasBadge,
          badgeId: students.badgeId,
          badge: badges,
          createdAt: students.createdAt,
          updatedAt: students.updatedAt,
        })
        .from(students)
        .leftJoin(badges, eq(students.badgeId, badges.id));
      return { students: result };
    } catch (error) {
      console.error("Error fetching students:", error);
      return { error: String(error) };
    }
  })
  .get(
    "/find/:studentId",
    async ({ params }) => {
      try {
        const student = await db
          .select({
            studentId: students.studentId,
            name: students.name,
            email: students.email,
            hasBadge: students.hasBadge,
            badgeId: students.badgeId,
            badge: badges,
            createdAt: students.createdAt,
            updatedAt: students.updatedAt,
          })
          .from(students)
          .leftJoin(badges, eq(students.badgeId, badges.id))
          .where(eq(students.studentId, params.studentId))
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
    }
  )
  .post(
    "/create",
    async ({ body }) => {
      try {
        const newStudent = await db
          .insert(students)
          .values({
            studentId: body.studentId,
            name: body.name,
            email: body.email,
            hasBadge: body.hasBadge || false,
            badgeId: body.badgeId,
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
    }
  )
  .put(
    "/update/:studentId/",
    async ({ params, body }) => {
      try {
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
    }
  )
  .delete(
    "/delete/:studentId",
    async ({ params }) => {
      try {
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
    }
  );
