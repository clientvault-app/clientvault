"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addClientComment } from "@/lib/actions/comments";
import { toast } from "sonner";

interface ClientCommentFormProps {
  portalId: string;
  portalSlug: string;
  fileId?: string;
}

export function ClientCommentForm({
  portalId,
  portalSlug,
  fileId,
}: ClientCommentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      await addClientComment({
        portalId,
        portalSlug,
        fileId,
        authorName: name.trim(),
        authorEmail: email.trim(),
        content: content.trim(),
      });
      setContent("");
      setSubmitted(true);
      toast.success("Comment sent!");
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      toast.error("Failed to send comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Leave Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="client-name" className="text-xs">
                Your Name
              </Label>
              <Input
                id="client-name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="client-email" className="text-xs">
                Your Email
              </Label>
              <Input
                id="client-email"
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="client-comment" className="text-xs">
              Comment
            </Label>
            <Textarea
              id="client-comment"
              placeholder="Share your feedback..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              maxLength={2000}
              required
              disabled={isSubmitting}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={
              isSubmitting || !content.trim() || !name.trim() || !email.trim()
            }
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            ) : submitted ? (
              "Sent! ✓"
            ) : (
              <>
                <Send className="mr-2 h-3 w-3" />
                Send Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
