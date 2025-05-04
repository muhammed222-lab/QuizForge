import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { materialsApi } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

interface Material {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

interface MaterialListProps {
  classId: string;
  onSelectMaterial?: (material: Material) => void;
  refreshTrigger?: number;
}

export function MaterialList({ classId, onSelectMaterial, refreshTrigger = 0 }: MaterialListProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await materialsApi.getMaterials(classId);
        
        if (response && response.data && response.data.materials) {
          setMaterials(response.data.materials);
        } else {
          throw new Error('Failed to fetch materials');
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [classId, refreshTrigger]);

  const handleProcessMaterial = async (materialId: string) => {
    setProcessingId(materialId);
    
    try {
      const response = await materialsApi.processMaterial(materialId);
      
      if (response && response.status === 'success') {
        toast({
          title: 'Processing started',
          description: 'The material is being processed for AI question generation.',
        });
      } else {
        throw new Error('Failed to process material');
      }
    } catch (error) {
      console.error('Error processing material:', error);
      toast({
        title: 'Processing failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }
    
    try {
      const response = await materialsApi.deleteMaterial(materialId);
      
      if (response && response.status === 'success') {
        // Remove the material from the list
        setMaterials(materials.filter(m => m.id !== materialId));
        
        toast({
          title: 'Material deleted',
          description: 'The material has been deleted successfully.',
        });
      } else {
        throw new Error('Failed to delete material');
      }
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else if (fileType.includes('presentation') || fileType.includes('ppt')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Class Materials</CardTitle>
          <CardDescription>Loading materials...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div>
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24 mt-2" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Materials</CardTitle>
        <CardDescription>
          {materials.length === 0
            ? 'No materials uploaded yet'
            : `${materials.length} material${materials.length === 1 ? '' : 's'} available`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}
        
        {materials.length === 0 && !error ? (
          <div className="text-center py-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500">Upload materials to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getFileIcon(material.file_type)}
                  <div>
                    <h4 className="font-medium">{material.title}</h4>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(material.file_size)} • {new Date(material.created_at).toLocaleDateString()}
                    </p>
                    {material.description && (
                      <p className="text-sm mt-1">{material.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(material.file_url, '_blank')}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectMaterial && onSelectMaterial(material)}
                  >
                    Use
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleProcessMaterial(material.id)}
                    disabled={processingId === material.id}
                  >
                    {processingId === material.id ? 'Processing...' : 'Process'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteMaterial(material.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MaterialList;
