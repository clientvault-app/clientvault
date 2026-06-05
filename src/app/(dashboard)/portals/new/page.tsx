"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createPortal } from "@/lib/actions/portals";

const colorOptions = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#64748b", // Slate
];

export default function NewPortalPage() {
  const [selectedColor, setSelectedColor] = useState("#6366f1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/portals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Portal</h1>
          <p className="text-muted-foreground">
            Create a new client portal in seconds
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portal Details</CardTitle>
          <CardDescription>
            Enter your client&apos;s information. You can always edit this later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData) => {
              setIsSubmitting(true);
              formData.set("primaryColor", selectedColor);
              await createPortal(formData);
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                name="clientName"
                placeholder="e.g. Acme Corp"
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                id="clientEmail"
                name="clientEmail"
                type="email"
                placeholder="client@example.com"
              />
              <p className="text-xs text-muted-foreground">
                Optional. Used for email notifications.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of the project..."
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Brand Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`h-8 w-8 rounded-full transition-all ${
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-indigo-600 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Preview */}
              <div className="mt-4 flex items-center space-x-3 p-4 rounded-lg border bg-muted/30">
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: selectedColor }}
                >
                  A
                </div>
                <div>
                  <p className="font-medium">Acme Corp</p>
                  <p className="text-sm text-muted-foreground">
                    Portal preview
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Link href="/portals">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Portal"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
