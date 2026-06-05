import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { portals, files } from "@/lib/db/schema";
import { eq, count, sum } from "drizzle-orm";
import Link from "next/link";
import { Plus, FolderOpen, FileText, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  // Get portal count
  const [portalCount] = await db
    .select({ count: count() })
    .from(portals)
    .where(eq(portals.userId, userId));

  // Get all user portals with file counts
  const userPortals = await db.query.portals.findMany({
    where: eq(portals.userId, userId),
    orderBy: (portals, { desc }) => [desc(portals.createdAt)],
    limit: 5,
  });

  // Get total files and storage
  const userPortalIds = userPortals.map((p) => p.id);
  let totalFiles = 0;
  let totalStorage = 0;

  if (userPortalIds.length > 0) {
    for (const portal of userPortals) {
      const [fileStats] = await db
        .select({
          count: count(),
          totalSize: sum(files.sizeBytes),
        })
        .from(files)
        .where(eq(files.portalId, portal.id));
      totalFiles += Number(fileStats?.count || 0);
      totalStorage += Number(fileStats?.totalSize || 0);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name || "there"}!
          </p>
        </div>
        <Link href="/portals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Portal
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Active Portals
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portalCount?.count || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Storage Used
            </CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(totalStorage)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Portals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Portals</CardTitle>
          <CardDescription>Your latest client portals</CardDescription>
        </CardHeader>
        <CardContent>
          {userPortals.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No portals yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first client portal to get started.
              </p>
              <Link href="/portals/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Portal
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userPortals.map((portal) => (
                <Link
                  key={portal.id}
                  href={`/portals/${portal.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{
                        backgroundColor: portal.primaryColor,
                      }}
                    >
                      {portal.clientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{portal.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        /{portal.slug}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      portal.status === "active" ? "default" : "secondary"
                    }
                  >
                    {portal.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
