import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

const emptyForm = {
  id: "",
  pallet_weight: "",
  pallet_size: "",
  pallet_high: "",
};

export default function PalletDataPage() {
  const [form, setForm] = useState(emptyForm);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const { data, error } = await supabase
        .from("pallet_data")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;

      const normalized = data || [];
      setRows(normalized);

      if (normalized.length > 0) {
        const first = normalized[0];
        setForm({
          id: first.id || "",
          pallet_weight:
            first.pallet_weight === null || first.pallet_weight === undefined
              ? ""
              : first.pallet_weight,
          pallet_size: first.pallet_size || "",
          pallet_high:
            first.pallet_high === null || first.pallet_high === undefined
              ? ""
              : first.pallet_high,
        });
      } else {
        setForm(emptyForm);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load pallet data.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function clearForm() {
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  async function handleSave() {
    if (
      String(form.pallet_weight).trim() === "" &&
      String(form.pallet_size).trim() === "" &&
      String(form.pallet_high).trim() === ""
    ) {
      setError("Please enter at least one value.");
      setMessage("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        pallet_weight:
          String(form.pallet_weight).trim() === ""
            ? null
            : Number(form.pallet_weight),
        pallet_size: String(form.pallet_size).trim() || null,
        pallet_high:
          String(form.pallet_high).trim() === ""
            ? null
            : Number(form.pallet_high),
      };

      if (form.id) {
        const { error } = await supabase
          .from("pallet_data")
          .update(payload)
          .eq("id", form.id);

        if (error) throw error;
        setMessage("Pallet Data updated successfully.");
      } else {
        const { error } = await supabase.from("pallet_data").insert([payload]);
        if (error) throw error;
        setMessage("Pallet Data added successfully.");
      }

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save pallet data.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(row) {
    setForm({
      id: row.id || "",
      pallet_weight:
        row.pallet_weight === null || row.pallet_weight === undefined
          ? ""
          : row.pallet_weight,
      pallet_size: row.pallet_size || "",
      pallet_high:
        row.pallet_high === null || row.pallet_high === undefined
          ? ""
          : row.pallet_high,
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(row) {
    const ok = window.confirm("Delete this pallet data row?");
    if (!ok) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const { error } = await supabase
        .from("pallet_data")
        .delete()
        .eq("id", row.id);

      if (error) throw error;

      if (String(form.id) === String(row.id)) {
        clearForm();
      }

      setMessage("Pallet Data deleted successfully.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete pallet data.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-title-wrap">
        <h1>Pallet Data</h1>
        <p>Define pallet master data used later across the ERP</p>
      </div>

      <div className="page-card">
        <div className="form-grid three-cols">
          <div className="form-group">
            <label>Pallet Weight</label>
            <input
              type="number"
              step="0.001"
              value={form.pallet_weight}
              onChange={(e) => handleChange("pallet_weight", e.target.value)}
              placeholder="Enter Pallet Weight"
            />
          </div>

          <div className="form-group">
            <label>Pallet Size</label>
            <input
              type="text"
              value={form.pallet_size}
              onChange={(e) => handleChange("pallet_size", e.target.value)}
              placeholder="Enter Pallet Size"
            />
          </div>

          <div className="form-group">
            <label>Pallet High</label>
            <input
              type="number"
              step="0.001"
              value={form.pallet_high}
              onChange={(e) => handleChange("pallet_high", e.target.value)}
              placeholder="Enter Pallet High"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : form.id ? "Save" : "Add"}
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

        {message ? <div className="alert success">{message}</div> : null}
        {error ? <div className="alert error">{error}</div> : null}
      </div>

      <div className="table-card">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="empty-state">No pallet data found.</div>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "70px" }}>No.</th>
                  <th>Pallet Weight</th>
                  <th>Pallet Size</th>
                  <th>Pallet High</th>
                  <th style={{ width: "180px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.pallet_weight ?? ""}</td>
                    <td>{row.pallet_size || ""}</td>
                    <td>{row.pallet_high ?? ""}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
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
          max-width: 1200px;
          margin: 0 auto 22px;
        }
        .page-card {
          padding: 22px;
        }
        .table-card {
          overflow: hidden;
        }
        .form-grid {
          display: grid;
          gap: 14px;
        }
        .three-cols {
          grid-template-columns: repeat(3, minmax(0, 1fr));
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
        .form-group input {
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
          gap: 10px;
          margin-top: 18px;
          flex-wrap: wrap;
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
        .alert {
          margin-top: 14px;
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
        }
        .data-table th,
        .data-table td {
          padding: 12px 14px;
          border-bottom: 1px solid #e5e7eb;
          text-align: left;
          font-size: 14px;
        }
        .data-table th {
          background: #f8fafc;
          color: #334155;
          font-weight: 700;
        }
        .table-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .empty-state {
          padding: 24px;
          text-align: center;
          color: #64748b;
          font-weight: 600;
        }
        @media (max-width: 900px) {
          .three-cols {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}