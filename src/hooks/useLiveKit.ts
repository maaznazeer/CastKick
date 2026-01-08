import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LiveKitToken {
  token: string;
  url: string;
  roomName: string;
}

interface UseLiveKitOptions {
  roomName: string;
  participantName: string;
  participantIdentity: string;
  isHost?: boolean;
  canPublish?: boolean;
}

export function useLiveKit() {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = useCallback(async (options: UseLiveKitOptions): Promise<LiveKitToken | null> => {
    setIsConnecting(true);
    setError(null);

    try {
      console.log('Requesting LiveKit token...', options);
      
      const { data, error: fnError } = await supabase.functions.invoke('livekit-token', {
        body: {
          roomName: options.roomName,
          participantName: options.participantName,
          participantIdentity: options.participantIdentity,
          isHost: options.isHost ?? false,
          canPublish: options.canPublish ?? false,
          canSubscribe: true,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to get token');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Token received successfully');
      setToken(data.token);
      setServerUrl(data.url);
      
      return {
        token: data.token,
        url: data.url,
        roomName: data.roomName,
      };
    } catch (err: any) {
      console.error('Error getting LiveKit token:', err);
      setError(err.message || 'Failed to connect to stream');
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setToken(null);
    setServerUrl(null);
    setError(null);
  }, []);

  return {
    token,
    serverUrl,
    isConnecting,
    error,
    getToken,
    disconnect,
  };
}
