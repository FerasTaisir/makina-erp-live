import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const emptyForm = {
  id: "",
  customer_id: "",
  customer_brand_id: "",
  sub_brand: "",
  item_id: "",
  description: "",
};

export default function CustomerItemsPage() {
  const [customers, setCustomers] = useState([]);
  const [customerBrands, setCustomerBrands] = useState([]);
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function getCustomerLabel(customer) {
    return `${customer?.customer_code || ""} - ${customer?.customer_symbol || ""}`.trim();
  }

  function getItemLabel(item) {
    return item?.item_name || item?.item_code || item?.id || "";
  }

  function getFullItemName(row) {
    const subBrand = String(row.sub_brand || "").trim();
    const item = String(row.item || "").trim();

    if (subBrand) {
      return `${subBrand} ${item}`.trim();
    }

    return item;
  }

  function extractCustomerCodeNumber(code) {
    const match = String(code || "").match(/(\d+)/);
    return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
  }

  function extractSAE(text) {
    const match = String(text || "").match(/SAE\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
  }

  function extractAPI(text) {
    const match = String(text || "").match(/API\s*([A-Z]+)/i);
    return match ? match[1] : "ZZZ";
  }

  async function loadCustomerBrands(customerId) {
    if (!customerId) {
      setCustomerBrands([]);
      return;
    }

    const { data, error } = await supabase
      .from("brand_customer")
      .select("id, customer_id, customer_brand, brand_symbol")
      .eq("customer_id", customerId)
      .order("customer_brand", { ascending: true });

    if (error) {
      console.error(error);
      setCustomerBrands([]);
      return;
    }

    setCustomerBrands(data || []);
  }

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [customersRes, itemsRes, rowsRes] = await Promise.all([
        supabase.from("customers").select("*"),
        supabase.from("item_master").select("*"),
        supabase.from("v_customer_items").select("*"),
      ]);

      if (customersRes.error) throw customersRes.error;
      if (itemsRes.error) throw itemsRes.error;
      if (rowsRes.error) throw rowsRes.error;

      const customersData = customersRes.data || [];
      const itemsData = itemsRes.data || [];
      const rowsData = rowsRes.data || [];

      customersData.sort((a, b) =>
        getCustomerLabel(a).localeCompare(getCustomerLabel(b))
      );

      itemsData.sort((a, b) =>
        getItemLabel(a).localeCompare(getItemLabel(b))
      );

      setCustomers(customersData);
      setItems(itemsData);
      setRows(rowsData);

      if (form.customer_id) {
        await loadCustomerBrands(form.customer_id);
      } else {
        setCustomerBrands([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredRows = useMemo(() => {
    let result = [...rows];

    if (customerFilter !== "all") {
      result = result.filter((row) => row.customer_code === customerFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((row) => {
        const fullItemName = getFullItemName(row);

        return (
          String(row.customer_code || "").toLowerCase().includes(q) ||
          String(row.customer_symbol || "").toLowerCase().includes(q) ||
          String(row.customer_brand || "").toLowerCase().includes(q) ||
          String(row.sub_brand || "").toLowerCase().includes(q) ||
          String(row.item || "").toLowerCase().includes(q) ||
          String(row.description || "").toLowerCase().includes(q) ||
          String(fullItemName || "").toLowerCase().includes(q)
        );
      });
    }

    result.sort((a, b) => {
      const customerNumberA = extractCustomerCodeNumber(a.customer_code);
      const customerNumberB = extractCustomerCodeNumber(b.customer_code);

      if (customerNumberA !== customerNumberB) {
        return customerNumberA - customerNumberB;
      }

      const customerCodeA = String(a.customer_code || "");
      const customerCodeB = String(b.customer_code || "");

      if (customerCodeA !== customerCodeB) {
        return customerCodeA.localeCompare(customerCodeB);
      }

      const customerBrandA = String(a.customer_brand || "");
      const customerBrandB = String(b.customer_brand || "");

      if (customerBrandA !== customerBrandB) {
        return customerBrandA.localeCompare(customerBrandB);
      }

      const fullItemA = getFullItemName(a);
      const fullItemB = getFullItemName(b);

      const saeA = extractSAE(fullItemA);
      const saeB = extractSAE(fullItemB);

      if (saeA !== saeB) {
        return saeA - saeB;
      }

      const apiA = extractAPI(fullItemA);
      const apiB = extractAPI(fullItemB);

      if (apiA !== apiB) {
        return apiA.localeCompare(apiB);
      }

      return fullItemA.localeCompare(fullItemB);
    });

    return result;
  }, [rows, search, customerFilter]);

  async function handleChange(e) {
    const { name, value } = e.target;

    if (name === "customer_id") {
      setForm((prev) => ({
        ...prev,
        customer_id: value,
        customer_brand_id: "",
      }));

      await loadCustomerBrands(value);
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function clearForm() {
    setForm(emptyForm);
    setCustomerBrands([]);
    setMessage("");
    setError("");
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!form.customer_id) {
      setError("Please select Customer.");
      return;
    }

    if (!form.customer_brand_id) {
      setError("Please select Customer-Brand.");
      return;
    }

    if (!form.item_id) {
      setError("Please select Item.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        customer_id: form.customer_id,
        customer_brand_id: form.customer_brand_id,
        sub_brand: form.sub_brand.trim() || null,
        item_id: form.item_id,
        description: form.description.trim() || null,
      };

      if (form.id) {
        const { error } = await supabase
          .from("customer_items")
          .update(payload)
          .eq("id", form.id);

        if (error) throw error;
        setMessage("Customer Item updated successfully.");
      } else {
        const { error } = await supabase
          .from("customer_items")
          .insert([payload]);

        if (error) throw error;
        setMessage("Customer Item added successfully.");
      }

      clearForm();
      loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save Customer Item.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(row) {
    setForm({
      id: row.id || "",
      customer_id: row.customer_id || "",
      customer_brand_id: row.customer_brand_id || "",
      sub_brand: row.sub_brand || "",
      item_id: row.item_id || "",
      description: row.description || "",
    });

    setMessage("");
    setError("");

    if (row.customer_id) {
      await loadCustomerBrands(row.customer_id);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(row) {
    const ok = window.confirm(
      `Delete Customer Item?\n\n${row.customer_symbol || ""} | ${
        row.customer_brand || ""
      } | ${getFullItemName(row)}`
    );

    if (!ok) return;

    try {
      setError("");
      setMessage("");

      const { error } = await supabase
        .from("customer_items")
        .delete()
        .eq("id", row.id);

      if (error) throw error;

      setMessage("Customer Item deleted successfully.");
      loadData();

      if (form.id === row.id) {
        clearForm();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete Customer Item.");
    }
  }

  return (
    <div className="page-shell">
      <div className="page-title-wrap">
        <h1>Customer Items</h1>
        <p>Link Item Master with each Customer / Customer-Brand</p>
      </div>

      <div className="page-card">
        <form onSubmit={handleSave} className="form-grid five-cols">
          <div className="form-group">
            <label>Customer</label>
            <select
              name="customer_id"
              value={form.customer_id}
              onChange={handleChange}
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {getCustomerLabel(customer)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Customer-Brand</label>
            <select
              name="customer_brand_id"
              value={form.customer_brand_id}
              onChange={handleChange}
              disabled={!form.customer_id}
            >
              <option value="">
                {!form.customer_id
                  ? "Select Customer first"
                  : customerBrands.length === 0
                  ? "No Customer-Brand found"
                  : "Select Customer-Brand"}
              </option>

              {customerBrands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.customer_brand}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Sub-Brand (Optional)</label>
            <input
              type="text"
              name="sub_brand"
              value={form.sub_brand}
              onChange={handleChange}
              placeholder="Leave blank if not applicable"
            />
          </div>

          <div className="form-group">
            <label>Item</label>
            <select
              name="item_id"
              value={form.item_id}
              onChange={handleChange}
            >
              <option value="">Select Item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {getItemLabel(item)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter description manually"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : form.id ? "Update" : "Add"}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={clearForm}
              disabled={saving}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <div className="toolbar-card">
        <div className="toolbar toolbar-three">
          <input
            type="text"
            placeholder="Search by Customer / Brand / Sub-Brand / Item / Description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          >
            <option value="all">All Customer Codes</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.customer_code}>
                {customer.customer_code}
              </option>
            ))}
          </select>

          <button type="button" className="btn-refresh" onClick={loadData}>
            Refresh
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer Code</th>
                  <th>Customer Symbol</th>
                  <th>Customer-Brand</th>
                  <th>Item</th>
                  <th>Description</th>
                  <th style={{ width: "180px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.customer_code}</td>
                      <td>{row.customer_symbol}</td>
                      <td>{row.customer_brand}</td>
                      <td>{getFullItemName(row)}</td>
                      <td>{row.description || ""}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-edit"
                            onClick={() => handleEdit(row)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() => handleDelete(row)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        .page-shell {
          padding: 28px 24px 40px;
          background: #f5f7fb;
          min-height: 100vh;
        }
        .page-title-wrap {
          text-align: center;
          margin-bottom: 20px;
        }
        .page-title-wrap h1 {
          margin: 0;
          font-size: 34px;
          font-weight: 700;
          color: #334155;
        }
        .page-title-wrap p {
          margin: 10px 0 0;
          font-size: 15px;
          color: #64748b;
        }
        .page-card,
        .toolbar-card,
        .table-card {
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 8px 26px rgba(15, 23, 42, 0.08);
          border: 1px solid #e5e7eb;
          max-width: 1140px;
          margin: 0 auto 22px;
        }
        .page-card {
          padding: 26px 22px;
        }
        .toolbar-card {
          padding: 18px 22px;
        }
        .table-card {
          padding: 0;
          overflow: hidden;
        }
        .form-grid {
          display: grid;
          gap: 14px;
        }
        .five-cols {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group label {
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #334155;
        }
        .form-group input,
        .form-group select,
        .toolbar input,
        .toolbar select {
          height: 46px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 0 14px;
          font-size: 15px;
          background: #fff;
          outline: none;
          color: #1f2937;
        }
        .form-actions {
          grid-column: 1 / -1;
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 10px;
        }
        button {
          border: none;
          border-radius: 10px;
          padding: 0 22px;
          height: 46px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .form-actions button:first-child {
          min-width: 150px;
          background: #1565f7;
          color: white;
        }
        .btn-secondary {
          min-width: 150px;
          background: #eef1f5;
          color: #475569;
          border: 1px solid #d7dce2;
        }
        .toolbar {
          display: grid;
          gap: 12px;
        }
        .toolbar-three {
          grid-template-columns: 1fr 220px 130px;
        }
        .btn-refresh {
          background: #6b7a99;
          color: white;
        }
        .alert {
          max-width: 1140px;
          margin: 0 auto 18px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 14px;
        }
        .alert.success {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        .alert.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .table-wrap {
          overflow-x: auto;
          overflow-y: auto;
          max-height: 500px;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1080px;
        }
        .data-table thead th {
          background: #f8fafc;
          color: #334155;
          text-align: left;
          padding: 16px 18px;
          font-size: 14px;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .data-table tbody td {
          padding: 16px 18px;
          border-bottom: 1px solid #edf2f7;
          font-size: 15px;
          color: #1f2937;
        }
        .table-actions {
          display: flex;
          gap: 10px;
        }
        .btn-edit {
          background: #f59e0b;
          color: white;
          height: 36px;
          padding: 0 18px;
          border-radius: 8px;
        }
        .btn-delete {
          background: #ef4444;
          color: white;
          height: 36px;
          padding: 0 18px;
          border-radius: 8px;
        }
        .loading,
        .empty-cell {
          text-align: center;
          padding: 24px;
          color: #64748b;
        }
        @media (max-width: 1100px) {
          .five-cols {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .toolbar-three {
            grid-template-columns: 1fr 1fr;
          }
          .btn-refresh {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 700px) {
          .five-cols {
            grid-template-columns: 1fr;
          }
          .toolbar-three {
            grid-template-columns: 1fr;
          }
          .form-actions {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
}