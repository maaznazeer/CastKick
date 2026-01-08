import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenRequest {
  roomName: string;
  participantName: string;
  participantIdentity: string;
  isHost?: boolean;
  canPublish?: boolean;
  canSubscribe?: boolean;
}

interface VideoGrant {
  roomJoin?: boolean;
  room?: string;
  canPublish?: boolean;
  canPublishData?: boolean;
  canSubscribe?: boolean;
  roomAdmin?: boolean;
  roomCreate?: boolean;
}

async function createLiveKitToken(
  apiKey: string,
  apiSecret: string,
  identity: string,
  name: string,
  grants: VideoGrant,
  ttl: number = 60 * 60 * 4 // 4 hours
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    iss: apiKey,
    sub: identity,
    name: name,
    iat: now,
    nbf: now,
    exp: now + ttl,
    video: grants,
  };

  const secret = new TextEncoder().encode(apiSecret);
  
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(secret);
  
  return jwt;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LIVEKIT_API_KEY = Deno.env.get('LIVEKIT_API_KEY');
    const LIVEKIT_API_SECRET = Deno.env.get('LIVEKIT_API_SECRET');
    const LIVEKIT_URL = Deno.env.get('LIVEKIT_URL');

    if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL) {
      console.error('Missing LiveKit configuration');
      throw new Error('LiveKit configuration is incomplete');
    }

    const body: TokenRequest = await req.json();
    const { roomName, participantName, participantIdentity, isHost = false, canPublish = false, canSubscribe = true } = body;

    console.log(`Generating token for ${participantName} in room ${roomName}`);
    console.log(`isHost: ${isHost}, canPublish: ${canPublish}, canSubscribe: ${canSubscribe}`);

    if (!roomName || !participantName || !participantIdentity) {
      throw new Error('Missing required parameters: roomName, participantName, participantIdentity');
    }

    // Create video grants based on role
    const videoGrant: VideoGrant = {
      roomJoin: true,
      room: roomName,
      canPublish: isHost || canPublish,
      canPublishData: true,
      canSubscribe: canSubscribe,
      roomAdmin: isHost,
      roomCreate: isHost,
    };

    const token = await createLiveKitToken(
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      participantIdentity,
      participantName,
      videoGrant
    );

    console.log('Token generated successfully');

    return new Response(
      JSON.stringify({ 
        token,
        url: LIVEKIT_URL,
        roomName,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error generating token:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
