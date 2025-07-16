-- Healthcare Dashboard - Supabase Database Setup
-- Run this script in your Supabase SQL editor

-- Create profiles table to store additional user information
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role TEXT CHECK (role IN ('patient', 'nurse', 'doctor', 'admin')) DEFAULT 'patient',
    department TEXT,
    license_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- Create departments table
CREATE TABLE public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default departments
INSERT INTO public.departments (name, description) VALUES
    ('Cardiology', 'Heart and cardiovascular system'),
    ('Dermatology', 'Skin conditions and treatments'),
    ('Emergency Medicine', 'Emergency and urgent care'),
    ('Family Medicine', 'General and family practice'),
    ('Internal Medicine', 'Adult internal medicine'),
    ('Neurology', 'Nervous system disorders'),
    ('Oncology', 'Cancer treatment and care'),
    ('Orthopedics', 'Bone and joint conditions'),
    ('Pediatrics', 'Children and adolescent care'),
    ('Psychiatry', 'Mental health and disorders'),
    ('Radiology', 'Medical imaging and diagnostics'),
    ('Surgery', 'Surgical procedures and care');

-- Row Level Security (RLS) policies

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Doctors and nurses can view patients in their department
CREATE POLICY "Medical staff can view department patients" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() 
            AND p.role IN ('doctor', 'nurse')
            AND p.department = profiles.department
        )
    );

-- Enable RLS on departments table
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view departments
CREATE POLICY "All users can view departments" ON public.departments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, phone, role, department, license_number)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
        NEW.raw_user_meta_data->>'department',
        NEW.raw_user_meta_data->>'license_number'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle profile updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        email = NEW.email,
        first_name = NEW.raw_user_meta_data->>'first_name',
        last_name = NEW.raw_user_meta_data->>'last_name',
        phone = NEW.raw_user_meta_data->>'phone',
        role = COALESCE(NEW.raw_user_meta_data->>'role', OLD.raw_user_meta_data->>'role', 'patient'),
        department = NEW.raw_user_meta_data->>'department',
        license_number = NEW.raw_user_meta_data->>'license_number',
        updated_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile when user metadata changes
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_department ON public.profiles(department);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Create audit log table for tracking changes
CREATE TABLE public.audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on audit_log table
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" ON public.audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to log profile changes
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_log (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        user_id
    ) VALUES (
        'profiles',
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        auth.uid()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log all profile changes
CREATE TRIGGER audit_profiles_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.log_profile_changes();

-- Create view for user statistics (admin only)
CREATE VIEW public.user_stats AS
SELECT 
    role,
    COUNT(*) as count,
    department,
    DATE(created_at) as date_created
FROM public.profiles
GROUP BY role, department, DATE(created_at);

-- RLS for user_stats view
ALTER VIEW public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view user stats" ON public.user_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.departments TO authenticated;
GRANT ALL ON public.audit_log TO authenticated;
GRANT SELECT ON public.user_stats TO authenticated;

-- Create storage bucket for profile images (optional)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policy for avatars
-- CREATE POLICY "Users can upload their own avatar" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'avatars' AND 
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- CREATE POLICY "Users can view their own avatar" ON storage.objects
--     FOR SELECT USING (
--         bucket_id = 'avatars' AND 
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- CREATE POLICY "Users can update their own avatar" ON storage.objects
--     FOR UPDATE USING (
--         bucket_id = 'avatars' AND 
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- CREATE POLICY "Users can delete their own avatar" ON storage.objects
--     FOR DELETE USING (
--         bucket_id = 'avatars' AND 
--         auth.uid()::text = (storage.foldername(name))[1]
--     );