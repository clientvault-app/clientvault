"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { addComment } from "@/lib/actions/comments";
import { toast } from "sonner";

interface CommentFormProps {
  portalId: string;
  fileId?: string;
}

export function CommentForm({ portalId, fileId }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await addComment({
        portalId,
        fileId,
        content: content.trim(),
        isInternal,
      });
      setContent("");
      toast.success("Comment added");
    } catch (err) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={2000}
        disabled={isSubmitting}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="internal"
            checked={isInternal}
            onCheckedChange={setIsInternal}
          />
          <Label htmlFor="internal" className="text-xs text-muted-foreground">
            Internal note (hidden from client)
          </Label>
        </div>
        <Button type="submit" size="sm" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <Send className="mr-2 h-3 w-3" />
          )}
          Send
        </Button>
      </div>
    </form>
  );
}
