import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

function generateDisplay(row) {
  const brand = row.brand_symbol || "";
  const packing = row.packing || "";
  const can = row.can_color || "";
  const carton = row.carton_color || "";

  if (can || carton) {
    return `${brand} ${packing} (${can}${can && carton ? ", " : ""}${carton})`;
  }

  return `${brand} ${packing}`;
}

function compareValuesAsc(a, b) {
  const aValue = String(a ?? "").trim();
  const bValue = String(b ?? "").trim();

  const aNum = Number(aValue);
  const bNum = Number(bValue);

  const aIsNum = aValue !== "" && !Number.isNaN(aNum);
  const bIsNum = bValue !== "" && !Number.isNaN(bNum);

  if (aIsNum && bIsNum) return aNum - bNum;
  if (aIsNum && !bIsNum) return -1;
  if (!aIsNum && bIsNum) return 1;

  return aValue.localeCompare(bValue, undefined, {
    sensitivity: "base",
    numeric: true,
  });
}

function compareRows(a, b, sortConfig) {
  const { key, direction } = sortConfig;
  const dir = direction === "asc" ? 1 : -1;

  let aValue = "";
  let bValue = "";

  if (key === "display") {
    aValue = generateDisplay(a);
    bValue = generateDisplay(b);
  } else {
    aValue = a?.[key] ?? "";
    bValue = b?.[key] ?? "";
  }

  return compareValuesAsc(aValue, bValue) * dir;
}

export default function PackingBrandPage() {
  const [rows, setRows] = useState([]);
  const [brands, setBrands] = useState([]);
  const [packingOptions, setPackingOptions] = useState([]);
  const [canColors, setCanColors] = useState([]);
  const [cartonColors, setCartonColors] = useState([]);

  const [form, setForm] = useState({
    brand_symbol: "",
    packing: "",
    can_color: "",
    carton_color: "",
    pack_per_pallet: "",
    packing_empty_weight: "",
    packing_price: "",
  });

  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [brandFilter, setBrandFilter] = useState("");
  const [packingFilter, setPackingFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "sort_order",
    direction: "asc",
  });

  async function loadBrands() {
    const { data, error } = await supabase.from("brands").select("*");
    if (error) throw error;

    const mapped = (data || [])
      .map((row) => ({
        id: row.id,
        value:
          row.brand_symbol ||
          row.symbol ||
          row.brand_code ||
          row.code ||
          row.brand ||
          row.name ||
          "",
      }))
      .filter((row) => row.value);

    const unique = Array.from(
      new Map(mapped.map((item) => [String(item.value), item])).values()
    ).sort((a, b) => compareValuesAsc(a.value, b.value));

    setBrands(unique);
  }

  async function loadPackingOptions() {
    const { data, error } = await supabase
      .from("packing_master")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) throw error;

    const mapped = (data || [])
      .map((row) => ({
        id: row.id,
        value: row.packing || "",
      }))
      .filter((row) => row.value);

    const unique = Array.from(
      new Map(mapped.map((item) => [String(item.value), item])).values()
    );

    setPackingOptions(unique);
  }

  async function loadPackingDataColors() {
    const { data, error } = await supabase
      .from("packaging_definitions")
      .select("category, value")
      .in("category", ["can_color", "carton_color"]);

    if (error) throw error;

    const can = [];
    const carton = [];

    (data || []).forEach((row) => {
      if (row.category === "can_color") can.push(row.value);
      if (row.category === "carton_color") carton.push(row.value);
    });

    setCanColors([...new Set(can)].sort(compareValuesAsc));
    setCartonColors([...new Set(carton)].sort(compareValuesAsc));
  }

  async function loadRows() {
    const { data, error } = await supabase
      .from("packing_brand")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) throw error;

    setRows(data || []);
  }

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      await Promise.all([
        loadBrands(),
        loadPackingOptions(),
        loadPackingDataColors(),
        loadRows(),
      ]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load Packing Brand data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filteredAndSortedRows = useMemo(() => {
    const filtered = rows.filter((row) => {
      const brandMatch = brandFilter
        ? String(row.brand_symbol || "") === String(brandFilter)
        : true;

      const packingMatch = packingFilter
        ? String(row.packing || "") === String(packingFilter)
        : true;

      return brandMatch && packingMatch;
    });

    return [...filtered].sort((a, b) => compareRows(a, b, sortConfig));
  }, [rows, brandFilter, packingFilter, sortConfig]);

  function clearForm() {
    setForm({
      brand_symbol: "",
      packing: "",
      can_color: "",
      carton_color: "",
      pack_per_pallet: "",
      packing_empty_weight: "",
      packing_price: "",
    });
    setEditingId("");
    setMessage("");
    setError("");
  }

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSort(key) {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        direction: "asc",
      };
    });
  }

  function getSortIndicator(key) {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  }

  async function handleSave() {
    if (!form.brand_symbol || !form.packing) {
      setError("Please select Brand Symbol and Packing.");
      setMessage("");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        brand_symbol: form.brand_symbol,
        packing: form.packing,
        can_color: form.can_color || null,
        carton_color: form.carton_color || null,
        pack_per_pallet:
          form.pack_per_pallet === "" ? null : Number(form.pack_per_pallet),
        packing_empty_weight:
          form.packing_empty_weight === ""
            ? null
            : Number(form.packing_empty_weight),
        packing_price:
          form.packing_price === "" ? null : Number(form.packing_price),
      };

      const duplicate = rows.find(
        (row) =>
          String(row.id) !== String(editingId || "") &&
          String(row.brand_symbol || "") === String(payload.brand_symbol) &&
          String(row.packing || "") === String(payload.packing) &&
          String(row.can_color || "") === String(payload.can_color || "") &&
          String(row.carton_color || "") === String(payload.carton_color || "")
      );

      if (duplicate) {
        setError("This Brand Packing combination already exists.");
        return;
      }

      if (editingId) {
        const { error } = await supabase
          .from("packing_brand")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
        setMessage("Packing Brand updated successfully.");
      } else {
        const nextSortOrder =
          rows.length > 0
            ? Math.max(...rows.map((row) => Number(row.sort_order || 0))) + 1
            : 1;

        const { error } = await supabase
          .from("packing_brand")
          .insert([{ ...payload, sort_order: nextSortOrder }]);

        if (error) throw error;
        setMessage("Packing Brand added successfully.");
      }

      clearForm();
      await loadRows();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save Packing Brand.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(row) {
    setForm({
      brand_symbol: row.brand_symbol || "",
      packing: row.packing || "",
      can_color: row.can_color || "",
      carton_color: row.carton_color || "",
      pack_per_pallet:
        row.pack_per_pallet === null || row.pack_per_pallet === undefined
          ? ""
          : row.pack_per_pallet,
      packing_empty_weight:
        row.packing_empty_weight === null || row.packing_empty_weight === undefined
          ? ""
          : row.packing_empty_weight,
      packing_price:
        row.packing_price === null || row.packing_price === undefined
          ? ""
          : row.packing_price,
    });
    setEditingId(row.id);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(row) {
    const ok = window.confirm(
      `Delete this Packing Brand?\n\n${generateDisplay(row)}`
    );
    if (!ok) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const { error } = await supabase
        .from("packing_brand")
        .delete()
        .eq("id", row.id);

      if (error) throw error;

      if (String(editingId) === String(row.id)) {
        clearForm();
      }

      setMessage("Packing Brand deleted successfully.");
      await loadRows();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete Packing Brand.");
    } finally {
      setSaving(false);
    }
  }

  async function handleMove(row, direction) {
    const currentIndex = rows.findIndex((item) => String(item.id) === String(row.id));
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) return;

    const currentRow = rows[currentIndex];
    const targetRow = rows[targetIndex];

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const { error: error1 } = await supabase
        .from("packing_brand")
        .update({ sort_order: targetRow.sort_order })
        .eq("id", currentRow.id);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from("packing_brand")
        .update({ sort_order: currentRow.sort_order })
        .eq("id", targetRow.id);

      if (error2) throw error2;

      setMessage("Order updated successfully.");
      await loadRows();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-title-wrap">
        <h1>Packing Brand</h1>
        <p>Define brand-specific packing setup</p>
      </div>

      <div className="page-card">
        <div className="form-grid four-cols">
          <div className="form-group">
            <label>Brand Symbol</label>
            <select
              value={form.brand_symbol}
              onChange={(e) => handleChange("brand_symbol", e.target.value)}
            >
              <option value="">Select Brand Symbol</option>
              {brands.map((item) => (
                <option key={`${item.id}-${item.value}`} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Packing</label>
            <select
              value={form.packing}
              onChange={(e) => handleChange("packing", e.target.value)}
            >
              <option value="">Select Packing</option>
              {packingOptions.map((item) => (
                <option key={`${item.id}-${item.value}`} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Can Color</label>
            <select
              value={form.can_color}
              onChange={(e) => handleChange("can_color", e.target.value)}
            >
              <option value="">Select Can Color</option>
              {canColors.map((value, index) => (
                <option key={`${value}-${index}`} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Carton Color</label>
            <select
              value={form.carton_color}
              onChange={(e) => handleChange("carton_color", e.target.value)}
            >
              <option value="">Select Carton Color</option>
              {cartonColors.map((value, index) => (
                <option key={`${value}-${index}`} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Pack/Pallet</label>
            <input
              type="number"
              step="0.01"
              value={form.pack_per_pallet}
              onChange={(e) => handleChange("pack_per_pallet", e.target.value)}
              placeholder="Enter Pack/Pallet"
            />
          </div>

          <div className="form-group">
            <label>Packing Empty Weight</label>
            <input
              type="number"
              step="0.001"
              value={form.packing_empty_weight}
              onChange={(e) =>
                handleChange("packing_empty_weight", e.target.value)
              }
              placeholder="Enter Empty Weight"
            />
          </div>

          <div className="form-group">
            <label>Packing Price</label>
            <input
              type="number"
              step="0.0001"
              value={form.packing_price}
              onChange={(e) => handleChange("packing_price", e.target.value)}
              placeholder="Enter Packing Price"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleSave} disabled={saving}>
              {editingId ? "Save" : "Add"}
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
        </div>
      </div>

      <div className="filter-card">
        <div className="filter-grid">
          <div className="form-group">
            <label>Filter by Brand</label>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map((item) => (
                <option key={`filter-brand-${item.id}-${item.value}`} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Filter by Packing</label>
            <select
              value={packingFilter}
              onChange={(e) => setPackingFilter(e.target.value)}
            >
              <option value="">All Packing</option>
              {packingOptions.map((item) => (
                <option key={`filter-packing-${item.id}-${item.value}`} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setBrandFilter("");
                setPackingFilter("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div className="empty-state">Loading Packing Brand...</div>
          ) : filteredAndSortedRows.length === 0 ? (
            <div className="empty-state">No Packing Brand records found.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort("sort_order")}>
                    No. <span>{getSortIndicator("sort_order")}</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("brand_symbol")}>
                    Brand Symbol <span>{getSortIndicator("brand_symbol")}</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("packing")}>
                    Packing <span>{getSortIndicator("packing")}</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("can_color")}>
                    Can Color <span>{getSortIndicator("can_color")}</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("carton_color")}>
                    Carton Color <span>{getSortIndicator("carton_color")}</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("display")}>
                    Display <span>{getSortIndicator("display")}</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("pack_per_pallet")}>
                    Pack/Pallet <span>{getSortIndicator("pack_per_pallet")}</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("packing_empty_weight")}>
                    Packing Empty Weight <span>{getSortIndicator("packing_empty_weight")}</span>
                  </th>
                  <th className="sortable" onClick={() => handleSort("packing_price")}>
                    Packing Price <span>{getSortIndicator("packing_price")}</span>
                  </th>
                  <th style={{ width: "230px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedRows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.brand_symbol || ""}</td>
                    <td>{row.packing || ""}</td>
                    <td>{row.can_color || ""}</td>
                    <td>{row.carton_color || ""}</td>
                    <td>{generateDisplay(row)}</td>
                    <td>{row.pack_per_pallet ?? ""}</td>
                    <td>{row.packing_empty_weight ?? ""}</td>
                    <td>{row.packing_price ?? ""}</td>
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
                          className="btn-order"
                          onClick={() => handleMove(row, "up")}
                          disabled={saving || index === 0}
                          title="Move Up"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          className="btn-order"
                          onClick={() => handleMove(row, "down")}
                          disabled={saving || index === filteredAndSortedRows.length - 1}
                          title="Move Down"
                        >
                          ↓
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
                ))}
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
          overflow: hidden;
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
        .filter-card,
        .table-card {
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 8px 26px rgba(15, 23, 42, 0.08);
          border: 1px solid #e5e7eb;
          max-width: 1280px;
          margin: 0 auto 22px;
        }
        .page-card,
        .filter-card {
          padding: 26px 22px;
        }
        .table-card {
          padding: 0;
          overflow: hidden;
        }
        .form-grid,
        .filter-grid {
          display: grid;
          gap: 14px;
        }
        .four-cols {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .filter-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: end;
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
        .form-group select {
          height: 46px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 0 14px;
          font-size: 14px;
          outline: none;
          background: #fff;
        }
        .form-actions {
          display: flex;
          align-items: end;
          gap: 10px;
          grid-column: span 4;
          margin-top: 4px;
        }
        .filter-actions {
          display: flex;
          align-items: end;
          gap: 10px;
        }
        .form-actions button,
        .filter-actions button,
        .table-actions button {
          height: 38px;
          border-radius: 8px;
          padding: 0 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          border: none;
        }
        .form-actions button:first-child {
          background: #111827;
          color: #fff;
        }
        .btn-secondary {
          background: #d1d5db;
          color: #111827;
        }
        .btn-edit {
          background: #2563eb;
          color: #fff;
        }
        .btn-delete {
          background: #dc2626;
          color: #fff;
        }
        .btn-order {
          background: #0f172a;
          color: #fff;
          min-width: 32px;
          padding: 0 10px !important;
        }
        .form-actions button:disabled,
        .table-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .alert {
          max-width: 1280px;
          margin: 0 auto 16px;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
        }
        .alert.success {
          background: #ecfdf5;
          color: #166534;
          border: 1px solid #bbf7d0;
        }
        .alert.error {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        .table-scroll {
          overflow: auto;
          max-height: 420px;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1400px;
        }
        .data-table th,
        .data-table td {
          padding: 12px 14px;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
          font-size: 14px;
          vertical-align: middle;
        }
        .data-table th {
          background: #f1f5f9;
          color: #334155;
          font-weight: 700;
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 2;
        }
        .data-table th.sortable {
          cursor: pointer;
          user-select: none;
        }
        .data-table th.sortable span {
          margin-left: 6px;
          font-size: 12px;
        }
        .data-table tbody tr:hover {
          background: #f8fafc;
        }
        .table-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          align-items: center;
        }
        .empty-state {
          padding: 28px;
          text-align: center;
          color: #64748b;
          font-weight: 600;
        }
        @media (max-width: 1100px) {
          .four-cols {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .filter-grid {
            grid-template-columns: 1fr;
          }
          .form-actions {
            grid-column: span 2;
          }
        }
        @media (max-width: 700px) {
          .four-cols {
            grid-template-columns: 1fr;
          }
          .form-actions {
            grid-column: span 1;
            flex-wrap: wrap;
          }
          .table-scroll {
            max-height: 360px;
          }
        }
      `}</style>
    </div>
  );
}