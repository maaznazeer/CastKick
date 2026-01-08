import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Play,
  Radio,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AnalyticsData {
  totalViews: number;
  totalStreams: number;
  totalVideos: number;
  avgWatchTime: number;
  viewsTrend: number;
  streamsTrend: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function AdminAnalyticsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalStreams: 0,
    totalVideos: 0,
    avgWatchTime: 0,
    viewsTrend: 0,
    streamsTrend: 0,
  });
  
  const [viewsData, setViewsData] = useState<{ name: string; views: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch streams count
      const { data: streams, error: streamsError } = await supabase
        .from('streams')
        .select('id, viewer_count, category, created_at');
      
      if (streamsError) throw streamsError;

      // Fetch videos count
      const { data: videos, error: videosError } = await supabase
        .from('videos')
        .select('id, view_count, category');
      
      if (videosError) throw videosError;

      // Calculate totals
      const totalViews = (streams || []).reduce((acc, s) => acc + s.viewer_count, 0) +
        (videos || []).reduce((acc, v) => acc + v.view_count, 0);
      
      setAnalytics({
        totalViews,
        totalStreams: streams?.length || 0,
        totalVideos: videos?.length || 0,
        avgWatchTime: 42, // Mock data
        viewsTrend: 15,
        streamsTrend: 8,
      });

      // Generate mock views data for chart
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const mockViewsData = Array.from({ length: days }, (_, i) => ({
        name: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        views: Math.floor(Math.random() * 1000) + 500,
      }));
      setViewsData(mockViewsData);

      // Calculate category distribution
      const categoryCount: { [key: string]: number } = {};
      [...(streams || []), ...(videos || [])].forEach(item => {
        const cat = item.category || 'General';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      
      setCategoryData(
        Object.entries(categoryCount).map(([name, value]) => ({ name, value }))
      );

    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch analytics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Views',
      value: formatNumber(analytics.totalViews),
      icon: Eye,
      trend: analytics.viewsTrend,
      trendUp: true,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Total Streams',
      value: analytics.totalStreams.toString(),
      icon: Radio,
      trend: analytics.streamsTrend,
      trendUp: true,
      color: 'text-live',
      bgColor: 'bg-live/10',
    },
    {
      label: 'Total Videos',
      value: analytics.totalVideos.toString(),
      icon: Play,
      trend: 5,
      trendUp: true,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Avg Watch Time',
      value: `${analytics.avgWatchTime}m`,
      icon: Clock,
      trend: 3,
      trendUp: true,
      color: 'text-neon-purple',
      bgColor: 'bg-neon-purple/10',
    },
  ];

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
          <h1 className="text-2xl font-bold mb-1">Analytics</h1>
          <p className="text-muted-foreground">Track your streaming performance</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-32">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
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
              <div className={`flex items-center gap-1 text-xs ${stat.trendUp ? 'text-success' : 'text-destructive'}`}>
                {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}%
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Views Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="stream-card p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Views Over Time
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="stream-card p-6"
        >
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            By Category
          </h2>
          <div className="h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Top Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="stream-card p-6 mt-6"
      >
        <h2 className="text-lg font-semibold mb-6">Top Performing Content</h2>
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Analytics data will populate as you create more content</p>
        </div>
      </motion.div>
    </div>
  );
}
