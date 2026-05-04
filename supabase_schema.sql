-- ============================================================
-- PostGIS 有効化
-- ============================================================
create extension if not exists postgis;


-- ============================================================
-- ENUM 型
-- ============================================================
create type user_type_enum as enum ('individual', 'corporate');
create type user_role_enum as enum ('user', 'admin');
create type registration_type_enum as enum ('unregistered', 'free', 'paid');
create type plan_status_enum as enum ('active', 'cancelled', 'past_due');
create type inquiry_status_enum as enum ('pending', 'contacted', 'closed');
create type fee_status_enum as enum ('pending', 'paid');


-- ============================================================
-- users
-- ============================================================
create table users (
  id            uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  name          text,
  email         text unique not null,
  phone         text,
  age           int,
  gender        text,
  prefecture    text,
  city          text,
  occupation    text,
  user_type     user_type_enum,
  role          user_role_enum not null default 'user',
  created_at    timestamptz not null default now()
);


-- ============================================================
-- finance_companies
-- ============================================================
create table finance_companies (
  id                  uuid primary key default gen_random_uuid(),
  clerk_user_id       text unique not null,
  name                text not null,
  area_code           text,
  lat                 double precision,
  lng                 double precision,
  description         text,
  registration_type   registration_type_enum not null default 'unregistered',
  is_active           boolean not null default true,
  show_reviews        boolean not null default true,
  created_at          timestamptz not null default now()
);

create index finance_companies_location_idx
  on finance_companies using gist(
    cast(st_makepoint(lng, lat) as geography)
  )
  where lat is not null and lng is not null;


-- ============================================================
-- company_categories
-- ============================================================
create table company_categories (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references finance_companies(id) on delete cascade,
  category    text not null
);

create index company_categories_company_idx on company_categories(company_id);


-- ============================================================
-- company_plans
-- ============================================================
create table company_plans (
  id                      uuid primary key default gen_random_uuid(),
  company_id              uuid not null references finance_companies(id) on delete cascade,
  stripe_subscription_id  text,
  plan_type               text not null,
  status                  plan_status_enum not null default 'active',
  started_at              timestamptz not null default now(),
  cancelled_at            timestamptz
);

create index company_plans_company_idx on company_plans(company_id);


-- ============================================================
-- inquiries
-- ============================================================
create table inquiries (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references finance_companies(id) on delete cascade,
  user_id       uuid not null references users(id) on delete cascade,
  status        inquiry_status_enum not null default 'pending',
  message       text,
  is_duplicate  boolean not null default false,
  created_at    timestamptz not null default now()
);

create index inquiries_company_idx on inquiries(company_id);
create index inquiries_user_idx    on inquiries(user_id);


-- ============================================================
-- inquiry_fees
-- ============================================================
create table inquiry_fees (
  id                uuid primary key default gen_random_uuid(),
  inquiry_id        uuid not null references inquiries(id) on delete cascade,
  amount            int not null default 5000,
  stripe_invoice_id text,
  status            fee_status_enum not null default 'pending',
  paid_at           timestamptz
);

create index inquiry_fees_inquiry_idx on inquiry_fees(inquiry_id);


-- ============================================================
-- reviews
-- ============================================================
create table reviews (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references finance_companies(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  comment     text,
  is_visible  boolean not null default true,
  created_at  timestamptz not null default now()
);

create index reviews_company_idx on reviews(company_id);
create index reviews_user_idx    on reviews(user_id);


-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table users               enable row level security;
alter table finance_companies   enable row level security;
alter table company_categories  enable row level security;
alter table company_plans       enable row level security;
alter table inquiries           enable row level security;
alter table inquiry_fees        enable row level security;
alter table reviews             enable row level security;

-- users: 本人のみ自分のレコードを操作可
create policy "users: own"
  on users for all
  using  (auth.uid()::text = clerk_user_id)
  with check (auth.uid()::text = clerk_user_id);

-- finance_companies: 全員閲覧 / 本人のみ編集
create policy "finance_companies: public read"
  on finance_companies for select using (true);

create policy "finance_companies: own write"
  on finance_companies for all
  using  (auth.uid()::text = clerk_user_id)
  with check (auth.uid()::text = clerk_user_id);

-- company_categories: 全員閲覧 / 会社オーナーのみ編集
create policy "company_categories: public read"
  on company_categories for select using (true);

create policy "company_categories: own write"
  on company_categories for all
  using (
    exists (
      select 1 from finance_companies fc
      where fc.id = company_categories.company_id
        and fc.clerk_user_id = auth.uid()::text
    )
  );

-- company_plans: 会社オーナーのみ
create policy "company_plans: own"
  on company_plans for all
  using (
    exists (
      select 1 from finance_companies fc
      where fc.id = company_plans.company_id
        and fc.clerk_user_id = auth.uid()::text
    )
  );

-- inquiries: 該当ユーザーまたは会社オーナーのみ
create policy "inquiries: parties"
  on inquiries for all
  using (
    auth.uid()::text = (select clerk_user_id from users where id = inquiries.user_id)
    or
    auth.uid()::text = (select clerk_user_id from finance_companies where id = inquiries.company_id)
  );

-- inquiry_fees: 紐づくinquiryの当事者のみ
create policy "inquiry_fees: parties"
  on inquiry_fees for all
  using (
    exists (
      select 1 from inquiries i
      join users u on u.id = i.user_id
      join finance_companies fc on fc.id = i.company_id
      where i.id = inquiry_fees.inquiry_id
        and (u.clerk_user_id = auth.uid()::text or fc.clerk_user_id = auth.uid()::text)
    )
  );

-- reviews: is_visible=true は全員閲覧 / 投稿者のみ作成
create policy "reviews: public read"
  on reviews for select
  using (is_visible = true);

create policy "reviews: own write"
  on reviews for insert
  with check (
    auth.uid()::text = (select clerk_user_id from users where id = reviews.user_id)
  );
