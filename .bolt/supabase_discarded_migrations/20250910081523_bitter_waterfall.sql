/*
  # Phase 4 Pro Features Schema Update

  1. Media Table Updates
    - Add `type` column for photo/video/gif/boomerang
    - Add `filters` JSON column for applied filters
    - Add `stickers` JSON column for sticker data
    - Add `background_removed` boolean flag
    - Add `background_url` for custom backgrounds

  2. Events Table Updates
    - Add `theme_color` for branding
    - Add `watermark_url` for custom watermarks
    - Add `gallery_enabled` boolean flag
    - Add `gallery_public` boolean flag

  3. New Tables
    - Create `media` table to replace separate photos/videos tables
    - Create `gallery_settings` table for advanced gallery options
*/

-- Create new unified media table
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  filename text NOT NULL,
  public_url text NOT NULL,
  type text NOT NULL CHECK (type IN ('photo', 'video', 'gif', 'boomerang')),
  filters jsonb DEFAULT '{}',
  stickers jsonb DEFAULT '[]',
  background_removed boolean DEFAULT false,
  background_url text,
  created_at timestamptz DEFAULT now()
);

-- Add Phase 4 columns to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'theme_color'
  ) THEN
    ALTER TABLE events ADD COLUMN theme_color text DEFAULT '#3B82F6';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'watermark_url'
  ) THEN
    ALTER TABLE events ADD COLUMN watermark_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'gallery_enabled'
  ) THEN
    ALTER TABLE events ADD COLUMN gallery_enabled boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'gallery_public'
  ) THEN
    ALTER TABLE events ADD COLUMN gallery_public boolean DEFAULT true;
  END IF;
END $$;

-- Enable RLS on media table
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Create policies for media table
CREATE POLICY "Media can be read by anyone"
  ON media
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Media can be inserted by anyone"
  ON media
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_event_id ON media(event_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);