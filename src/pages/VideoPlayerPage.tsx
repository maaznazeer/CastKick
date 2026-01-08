import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  ThumbsUp,
  Share2,
  Clock,
  Eye,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatViews(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
  return `${count} views`;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export default function VideoPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [video, setVideo] = useState<VideoItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchVideo();
    }
  }, [id]);

  // Increment view count after video loads
  useEffect(() => {
    if (video && id) {
      incrementViewCount();
    }
  }, [video?.id]);

  const fetchVideo = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      setVideo(data);
    } catch (err) {
      console.error('Error fetching video:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementViewCount = async () => {
    if (!id || !video) return;
    try {
      // Increment view count directly
      await supabase
        .from('videos')
        .update({ view_count: (video.view_count || 0) + 1 })
        .eq('id', id);
    } catch (err) {
      // Silent fail for view count
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleLike = async () => {
    if (hasLiked) return;
    
    setHasLiked(true);
    try {
      const newLikeCount = (video?.like_count || 0) + 1;
      await supabase
        .from('videos')
        .update({ like_count: newLikeCount })
        .eq('id', id);
      
      setVideo(prev => prev ? { ...prev, like_count: newLikeCount } : null);
      toast({
        title: 'Liked!',
        description: 'Thanks for your feedback',
      });
    } catch (err) {
      setHasLiked(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: 'Link Copied',
      description: 'Video link copied to clipboard',
    });
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!video) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Video not found</h1>
            <p className="text-muted-foreground mb-6">
              This video may have been removed or is not available.
            </p>
            <Button onClick={() => navigate('/videos')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Videos
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" onClick={() => navigate('/videos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Videos
          </Button>
        </motion.div>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative aspect-video bg-black rounded-xl overflow-hidden mb-6"
        >
          <video
            ref={videoRef}
            src={video.video_url}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={handlePlayPause}
          />
          
          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 mb-3 accent-primary cursor-pointer"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleMute}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                
                <span className="text-white text-sm font-mono">
                  {formatDuration(currentTime)} / {formatDuration(duration)}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleFullscreen}
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Video Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="secondary">{video.category}</Badge>
            {video.tags?.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{video.title}</h1>
          
          <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-6">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {formatViews(video.view_count)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatDate(video.published_at || video.created_at)}
            </span>
          </div>
          
          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <Button
              variant={hasLiked ? 'default' : 'secondary'}
              onClick={handleLike}
              disabled={hasLiked}
            >
              <ThumbsUp className={`w-4 h-4 mr-2 ${hasLiked ? 'fill-current' : ''}`} />
              {video.like_count} Likes
            </Button>
            <Button variant="secondary" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          
          {/* Description */}
          {video.description && (
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-foreground whitespace-pre-wrap">{video.description}</p>
            </div>
          )}
        </motion.div>
      </div>
    </MainLayout>
  );
}