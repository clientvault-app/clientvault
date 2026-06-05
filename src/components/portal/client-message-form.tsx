"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { sendClientMessage } from "@/lib/actions/messages";
import { toast } from "sonner";

interface Message {
  id: string;
  authorEmail: string;
  authorName: string;
  content: string;
  createdAt: Date;
}

interface ClientMessageFormProps {
  portalId: string;
  portalSlug: string;
  messages: Message[];
}

export function ClientMessageForm({
  portalId,
  portalSlug,
  messages,
}: ClientMessageFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      await sendClientMessage({
        portalId,
        portalSlug,
        authorName: name.trim(),
        authorEmail: email.trim(),
        content: content.trim(),
      });
      setContent("");
      toast.success("Message sent!");
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Message List */}
      {messages.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {messages.map((msg) => (
            <Card key={msg.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
                    {msg.authorName.charAt(0)}
                  </div>
                  <span className="text-xs font-medium">{msg.authorName}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm pl-7 whitespace-pre-wrap">{msg.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Send Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="msg-name" className="text-xs">
              Your Name
            </Label>
            <Input
              id="msg-name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="msg-email" className="text-xs">
              Your Email
            </Label>
            <Input
              id="msg-email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="flex space-x-2">
          <Textarea
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            maxLength={5000}
            disabled={isSubmitting}
            className="flex-1 resize-none"
          />
          <Button
            type="submit"
            size="icon"
            disabled={
              isSubmitting || !content.trim() || !name.trim() || !email.trim()
            }
            className="self-end"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
