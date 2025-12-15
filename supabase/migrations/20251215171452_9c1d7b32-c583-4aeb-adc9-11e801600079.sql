-- Create platform settings table for admin controls
CREATE TABLE public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings (needed to check modes)
CREATE POLICY "Anyone can read platform settings"
ON public.platform_settings
FOR SELECT
USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update platform settings"
ON public.platform_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'yonetici') OR public.has_role(auth.uid(), 'admin'));

-- Only admins can insert settings
CREATE POLICY "Admins can insert platform settings"
ON public.platform_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'yonetici') OR public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.platform_settings (setting_key, setting_value, description) VALUES
('development_mode', true, 'Geliştirme Modu - Platform geliştirme aşamasında'),
('maintenance_mode', false, 'Bakım Modu - Platform bakımda'),
('danger_detection_mode', false, 'Tehlikeli Aktivite Tespit Modu');

-- Create function to update timestamp
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();