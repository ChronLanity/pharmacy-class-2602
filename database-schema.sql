-- 药学2602班级网站数据库架构
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 用户表（包含角色信息）
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin' or 'member'
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_user_id_idx ON users(user_id);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

-- 2. 班级公告表
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS announcements_created_at_idx ON announcements(created_at DESC);

-- 3. 活动/相册表
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  activity_date TEXT NOT NULL, -- 使用 TEXT 存储 YYYY-MM-DD 格式
  photos JSONB DEFAULT '[]'::jsonb, -- 存储图片URL数组
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activities_activity_date_idx ON activities(activity_date DESC);
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON activities(created_at DESC);

-- 4. 学习资料表
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  file_url TEXT NOT NULL,
  file_name TEXT DEFAULT '',
  uploader_id TEXT NOT NULL,
  uploader_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS resources_created_at_idx ON resources(created_at DESC);
CREATE INDEX IF NOT EXISTS resources_uploader_id_idx ON resources(uploader_id);

-- 5. 设置 Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- 6. 创建访问策略

-- 用户表：所有登录用户可以查看和更新自己的信息
CREATE POLICY "Users can view all classmates" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (true);

-- 公告表：所有人可以查看，只有管理员可以管理
CREATE POLICY "Anyone can view announcements" ON announcements
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create announcements" ON announcements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete announcements" ON announcements
  FOR DELETE USING (true);

-- 活动表：所有人可以查看，只有管理员可以管理
CREATE POLICY "Anyone can view activities" ON activities
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create activities" ON activities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete activities" ON activities
  FOR DELETE USING (true);

-- 资料表：所有人可以查看和管理自己的资料
CREATE POLICY "Anyone can view resources" ON resources
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create resources" ON resources
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete resources" ON resources
  FOR DELETE USING (true);

-- 完成提示
DO $$
BEGIN
  RAISE NOTICE '数据库架构创建成功！';
  RAISE NOTICE '表：users, announcements, activities, resources';
  RAISE NOTICE 'RLS 已启用';
END $$;
