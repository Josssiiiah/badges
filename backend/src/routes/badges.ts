import { Elysia, t } from "elysia";
import { db } from "../db/connection";
import { badges } from "../db/schema";
import { nanoid } from "nanoid";

export const badgeRoutes = new Elysia({ prefix: "/badges" })
  // Get all badges
  .get("/all", async () => {
    try {
      const result = await db.select().from(badges);
      return { badges: result };
    } catch (error) {
      console.error("Error fetching badges:", error);
      return { error: String(error) };
    }
  })
  // Upload a badge image
  .post(
    "/upload",
    async ({ body }) => {
      try {
        const { name, description, image } = body;

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
          .insert(badges)
          .values({
            name,
            description,
            imageData: imageDataUrl, // Store the base64 data URL
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
      }),
    }
  );
