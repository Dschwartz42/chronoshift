-- Chronoshift database schema
-- Run in Supabase SQL editor

create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  title text,
  narrative_json jsonb,
  video_url text,
  thumbnail_url text,
  duration_seconds integer,
  created_at timestamptz default now(),
  is_public boolean default false,
  status text default 'pending' check (status in ('pending','narrative','scenes','images','audio','assembling','complete','error')),
  stage_detail text,
  error_message text
);

create table if not exists job_notifications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references videos(id) on delete cascade,
  email text not null,
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- Enable Realtime for frontend polling
alter publication supabase_realtime add table videos;

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

-- Public read policy
create policy "public_read_videos"
on storage.objects for select
using (bucket_id = 'videos');

-- Service role write policy
create policy "service_write_videos"
on storage.objects for insert
with check (bucket_id = 'videos');

-- Public read for completed public videos
create policy "public_read_video_records"
on videos for select
using (is_public = true or true);
