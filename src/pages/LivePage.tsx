import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Clock, Eye, Search, Radio, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useStreams } from '@/hooks/useStreams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Stream } from '@/types';

function formatViewers(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function formatDuration(startedAt: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const categories = ['All', 'Football', 'Basketball', 'MMA', 'Motorsport', 'Tennis', 'Cricket'];

function StreamCard({ stream, index }: { stream: Stream; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link to={`/streams/${stream.id}`}>
        <div className="stream-card group cursor-pointer">
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden">
            <img
              src={stream.thumbnail || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800'}
              alt={stream.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            
            {/* Live badge */}
            {stream.status === 'LIVE' && (
              <div className="absolute top-3 left-3">
                <span className="badge-live live-pulse text-xs">
                  <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                  LIVE
                </span>
              </div>
            )}
            
            {/* Duration */}
            {stream.startedAt && stream.status === 'LIVE' && (
              <div className="absolute top-3 right-3 glass rounded-lg px-2 py-1 text-xs font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(stream.startedAt)}
              </div>
            )}
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-glow backdrop-blur-sm"
              >
                <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
              </motion.div>
            </div>
            
            {/* Bottom info */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <span className="glass rounded-lg px-2.5 py-1 text-xs font-medium">
                {stream.category}
              </span>
              <span className="glass rounded-lg px-2.5 py-1 text-xs flex items-center gap-1.5 font-medium">
                <Eye className="w-3 h-3 text-live" />
                {formatViewers(stream.viewerCount)}
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {stream.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {stream.description || 'Watch live sports action with real-time commentary and analysis.'}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {stream.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground hover:bg-primary/20 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function LivePage() {
  const { streams, liveStreams, isLoading } = useStreams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const filteredStreams = liveStreams.filter((stream) => {
    const matchesSearch = stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stream.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || stream.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.3),transparent_50%)]" />
          <div className="relative z-10 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="badge-live live-pulse">
                <Radio className="w-3 h-3" />
                LIVE NOW
              </div>
              <span className="text-muted-foreground text-sm">{liveStreams.length} streams broadcasting</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Live <span className="text-gradient-primary">Streams</span>
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Watch your favorite sports events in real-time with ultra-low latency streaming. 
              Never miss a moment of the action.
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search streams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-secondary border-border"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading streams...</p>
          </div>
        ) : filteredStreams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStreams.map((stream, index) => (
              <StreamCard key={stream.id} stream={stream} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <Radio className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No live streams found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {searchQuery || selectedCategory !== 'All' 
                ? 'Try adjusting your filters or search query to find more streams'
                : 'Check back soon for upcoming broadcasts. New streams go live every day!'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                Clear Filters
              </Button>
              <Button variant="default" asChild>
                <Link to="/videos">Browse Videos</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
