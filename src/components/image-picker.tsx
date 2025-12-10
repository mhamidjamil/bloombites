'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUpload from '@/components/image-upload';
import { LinkIcon, UploadCloud, X } from 'lucide-react';
import { addSiteImage } from '@/lib/db-service';

interface ImagePickerProps {
  onImageSelected: (url: string) => void;
  // If true, it saves uploaded image to library.
  // If false, it just gives the URL (e.g. for external links).
  // Default true for "Upload" tab to be useful.
}

export default function ImagePicker({ onImageSelected }: ImagePickerProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [urlInput, setUrlInput] = useState('');

  const handleUrlSubmit = () => {
    if (urlInput) {
      onImageSelected(urlInput);
      setUrlInput('');
    }
  };

  const handleUploadComplete = async (url: string) => {
    // Logic for saving to library happens in parent or here?
    // In previous steps, I did "saveToLibrary" in parent.
    // But ImageUpload *already* uploads to R2.
    // The parent usually wants to just know the URL.
    // BUT, if I upload via R2, I *should* log it in my site_images for management.
    // To keep it simple, I will let the parent handle "saving to history" if they want,
    // OR I can do it here.
    // Since "ImageUpload" uploads to R2 but doesn't add to Firestore `site_images`,
    // I should arguably do it here so every upload is tracked.
    // Let's do it here for consistency.
    try {
      await addSiteImage({
        url,
        name: 'Direct Upload',
        description: 'Uploaded via ImagePicker',
        uploadedAt: Date.now(),
      });
    } catch (e) {
      console.error(e);
    }

    onImageSelected(url);
  };

  return (
    <div className="border rounded-md p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4" /> Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" /> Paste URL
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a new image from your device.
            </p>
            <ImageUpload onUploadComplete={handleUploadComplete} />
          </div>
        </TabsContent>
        <TabsContent value="url">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste a direct link to an image from the web.
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
              <Button onClick={handleUrlSubmit} disabled={!urlInput}>
                Use
              </Button>
            </div>
            {urlInput && (
              <div className="relative aspect-video bg-muted rounded-md overflow-hidden border">
                {/* Preview attempt */}
                <img
                  src={urlInput}
                  className="w-full h-full object-contain"
                  alt="Preview"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
