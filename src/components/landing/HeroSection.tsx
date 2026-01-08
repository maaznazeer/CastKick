import { motion } from 'framer-motion';
import { Play, Users, Zap, Shield, MonitorPlay, Share2, Trophy, Flame, TrendingUp, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Zap,
    title: 'Ultra-Low Latency',
    description: 'Experience real-time sports action with sub-second streaming delay.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Share2,
    title: 'Screen Sharing',
    description: 'Co-hosts can share screens for live analysis and stats overlays.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MonitorPlay,
    title: 'Multi-View',
    description: 'Watch multiple camera angles and participant feeds simultaneously.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    title: 'Live Interaction',
    description: 'Chat, react, and engage with hosts and other viewers in real-time.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Shield,
    title: 'HD Quality',
    description: 'Crystal clear broadcasts up to 4K with adaptive bitrate streaming.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Play,
    title: 'VOD Library',
    description: 'Never miss a moment with automatic recording and video on demand.',
    color: 'from-red-500 to-rose-500',
  },
];

const stats = [
  { value: '50K+', label: 'Daily Viewers', icon: Users },
  { value: '500+', label: 'Live Events', icon: Trophy },
  { value: '99.9%', label: 'Uptime', icon: TrendingUp },
  { value: '<1s', label: 'Latency', icon: Zap },
];

const sports = [
  { name: 'Football', emoji: '⚽' },
  { name: 'Basketball', emoji: '🏀' },
  { name: 'MMA', emoji: '🥊' },
  { name: 'Formula 1', emoji: '🏎️' },
  { name: 'Tennis', emoji: '🎾' },
  { name: 'Cricket', emoji: '🏏' },
];

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(280_100%_65%/0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(166_100%_50%/0.05),transparent_50%)]" />
      
      {/* Animated grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-purple/20 rounded-full blur-[100px]"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-64 h-64 bg-accent/10 rounded-full blur-[80px]"
        animate={{
          x: [0, 30, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 mb-8"
          >
            <span className="badge-live live-pulse">
              <span className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
              Live Now
            </span>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Globe className="w-4 h-4" />
              <span>Streaming worldwide</span>
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight"
          >
            <span className="text-gradient-primary">CASTKICK</span>
            <br />
            <span className="text-foreground">STREAM</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          >
            Experience sports like never before with ultra-low latency streaming,
            real-time stats, and interactive co-hosting.
          </motion.p>

          {/* Sports tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {sports.map((sport, index) => (
              <motion.span
                key={sport.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium hover:bg-white/10 transition-colors cursor-default"
              >
                <span>{sport.emoji}</span>
                <span>{sport.name}</span>
              </motion.span>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link to="/live">
              <Button variant="hero" size="xl" className="group">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Live
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button variant="glass" size="xl">
                Get Started Free
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="glass rounded-xl p-4 text-center group hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <div className="font-display text-2xl md:text-3xl font-bold text-gradient-accent">
                    {stat.value}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full glass text-sm">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-muted-foreground">Powerful Features</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Broadcast-Grade <span className="text-gradient-primary">Features</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need for professional sports streaming, built for the modern audience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="stream-card p-6 group relative overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${feature.color}`} />
              
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "CastKick Live completely changed how I watch football. The low latency means I'm never behind my friends at the stadium!",
      author: "Marcus T.",
      role: "Football Fan",
      avatar: "MT",
    },
    {
      quote: "As a content creator, the CastKick Live streaming tools are incredible. Multi-camera support and real-time chat make my broadcasts so engaging.",
      author: "Sarah K.",
      role: "Sports Analyst",
      avatar: "SK",
    },
    {
      quote: "The CastKick Live video quality is unmatched. 4K streams with no buffering? That's what I call premium sports viewing.",
      author: "James L.",
      role: "Premium Member",
      avatar: "JL",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full glass text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">What Our Users Say</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Loved by <span className="text-gradient-accent">Sports Fans</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="stream-card p-6"
            >
              <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
