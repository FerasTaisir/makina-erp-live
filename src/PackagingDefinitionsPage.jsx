import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

const CATEGORY_CONFIG = [
  {
    key: "pm_unit",
    title: "Pack Unit",
    description: "Define packaging unit weights",
    placeholder: "Ex: 0.33 / 1 / 4 / 18 / 20 / 25 / 200",
  },
  {
    key: "pack_size",
    title: "Pack Size",
    description: "Define packaging size / capacity",
    placeholder: "Ex: 0.33 / 1 / 4 / 18 / 20 / 25 / 200",
  },
  {
    key: "pack_count",
    title: "Pack Count",
    description: "Define number of units inside each packing",
    placeholder: "Ex: 1 / 4 / 6 / 12 / 24",
  },
  {
    key: "pack_type",
    title: "Pack Type",
    description: "Define packaging type",
    placeholder: "Ex: Bottle / Can / Pail / Drum / Carton",
  },
  {
    key: "can_color",
    title: "Can Color",
    description: "Define can color",
    placeholder: "Ex: Red / Blue / Silver / White / Black",
  },
  {
    key: "carton_color",
    title: "Carton Color",
    description: "Define carton color",
    placeholder: "Ex: Brown / White / Red / Blue",
  },
];

function createInitialForms() {
  return CATEGORY_CONFIG.reduce((acc, item) => {
    acc[item.key] = {
      id: "",
      value: "",
    };
    return acc;
  }, {});
}

function createInitialMessages() {
  return CATEGORY_CONFIG.reduce((acc, item) => {
    acc[item.key] = "";
    return acc;
  }, {});
}

function isNumericValue(value) {
  if (value === null || value === undefined) return false;
  const trimmed = String(value).trim();
  if (!trimmed) return false;
  return !Number.isNaN(Number(trimmed));
}

function compareValuesAsc(a, b) {
  const aValue = String(a?.value ?? "").trim();
  const bValue = String(b?.value ?? "").trim();

  const aIsNumeric = isNumericValue(aValue);
  const bIsNumeric = isNumericValue(bValue);

  if (aIsNumeric && bIsNumeric) {
    return Number(aValue) - Number(bValue);
  }

  if (aIsNumeric && !bIsNumeric) return -1;
  if (!aIsNumeric && bIsNumeric) return 1;

  return aValue.localeCompare(bValue, undefined, {
    sensitivity: "base",
    numeric: true,
  });
}

function groupRowsByCategory(rows) {
  return CATEGORY_CONFIG.reduce((acc, item) => {
    acc[item.key] = rows
      .filter((row) => row.category === item.key)
      .sort(compareValuesAsc);
    return acc;
  }, {});
}

export default function PackagingDefinitionsPage({ openPage }) {
  const [rows, setRows] = useState([]);
  const [forms, setForms] = useState(createInitialForms());
  const [messages, setMessages] = useState(createInitialMessages());
  const [errors, setErrors] = useState(createInitialMessages());
  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState({});
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("pm_unit");

  async function loadData() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("packaging_definitions")
        .select("*")
        .order("category", { ascending: true })
        .order("value", { ascending: true });

      if (error) throw error;

      setRows(data || []);
    } catch (err) {
      console.error(err);
      const nextErrors = createInitialMessages();
      nextErrors.pm_unit = err.message || "Failed to load packing data.";
      setErrors(nextErrors);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const groupedRows = useMemo(() => {
    return groupRowsByCategory(rows);
  }, [rows]);

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
    setMessages((prev) => ({
      ...prev,
      [category]: text,
    }));
  }

  function setCategoryError(category, text) {
    setErrors((prev) => ({
      ...prev,
      [category]: text,
    }));
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
      .sort(compareValuesAsc);
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

      const payload = {
        category,
        value: currentValue,
        sort_order: 1,
        is_active: true,
      };

      const { error } = await supabase.from("packaging_definitions").insert([payload]);

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
        .from("packaging_definitions")
        .update({
          value: currentValue,
        })
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
        .from("packaging_definitions")
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

  const form = forms[activeCategory] || { id: "", value: "" };
  const saving = !!savingMap[activeCategory];

  return (
    <div className="page-shell">
      <div className="page-title-wrap">
        <h1>Packing Data</h1>
        <p>Master data for packing setup used later across the ERP</p>
      </div>

      <div className="packing-layout">
        <div className="category-menu-card">
          <div className="category-menu-title">Packing Data</div>

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

            <button
              type="button"
              className="category-tab pallet-tab"
              onClick={() => openPage && openPage("pallet-data")}
            >
              Pallet Data
            </button>
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
                        <th style={{ width: "180px" }}>Actions</th>
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
        .packing-layout {
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
        .pallet-tab {
          background: #e0f2fe;
          color: #0f172a;
          border-color: #bae6fd;
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
        .form-actions button:disabled {
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
          .packing-layout {
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