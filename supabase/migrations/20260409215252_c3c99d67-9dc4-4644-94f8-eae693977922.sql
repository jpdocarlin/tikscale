
-- Create storage bucket for motion transfer videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('motion-videos', 'motion-videos', true);

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload motion videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'motion-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access
CREATE POLICY "Motion videos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'motion-videos');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own motion videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'motion-videos' AND auth.uid()::text = (storage.foldername(name))[1]);
