


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'user'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."assign_pdo_no"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.pdo_no is null or btrim(new.pdo_no) = '' then
    new.pdo_no = public.generate_pdo_no();
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."assign_pdo_no"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."assign_pi_no"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.pi_no is null or btrim(new.pi_no) = '' then
    new.pi_no = public.generate_pi_no();
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."assign_pi_no"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_item_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  next_num bigint;
begin
  if new.item_code is null or btrim(new.item_code) = '' then
    next_num := nextval('public.item_code_seq');
    new.item_code := 'ITM-' || lpad(next_num::text, 5, '0');
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."generate_item_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_item_master_code"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $_$
declare
  next_number integer;
  new_code text;
begin
  select coalesce(
    max(
      case
        when item_code ~ '^ITM-[0-9]+$'
        then substring(item_code from 5)::integer
        else null
      end
    ), 0
  ) + 1
  into next_number
  from public.item_master;

  new_code := 'ITM-' || lpad(next_number::text, 4, '0');
  return new_code;
end;
$_$;


ALTER FUNCTION "public"."generate_item_master_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_pdo_no"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare
  next_no integer;
begin
  select coalesce(max((regexp_replace(pdo_no, '\\D', '', 'g'))::integer), 0) + 1
  into next_no
  from public.pdo
  where pdo_no ~ '\\d';

  return 'PDO-' || lpad(next_no::text, 5, '0');
exception
  when others then
    return 'PDO-' || to_char(now(), 'YYYYMMDDHH24MISS');
end;
$$;


ALTER FUNCTION "public"."generate_pdo_no"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_pi_from_pdo"("p_pdo_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_pdo record;
  v_customer_id uuid;
  v_pi_id uuid;
begin
  select p.*, bc.customer_id
  into v_pdo
  from public.pdo p
  join public.brand_customers bc on bc.id = p.brand_customer_id
  where p.id = p_pdo_id;

  if not found then
    raise exception 'PDO not found';
  end if;

  select id into v_pi_id
  from public.pi
  where pdo_id = p_pdo_id;

  if v_pi_id is not null then
    return v_pi_id;
  end if;

  insert into public.pi (
    pdo_id,
    customer_id,
    brand_customer_id,
    issue_date,
    currency,
    status,
    notes,
    created_by
  ) values (
    v_pdo.id,
    v_pdo.customer_id,
    v_pdo.brand_customer_id,
    current_date,
    'AED',
    'draft',
    'Generated from ' || v_pdo.pdo_no,
    v_pdo.created_by
  )
  returning id into v_pi_id;

  insert into public.pi_lines (
    pi_id,
    item_id,
    description,
    qty,
    unit,
    unit_price
  ) values (
    v_pi_id,
    v_pdo.item_id,
    'Generated from ' || v_pdo.pdo_no,
    v_pdo.qty,
    v_pdo.unit,
    0
  );

  update public.pi
  set total_amount = (
    select coalesce(sum(line_total), 0)
    from public.pi_lines
    where pi_id = v_pi_id
  )
  where id = v_pi_id;

  update public.pdo
  set status = 'converted_to_pi'
  where id = p_pdo_id;

  return v_pi_id;
end;
$$;


ALTER FUNCTION "public"."generate_pi_from_pdo"("p_pdo_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_pi_no"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
declare
  next_no integer;
begin
  select coalesce(max((regexp_replace(pi_no, '\\D', '', 'g'))::integer), 0) + 1
  into next_no
  from public.pi
  where pi_no ~ '\\d';

  return 'PI-' || lpad(next_no::text, 5, '0');
exception
  when others then
    return 'PI-' || to_char(now(), 'YYYYMMDDHH24MISS');
end;
$$;


ALTER FUNCTION "public"."generate_pi_no"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles (id, full_name, email, role, is_active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'user'),
    true
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_active_user"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_active = true
  );
$$;


ALTER FUNCTION "public"."is_active_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_app_user_roles_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_app_user_roles_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_formula_headers_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_formula_headers_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_packing_store_stock_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_packing_store_stock_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_customer_brands_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if new.brand_symbol is not null and (new.brand_code is null or trim(new.brand_code) = '') then
    new.brand_code := new.brand_symbol;
  end if;

  if new.brand_code is not null and (new.brand_symbol is null or trim(new.brand_symbol) = '') then
    new.brand_symbol := new.brand_code;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."sync_customer_brands_fields"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."app_user_roles" (
    "id" bigint NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" NOT NULL,
    "can_delete" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "app_user_roles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'editor'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."app_user_roles" OWNER TO "postgres";


ALTER TABLE "public"."app_user_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."app_user_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."brand_customer" (
    "id" bigint NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "brand_symbol" "text" NOT NULL,
    "customer_brand" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."brand_customer" OWNER TO "postgres";


ALTER TABLE "public"."brand_customer" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."brand_customer_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."brand_customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "bc_code" "text",
    "brand_id" "uuid" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "notes" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "customer_brand_symbol" "text"
);


ALTER TABLE "public"."brand_customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brands" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "brand_code" "text",
    "brand_name" "text" NOT NULL,
    "notes" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "brand_symbol" "text",
    "sort_order" integer
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_brands" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "brand_code" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "brand_symbol" "text",
    "customer_brand" "text"
);


ALTER TABLE "public"."customer_brands" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_items" (
    "id" bigint NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "customer_brand_id" bigint NOT NULL,
    "item_id" "uuid" NOT NULL,
    "sub_brand" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "description" "text"
);


ALTER TABLE "public"."customer_items" OWNER TO "postgres";


ALTER TABLE "public"."customer_items" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."customer_items_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_code" "text",
    "customer_symbol" "text",
    "customer_name" "text",
    "address" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text",
    "city" "text",
    "contact_person" "text",
    "phone" "text",
    "email" "text",
    "country" "text",
    "status" "text"
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."formula_headers" (
    "id" bigint NOT NULL,
    "customer_id" "text" NOT NULL,
    "customer_code" "text",
    "customer_symbol" "text",
    "customer_name" "text",
    "customer_brand_id" "text" NOT NULL,
    "brand_symbol" "text",
    "customer_brand" "text",
    "item_id" "text" NOT NULL,
    "item_code" "text",
    "item_name" "text",
    "tbn" numeric(18,6),
    "density" numeric(18,6),
    "loss_pct" numeric(18,6) DEFAULT 0 NOT NULL,
    "rm_loss_pct" numeric(18,6) DEFAULT 0 NOT NULL,
    "fix_margin" numeric(18,6) DEFAULT 0 NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "total_qty" numeric(18,6) DEFAULT 0 NOT NULL,
    "total_effective_qty" numeric(18,6) DEFAULT 0 NOT NULL,
    "raw_cost" numeric(18,6) DEFAULT 0 NOT NULL,
    "total_cost_with_loss" numeric(18,6) DEFAULT 0 NOT NULL,
    "sell_total" numeric(18,6) DEFAULT 0 NOT NULL,
    "cost_per_kg" numeric(18,6) DEFAULT 0 NOT NULL,
    "cost_per_lit" numeric(18,6) DEFAULT 0 NOT NULL,
    "sell_per_kg" numeric(18,6) DEFAULT 0 NOT NULL,
    "sell_per_lit" numeric(18,6) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "version_date" "date",
    "sub_brand" "text",
    "formula_code_generated" "text",
    "note" "text"
);


ALTER TABLE "public"."formula_headers" OWNER TO "postgres";


ALTER TABLE "public"."formula_headers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."formula_headers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."formula_lines" (
    "id" bigint NOT NULL,
    "formula_id" bigint NOT NULL,
    "rm_id" "text" NOT NULL,
    "rm_code" "text",
    "rm_name" "text",
    "unit" "text" DEFAULT 'Wt%'::"text" NOT NULL,
    "wt_pct" numeric(18,6) DEFAULT 0 NOT NULL,
    "qty_kg" numeric(18,6) DEFAULT 0 NOT NULL,
    "rm_price" numeric(18,6) DEFAULT 0 NOT NULL,
    "effective_qty_kg" numeric(18,6) DEFAULT 0 NOT NULL,
    "line_cost" numeric(18,6) DEFAULT 0 NOT NULL,
    "sort_order" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."formula_lines" OWNER TO "postgres";


ALTER TABLE "public"."formula_lines" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."formula_lines_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."formulas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_id" "uuid" NOT NULL,
    "version_no" integer DEFAULT 1 NOT NULL,
    "notes" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "approved_by" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."formulas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoice_definitions" (
    "id" bigint NOT NULL,
    "category" "text" NOT NULL,
    "value" "text" NOT NULL,
    "sort_order" integer DEFAULT 1 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."invoice_definitions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."invoice_definitions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."invoice_definitions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."invoice_definitions_id_seq" OWNED BY "public"."invoice_definitions"."id";



CREATE TABLE IF NOT EXISTS "public"."invoice_headers" (
    "id" bigint NOT NULL,
    "invoice_ref" "text" NOT NULL,
    "invoice_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "pdo_header_id" bigint,
    "customer_id" "uuid",
    "currency" "text",
    "price_as" "text",
    "payment" "text",
    "shipping" "text",
    "port_of_loading" "text",
    "order_cancelation" "text",
    "delivery" "text",
    "packaging" "text",
    "brand" "text",
    "manufacturer" "text",
    "country_of_origin" "text",
    "others" "text",
    "hs_code" "text",
    "bank_details" "text",
    "fixed_profit_pct" numeric DEFAULT 0,
    "extra_profit_pct" numeric DEFAULT 0,
    "total_usd" numeric DEFAULT 0,
    "amount_in_words" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."invoice_headers" OWNER TO "postgres";


ALTER TABLE "public"."invoice_headers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."invoice_headers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."invoice_lines" (
    "id" bigint NOT NULL,
    "invoice_header_id" bigint,
    "line_no" integer,
    "item_name" "text",
    "description" "text",
    "unit" "text",
    "packing" "text",
    "qty" numeric DEFAULT 0,
    "tax" "text",
    "tax_value" "text",
    "unit_usd" numeric DEFAULT 0,
    "total_usd" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."invoice_lines" OWNER TO "postgres";


ALTER TABLE "public"."invoice_lines" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."invoice_lines_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."item_brands" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_id" "uuid" NOT NULL,
    "brand_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."item_brands" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."item_code_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."item_code_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."item_master" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_code" "text" NOT NULL,
    "item_name" "text" NOT NULL,
    "density" numeric(10,4),
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "sort_order" integer,
    CONSTRAINT "item_master_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."item_master" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."item_packaging_lines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_id" "uuid" NOT NULL,
    "packaging_material_id" "uuid" NOT NULL,
    "qty" numeric(18,4) DEFAULT 1 NOT NULL,
    "unit" "text" DEFAULT 'pcs'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."item_packaging_lines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_code" "text",
    "item_name" "text" NOT NULL,
    "brand_customer_id" "uuid" NOT NULL,
    "pack_size" "text",
    "unit" "text" DEFAULT 'pcs'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "notes" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "customer_id" "uuid",
    "customer_brand" "text"
);


ALTER TABLE "public"."items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."packaging_definitions" (
    "id" bigint NOT NULL,
    "category" "text" NOT NULL,
    "value" "text" NOT NULL,
    "sort_order" integer DEFAULT 1 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."packaging_definitions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."packaging_definitions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."packaging_definitions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."packaging_definitions_id_seq" OWNED BY "public"."packaging_definitions"."id";



CREATE TABLE IF NOT EXISTS "public"."packaging_materials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pm_code" "text",
    "pm_name" "text" NOT NULL,
    "pm_type" "text",
    "unit" "text" DEFAULT 'pcs'::"text" NOT NULL,
    "cost" numeric(18,4) DEFAULT 0 NOT NULL,
    "notes" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."packaging_materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."packing_brand" (
    "id" bigint NOT NULL,
    "brand_symbol" "text" NOT NULL,
    "packing" "text" NOT NULL,
    "can_color" "text",
    "carton_color" "text",
    "pack_per_pallet" numeric(14,2),
    "packing_empty_weight" numeric(14,3),
    "packing_price" numeric(14,4),
    "sort_order" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."packing_brand" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."packing_brand_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."packing_brand_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."packing_brand_id_seq" OWNED BY "public"."packing_brand"."id";



CREATE TABLE IF NOT EXISTS "public"."packing_master" (
    "id" bigint NOT NULL,
    "pack_count" "text",
    "pack_size" "text",
    "pm_unit" "text",
    "packing" "text",
    "pack_type" "text",
    "can_color" "text",
    "carton_color" "text",
    "pack_per_pallet" numeric,
    "packing_empty_weight" numeric,
    "packing_price" numeric,
    "sort_order" integer DEFAULT 1,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."packing_master" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."packing_master_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."packing_master_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."packing_master_id_seq" OWNED BY "public"."packing_master"."id";



CREATE TABLE IF NOT EXISTS "public"."packing_store_stock" (
    "id" bigint NOT NULL,
    "stock_key" "text" NOT NULL,
    "stock_type" "text" NOT NULL,
    "packing_name" "text" NOT NULL,
    "brand_symbol" "text",
    "packing_brand_id" bigint,
    "item_id" bigint,
    "store_qty" numeric(18,3) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "packing_store_stock_stock_type_check" CHECK (("stock_type" = ANY (ARRAY['can'::"text", 'carton'::"text", 'sticker'::"text"])))
);


ALTER TABLE "public"."packing_store_stock" OWNER TO "postgres";


ALTER TABLE "public"."packing_store_stock" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."packing_store_stock_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."pallet_data" (
    "id" bigint NOT NULL,
    "pallet_weight" numeric(12,3),
    "pallet_size" "text",
    "pallet_high" numeric(12,3),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pallet_data" OWNER TO "postgres";


ALTER TABLE "public"."pallet_data" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."pallet_data_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."pdo" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pdo_no" "text" NOT NULL,
    "pdo_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "brand_customer_id" "uuid" NOT NULL,
    "item_id" "uuid" NOT NULL,
    "qty" numeric(18,4) NOT NULL,
    "unit" "text" DEFAULT 'pcs'::"text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "remarks" "text",
    "created_by" "uuid" NOT NULL,
    "approved_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pdo" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pdo_headers" (
    "id" bigint NOT NULL,
    "pdo_no" "text" NOT NULL,
    "pdo_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'draft'::"text",
    "version_no" integer DEFAULT 1,
    "parent_order_id" bigint,
    "is_final" boolean DEFAULT false,
    "confirmed_at" timestamp with time zone,
    "created_from_order_id" bigint
);


ALTER TABLE "public"."pdo_headers" OWNER TO "postgres";


ALTER TABLE "public"."pdo_headers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."pdo_headers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."pdo_lines" (
    "id" bigint NOT NULL,
    "pdo_header_id" bigint NOT NULL,
    "line_no" integer DEFAULT 1 NOT NULL,
    "brand_symbol" "text" NOT NULL,
    "item_id" "uuid",
    "item_name" "text" NOT NULL,
    "density" numeric(12,6) DEFAULT 0 NOT NULL,
    "packing_brand_id" bigint,
    "packing" "text" NOT NULL,
    "qty" numeric(12,3) DEFAULT 0 NOT NULL,
    "total_lit" numeric(14,4) DEFAULT 0 NOT NULL,
    "total_kg" numeric(14,4) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pdo_lines" OWNER TO "postgres";


ALTER TABLE "public"."pdo_lines" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."pdo_lines_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."pi" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pi_no" "text" NOT NULL,
    "pdo_id" "uuid",
    "customer_id" "uuid" NOT NULL,
    "brand_customer_id" "uuid" NOT NULL,
    "issue_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "currency" "text" DEFAULT 'AED'::"text" NOT NULL,
    "total_amount" numeric(18,2) DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "notes" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pi" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pi_lines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pi_id" "uuid" NOT NULL,
    "item_id" "uuid",
    "description" "text" NOT NULL,
    "qty" numeric(18,4) DEFAULT 1 NOT NULL,
    "unit" "text" DEFAULT 'pcs'::"text" NOT NULL,
    "unit_price" numeric(18,4) DEFAULT 0 NOT NULL,
    "line_total" numeric(18,2) GENERATED ALWAYS AS (("qty" * "unit_price")) STORED,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pi_lines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pm" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pm_code" "text",
    "pm_name" "text" NOT NULL,
    "pm_category" "text",
    "unit" "text",
    "status" "text" DEFAULT 'active'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pm" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pm_packaging_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type_code" "text",
    "type_name" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'active'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pm_packaging_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pm_setup" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "pm_code" "text",
    "pm_name" "text" NOT NULL,
    "pm_category" "text",
    "unit" "text",
    "status" "text" DEFAULT 'active'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pm_setup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pm_sizes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "size_code" "text",
    "size_name" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'active'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pm_sizes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pm_unit_counts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "count_code" "text",
    "count_value" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'active'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pm_unit_counts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pm_uom" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "uom_code" "text",
    "uom_name" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'active'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pm_uom" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."price_offer_headers" (
    "id" bigint NOT NULL,
    "offer_ref" "text",
    "offer_date" "date" DEFAULT CURRENT_DATE,
    "pdo_header_id" bigint,
    "customer_id" bigint,
    "currency" "text",
    "price_as" "text",
    "payment" "text",
    "shipping" "text",
    "port_of_loading" "text",
    "delivery" "text",
    "packaging" "text",
    "brand" "text",
    "manufacturer" "text",
    "country_of_origin" "text",
    "others" "text",
    "hs_code" "text",
    "bank_details" "text",
    "fixed_profit_pct" numeric DEFAULT 0,
    "extra_profit_pct" numeric DEFAULT 0,
    "freight_charges" numeric DEFAULT 0,
    "discount_amount" numeric DEFAULT 0,
    "total_amount" numeric DEFAULT 0,
    "amount_in_words" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."price_offer_headers" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."price_offer_headers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."price_offer_headers_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."price_offer_headers_id_seq" OWNED BY "public"."price_offer_headers"."id";



CREATE TABLE IF NOT EXISTS "public"."price_offer_lines" (
    "id" bigint NOT NULL,
    "price_offer_header_id" bigint,
    "line_no" integer,
    "item_name" "text",
    "description" "text",
    "unit" "text",
    "packing" "text",
    "qty" numeric DEFAULT 0,
    "tax" "text",
    "tax_value" "text",
    "unit_price" numeric DEFAULT 0,
    "total_price" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."price_offer_lines" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."price_offer_lines_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."price_offer_lines_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."price_offer_lines_id_seq" OWNED BY "public"."price_offer_lines"."id";



CREATE TABLE IF NOT EXISTS "public"."production_headers" (
    "id" bigint NOT NULL,
    "pdo_header_id" bigint,
    "production_no" "text",
    "production_date" "date" DEFAULT CURRENT_DATE,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."production_headers" OWNER TO "postgres";


ALTER TABLE "public"."production_headers" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."production_headers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."production_lines" (
    "id" bigint NOT NULL,
    "production_header_id" bigint,
    "pdo_line_id" bigint,
    "line_no" integer,
    "brand_symbol" "text",
    "item_id" bigint,
    "item_name" "text",
    "density" numeric DEFAULT 0,
    "packing_brand_id" bigint,
    "packing" "text",
    "order_qty" numeric DEFAULT 0,
    "production_qty" numeric DEFAULT 0,
    "total_lit" numeric DEFAULT 0,
    "total_kg" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."production_lines" OWNER TO "postgres";


ALTER TABLE "public"."production_lines" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."production_lines_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."production_order_headers" (
    "id" bigint NOT NULL,
    "production_ref" "text",
    "production_date" "date" DEFAULT CURRENT_DATE,
    "pdo_header_id" "text",
    "customer_id" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."production_order_headers" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."production_order_headers_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."production_order_headers_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."production_order_headers_id_seq" OWNED BY "public"."production_order_headers"."id";



CREATE TABLE IF NOT EXISTS "public"."production_order_lines" (
    "id" bigint NOT NULL,
    "production_order_header_id" bigint,
    "pdo_line_id" "text",
    "line_no" integer,
    "brand_symbol" "text",
    "item_id" "text",
    "item_name" "text",
    "density" numeric DEFAULT 0,
    "packing_brand_id" "text",
    "packing" "text",
    "order_qty" numeric DEFAULT 0,
    "produced_qty" numeric DEFAULT 0,
    "total_lit" numeric DEFAULT 0,
    "total_kg" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."production_order_lines" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."production_order_lines_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."production_order_lines_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."production_order_lines_id_seq" OWNED BY "public"."production_order_lines"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "role" "public"."app_role" DEFAULT 'user'::"public"."app_role" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."raw_materials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "rm_code" "text",
    "rm_name" "text" NOT NULL,
    "category" "text",
    "unit" "text" DEFAULT 'kg'::"text" NOT NULL,
    "cost" numeric(18,4) DEFAULT 0 NOT NULL,
    "notes" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."raw_materials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rm" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "rm_code" "text",
    "rm_name" "text" NOT NULL,
    "rm_category" "text",
    "unit" "text",
    "status" "text" DEFAULT 'active'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "density" numeric,
    "tally_price" numeric,
    "tally_date" "date",
    "market_price" numeric,
    "market_entry_date" "date",
    "sort_order" integer DEFAULT 0
);


ALTER TABLE "public"."rm" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_roles_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'user'::"text"])))
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_customer_items" AS
 SELECT "ci"."id",
    "ci"."customer_id",
    "ci"."customer_brand_id",
    "ci"."item_id",
    "ci"."sub_brand",
    "ci"."description",
    "c"."customer_code",
    "c"."customer_symbol",
    "bc"."customer_brand",
    "im"."item_name" AS "item"
   FROM ((("public"."customer_items" "ci"
     LEFT JOIN "public"."customers" "c" ON (("c"."id" = "ci"."customer_id")))
     LEFT JOIN "public"."brand_customer" "bc" ON (("bc"."id" = "ci"."customer_brand_id")))
     LEFT JOIN "public"."item_master" "im" ON (("im"."id" = "ci"."item_id")));


ALTER VIEW "public"."v_customer_items" OWNER TO "postgres";


ALTER TABLE ONLY "public"."invoice_definitions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."invoice_definitions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."packaging_definitions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."packaging_definitions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."packing_brand" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."packing_brand_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."packing_master" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."packing_master_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."price_offer_headers" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."price_offer_headers_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."price_offer_lines" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."price_offer_lines_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."production_order_headers" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."production_order_headers_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."production_order_lines" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."production_order_lines_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."app_user_roles"
    ADD CONSTRAINT "app_user_roles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."app_user_roles"
    ADD CONSTRAINT "app_user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brand_customer"
    ADD CONSTRAINT "brand_customer_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brand_customers"
    ADD CONSTRAINT "brand_customers_bc_code_key" UNIQUE ("bc_code");



ALTER TABLE ONLY "public"."brand_customers"
    ADD CONSTRAINT "brand_customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_brand_code_key" UNIQUE ("brand_code");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_brands"
    ADD CONSTRAINT "customer_brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_items"
    ADD CONSTRAINT "customer_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."formula_headers"
    ADD CONSTRAINT "formula_headers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."formula_lines"
    ADD CONSTRAINT "formula_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."formulas"
    ADD CONSTRAINT "formulas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_definitions"
    ADD CONSTRAINT "invoice_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_headers"
    ADD CONSTRAINT "invoice_headers_invoice_ref_key" UNIQUE ("invoice_ref");



ALTER TABLE ONLY "public"."invoice_headers"
    ADD CONSTRAINT "invoice_headers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoice_lines"
    ADD CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."item_brands"
    ADD CONSTRAINT "item_brands_item_id_brand_id_key" UNIQUE ("item_id", "brand_id");



ALTER TABLE ONLY "public"."item_brands"
    ADD CONSTRAINT "item_brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."item_master"
    ADD CONSTRAINT "item_master_item_code_key" UNIQUE ("item_code");



ALTER TABLE ONLY "public"."item_master"
    ADD CONSTRAINT "item_master_item_name_key" UNIQUE ("item_name");



ALTER TABLE ONLY "public"."item_master"
    ADD CONSTRAINT "item_master_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."item_packaging_lines"
    ADD CONSTRAINT "item_packaging_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_item_code_key" UNIQUE ("item_code");



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."packaging_definitions"
    ADD CONSTRAINT "packaging_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."packaging_materials"
    ADD CONSTRAINT "packaging_materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."packaging_materials"
    ADD CONSTRAINT "packaging_materials_pm_code_key" UNIQUE ("pm_code");



ALTER TABLE ONLY "public"."packing_brand"
    ADD CONSTRAINT "packing_brand_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."packing_master"
    ADD CONSTRAINT "packing_master_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."packing_store_stock"
    ADD CONSTRAINT "packing_store_stock_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pallet_data"
    ADD CONSTRAINT "pallet_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pdo_headers"
    ADD CONSTRAINT "pdo_headers_pdo_no_key" UNIQUE ("pdo_no");



ALTER TABLE ONLY "public"."pdo_headers"
    ADD CONSTRAINT "pdo_headers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pdo_lines"
    ADD CONSTRAINT "pdo_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pdo"
    ADD CONSTRAINT "pdo_pdo_no_key" UNIQUE ("pdo_no");



ALTER TABLE ONLY "public"."pdo"
    ADD CONSTRAINT "pdo_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pi_lines"
    ADD CONSTRAINT "pi_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pi"
    ADD CONSTRAINT "pi_pdo_id_key" UNIQUE ("pdo_id");



ALTER TABLE ONLY "public"."pi"
    ADD CONSTRAINT "pi_pi_no_key" UNIQUE ("pi_no");



ALTER TABLE ONLY "public"."pi"
    ADD CONSTRAINT "pi_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pm_packaging_types"
    ADD CONSTRAINT "pm_packaging_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pm"
    ADD CONSTRAINT "pm_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pm_setup"
    ADD CONSTRAINT "pm_setup_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pm_sizes"
    ADD CONSTRAINT "pm_sizes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pm_unit_counts"
    ADD CONSTRAINT "pm_unit_counts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pm_uom"
    ADD CONSTRAINT "pm_uom_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."price_offer_headers"
    ADD CONSTRAINT "price_offer_headers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."price_offer_lines"
    ADD CONSTRAINT "price_offer_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."production_headers"
    ADD CONSTRAINT "production_headers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."production_lines"
    ADD CONSTRAINT "production_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."production_order_headers"
    ADD CONSTRAINT "production_order_headers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."production_order_lines"
    ADD CONSTRAINT "production_order_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."raw_materials"
    ADD CONSTRAINT "raw_materials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."raw_materials"
    ADD CONSTRAINT "raw_materials_rm_code_key" UNIQUE ("rm_code");



ALTER TABLE ONLY "public"."rm"
    ADD CONSTRAINT "rm_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brand_customers"
    ADD CONSTRAINT "uq_brand_customer" UNIQUE ("brand_id", "customer_id");



ALTER TABLE ONLY "public"."formulas"
    ADD CONSTRAINT "uq_formula_version" UNIQUE ("item_id", "version_no");



ALTER TABLE ONLY "public"."item_packaging_lines"
    ADD CONSTRAINT "uq_item_packaging" UNIQUE ("item_id", "packaging_material_id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_unique" UNIQUE ("user_id");



CREATE INDEX "brand_customer_brand_symbol_idx" ON "public"."brand_customer" USING "btree" ("brand_symbol");



CREATE UNIQUE INDEX "brand_customer_customer_brandsymbol_unique_idx" ON "public"."brand_customer" USING "btree" ("customer_id", "brand_symbol");



CREATE UNIQUE INDEX "brand_customer_customerbrand_unique_idx" ON "public"."brand_customer" USING "btree" ("customer_brand");



CREATE UNIQUE INDEX "brands_brand_symbol_unique_idx" ON "public"."brands" USING "btree" ("brand_symbol");



CREATE INDEX "customer_items_customer_brand_id_idx" ON "public"."customer_items" USING "btree" ("customer_brand_id");



CREATE INDEX "customer_items_customer_id_idx" ON "public"."customer_items" USING "btree" ("customer_id");



CREATE INDEX "customer_items_item_id_idx" ON "public"."customer_items" USING "btree" ("item_id");



CREATE UNIQUE INDEX "customer_items_unique_idx" ON "public"."customer_items" USING "btree" ("customer_id", "customer_brand_id", "item_id", COALESCE("sub_brand", ''::"text"));



CREATE INDEX "idx_bc_brand" ON "public"."brand_customers" USING "btree" ("brand_id");



CREATE INDEX "idx_bc_customer" ON "public"."brand_customers" USING "btree" ("customer_id");



CREATE UNIQUE INDEX "idx_brand_customers_unique_pair" ON "public"."brand_customers" USING "btree" ("customer_id", "brand_id");



CREATE INDEX "idx_brands_name" ON "public"."brands" USING "btree" ("brand_name");



CREATE INDEX "idx_formula_headers_customer_brand_id" ON "public"."formula_headers" USING "btree" ("customer_brand_id");



CREATE INDEX "idx_formula_headers_customer_id" ON "public"."formula_headers" USING "btree" ("customer_id");



CREATE INDEX "idx_formula_headers_item_id" ON "public"."formula_headers" USING "btree" ("item_id");



CREATE INDEX "idx_formula_headers_revision" ON "public"."formula_headers" USING "btree" ("revision");



CREATE INDEX "idx_formula_lines_formula_id" ON "public"."formula_lines" USING "btree" ("formula_id");



CREATE INDEX "idx_formula_lines_rm_id" ON "public"."formula_lines" USING "btree" ("rm_id");



CREATE INDEX "idx_formulas_item" ON "public"."formulas" USING "btree" ("item_id");



CREATE INDEX "idx_invoice_definitions_category" ON "public"."invoice_definitions" USING "btree" ("category");



CREATE INDEX "idx_invoice_definitions_category_sort" ON "public"."invoice_definitions" USING "btree" ("category", "sort_order");



CREATE INDEX "idx_item_brands_brand_id" ON "public"."item_brands" USING "btree" ("brand_id");



CREATE INDEX "idx_item_brands_item_id" ON "public"."item_brands" USING "btree" ("item_id");



CREATE INDEX "idx_item_master_code" ON "public"."item_master" USING "btree" ("item_code");



CREATE INDEX "idx_item_master_name" ON "public"."item_master" USING "btree" ("item_name");



CREATE INDEX "idx_item_master_sort_order" ON "public"."item_master" USING "btree" ("sort_order");



CREATE INDEX "idx_item_packaging_item" ON "public"."item_packaging_lines" USING "btree" ("item_id");



CREATE INDEX "idx_items_bc" ON "public"."items" USING "btree" ("brand_customer_id");



CREATE INDEX "idx_items_customer_brand" ON "public"."items" USING "btree" ("customer_brand");



CREATE INDEX "idx_items_customer_id" ON "public"."items" USING "btree" ("customer_id");



CREATE INDEX "idx_items_name" ON "public"."items" USING "btree" ("item_name");



CREATE INDEX "idx_items_status" ON "public"."items" USING "btree" ("status");



CREATE INDEX "idx_packaging_definitions_category" ON "public"."packaging_definitions" USING "btree" ("category");



CREATE INDEX "idx_packaging_definitions_category_sort" ON "public"."packaging_definitions" USING "btree" ("category", "sort_order");



CREATE INDEX "idx_packing_brand_brand_symbol" ON "public"."packing_brand" USING "btree" ("brand_symbol");



CREATE INDEX "idx_packing_brand_packing" ON "public"."packing_brand" USING "btree" ("packing");



CREATE INDEX "idx_pdo_bc" ON "public"."pdo" USING "btree" ("brand_customer_id");



CREATE INDEX "idx_pdo_date" ON "public"."pdo" USING "btree" ("pdo_date");



CREATE INDEX "idx_pdo_headers_customer_id" ON "public"."pdo_headers" USING "btree" ("customer_id");



CREATE INDEX "idx_pdo_headers_is_final" ON "public"."pdo_headers" USING "btree" ("is_final");



CREATE INDEX "idx_pdo_headers_parent_order_id" ON "public"."pdo_headers" USING "btree" ("parent_order_id");



CREATE INDEX "idx_pdo_headers_status" ON "public"."pdo_headers" USING "btree" ("status");



CREATE INDEX "idx_pdo_item" ON "public"."pdo" USING "btree" ("item_id");



CREATE INDEX "idx_pdo_lines_header_id" ON "public"."pdo_lines" USING "btree" ("pdo_header_id");



CREATE INDEX "idx_pdo_lines_item_id" ON "public"."pdo_lines" USING "btree" ("item_id");



CREATE INDEX "idx_pdo_lines_packing_brand_id" ON "public"."pdo_lines" USING "btree" ("packing_brand_id");



CREATE INDEX "idx_pdo_no" ON "public"."pdo" USING "btree" ("pdo_no");



CREATE INDEX "idx_pi_customer" ON "public"."pi" USING "btree" ("customer_id");



CREATE INDEX "idx_pi_lines_pi" ON "public"."pi_lines" USING "btree" ("pi_id");



CREATE INDEX "idx_pi_no" ON "public"."pi" USING "btree" ("pi_no");



CREATE INDEX "idx_pi_pdo" ON "public"."pi" USING "btree" ("pdo_id");



CREATE INDEX "idx_pm_code" ON "public"."pm" USING "btree" ("pm_code");



CREATE UNIQUE INDEX "idx_pm_code_unique" ON "public"."pm" USING "btree" ("pm_code") WHERE ("pm_code" IS NOT NULL);



CREATE INDEX "idx_pm_name" ON "public"."packaging_materials" USING "btree" ("pm_name");



CREATE INDEX "idx_pm_packaging_types_code" ON "public"."pm_packaging_types" USING "btree" ("type_code");



CREATE UNIQUE INDEX "idx_pm_packaging_types_code_unique" ON "public"."pm_packaging_types" USING "btree" ("type_code") WHERE ("type_code" IS NOT NULL);



CREATE INDEX "idx_pm_packaging_types_name" ON "public"."pm_packaging_types" USING "btree" ("type_name");



CREATE INDEX "idx_pm_packaging_types_status" ON "public"."pm_packaging_types" USING "btree" ("status");



CREATE INDEX "idx_pm_setup_code" ON "public"."pm_setup" USING "btree" ("pm_code");



CREATE UNIQUE INDEX "idx_pm_setup_code_unique" ON "public"."pm_setup" USING "btree" ("pm_code") WHERE ("pm_code" IS NOT NULL);



CREATE INDEX "idx_pm_setup_name" ON "public"."pm_setup" USING "btree" ("pm_name");



CREATE INDEX "idx_pm_setup_status" ON "public"."pm_setup" USING "btree" ("status");



CREATE INDEX "idx_pm_sizes_code" ON "public"."pm_sizes" USING "btree" ("size_code");



CREATE INDEX "idx_pm_sizes_name" ON "public"."pm_sizes" USING "btree" ("size_name");



CREATE INDEX "idx_pm_sizes_status" ON "public"."pm_sizes" USING "btree" ("status");



CREATE INDEX "idx_pm_status" ON "public"."pm" USING "btree" ("status");



CREATE INDEX "idx_pm_unit_counts_code" ON "public"."pm_unit_counts" USING "btree" ("count_code");



CREATE UNIQUE INDEX "idx_pm_unit_counts_code_unique" ON "public"."pm_unit_counts" USING "btree" ("count_code") WHERE ("count_code" IS NOT NULL);



CREATE INDEX "idx_pm_unit_counts_status" ON "public"."pm_unit_counts" USING "btree" ("status");



CREATE INDEX "idx_pm_unit_counts_value" ON "public"."pm_unit_counts" USING "btree" ("count_value");



CREATE INDEX "idx_pm_uom_code" ON "public"."pm_uom" USING "btree" ("uom_code");



CREATE UNIQUE INDEX "idx_pm_uom_code_unique" ON "public"."pm_uom" USING "btree" ("uom_code") WHERE ("uom_code" IS NOT NULL);



CREATE INDEX "idx_pm_uom_name" ON "public"."pm_uom" USING "btree" ("uom_name");



CREATE INDEX "idx_pm_uom_status" ON "public"."pm_uom" USING "btree" ("status");



CREATE INDEX "idx_rm_code" ON "public"."rm" USING "btree" ("rm_code");



CREATE INDEX "idx_rm_name" ON "public"."raw_materials" USING "btree" ("rm_name");



CREATE INDEX "idx_rm_status" ON "public"."rm" USING "btree" ("status");



CREATE INDEX "idx_user_roles_user_id" ON "public"."user_roles" USING "btree" ("user_id");



CREATE INDEX "packing_store_stock_brand_symbol_idx" ON "public"."packing_store_stock" USING "btree" ("brand_symbol");



CREATE INDEX "packing_store_stock_item_id_idx" ON "public"."packing_store_stock" USING "btree" ("item_id");



CREATE INDEX "packing_store_stock_packing_brand_id_idx" ON "public"."packing_store_stock" USING "btree" ("packing_brand_id");



CREATE UNIQUE INDEX "packing_store_stock_stock_key_uidx" ON "public"."packing_store_stock" USING "btree" ("stock_key");



CREATE UNIQUE INDEX "uq_invoice_definitions_category_value" ON "public"."invoice_definitions" USING "btree" ("category", "lower"("value"));



CREATE UNIQUE INDEX "uq_packaging_definitions_category_value" ON "public"."packaging_definitions" USING "btree" ("category", "lower"("value"));



CREATE UNIQUE INDEX "ux_customer_brands" ON "public"."customer_brands" USING "btree" ("customer_id", "lower"(TRIM(BOTH FROM "brand_code")));



CREATE OR REPLACE TRIGGER "trg_assign_pdo_no" BEFORE INSERT ON "public"."pdo" FOR EACH ROW EXECUTE FUNCTION "public"."assign_pdo_no"();



CREATE OR REPLACE TRIGGER "trg_assign_pi_no" BEFORE INSERT ON "public"."pi" FOR EACH ROW EXECUTE FUNCTION "public"."assign_pi_no"();



CREATE OR REPLACE TRIGGER "trg_brand_customers_updated_at" BEFORE UPDATE ON "public"."brand_customers" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_brands_updated_at" BEFORE UPDATE ON "public"."brands" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_formula_headers_updated_at" BEFORE UPDATE ON "public"."formula_headers" FOR EACH ROW EXECUTE FUNCTION "public"."set_formula_headers_updated_at"();



CREATE OR REPLACE TRIGGER "trg_formulas_updated_at" BEFORE UPDATE ON "public"."formulas" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_generate_item_code" BEFORE INSERT ON "public"."items" FOR EACH ROW EXECUTE FUNCTION "public"."generate_item_code"();



CREATE OR REPLACE TRIGGER "trg_item_master_updated_at" BEFORE UPDATE ON "public"."item_master" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_items_updated_at" BEFORE UPDATE ON "public"."items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_packaging_materials_updated_at" BEFORE UPDATE ON "public"."packaging_materials" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_pallet_data_updated_at" BEFORE UPDATE ON "public"."pallet_data" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_pdo_headers_updated_at" BEFORE UPDATE ON "public"."pdo_headers" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_pdo_lines_updated_at" BEFORE UPDATE ON "public"."pdo_lines" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_pdo_updated_at" BEFORE UPDATE ON "public"."pdo" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_pi_updated_at" BEFORE UPDATE ON "public"."pi" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_raw_materials_updated_at" BEFORE UPDATE ON "public"."raw_materials" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_set_app_user_roles_updated_at" BEFORE UPDATE ON "public"."app_user_roles" FOR EACH ROW EXECUTE FUNCTION "public"."set_app_user_roles_updated_at"();



CREATE OR REPLACE TRIGGER "trg_set_packing_store_stock_updated_at" BEFORE UPDATE ON "public"."packing_store_stock" FOR EACH ROW EXECUTE FUNCTION "public"."set_packing_store_stock_updated_at"();



CREATE OR REPLACE TRIGGER "trg_sync_customer_brands_fields" BEFORE INSERT OR UPDATE ON "public"."customer_brands" FOR EACH ROW EXECUTE FUNCTION "public"."sync_customer_brands_fields"();



ALTER TABLE ONLY "public"."brand_customers"
    ADD CONSTRAINT "brand_customers_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."brand_customers"
    ADD CONSTRAINT "brand_customers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."customer_items"
    ADD CONSTRAINT "customer_items_customer_brand_id_fkey" FOREIGN KEY ("customer_brand_id") REFERENCES "public"."brand_customer"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_items"
    ADD CONSTRAINT "customer_items_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_items"
    ADD CONSTRAINT "customer_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."item_master"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."formula_lines"
    ADD CONSTRAINT "formula_lines_formula_id_fkey" FOREIGN KEY ("formula_id") REFERENCES "public"."formula_headers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."formulas"
    ADD CONSTRAINT "formulas_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."formulas"
    ADD CONSTRAINT "formulas_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."formulas"
    ADD CONSTRAINT "formulas_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoice_headers"
    ADD CONSTRAINT "invoice_headers_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoice_headers"
    ADD CONSTRAINT "invoice_headers_pdo_header_id_fkey" FOREIGN KEY ("pdo_header_id") REFERENCES "public"."pdo_headers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoice_lines"
    ADD CONSTRAINT "invoice_lines_invoice_header_id_fkey" FOREIGN KEY ("invoice_header_id") REFERENCES "public"."invoice_headers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."item_brands"
    ADD CONSTRAINT "item_brands_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."item_brands"
    ADD CONSTRAINT "item_brands_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."item_packaging_lines"
    ADD CONSTRAINT "item_packaging_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."item_packaging_lines"
    ADD CONSTRAINT "item_packaging_lines_packaging_material_id_fkey" FOREIGN KEY ("packaging_material_id") REFERENCES "public"."packaging_materials"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_brand_customer_id_fkey" FOREIGN KEY ("brand_customer_id") REFERENCES "public"."brand_customers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."items"
    ADD CONSTRAINT "items_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."packaging_materials"
    ADD CONSTRAINT "packaging_materials_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."pdo"
    ADD CONSTRAINT "pdo_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."pdo"
    ADD CONSTRAINT "pdo_brand_customer_id_fkey" FOREIGN KEY ("brand_customer_id") REFERENCES "public"."brand_customers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."pdo"
    ADD CONSTRAINT "pdo_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."pdo_headers"
    ADD CONSTRAINT "pdo_headers_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."pdo"
    ADD CONSTRAINT "pdo_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."pdo_lines"
    ADD CONSTRAINT "pdo_lines_pdo_header_id_fkey" FOREIGN KEY ("pdo_header_id") REFERENCES "public"."pdo_headers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pi"
    ADD CONSTRAINT "pi_brand_customer_id_fkey" FOREIGN KEY ("brand_customer_id") REFERENCES "public"."brand_customers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."pi"
    ADD CONSTRAINT "pi_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."pi_lines"
    ADD CONSTRAINT "pi_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."pi_lines"
    ADD CONSTRAINT "pi_lines_pi_id_fkey" FOREIGN KEY ("pi_id") REFERENCES "public"."pi"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pi"
    ADD CONSTRAINT "pi_pdo_id_fkey" FOREIGN KEY ("pdo_id") REFERENCES "public"."pdo"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."price_offer_lines"
    ADD CONSTRAINT "price_offer_lines_price_offer_header_id_fkey" FOREIGN KEY ("price_offer_header_id") REFERENCES "public"."price_offer_headers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."production_headers"
    ADD CONSTRAINT "production_headers_pdo_header_id_fkey" FOREIGN KEY ("pdo_header_id") REFERENCES "public"."pdo_headers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."production_lines"
    ADD CONSTRAINT "production_lines_production_header_id_fkey" FOREIGN KEY ("production_header_id") REFERENCES "public"."production_headers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."production_order_lines"
    ADD CONSTRAINT "production_order_lines_production_order_header_id_fkey" FOREIGN KEY ("production_order_header_id") REFERENCES "public"."production_order_headers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."raw_materials"
    ADD CONSTRAINT "raw_materials_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow all" ON "public"."brand_customer" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all delete" ON "public"."pm_sizes" FOR DELETE USING (true);



CREATE POLICY "Allow all delete on pallet_data" ON "public"."pallet_data" FOR DELETE USING (true);



CREATE POLICY "Allow all delete on pdo_headers" ON "public"."pdo_headers" FOR DELETE USING (true);



CREATE POLICY "Allow all delete on pdo_lines" ON "public"."pdo_lines" FOR DELETE USING (true);



CREATE POLICY "Allow all insert" ON "public"."pm_sizes" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow all insert on pallet_data" ON "public"."pallet_data" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow all insert on pdo_headers" ON "public"."pdo_headers" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow all insert on pdo_lines" ON "public"."pdo_lines" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow all select" ON "public"."pm_sizes" FOR SELECT USING (true);



CREATE POLICY "Allow all select on pallet_data" ON "public"."pallet_data" FOR SELECT USING (true);



CREATE POLICY "Allow all select on pdo_headers" ON "public"."pdo_headers" FOR SELECT USING (true);



CREATE POLICY "Allow all select on pdo_lines" ON "public"."pdo_lines" FOR SELECT USING (true);



CREATE POLICY "Allow all update" ON "public"."pm_sizes" FOR UPDATE USING (true);



CREATE POLICY "Allow all update on pallet_data" ON "public"."pallet_data" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow all update on pdo_headers" ON "public"."pdo_headers" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow all update on pdo_lines" ON "public"."pdo_lines" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to delete brand_customer" ON "public"."brand_customer" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to delete customer_items" ON "public"."customer_items" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to delete customers" ON "public"."customers" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to insert brand_customer" ON "public"."brand_customer" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert customer_items" ON "public"."customer_items" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert customers" ON "public"."customers" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to select brand_customer" ON "public"."brand_customer" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to select brands" ON "public"."brands" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to select customer_items" ON "public"."customer_items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to select customers" ON "public"."customers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to update brand_customer" ON "public"."brand_customer" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to update customer_items" ON "public"."customer_items" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated users to update customers" ON "public"."customers" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Allow delete customer_brands" ON "public"."customer_brands" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow insert customer_brands" ON "public"."customer_brands" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Allow select customer_brands" ON "public"."customer_brands" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Allow update customer_brands" ON "public"."customer_brands" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "allow authenticated insert invoice_headers" ON "public"."invoice_headers" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow authenticated insert invoice_lines" ON "public"."invoice_lines" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "allow authenticated price_offer_headers" ON "public"."price_offer_headers" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "allow authenticated price_offer_lines" ON "public"."price_offer_lines" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "allow authenticated production_order_headers" ON "public"."production_order_headers" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "allow authenticated production_order_lines" ON "public"."production_order_lines" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "allow authenticated select invoice_headers" ON "public"."invoice_headers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "allow authenticated select invoice_lines" ON "public"."invoice_lines" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."brand_customer" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."brands" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "brands_read_active_users" ON "public"."brands" FOR SELECT USING ("public"."is_active_user"());



CREATE POLICY "brands_write_active_users" ON "public"."brands" USING ("public"."is_active_user"()) WITH CHECK ("public"."is_active_user"());



ALTER TABLE "public"."customer_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."formula_headers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "formula_headers_delete_authenticated" ON "public"."formula_headers" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "formula_headers_insert_authenticated" ON "public"."formula_headers" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "formula_headers_select_authenticated" ON "public"."formula_headers" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "formula_headers_update_authenticated" ON "public"."formula_headers" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."formula_lines" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "formula_lines_delete_authenticated" ON "public"."formula_lines" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "formula_lines_insert_authenticated" ON "public"."formula_lines" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "formula_lines_select_authenticated" ON "public"."formula_lines" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "formula_lines_update_authenticated" ON "public"."formula_lines" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."formulas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "formulas_read_active_users" ON "public"."formulas" FOR SELECT USING ("public"."is_active_user"());



CREATE POLICY "formulas_write_active_users" ON "public"."formulas" USING ("public"."is_active_user"()) WITH CHECK ("public"."is_active_user"());



ALTER TABLE "public"."invoice_definitions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "invoice_definitions_delete" ON "public"."invoice_definitions" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "invoice_definitions_insert" ON "public"."invoice_definitions" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "invoice_definitions_select" ON "public"."invoice_definitions" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "invoice_definitions_update" ON "public"."invoice_definitions" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



ALTER TABLE "public"."invoice_headers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoice_lines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."item_brands" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "item_brands_delete_auth" ON "public"."item_brands" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "item_brands_insert_auth" ON "public"."item_brands" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "item_brands_select_auth" ON "public"."item_brands" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "item_brands_update_auth" ON "public"."item_brands" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



ALTER TABLE "public"."item_packaging_lines" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "item_packaging_read_active_users" ON "public"."item_packaging_lines" FOR SELECT USING ("public"."is_active_user"());



CREATE POLICY "item_packaging_write_active_users" ON "public"."item_packaging_lines" USING ("public"."is_active_user"()) WITH CHECK ("public"."is_active_user"());



ALTER TABLE "public"."items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "items_delete_auth" ON "public"."items" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "items_insert_auth" ON "public"."items" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "items_read_active_users" ON "public"."items" FOR SELECT USING ("public"."is_active_user"());



CREATE POLICY "items_select_auth" ON "public"."items" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "items_update_auth" ON "public"."items" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "items_write_active_users" ON "public"."items" USING ("public"."is_active_user"()) WITH CHECK ("public"."is_active_user"());



ALTER TABLE "public"."packaging_definitions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "packaging_definitions_delete" ON "public"."packaging_definitions" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "packaging_definitions_insert" ON "public"."packaging_definitions" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "packaging_definitions_select" ON "public"."packaging_definitions" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "packaging_definitions_update" ON "public"."packaging_definitions" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



ALTER TABLE "public"."packaging_materials" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "packaging_materials_read_active_users" ON "public"."packaging_materials" FOR SELECT USING ("public"."is_active_user"());



CREATE POLICY "packaging_materials_write_active_users" ON "public"."packaging_materials" USING ("public"."is_active_user"()) WITH CHECK ("public"."is_active_user"());



ALTER TABLE "public"."packing_brand" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "packing_brand_delete" ON "public"."packing_brand" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "packing_brand_insert" ON "public"."packing_brand" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "packing_brand_select" ON "public"."packing_brand" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "packing_brand_update" ON "public"."packing_brand" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



ALTER TABLE "public"."packing_master" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "packing_master_delete" ON "public"."packing_master" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "packing_master_insert" ON "public"."packing_master" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "packing_master_select" ON "public"."packing_master" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "packing_master_update" ON "public"."packing_master" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



ALTER TABLE "public"."packing_store_stock" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pallet_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pdo" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pdo_headers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pdo_lines" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pdo_read_active_users" ON "public"."pdo" FOR SELECT USING ("public"."is_active_user"());



CREATE POLICY "pdo_write_active_users" ON "public"."pdo" USING ("public"."is_active_user"()) WITH CHECK ("public"."is_active_user"());



ALTER TABLE "public"."pi" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pi_lines" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pi_lines_read_active_users" ON "public"."pi_lines" FOR SELECT USING ("public"."is_active_user"());



CREATE POLICY "pi_lines_write_active_users" ON "public"."pi_lines" USING ("public"."is_active_user"()) WITH CHECK ("public"."is_active_user"());



CREATE POLICY "pi_read_active_users" ON "public"."pi" FOR SELECT USING ("public"."is_active_user"());



CREATE POLICY "pi_write_active_users" ON "public"."pi" USING ("public"."is_active_user"()) WITH CHECK ("public"."is_active_user"());



ALTER TABLE "public"."pm" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pm_sizes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."price_offer_headers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."price_offer_lines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."production_headers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."production_lines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."production_order_headers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."production_order_lines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_admin" ON "public"."profiles" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "profiles_select_own_or_admin" ON "public"."profiles" FOR SELECT USING ((("id" = "auth"."uid"()) OR "public"."is_admin"()));



CREATE POLICY "profiles_update_own_or_admin" ON "public"."profiles" FOR UPDATE USING ((("id" = "auth"."uid"()) OR "public"."is_admin"())) WITH CHECK ((("id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."raw_materials" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "raw_materials_read_active_users" ON "public"."raw_materials" FOR SELECT USING ("public"."is_active_user"());



CREATE POLICY "raw_materials_write_active_users" ON "public"."raw_materials" USING ("public"."is_active_user"()) WITH CHECK ("public"."is_active_user"());



CREATE POLICY "read own role" ON "public"."user_roles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."assign_pdo_no"() TO "anon";
GRANT ALL ON FUNCTION "public"."assign_pdo_no"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_pdo_no"() TO "service_role";



GRANT ALL ON FUNCTION "public"."assign_pi_no"() TO "anon";
GRANT ALL ON FUNCTION "public"."assign_pi_no"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_pi_no"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_item_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_item_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_item_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_item_master_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_item_master_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_item_master_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_pdo_no"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_pdo_no"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_pdo_no"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_pi_from_pdo"("p_pdo_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_pi_from_pdo"("p_pdo_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_pi_from_pdo"("p_pdo_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_pi_no"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_pi_no"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_pi_no"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_active_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_active_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_active_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_active_user"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_app_user_roles_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_app_user_roles_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_app_user_roles_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_formula_headers_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_formula_headers_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_formula_headers_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_packing_store_stock_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_packing_store_stock_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_packing_store_stock_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_customer_brands_fields"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_customer_brands_fields"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_customer_brands_fields"() TO "service_role";


















GRANT ALL ON TABLE "public"."app_user_roles" TO "anon";
GRANT ALL ON TABLE "public"."app_user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."app_user_roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."app_user_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."app_user_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."app_user_roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."brand_customer" TO "anon";
GRANT ALL ON TABLE "public"."brand_customer" TO "authenticated";
GRANT ALL ON TABLE "public"."brand_customer" TO "service_role";



GRANT ALL ON SEQUENCE "public"."brand_customer_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."brand_customer_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."brand_customer_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."brand_customers" TO "anon";
GRANT ALL ON TABLE "public"."brand_customers" TO "authenticated";
GRANT ALL ON TABLE "public"."brand_customers" TO "service_role";



GRANT ALL ON TABLE "public"."brands" TO "anon";
GRANT ALL ON TABLE "public"."brands" TO "authenticated";
GRANT ALL ON TABLE "public"."brands" TO "service_role";



GRANT ALL ON TABLE "public"."customer_brands" TO "anon";
GRANT ALL ON TABLE "public"."customer_brands" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_brands" TO "service_role";



GRANT ALL ON TABLE "public"."customer_items" TO "anon";
GRANT ALL ON TABLE "public"."customer_items" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."customer_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."customer_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."customer_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."formula_headers" TO "anon";
GRANT ALL ON TABLE "public"."formula_headers" TO "authenticated";
GRANT ALL ON TABLE "public"."formula_headers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."formula_headers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."formula_headers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."formula_headers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."formula_lines" TO "anon";
GRANT ALL ON TABLE "public"."formula_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."formula_lines" TO "service_role";



GRANT ALL ON SEQUENCE "public"."formula_lines_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."formula_lines_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."formula_lines_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."formulas" TO "anon";
GRANT ALL ON TABLE "public"."formulas" TO "authenticated";
GRANT ALL ON TABLE "public"."formulas" TO "service_role";



GRANT ALL ON TABLE "public"."invoice_definitions" TO "anon";
GRANT ALL ON TABLE "public"."invoice_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_definitions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invoice_definitions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invoice_definitions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invoice_definitions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."invoice_headers" TO "anon";
GRANT ALL ON TABLE "public"."invoice_headers" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_headers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invoice_headers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invoice_headers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invoice_headers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."invoice_lines" TO "anon";
GRANT ALL ON TABLE "public"."invoice_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."invoice_lines" TO "service_role";



GRANT ALL ON SEQUENCE "public"."invoice_lines_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."invoice_lines_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."invoice_lines_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."item_brands" TO "anon";
GRANT ALL ON TABLE "public"."item_brands" TO "authenticated";
GRANT ALL ON TABLE "public"."item_brands" TO "service_role";



GRANT ALL ON SEQUENCE "public"."item_code_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."item_code_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."item_code_seq" TO "service_role";



GRANT ALL ON TABLE "public"."item_master" TO "anon";
GRANT ALL ON TABLE "public"."item_master" TO "authenticated";
GRANT ALL ON TABLE "public"."item_master" TO "service_role";



GRANT ALL ON TABLE "public"."item_packaging_lines" TO "anon";
GRANT ALL ON TABLE "public"."item_packaging_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."item_packaging_lines" TO "service_role";



GRANT ALL ON TABLE "public"."items" TO "anon";
GRANT ALL ON TABLE "public"."items" TO "authenticated";
GRANT ALL ON TABLE "public"."items" TO "service_role";



GRANT ALL ON TABLE "public"."packaging_definitions" TO "anon";
GRANT ALL ON TABLE "public"."packaging_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."packaging_definitions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."packaging_definitions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."packaging_definitions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."packaging_definitions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."packaging_materials" TO "anon";
GRANT ALL ON TABLE "public"."packaging_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."packaging_materials" TO "service_role";



GRANT ALL ON TABLE "public"."packing_brand" TO "anon";
GRANT ALL ON TABLE "public"."packing_brand" TO "authenticated";
GRANT ALL ON TABLE "public"."packing_brand" TO "service_role";



GRANT ALL ON SEQUENCE "public"."packing_brand_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."packing_brand_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."packing_brand_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."packing_master" TO "anon";
GRANT ALL ON TABLE "public"."packing_master" TO "authenticated";
GRANT ALL ON TABLE "public"."packing_master" TO "service_role";



GRANT ALL ON SEQUENCE "public"."packing_master_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."packing_master_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."packing_master_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."packing_store_stock" TO "anon";
GRANT ALL ON TABLE "public"."packing_store_stock" TO "authenticated";
GRANT ALL ON TABLE "public"."packing_store_stock" TO "service_role";



GRANT ALL ON SEQUENCE "public"."packing_store_stock_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."packing_store_stock_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."packing_store_stock_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."pallet_data" TO "anon";
GRANT ALL ON TABLE "public"."pallet_data" TO "authenticated";
GRANT ALL ON TABLE "public"."pallet_data" TO "service_role";



GRANT ALL ON SEQUENCE "public"."pallet_data_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pallet_data_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pallet_data_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."pdo" TO "anon";
GRANT ALL ON TABLE "public"."pdo" TO "authenticated";
GRANT ALL ON TABLE "public"."pdo" TO "service_role";



GRANT ALL ON TABLE "public"."pdo_headers" TO "anon";
GRANT ALL ON TABLE "public"."pdo_headers" TO "authenticated";
GRANT ALL ON TABLE "public"."pdo_headers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."pdo_headers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pdo_headers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pdo_headers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."pdo_lines" TO "anon";
GRANT ALL ON TABLE "public"."pdo_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."pdo_lines" TO "service_role";



GRANT ALL ON SEQUENCE "public"."pdo_lines_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pdo_lines_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pdo_lines_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."pi" TO "anon";
GRANT ALL ON TABLE "public"."pi" TO "authenticated";
GRANT ALL ON TABLE "public"."pi" TO "service_role";



GRANT ALL ON TABLE "public"."pi_lines" TO "anon";
GRANT ALL ON TABLE "public"."pi_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."pi_lines" TO "service_role";



GRANT ALL ON TABLE "public"."pm" TO "anon";
GRANT ALL ON TABLE "public"."pm" TO "authenticated";
GRANT ALL ON TABLE "public"."pm" TO "service_role";



GRANT ALL ON TABLE "public"."pm_packaging_types" TO "anon";
GRANT ALL ON TABLE "public"."pm_packaging_types" TO "authenticated";
GRANT ALL ON TABLE "public"."pm_packaging_types" TO "service_role";



GRANT ALL ON TABLE "public"."pm_setup" TO "anon";
GRANT ALL ON TABLE "public"."pm_setup" TO "authenticated";
GRANT ALL ON TABLE "public"."pm_setup" TO "service_role";



GRANT ALL ON TABLE "public"."pm_sizes" TO "anon";
GRANT ALL ON TABLE "public"."pm_sizes" TO "authenticated";
GRANT ALL ON TABLE "public"."pm_sizes" TO "service_role";



GRANT ALL ON TABLE "public"."pm_unit_counts" TO "anon";
GRANT ALL ON TABLE "public"."pm_unit_counts" TO "authenticated";
GRANT ALL ON TABLE "public"."pm_unit_counts" TO "service_role";



GRANT ALL ON TABLE "public"."pm_uom" TO "anon";
GRANT ALL ON TABLE "public"."pm_uom" TO "authenticated";
GRANT ALL ON TABLE "public"."pm_uom" TO "service_role";



GRANT ALL ON TABLE "public"."price_offer_headers" TO "anon";
GRANT ALL ON TABLE "public"."price_offer_headers" TO "authenticated";
GRANT ALL ON TABLE "public"."price_offer_headers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."price_offer_headers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."price_offer_headers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."price_offer_headers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."price_offer_lines" TO "anon";
GRANT ALL ON TABLE "public"."price_offer_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."price_offer_lines" TO "service_role";



GRANT ALL ON SEQUENCE "public"."price_offer_lines_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."price_offer_lines_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."price_offer_lines_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."production_headers" TO "anon";
GRANT ALL ON TABLE "public"."production_headers" TO "authenticated";
GRANT ALL ON TABLE "public"."production_headers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."production_headers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."production_headers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."production_headers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."production_lines" TO "anon";
GRANT ALL ON TABLE "public"."production_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."production_lines" TO "service_role";



GRANT ALL ON SEQUENCE "public"."production_lines_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."production_lines_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."production_lines_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."production_order_headers" TO "anon";
GRANT ALL ON TABLE "public"."production_order_headers" TO "authenticated";
GRANT ALL ON TABLE "public"."production_order_headers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."production_order_headers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."production_order_headers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."production_order_headers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."production_order_lines" TO "anon";
GRANT ALL ON TABLE "public"."production_order_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."production_order_lines" TO "service_role";



GRANT ALL ON SEQUENCE "public"."production_order_lines_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."production_order_lines_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."production_order_lines_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."raw_materials" TO "anon";
GRANT ALL ON TABLE "public"."raw_materials" TO "authenticated";
GRANT ALL ON TABLE "public"."raw_materials" TO "service_role";



GRANT ALL ON TABLE "public"."rm" TO "anon";
GRANT ALL ON TABLE "public"."rm" TO "authenticated";
GRANT ALL ON TABLE "public"."rm" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."v_customer_items" TO "anon";
GRANT ALL ON TABLE "public"."v_customer_items" TO "authenticated";
GRANT ALL ON TABLE "public"."v_customer_items" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































