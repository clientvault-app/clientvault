"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { sendMessage } from "@/lib/actions/messages";
import { toast } from "sonner";

interface Message {
  id: string;
  authorEmail: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

interface MessageThreadProps {
  portalId: string;
  messages: Message[];
  currentUserEmail?: string;
}

export function MessageThread({
  portalId,
  messages,
  currentUserEmail,
}: MessageThreadProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await sendMessage({
        portalId,
        content: content.trim(),
      });
      setContent("");
      toast.success("Message sent");
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((msg) => {
            const isOwner = msg.authorEmail === currentUserEmail;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwner ? "justify-end" : "justify-start"}`}
              >
                <Card
                  className={`max-w-[80%] ${
                    isOwner
                      ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800"
                      : ""
                  }`}
                >
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                        {msg.authorName.charAt(0)}
                      </div>
                      <span className="text-xs font-medium">
                        {msg.authorName}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm pl-7 whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Send Message Form */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Textarea
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          maxLength={5000}
          disabled={isSubmitting}
          className="flex-1 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isSubmitting || !content.trim()}
          className="self-end"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
