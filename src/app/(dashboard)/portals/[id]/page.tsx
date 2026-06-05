import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { portals, files, comments, messages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Send,
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
import { FileUpload } from "@/components/dashboard/file-upload";
import { FileActions } from "@/components/dashboard/file-actions";
import { CommentForm } from "@/components/dashboard/comment-form";
import { MessageThread } from "@/components/dashboard/message-thread";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

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
    limit: 50,
  });

  // Get messages
  const portalMessages = await db.query.messages.findMany({
    where: eq(messages.portalId, portal.id),
    orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    limit: 100,
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
          <TabsTrigger value="messages">
            Messages ({portalMessages.length})
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          <FileUpload portalId={portal.id} />

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
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(file.sizeBytes)} •{" "}
                          {file.mimeType || "unknown"} •{" "}
                          {new Date(file.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
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
                            ? "Changes"
                            : file.status}
                        </span>
                      </Badge>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                      <FileActions
                        fileId={file.id}
                        currentStatus={file.status}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Add Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentForm portalId={portal.id} />
            </CardContent>
          </Card>

          {portalComments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-4 font-semibold">No comments yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Comments from you and your client will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {portalComments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-4">
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
                      {comment.isInternal && (
                        <Badge variant="secondary" className="text-xs">
                          Internal
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm pl-8">{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Direct conversation with your client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageThread
                portalId={portal.id}
                messages={portalMessages}
                currentUserEmail={session.user.email || undefined}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
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
                <p className="text-sm font-medium">Brand Color</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className="h-6 w-6 rounded-full"
                    style={{ backgroundColor: portal.primaryColor }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {portal.primaryColor}
                  </span>
                </div>
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
