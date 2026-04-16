import { supabase } from '../lib/supabase'

export async function fetchBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('brand_name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function insertBrand(brand) {
  const { data, error } = await supabase
    .from('brands')
    .insert([brand])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBrand(id, updates) {
  const { data, error } = await supabase
    .from('brands')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeBrand(id) {
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function updateBrandOrder(id, sortOrder) {
  const { data, error } = await supabase
    .from('brands')
    .update({ sort_order: sortOrder })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}