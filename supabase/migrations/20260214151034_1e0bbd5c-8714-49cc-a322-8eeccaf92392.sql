
-- Fix: Admins can view all user roles (needed for role management)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'yonetici'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Add text_value column for danger mode password storage
ALTER TABLE public.platform_settings 
ADD COLUMN text_value text DEFAULT NULL;
