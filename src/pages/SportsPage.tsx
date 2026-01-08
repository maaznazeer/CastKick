import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Loader2, 
  RefreshCw,
  Activity,
  Users,
  MapPin,
  Star
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface Sport {
  id?: number;
  name?: string;
  slug?: string;
  title?: string;
  icon?: string;
  image?: string;
  description?: string;
  [key: string]: any; // Allow additional fields from API
}

interface SportsEvent {
  idEvent?: string;
  id?: string;
  strEvent?: string;
  event?: string;
  strLeague?: string;
  league?: string;
  strSport?: string;
  sport?: string;
  strHomeTeam?: string;
  homeTeam?: string;
  strAwayTeam?: string;
  awayTeam?: string;
  intHomeScore?: string | number | null;
  homeScore?: string | number | null;
  intAwayScore?: string | number | null;
  awayScore?: string | number | null;
  strThumb?: string | null;
  thumb?: string | null;
  image?: string | null;
  strVenue?: string | null;
  venue?: string | null;
  dateEvent?: string;
  date?: string;
  strTime?: string;
  time?: string;
  strStatus?: string | null;
  status?: string | null;
  strTimestamp?: string | null;
  timestamp?: string | null;
  [key: string]: any; // Allow additional fields from API
}

interface LeagueInfo {
  idLeague?: string;
  id?: string;
  strLeague?: string;
  league?: string;
  name?: string;
  strSport?: string;
  sport?: string;
  strCountry?: string;
  country?: string;
  strBadge?: string | null;
  badge?: string | null;
  logo?: string | null;
  [key: string]: any; // Allow additional fields from API
}

function EventCard({ event, index }: { event: SportsEvent; index: number }) {
  // Normalize event data to handle different API response formats
  const eventName = event.strEvent || event.event || 'Event';
  const league = event.strLeague || event.league || '';
  const sport = event.strSport || event.sport || '';
  const homeTeam = event.strHomeTeam || event.homeTeam || '';
  const awayTeam = event.strAwayTeam || event.awayTeam || '';
  const homeScore = event.intHomeScore ?? event.homeScore ?? null;
  const awayScore = event.intAwayScore ?? event.awayScore ?? null;
  const thumb = event.strThumb || event.thumb || event.image || null;
  const venue = event.strVenue || event.venue || '';
  const dateEvent = event.dateEvent || event.date || '';
  const time = event.strTime || event.time || '';
  const status = event.strStatus || event.status || '';
  
  const isLive = status?.toLowerCase().includes('live') || 
                 status?.toLowerCase().includes('progress') ||
                 status?.toLowerCase().includes('playing');
  const hasScore = homeScore !== null && awayScore !== null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-all group"
    >
      {thumb && (
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={thumb} 
            alt={eventName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {isLive && (
            <div className="absolute top-3 left-3">
              <Badge variant="destructive" className="animate-pulse">
                <Activity className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            </div>
          )}
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {sport && (
            <Badge variant="secondary" className="text-xs">
              {sport}
            </Badge>
          )}
          {league && (
            <span className="text-xs text-muted-foreground">{league}</span>
          )}
          {status && !isLive && (
            <Badge variant="outline" className="text-xs">
              {status}
            </Badge>
          )}
        </div>
        
        <h3 className="font-semibold mb-3 line-clamp-2">{eventName}</h3>
        
        {/* Score display */}
        <div className="flex items-center justify-between bg-secondary/50 rounded-lg p-3 mb-3">
          <div className="text-center flex-1">
            <p className="font-medium text-sm truncate">{homeTeam || 'Home'}</p>
            {hasScore && (
              <p className="text-2xl font-bold text-primary mt-1">{homeScore}</p>
            )}
          </div>
          
          <div className="px-4 text-muted-foreground text-sm font-medium">VS</div>
          
          <div className="text-center flex-1">
            <p className="font-medium text-sm truncate">{awayTeam || 'Away'}</p>
            {hasScore && (
              <p className="text-2xl font-bold text-primary mt-1">{awayScore}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          {dateEvent && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(dateEvent).toLocaleDateString()}
            </div>
          )}
          {time && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {time}
            </div>
          )}
          {venue && (
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{venue}</span>
            </div>
          )}
        </div>
        
        {/* Show additional fields if available */}
        {Object.keys(event).filter(key => 
          !['idEvent', 'id', 'strEvent', 'event', 'strLeague', 'league', 'strSport', 'sport', 
            'strHomeTeam', 'homeTeam', 'strAwayTeam', 'awayTeam', 'intHomeScore', 'homeScore',
            'intAwayScore', 'awayScore', 'strThumb', 'thumb', 'image', 'strVenue', 'venue',
            'dateEvent', 'date', 'strTime', 'time', 'strStatus', 'status', 'strTimestamp', 'timestamp'].includes(key)
        ).length > 0 && (
          <details className="mt-3 pt-3 border-t border-border">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
              Show all data ({Object.keys(event).filter(key => 
                !['idEvent', 'id', 'strEvent', 'event', 'strLeague', 'league', 'strSport', 'sport', 
                  'strHomeTeam', 'homeTeam', 'strAwayTeam', 'awayTeam', 'intHomeScore', 'homeScore',
                  'intAwayScore', 'awayScore', 'strThumb', 'thumb', 'image', 'strVenue', 'venue',
                  'dateEvent', 'date', 'strTime', 'time', 'strStatus', 'status', 'strTimestamp', 'timestamp'].includes(key)
              ).length} fields)
            </summary>
            <pre className="text-xs mt-2 p-2 bg-secondary/50 rounded overflow-auto max-h-40">
              {JSON.stringify(
                Object.fromEntries(
                  Object.entries(event).filter(([key]) => 
                    !['idEvent', 'id', 'strEvent', 'event', 'strLeague', 'league', 'strSport', 'sport', 
                      'strHomeTeam', 'homeTeam', 'strAwayTeam', 'awayTeam', 'intHomeScore', 'homeScore',
                      'intAwayScore', 'awayScore', 'strThumb', 'thumb', 'image', 'strVenue', 'venue',
                      'dateEvent', 'date', 'strTime', 'time', 'strStatus', 'status', 'strTimestamp', 'timestamp'].includes(key)
                  )
                ),
                null,
                2
              )}
            </pre>
          </details>
        )}
      </div>
    </motion.div>
  );
}

function LeagueCard({ league, index }: { league: LeagueInfo; index: number }) {
  // Normalize league data to handle different API response formats
  const leagueName = league.strLeague || league.league || league.name || 'League';
  const sport = league.strSport || league.sport || '';
  const country = league.strCountry || league.country || '';
  const badge = league.strBadge || league.badge || league.logo || null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all"
    >
      <div className="flex items-center gap-4 mb-3">
        {badge ? (
          <img 
            src={badge} 
            alt={leagueName}
            className="w-12 h-12 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        {!badge && (
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{leagueName}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap mt-1">
            {sport && (
              <Badge variant="outline" className="text-xs">{sport}</Badge>
            )}
            {country && (
              <span className="text-xs">{country}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Show additional fields if available */}
      {Object.keys(league).filter(key => 
        !['idLeague', 'id', 'strLeague', 'league', 'name', 'strSport', 'sport', 
          'strCountry', 'country', 'strBadge', 'badge', 'logo'].includes(key)
      ).length > 0 && (
        <details className="mt-3 pt-3 border-t border-border">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
            Show all data ({Object.keys(league).filter(key => 
              !['idLeague', 'id', 'strLeague', 'league', 'name', 'strSport', 'sport', 
                'strCountry', 'country', 'strBadge', 'badge', 'logo'].includes(key)
            ).length} fields)
          </summary>
          <pre className="text-xs mt-2 p-2 bg-secondary/50 rounded overflow-auto max-h-40">
            {JSON.stringify(
              Object.fromEntries(
                Object.entries(league).filter(([key]) => 
                  !['idLeague', 'id', 'strLeague', 'league', 'name', 'strSport', 'sport', 
                    'strCountry', 'country', 'strBadge', 'badge', 'logo'].includes(key)
                )
              ),
              null,
              2
            )}
          </pre>
        </details>
      )}
    </motion.div>
  );
}

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [recentEvents, setRecentEvents] = useState<SportsEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<SportsEvent[]>([]);
  const [leagues, setLeagues] = useState<LeagueInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sports');
  const { toast } = useToast();

  const fetchSportsData = async () => {
    setIsLoading(true);
    try {
      const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sports-api`;
      
      // Fetch all data in parallel
      const [sportsResponse, recentResponse, upcomingResponse, leaguesResponse] = await Promise.all([
        // Fetch list of sports
        fetch(`${baseUrl}?path=/api/flashscore/sports`, {
          headers: { 'Content-Type': 'application/json' },
        }),
        // Fetch recent events/results
        fetch(`${baseUrl}?path=/api/flashscore/events/recent`, {
          headers: { 'Content-Type': 'application/json' },
        }),
        // Fetch upcoming events
        fetch(`${baseUrl}?path=/api/flashscore/events/upcoming`, {
          headers: { 'Content-Type': 'application/json' },
        }),
        // Fetch leagues
        fetch(`${baseUrl}?path=/api/flashscore/leagues`, {
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);

      // Process sports data
      if (sportsResponse.ok) {
        const sportsData = await sportsResponse.json();
        console.log('Sports data:', sportsData);
        if (Array.isArray(sportsData)) {
          setSports(sportsData);
        } else if (sportsData?.data) {
          setSports(Array.isArray(sportsData.data) ? sportsData.data : []);
        } else if (sportsData?.sports) {
          setSports(Array.isArray(sportsData.sports) ? sportsData.sports : []);
        } else if (sportsData?.results) {
          setSports(Array.isArray(sportsData.results) ? sportsData.results : []);
        }
      } else {
        console.error('Failed to fetch sports:', sportsResponse.status);
      }

      // Process recent events
      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        console.log('Recent events data:', recentData);
        if (Array.isArray(recentData)) {
          setRecentEvents(recentData);
        } else if (recentData?.data) {
          setRecentEvents(Array.isArray(recentData.data) ? recentData.data : []);
        } else if (recentData?.events) {
          setRecentEvents(Array.isArray(recentData.events) ? recentData.events : []);
        } else if (recentData?.results) {
          setRecentEvents(Array.isArray(recentData.results) ? recentData.results : []);
        }
      } else {
        console.warn('Failed to fetch recent events:', recentResponse.status);
        // Try alternative endpoint
        try {
          const altResponse = await fetch(`${baseUrl}?path=/api/flashscore/results`, {
            headers: { 'Content-Type': 'application/json' },
          });
          if (altResponse.ok) {
            const altData = await altResponse.json();
            if (Array.isArray(altData)) {
              setRecentEvents(altData);
            } else if (altData?.data) {
              setRecentEvents(Array.isArray(altData.data) ? altData.data : []);
            } else if (altData?.events) {
              setRecentEvents(Array.isArray(altData.events) ? altData.events : []);
            }
          }
        } catch (e) {
          console.warn('Alternative recent events endpoint also failed');
        }
      }

      // Process upcoming events
      if (upcomingResponse.ok) {
        const upcomingData = await upcomingResponse.json();
        console.log('Upcoming events data:', upcomingData);
        if (Array.isArray(upcomingData)) {
          setUpcomingEvents(upcomingData);
        } else if (upcomingData?.data) {
          setUpcomingEvents(Array.isArray(upcomingData.data) ? upcomingData.data : []);
        } else if (upcomingData?.events) {
          setUpcomingEvents(Array.isArray(upcomingData.events) ? upcomingData.events : []);
        } else if (upcomingData?.results) {
          setUpcomingEvents(Array.isArray(upcomingData.results) ? upcomingData.results : []);
        }
      } else {
        console.warn('Failed to fetch upcoming events:', upcomingResponse.status);
        // Try alternative endpoint
        try {
          const altResponse = await fetch(`${baseUrl}?path=/api/flashscore/fixtures`, {
            headers: { 'Content-Type': 'application/json' },
          });
          if (altResponse.ok) {
            const altData = await altResponse.json();
            if (Array.isArray(altData)) {
              setUpcomingEvents(altData);
            } else if (altData?.data) {
              setUpcomingEvents(Array.isArray(altData.data) ? altData.data : []);
            } else if (altData?.events) {
              setUpcomingEvents(Array.isArray(altData.events) ? altData.events : []);
            }
          }
        } catch (e) {
          console.warn('Alternative upcoming events endpoint also failed');
        }
      }

      // Process leagues
      if (leaguesResponse.ok) {
        const leaguesData = await leaguesResponse.json();
        console.log('Leagues data:', leaguesData);
        if (Array.isArray(leaguesData)) {
          setLeagues(leaguesData);
        } else if (leaguesData?.data) {
          setLeagues(Array.isArray(leaguesData.data) ? leaguesData.data : []);
        } else if (leaguesData?.leagues) {
          setLeagues(Array.isArray(leaguesData.leagues) ? leaguesData.leagues : []);
        } else if (leaguesData?.results) {
          setLeagues(Array.isArray(leaguesData.results) ? leaguesData.results : []);
        }
      } else {
        console.warn('Failed to fetch leagues:', leaguesResponse.status);
        // Try alternative endpoint
        try {
          const altResponse = await fetch(`${baseUrl}?path=/api/flashscore/competitions`, {
            headers: { 'Content-Type': 'application/json' },
          });
          if (altResponse.ok) {
            const altData = await altResponse.json();
            if (Array.isArray(altData)) {
              setLeagues(altData);
            } else if (altData?.data) {
              setLeagues(Array.isArray(altData.data) ? altData.data : []);
            } else if (altData?.leagues) {
              setLeagues(Array.isArray(altData.leagues) ? altData.leagues : []);
            }
          }
        } catch (e) {
          console.warn('Alternative leagues endpoint also failed');
        }
      }

    } catch (error) {
      console.error('Error fetching sports data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sports data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSportsData();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-accent/20 via-primary/10 to-secondary/20"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--accent)/0.3),transparent_50%)]" />
          <div className="relative z-10 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-accent" />
              </div>
              <Badge variant="secondary">Sports Updates</Badge>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Sports <span className="text-gradient-primary">Center</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mb-6">
              Stay updated with live scores, recent results, and upcoming matches across all major sports leagues worldwide.
            </p>
            <Button 
              onClick={fetchSportsData} 
              disabled={isLoading}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="sports" className="gap-2">
              <Activity className="w-4 h-4" />
              Sports
            </TabsTrigger>
            <TabsTrigger value="recent" className="gap-2">
              <Clock className="w-4 h-4" />
              Recent Results
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="leagues" className="gap-2">
              <Trophy className="w-4 h-4" />
              Leagues
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading sports data...</p>
            </div>
          ) : (
            <>
              <TabsContent value="sports" className="mt-6">
                {sports.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {sports.map((sport, index) => {
                      const sportName = sport.name || sport.title || 'Unknown Sport';
                      const sportId = sport.id || sport.slug || index;
                      const sportIcon = sport.icon || sport.image;
                      
                      return (
                        <motion.div
                          key={sportId}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-all text-center cursor-pointer group"
                        >
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 overflow-hidden">
                            {sportIcon ? (
                              <img 
                                src={sportIcon} 
                                alt={sportName}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  // Replace with icon on error
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<svg class="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
                                  }
                                }}
                              />
                            ) : (
                              <Activity className="w-8 h-8 text-primary" />
                            )}
                          </div>
                          <h3 className="font-semibold text-lg mb-1">{sportName}</h3>
                          {sport.slug && sport.slug !== sportName && (
                            <p className="text-sm text-muted-foreground mb-2">{sport.slug}</p>
                          )}
                          {sport.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{sport.description}</p>
                          )}
                          {/* Display any additional data */}
                          {Object.keys(sport).filter(key => 
                            !['id', 'name', 'slug', 'title', 'icon', 'image', 'description'].includes(key)
                          ).length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs text-muted-foreground">
                                {Object.keys(sport).filter(key => 
                                  !['id', 'name', 'slug', 'title', 'icon', 'image', 'description'].includes(key)
                                ).length} more fields
                              </p>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Sports Found</h3>
                    <p className="text-muted-foreground">Unable to load sports data.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recent" className="mt-6">
                {recentEvents.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentEvents.map((event, index) => (
                      <EventCard key={event.idEvent} event={event} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Recent Events</h3>
                    <p className="text-muted-foreground">Check back later for sports updates.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="mt-6">
                {upcomingEvents.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEvents.map((event, index) => (
                      <EventCard key={event.idEvent} event={event} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Upcoming Events</h3>
                    <p className="text-muted-foreground">Check back later for scheduled matches.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="leagues" className="mt-6">
                {leagues.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {leagues.map((league, index) => (
                      <LeagueCard key={league.idLeague} league={league} index={index} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Star className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No Leagues Found</h3>
                    <p className="text-muted-foreground">Unable to load league information.</p>
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
}
