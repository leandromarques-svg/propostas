-- Add quiz stats columns to profiles table
alter table profiles
add column if not exists total_quiz_score integer default 0,
add column if not exists total_quiz_games integer default 0;

comment on column profiles.total_quiz_score is 'Sum of scores from all quiz history';
comment on column profiles.total_quiz_games is 'Total number of quizzes played';
