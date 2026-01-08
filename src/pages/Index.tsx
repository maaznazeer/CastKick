import { motion } from 'framer-motion';
import { HeroSection, FeaturesSection, TestimonialsSection } from '@/components/landing/HeroSection';
import { LiveStreamsPreview } from '@/components/landing/LiveStreamsPreview';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Trophy, Shield, Clock } from 'lucide-react';

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <LiveStreamsPreview />
      <FeaturesSection />
      <TestimonialsSection />
      
      {/* Why Choose Us Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full glass text-sm">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span className="text-muted-foreground">Why CastKick Live</span>
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
                The Future of <span className="text-gradient-primary">Sports Streaming</span> with CastKick Live
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                We're not just another streaming platform. We're building the most immersive sports viewing experience ever created. 
                From cutting-edge technology to passionate community, everything is designed for true sports fans.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Shield, title: 'Enterprise-Grade Security', desc: 'Your data and streams are protected with bank-level encryption.' },
                  { icon: Clock, title: '24/7 Live Coverage', desc: 'Never miss a moment with round-the-clock sports coverage.' },
                  { icon: Trophy, title: 'Premium Content', desc: 'Exclusive access to premium sports events and analysis.' },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Decorative cards */}
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-64 h-64 bg-primary/10 rounded-3xl blur-3xl" />
                <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-accent/10 rounded-3xl blur-3xl" />
                
                <div className="relative grid grid-cols-2 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="stream-card p-6 col-span-2"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="badge-live live-pulse text-xs">LIVE</div>
                      <span className="text-sm text-muted-foreground">Champions League Final</span>
                    </div>
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Play className="w-16 h-16 text-primary/50" />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-semibold">Real Madrid vs Barcelona</span>
                      <span className="text-xs text-muted-foreground">125K watching</span>
                    </div>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} className="stream-card p-4">
                    <div className="text-xs text-muted-foreground mb-2">Next Up</div>
                    <div className="font-semibold text-sm">F1 Monaco GP</div>
                    <div className="text-xs text-primary mt-1">In 2 hours</div>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} className="stream-card p-4">
                    <div className="text-xs text-muted-foreground mb-2">Trending</div>
                    <div className="font-semibold text-sm">UFC 300</div>
                    <div className="text-xs text-accent mt-1">45K watching</div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-neon-purple/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <span className="text-6xl">🏆</span>
            </motion.div>
            
            <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Ready to <span className="text-gradient-primary">Experience</span> Sports{' '}
              <span className="text-gradient-accent">Differently?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of sports fans watching live streams, engaging with expert analysis,
              and never missing a moment of the action.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/live">
                <Button variant="hero" size="xl" className="group">
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Start Watching
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="glass" size="xl">
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • Free forever plan available
            </p>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
