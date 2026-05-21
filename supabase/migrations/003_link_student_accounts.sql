create or replace function public.link_student_account_by_email(target_student_id uuid)
returns public.students
language plpgsql
security definer
set search_path = public
as $$
declare
  target_student public.students;
  target_profile public.profiles;
  linked_student public.students;
begin
  select *
  into target_student
  from public.students
  where id = target_student_id
    and lecturer_id = auth.uid();

  if not found then
    raise exception 'Student not found or not supervised by current user.';
  end if;

  select *
  into target_profile
  from public.profiles
  where lower(email) = lower(target_student.email)
    and role = 'Student'
  limit 1;

  if not found then
    raise exception 'No student account found with matching email %. Ask the student to create a Supabase account first.', target_student.email;
  end if;

  update public.students
  set user_id = target_profile.id
  where id = target_student.id
    and lecturer_id = auth.uid()
  returning * into linked_student;

  return linked_student;
end;
$$;

grant execute on function public.link_student_account_by_email(uuid) to authenticated;
