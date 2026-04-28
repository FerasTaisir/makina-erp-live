import { supabase } from "../lib/supabaseClient";

const CUSTOMERS_TABLE = "customers";
const BRANDS_TABLE = "brands";
const BRAND_CUSTOMER_TABLE = "brand_customer";

// =======================
// GET CUSTOMERS
// =======================
export async function getCustomers() {
  const { data, error } = await supabase
    .from(CUSTOMERS_TABLE)
    .select("*")
    .order("customer_code", { ascending: false });

  if (error) throw error;
  return data || [];
}

// =======================
// GET BRANDS (for dropdown)
// =======================
export async function getBrandsForCustomer() {
  const { data, error } = await supabase
    .from(BRANDS_TABLE)
    .select("id, brand_name, brand_symbol")
    .order("brand_symbol", { ascending: true });

  if (error) throw error;
  return data || [];
}

// =======================
// GET CUSTOMER-BRAND LINKS
// =======================
export async function getCustomerBrandLinks() {
  const { data, error } = await supabase
    .from(BRAND_CUSTOMER_TABLE)
    .select("id, customer_id, customer_brand, brand_symbol")
    .order("customer_brand", { ascending: true });

  if (error) throw error;
  return data || [];
}

// =======================
// CREATE CUSTOMER
// =======================
export async function createCustomer(payload) {
  const { data, error } = await supabase
    .from(CUSTOMERS_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =======================
// UPDATE CUSTOMER
// =======================
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

// =======================
// DELETE CUSTOMER
// =======================
export async function deleteCustomer(id) {
  const { error } = await supabase
    .from(CUSTOMERS_TABLE)
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}

// =======================
// REPLACE CUSTOMER-BRAND LINKS
// يحذف الروابط القديمة ثم يضيف الجديدة
// =======================
export async function replaceCustomerBrandLinks(customerId, brandSymbols, customerSymbol) {
  if (!customerId) {
    throw new Error("customerId is required.");
  }

  const safeSymbols = Array.isArray(brandSymbols)
    ? [...new Set(brandSymbols.map((x) => String(x || "").trim()).filter(Boolean))]
    : [];

  const safeCustomerSymbol = String(customerSymbol || "").trim();

  // حذف الروابط القديمة
  const { error: deleteError } = await supabase
    .from(BRAND_CUSTOMER_TABLE)
    .delete()
    .eq("customer_id", customerId);

  if (deleteError) throw deleteError;

  // إذا لا يوجد براندات مختارة ننتهي هنا
  if (safeSymbols.length === 0) {
    return [];
  }

  const rowsToInsert = safeSymbols.map((brandSymbol) => ({
    customer_id: customerId,
    brand_symbol: brandSymbol,
    customer_brand: safeCustomerSymbol
      ? `${brandSymbol}-${safeCustomerSymbol}`
      : brandSymbol,
  }));

  const { data, error } = await supabase
    .from(BRAND_CUSTOMER_TABLE)
    .insert(rowsToInsert)
    .select();

  if (error) throw error;
  return data || [];
}

// =======================
// DELETE CUSTOMER-BRAND LINKS
// =======================
export async function deleteCustomerBrandLinks(customerId) {
  const { error } = await supabase
    .from(BRAND_CUSTOMER_TABLE)
    .delete()
    .eq("customer_id", customerId);

  if (error) throw error;
  return true;
}