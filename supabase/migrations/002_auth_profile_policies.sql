drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Lecturers can read supervised student profiles" on public.profiles;
create policy "Lecturers can read supervised student profiles"
on public.profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.students s
    where s.user_id = profiles.id
      and s.lecturer_id = auth.uid()
  )
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role := 'Lecturer';
begin
  if new.raw_user_meta_data ? 'role'
    and new.raw_user_meta_data->>'role' in ('Lecturer', 'Student', 'Admin') then
    requested_role := (new.raw_user_meta_data->>'role')::public.user_role;
  end if;

  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1), 'User'),
    coalesce(new.email, ''),
    requested_role
  )
  on conflict (id) do update
    set name = excluded.name,
        email = excluded.email,
        role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

insert into public.milestone_templates (student_type, title, period, expected_output, default_order)
values
  ('FYP', 'Chapter 1 - Introduction', 'Semester 1', 'Problem statement, research questions, scope, and clear objectives.', 1),
  ('FYP', 'Chapter 2 - Literature Review', 'Semester 1', 'Related articles reviewed and research gap identified.', 2),
  ('FYP', 'Chapter 3 - Methodology', 'Semester 1', 'Method, tools, data, experiment design, and planned analysis.', 3),
  ('FYP', 'Initial result', 'End of Semester 1', 'At least one result with early discussion.', 4),
  ('FYP', 'Chapter 4 - Results and Discussion', 'Semester 2', 'Complete results, figures, tables, and discussion.', 5),
  ('FYP', 'Final submission', 'End of Semester 2', 'Final thesis/report submitted and corrected.', 6),
  ('Master', 'Research Objectives Finalized', 'Year 1', 'Approved objective outline linked to tasks.', 1),
  ('Master', 'Paper 1 Draft', 'Year 2', 'One research article ready for supervisor review.', 2),
  ('Master', 'Thesis Chapters 1-5', 'Year 2', 'Full thesis background, methods, results, and discussion draft.', 3),
  ('Master', 'Final Submission', 'Year 2', 'Thesis submitted for examination or faculty processing.', 4),
  ('PhD', 'Proposal Defense passed', 'Year 1', 'Full proposal approved.', 1),
  ('PhD', 'Paper 1 accepted or submitted', 'Year 2', 'First research article submitted or accepted.', 2),
  ('PhD', 'Paper 2 accepted or submitted', 'Year 3', 'Second research article submitted or accepted.', 3),
  ('PhD', 'Thesis Integration & Draft Review', 'Year 3', 'Full draft compiled.', 4),
  ('PhD', 'Viva & Final Defense', 'Year 4', 'Successful defense and correction plan.', 5)
on conflict do nothing;
