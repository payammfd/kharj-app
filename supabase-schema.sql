-- ================================================
-- KHARJ APP - Supabase Schema
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Shared Plans (like a household budget group)
create table plans (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'خانه',
  invite_code text unique not null default upper(substring(replace(gen_random_uuid()::text,'-',''),1,8)),
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- 2. Plan Members (many-to-many users <-> plans)
create table plan_members (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  display_name text,
  joined_at timestamptz default now(),
  unique(plan_id, user_id)
);

-- 3. Transactions
create table transactions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  jy smallint not null,
  jm smallint not null,
  jd smallint not null,
  description text not null,
  amount bigint not null,
  type text not null check (type in ('income','expense')),
  category text not null,
  created_at timestamptz default now()
);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================

alter table plans enable row level security;
alter table plan_members enable row level security;
alter table transactions enable row level security;

-- Plans: only members can see
create policy "members see plan" on plans
  for select using (
    exists (select 1 from plan_members where plan_id = plans.id and user_id = auth.uid())
  );
create policy "creator insert plan" on plans
  for insert with check (created_by = auth.uid());
create policy "creator update plan" on plans
  for update using (created_by = auth.uid());

-- Plan members: members see other members
create policy "members see members" on plan_members
  for select using (
    exists (select 1 from plan_members pm2 where pm2.plan_id = plan_members.plan_id and pm2.user_id = auth.uid())
  );
create policy "anyone can join" on plan_members
  for insert with check (user_id = auth.uid());

-- Transactions: only plan members
create policy "members see transactions" on transactions
  for select using (
    exists (select 1 from plan_members where plan_id = transactions.plan_id and user_id = auth.uid())
  );
create policy "members insert transactions" on transactions
  for insert with check (
    user_id = auth.uid() and
    exists (select 1 from plan_members where plan_id = transactions.plan_id and user_id = auth.uid())
  );
create policy "owner delete transaction" on transactions
  for delete using (user_id = auth.uid());

-- ================================================
-- INDEXES
-- ================================================
create index on transactions(plan_id, jy, jm);
create index on plan_members(user_id);
create index on plan_members(plan_id);
