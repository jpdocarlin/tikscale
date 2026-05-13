
CREATE TABLE public.product_radar (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  radar_date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL,
  products jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (radar_date, category)
);

ALTER TABLE public.product_radar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view radar"
ON public.product_radar
FOR SELECT
TO authenticated
USING (true);
