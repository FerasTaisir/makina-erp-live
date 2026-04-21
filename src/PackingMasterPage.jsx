import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

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

export default function PackingMasterPage() {
  const [rows, setRows] = useState([]);
  const [dropdowns, setDropdowns] = useState({
    pack_count: [],
    pack_size: [],
    pm_unit: [],
    pack_type: [],
  });

  const [form, setForm] = useState({
    pack_count: "",
    pack_size: "",
    pm_unit: "",
    pack_type: "",
  });

  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const packingPreview = useMemo(() => {
    if (!form.pack_count || !form.pack_size || !form.pm_unit) return "";
    return `${form.pack_count} X ${form.pack_size} ${form.pm_unit}`;
  }, [form.pack_count, form.pack_size, form.pm_unit]);

  async function loadDropdowns() {
    const { data, error } = await supabase
      .from("packaging_definitions")
      .select("category, value")
      .in("category", ["pack_count", "pack_size", "pm_unit", "pack_type"]);

    if (error) throw error;

    const grouped = {
      pack_count: [],
      pack_size: [],
      pm_unit: [],
      pack_type: [],
    };

    (data || []).forEach((row) => {
      if (!grouped[row.category]) grouped[row.category] = [];
      grouped[row.category].push(row.value);
    });

    grouped.pack_count = [...new Set(grouped.pack_count)].sort(compareValuesAsc);
    grouped.pack_size = [...new Set(grouped.pack_size)].sort(compareValuesAsc);
    grouped.pm_unit = [...new Set(grouped.pm_unit)].sort(compareValuesAsc);
    grouped.pack_type = [...new Set(grouped.pack_type)].sort(compareValuesAsc);

    setDropdowns(grouped);
  }

  async function loadRows() {
    const { data, error } = await supabase
      .from("packing_master")
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
      await Promise.all([loadDropdowns(), loadRows()]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load Packing Master data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function clearForm() {
    setForm({
      pack_count: "",
      pack_size: "",
      pm_unit: "",
      pack_type: "",
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

  async function handleAdd() {
    if (!form.pack_count || !form.pack_size || !form.pm_unit || !form.pack_type) {
      setError("Please select Pack Count, Pack Size, PM Unit, and Pack Type.");
      setMessage("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const packing = `${form.pack_count} X ${form.pack_size} ${form.pm_unit}`;

      const duplicate = rows.find(
        (row) =>
          String(row.pack_count || "") === String(form.pack_count) &&
          String(row.pack_size || "") === String(form.pack_size) &&
          String(row.pm_unit || "") === String(form.pm_unit) &&
          String(row.pack_type || "") === String(form.pack_type)
      );

      if (!editingId && duplicate) {
        setError("This Packing already exists.");
        return;
      }

      if (editingId) {
        const duplicateEdit = rows.find(
          (row) =>
            String(row.id) !== String(editingId) &&
            String(row.pack_count || "") === String(form.pack_count) &&
            String(row.pack_size || "") === String(form.pack_size) &&
            String(row.pm_unit || "") === String(form.pm_unit) &&
            String(row.pack_type || "") === String(form.pack_type)
        );

        if (duplicateEdit) {
          setError("This Packing already exists.");
          return;
        }

        const { error } = await supabase
          .from("packing_master")
          .update({
            pack_count: form.pack_count,
            pack_size: form.pack_size,
            pm_unit: form.pm_unit,
            pack_type: form.pack_type,
            packing,
          })
          .eq("id", editingId);

        if (error) throw error;

        setMessage("Packing updated successfully.");
      } else {
        const nextSortOrder =
          rows.length > 0
            ? Math.max(...rows.map((row) => Number(row.sort_order || 0))) + 1
            : 1;

        const { error } = await supabase.from("packing_master").insert([
          {
            pack_count: form.pack_count,
            pack_size: form.pack_size,
            pm_unit: form.pm_unit,
            pack_type: form.pack_type,
            packing,
            sort_order: nextSortOrder,
          },
        ]);

        if (error) throw error;

        setMessage("Packing added successfully.");
      }

      clearForm();
      await loadRows();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save Packing.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(row) {
    setForm({
      pack_count: row.pack_count || "",
      pack_size: row.pack_size || "",
      pm_unit: row.pm_unit || "",
      pack_type: row.pack_type || "",
    });
    setEditingId(row.id);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(row) {
    const ok = window.confirm(`Delete this Packing?\n\n${row.packing || ""}`);
    if (!ok) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const { error } = await supabase
        .from("packing_master")
        .delete()
        .eq("id", row.id);

      if (error) throw error;

      if (String(editingId) === String(row.id)) {
        clearForm();
      }

      setMessage("Packing deleted successfully.");
      await loadRows();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete Packing.");
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
        .from("packing_master")
        .update({ sort_order: targetRow.sort_order })
        .eq("id", currentRow.id);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from("packing_master")
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
        <h1>Packing Master</h1>
        <p>Create final packing combinations from Packing Data</p>
      </div>

      <div className="page-card">
        <div className="form-grid four-cols">
          <div className="form-group">
            <label>Pack Count</label>
            <select
              value={form.pack_count}
              onChange={(e) => handleChange("pack_count", e.target.value)}
            >
              <option value="">Select Pack Count</option>
              {dropdowns.pack_count.map((value, index) => (
                <option key={`${value}-${index}`} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Pack Size</label>
            <select
              value={form.pack_size}
              onChange={(e) => handleChange("pack_size", e.target.value)}
            >
              <option value="">Select Pack Size</option>
              {dropdowns.pack_size.map((value, index) => (
                <option key={`${value}-${index}`} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>PM Unit</label>
            <select
              value={form.pm_unit}
              onChange={(e) => handleChange("pm_unit", e.target.value)}
            >
              <option value="">Select PM Unit</option>
              {dropdowns.pm_unit.map((value, index) => (
                <option key={`${value}-${index}`} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Pack Type</label>
            <select
              value={form.pack_type}
              onChange={(e) => handleChange("pack_type", e.target.value)}
            >
              <option value="">Select Pack Type</option>
              {dropdowns.pack_type.map((value, index) => (
                <option key={`${value}-${index}`} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group span-4">
            <label>Packing Preview</label>
            <input
              type="text"
              value={packingPreview}
              readOnly
              placeholder="Packing will be generated automatically"
              className="readonly-input"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleAdd} disabled={saving}>
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

      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div className="empty-state">Loading Packing Master...</div>
          ) : rows.length === 0 ? (
            <div className="empty-state">No Packing records found yet. Select values and press Add.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Packing</th>
                  <th>Pack Type</th>
                  <th style={{ width: "220px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.packing || ""}</td>
                    <td>{row.pack_type || ""}</td>
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
                          disabled={saving || index === rows.length - 1}
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
        .table-card {
          padding: 0;
          overflow: hidden;
        }
        .form-grid {
          display: grid;
          gap: 14px;
        }
        .four-cols {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .span-4 {
          grid-column: span 4;
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
        .readonly-input {
          background: #f1f5f9 !important;
        }
        .form-actions {
          display: flex;
          align-items: end;
          gap: 10px;
          grid-column: span 4;
          margin-top: 4px;
        }
        .form-actions button,
        .table-actions button {
          height: 42px;
          border-radius: 10px;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border: none;
        }
        .form-actions button:first-child {
          background: #111827;
          color: #fff;
        }
        .btn-secondary {
          background: #e2e8f0;
          color: #0f172a;
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
          min-width: 42px;
          padding: 0 12px !important;
        }
        .form-actions button:disabled,
        .table-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .alert {
          max-width: 1140px;
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
          overflow-x: auto;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
        }
        .data-table th,
        .data-table td {
          padding: 14px 14px;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
          font-size: 14px;
        }
        .data-table th {
          background: #f8fafc;
          color: #334155;
          font-weight: 700;
        }
        .data-table tbody tr:hover {
          background: #f8fafc;
        }
        .table-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
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
          .span-4,
          .form-actions {
            grid-column: span 2;
          }
        }
        @media (max-width: 700px) {
          .four-cols {
            grid-template-columns: 1fr;
          }
          .span-4,
          .form-actions {
            grid-column: span 1;
          }
          .form-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}