import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface ChatMessage {
  id: string;
  stream_id: string;
  user_id: string | null;
  content: string;
  message_type: string;
  is_deleted: boolean;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export function useStreamChat(streamId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuthContext();

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!streamId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          stream_id,
          user_id,
          content,
          message_type,
          is_deleted,
          created_at
        `)
        .eq('stream_id', streamId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error fetching chat messages:', error);
        return;
      }

      // Fetch user profiles for messages
      const userIds = [...new Set(data?.map(m => m.user_id).filter(Boolean))];
      let profiles: Record<string, { name: string; avatar_url: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .in('id', userIds);
        
        profiles = (profileData || []).reduce((acc, p) => {
          acc[p.id] = { name: p.name || 'User', avatar_url: p.avatar_url };
          return acc;
        }, {} as Record<string, { name: string; avatar_url: string | null }>);
      }

      const messagesWithProfiles = (data || []).map(m => ({
        ...m,
        user_name: m.user_id ? profiles[m.user_id]?.name || 'User' : 'Anonymous',
        user_avatar: m.user_id ? profiles[m.user_id]?.avatar_url || undefined : undefined,
      }));

      setMessages(messagesWithProfiles);
    } catch (err) {
      console.error('Error in fetchMessages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [streamId]);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!streamId || !profile || !content.trim()) return false;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          stream_id: streamId,
          user_id: profile.id,
          content: content.trim(),
          message_type: 'text',
        });

      if (error) {
        console.error('Error sending message:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error in sendMessage:', err);
      return false;
    }
  }, [streamId, profile]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!streamId) return;

    const channel = supabase
      .channel(`chat-${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `stream_id=eq.${streamId}`,
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;

          // Avoid duplicates (can happen on reconnects)
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });

          // Fetch user profile for the new message (async enrichment)
          if (newMessage.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name, avatar_url')
              .eq('id', newMessage.user_id)
              .maybeSingle();

            setMessages((prev) =>
              prev.map((m) =>
                m.id === newMessage.id
                  ? {
                      ...m,
                      user_name: profileData?.name || 'User',
                      user_avatar: profileData?.avatar_url || undefined,
                    }
                  : m
              )
            );
          } else {
            setMessages((prev) =>
              prev.map((m) => (m.id === newMessage.id ? { ...m, user_name: 'Anonymous' } : m))
            );
          }
        }
      )
      .subscribe(async (status) => {
        // Fetch after we are fully subscribed to reduce race conditions
        if (status === 'SUBSCRIBED') {
          await fetchMessages();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId, fetchMessages]);

  return {
    messages,
    isLoading,
    sendMessage,
    refetch: fetchMessages,
  };
}
