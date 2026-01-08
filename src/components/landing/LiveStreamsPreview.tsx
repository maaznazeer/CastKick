import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Clock, Eye, Loader2 } from 'lucide-react';
import { useStreams } from '@/hooks/useStreams';
import { Button } from '@/components/ui/button';

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

function formatScheduledTime(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  if (hours > 0) {
    return `In ${hours}h ${minutes}m`;
  }
  return `In ${minutes}m`;
}

export function LiveStreamsPreview() {
  const { liveStreams: allLive, scheduledStreams: allScheduled, isLoading } = useStreams();
  const liveStreams = allLive.slice(0, 3);
  const scheduledStreams = allScheduled.slice(0, 2);

  return (
    <section className="py-24 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Live Streams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="badge-live live-pulse">
              <span className="w-2 h-2 bg-primary-foreground rounded-full" />
              LIVE NOW
            </div>
            <span className="text-muted-foreground">{liveStreams.length} streams broadcasting</span>
          </div>
          <Link to="/live">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </motion.div>

        {/* Live stream cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {liveStreams.map((stream, index) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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
                    <div className="absolute top-3 left-3">
                      <span className="badge-live live-pulse text-xs">
                        <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                        LIVE
                      </span>
                    </div>
                    
                    {/* Duration */}
                    {stream.startedAt && (
                      <div className="absolute top-3 right-3 glass rounded px-2 py-1 text-xs font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(stream.startedAt)}
                      </div>
                    )}
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-glow">
                        <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
                      </div>
                    </div>
                    
                    {/* Bottom info */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="glass rounded px-2 py-1 text-xs">
                        {stream.category}
                      </span>
                      <span className="glass rounded px-2 py-1 text-xs flex items-center gap-1">
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
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {stream.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {stream.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Upcoming Streams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="badge-scheduled">
              <Clock className="w-3 h-3" />
              UPCOMING
            </span>
            <span className="text-muted-foreground">{scheduledStreams.length} scheduled</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {scheduledStreams.map((stream, index) => (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="stream-card flex gap-4 p-4 group cursor-pointer">
                {/* Thumbnail */}
                <div className="relative w-40 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-background/30" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-warning">
                      {stream.scheduledAt && formatScheduledTime(stream.scheduledAt)}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{stream.category}</span>
                  </div>
                  <h3 className="font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                    {stream.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {stream.description}
                  </p>
                </div>
                
                {/* Remind button */}
                <div className="flex items-center">
                  <Button variant="outline" size="sm">
                    Remind Me
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
