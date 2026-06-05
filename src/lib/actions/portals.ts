"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { portals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createPortalSchema = z.object({
  clientName: z.string().min(1, "Client name is required").max(100),
  clientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  description: z.string().max(500).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
});

export async function createPortal(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const raw = {
    clientName: formData.get("clientName") as string,
    clientEmail: formData.get("clientEmail") as string,
    description: formData.get("description") as string,
    primaryColor: (formData.get("primaryColor") as string) || "#6366f1",
  };

  const parsed = createPortalSchema.parse(raw);

  // Generate unique slug
  const baseSlug = parsed.clientName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = `${baseSlug}-${nanoid(6)}`;

  const [portal] = await db
    .insert(portals)
    .values({
      userId: session.user.id,
      clientName: parsed.clientName,
      clientEmail: parsed.clientEmail || null,
      description: parsed.description || null,
      primaryColor: parsed.primaryColor,
      slug,
    })
    .returning();

  revalidatePath("/dashboard");
  revalidatePath("/portals");
  redirect(`/portals/${portal.id}`);
}

export async function updatePortal(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const raw = {
    clientName: formData.get("clientName") as string,
    clientEmail: formData.get("clientEmail") as string,
    description: formData.get("description") as string,
    primaryColor: (formData.get("primaryColor") as string) || "#6366f1",
  };

  const parsed = createPortalSchema.parse(raw);

  await db
    .update(portals)
    .set({
      clientName: parsed.clientName,
      clientEmail: parsed.clientEmail || null,
      description: parsed.description || null,
      primaryColor: parsed.primaryColor,
      updatedAt: new Date(),
    })
    .where(and(eq(portals.id, id), eq(portals.userId, session.user.id)));

  revalidatePath(`/portals/${id}`);
  revalidatePath("/portals");
  revalidatePath("/dashboard");
}

export async function deletePortal(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(portals)
    .where(and(eq(portals.id, id), eq(portals.userId, session.user.id)));

  revalidatePath("/portals");
  revalidatePath("/dashboard");
  redirect("/portals");
}

export async function archivePortal(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db
    .update(portals)
    .set({ status: "archived", updatedAt: new Date() })
    .where(and(eq(portals.id, id), eq(portals.userId, session.user.id)));

  revalidatePath(`/portals/${id}`);
  revalidatePath("/portals");
  revalidatePath("/dashboard");
}
