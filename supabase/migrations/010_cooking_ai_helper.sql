-- Cooking AI Helper v0.1
-- Adds user-scoped question logs for recipe tutorial AI assistance.

create table public.cooking_ai_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid null references public.cooking_sessions(id) on delete set null,
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  step_number integer not null,
  question_text text null,
  question_image_url text null,
  answer_text text not null,
  answer_type text not null default 'text',
  suggested_action text not null default 'continue_current_step',
  risk_level text not null default 'low',
  needs_user_check boolean not null default false,
  model text null,
  created_at timestamptz not null default now(),

  constraint cooking_ai_questions_step_number_check
    check (step_number > 0),
  constraint cooking_ai_questions_answer_type_check
    check (answer_type in ('text', 'photo', 'voice')),
  constraint cooking_ai_questions_suggested_action_check
    check (suggested_action in ('continue_current_step', 'adjust_then_continue', 'stop_and_check')),
  constraint cooking_ai_questions_risk_level_check
    check (risk_level in ('low', 'medium', 'high')),
  constraint cooking_ai_questions_input_check
    check (question_text is not null or question_image_url is not null)
);

create index idx_cooking_ai_questions_user_created
  on public.cooking_ai_questions(user_id, created_at desc);

create index idx_cooking_ai_questions_session_created
  on public.cooking_ai_questions(session_id, created_at desc);

create index idx_cooking_ai_questions_recipe_step
  on public.cooking_ai_questions(recipe_id, step_number, created_at desc);

grant select, insert on table public.cooking_ai_questions to authenticated;

alter table public.cooking_ai_questions enable row level security;

create policy cooking_ai_questions_select_policy
on public.cooking_ai_questions for select
to authenticated
using (auth.uid() = user_id);

create policy cooking_ai_questions_insert_policy
on public.cooking_ai_questions for insert
to authenticated
with check (auth.uid() = user_id);
