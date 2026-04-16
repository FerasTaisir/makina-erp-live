import React, { useEffect, useState } from "react";
import {
  getCustomers,
  getBrandsForCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "./services/customersService";

function normalizeBrandList(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    // PostgreSQL array text format: {STO,MAK,SCH}
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const inner = trimmed.slice(1, -1).trim();
      if (!inner) return [];
      return inner
        .split(",")
        .map((item) => item.replace(/^"(.*)"$/, "$1").trim())
        .filter(Boolean);
    }

    return [trimmed];
  }

  return [];
}

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
    customer_name: "",
    customer_brand: "",
    customer_brands: [],
    selected_brand_symbol: "",
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

export default function CustomersPage() {
  const [rows, setRows] = useState([]);
  const [brands, setBrands] = useState([]);
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

      const [customersData, brandsData] = await Promise.all([
        getCustomers(),
        getBrandsForCustomer(),
      ]);

      const normalizedCustomers = (customersData || []).map((row) => ({
        ...row,
        customer_brands: normalizeBrandList(row.customer_brands),
      }));

      setRows(normalizedCustomers);
      setBrands(brandsData || []);

      if (!editingId) {
        const nextCode = getNextCustomerCode(normalizedCustomers);
        setForm((prev) => ({
          ...prev,
          customer_code: prev.customer_code?.startsWith("CUST-")
            ? prev.customer_code
            : nextCode,
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
    if (!form.selected_brand_symbol) return;

    if (form.customer_brands.includes(form.selected_brand_symbol)) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      customer_brands: [...prev.customer_brands, prev.selected_brand_symbol],
      selected_brand_symbol: "",
    }));
  }

  function handleRemoveBrand(brandSymbol) {
    setForm((prev) => ({
      ...prev,
      customer_brands: prev.customer_brands.filter(
        (item) => item !== brandSymbol
      ),
    }));
  }

  function resetForm() {
    const nextCode = getNextCustomerCode(rows);
    setForm(buildEmptyForm(nextCode));
    setEditingId(null);
    setErrorMsg("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.customer_name.trim()) {
      setErrorMsg("Customer Name is required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");

      const normalizedBrands = normalizeBrandList(form.customer_brands);

      const payload = {
        customer_code: form.customer_code.trim() || getNextCustomerCode(rows),
        customer_name: form.customer_name.trim(),
        customer_brand: form.customer_brand.trim() || null,
        customer_brands: normalizedBrands,
        contact_person: form.contact_person.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        country: form.country.trim() || null,
        city: form.city.trim() || null,
        address: form.address.trim() || null,
        status: form.status || "active",
        notes: form.notes.trim() || null,
      };

      if (editingId) {
        await updateCustomer(editingId, payload);
      } else {
        await createCustomer(payload);
      }

      const refreshed = await getCustomers();
      const normalizedRows = (refreshed || []).map((row) => ({
        ...row,
        customer_brands: normalizeBrandList(row.customer_brands),
      }));

      setRows(normalizedRows);
      setForm(buildEmptyForm(getNextCustomerCode(normalizedRows)));
      setEditingId(null);
    } catch (error) {
      console.error("Save customer error:", error);
      setErrorMsg(error.message || "Failed to save customer.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(row) {
    setEditingId(row.id);
    setForm({
      customer_code: row.customer_code || "",
      customer_name: row.customer_name || "",
      customer_brand: row.customer_brand || "",
      customer_brands: normalizeBrandList(row.customer_brands),
      selected_brand_symbol: "",
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
  }

  async function handleDelete(id) {
    const ok = window.confirm("Are you sure you want to delete this customer?");
    if (!ok) return;

    try {
      await deleteCustomer(id);

      const refreshed = await getCustomers();
      const normalizedRows = (refreshed || []).map((row) => ({
        ...row,
        customer_brands: normalizeBrandList(row.customer_brands),
      }));

      setRows(normalizedRows);

      if (editingId === id) {
        setForm(buildEmptyForm(getNextCustomerCode(normalizedRows)));
        setEditingId(null);
      }
    } catch (error) {
      console.error("Delete customer error:", error);
      setErrorMsg(error.message || "Failed to delete customer.");
    }
  }

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
          <label>Customer Symbol</label>
          <input
            type="text"
            name="customer_brand"
            value={form.customer_brand}
            onChange={handleChange}
            placeholder="Customer Symbol"
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
              {brands.map((brand) => (
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

          {form.customer_brands.length > 0 && (
            <div
              style={{
                marginTop: "8px",
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {form.customer_brands.map((brandSymbol) => (
                <div
                  key={brandSymbol}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#eef2ff",
                    padding: "6px 10px",
                    borderRadius: "16px",
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
                <th>Customer Brands</th>
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
                    <td>{row.customer_brand || ""}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {Array.isArray(row.customer_brands) && row.customer_brands.length > 0 ? (
                          row.customer_brands.map((brandSymbol, index) => (
                            <div key={`${row.id}-${brandSymbol}-${index}`}>
                              {brandSymbol}
                            </div>
                          ))
                        ) : row.customer_brand ? (
                          <div>{row.customer_brand}</div>
                        ) : null}
                      </div>
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
    </div>
  );
}