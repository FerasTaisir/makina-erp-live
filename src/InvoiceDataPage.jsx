import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

const CATEGORY_CONFIG = [
  {
    key: "currency",
    title: "Currency",
    description: "Define invoice currency",
    placeholder: "Ex: USD / EUR / AED",
  },
  {
    key: "payment",
    title: "Payment",
    description: "Define invoice payment method",
    placeholder: "Ex: Cash / T.T / L.C / Advance Payment",
  },
  {
    key: "port_of_loading",
    title: "Port of Loading",
    description: "Define port of loading",
    placeholder: "Ex: Jebel Ali / Shanghai / Mersin",
  },
  {
    key: "packing",
    title: "Packing",
    description: "Define and describe packing types used in invoice",
    placeholder: "Ex: 12 x 1L Carton / 24 x 500ml Bottle",
  },
  {
    key: "offer_type",
    title: "Offer Type",
    description: "Define invoice / offer type",
    placeholder: "Ex: Proforma Invoice / Commercial Invoice / Offer",
  },
  {
    key: "price_as",
    title: "Price as",
    description: "Define pricing format",
    placeholder: "Ex: Per Unit / Per Carton / Per MT / Lump Sum",
  },
];

function createInitialForms() {
  return CATEGORY_CONFIG.reduce((acc, item) => {
    acc[item.key] = { id: "", value: "" };
    return acc;
  }, {});
}

function createInitialMessages() {
  return CATEGORY_CONFIG.reduce((acc, item) => {
    acc[item.key] = "";
    return acc;
  }, {});
}

function groupRowsByCategory(rows) {
  return CATEGORY_CONFIG.reduce((acc, item) => {
    acc[item.key] = rows
      .filter((row) => row.category === item.key)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
    return acc;
  }, {});
}

export default function InvoiceDataPage() {
  const [rows, setRows] = useState([]);
  const [forms, setForms] = useState(createInitialForms());
  const [messages, setMessages] = useState(createInitialMessages());
  const [errors, setErrors] = useState(createInitialMessages());
  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState({});
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("currency");

  async function loadData() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("invoice_definitions")
        .select("*")
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true });

      if (error) throw error;

      setRows(data || []);
    } catch (err) {
      console.error(err);
      const nextErrors = createInitialMessages();
      nextErrors.currency = err.message || "Failed to load invoice data.";
      setErrors(nextErrors);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const groupedRows = useMemo(() => groupRowsByCategory(rows), [rows]);

  const activeSection =
    CATEGORY_CONFIG.find((item) => item.key === activeCategory) || CATEGORY_CONFIG[0];

  const activeRows = useMemo(() => {
    const baseRows = groupedRows[activeCategory] || [];
    const q = search.trim().toLowerCase();

    if (!q) return baseRows;

    return baseRows.filter((row) =>
      String(row.value || "").toLowerCase().includes(q)
    );
  }, [groupedRows, activeCategory, search]);

  function setCategoryMessage(category, text) {
    setMessages((prev) => ({ ...prev, [category]: text }));
  }

  function setCategoryError(category, text) {
    setErrors((prev) => ({ ...prev, [category]: text }));
  }

  function clearCategoryFeedback(category) {
    setCategoryMessage(category, "");
    setCategoryError(category, "");
  }

  function handleInputChange(category, value) {
    setForms((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        value,
      },
    }));
  }

  function clearForm(category) {
    setForms((prev) => ({
      ...prev,
      [category]: {
        id: "",
        value: "",
      },
    }));
    clearCategoryFeedback(category);
  }

  function getCategoryRows(category) {
    return rows
      .filter((row) => row.category === category)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  }

  async function handleAdd(category) {
    const currentValue = forms[category]?.value?.trim() || "";
    if (!currentValue) {
      setCategoryError(category, "Please enter a value first.");
      return;
    }

    try {
      setSavingMap((prev) => ({ ...prev, [category]: true }));
      clearCategoryFeedback(category);

      const categoryRows = getCategoryRows(category);
      const duplicate = categoryRows.find(
        (row) => String(row.value || "").trim().toLowerCase() === currentValue.toLowerCase()
      );

      if (duplicate) {
        setCategoryError(category, "This value already exists.");
        return;
      }

      const nextSortOrder =
        categoryRows.length > 0
          ? Math.max(...categoryRows.map((row) => Number(row.sort_order || 0))) + 1
          : 1;

      const payload = {
        category,
        value: currentValue,
        sort_order: nextSortOrder,
        is_active: true,
      };

      const { error } = await supabase.from("invoice_definitions").insert([payload]);

      if (error) throw error;

      setCategoryMessage(category, "Value added successfully.");
      clearForm(category);
      await loadData();
    } catch (err) {
      console.error(err);
      setCategoryError(category, err.message || "Failed to add value.");
    } finally {
      setSavingMap((prev) => ({ ...prev, [category]: false }));
    }
  }

  async function handleSave(category) {
    const currentValue = forms[category]?.value?.trim() || "";
    const currentId = forms[category]?.id || "";

    if (!currentValue) {
      setCategoryError(category, "Please enter a value first.");
      return;
    }

    if (!currentId) {
      setCategoryError(category, "Please select a row to edit first.");
      return;
    }

    try {
      setSavingMap((prev) => ({ ...prev, [category]: true }));
      clearCategoryFeedback(category);

      const categoryRows = getCategoryRows(category);
      const duplicate = categoryRows.find(
        (row) =>
          String(row.id) !== String(currentId) &&
          String(row.value || "").trim().toLowerCase() === currentValue.toLowerCase()
      );

      if (duplicate) {
        setCategoryError(category, "This value already exists.");
        return;
      }

      const { error } = await supabase
        .from("invoice_definitions")
        .update({ value: currentValue })
        .eq("id", currentId);

      if (error) throw error;

      setCategoryMessage(category, "Value updated successfully.");
      clearForm(category);
      await loadData();
    } catch (err) {
      console.error(err);
      setCategoryError(category, err.message || "Failed to save value.");
    } finally {
      setSavingMap((prev) => ({ ...prev, [category]: false }));
    }
  }

  function handleEdit(category, row) {
    setForms((prev) => ({
      ...prev,
      [category]: {
        id: row.id || "",
        value: row.value || "",
      },
    }));

    clearCategoryFeedback(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(category, row) {
    const ok = window.confirm(`Delete this value?\n\n${row.value || ""}`);
    if (!ok) return;

    try {
      setSavingMap((prev) => ({ ...prev, [category]: true }));
      clearCategoryFeedback(category);

      const { error } = await supabase
        .from("invoice_definitions")
        .delete()
        .eq("id", row.id);

      if (error) throw error;

      if (String(forms[category]?.id || "") === String(row.id)) {
        clearForm(category);
      }

      setCategoryMessage(category, "Value deleted successfully.");
      await loadData();
    } catch (err) {
      console.error(err);
      setCategoryError(category, err.message || "Failed to delete value.");
    } finally {
      setSavingMap((prev) => ({ ...prev, [category]: false }));
    }
  }

  async function handleMove(category, row, direction) {
    const categoryRows = getCategoryRows(category);
    const currentIndex = categoryRows.findIndex((item) => String(item.id) === String(row.id));
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categoryRows.length) return;

    const currentRow = categoryRows[currentIndex];
    const targetRow = categoryRows[targetIndex];

    try {
      setSavingMap((prev) => ({ ...prev, [category]: true }));
      clearCategoryFeedback(category);

      const { error: error1 } = await supabase
        .from("invoice_definitions")
        .update({ sort_order: targetRow.sort_order })
        .eq("id", currentRow.id);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from("invoice_definitions")
        .update({ sort_order: currentRow.sort_order })
        .eq("id", targetRow.id);

      if (error2) throw error2;

      setCategoryMessage(category, "Order updated successfully.");
      await loadData();
    } catch (err) {
      console.error(err);
      setCategoryError(category, err.message || "Failed to update order.");
    } finally {
      setSavingMap((prev) => ({ ...prev, [category]: false }));
    }
  }

  const form = forms[activeCategory] || { id: "", value: "" };
  const saving = !!savingMap[activeCategory];

  return (
    <div className="page-shell">
      <div className="page-title-wrap">
        <h1>Invoice Data</h1>
        <p>Master data for invoice setup used later across the ERP</p>
      </div>

      <div className="invoice-layout">
        <div className="category-menu-card">
          <div className="category-menu-title">Invoice Data</div>

          <div className="category-menu-list">
            {CATEGORY_CONFIG.map((section) => (
              <button
                key={section.key}
                type="button"
                className={`category-tab ${activeCategory === section.key ? "active" : ""}`}
                onClick={() => {
                  setActiveCategory(section.key);
                  setSearch("");
                }}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        <div className="content-area">
          <div className="toolbar-card">
            <div className="toolbar">
              <input
                type="text"
                placeholder={`Search in ${activeSection.title}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="page-card">
            <div className="section-header">
              <div>
                <h2>{activeSection.title}</h2>
                <p>{activeSection.description}</p>
              </div>
            </div>

            <div className="form-grid single-col">
              <div className="form-group">
                <label>{activeSection.title}</label>
                <input
                  type="text"
                  value={form.value}
                  onChange={(e) => handleInputChange(activeCategory, e.target.value)}
                  placeholder={activeSection.placeholder}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => handleAdd(activeCategory)}
                  disabled={saving}
                >
                  Add
                </button>

                <button
                  type="button"
                  className="btn-edit"
                  onClick={() => handleSave(activeCategory)}
                  disabled={saving || !form.id}
                >
                  Save
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => clearForm(activeCategory)}
                  disabled={saving}
                >
                  Clear
                </button>
              </div>
            </div>

            {messages[activeCategory] ? (
              <div className="alert success">{messages[activeCategory]}</div>
            ) : null}

            {errors[activeCategory] ? (
              <div className="alert error">{errors[activeCategory]}</div>
            ) : null}

            <div className="inner-table-card">
              {loading ? (
                <div className="empty-state">Loading...</div>
              ) : activeRows.length === 0 ? (
                <div className="empty-state">No values found.</div>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: "70px" }}>No.</th>
                        <th>Value</th>
                        <th style={{ width: "260px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeRows.map((row, index) => (
                        <tr key={row.id}>
                          <td>{index + 1}</td>
                          <td>{row.value || ""}</td>
                          <td>
                            <div className="table-actions">
                              <button
                                type="button"
                                className="btn-edit"
                                onClick={() => handleEdit(activeCategory, row)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="btn-order"
                                onClick={() => handleMove(activeCategory, row, "up")}
                                disabled={saving || index === 0}
                                title="Move Up"
                              >
                                ↑
                              </button>

                              <button
                                type="button"
                                className="btn-order"
                                onClick={() => handleMove(activeCategory, row, "down")}
                                disabled={saving || index === activeRows.length - 1}
                                title="Move Down"
                              >
                                ↓
                              </button>

                              <button
                                type="button"
                                className="btn-delete"
                                onClick={() => handleDelete(activeCategory, row)}
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
          </div>
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
        .invoice-layout {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 22px;
          align-items: start;
        }
        .category-menu-card,
        .toolbar-card,
        .page-card {
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 8px 26px rgba(15, 23, 42, 0.08);
          border: 1px solid #e5e7eb;
        }
        .category-menu-card {
          padding: 18px;
          position: sticky;
          top: 20px;
        }
        .category-menu-title {
          font-size: 18px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 14px;
        }
        .category-menu-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .category-tab {
          height: 44px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #334155;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          text-align: left;
          padding: 0 14px;
          cursor: pointer;
        }
        .category-tab.active {
          background: #111827;
          color: #ffffff;
          border-color: #111827;
        }
        .content-area {
          min-width: 0;
        }
        .toolbar-card {
          margin-bottom: 22px;
          padding: 18px 22px;
        }
        .toolbar {
          display: flex;
          gap: 12px;
        }
        .toolbar input {
          width: 100%;
          height: 46px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 0 14px;
          font-size: 14px;
          outline: none;
          background: #fff;
        }
        .page-card {
          padding: 22px;
        }
        .section-header {
          margin-bottom: 14px;
        }
        .section-header h2 {
          margin: 0;
          font-size: 22px;
          color: #334155;
        }
        .section-header p {
          margin: 8px 0 0;
          font-size: 14px;
          color: #64748b;
        }
        .form-grid {
          display: grid;
          gap: 14px;
        }
        .single-col {
          grid-template-columns: 1fr;
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
          flex-wrap: wrap;
          gap: 10px;
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
          margin: 14px 0;
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
        .inner-table-card {
          margin-top: 14px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
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
        .data-table tbody tr:hover {
          background: #f8fafc;
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
        @media (max-width: 1100px) {
          .invoice-layout {
            grid-template-columns: 1fr;
          }
          .category-menu-card {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}