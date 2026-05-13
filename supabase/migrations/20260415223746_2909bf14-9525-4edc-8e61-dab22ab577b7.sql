
-- Create storage bucket for personas
INSERT INTO storage.buckets (id, name, public)
VALUES ('personas', 'personas', true);

-- Storage policies
CREATE POLICY "Anyone can view persona images"
ON storage.objects FOR SELECT
USING (bucket_id = 'personas');

CREATE POLICY "Users can upload their own personas"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'personas' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own personas"
ON storage.objects FOR DELETE
USING (bucket_id = 'personas' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create user_personas table
CREATE TABLE public.user_personas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Persona',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_personas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own personas"
ON public.user_personas FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personas"
ON public.user_personas FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personas"
ON public.user_personas FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_user_personas_user_id ON public.user_personas (user_id);
