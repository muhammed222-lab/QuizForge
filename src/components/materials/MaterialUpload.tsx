import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { materialsApi } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface MaterialUploadProps {
  classId: string;
  onSuccess?: (material: any) => void;
}

export function MaterialUpload({ classId, onSuccess }: MaterialUploadProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const response = await materialsApi.uploadMaterial(file, title, description, classId);
      
      if (response && response.data && response.data.material) {
        toast({
          title: 'Material uploaded',
          description: 'Your material has been uploaded successfully.',
        });
        
        // Reset form
        setTitle('');
        setDescription('');
        setFile(null);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(response.data.material);
        }
      } else {
        throw new Error('Failed to upload material');
      }
    } catch (error) {
      console.error('Error uploading material:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Material</CardTitle>
        <CardDescription>Upload documents for this class</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this material"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
              required
            />
            <p className="text-sm text-gray-500">
              Supported formats: PDF, Word, PowerPoint, Text
            </p>
          </div>
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <Button
            type="submit"
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? 'Uploading...' : 'Upload Material'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default MaterialUpload;
