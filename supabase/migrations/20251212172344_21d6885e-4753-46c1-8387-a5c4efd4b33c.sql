-- Create storage bucket for lesson content
INSERT INTO storage.buckets (id, name, public)
VALUES ('lessons', 'lessons', true);

-- Storage policies for lessons bucket
CREATE POLICY "Public can view lessons files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lessons');

CREATE POLICY "Authenticated users can upload lesson files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lessons');

CREATE POLICY "Users can update own lesson files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'lessons' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own lesson files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'lessons' AND auth.uid()::text = (storage.foldername(name))[1]);