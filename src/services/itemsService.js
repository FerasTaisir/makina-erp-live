import { supabase } from "../lib/supabase";

const ITEMS_TABLE = "items";
const CUSTOMERS_TABLE = "customers";

export async function getItems() {
  const { data, error } = await supabase
    .from(ITEMS_TABLE)
    .select(`
      id,
      item_code,
      item_name,
      customer_id,
      customer_brand,
      pack_size,
      unit,
      status,
      notes,
      created_at,
      customers (
        id,
        customer_name,
        customer_brand
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCustomersForItems() {
  const { data, error } = await supabase
    .from(CUSTOMERS_TABLE)
    .select("id, customer_name, customer_brand")
    .order("customer_name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createItem(payload) {
  const { data, error } = await supabase
    .from(ITEMS_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateItem(id, payload) {
  const { data, error } = await supabase
    .from(ITEMS_TABLE)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteItem(id) {
  const { error } = await supabase
    .from(ITEMS_TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}