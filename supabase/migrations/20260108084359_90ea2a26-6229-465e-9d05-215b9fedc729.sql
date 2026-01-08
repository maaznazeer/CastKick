-- Add video_url column to streams table for video-based streaming
ALTER TABLE public.streams 
ADD COLUMN video_url TEXT;