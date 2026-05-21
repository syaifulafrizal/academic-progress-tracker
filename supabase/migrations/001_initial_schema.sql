create extension if not exists "pgcrypto";

create type user_role as enum ('Lecturer', 'Student', 'Admin');
create type student_type as enum ('FYP', 'Master', 'PhD');
create type task_status as enum ('Not started', 'In progress', 'Submitted', 'Need revision', 'Approved', 'Completed', 'Overdue');
create type student_risk as enum ('On track', 'Slight delay', 'Delayed', 'Critical', 'Completed');
create type publication_status as enum ('Idea', 'Result ready', 'Drafting', 'Supervisor review', 'Submitted', 'Under review', 'Revision', 'Accepted', 'Published');
create type thesis_status as enum ('Not started', 'Drafting', 'Submitted to supervisor', 'Need revision', 'Approved', 'Submitted to faculty', 'Completed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role user_role not null,
  created_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  lecturer_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  email text not null,
  student_type student_type not null,
  start_date date not null,
  expected_end_date date not null,
  max_end_date date not null,
  research_title text not null,
  risk_status student_risk not null default 'On track',
  attention_score integer not null default 0 check (attention_score >= 0 and attention_score <= 100),
  thesis_status thesis_status not null default 'Not started',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.milestone_templates (
  id uuid primary key default gen_random_uuid(),
  student_type student_type not null,
  title text not null,
  period text not null,
  expected_output text not null,
  default_order integer not null
);

create table public.student_milestones (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null,
  period text not null,
  expected_output text not null,
  deadline date not null,
  status task_status not null default 'Not started',
  progress_percent integer not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  created_at timestamptz not null default now()
);

create table public.research_objectives (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  objective_no integer not null,
  description text not null,
  progress_percent integer not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  status text not null default 'Not started'
);

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  paper_no integer not null,
  title text not null,
  target_journal text not null,
  status publication_status not null default 'Idea',
  submission_date date,
  acceptance_date date
);

create table public.thesis_chapters (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  chapter_no integer not null,
  title text not null,
  status task_status not null default 'Not started',
  progress_percent integer not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  word_count integer not null default 0,
  updated_at date not null default current_date
);

create table public.weekly_updates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  week_start date not null,
  completed_this_week text not null,
  not_completed text not null,
  blocker text not null,
  plan_for_next_week text not null,
  related_milestone_id uuid references public.student_milestones(id) on delete set null,
  related_milestone_title text not null,
  deadline date not null,
  need_feedback boolean not null default false,
  feedback_text text,
  evidence_file_name text,
  created_at timestamptz not null default now()
);

create table public.meeting_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  meeting_date date not null,
  summary text not null,
  supervisor_feedback text not null,
  action_items text[] not null default '{}',
  deadline date not null,
  next_meeting_date date not null,
  created_at timestamptz not null default now()
);

create table public.academic_tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  title text not null,
  description text not null,
  priority text not null check (priority in ('High', 'Medium', 'Low')),
  deadline date not null,
  status text not null default 'Pending' check (status in ('Pending', 'Completed', 'Overdue')),
  related_area text not null,
  created_at timestamptz not null default now()
);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  lecturer_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  item_type text not null,
  item_id uuid,
  comment text not null,
  created_at timestamptz not null default now()
);

create table public.uploaded_files (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  file_name text not null,
  file_size text not null,
  file_type text not null,
  storage_path text,
  related_item text not null,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  generated_by uuid references public.profiles(id) on delete set null,
  download_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.milestone_templates enable row level security;
alter table public.student_milestones enable row level security;
alter table public.research_objectives enable row level security;
alter table public.publications enable row level security;
alter table public.thesis_chapters enable row level security;
alter table public.weekly_updates enable row level security;
alter table public.meeting_logs enable row level security;
alter table public.academic_tasks enable row level security;
alter table public.feedback enable row level security;
alter table public.uploaded_files enable row level security;
alter table public.reports enable row level security;

create policy "Profiles can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Templates are readable by authenticated users" on public.milestone_templates for select to authenticated using (true);

create policy "Lecturers manage own students" on public.students for all to authenticated using (lecturer_id = auth.uid()) with check (lecturer_id = auth.uid());
create policy "Students read own student record" on public.students for select to authenticated using (user_id = auth.uid());

create policy "Lecturers manage student child records" on public.student_milestones for all to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid())) with check (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid()));
create policy "Students read own milestones" on public.student_milestones for select to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid()));

create policy "Lecturers manage objectives" on public.research_objectives for all to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid())) with check (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid()));
create policy "Students read objectives" on public.research_objectives for select to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid()));

create policy "Lecturers manage publications" on public.publications for all to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid())) with check (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid()));
create policy "Students manage own publications" on public.publications for all to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid())) with check (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid()));

create policy "Lecturers manage thesis" on public.thesis_chapters for all to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid())) with check (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid()));
create policy "Students update own thesis" on public.thesis_chapters for all to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid())) with check (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid()));

create policy "Lecturers manage weekly updates" on public.weekly_updates for all to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid())) with check (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid()));
create policy "Students manage own weekly updates" on public.weekly_updates for all to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid())) with check (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid()));

create policy "Lecturers manage meetings tasks feedback files reports" on public.meeting_logs for all to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid())) with check (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid()));
create policy "Students read meetings" on public.meeting_logs for select to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid()));

create policy "Lecturers manage tasks" on public.academic_tasks for all to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid())) with check (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid()));
create policy "Students manage own tasks" on public.academic_tasks for all to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid())) with check (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid()));

create policy "Lecturers manage feedback" on public.feedback for all to authenticated using (lecturer_id = auth.uid()) with check (lecturer_id = auth.uid());
create policy "Students read own feedback" on public.feedback for select to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid()));

create policy "Lecturers manage files" on public.uploaded_files for all to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid())) with check (exists (select 1 from public.students s where s.id = student_id and s.lecturer_id = auth.uid()));
create policy "Students manage own files" on public.uploaded_files for all to authenticated using (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid())) with check (exists (select 1 from public.students s where s.id = student_id and s.user_id = auth.uid()));

create policy "Lecturers manage reports" on public.reports for all to authenticated using (generated_by = auth.uid()) with check (generated_by = auth.uid());
