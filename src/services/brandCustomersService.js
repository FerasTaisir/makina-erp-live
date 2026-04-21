import { supabase } from "../lib/supabaseClient";

const BRAND_CUSTOMER_TABLE = "brand_customer";
const BRANDS_TABLE = "brands";
const CUSTOMERS_TABLE = "customers";

export async function fetchBrandCustomers() {
  const { data, error } = await supabase
    .from(BRAND_CUSTOMER_TABLE)
    .select("id, customer_id, brand_symbol, customer_brand")
    .order("id", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchBrandsLookup() {
  const { data, error } = await supabase
    .from(BRANDS_TABLE)
    .select("id, brand_code, brand_name, brand_symbol")
    .order("brand_symbol", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchCustomersLookup() {
  const { data, error } = await supabase
    .from(CUSTOMERS_TABLE)
    .select("id, customer_code, customer_symbol, customer_name")
    .order("customer_code", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function insertBrandCustomer(row) {
  const { data, error } = await supabase
    .from(BRAND_CUSTOMER_TABLE)
    .insert([row])
    .select("id, customer_id, brand_symbol, customer_brand")
    .single();

  if (error) throw error;
  return data;
}

export async function updateBrandCustomer(id, updates) {
  const { data, error } = await supabase
    .from(BRAND_CUSTOMER_TABLE)
    .update(updates)
    .eq("id", id)
    .select("id, customer_id, brand_symbol, customer_brand")
    .single();

  if (error) throw error;
  return data;
}

export async function removeBrandCustomer(id) {
  const { error } = await supabase
    .from(BRAND_CUSTOMER_TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function fetchBrandCustomersByCustomer(customerId) {
  const { data, error } = await supabase
    .from(BRAND_CUSTOMER_TABLE)
    .select("id, customer_id, brand_symbol, customer_brand")
    .eq("customer_id", customerId)
    .order("id", { ascending: false });

  if (error) throw error;
  return data || [];
}