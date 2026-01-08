import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Radio,
  Play,
  Square,
  Trash2,
  Eye,
  Calendar,
  MoreVertical,
  Plus,
  Loader2,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const categories = ['Football', 'Basketball', 'MMA', 'Motorsport', 'Tennis', 'Cricket', 'General'];

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function AdminStreamsPage() {
  const navigate = useNavigate();
  const { streams, liveStreams, createStream, startStream, endStream, isLoading, fetchStreams } = useStreams();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Football',
    tags: '',
  });

  const handleCreate = async (goLive: boolean) => {
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a stream title',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const stream = await createStream({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      });

      if (goLive) {
        await startStream(stream.id);
        toast({
          title: 'Stream Started!',
          description: 'Redirecting to broadcaster...',
        });
        navigate(`/admin/broadcast/${stream.id}`);
      } else {
        toast({
          title: 'Stream Created',
          description: 'Stream saved as draft',
        });
        fetchStreams();
      }

      setCreateDialogOpen(false);
      setFormData({ title: '', description: '', category: 'Football', tags: '' });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create stream',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartStream = async (streamId: string) => {
    try {
      await startStream(streamId);
      toast({
        title: 'Stream Started',
        description: 'Redirecting to broadcaster...',
      });
      navigate(`/admin/broadcast/${streamId}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to start stream',
        variant: 'destructive',
      });
    }
  };

  const handleEndStream = async (streamId: string) => {
    try {
      await endStream(streamId);
      toast({
        title: 'Stream Ended',
        description: 'The stream has been ended',
      });
      fetchStreams();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to end stream',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE':
        return <Badge className="bg-live text-white">Live</Badge>;
      case 'SCHEDULED':
        return <Badge variant="outline" className="border-primary text-primary">Scheduled</Badge>;
      case 'ENDED':
        return <Badge variant="secondary">Ended</Badge>;
      case 'RECORDED':
        return <Badge variant="secondary">Recorded</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
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
          <h1 className="text-2xl font-bold mb-1">Streams</h1>
          <p className="text-muted-foreground">Manage your live streams</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="hero">
              <Plus className="w-4 h-4" />
              New Stream
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Stream</DialogTitle>
              <DialogDescription>
                Set up a new live stream for your viewers
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Stream Title</Label>
                <Input
                  id="title"
                  placeholder="Enter stream title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your stream..."
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
                  placeholder="e.g. Premier League, Manchester United"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="secondary" onClick={() => handleCreate(false)} disabled={isCreating}>
                Save Draft
              </Button>
              <Button variant="hero" onClick={() => handleCreate(true)} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4" />
                    Go Live
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Live Streams Section */}
      {liveStreams.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5 text-live animate-pulse" />
            Live Now ({liveStreams.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveStreams.map((stream, index) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="stream-card p-4 border-live/30"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={stream.thumbnail || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=200'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1">
                      <span className="badge-live text-[8px] px-1.5 py-0.5 live-pulse">LIVE</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{stream.title}</h3>
                    <p className="text-sm text-muted-foreground">{stream.category}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {formatNumber(stream.viewerCount)} viewers
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/admin/broadcast/${stream.id}`)}
                  >
                    <Video className="w-4 h-4" />
                    Broadcast
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleEndStream(stream.id)}
                  >
                    <Square className="w-4 h-4" />
                    End
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* All Streams */}
      <div>
        <h2 className="text-lg font-semibold mb-4">All Streams ({streams.length})</h2>
        <div className="stream-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium">Stream</th>
                  <th className="text-left p-4 text-sm font-medium">Category</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Viewers</th>
                  <th className="text-left p-4 text-sm font-medium">Created</th>
                  <th className="text-right p-4 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {streams.map((stream) => (
                  <tr key={stream.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={stream.thumbnail || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=200'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{stream.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {stream.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{stream.category}</td>
                    <td className="p-4">{getStatusBadge(stream.status)}</td>
                    <td className="p-4 text-sm">{formatNumber(stream.viewerCount)}</td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(stream.createdAt)}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {stream.status === 'LIVE' ? (
                            <>
                              <DropdownMenuItem onClick={() => navigate(`/admin/broadcast/${stream.id}`)}>
                                <Video className="w-4 h-4 mr-2" />
                                Go to Broadcast
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleEndStream(stream.id)}
                                className="text-destructive"
                              >
                                <Square className="w-4 h-4 mr-2" />
                                End Stream
                              </DropdownMenuItem>
                            </>
                          ) : stream.status === 'DRAFT' || stream.status === 'SCHEDULED' ? (
                            <>
                              <DropdownMenuItem onClick={() => handleStartStream(stream.id)}>
                                <Play className="w-4 h-4 mr-2" />
                                Go Live
                              </DropdownMenuItem>
                            </>
                          ) : null}
                          <DropdownMenuItem onClick={() => navigate(`/streams/${stream.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Stream
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {streams.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Radio className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No streams yet</p>
              <p className="text-sm">Create your first stream to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
