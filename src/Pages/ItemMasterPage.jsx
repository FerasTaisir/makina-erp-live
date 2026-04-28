import React, { useEffect, useMemo, useState } from "react";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} from "../services/itemsService";

const emptyForm = {
  item_code: "",
  item_name: "",
  notes: "",
  status: "active",
};

function extractItemCodeNumber(code) {
  const match = String(code || "").match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function getNextItemCode(rows) {
  let maxNumber = 0;

  rows.forEach((row) => {
    const num = extractItemCodeNumber(row?.item_code);
    if (num > maxNumber) maxNumber = num;
  });

  const next = maxNumber + 1;
  return `ITM-${String(next).padStart(4, "0")}`;
}

export default function ItemMasterPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    ...emptyForm,
    item_code: "ITM-0001",
  });
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "item_code",
    direction: "asc",
  });

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await getItems();
      const sorted = [...(data || [])].sort((a, b) => {
        const numA = extractItemCodeNumber(a.item_code);
        const numB = extractItemCodeNumber(b.item_code);
        return numA - numB;
      });

      setRows(sorted);

      if (!editingId) {
        setForm((prev) => ({
          ...prev,
          item_code:
            prev.item_code && prev.item_code.startsWith("ITM-")
              ? prev.item_code
              : getNextItemCode(sorted),
        }));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function clearForm() {
    setEditingId(null);
    setError("");
    setMessage("");
    setForm({
      ...emptyForm,
      item_code: getNextItemCode(rows),
    });
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

  function getSortIcon(key) {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!form.item_name.trim()) {
      setError("Item Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        item_code: form.item_code.trim(),
        item_name: form.item_name.trim(),
        notes: form.notes.trim() || null,
        status: form.status || "active",
      };

      if (editingId) {
        await updateItem(editingId, payload);
        setMessage("Item updated successfully.");
      } else {
        await createItem(payload);
        setMessage("Item added successfully.");
      }

      const refreshed = await getItems();
      const sorted = [...(refreshed || [])].sort((a, b) => {
        const numA = extractItemCodeNumber(a.item_code);
        const numB = extractItemCodeNumber(b.item_code);
        return numA - numB;
      });

      setRows(sorted);
      setEditingId(null);
      setForm({
        ...emptyForm,
        item_code: getNextItemCode(sorted),
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save item.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(row) {
    setEditingId(row.id);
    setError("");
    setMessage("");

    setForm({
      item_code: row.item_code || "",
      item_name: row.item_name || "",
      notes: row.notes || "",
      status: row.status || "active",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(row) {
    const ok = window.confirm(
      `Delete item?\n\n${row.item_code || ""} | ${row.item_name || ""}`
    );
    if (!ok) return;

    try {
      setError("");
      setMessage("");

      await deleteItem(row.id);

      const refreshed = await getItems();
      const sorted = [...(refreshed || [])].sort((a, b) => {
        const numA = extractItemCodeNumber(a.item_code);
        const numB = extractItemCodeNumber(b.item_code);
        return numA - numB;
      });

      setRows(sorted);
      setMessage("Item deleted successfully.");

      if (editingId === row.id) {
        setEditingId(null);
        setForm({
          ...emptyForm,
          item_code: getNextItemCode(sorted),
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete item.");
    }
  }

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) => {
      return (
        String(row.item_code || "").toLowerCase().includes(q) ||
        String(row.item_name || "").toLowerCase().includes(q) ||
        String(row.notes || "").toLowerCase().includes(q) ||
        String(row.status || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  const sortedRows = useMemo(() => {
    const data = [...filteredRows];

    data.sort((a, b) => {
      let valueA = a?.[sortConfig.key];
      let valueB = b?.[sortConfig.key];

      if (sortConfig.key === "item_code") {
        valueA = extractItemCodeNumber(valueA);
        valueB = extractItemCodeNumber(valueB);
      } else {
        valueA = String(valueA || "").toLowerCase();
        valueB = String(valueB || "").toLowerCase();
      }

      if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [filteredRows, sortConfig]);

  return (
    <div className="page-shell">
      <div className="page-title-wrap">
        <h1>Item Master</h1>
        <p>Create and manage item list</p>
      </div>

      <div className="page-card">
        <form onSubmit={handleSave} className="form-grid item-form-grid">
          <div className="form-group">
            <label>Item Code</label>
            <input
              type="text"
              name="item_code"
              value={form.item_code}
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              name="item_name"
              value={form.item_name}
              onChange={handleChange}
              placeholder="Item Name"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Notes</label>
            <input
              type="text"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Notes"
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update" : "Add"}
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

      <div className="table-card">
        <div className="item-list-header">
          <h2>Item List</h2>
        </div>

        <div className="toolbar-card-inner">
          <input
            type="text"
            placeholder="Search by code, name, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="item-list-scroll">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>
                    <button
                      type="button"
                      className="sort-header"
                      onClick={() => handleSort("item_code")}
                    >
                      Code <span>{getSortIcon("item_code")}</span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="sort-header"
                      onClick={() => handleSort("item_name")}
                    >
                      Item Name <span>{getSortIcon("item_name")}</span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="sort-header"
                      onClick={() => handleSort("notes")}
                    >
                      Notes <span>{getSortIcon("notes")}</span>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      className="sort-header"
                      onClick={() => handleSort("status")}
                    >
                      Status <span>{getSortIcon("status")}</span>
                    </button>
                  </th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-cell">
                      No items found.
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((row, index) => (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td>{row.item_code}</td>
                      <td>{row.item_name}</td>
                      <td>{row.notes || "-"}</td>
                      <td>
                        <span
                          className={
                            row.status === "active"
                              ? "status-badge active"
                              : "status-badge inactive"
                          }
                        >
                          {row.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() => handleEdit(row)}
                        >
                          Edit
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => handleDelete(row)}
                        >
                          Delete
                        </button>
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

        .form-grid {
          display: grid;
          gap: 14px;
        }

        .item-form-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .full-width {
          grid-column: 1 / -1;
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
        .search-input {
          height: 46px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 0 14px;
          font-size: 15px;
          background: #fff;
          outline: none;
          color: #1f2937;
        }

        .readonly-input {
          background: #f1f5f9 !important;
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

        .table-card {
          overflow: hidden;
        }

        .item-list-header {
          padding: 22px 22px 12px;
        }

        .item-list-header h2 {
          margin: 0;
          font-size: 22px;
          color: #1e3a5f;
        }

        .toolbar-card-inner {
          padding: 0 22px 16px;
        }

        .item-list-scroll {
          max-height: 460px;
          overflow-y: auto;
          overflow-x: auto;
          padding: 0 22px 22px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 820px;
          background: #fff;
        }

        .data-table thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          background: #f1f5f9;
          color: #1e3a5f;
          text-align: left;
          padding: 16px 18px;
          font-size: 14px;
          border-bottom: 1px solid #dbe3ee;
        }

        .sort-header {
          height: auto;
          padding: 0;
          border: none;
          border-radius: 0;
          background: transparent;
          color: #1e3a5f;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .sort-header span {
          font-size: 13px;
          color: #475569;
        }

        .data-table tbody td {
          padding: 16px 18px;
          border-bottom: 1px solid #edf2f7;
          font-size: 15px;
          color: #1f2937;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 112px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 700;
        }

        .status-badge.active {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #86efac;
        }

        .status-badge.inactive {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .btn-edit {
          background: #2563eb;
          color: white;
          height: 40px;
          padding: 0 18px;
          border-radius: 10px;
        }

        .btn-delete {
          background: #ef4444;
          color: white;
          height: 40px;
          padding: 0 18px;
          border-radius: 10px;
        }

        .loading,
        .empty-cell {
          text-align: center;
          padding: 24px;
          color: #64748b;
        }

        @media (max-width: 1100px) {
          .item-form-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .item-form-grid {
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