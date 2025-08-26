import { Elysia, t } from "elysia";
import { db } from "../db/connection";
import { pendingClaims, createdBadges, badges, user as userTable, students } from "../db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { setup } from "../setup";
import { userMiddleware } from "../middleware/auth-middleware";

export const claimRoutes = new Elysia({ prefix: "/claims" })
  .use(setup)
  // Inspect a claim token (no auth required, safe info only)
  .get("/:token", async ({ params }) => {
    try {
      const claim = await db
        .select({ token: pendingClaims.token, email: pendingClaims.email, badgeId: pendingClaims.badgeId })
        .from(pendingClaims)
        .where(and(eq(pendingClaims.token, params.token), isNull(pendingClaims.claimedAt)))
        .limit(1);
      if (!claim.length) return { claim: null };

      let badge = null as null | { id: string; name: string };
      if (claim[0].badgeId) {
        const badgeRes = await db
          .select({ id: createdBadges.id, name: createdBadges.name })
          .from(createdBadges)
          .where(eq(createdBadges.id, claim[0].badgeId!))
          .limit(1);
        badge = badgeRes.length ? badgeRes[0] : null;
      }

      return { claim: { email: claim[0].email, badge } };
    } catch (error) {
      console.error("Error fetching claim:", error);
      return { error: String(error) };
    }
  })
  // Consume a claim after login; assigns badge and returns assignment id for redirect
  .post("/consume", async (context) => {
    try {
      const { token } = context.body as { token: string };
      const session = await userMiddleware(context);
      if (!session.user) {
        return { error: "Unauthorized" };
      }

      // Load claim
      const claimRes = await db
        .select()
        .from(pendingClaims)
        .where(and(eq(pendingClaims.token, token), isNull(pendingClaims.claimedAt)))
        .limit(1);
      if (!claimRes.length) {
        return { error: "Invalid or already consumed claim" };
      }
      const claim = claimRes[0];

      // Email must match the logged-in user
      if (session.user.email && session.user.email !== claim.email) {
        return { error: "This claim was sent to a different email" };
      }

      let assignmentId: string | null = null;
      if (claim.badgeId) {
        const assignment = await db
          .insert(badges)
          .values({ badgeId: claim.badgeId, userId: session.user.id })
          .returning();
        assignmentId = assignment[0].id;

        // Update student link if any
        await db
          .update(students)
          .set({ hasBadge: true, badgeId: assignmentId, signedUp: true, signedUpAt: new Date(), updatedAt: new Date() })
          .where(eq(students.email, claim.email));
      }

      // Mark claim consumed
      await db
        .update(pendingClaims)
        .set({ claimedAt: new Date() })
        .where(eq(pendingClaims.id, claim.id));

      return { success: true, assignmentId };
    } catch (error) {
      console.error("Error consuming claim:", error);
      return { error: String(error) };
    }
  }, {
    body: t.Object({ token: t.String() })
  });

