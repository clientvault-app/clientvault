"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages, portals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ownerMessageSchema = z.object({
  portalId: z.string().uuid(),
  content: z.string().min(1, "Message cannot be empty").max(5000),
});

// Owner sends message from dashboard
export async function sendMessage(data: z.infer<typeof ownerMessageSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const portal = await db.query.portals.findFirst({
    where: and(
      eq(portals.id, data.portalId),
      eq(portals.userId, session.user.id)
    ),
  });

  if (!portal) {
    throw new Error("Portal not found");
  }

  const parsed = ownerMessageSchema.parse(data);

  const [message] = await db
    .insert(messages)
    .values({
      portalId: parsed.portalId,
      authorEmail: session.user.email!,
      authorName: session.user.name || "Portal Owner",
      content: parsed.content,
    })
    .returning();

  revalidatePath(`/portals/${data.portalId}`);
  return message;
}

// Client sends message from public portal
const clientMessageSchema = z.object({
  portalId: z.string().uuid(),
  portalSlug: z.string(),
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email(),
  content: z.string().min(1).max(5000),
});

export async function sendClientMessage(
  data: z.infer<typeof clientMessageSchema>
) {
  const portal = await db.query.portals.findFirst({
    where: and(
      eq(portals.id, data.portalId),
      eq(portals.slug, data.portalSlug)
    ),
  });

  if (!portal || portal.status === "archived") {
    throw new Error("Portal not found");
  }

  const parsed = clientMessageSchema.parse(data);

  const [message] = await db
    .insert(messages)
    .values({
      portalId: parsed.portalId,
      authorEmail: parsed.authorEmail,
      authorName: parsed.authorName,
      content: parsed.content,
    })
    .returning();

  revalidatePath(`/portal/${data.portalSlug}`);
  revalidatePath(`/portals/${data.portalId}`);
  return message;
}
