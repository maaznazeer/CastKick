// User roles
export type UserRole = 'USER' | 'MEMBER' | 'ADMIN';

// Stream status
export type StreamStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'ENDED' | 'RECORDED';

// User type
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
}

// Stream type
export interface Stream {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  status: StreamStatus;
  hostId: string;
  host?: User;
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  viewerCount: number;
  category: string;
  tags: string[];
  videoUrl?: string;
  createdAt: Date;
}

// Stream Participant
export interface StreamParticipant {
  id: string;
  streamId: string;
  userId: string;
  user?: User;
  role: 'HOST' | 'CO_HOST' | 'VIEWER';
  isSharingScreen: boolean;
  isSharingCamera: boolean;
  isSharingMic: boolean;
  joinedAt: Date;
}

// Chat Message
export interface ChatMessage {
  id: string;
  streamId: string;
  userId: string;
  user?: User;
  content: string;
  type: 'TEXT' | 'EMOJI' | 'SYSTEM';
  createdAt: Date;
}

// Video (VOD)
export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  url: string;
  duration: number;
  viewCount: number;
  likeCount: number;
  category: string;
  tags: string[];
  uploaderId: string;
  uploader?: User;
  createdAt: Date;
  publishedAt?: Date;
  isPublished: boolean;
}

// Sports Team
export interface SportsTeam {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  country?: string;
  league?: string;
}

// Sports Match
export interface SportsMatch {
  id: string;
  homeTeam: SportsTeam;
  awayTeam: SportsTeam;
  homeScore?: number;
  awayScore?: number;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  startTime: Date;
  sport: string;
  league: string;
  venue?: string;
}

// Screen Share Session
export interface ScreenShareSession {
  id: string;
  streamId: string;
  userId: string;
  user?: User;
  type: 'SCREEN' | 'WINDOW' | 'TAB';
  startedAt: Date;
  endedAt?: Date;
  isActive: boolean;
}
