"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Trash2,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateFileStatus, deleteFile } from "@/lib/actions/files";
import { toast } from "sonner";

interface FileActionsProps {
  fileId: string;
  currentStatus: string;
}

export function FileActions({ fileId, currentStatus }: FileActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleStatusChange = async (
    status: "approved" | "changes_requested" | "pending"
  ) => {
    setIsLoading(true);
    setOpen(false);
    try {
      await updateFileStatus(fileId, status);
      toast.success(
        status === "approved"
          ? "File approved"
          : status === "changes_requested"
          ? "Changes requested"
          : "Marked as pending"
      );
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setOpen(false);
    if (!confirm("Are you sure you want to delete this file?")) return;
    setIsLoading(true);
    try {
      await deleteFile(fileId);
      toast.success("File deleted");
    } catch (err) {
      toast.error("Failed to delete file");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen(!open)}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-md border bg-popover p-1 shadow-md">
          {currentStatus !== "approved" && (
            <button
              onClick={() => handleStatusChange("approved")}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              Approve
            </button>
          )}
          {currentStatus !== "changes_requested" && (
            <button
              onClick={() => handleStatusChange("changes_requested")}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
              Request Changes
            </button>
          )}
          {currentStatus !== "pending" && (
            <button
              onClick={() => handleStatusChange("pending")}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-muted transition-colors"
            >
              Reset to Pending
            </button>
          )}
          <div className="my-1 h-px bg-border" />
          <button
            onClick={handleDelete}
            className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
