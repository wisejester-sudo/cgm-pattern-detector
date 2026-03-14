-- Migration 004: Performance Indexes

CREATE INDEX IF NOT EXISTS idx_technicians_admin ON public.technicians(admin_id);
CREATE INDEX IF NOT EXISTS idx_technicians_magic_link ON public.technicians(magic_link_token);
CREATE INDEX IF NOT EXISTS idx_jobs_admin ON public.jobs(admin_id);
CREATE INDEX IF NOT EXISTS idx_jobs_tech ON public.jobs(assigned_tech_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(admin_id, status);
