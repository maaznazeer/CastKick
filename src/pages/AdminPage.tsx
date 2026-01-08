import { useState } from 'react';
import { Link, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Radio,
  Video,
  Users,
  Settings,
  BarChart3,
  Play,
  Plus,
  Eye,
  Clock,
  TrendingUp,
  Activity,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStreams } from '@/hooks/useStreams';
import { useToast } from '@/hooks/use-toast';
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
import AdminStreamsPage from './admin/AdminStreamsPage';
import AdminVideosPage from './admin/AdminVideosPage';
import AdminAnalyticsPage from './admin/AdminAnalyticsPage';
import AdminSettingsPage from './admin/AdminSettingsPage';
import AdminUsersPage from './admin/AdminUsersPage';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/streams', label: 'Streams', icon: Radio },
  { href: '/admin/videos', label: 'Videos', icon: Video },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const categories = ['Football', 'Basketball', 'MMA', 'Motorsport', 'Tennis', 'Cricket', 'General'];

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function AdminSidebar() {
  const location = useLocation();
  
  return (
    <aside className="w-64 border-r border-border bg-card/50 flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
          </div>
          <div>
            <span className="font-display font-bold text-lg block">
              PRO<span className="text-gradient-primary">SPORTS</span>
            </span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.href || 
            (link.href !== '/admin' && location.pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              to={link.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }
              `}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Link to="/live">
          <Button variant="outline" className="w-full">
            <Radio className="w-4 h-4" />
            View Live Site
          </Button>
        </Link>
      </div>
    </aside>
  );
}

function CreateStreamDialog({ onStreamCreated }: { onStreamCreated: () => void }) {
  const navigate = useNavigate();
  const { createStream, startStream } = useStreams();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
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
          description: 'Redirecting to broadcast...',
        });
        navigate(`/admin/broadcast/${stream.id}`);
      } else {
        toast({
          title: 'Stream Created',
          description: 'Stream saved as draft',
        });
      }

      setOpen(false);
      setFormData({ title: '', description: '', category: 'Football', tags: '' });
      onStreamCreated();
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero">
          <Plus className="w-4 h-4" />
          Start New Stream
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
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuthContext();
  const { liveStreams, streams, fetchStreams, isLoading } = useStreams();
  const totalViewers = liveStreams.reduce((acc, s) => acc + s.viewerCount, 0);

  const stats = [
    { 
      label: 'Live Streams', 
      value: liveStreams.length, 
      icon: Radio, 
      trend: '+2 today',
      color: 'text-live',
      bgColor: 'bg-live/10',
    },
    { 
      label: 'Total Viewers', 
      value: formatNumber(totalViewers), 
      icon: Eye, 
      trend: '+15% vs yesterday',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    { 
      label: 'Total Streams', 
      value: streams.length.toString(), 
      icon: Video, 
      trend: 'All time',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    { 
      label: 'Avg Watch Time', 
      value: '42m', 
      icon: Clock, 
      trend: '+8% vs last week',
      color: 'text-neon-purple',
      bgColor: 'bg-neon-purple/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.name || 'Admin'}</p>
        </div>
        <CreateStreamDialog onStreamCreated={fetchStreams} />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stream-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs text-success">
                <TrendingUp className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stream-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-live" />
              Active Streams
            </h2>
            <Link to="/admin/streams">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          {liveStreams.length > 0 ? (
            <div className="space-y-4">
              {liveStreams.slice(0, 4).map((stream) => (
                <div 
                  key={stream.id} 
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary/70 transition-colors"
                  onClick={() => navigate(`/admin/broadcast/${stream.id}`)}
                >
                  <div className="relative w-16 h-10 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={stream.thumbnail || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=200'} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-1 left-1">
                      <span className="badge-live text-[8px] px-1.5 py-0.5">LIVE</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{stream.title}</p>
                    <p className="text-xs text-muted-foreground">{stream.category}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Eye className="w-3 h-3 text-live" />
                    {formatNumber(stream.viewerCount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Radio className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No active streams</p>
              <p className="text-sm">Create a new stream to get started</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="stream-card p-6"
        >
          <h2 className="text-lg font-semibold mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="secondary" 
              className="h-auto py-6 flex-col gap-2"
              onClick={() => navigate('/admin/streams')}
            >
              <Radio className="w-6 h-6" />
              <span>Manage Streams</span>
            </Button>
            <Button 
              variant="secondary" 
              className="h-auto py-6 flex-col gap-2"
              onClick={() => navigate('/admin/videos')}
            >
              <Video className="w-6 h-6" />
              <span>Upload Video</span>
            </Button>
            <Button variant="secondary" className="h-auto py-6 flex-col gap-2">
              <Users className="w-6 h-6" />
              <span>Manage Users</span>
            </Button>
            <Button variant="secondary" className="h-auto py-6 flex-col gap-2">
              <BarChart3 className="w-6 h-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, hasRole } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !hasRole('admin')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need admin privileges to access this page.</p>
          <Button onClick={() => navigate('/auth')}>Sign In as Admin</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/streams" element={<AdminStreamsPage />} />
          <Route path="/videos" element={<AdminVideosPage />} />
          <Route path="/users" element={<AdminUsersPage />} />
          <Route path="/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/settings" element={<AdminSettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}