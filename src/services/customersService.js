import { supabase } from "../lib/supabase";

const CUSTOMERS_TABLE = "customers";
const BRANDS_TABLE = "brands";

export async function getCustomers() {
  const { data, error } = await supabase
    .from(CUSTOMERS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getBrandsForCustomer() {
  const { data, error } = await supabase
    .from(BRANDS_TABLE)
    .select("id, brand_name, brand_symbol")
    .order("brand_symbol", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCustomer(payload) {
  const { data, error } = await supabase
    .from(CUSTOMERS_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomer(id, payload) {
  const { data, error } = await supabase
    .from(CUSTOMERS_TABLE)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCustomer(id) {
  const { error } = await supabase
    .from(CUSTOMERS_TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}