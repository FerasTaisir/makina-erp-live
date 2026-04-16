import { supabase } from '../lib/supabase'

export async function fetchBrandCustomers() {
  const { data, error } = await supabase
    .from('brand_customers')
    .select(`
      *,
      brands (
        id,
        brand_code,
        brand_name,
        brand_symbol
      ),
      customers (
        id,
        customer_code,
        customer_name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function fetchBrandsLookup() {
  const { data, error } = await supabase
    .from('brands')
    .select('id, brand_code, brand_name, brand_symbol, is_active')
    .eq('is_active', true)
    .order('brand_name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function fetchCustomersLookup() {
  const { data, error } = await supabase
    .from('customers')
    .select('id, customer_code, customer_name, is_active')
    .eq('is_active', true)
    .order('customer_name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function insertBrandCustomer(row) {
  const { data, error } = await supabase
    .from('brand_customers')
    .insert([row])
    .select(`
      *,
      brands (
        id,
        brand_code,
        brand_name,
        brand_symbol
      ),
      customers (
        id,
        customer_code,
        customer_name
      )
    `)
    .single()

  if (error) throw error
  return data
}

export async function updateBrandCustomer(id, updates) {
  const { data, error } = await supabase
    .from('brand_customers')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      brands (
        id,
        brand_code,
        brand_name,
        brand_symbol
      ),
      customers (
        id,
        customer_code,
        customer_name
      )
    `)
    .single()

  if (error) throw error
  return data
}

export async function removeBrandCustomer(id) {
  const { error } = await supabase
    .from('brand_customers')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function fetchBrandCustomersByCustomer(customerId) {
  const { data, error } = await supabase
    .from('brand_customers')
    .select(`
      *,
      brands (
        id,
        brand_code,
        brand_name,
        brand_symbol
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}