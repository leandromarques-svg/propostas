-- Add quiz_history column to profiles table if it doesn't exist
alter table profiles 
add column if not exists quiz_history jsonb default '[]'::jsonb;

-- Comment on column
comment on column profiles.quiz_history is 'Stores the history of quiz results for the user';
