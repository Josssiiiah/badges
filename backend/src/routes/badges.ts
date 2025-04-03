import { Elysia, t } from "elysia";
import { db } from "../db/connection";
import { createdBadges, badges, user } from "../db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

export const badgeRoutes = new Elysia({ prefix: "/badges" })
  // Get all badges
  .get("/all", async () => {
    try {
      const result = await db.select().from(createdBadges);
      return { badges: result };
    } catch (error) {
      console.error("Error fetching badges:", error);
      return { error: String(error) };
    }
  })
  // Get a specific badge with its user
  .get("/:badgeId", async ({ params }) => {
    try {
      // Get the badge details and user info
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
        .where(eq(createdBadges.id, params.badgeId))
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
  .post("/assign", async ({ body }) => {
    try {
      const { badgeId, userId } = body;

      // Verify the badge exists
      const badge = await db
        .select()
        .from(createdBadges)
        .where(eq(createdBadges.id, badgeId))
        .limit(1);

      if (!badge.length) {
        return { error: "Badge not found" };
      }

      // Create the assignment
      const assignment = await db
        .insert(badges)
        .values({
          badgeId,
          userId,
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
  // Upload a badge image
  .post(
    "/upload",
    async ({ body }) => {
      try {
        const {
          name,
          description,
          image,
          issuedBy,
          courseLink,
          skills,
          earningCriteria,
        } = body;

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

        // Save badge metadata and image data to the database
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
  );
