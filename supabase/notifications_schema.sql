-- Notifications table for activity tracking
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sms_received', 'status_change', 'note_added', 'tech_assigned', 'job_created', 'job_completed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  job_number TEXT,
  customer_name TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_job_id ON public.notifications(job_id);

-- RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Function to create notification on SMS receive
CREATE OR REPLACE FUNCTION create_sms_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_job record;
  v_user_id UUID;
BEGIN
  -- Get job info
  SELECT j.*, j.user_id as job_user_id INTO v_job
  FROM public.jobs j
  WHERE j.id = NEW.job_id;
  
  IF v_job IS NOT NULL AND NEW.direction = 'incoming' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      job_id,
      job_number,
      customer_name
    ) VALUES (
      v_job.job_user_id,
      'sms_received',
      'New Message',
      substring(NEW.message_body from 1 for 100) || CASE WHEN length(NEW.message_body) > 100 THEN '...' ELSE '' END,
      NEW.job_id,
      v_job.job_number,
      v_job.customer_name
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for SMS notifications
CREATE TRIGGER sms_notification_trigger
  AFTER INSERT ON public.sms_logs
  FOR EACH ROW
  EXECUTE FUNCTION create_sms_notification();

-- Function to create notification on job status change
CREATE OR REPLACE FUNCTION create_status_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_status_text TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    v_status_text := CASE NEW.status
      WHEN 'scheduled' THEN 'Scheduled'
      WHEN 'en_route' THEN 'En Route'
      WHEN 'working' THEN 'Working'
      WHEN 'on_hold' THEN 'On Hold'
      WHEN 'complete' THEN 'Complete'
      ELSE 'Updated'
    END;
    
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      job_id,
      job_number,
      customer_name
    ) VALUES (
      NEW.user_id,
      'status_change',
      'Status Updated',
      'Job #' || COALESCE(NEW.job_number, NEW.id::text) || ' is now ' || v_status_text,
      NEW.id,
      NEW.job_number,
      NEW.customer_name
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for status change notifications
CREATE TRIGGER status_notification_trigger
  AFTER UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION create_status_notification();

-- Function to create notification on job creation
CREATE OR REPLACE FUNCTION create_job_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    job_id,
    job_number,
    customer_name
  ) VALUES (
    NEW.user_id,
    'job_created',
    'New Job Created',
    'Job #' || COALESCE(NEW.job_number, NEW.id::text) || ' for ' || NEW.customer_name,
    NEW.id,
    NEW.job_number,
    NEW.customer_name
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for job creation notifications
CREATE TRIGGER job_notification_trigger
  AFTER INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION create_job_notification();

-- Function to mark notifications as read when viewing a job
CREATE OR REPLACE FUNCTION mark_job_notifications_read()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true
  WHERE job_id = NEW.id AND user_id = auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
