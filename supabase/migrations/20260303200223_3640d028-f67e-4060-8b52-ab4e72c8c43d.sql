-- Add storage policy to validate file types on upload for lessons bucket
CREATE POLICY "Validate file types on lessons upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'lessons' AND
    can_create_content(auth.uid()) AND
    (storage.extension(name) IN ('mp4', 'mov', 'pdf', 'jpg', 'jpeg', 'png', 'webp'))
  );

-- Add storage policy to validate file types on upload for exam-pdfs bucket  
CREATE POLICY "Validate file types on exam upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'exam-pdfs' AND
    can_create_content(auth.uid()) AND
    (storage.extension(name) IN ('pdf', 'jpg', 'jpeg', 'png', 'webp'))
  );
