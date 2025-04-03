import { Elysia, t } from "elysia";
import { db } from "../db/connection";
import { createdBadges, badges, user } from "../db/schema";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { setup } from "../setup";
import { userMiddleware } from "../middleware/auth-middleware";

export const badgeRoutes = new Elysia({ prefix: "/badges" })
  .use(setup)
  // Get all badges - filtered by organization for administrators
  .get("/all", async (context) => {
    try {
      const session = await userMiddleware(context);
      if (!session.user) {
        return { error: "Unauthorized" };
      }

      // If administrator, filter badges by organization
      if (session.user.role === "administrator" && session.user.organizationId) {
        const result = await db
          .select()
          .from(createdBadges)
          .where(eq(createdBadges.organizationId, session.user.organizationId));
        
        return { badges: result };
      }
      
      // Otherwise, return all badges
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
      if (
        session.user.role === "administrator" && 
        session.user.organizationId && 
        badge[0].organizationId !== session.user.organizationId
      ) {
        return { error: "Badge does not belong to your organization" };
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
  );
