import { supabase } from "../lib/supabaseClient";

const TABLE_NAME = "item_master";

export async function getItems() {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("*")
    .order("item_code", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createItem(payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateItem(id, payload) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteItem(id) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}