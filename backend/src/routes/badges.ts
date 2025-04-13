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

      // If user is an administrator, fetch all badge templates for their organization
      if (session.user.role === "administrator" && session.user.organizationId) {
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
  // Assign a badge to a user by email - new endpoint
  .post("/assign-by-email", async (context) => {
    try {
      const { body } = context;
      const { badgeId, email } = body;
      const session = await userMiddleware(context);
      
      if (!session.user) {
        return { error: "Unauthorized" };
      }

      // Find the user by email
      const userResult = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

      if (!userResult.length) {
        return { error: "User not found with this email" };
      }

      const userId = userResult[0].id;

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

        // First delete any badge assignments that reference this badge
        await db
          .delete(badges)
          .where(eq(badges.badgeId, badgeId));
        
        // Then delete the badge itself
        const deleted = await db
          .delete(createdBadges)
          .where(eq(createdBadges.id, badgeId))
          .returning();

        return { success: true, deleted: deleted[0] };
      } catch (error) {
        console.error("Error deleting badge:", error);
        return { error: String(error) };
      }
    }
  );
