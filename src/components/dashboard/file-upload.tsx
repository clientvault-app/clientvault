"use client";

import { useState, useCallback } from "react";
import { Upload, X, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { saveUploadedFile } from "@/lib/actions/files";
import { toast } from "sonner";

interface FileUploadProps {
  portalId: string;
}

interface UploadingFile {
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "saving" | "done" | "error";
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function FileUpload({ portalId }: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const { startUpload, isUploading } = useUploadThing("portalFileUploader", {
    onUploadProgress: (p) => {
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading" ? { ...f, progress: p } : f
        )
      );
    },
    onClientUploadComplete: async (res) => {
      if (!res) return;

      setUploadingFiles((prev) =>
        prev.map((f) => ({ ...f, status: "saving" as const }))
      );

      // Save each file to the database
      for (const file of res) {
        try {
          await saveUploadedFile({
            portalId,
            name: file.name,
            url: file.ufsUrl,
            key: file.key,
            sizeBytes: file.size,
            mimeType: file.type,
          });
        } catch (err) {
          console.error("Failed to save file:", err);
          toast.error(`Failed to save ${file.name}`);
        }
      }

      setUploadingFiles((prev) =>
        prev.map((f) => ({ ...f, status: "done" as const, progress: 100 }))
      );

      toast.success(`${res.length} file${res.length > 1 ? "s" : ""} uploaded`);

      // Clear completed files after a brief delay
      setTimeout(() => {
        setUploadingFiles([]);
      }, 2000);
    },
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
      setUploadingFiles((prev) =>
        prev.map((f) => ({ ...f, status: "error" as const }))
      );
      setTimeout(() => setUploadingFiles([]), 3000);
    },
  });

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const filesArray = Array.from(fileList);
      if (filesArray.length === 0) return;

      setUploadingFiles(
        filesArray.map((f) => ({
          name: f.name,
          size: f.size,
          progress: 0,
          status: "uploading" as const,
        }))
      );

      startUpload(filesArray);
    },
    [startUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <Card
        className={`border-dashed transition-colors cursor-pointer ${
          isDragOver
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
            : "hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (isUploading) return;
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.accept =
            "image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.mp4,.mov,.mp3,.wav,.txt,.csv";
          input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files) handleFiles(files);
          };
          input.click();
        }}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground/50 mb-3" />
          )}
          <p className="text-sm font-medium">
            {isUploading
              ? "Uploading..."
              : isDragOver
              ? "Drop files here"
              : "Upload files"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isUploading
              ? "Please wait..."
              : "Drag and drop or click to upload deliverables"}
          </p>
          {!isUploading && (
            <Button variant="outline" size="sm" className="mt-4">
              Choose Files
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center space-x-3 rounded-lg border p-3 bg-muted/30"
            >
              {file.status === "done" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : file.status === "error" ? (
                <X className="h-4 w-4 text-red-500 flex-shrink-0" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)} •{" "}
                  {file.status === "uploading"
                    ? "Uploading..."
                    : file.status === "saving"
                    ? "Saving..."
                    : file.status === "done"
                    ? "Complete"
                    : "Failed"}
                </p>
              </div>
              {file.status === "uploading" && (
                <Progress value={file.progress} className="w-24 h-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
