import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  MessageSquare,
  Users,
  Settings,
  Maximize,
  Volume2,
  VolumeX,
  Eye,
  Clock,
  Heart,
  Share2,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { Room, RoomEvent, Track, RemoteTrack, RemoteTrackPublication, RemoteParticipant } from 'livekit-client';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/contexts/AuthContext';
import { useStreams } from '@/hooks/useStreams';
import { useLiveKit } from '@/hooks/useLiveKit';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useStreamChat } from '@/hooks/useStreamChat';
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

export default function StreamPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isAuthenticated, hasRole, isLoading: authLoading } = useAuthContext();
  const { getStreamById } = useStreams();
  const { getToken, isConnecting, error: tokenError } = useLiveKit();
  const { messages: chatMessages, sendMessage: sendChatMessage, isLoading: chatLoading } = useStreamChat(id || '');
  
  const [stream, setStream] = useState<Stream | null>(null);
  const [isLoadingStream, setIsLoadingStream] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isJoined, setIsJoined] = useState(false);
  const [hasRemoteVideo, setHasRemoteVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const roomRef = useRef<Room | null>(null);

  // Fetch stream data
  useEffect(() => {
    async function loadStream() {
      if (!id) return;
      setIsLoadingStream(true);
      const streamData = await getStreamById(id);
      setStream(streamData);
      setIsLoadingStream(false);
    }
    loadStream();
  }, [id, getStreamById]);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup room on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, []);

  const handleTrackSubscribed = useCallback(
    (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      console.log('Track subscribed:', track.kind, 'from', participant.identity);
      
      if (track.kind === Track.Kind.Video) {
        setHasRemoteVideo(true);
        if (remoteVideoRef.current) {
          track.attach(remoteVideoRef.current);
        }
      } else if (track.kind === Track.Kind.Audio) {
        if (remoteAudioRef.current) {
          track.attach(remoteAudioRef.current);
        }
      }
    },
    []
  );

  const handleTrackUnsubscribed = useCallback(
    (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      console.log('Track unsubscribed:', track.kind, 'from', participant.identity);
      track.detach();
      
      if (track.kind === Track.Kind.Video) {
        // Check if there are any other video tracks
        const room = roomRef.current;
        if (room) {
          let hasVideo = false;
          room.remoteParticipants.forEach((p) => {
            p.videoTrackPublications.forEach((pub) => {
              if (pub.isSubscribed) hasVideo = true;
            });
          });
          setHasRemoteVideo(hasVideo);
        }
      }
    },
    []
  );

  const handleJoinStream = async () => {
    if (!stream || !profile) {
      toast({
        title: 'Error',
        description: 'Please sign in to join the stream',
        variant: 'destructive',
      });
      return;
    }

    const isHost = hasRole('admin') && stream.hostId === profile.id;
    const canPublish = hasRole('member');

    const tokenData = await getToken({
      roomName: `stream-${stream.id}`,
      participantName: profile.name || profile.email,
      participantIdentity: profile.id,
      isHost,
      canPublish,
    });

    if (tokenData) {
      try {
        // Create and connect to the LiveKit room
        const room = new Room();
        roomRef.current = room;

        // Set up event listeners
        room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed);
        room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed);
        room.on(RoomEvent.Disconnected, () => {
          console.log('Disconnected from room');
          setIsJoined(false);
          setHasRemoteVideo(false);
        });

        // Connect to the room
        await room.connect(tokenData.url, tokenData.token);
        console.log('Connected to LiveKit room:', tokenData.roomName);

        // Attach any existing tracks from participants already in the room
        room.remoteParticipants.forEach((participant) => {
          participant.trackPublications.forEach((publication) => {
            if (publication.isSubscribed && publication.track) {
              handleTrackSubscribed(
                publication.track as RemoteTrack,
                publication as RemoteTrackPublication,
                participant
              );
            }
          });
        });

        setIsJoined(true);
        toast({
          title: 'Connected',
          description: 'You have joined the stream',
        });
      } catch (err) {
        console.error('Error connecting to LiveKit:', err);
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to the stream',
          variant: 'destructive',
        });
      }
    }
  };

  const handleLeaveStream = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    setIsJoined(false);
    setHasRemoteVideo(false);
  };

  if (isLoadingStream || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Stream not found</h1>
          <Button onClick={() => navigate('/live')}>Back to Live</Button>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const success = await sendChatMessage(newMessage);
    if (success) {
      setNewMessage('');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const canShareScreen = hasRole('member');
  const canShareCamera = hasRole('member');

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isChatOpen ? 'mr-80' : ''}`}>
          {/* Video Player */}
            <div className="flex-1 relative bg-black">
              {/* Video content - show actual video if stream has videoUrl */}
              {stream.videoUrl ? (
                <div className="absolute inset-0">
                  <video
                    ref={videoRef}
                    src={stream.videoUrl}
                    autoPlay
                    controls={false}
                    muted={isMuted}
                    className="w-full h-full object-contain"
                    onError={(e) => console.error('Video error:', e)}
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/40" />
                </div>
              ) : isJoined ? (
                /* LiveKit viewer: always render the media elements so late-joiners never miss the attach */
                <div className="absolute inset-0">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    muted={isMuted}
                    className="w-full h-full object-contain"
                  />
                  <audio ref={remoteAudioRef} autoPlay muted={isMuted} />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-black/40" />

                  {!hasRemoteVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mb-4 mx-auto border border-white/20">
                          <Loader2 className="w-12 h-12 text-white animate-spin" />
                        </div>
                        <p className="text-white/80 text-sm">Connected • Waiting for host to share video...</p>
                        <Button
                          variant="ghost"
                          className="mt-4 text-white/60 hover:text-white"
                          onClick={handleLeaveStream}
                        >
                          Leave Stream
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Video placeholder for non-video streams */
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={stream.thumbnail || 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800'}
                    alt={stream.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                  {/* Join stream button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center mb-4 mx-auto border border-white/20">
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                          <Video className="w-8 h-8 text-primary-foreground" />
                        </div>
                      </div>
                      {stream.status === 'LIVE' ? (
                        <>
                          <p className="text-white/80 text-sm mb-4">
                            {isAuthenticated ? 'Click to join the live stream' : 'Sign in to join the stream'}
                          </p>
                          <Button
                            onClick={handleJoinStream}
                            disabled={!isAuthenticated || isConnecting}
                            variant="hero"
                          >
                            {isConnecting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Connecting...
                              </>
                            ) : (
                              'Join Stream'
                            )}
                          </Button>
                        </>
                      ) : (
                        <p className="text-white/80 text-sm">Stream is {stream.status.toLowerCase()}</p>
                      )}
                      {tokenError && <p className="text-destructive text-sm mt-2">{tokenError}</p>}
                    </div>
                  </div>
                </div>
              )}

            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <Button variant="glass" size="icon-sm" onClick={() => navigate('/live')}>
                  <span className="sr-only">Back</span>
                  ←
                </Button>
                <div className="glass rounded-lg px-3 py-2 flex items-center gap-3">
                  {stream.status === 'LIVE' && (
                    <span className="badge-live live-pulse text-xs">
                      <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                      LIVE
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-sm">
                    <Eye className="w-4 h-4 text-live" />
                    {formatViewers(stream.viewerCount)}
                  </div>
                  {stream.startedAt && (
                    <div className="flex items-center gap-1 text-sm font-mono">
                      <Clock className="w-4 h-4" />
                      {formatDuration(stream.startedAt)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="glass" size="icon-sm">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="glass" size="icon-sm">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="glass" size="icon-sm">
                  <Maximize className="w-4 h-4" />
                </Button>
                <Button variant="glass" size="icon-sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stream info */}
            <div className="absolute bottom-20 left-0 right-0 p-4 z-10">
              <h1 className="text-2xl font-bold text-white mb-2">{stream.title}</h1>
              <p className="text-white/70">{stream.description}</p>
              <div className="flex items-center gap-2 mt-3">
                {stream.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Controls - Show for video streams or when joined */}
            {(stream.videoUrl || isJoined) && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                <div className="player-controls">
                  {/* Volume for video streams */}
                  {stream.videoUrl && (
                    <Button 
                      variant="ghost" 
                      size="icon-sm" 
                      className="text-white hover:text-white"
                      onClick={() => {
                        setIsMuted(!isMuted);
                        if (videoRef.current) {
                          videoRef.current.muted = !isMuted;
                        }
                      }}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                  )}
                  
                  {/* Volume for non-video streams */}
                  {!stream.videoUrl && (
                    <Button variant="ghost" size="icon-sm" className="text-white hover:text-white">
                      <Volume2 className="w-5 h-5" />
                    </Button>
                  )}

                  {/* Mic - only for non-video streams when joined */}
                  {!stream.videoUrl && canShareCamera && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={`text-white hover:text-white ${isMuted ? 'bg-destructive/20' : ''}`}
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </Button>
                  )}

                  {/* Video - only for non-video streams when joined */}
                  {!stream.videoUrl && canShareCamera && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={`text-white hover:text-white ${isVideoOff ? 'bg-destructive/20' : ''}`}
                      onClick={() => setIsVideoOff(!isVideoOff)}
                    >
                      {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </Button>
                  )}

                  {/* Screen Share - only for non-video streams when joined */}
                  {!stream.videoUrl && canShareScreen && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={`text-white hover:text-white ${isScreenSharing ? 'bg-accent/20 text-accent' : ''}`}
                      onClick={() => setIsScreenSharing(!isScreenSharing)}
                    >
                      <MonitorUp className="w-5 h-5" />
                    </Button>
                  )}

                  {/* Leave - only for non-video streams */}
                  {!stream.videoUrl && isJoined && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        handleLeaveStream();
                        navigate('/live');
                      }}
                    >
                      <PhoneOff className="w-5 h-5" />
                    </Button>
                  )}

                  {/* Settings */}
                  <Button variant="ghost" size="icon-sm" className="text-white hover:text-white">
                    <Settings className="w-5 h-5" />
                  </Button>

                  {/* Fullscreen */}
                  <Button 
                    variant="ghost" 
                    size="icon-sm" 
                    className="text-white hover:text-white"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.requestFullscreen?.();
                      }
                    }}
                  >
                    <Maximize className="w-5 h-5" />
                  </Button>

                  {/* Chat toggle */}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className={`text-white hover:text-white ${isChatOpen ? 'bg-primary/20' : ''}`}
                    onClick={() => setIsChatOpen(!isChatOpen)}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Button>

                  {/* Participants */}
                  <Button variant="ghost" size="icon-sm" className="text-white hover:text-white">
                    <Users className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-card border-l border-border flex flex-col"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Live Chat
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                {formatViewers(stream.viewerCount)}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4" ref={chatScrollRef}>
                {chatLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : chatMessages.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    No messages yet. Be the first to say something!
                  </p>
                ) : (
                  chatMessages.map((message) => (
                    <div key={message.id} className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.user_id}`} />
                        <AvatarFallback>{(message.user_name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{message.user_name || 'User'}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/90">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder={isAuthenticated ? "Send a message..." : "Sign in to chat"}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={!isAuthenticated}
                  className="flex-1"
                />
                <Button type="submit" disabled={!isAuthenticated || !newMessage.trim()}>
                  Send
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
