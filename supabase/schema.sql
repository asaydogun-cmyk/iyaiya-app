-- イヤイヤ期声かけアプリ Supabaseスキーマ
-- Supabase SQL Editorで実行してください

-- 子どものプロフィールテーブル
create table if not exists children (
  id          uuid        default gen_random_uuid() primary key,
  created_at  timestamptz default now() not null,
  user_key    text        not null,
  name        text        not null,
  age         integer     not null check (age >= 1 and age <= 6),
  temperament_traits  text[]  default '{}' not null,
  effective_phrases   text    default '' not null,
  ineffective_phrases text    default '' not null,
  notes               text    default '' not null
);

-- user_key での検索を高速化
create index if not exists idx_children_user_key on children(user_key);

-- RLSを無効化（シンプルな個人用アプリ）
-- 本番では認証を追加してRLSを有効化することを推奨
alter table children disable row level security;

-- 各ロールへのアクセス権限を付与
grant usage on schema public to anon, authenticated, service_role;
grant all on public.children to anon;
grant all on public.children to authenticated;
grant all on public.children to service_role;
