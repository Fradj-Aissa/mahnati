INSERT INTO storage.buckets (id, name, public)
VALUES ('course-materials', 'course-materials', TRUE)
ON CONFLICT (id) DO UPDATE
SET public = TRUE;

DROP POLICY IF EXISTS "Course materials are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload course materials" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update course materials" ON storage.objects;

CREATE POLICY "Course materials are publicly readable"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'course-materials'
);

CREATE POLICY "Authenticated users can upload course materials"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'course-materials'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update course materials"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'course-materials'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'course-materials'
  AND auth.role() = 'authenticated'
);
