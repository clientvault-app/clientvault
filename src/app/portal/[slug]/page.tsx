import { db } from "@/lib/db";
import { portals, files, comments, messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Download,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Metadata } from "next";

interface PortalPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PortalPageProps): Promise<Metadata> {
  const { slug } = await params;
  const portal = await db.query.portals.findFirst({
    where: eq(portals.slug, slug),
  });

  if (!portal) {
    return { title: "Portal Not Found" };
  }

  return {
    title: `${portal.clientName} — Client Portal`,
    description: portal.description || "Your client portal",
  };
}

export default async function ClientPortalPage({ params }: PortalPageProps) {
  const { slug } = await params;

  const portal = await db.query.portals.findFirst({
    where: eq(portals.slug, slug),
  });

  if (!portal || portal.status === "archived") {
    notFound();
  }

  // Get files
  const portalFiles = await db.query.files.findMany({
    where: eq(files.portalId, portal.id),
    orderBy: (files, { desc }) => [desc(files.createdAt)],
  });

  // Get public comments
  const portalComments = await db.query.comments.findMany({
    where: eq(comments.portalId, portal.id),
    orderBy: (comments, { desc }) => [desc(comments.createdAt)],
  });

  const publicComments = portalComments.filter((c) => !c.isInternal);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header
        className="border-b bg-background"
        style={{ borderBottomColor: portal.primaryColor + "40" }}
      >
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center space-x-4">
            {portal.logoUrl ? (
              <img
                src={portal.logoUrl}
                alt={portal.clientName}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: portal.primaryColor }}
              >
                {portal.clientName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{portal.clientName}</h1>
              {portal.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {portal.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Files Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Deliverables
          </h2>

          {portalFiles.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-4 font-semibold">No files yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your deliverables will appear here when they&apos;re ready.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {portalFiles.map((file) => (
                <Card key={file.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="flex items-center justify-between py-4 px-5">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded{" "}
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={
                          file.status === "approved"
                            ? "default"
                            : file.status === "changes_requested"
                            ? "destructive"
                            : "secondary"
                        }
                        className="flex items-center space-x-1"
                      >
                        {file.status === "approved" && (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {file.status === "pending" && (
                          <Clock className="h-3 w-3" />
                        )}
                        {file.status === "changes_requested" && (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        <span>
                          {file.status === "changes_requested"
                            ? "Changes Needed"
                            : file.status === "pending"
                            ? "Awaiting Review"
                            : "Approved"}
                        </span>
                      </Badge>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Comments Section */}
        {publicComments.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Activity
            </h2>
            <div className="space-y-3">
              {publicComments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {comment.authorName.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm pl-8">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>
              Powered by{" "}
              <a
                href="https://clientvault.app"
                className="font-medium hover:text-foreground transition-colors"
              >
                ClientVault
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
