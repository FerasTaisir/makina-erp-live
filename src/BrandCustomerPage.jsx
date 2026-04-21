import React, { useEffect, useMemo, useState } from "react";
import {
  fetchBrandCustomers,
  fetchBrandsLookup,
  fetchCustomersLookup,
  insertBrandCustomer,
  updateBrandCustomer,
  removeBrandCustomer,
} from "./services/brandCustomersService";

export default function BrandCustomerPage() {
  const emptyForm = {
    id: null,
    customer_id: "",
    brand_symbol: "",
    customer_brand: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const selectedCustomer = customers.find(
      (c) => String(c.id) === String(form.customer_id)
    );

    if (!selectedCustomer || !form.brand_symbol) {
      setForm((prev) => ({ ...prev, customer_brand: "" }));
      return;
    }

    const generated = `${form.brand_symbol}-${selectedCustomer.customer_symbol}`;
    setForm((prev) => ({ ...prev, customer_brand: generated }));
  }, [form.customer_id, form.brand_symbol, customers]);

  async function loadAll() {
    try {
      setLoading(true);

      const [customersData, brandsData, brandCustomerData] = await Promise.all([
        fetchCustomersLookup(),
        fetchBrandsLookup(),
        fetchBrandCustomers(),
      ]);

      setCustomers(customersData || []);
      setBrands(brandsData || []);
      setRows(brandCustomerData || []);
    } catch (error) {
      console.error("Load error:", error);
      alert(error.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setForm(emptyForm);
    setEditing(false);
  }

  async function handleSave() {
    if (!form.customer_id) {
      alert("Please select Customer");
      return;
    }

    if (!form.brand_symbol) {
      alert("Please select Brand Symbol");
      return;
    }

    if (!form.customer_brand) {
      alert("Customer Brand is empty");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        customer_id: form.customer_id,
        brand_symbol: form.brand_symbol,
        customer_brand: form.customer_brand,
      };

      if (editing && form.id) {
        await updateBrandCustomer(form.id, payload);
        alert("Customer Brand updated successfully");
      } else {
        await insertBrandCustomer(payload);
        alert("Customer Brand added successfully");
      }

      clearForm();
      await loadAll();
    } catch (error) {
      console.error("Save error:", error);

      if (
        error?.message?.includes("brand_customer_customer_brandsymbol_unique_idx")
      ) {
        alert("This brand is already linked to this customer.");
      } else {
        alert(error.message || "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(row) {
    setForm({
      id: row.id,
      customer_id: row.customer_id || "",
      brand_symbol: row.brand_symbol || "",
      customer_brand: row.customer_brand || "",
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const ok = window.confirm("Are you sure you want to delete this record?");
    if (!ok) return;

    try {
      await removeBrandCustomer(id);

      if (form.id === id) {
        clearForm();
      }

      await loadAll();
      alert("Deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Failed to delete");
    }
  }

  const customerMap = useMemo(() => {
    const map = {};
    customers.forEach((customer) => {
      map[customer.id] = customer;
    });
    return map;
  }, [customers]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) => {
      const customer = customerMap[row.customer_id] || {};
      const customerCode = (customer.customer_code || "").toLowerCase();
      const customerSymbol = (customer.customer_symbol || "").toLowerCase();
      const customerName = (customer.customer_name || "").toLowerCase();
      const brandSymbol = (row.brand_symbol || "").toLowerCase();
      const customerBrand = (row.customer_brand || "").toLowerCase();

      return (
        customerCode.includes(q) ||
        customerSymbol.includes(q) ||
        customerName.includes(q) ||
        brandSymbol.includes(q) ||
        customerBrand.includes(q)
      );
    });
  }, [rows, search, customerMap]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Customer Brand</h1>
        <p>Link each customer with a brand symbol and generate Customer Brand automatically</p>
      </div>

      <div className="form-card">
        <div
          className="form-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <div className="form-group">
            <label>Customer</label>
            <select
              value={form.customer_id}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  customer_id: e.target.value,
                }))
              }
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.customer_code} - {customer.customer_symbol} - {customer.customer_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Brand Symbol</label>
            <select
              value={form.brand_symbol}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  brand_symbol: e.target.value,
                }))
              }
            >
              <option value="">Select Brand Symbol</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.brand_symbol}>
                  {brand.brand_symbol}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Customer Brand</label>
            <input
              type="text"
              value={form.customer_brand}
              placeholder="Generated automatically"
              readOnly
            />
          </div>
        </div>

        <div
          className="button-row"
          style={{ display: "flex", gap: "10px", marginTop: "18px" }}
        >
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : editing ? "Update" : "Add"}
          </button>

          <button className="btn btn-secondary" onClick={clearForm}>
            Clear
          </button>
        </div>
      </div>

      <div className="search-card" style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Search by Customer Code / Customer Symbol / Customer Name / Brand Symbol / Customer Brand"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-card" style={{ marginTop: "20px" }}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Code</th>
                <th>Customer Symbol</th>
                <th>Customer Name</th>
                <th>Brand Symbol</th>
                <th>Customer Brand</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center" }}>
                    No data found
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const customer = customerMap[row.customer_id] || {};

                  return (
                    <tr key={row.id}>
                      <td>{customer.customer_code || "-"}</td>
                      <td>{customer.customer_symbol || "-"}</td>
                      <td>{customer.customer_name || "-"}</td>
                      <td>{row.brand_symbol || "-"}</td>
                      <td>{row.customer_brand || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <button
                            className="btn btn-edit"
                            onClick={() => handleEdit(row)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-delete"
                            onClick={() => handleDelete(row.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}