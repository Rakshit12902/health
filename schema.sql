-- CuraMind Supabase Database Schema

-- Enable pgvector extension for potential future embeddings
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR,
    preferred_language VARCHAR DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Profiles Table (For family members)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    age INT,
    gender VARCHAR,
    blood_group VARCHAR,
    medical_history TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Sessions Table (Chat Threads)
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR,
    language VARCHAR DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Documents Table (Uploaded Reports)
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    file_name VARCHAR NOT NULL,
    file_url VARCHAR NOT NULL,
    file_type VARCHAR, -- 'blood_report', 'prescription', 'x_ray'
    processing_status VARCHAR DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    extracted_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Messages Table (Chat History)
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    sender_type VARCHAR NOT NULL, -- 'user', 'ai'
    content TEXT NOT NULL,
    citations JSONB, -- Stores references to document
    audio_url VARCHAR, -- URL to TTS audio file
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Metrics Table (For Health Dashboards)
CREATE TABLE public.metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    metric_name VARCHAR NOT NULL,
    metric_value FLOAT NOT NULL,
    unit VARCHAR,
    reference_range VARCHAR,
    flag VARCHAR, -- 'high', 'low', 'normal'
    date_recorded TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

-- Create Policies for RLS
CREATE POLICY "Users can only see their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own data" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Note: In a production app, you would add similar RLS policies to profiles, sessions, etc.
-- matching on user_id = auth.uid()

-- 7. Prescriptions Table
CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    medicine_name VARCHAR NOT NULL,
    dosage VARCHAR,
    frequency VARCHAR,
    duration VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Pill Reminders Table
CREATE TABLE public.pill_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    time_of_day VARCHAR NOT NULL, -- e.g., 'morning', 'afternoon', 'night'
    taken_status BOOLEAN DEFAULT false,
    date_taken DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Doctor Links Table
CREATE TABLE public.doctor_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    secure_token VARCHAR UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pill_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_links ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ADDED RLS POLICIES FOR ALL REMAINING TABLES
-- ==========================================

-- 1. Profiles Table Policies
CREATE POLICY "Users can manage their own profiles" ON public.profiles FOR ALL USING (user_id = auth.uid());

-- 2. Sessions Table Policies
CREATE POLICY "Users can manage their own sessions" ON public.sessions FOR ALL USING (user_id = auth.uid());

-- 3. Prescriptions Table Policies
CREATE POLICY "Users can manage their own prescriptions" ON public.prescriptions FOR ALL USING (user_id = auth.uid());

-- 4. Doctor Links Table Policies
CREATE POLICY "Users can manage their own doctor links" ON public.doctor_links FOR ALL USING (user_id = auth.uid());

-- 5. Documents Table Policies (Linked via Session)
CREATE POLICY "Users can manage their own documents" ON public.documents FOR ALL USING (
  EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = documents.session_id AND sessions.user_id = auth.uid())
);

-- 6. Messages Table Policies (Linked via Session)
CREATE POLICY "Users can manage their own messages" ON public.messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = messages.session_id AND sessions.user_id = auth.uid())
);

-- 7. Metrics Table Policies (Linked via Profile)
CREATE POLICY "Users can manage their own metrics" ON public.metrics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = metrics.profile_id AND profiles.user_id = auth.uid())
);

-- 8. Pill Reminders Table Policies (Linked via Prescription)
CREATE POLICY "Users can manage their own pill reminders" ON public.pill_reminders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.prescriptions WHERE prescriptions.id = pill_reminders.prescription_id AND prescriptions.user_id = auth.uid())
);
