import { supabase } from "../lib/supabase";

const TABLE = "rm";

export async function getRMList() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createRM(payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRM(id, payload) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRM(id) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}