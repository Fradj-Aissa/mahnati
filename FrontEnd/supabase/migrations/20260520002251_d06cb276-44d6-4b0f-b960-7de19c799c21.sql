
-- Enums
CREATE TYPE public.course_status AS ENUM ('draft', 'published');
CREATE TYPE public.artisan_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.session_status AS ENUM ('upcoming', 'completed', 'cancelled');

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  instructor TEXT NOT NULL,
  students INTEGER NOT NULL DEFAULT 0,
  status public.course_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses"
  ON public.courses FOR SELECT USING (true);

CREATE POLICY "Admins can manage courses"
  ON public.courses FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Artisans table
CREATE TABLE public.artisans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  craft TEXT NOT NULL,
  bio TEXT,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  sessions_count INTEGER NOT NULL DEFAULT 0,
  status public.artisan_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.artisans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved artisans"
  ON public.artisans FOR SELECT USING (status = 'approved' OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage artisans"
  ON public.artisans FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER artisans_updated_at
  BEFORE UPDATE ON public.artisans
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_name TEXT NOT NULL,
  student_name TEXT NOT NULL,
  craft TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status public.session_status NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sessions"
  ON public.sessions FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seed sample data so existing UI keeps showing rows
INSERT INTO public.courses (title, category, instructor, students, status) VALUES
  ('أساسيات السباكة', 'حرف يدوية', 'أحمد بن علي', 124, 'published'),
  ('الخياطة العصرية', 'حرف يدوية', 'فاطمة الزهراء', 89, 'published'),
  ('اللغة الإنجليزية للمبتدئين', 'لغات', 'سارة محمد', 312, 'published'),
  ('فن الإلقاء والخطابة', 'تطوير ذاتي', 'خالد عمر', 67, 'draft'),
  ('النجارة الحديثة', 'حرف يدوية', 'محمود يوسف', 45, 'published');

INSERT INTO public.artisans (name, craft, rating, sessions_count, status) VALUES
  ('أحمد بن علي', 'السباكة', 4.8, 42, 'approved'),
  ('فاطمة الزهراء', 'الخياطة', 4.9, 67, 'approved'),
  ('محمود يوسف', 'النجارة', 4.6, 23, 'pending');

INSERT INTO public.sessions (artisan_name, student_name, craft, scheduled_at, status) VALUES
  ('أحمد بن علي', 'يوسف الأمين', 'السباكة', '2026-05-20 14:00+00', 'upcoming'),
  ('فاطمة الزهراء', 'نور الهدى', 'الخياطة', '2026-05-19 10:00+00', 'upcoming'),
  ('محمود يوسف', 'كريم سعيد', 'النجارة', '2026-05-15 16:00+00', 'completed'),
  ('أحمد بن علي', 'ليلى حسن', 'السباكة', '2026-05-14 09:00+00', 'cancelled');
