import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { portals, files, comments } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  MessageSquare,
  Copy,
  MoreHorizontal,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";

interface PortalPageProps {
  params: Promise<{ id: string }>;
}

export default async function PortalPage({ params }: PortalPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const portal = await db.query.portals.findFirst({
    where: and(eq(portals.id, id), eq(portals.userId, session.user.id)),
  });

  if (!portal) notFound();

  // Get files for this portal
  const portalFiles = await db.query.files.findMany({
    where: eq(files.portalId, portal.id),
    orderBy: (files, { desc }) => [desc(files.createdAt)],
  });

  // Get comments
  const portalComments = await db.query.comments.findMany({
    where: eq(comments.portalId, portal.id),
    orderBy: (comments, { desc }) => [desc(comments.createdAt)],
    limit: 20,
  });

  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${portal.slug}`;

  const pendingFiles = portalFiles.filter((f) => f.status === "pending");
  const approvedFiles = portalFiles.filter((f) => f.status === "approved");
  const changesFiles = portalFiles.filter(
    (f) => f.status === "changes_requested"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/portals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div
              className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: portal.primaryColor }}
            >
              {portal.clientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{portal.clientName}</h1>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>/{portal.slug}</span>
                <Badge
                  variant={
                    portal.status === "active" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {portal.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <CopyLinkButton url={portalUrl} />
          <Link href={`/portal/${portal.slug}`} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-3 w-3" />
              View Portal
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Files</span>
            </div>
            <p className="text-2xl font-bold mt-1">{portalFiles.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold mt-1">{pendingFiles.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Approved</span>
            </div>
            <p className="text-2xl font-bold mt-1">{approvedFiles.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Comments</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {portalComments.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="files" className="space-y-4">
        <TabsList>
          <TabsTrigger value="files">
            Files ({portalFiles.length})
          </TabsTrigger>
          <TabsTrigger value="comments">
            Comments ({portalComments.length})
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          {/* Upload Area */}
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Upload className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium">Upload files</p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag and drop or click to upload deliverables
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Choose Files
              </Button>
            </CardContent>
          </Card>

          {/* File List */}
          {portalFiles.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-4 font-semibold">No files yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your first deliverable above.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {portalFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="flex items-center justify-between py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.mimeType} •{" "}
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        file.status === "approved"
                          ? "default"
                          : file.status === "changes_requested"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {file.status === "changes_requested"
                        ? "Changes Requested"
                        : file.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comments">
          {portalComments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-4 font-semibold">No comments yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Comments from your client will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {portalComments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium">
                        {comment.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      {comment.isInternal && (
                        <Badge variant="secondary" className="text-xs">
                          Internal
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Portal Settings</CardTitle>
              <CardDescription>
                Update your portal configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Portal Link</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {portalUrl}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium">Client Email</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {portal.clientEmail || "Not set"}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(portal.createdAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
