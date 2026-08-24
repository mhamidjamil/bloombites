'use client';

import { Label } from '@/components/ui/label';
import ImageUpload from '@/components/image-upload';
import { UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImagePickerProps {
  onImageSelected: (url: string) => void;
  onError?: (error: string) => void;
}

export default function ImagePicker({
  onImageSelected,
  onError,
}: ImagePickerProps) {
  const { toast } = useToast();

  const handleError =
    onError ??
    ((message: string) => {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: message,
      });
    });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <UploadCloud className="h-4 w-4" />
        <Label className="text-sm font-medium">Upload Image</Label>
      </div>
      <ImageUpload
        onUploadComplete={onImageSelected}
        onError={handleError}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        Upload a JPEG, PNG, or WebP image (max 5MB). Images are optimized and
        stored securely.
      </p>
    </div>
  );
}
