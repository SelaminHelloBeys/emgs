-- Update handle_new_user to read all metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name, school_name, class)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.raw_user_meta_data ->> 'school_name',
    NEW.raw_user_meta_data ->> 'class'
  );
  
  -- Auto-assign default student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'ogrenci'::app_role);
  
  RETURN NEW;
END;
$function$;

-- Create page_maintenance table for per-page maintenance mode
CREATE TABLE public.page_maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_route TEXT NOT NULL UNIQUE,
  page_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  message TEXT DEFAULT 'Bu sayfa şu anda bakımdadır.',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.page_maintenance ENABLE ROW LEVEL SECURITY;

-- Everyone can read (to check if page is in maintenance)
CREATE POLICY "Anyone can read page maintenance" ON public.page_maintenance
  FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "Admins can manage page maintenance" ON public.page_maintenance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('yonetici', 'admin'))
  );

-- Insert default page entries
INSERT INTO public.page_maintenance (page_route, page_name) VALUES
  ('/dashboard', 'Ana Sayfa'),
  ('/shorts', 'Shorts'),
  ('/konu-anlatimi', 'Konu Anlatımı'),
  ('/quizzes', 'Quizler'),
  ('/homework', 'Ödevler'),
  ('/analytics', 'Analitik'),
  ('/announcements', 'Duyurular'),
  ('/settings', 'Ayarlar'),
  ('/smartboard', 'Akıllı Tahta'),
  ('/upload', 'İçerik Yükleme'),
  ('/denemeler', 'Denemeler'),
  ('/rozetler', 'Rozetler');
