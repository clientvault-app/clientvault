"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { comments, portals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addCommentSchema = z.object({
  portalId: z.string().uuid(),
  fileId: z.string().uuid().optional(),
  content: z.string().min(1, "Comment cannot be empty").max(2000),
  isInternal: z.boolean().default(false),
});

// Owner adds comment from dashboard
export async function addComment(data: z.infer<typeof addCommentSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify user owns the portal
  const portal = await db.query.portals.findFirst({
    where: and(
      eq(portals.id, data.portalId),
      eq(portals.userId, session.user.id)
    ),
  });

  if (!portal) {
    throw new Error("Portal not found");
  }

  const parsed = addCommentSchema.parse(data);

  const [comment] = await db
    .insert(comments)
    .values({
      portalId: parsed.portalId,
      fileId: parsed.fileId || null,
      authorEmail: session.user.email!,
      authorName: session.user.name || "Portal Owner",
      content: parsed.content,
      isInternal: parsed.isInternal,
    })
    .returning();

  revalidatePath(`/portals/${data.portalId}`);
  return comment;
}

// Client adds comment from public portal (no auth required)
const clientCommentSchema = z.object({
  portalId: z.string().uuid(),
  portalSlug: z.string(),
  fileId: z.string().uuid().optional(),
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email(),
  content: z.string().min(1).max(2000),
});

export async function addClientComment(
  data: z.infer<typeof clientCommentSchema>
) {
  // Verify portal exists and is active
  const portal = await db.query.portals.findFirst({
    where: and(
      eq(portals.id, data.portalId),
      eq(portals.slug, data.portalSlug)
    ),
  });

  if (!portal || portal.status === "archived") {
    throw new Error("Portal not found");
  }

  const parsed = clientCommentSchema.parse(data);

  const [comment] = await db
    .insert(comments)
    .values({
      portalId: parsed.portalId,
      fileId: parsed.fileId || null,
      authorEmail: parsed.authorEmail,
      authorName: parsed.authorName,
      content: parsed.content,
      isInternal: false,
    })
    .returning();

  revalidatePath(`/portal/${data.portalSlug}`);
  revalidatePath(`/portals/${data.portalId}`);
  return comment;
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const comment = await db.query.comments.findFirst({
    where: eq(comments.id, commentId),
    with: { portal: true },
  });

  if (!comment || comment.portal.userId !== session.user.id) {
    throw new Error("Comment not found");
  }

  await db.delete(comments).where(eq(comments.id, commentId));

  revalidatePath(`/portals/${comment.portalId}`);
  return { success: true };
}
