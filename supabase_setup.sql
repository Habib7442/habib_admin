-- PROJECTS TABLE
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  short_description text,
  full_description text,
  thumbnail_url text,
  images text[] DEFAULT '{}',
  live_url text,
  github_url text,
  tech_stack text[] DEFAULT '{}',
  category text CHECK (category IN ('web', 'mobile', 'design', 'other')),
  status text CHECK (status IN ('completed', 'in_progress', 'planning')),
  featured boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- BLOGS TABLE
CREATE TABLE blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  cover_url text,
  excerpt text,
  content text,
  category text,
  tags text[] DEFAULT '{}',
  status text CHECK (status IN ('published', 'draft')) DEFAULT 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- DESIGNS TABLE
CREATE TABLE designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text,
  description text,
  category text CHECK (category IN ('ai_generated', 'branding', 'ui', 'illustration', 'photoshoot')),
  tools text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- TESTIMONIALS TABLE
CREATE TABLE testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  role text,
  company text,
  avatar_url text,
  review text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- SITE SETTINGS TABLE
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  availability_status boolean DEFAULT true,
  bio text,
  tagline text,
  social_github text,
  social_linkedin text,
  social_twitter text,
  updated_at timestamptz DEFAULT now()
);

-- Insert initial empty settings row
INSERT INTO site_settings (availability_status) VALUES (true);

-- ENABLE RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- POLICIES (Admin Only)
CREATE POLICY "Allow all actions for authenticated users" ON projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON blogs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON designs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON testimonials FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all actions for authenticated users" ON site_settings FOR ALL TO authenticated USING (true);

-- STORAGE BUCKETS (Public Read, Authenticated Write)
-- Note: Buckets must be created via the Storage API or Dashboard usually.
-- Here are some potential SQL commands for when the extensions are active:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('blog-covers', 'blog-covers', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('designs', 'designs', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
