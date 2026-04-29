import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import {
  getCustomers,
  getBrandsForCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "./services/customersService";

function getNextCustomerCode(rows) {
  let maxNumber = 0;

  rows.forEach((row) => {
    const code = row?.customer_code || "";
    const match = code.match(/CUST-(\d+)/i);

    if (match) {
      const num = Number(match[1]);
      if (!Number.isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  });

  const nextNumber = maxNumber + 1;
  return `CUST-${String(nextNumber).padStart(4, "0")}`;
}

function buildEmptyForm(nextCode = "CUST-0001") {
  return {
    customer_code: nextCode,
    customer_symbol: "",
    customer_name: "",
    selected_brand_symbol: "",
    visual_brands: [],
    contact_person: "",
    phone: "",
    email: "",
    country: "",
    city: "",
    address: "",
    status: "active",
    notes: "",
  };
}

function buildCustomerBrandSymbol(brandSymbol, customerSymbol) {
  const left = (brandSymbol || "").trim();
  const right = (customerSymbol || "").trim();

  if (!left && !right) return "";
  if (!left) return right;
  if (!right) return left;

  return `${left}-${right}`;
}

export default function CustomersPage() {
  const [rows, setRows] = useState([]);
  const [brands, setBrands] = useState([]);
  const [customerBrandsMap, setCustomerBrandsMap] = useState({});
  const [form, setForm] = useState(buildEmptyForm());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMsg("");

      const [customersData, brandsData, brandCustomerRes] = await Promise.all([
        getCustomers(),
        getBrandsForCustomer(),
        supabase
          .from("brand_customer")
          .select("customer_id, customer_brand, brand_symbol")
          .order("customer_brand", { ascending: true }),
      ]);

      if (brandCustomerRes.error) {
        throw brandCustomerRes.error;
      }

      const normalizedCustomers = customersData || [];
      const normalizedBrands = brandsData || [];
      const brandCustomerRows = brandCustomerRes.data || [];

      const map = {};
      brandCustomerRows.forEach((row) => {
        if (!map[row.customer_id]) {
          map[row.customer_id] = [];
        }

        if (row.customer_brand && !map[row.customer_id].includes(row.customer_brand)) {
          map[row.customer_id].push(row.customer_brand);
        }

        if (!map[`${row.customer_id}__symbols`]) {
          map[`${row.customer_id}__symbols`] = [];
        }

        if (
          row.brand_symbol &&
          !map[`${row.customer_id}__symbols`].includes(row.brand_symbol)
        ) {
          map[`${row.customer_id}__symbols`].push(row.brand_symbol);
        }
      });

      setRows(normalizedCustomers);
      setBrands(normalizedBrands);
      setCustomerBrandsMap(map);

      if (!editingId) {
        const nextCode = getNextCustomerCode(normalizedCustomers);
        setForm((prev) => ({
          ...prev,
          customer_code: nextCode,
        }));
      }
    } catch (error) {
      console.error("Load customers error:", error);
      setErrorMsg(error.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleAddBrand() {
    const brandSymbol = (form.selected_brand_symbol || "").trim();
    if (!brandSymbol) return;

    setForm((prev) => {
      if (prev.visual_brands.includes(brandSymbol)) {
        return {
          ...prev,
          selected_brand_symbol: "",
        };
      }

      return {
        ...prev,
        visual_brands: [...prev.visual_brands, brandSymbol],
        selected_brand_symbol: "",
      };
    });
  }

  function handleRemoveBrand(brandSymbol) {
    setForm((prev) => ({
      ...prev,
      visual_brands: prev.visual_brands.filter((item) => item !== brandSymbol),
    }));
  }

  function resetForm() {
    const nextCode = getNextCustomerCode(rows);
    setForm(buildEmptyForm(nextCode));
    setEditingId(null);
    setErrorMsg("");
  }

  async function saveCustomerBrands(customerId, customerSymbol, visualBrands) {
    const cleanBrands = [...new Set((visualBrands || []).map((x) => (x || "").trim()).filter(Boolean))];

    const { error: deleteLinksError } = await supabase
      .from("brand_customer")
      .delete()
      .eq("customer_id", customerId);

    if (deleteLinksError) {
      throw deleteLinksError;
    }

    if (cleanBrands.length === 0) {
      return;
    }

    const rowsToInsert = cleanBrands.map((brandSymbol) => ({
      customer_id: customerId,
      brand_symbol: brandSymbol,
      customer_brand: buildCustomerBrandSymbol(brandSymbol, customerSymbol),
    }));

    const { error: insertLinksError } = await supabase
      .from("brand_customer")
      .insert(rowsToInsert);

    if (insertLinksError) {
      throw insertLinksError;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.customer_name.trim()) {
      setErrorMsg("Customer Name is required.");
      return;
    }

    if (!form.customer_symbol.trim()) {
      setErrorMsg("Customer Symbol is required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      const payload = {
        customer_code: form.customer_code.trim() || getNextCustomerCode(rows),
        customer_symbol: form.customer_symbol.trim(),
        customer_name: form.customer_name.trim(),
        contact_person: form.contact_person.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        country: form.country.trim() || null,
        city: form.city.trim() || null,
        address: form.address.trim() || null,
        status: form.status || "active",
        notes: form.notes.trim() || null,
      };

      let savedCustomer;

      if (editingId) {
        savedCustomer = await updateCustomer(editingId, payload);
      } else {
        savedCustomer = await createCustomer(payload);
      }

      await saveCustomerBrands(
        savedCustomer.id,
        payload.customer_symbol,
        form.visual_brands
      );

      const refreshed = await getCustomers();
      const normalizedRows = refreshed || [];

      setRows(normalizedRows);
      setForm(buildEmptyForm(getNextCustomerCode(normalizedRows)));
      setEditingId(null);

      await loadData();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Save customer error:", error);
      setErrorMsg(error.message || "Failed to save customer.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(row) {
    const savedBrandSymbols = customerBrandsMap[`${row.id}__symbols`] || [];

    setEditingId(row.id);

    setForm({
      customer_code: row.customer_code || "",
      customer_symbol: row.customer_symbol || "",
      customer_name: row.customer_name || "",
      selected_brand_symbol: "",
      visual_brands: savedBrandSymbols,
      contact_person: row.contact_person || "",
      phone: row.phone || "",
      email: row.email || "",
      country: row.country || "",
      city: row.city || "",
      address: row.address || "",
      status: row.status || "active",
      notes: row.notes || "",
    });

    setErrorMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const ok = window.confirm("Are you sure you want to delete this customer?");
    if (!ok) return;

    try {
      const { error: deleteLinksError } = await supabase
        .from("brand_customer")
        .delete()
        .eq("customer_id", id);

      if (deleteLinksError) {
        throw deleteLinksError;
      }

      await deleteCustomer(id);

      const refreshed = await getCustomers();
      const normalizedRows = refreshed || [];
      setRows(normalizedRows);

      if (editingId === id) {
        setForm(buildEmptyForm(getNextCustomerCode(normalizedRows)));
        setEditingId(null);
      }

      await loadData();
    } catch (error) {
      console.error("Delete customer error:", error);
      setErrorMsg(error.message || "Failed to delete customer.");
    }
  }

  const brandOptions = useMemo(() => brands || [], [brands]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Customers</h2>

      {errorMsg && (
        <div style={{ marginBottom: "12px", color: "red", fontWeight: "bold" }}>
          {errorMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(240px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
          background: "#f8f8f8",
          padding: "16px",
          borderRadius: "10px",
        }}
      >
        <div>
          <label>Customer Code</label>
          <input
            type="text"
            name="customer_code"
            value={form.customer_code}
            readOnly
            style={{ width: "100%", padding: "8px", background: "#efefef" }}
          />
        </div>

        <div>
          <label>Customer Name *</label>
          <input
            type="text"
            name="customer_name"
            value={form.customer_name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Customer Symbol *</label>
          <input
            type="text"
            name="customer_symbol"
            value={form.customer_symbol}
            onChange={handleChange}
            placeholder="e.g. LEB-1"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Customer Brands</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <select
              name="selected_brand_symbol"
              value={form.selected_brand_symbol}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="">Select Brand Symbol</option>
              {brandOptions.map((brand) => (
                <option key={brand.id} value={brand.brand_symbol}>
                  {brand.brand_symbol}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddBrand}
              style={{ padding: "8px 12px" }}
            >
              Add
            </button>
          </div>

          {form.visual_brands.length > 0 && (
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {form.visual_brands.map((brandSymbol) => (
                <div
                  key={brandSymbol}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr",
                    gap: "14px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#eef2ff",
                      padding: "6px 10px",
                      borderRadius: "10px",
                      fontWeight: "bold",
                      width: "fit-content",
                    }}
                  >
                    <span>{brandSymbol}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBrand(brandSymbol)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "red",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ fontWeight: "bold" }}>
                    {buildCustomerBrandSymbol(brandSymbol, form.customer_symbol)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label>Contact Person</label>
          <input
            type="text"
            name="contact_person"
            value={form.contact_person}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Country</label>
          <input
            type="text"
            name="country"
            value={form.country}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>City</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label>Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="draft">draft</option>
          </select>
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label>Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px" }}>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update Customer" : "Add Customer"}
          </button>

          <button type="button" onClick={resetForm}>
            Clear
          </button>
        </div>
      </form>

      {loading ? (
        <p>Loading customers...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            width="100%"
            border="1"
            cellPadding="8"
            style={{ borderCollapse: "collapse", background: "#fff" }}
          >
            <thead>
              <tr>
                <th>Customer Code</th>
                <th>Customer Name</th>
                <th>Customer Symbol</th>
                <th>Customer-Brand</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Country</th>
                <th>City</th>
                <th>Address</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="13" style={{ textAlign: "center" }}>
                    No customers found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.customer_code || ""}</td>
                    <td>{row.customer_name || ""}</td>
                    <td>{row.customer_symbol || ""}</td>
                    <td>
                      {(customerBrandsMap[row.id] || []).length === 0 ? (
                        "-"
                      ) : (
                        customerBrandsMap[row.id].map((cb, index) => (
                          <div key={`${row.id}-${cb}-${index}`}>{cb}</div>
                        ))
                      )}
                    </td>
                    <td>{row.contact_person || ""}</td>
                    <td>{row.phone || ""}</td>
                    <td>{row.email || ""}</td>
                    <td>{row.country || ""}</td>
                    <td>{row.city || ""}</td>
                    <td>{row.address || ""}</td>
                    <td>{row.status || ""}</td>
                    <td>{row.notes || ""}</td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button type="button" onClick={() => handleEdit(row)}>
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(row.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: "14px", color: "#555", fontSize: "14px" }}>
        Customer Brands are updated automatically from this page.
      </div>
    </div>
  );
}