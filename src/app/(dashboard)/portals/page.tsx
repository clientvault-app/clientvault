import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { portals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { Plus, FolderOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PortalsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userPortals = await db.query.portals.findMany({
    where: eq(portals.userId, session.user.id),
    orderBy: (portals, { desc }) => [desc(portals.createdAt)],
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portals</h1>
          <p className="text-muted-foreground">
            Manage your client portals
          </p>
        </div>
        <Link href="/portals/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Portal
          </Button>
        </Link>
      </div>

      {userPortals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <FolderOpen className="mx-auto h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-6 text-xl font-semibold">No portals yet</h3>
            <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
              Create your first client portal. It takes 60 seconds and your
              client will love it.
            </p>
            <Link href="/portals/new">
              <Button className="mt-6" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Portal
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userPortals.map((portal) => (
            <Link key={portal.id} href={`/portals/${portal.id}`}>
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: portal.primaryColor }}
                      >
                        {portal.clientName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {portal.clientName}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          /{portal.slug}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant={
                        portal.status === "active" ? "default" : "secondary"
                      }
                    >
                      {portal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {portal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {portal.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Created{" "}
                      {new Date(portal.createdAt).toLocaleDateString()}
                    </span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
