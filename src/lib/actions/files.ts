"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { files, portals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const saveFileSchema = z.object({
  portalId: z.string().uuid(),
  name: z.string().min(1).max(255),
  url: z.string().url(),
  key: z.string().optional(),
  sizeBytes: z.number().min(0),
  mimeType: z.string().optional(),
});

export async function saveUploadedFile(data: z.infer<typeof saveFileSchema>) {
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

  const parsed = saveFileSchema.parse(data);

  const [file] = await db
    .insert(files)
    .values({
      portalId: parsed.portalId,
      name: parsed.name,
      url: parsed.url,
      key: parsed.key || null,
      sizeBytes: parsed.sizeBytes,
      mimeType: parsed.mimeType || null,
      uploadedBy: session.user.id,
      status: "pending",
    })
    .returning();

  revalidatePath(`/portals/${data.portalId}`);
  return file;
}

export async function updateFileStatus(
  fileId: string,
  status: "pending" | "approved" | "changes_requested"
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Get the file and verify ownership through portal
  const file = await db.query.files.findFirst({
    where: eq(files.id, fileId),
    with: { portal: true },
  });

  if (!file || file.portal.userId !== session.user.id) {
    throw new Error("File not found");
  }

  await db
    .update(files)
    .set({ status })
    .where(eq(files.id, fileId));

  revalidatePath(`/portals/${file.portalId}`);
  return { success: true };
}

export async function deleteFile(fileId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const file = await db.query.files.findFirst({
    where: eq(files.id, fileId),
    with: { portal: true },
  });

  if (!file || file.portal.userId !== session.user.id) {
    throw new Error("File not found");
  }

  // TODO: Delete from UploadThing storage too
  await db.delete(files).where(eq(files.id, fileId));

  revalidatePath(`/portals/${file.portalId}`);
  return { success: true };
}
