import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import type { Stream as StreamType } from '@/types';

type DbStreamStatus = 'draft' | 'scheduled' | 'live' | 'ended' | 'recorded';

interface DbStream {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  status: DbStreamStatus;
  host_id: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  viewer_count: number;
  category: string;
  tags: string[] | null;
  livekit_room_name: string | null;
  recording_url: string | null;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

function mapDbStreamToStream(db: DbStream): StreamType {
  return {
    id: db.id,
    title: db.title,
    description: db.description || undefined,
    thumbnail: db.thumbnail_url || undefined,
    status: db.status.toUpperCase() as StreamType['status'],
    hostId: db.host_id || '',
    scheduledAt: db.scheduled_at ? new Date(db.scheduled_at) : undefined,
    startedAt: db.started_at ? new Date(db.started_at) : undefined,
    endedAt: db.ended_at ? new Date(db.ended_at) : undefined,
    viewerCount: db.viewer_count,
    category: db.category,
    tags: db.tags || [],
    videoUrl: db.video_url || undefined,
    createdAt: new Date(db.created_at),
  };
}

export function useStreams() {
  const [streams, setStreams] = useState<StreamType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile, hasRole } = useAuthContext();

  const fetchStreams = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error: dbError } = await supabase
        .from('streams')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;

      const mappedStreams = (data || []).map(mapDbStreamToStream);
      setStreams(mappedStreams);
    } catch (err: any) {
      console.error('Error fetching streams:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createStream = useCallback(async (streamData: {
    title: string;
    description?: string;
    category: string;
    tags?: string[];
    thumbnailUrl?: string;
    scheduledAt?: Date;
    videoUrl?: string;
  }) => {
    if (!hasRole('admin')) {
      throw new Error('Only admins can create streams');
    }

    const roomName = `stream-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const { data, error: dbError } = await supabase
      .from('streams')
      .insert({
        title: streamData.title,
        description: streamData.description,
        category: streamData.category,
        tags: streamData.tags || [],
        thumbnail_url: streamData.thumbnailUrl,
        scheduled_at: streamData.scheduledAt?.toISOString(),
        host_id: profile?.id,
        livekit_room_name: roomName,
        status: streamData.scheduledAt ? 'scheduled' : 'draft',
        video_url: streamData.videoUrl,
      })
      .select()
      .single();

    if (dbError) throw dbError;
    return mapDbStreamToStream(data);
  }, [profile, hasRole]);

  const startStream = useCallback(async (streamId: string) => {
    if (!hasRole('admin')) {
      throw new Error('Only admins can start streams');
    }

    const { data, error: dbError } = await supabase
      .from('streams')
      .update({
        status: 'live',
        started_at: new Date().toISOString(),
      })
      .eq('id', streamId)
      .select()
      .single();

    if (dbError) throw dbError;
    return mapDbStreamToStream(data);
  }, [hasRole]);

  const endStream = useCallback(async (streamId: string) => {
    if (!hasRole('admin')) {
      throw new Error('Only admins can end streams');
    }

    const { data, error: dbError } = await supabase
      .from('streams')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
      })
      .eq('id', streamId)
      .select()
      .single();

    if (dbError) throw dbError;
    return mapDbStreamToStream(data);
  }, [hasRole]);

  const getStreamById = useCallback(async (streamId: string): Promise<StreamType | null> => {
    const { data, error: dbError } = await supabase
      .from('streams')
      .select('*')
      .eq('id', streamId)
      .single();

    if (dbError) {
      console.error('Error fetching stream:', dbError);
      return null;
    }

    return mapDbStreamToStream(data);
  }, []);

  // Subscribe to realtime updates
  useEffect(() => {
    fetchStreams();

    const channel = supabase
      .channel('streams-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streams',
        },
        (payload) => {
          console.log('Stream update:', payload);
          fetchStreams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStreams]);

  const liveStreams = streams.filter(s => s.status === 'LIVE');
  const scheduledStreams = streams.filter(s => s.status === 'SCHEDULED');

  return {
    streams,
    liveStreams,
    scheduledStreams,
    isLoading,
    error,
    fetchStreams,
    createStream,
    startStream,
    endStream,
    getStreamById,
  };
}
