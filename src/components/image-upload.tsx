'use client';

import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import getCroppedImg from '@/lib/image-utils';
import imageCompression from 'browser-image-compression';
import { Loader2, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  className?: string;
  currentImage?: string;
}

export default function ImageUpload({
  onUploadComplete,
  className,
  currentImage,
}: ImageUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setIsOpen(true);
      // Reset input value to allow selecting same file again
      e.target.value = '';
    }
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener(
        'load',
        () => resolve(reader.result as string),
        false
      );
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);

      // 1. Get cropped image blob
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error('Could not crop image');

      // 2. Compress image
      const compressedFile = await imageCompression(croppedBlob as File, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg',
      });

      // 3. Create FormData and upload directly to local API
      const formData = new FormData();
      formData.append('file', compressedFile, 'image.jpg');

      const response = await fetch('/api/items/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const { url } = await response.json();

      // 4. Complete
      onUploadComplete(url);
      setIsOpen(false);
      setImageSrc(null);
      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: error.message || 'Something went wrong',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={className}>
      {currentImage ? (
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden border bg-muted">
          <Image
            src={currentImage}
            alt="Current image"
            fill
            className="object-cover"
            unoptimized
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => onUploadComplete('')} // Or a dedicated remove handler
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <div className="flex items-center gap-4">
        <Button variant="outline" className="relative cursor-pointer" asChild>
          <label>
            <Upload className="mr-2 h-4 w-4" />
            Select Image
            <input
              type="file"
              onChange={onFileChange}
              accept="image/*"
              className="hidden"
            />
          </label>
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
            <DialogDescription>
              Adjust the image crop and zoom before uploading.
            </DialogDescription>
          </DialogHeader>

          <div className="relative w-full h-[400px] bg-black rounded-md overflow-hidden">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3} // Default aspect ratio, maybe make prop?
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>

          <div className="py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground w-12">Zoom</span>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                className="flex-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
