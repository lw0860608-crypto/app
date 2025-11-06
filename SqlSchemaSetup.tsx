import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './Icons';

const sqlSchema = `
-- 1. Enable Row Level Security (RLS) on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_sub_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_providers ENABLE ROW LEVEL SECURITY;

-- 2. Create policies to isolate tenant data
-- Users can only see and manage their own data.
CREATE POLICY "Enable access for own data" ON accounts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable access for own data" ON generation_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable access for own data" ON asset_library FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable access for own data" ON affiliate_rules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable access for own data" ON strategy_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Enable access for own data" ON api_providers FOR ALL USING (auth.uid() = user_id);

-- Performance metrics and sub-steps are linked to tasks, so we check ownership through the task.
CREATE POLICY "Enable access for own data" ON performance_metrics FOR ALL USING (
  EXISTS (
    SELECT 1 FROM generation_tasks
    WHERE generation_tasks.id = performance_metrics.task_id AND generation_tasks.user_id = auth.uid()
  )
);
CREATE POLICY "Enable access for own data" ON task_sub_steps FOR ALL USING (
  EXISTS (
    SELECT 1 FROM generation_tasks
    WHERE generation_tasks.id = task_sub_steps.task_id AND generation_tasks.user_id = auth.uid()
  )
);

-- Public tables that don't need tenant isolation
-- Execution nodes, managed platforms, and trending videos are shared resources.
-- System API providers are managed by the admin.
-- Workflows are currently public but could be isolated in the future.

-- 3. Create tables
-- Note: UUIDs, created_at timestamps are handled by Supabase defaults.

CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  username text NOT NULL,
  platform text NOT NULL,
  credentials jsonb,
  content_style text,
  is_autonomous boolean DEFAULT false,
  daily_spend_limit numeric,
  approval_threshold numeric,
  creative_mandate text,
  daily_post_limit integer,
  preferred_post_times text,
  estimated_ecpm_cny numeric,
  enable_saas_watermark boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE generation_tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  scheduled_for timestamptz,
  published_at timestamptz,
  video_url text,
  estimated_cost numeric,
  target_node_location text,
  expires_at timestamptz,
  variant_of_task_id uuid REFERENCES generation_tasks(id) ON DELETE SET NULL,
  ab_test_group text,
  created_at timestamptz DEFAULT now(),
  takedown_status text -- v8.0 ADDITION
);

CREATE TABLE execution_nodes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  node_type text NOT NULL,
  location text NOT NULL,
  status text,
  last_heartbeat timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE performance_metrics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id uuid REFERENCES generation_tasks(id) ON DELETE CASCADE,
  views integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  comments integer NOT NULL DEFAULT 0,
  shares integer NOT NULL DEFAULT 0,
  fetched_at timestamptz DEFAULT now()
);

CREATE TABLE system_api_providers ( -- v8.0 ADDITION
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_name text NOT NULL,
  api_type text NOT NULL,
  description text,
  is_core boolean DEFAULT false,
  credentials_schema jsonb,
  icon_name text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE api_providers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  system_provider_id uuid REFERENCES system_api_providers(id) NOT NULL,
  credentials jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);


-- 4. Set up storage bucket for assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('video_assets', 'video_assets', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Super Admin Functionality
-- Create a function to get all users, callable only by a super admin.
-- This requires a separate 'profiles' table with an 'is_super_admin' column.
-- First, create the profiles table and a function to sync it with auth.users.
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  is_super_admin boolean DEFAULT false
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Manually set your own user as super admin in the 'profiles' table.
-- UPDATE profiles SET is_super_admin = true WHERE id = 'YOUR_USER_ID';

-- Function for super admins to check their role.
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
DECLARE
  is_admin boolean;
BEGIN
  SELECT p.is_super_admin INTO is_admin
  FROM public.profiles p
  WHERE p.id = auth.uid();
  RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all users, checking the super admin role.
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz) AS $$
BEGIN
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Permission denied: requires super admin privileges.';
  END IF;
  
  RETURN QUERY
  SELECT u.id, u.email, u.created_at, u.last_sign_in_at
  FROM auth.users u;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;

export const SqlSchemaSetup: React.FC = () => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(sqlSchema.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative bg-gray-900/50 rounded-lg border border-dark-border h-full">
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 bg-gray-700 hover:bg-gray-600 text-gray-300 p-1.5 rounded-md transition z-10"
            >
                {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardIcon className="h-5 w-5" />}
            </button>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono p-4 h-full overflow-auto">
                <code>{sqlSchema.trim()}</code>
            </pre>
        </div>
    );
};
