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
import Image from 'next/image';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  onError?: (error: string) => void;
  className?: string;
  currentImage?: string;
}

export default function ImageUpload({
  onUploadComplete,
  onError,
  className,
  currentImage,
}: ImageUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [cropMode, setCropMode] = useState<
    'free' | 'square' | 'landscape' | 'portrait'
  >('free');
  const [skipCropping, setSkipCropping] = useState(true);

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
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropMode('free');
      setSkipCropping(false);
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
    if (!imageSrc) return;

    try {
      setIsUploading(true);

      let fileToUpload: File;

      if (skipCropping) {
        // Convert data URL to blob and then to file
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        fileToUpload = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      } else {
        // Use cropped image
        if (!croppedAreaPixels) return;

        // 1. Get cropped image blob
        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (!croppedBlob) throw new Error('Could not crop image');
        fileToUpload = croppedBlob as File;
      }

      // 2. Try to compress image (optional)
      let fileToCompress = fileToUpload;
      try {
        const compressedFile = await imageCompression(fileToUpload, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/jpeg',
        });
        fileToCompress = compressedFile;
      } catch (compressionError) {
        console.warn(
          'Image compression failed, uploading original file:',
          compressionError
        );
        // Continue with original file if compression fails
      }

      // 3. Create FormData and upload directly to local API
      const formData = new FormData();
      formData.append('file', fileToCompress, 'image.jpg');

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
      // Removed toast here to prevent dialog interference
    } catch (error: any) {
      console.error(error);
      if (onError) {
        onError(error.message || 'Something went wrong');
      }
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>
              Adjust the image crop and zoom, or upload as-is.
            </DialogDescription>
          </DialogHeader>

          {/* Crop Mode Selection */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={skipCropping ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSkipCropping(!skipCropping)}
            >
              {skipCropping ? '✓ Upload Full Image' : 'Upload Full Image'}
            </Button>
            {!skipCropping && (
              <>
                <Button
                  variant={cropMode === 'free' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCropMode('free')}
                >
                  Free Crop
                </Button>
                <Button
                  variant={cropMode === 'square' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCropMode('square')}
                >
                  Square (1:1)
                </Button>
                <Button
                  variant={cropMode === 'landscape' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCropMode('landscape')}
                >
                  Landscape (16:9)
                </Button>
                <Button
                  variant={cropMode === 'portrait' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCropMode('portrait')}
                >
                  Portrait (3:4)
                </Button>
              </>
            )}
          </div>

          <div className="relative w-full h-[400px] bg-black rounded-md overflow-hidden">
            {imageSrc && !skipCropping && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={
                  cropMode === 'square'
                    ? 1
                    : cropMode === 'landscape'
                      ? 16 / 9
                      : cropMode === 'portrait'
                        ? 3 / 4
                        : undefined // free crop
                }
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
            {imageSrc && skipCropping && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-lg font-semibold mb-2">
                    Full Image Upload
                  </div>
                  <div className="text-sm opacity-75">
                    The entire image will be uploaded without cropping
                  </div>
                </div>
              </div>
            )}
          </div>

          {!skipCropping && (
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
          )}

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
              {skipCropping ? 'Upload Full Image' : 'Upload Cropped Image'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
