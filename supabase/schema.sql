-- =============================================================================
--  MISSION PLAN DE COMPÉTENCES — base de données Supabase
--  À coller en entier dans Supabase > SQL Editor > New query, puis « Run ».
--  Le script peut être relancé sans risque (il ne supprime pas les données).
--
--  ⚠️ AVANT DE LANCER : remplacez l'e-mail du professeur tout en bas du fichier.
-- =============================================================================

-- ---------------------------------------------------------------------------
--  TABLES
-- ---------------------------------------------------------------------------
create table if not exists public.teachers (
  email text primary key
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  members text[] not null default '{}',
  current_stage int not null default 1 check (current_stage between 1 and 5), -- 5 = parcours terminé
  created_at timestamptz not null default now()
);
create unique index if not exists teams_name_unique on public.teams (lower(name));

create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  team_creation_open boolean not null default true,
  max_stage int not null default 1 check (max_stage between 1 and 4),
  spotlight_team uuid references public.teams(id) on delete set null,
  spotlight_stage int check (spotlight_stage between 1 and 4),
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

create table if not exists public.submissions (
  team_id uuid not null references public.teams(id) on delete cascade,
  stage int not null check (stage between 1 and 4),
  data jsonb not null default '{}'::jsonb,
  status text not null default 'en_cours' check (status in ('en_cours', 'soumis', 'valide')),
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (team_id, stage)
);

create table if not exists public.quest_results (
  team_id uuid not null references public.teams(id) on delete cascade,
  stage int not null check (stage between 1 and 4),
  quest_id text not null,
  best_score int not null default 0,
  max_score int not null default 0,
  passed boolean not null default false,
  attempts int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (team_id, quest_id)
);

create table if not exists public.reviews (
  team_id uuid not null references public.teams(id) on delete cascade,
  stage int not null check (stage between 1 and 4),
  scores jsonb not null default '{}'::jsonb,
  grade numeric,
  feedback text,
  validated boolean not null default false,
  extra jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (team_id, stage)
);

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  team_id uuid not null references public.teams(id) on delete cascade,
  stage int not null check (stage between 0 and 4),
  author text not null check (author in ('prof', 'equipe')),
  author_name text,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists comments_team_idx on public.comments (team_id, created_at);

-- ---------------------------------------------------------------------------
--  SÉCURITÉ : RLS activé partout. Les élèves et le spectateur ne lisent ni
--  n'écrivent jamais directement dans les tables : tout passe par les fonctions
--  ci-dessous, qui vérifient le code d'équipe. Le professeur (connecté, e-mail
--  présent dans la table teachers) a un accès complet.
-- ---------------------------------------------------------------------------
alter table public.teachers      enable row level security;
alter table public.teams         enable row level security;
alter table public.settings      enable row level security;
alter table public.submissions   enable row level security;
alter table public.quest_results enable row level security;
alter table public.reviews       enable row level security;
alter table public.comments      enable row level security;

create or replace function public.is_teacher()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.teachers
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

do $$
declare t text;
begin
  foreach t in array array['teachers','teams','settings','submissions','quest_results','reviews','comments'] loop
    execute format('drop policy if exists teacher_all on public.%I', t);
    execute format('create policy teacher_all on public.%I for all to authenticated using (public.is_teacher()) with check (public.is_teacher())', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
--  FONCTIONS INTERNES
-- ---------------------------------------------------------------------------
create or replace function public._check_team(p_team uuid, p_code text, p_stage int default null)
returns public.teams language plpgsql stable security definer set search_path = public as $$
declare
  t public.teams;
  mx int;
begin
  select * into t from public.teams where id = p_team and code = upper(trim(coalesce(p_code, '')));
  if not found then
    raise exception 'Équipe introuvable ou code incorrect.';
  end if;
  if p_stage is not null then
    if p_stage < 1 or p_stage > 4 then raise exception 'Étape inconnue.'; end if;
    select max_stage into mx from public.settings where id = 1;
    if p_stage > t.current_stage then
      raise exception 'Cette étape est encore verrouillée : le professeur doit valider l''étape précédente.';
    end if;
    if p_stage > mx then
      raise exception 'Cette étape n''est pas encore ouverte par le professeur.';
    end if;
  end if;
  return t;
end $$;

create or replace function public._team_json(t public.teams, p_with_data boolean, p_teacher boolean)
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'team', json_build_object('id', t.id, 'name', t.name, 'code', t.code, 'members', t.members,
                              'current_stage', t.current_stage, 'created_at', t.created_at),
    'settings', (select json_build_object('max_stage', s.max_stage, 'team_creation_open', s.team_creation_open)
                 from public.settings s where s.id = 1),
    'submissions', coalesce((
      select json_agg(json_build_object('stage', x.stage, 'status', x.status, 'updated_at', x.updated_at,
                                        'submitted_at', x.submitted_at,
                                        'data', case when p_with_data then x.data else null end) order by x.stage)
      from public.submissions x where x.team_id = t.id), '[]'::json),
    'quests', coalesce((
      select json_agg(json_build_object('stage', q.stage, 'quest_id', q.quest_id, 'best_score', q.best_score,
                                        'max_score', q.max_score, 'passed', q.passed, 'attempts', q.attempts,
                                        'updated_at', q.updated_at))
      from public.quest_results q where q.team_id = t.id), '[]'::json),
    'reviews', coalesce((
      select json_agg(json_build_object('stage', r.stage, 'validated', r.validated, 'feedback', r.feedback,
                                        'grade', case when r.validated or p_teacher then r.grade end,
                                        'scores', case when r.validated or p_teacher then r.scores end,
                                        'extra', r.extra, 'updated_at', r.updated_at))
      from public.reviews r where r.team_id = t.id), '[]'::json),
    'comments', coalesce((
      select json_agg(json_build_object('id', c.id, 'stage', c.stage, 'author', c.author,
                                        'author_name', c.author_name, 'body', c.body, 'created_at', c.created_at)
                      order by c.created_at)
      from public.comments c where c.team_id = t.id), '[]'::json)
  );
$$;

-- ---------------------------------------------------------------------------
--  FONCTIONS « ÉQUIPE » (appelées sans compte, protégées par le code d'équipe)
-- ---------------------------------------------------------------------------
create or replace function public.create_team(p_name text, p_members text[])
returns json language plpgsql security definer set search_path = public as $$
declare
  v_name text := trim(coalesce(p_name, ''));
  v_code text;
  v_id uuid;
  v_members text[];
begin
  if not (select team_creation_open from public.settings where id = 1) then
    raise exception 'La création d''équipes est fermée. Demandez à votre professeur.';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 40 then
    raise exception 'Le nom d''équipe doit faire entre 2 et 40 caractères.';
  end if;
  if exists (select 1 from public.teams where lower(name) = lower(v_name)) then
    raise exception 'Ce nom d''équipe est déjà pris. Si c''est la vôtre, utilisez « Rejoindre ».';
  end if;
  if (select count(*) from public.teams) >= 80 then
    raise exception 'Nombre maximal d''équipes atteint.';
  end if;
  select coalesce(array_agg(left(trim(m), 40)), '{}') into v_members
  from unnest(coalesce(p_members, '{}')) as m where trim(m) <> '';
  if array_length(v_members, 1) > 8 then raise exception '8 membres maximum.'; end if;
  select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::int, 1), '')
    into v_code from generate_series(1, 6);
  insert into public.teams (name, code, members) values (v_name, v_code, v_members) returning id into v_id;
  return json_build_object('id', v_id, 'name', v_name, 'code', v_code);
end $$;

create or replace function public.join_team(p_name text, p_code text)
returns json language plpgsql stable security definer set search_path = public as $$
declare t public.teams;
begin
  select * into t from public.teams
  where lower(name) = lower(trim(coalesce(p_name, ''))) and code = upper(trim(coalesce(p_code, '')));
  if not found then raise exception 'Nom d''équipe ou code incorrect.'; end if;
  return json_build_object('id', t.id, 'name', t.name, 'code', t.code);
end $$;

create or replace function public.team_state(p_team uuid, p_code text, p_with_data boolean default true)
returns json language plpgsql stable security definer set search_path = public as $$
declare t public.teams;
begin
  t := public._check_team(p_team, p_code, null);
  return public._team_json(t, p_with_data, false);
end $$;

create or replace function public.save_submission(p_team uuid, p_code text, p_stage int, p_patch jsonb)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare
  st text;
  ts timestamptz := clock_timestamp();
begin
  perform public._check_team(p_team, p_code, p_stage);
  if p_patch is null or jsonb_typeof(p_patch) <> 'object' then raise exception 'Données invalides.'; end if;
  if pg_column_size(p_patch) > 300000 then raise exception 'Données trop volumineuses.'; end if;
  select status into st from public.submissions where team_id = p_team and stage = p_stage;
  if st in ('soumis', 'valide') then
    raise exception 'Étape soumise ou validée : modifications impossibles.';
  end if;
  insert into public.submissions (team_id, stage, data, updated_at)
  values (p_team, p_stage, p_patch, ts)
  on conflict (team_id, stage) do update
    set data = public.submissions.data || excluded.data, updated_at = ts;
  return ts;
end $$;

create or replace function public.save_quest(p_team uuid, p_code text, p_stage int, p_quest text,
                                             p_score int, p_max int, p_passed boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._check_team(p_team, p_code, p_stage);
  if char_length(coalesce(p_quest, '')) = 0 or char_length(p_quest) > 60 then raise exception 'Quête inconnue.'; end if;
  insert into public.quest_results (team_id, stage, quest_id, best_score, max_score, passed, attempts, updated_at)
  values (p_team, p_stage, p_quest, greatest(p_score, 0), greatest(p_max, 0), coalesce(p_passed, false), 1, now())
  on conflict (team_id, quest_id) do update set
    best_score = greatest(public.quest_results.best_score, excluded.best_score),
    max_score  = excluded.max_score,
    passed     = public.quest_results.passed or excluded.passed,
    attempts   = public.quest_results.attempts + 1,
    updated_at = now();
end $$;

create or replace function public.submit_stage(p_team uuid, p_code text, p_stage int)
returns void language plpgsql security definer set search_path = public as $$
declare st text;
begin
  perform public._check_team(p_team, p_code, p_stage);
  select status into st from public.submissions where team_id = p_team and stage = p_stage;
  if st = 'valide' then raise exception 'Cette étape est déjà validée.'; end if;
  insert into public.submissions (team_id, stage, status, submitted_at, updated_at)
  values (p_team, p_stage, 'soumis', now(), now())
  on conflict (team_id, stage) do update set status = 'soumis', submitted_at = now(), updated_at = now();
end $$;

create or replace function public.cancel_submission(p_team uuid, p_code text, p_stage int)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._check_team(p_team, p_code, p_stage);
  update public.submissions set status = 'en_cours', updated_at = now()
  where team_id = p_team and stage = p_stage and status = 'soumis';
end $$;

create or replace function public.post_comment(p_team uuid, p_code text, p_stage int, p_body text, p_author_name text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._check_team(p_team, p_code, null);
  if p_stage < 0 or p_stage > 4 then raise exception 'Étape inconnue.'; end if;
  if char_length(trim(coalesce(p_body, ''))) = 0 then raise exception 'Message vide.'; end if;
  if (select count(*) from public.comments where team_id = p_team and created_at > now() - interval '1 minute') >= 15 then
    raise exception 'Trop de messages, patientez une minute.';
  end if;
  insert into public.comments (team_id, stage, author, author_name, body)
  values (p_team, p_stage, 'equipe', left(trim(coalesce(p_author_name, '')), 40), left(trim(p_body), 2000));
end $$;

create or replace function public.update_members(p_team uuid, p_code text, p_members text[])
returns void language plpgsql security definer set search_path = public as $$
declare v_members text[];
begin
  perform public._check_team(p_team, p_code, null);
  select coalesce(array_agg(left(trim(m), 40)), '{}') into v_members
  from unnest(coalesce(p_members, '{}')) as m where trim(m) <> '';
  if array_length(v_members, 1) > 8 then raise exception '8 membres maximum.'; end if;
  update public.teams set members = v_members where id = p_team;
end $$;

-- ---------------------------------------------------------------------------
--  FONCTION « SPECTATEUR » (lecture seule, sans données sensibles)
-- ---------------------------------------------------------------------------
create or replace function public.public_overview()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object(
    'settings', (select json_build_object('max_stage', s.max_stage, 'team_creation_open', s.team_creation_open,
                                          'spotlight_team', s.spotlight_team, 'spotlight_stage', s.spotlight_stage)
                 from public.settings s where s.id = 1),
    'teams', coalesce((
      select json_agg(json_build_object(
        'id', t.id, 'name', t.name, 'members', t.members, 'current_stage', t.current_stage,
        'stages', coalesce((select json_agg(json_build_object('stage', x.stage, 'status', x.status))
                            from public.submissions x where x.team_id = t.id), '[]'::json),
        'quests', coalesce((select json_agg(q.quest_id) from public.quest_results q
                            where q.team_id = t.id and q.passed), '[]'::json)
      ) order by t.created_at)
      from public.teams t), '[]'::json),
    'spotlight', (
      select json_build_object('team_name', t.name, 'stage', s.spotlight_stage,
        'datas', coalesce((select json_object_agg(x.stage::text, x.data) from public.submissions x where x.team_id = t.id), '{}'::json))
      from public.settings s join public.teams t on t.id = s.spotlight_team
      where s.id = 1 and s.spotlight_stage is not null)
  );
$$;

-- ---------------------------------------------------------------------------
--  FONCTIONS « PROFESSEUR » (compte Supabase + e-mail dans la table teachers)
-- ---------------------------------------------------------------------------
create or replace function public._require_teacher()
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_teacher() then raise exception 'Accès réservé au professeur.'; end if;
end $$;

create or replace function public.am_i_teacher()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_teacher();
$$;

create or replace function public.teacher_overview()
returns json language plpgsql stable security definer set search_path = public as $$
begin
  perform public._require_teacher();
  return json_build_object(
    'settings', (select row_to_json(s) from public.settings s where s.id = 1),
    'teams', coalesce((
      select json_agg(json_build_object(
        'id', t.id, 'name', t.name, 'code', t.code, 'members', t.members,
        'current_stage', t.current_stage, 'created_at', t.created_at,
        'submissions', coalesce((select json_agg(json_build_object('stage', x.stage, 'status', x.status,
                                  'updated_at', x.updated_at, 'submitted_at', x.submitted_at))
                                 from public.submissions x where x.team_id = t.id), '[]'::json),
        'quests', coalesce((select json_agg(json_build_object('stage', q.stage, 'quest_id', q.quest_id,
                             'best_score', q.best_score, 'max_score', q.max_score, 'passed', q.passed,
                             'attempts', q.attempts, 'updated_at', q.updated_at))
                            from public.quest_results q where q.team_id = t.id), '[]'::json),
        'reviews', coalesce((select json_agg(json_build_object('stage', r.stage, 'grade', r.grade,
                              'validated', r.validated, 'extra', r.extra))
                             from public.reviews r where r.team_id = t.id), '[]'::json),
        'last_team_comment', (select max(c.created_at) from public.comments c where c.team_id = t.id and c.author = 'equipe'),
        'last_prof_comment', (select max(c.created_at) from public.comments c where c.team_id = t.id and c.author = 'prof')
      ) order by t.created_at)
      from public.teams t), '[]'::json)
  );
end $$;

create or replace function public.teacher_team(p_team uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare t public.teams;
begin
  perform public._require_teacher();
  select * into t from public.teams where id = p_team;
  if not found then raise exception 'Équipe introuvable.'; end if;
  return public._team_json(t, true, true);
end $$;

-- p_action : 'save' (enregistrer), 'validate' (valider + débloquer), 'return' (renvoyer à l'équipe)
create or replace function public.teacher_review(p_team uuid, p_stage int, p_scores jsonb, p_grade numeric,
                                                 p_feedback text, p_extra jsonb, p_action text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_teacher();
  if p_action not in ('save', 'validate', 'return') then raise exception 'Action inconnue.'; end if;
  insert into public.reviews (team_id, stage, scores, grade, feedback, extra, validated, updated_at)
  values (p_team, p_stage, coalesce(p_scores, '{}'), p_grade, p_feedback, coalesce(p_extra, '{}'),
          p_action = 'validate', now())
  on conflict (team_id, stage) do update set
    scores = excluded.scores, grade = excluded.grade, feedback = excluded.feedback, extra = excluded.extra,
    validated = case when p_action = 'save' then public.reviews.validated else p_action = 'validate' end,
    updated_at = now();
  if p_action = 'validate' then
    insert into public.submissions (team_id, stage, status, updated_at) values (p_team, p_stage, 'valide', now())
    on conflict (team_id, stage) do update set status = 'valide', updated_at = now();
    update public.teams set current_stage = greatest(current_stage, least(p_stage + 1, 5)) where id = p_team;
  elsif p_action = 'return' then
    update public.submissions set status = 'en_cours', updated_at = now() where team_id = p_team and stage = p_stage;
  end if;
end $$;

create or replace function public.teacher_set_stage(p_team uuid, p_stage int)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_teacher();
  if p_stage < 1 or p_stage > 5 then raise exception 'Étape inconnue.'; end if;
  update public.teams set current_stage = p_stage where id = p_team;
end $$;

create or replace function public.teacher_comment(p_team uuid, p_stage int, p_body text)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_teacher();
  if char_length(trim(coalesce(p_body, ''))) = 0 then raise exception 'Message vide.'; end if;
  insert into public.comments (team_id, stage, author, author_name, body)
  values (p_team, p_stage, 'prof', 'Professeur', left(trim(p_body), 2000));
end $$;

create or replace function public.teacher_update_settings(p_patch jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_teacher();
  update public.settings set
    team_creation_open = case when p_patch ? 'team_creation_open' then (p_patch ->> 'team_creation_open')::boolean else team_creation_open end,
    max_stage          = case when p_patch ? 'max_stage' then (p_patch ->> 'max_stage')::int else max_stage end,
    spotlight_team     = case when p_patch ? 'spotlight_team' then nullif(p_patch ->> 'spotlight_team', '')::uuid else spotlight_team end,
    spotlight_stage    = case when p_patch ? 'spotlight_stage' then nullif(p_patch ->> 'spotlight_stage', '')::int else spotlight_stage end,
    updated_at = now()
  where id = 1;
end $$;

-- Réinitialise une équipe (toutes les étapes si p_stage est null)
create or replace function public.teacher_reset_team(p_team uuid, p_stage int default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_teacher();
  if p_stage is null then
    delete from public.submissions   where team_id = p_team;
    delete from public.quest_results where team_id = p_team;
    delete from public.reviews       where team_id = p_team;
    delete from public.comments      where team_id = p_team;
    update public.teams set current_stage = 1 where id = p_team;
  else
    delete from public.submissions   where team_id = p_team and stage = p_stage;
    delete from public.quest_results where team_id = p_team and stage = p_stage;
    delete from public.reviews       where team_id = p_team and stage = p_stage;
    delete from public.comments      where team_id = p_team and stage = p_stage;
    update public.teams set current_stage = least(current_stage, p_stage) where id = p_team;
  end if;
end $$;

create or replace function public.teacher_delete_team(p_team uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_teacher();
  delete from public.teams where id = p_team;
end $$;

-- Efface toute la progression mais garde les équipes
create or replace function public.teacher_reset_progress()
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_teacher();
  delete from public.submissions   where team_id is not null;
  delete from public.quest_results where team_id is not null;
  delete from public.reviews       where team_id is not null;
  delete from public.comments      where id is not null;
  update public.teams set current_stage = 1 where id is not null;
  update public.settings set max_stage = 1, spotlight_team = null, spotlight_stage = null, updated_at = now() where id = 1;
end $$;

-- Supprime TOUT : équipes et progression (remise à zéro complète)
create or replace function public.teacher_delete_all()
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public._require_teacher();
  update public.settings set spotlight_team = null, spotlight_stage = null where id = 1;
  delete from public.teams where id is not null;
  update public.settings set team_creation_open = true, max_stage = 1, updated_at = now() where id = 1;
end $$;

-- ---------------------------------------------------------------------------
--  DROITS D'EXÉCUTION
-- ---------------------------------------------------------------------------
revoke execute on function public._check_team(uuid, text, int) from public, anon, authenticated;
revoke execute on function public._team_json(public.teams, boolean, boolean) from public, anon, authenticated;
revoke execute on function public._require_teacher() from public, anon, authenticated;

grant execute on function public.create_team(text, text[]) to anon, authenticated;
grant execute on function public.join_team(text, text) to anon, authenticated;
grant execute on function public.team_state(uuid, text, boolean) to anon, authenticated;
grant execute on function public.save_submission(uuid, text, int, jsonb) to anon, authenticated;
grant execute on function public.save_quest(uuid, text, int, text, int, int, boolean) to anon, authenticated;
grant execute on function public.submit_stage(uuid, text, int) to anon, authenticated;
grant execute on function public.cancel_submission(uuid, text, int) to anon, authenticated;
grant execute on function public.post_comment(uuid, text, int, text, text) to anon, authenticated;
grant execute on function public.update_members(uuid, text, text[]) to anon, authenticated;
grant execute on function public.public_overview() to anon, authenticated;
grant execute on function public.am_i_teacher() to anon, authenticated;

-- ---------------------------------------------------------------------------
--  ⚠️ COMPTE PROFESSEUR : remplacez l'adresse ci-dessous par celle du compte
--  créé dans Authentication > Users (vous pouvez en ajouter plusieurs).
-- ---------------------------------------------------------------------------
insert into public.teachers (email) values ('williamgraffin1@gmail.com') on conflict do nothing;
