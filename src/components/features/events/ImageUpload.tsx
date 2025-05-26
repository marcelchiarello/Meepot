"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useDropzone, FileWithPath } from "react-dropzone";
import Image from "next/image"; // For previewing
import { Button } from "@/components/ui/button"; // For remove button
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: File | string | null; // Can be File object, existing image URL string, or null
  onChange: (file: File | null) => void;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
  disabled?: boolean;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = { "image/jpeg": [], "image/png": [], "image/gif": [] },
  disabled,
  className,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Effect to update preview when 'value' prop changes (e.g., from form state)
  useEffect(() => {
    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof value === "string") {
      setPreview(value); // Assume it's a URL
    } else {
      setPreview(null);
    }
  }, [value]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[], rejectedFiles: any[]) => {
      setError(null);
      if (rejectedFiles && rejectedFiles.length > 0) {
        const firstError = rejectedFiles[0].errors[0];
        if (firstError.code === "file-too-large") {
          setError(`File is too large. Max size is ${maxSize / (1024 * 1024)}MB.`);
        } else if (firstError.code === "file-invalid-type") {
          setError("Invalid file type. Please upload an image (JPEG, PNG, GIF).");
        } else {
          setError(firstError.message || "File rejected.");
        }
        onChange(null);
        return;
      }

      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        console.log("Image Optimization Placeholder: Optimizing", file.name); // Placeholder for optimization
        onChange(file);
      }
    },
    [onChange, maxSize, accept]
  );

  const { getRootProps, getInputProps, isDragActive, isFocused, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled,
  });

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent triggering dropzone click
    onChange(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer",
          "border-input hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDragActive && "border-primary bg-accent/20",
          (isDragReject || error) && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed",
          preview && "h-auto p-2" // Adjust padding if preview exists
        )}
      >
        <input {...getInputProps()} />
        {preview ? (
          <div className="relative w-full min-h-32 h-auto sm:max-h-80">
            <Image
              src={preview}
              alt="Selected image preview"
              fill
              style={{ objectFit: "contain" }}
              className="rounded-md"
            />
          </div>
        ) : isDragActive ? (
          <p className="text-primary">Drop the image here...</p>
        ) : (
          <div className="text-center text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto mb-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p>Drag 'n' drop an image here, or click to select one.</p>
            <p className="text-xs">PNG, JPG, GIF up to {maxSize / (1024 * 1024)}MB</p>
          </div>
        )}
      </div>
      {preview && !disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRemoveImage}
          className="w-full"
        >
          Remove Image
        </Button>
      )}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  );
};

export default ImageUpload;
