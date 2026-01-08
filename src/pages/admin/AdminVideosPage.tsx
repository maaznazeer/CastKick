import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video,
  Upload,
  Play,
  Trash2,
  Eye,
  Clock,
  MoreVertical,
  Plus,
  Loader2,
  Radio,
  FileVideo,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStreams } from '@/hooks/useStreams';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string;
  duration: number;
  view_count: number;
  like_count: number;
  category: string;
  tags: string[];
  is_published: boolean;
  created_at: string;
  published_at: string | null;
}

const categories = ['Football', 'Basketball', 'MMA', 'Motorsport', 'Tennis', 'Cricket', 'General'];

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export default function AdminVideosPage() {
  const navigate = useNavigate();
  const { profile } = useAuthContext();
  const { createStream, startStream } = useStreams();
  const { toast } = useToast();
  
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Football',
    tags: '',
    videoUrl: '',
  });

  // Fetch videos
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch videos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title from filename if empty
      if (!formData.title) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, title: nameWithoutExt }));
      }
    }
  };

  const handleUpload = async () => {
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title',
        variant: 'destructive',
      });
      return;
    }

    if (uploadMode === 'url' && !formData.videoUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a video URL',
        variant: 'destructive',
      });
      return;
    }

    if (uploadMode === 'file' && !selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a video file',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let videoUrl = formData.videoUrl;

      if (uploadMode === 'file' && selectedFile) {
        // Upload to Supabase Storage
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `videos/${fileName}`;

        // Simulate progress while uploading
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 5, 80));
        }, 100);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false,
          });

        clearInterval(progressInterval);

        if (uploadError) {
          // If bucket doesn't exist, use a placeholder URL
          console.error('Upload error:', uploadError);
          videoUrl = URL.createObjectURL(selectedFile);
          toast({
            title: 'Note',
            description: 'Video saved with local reference. Storage bucket may need configuration.',
          });
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('videos')
            .getPublicUrl(filePath);
          videoUrl = urlData.publicUrl;
        }
      }

      setUploadProgress(90);

      const { data, error } = await supabase
        .from('videos')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
          video_url: videoUrl,
          uploader_id: profile?.id,
          is_published: false,
          duration: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setUploadProgress(100);
      
      toast({
        title: 'Video Added',
        description: 'Your video has been added successfully',
      });

      setUploadDialogOpen(false);
      setFormData({ title: '', description: '', category: 'Football', tags: '', videoUrl: '' });
      setSelectedFile(null);
      fetchVideos();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add video',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handlePublish = async (videoId: string, publish: boolean) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({
          is_published: publish,
          published_at: publish ? new Date().toISOString() : null,
        })
        .eq('id', videoId);

      if (error) throw error;

      toast({
        title: publish ? 'Video Published' : 'Video Unpublished',
        description: publish ? 'The video is now live' : 'The video is now hidden',
      });
      fetchVideos();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update video',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      toast({
        title: 'Video Deleted',
        description: 'The video has been removed',
      });
      fetchVideos();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete video',
        variant: 'destructive',
      });
    }
  };

  const handleStreamVideo = async (video: VideoItem) => {
    try {
      // Create a new stream for this video with video_url
      const stream = await createStream({
        title: `Streaming: ${video.title}`,
        description: video.description || `Watch ${video.title} live`,
        category: video.category,
        tags: video.tags,
        videoUrl: video.video_url,
      });

      // Start the stream
      await startStream(stream.id);

      toast({
        title: 'Stream Created',
        description: 'Redirecting to broadcast...',
      });

      // Navigate to broadcast page with video URL
      navigate(`/admin/broadcast/${stream.id}?videoUrl=${encodeURIComponent(video.video_url)}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create stream',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Videos</h1>
          <p className="text-muted-foreground">Manage your video content</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <Upload className="w-4 h-4" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Video</DialogTitle>
              <DialogDescription>
                Upload a video from your device or add by URL
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Upload Mode Toggle */}
              <div className="flex gap-2 p-1 bg-secondary rounded-lg">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    uploadMode === 'file' 
                      ? 'bg-background shadow text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    uploadMode === 'url' 
                      ? 'bg-background shadow text-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FileVideo className="w-4 h-4" />
                  Video URL
                </button>
              </div>

              {/* File Upload */}
              {uploadMode === 'file' && (
                <div>
                  <Label>Select Video File</Label>
                  <div 
                    className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileVideo className="w-8 h-8 text-primary" />
                        <div className="text-left">
                          <p className="font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Click to browse or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          MP4, WebM, MOV up to 500MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* URL Input */}
              {uploadMode === 'url' && (
                <div>
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    placeholder="https://example.com/video.mp4"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a direct video URL (MP4, WebM, etc.)
                  </p>
                </div>
              )}
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter video title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your video..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g. highlights, goals, match"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              {isUploading && (
                <div>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Adding video... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setUploadDialogOpen(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button variant="hero" onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Video
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Videos Grid */}
      {videos.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="stream-card overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-secondary">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileVideo className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                  {formatDuration(video.duration)}
                </div>
                
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="hero" size="icon" className="rounded-full w-12 h-12">
                    <Play className="w-6 h-6" />
                  </Button>
                </div>
              </div>
              
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{video.category}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleStreamVideo(video)}>
                        <Radio className="w-4 h-4 mr-2" />
                        Stream Video
                      </DropdownMenuItem>
                      {video.is_published ? (
                        <DropdownMenuItem onClick={() => handlePublish(video.id, false)}>
                          <XCircle className="w-4 h-4 mr-2" />
                          Unpublish
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handlePublish(video.id, true)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Publish
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDelete(video.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatNumber(video.view_count)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(video.created_at)}
                  </div>
                </div>
                
                {/* Status */}
                <div className="mt-3">
                  {video.is_published ? (
                    <Badge className="bg-success/10 text-success border-success/20">Published</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="stream-card p-12 text-center">
          <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No videos yet</h3>
          <p className="text-muted-foreground mb-6">Upload your first video to get started</p>
          <Button variant="hero" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="w-4 h-4" />
            Add Video
          </Button>
        </div>
      )}
    </div>
  );
}
