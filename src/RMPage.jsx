import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

const emptyForm = {
  id: null,
  rm_code: "",
  rm_name: "",
  density: "",
  tally_price: "",
  tally_date: "",
  market_price: "",
  market_entry_date: "",
  sort_order: 0,
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toNullableNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function formatUsd(value) {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  return `$${n}`;
}

function extractCodeNumber(code) {
  if (!code) return 0;
  const match = String(code).match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

export default function RMPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("view");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingRowId, setEditingRowId] = useState(null);
  const [editingRowData, setEditingRowData] = useState({});

  useEffect(() => {
    fetchRows();
  }, []);

  async function fetchRows() {
    setLoading(true);

    const { data, error } = await supabase
      .from("rm")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setRows(data || []);
  }

  const nextRmCode = useMemo(() => {
    if (!rows.length) return "RM-0001";
    const maxNum = Math.max(...rows.map((r) => extractCodeNumber(r.rm_code)));
    const nextNum = maxNum + 1;
    return `RM-${String(nextNum).padStart(4, "0")}`;
  }, [rows]);

  const nextSortOrder = useMemo(() => {
    if (!rows.length) return 1;
    return Math.max(...rows.map((r) => Number(r.sort_order || 0))) + 1;
  }, [rows]);

  function resetForm() {
    setForm(emptyForm);
    setSelectedId(null);
    setMode("view");
  }

  function handleAdd() {
    setForm({
      ...emptyForm,
      rm_code: nextRmCode,
      sort_order: nextSortOrder,
    });
    setSelectedId(null);
    setMode("add");
  }

  function handleRowClick(row) {
    setSelectedId(row.id);
    setForm({
      id: row.id,
      rm_code: row.rm_code || "",
      rm_name: row.rm_name || "",
      density: row.density ?? "",
      tally_price: row.tally_price ?? "",
      tally_date: row.tally_date || "",
      market_price: row.market_price ?? "",
      market_entry_date: row.market_entry_date || "",
      sort_order: row.sort_order || 0,
    });
    setMode("edit");
  }

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleTallyPriceChange(value) {
    setForm((prev) => ({
      ...prev,
      tally_price: value,
      tally_date: value !== "" ? todayISO() : "",
    }));
  }

  function handleMarketPriceChange(value) {
    setForm((prev) => ({
      ...prev,
      market_price: value,
      market_entry_date: value !== "" ? todayISO() : "",
    }));
  }

  async function handleSave() {
    if (mode !== "add" && mode !== "edit") {
      alert("اضغط Add أولاً أو اختر صفًا من الجدول");
      return;
    }

    if (!form.rm_name.trim()) {
      alert("RM Name is required");
      return;
    }

    const payload = {
      rm_code: form.rm_code,
      rm_name: form.rm_name.trim(),
      density: toNullableNumber(form.density),
      tally_price: toNullableNumber(form.tally_price),
      tally_date: form.tally_date || null,
      market_price: toNullableNumber(form.market_price),
      market_entry_date: form.market_entry_date || null,
      sort_order: Number(form.sort_order || 0),
    };

    setSaving(true);

    let result;
    if (mode === "add") {
      result = await supabase.from("rm").insert([payload]);
    } else {
      result = await supabase.from("rm").update(payload).eq("id", selectedId);
    }

    setSaving(false);

    if (result.error) {
      alert(result.error.message);
      return;
    }

    await fetchRows();
    resetForm();
  }

  async function handleDelete() {
    if (!selectedId) {
      alert("اختر RM من الجدول أولاً");
      return;
    }

    const ok = window.confirm("Delete selected RM?");
    if (!ok) return;

    setSaving(true);
    const { error } = await supabase.from("rm").delete().eq("id", selectedId);
    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    await fetchRows();
    resetForm();
  }

  async function handleMove(direction) {
    if (!selectedId) {
      alert("اختر RM من الجدول أولاً");
      return;
    }

    const currentIndex = rows.findIndex((r) => r.id === selectedId);
    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= rows.length) return;

    const currentRow = rows[currentIndex];
    const targetRow = rows[targetIndex];

    setSaving(true);

    const { error: e1 } = await supabase
      .from("rm")
      .update({ sort_order: targetRow.sort_order })
      .eq("id", currentRow.id);

    if (e1) {
      setSaving(false);
      alert(e1.message);
      return;
    }

    const { error: e2 } = await supabase
      .from("rm")
      .update({ sort_order: currentRow.sort_order })
      .eq("id", targetRow.id);

    setSaving(false);

    if (e2) {
      alert(e2.message);
      return;
    }

    await fetchRows();
    setSelectedId(currentRow.id);
  }

  function handleEditRow(row) {
    setEditingRowId(row.id);
    setEditingRowData({
      rm_name: row.rm_name || "",
      density: row.density ?? "",
      tally_price: row.tally_price ?? "",
      market_price: row.market_price ?? "",
    });
  }

  function handleEditChange(field, value) {
    setEditingRowData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleCancelEdit() {
    setEditingRowId(null);
    setEditingRowData({});
  }

  async function handleSaveRow(row) {
    if (!String(editingRowData.rm_name || "").trim()) {
      alert("RM Name is required");
      return;
    }

    const oldTally = row.tally_price ?? null;
    const newTally = toNullableNumber(editingRowData.tally_price);

    const oldMarket = row.market_price ?? null;
    const newMarket = toNullableNumber(editingRowData.market_price);

    const payload = {
      rm_name: String(editingRowData.rm_name).trim(),
      density: toNullableNumber(editingRowData.density),
      tally_price: newTally,
      tally_date: newTally !== oldTally ? todayISO() : row.tally_date,
      market_price: newMarket,
      market_entry_date:
        newMarket !== oldMarket ? todayISO() : row.market_entry_date,
    };

    setSaving(true);

    const { error } = await supabase
      .from("rm")
      .update(payload)
      .eq("id", row.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingRowId(null);
    setEditingRowData({});
    await fetchRows();

    if (selectedId === row.id) {
      setForm((prev) => ({
        ...prev,
        rm_name: payload.rm_name,
        density: payload.density ?? "",
        tally_price: payload.tally_price ?? "",
        tally_date: payload.tally_date || "",
        market_price: payload.market_price ?? "",
        market_entry_date: payload.market_entry_date || "",
      }));
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.topSection}>
        <h1 style={styles.title}>RM</h1>

        <div style={styles.toolbar}>
          <button style={styles.button} onClick={handleAdd} disabled={saving}>
            Add
          </button>
          <button style={styles.button} onClick={handleSave} disabled={saving}>
            Save
          </button>
          <button style={styles.button} onClick={handleDelete} disabled={saving}>
            Delete
          </button>
          <button
            style={styles.button}
            onClick={() => handleMove("up")}
            disabled={saving}
          >
            Up
          </button>
          <button
            style={styles.button}
            onClick={() => handleMove("down")}
            disabled={saving}
          >
            Down
          </button>
          <button style={styles.button} onClick={resetForm} disabled={saving}>
            Clear
          </button>
        </div>

        <div style={styles.formCard}>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>RM Code</label>
              <input
                style={{ ...styles.input, background: "#f3f4f6" }}
                value={form.rm_code}
                readOnly
                placeholder="Auto"
              />
            </div>

            <div>
              <label style={styles.label}>RM Name</label>
              <input
                style={styles.input}
                value={form.rm_name}
                onChange={(e) => updateField("rm_name", e.target.value)}
                placeholder="RM Name"
              />
            </div>

            <div>
              <label style={styles.label}>Density</label>
              <input
                style={styles.input}
                type="number"
                step="0.001"
                value={form.density}
                onChange={(e) => updateField("density", e.target.value)}
                placeholder="Density"
              />
            </div>

            <div>
              <label style={styles.label}>Tally Price ($)</label>
              <input
                style={styles.input}
                type="number"
                step="0.001"
                value={form.tally_price}
                onChange={(e) => handleTallyPriceChange(e.target.value)}
                placeholder="USD"
              />
            </div>

            <div>
              <label style={styles.label}>Tally Date</label>
              <input
                style={{ ...styles.input, background: "#f3f4f6" }}
                type="date"
                value={form.tally_date}
                readOnly
              />
            </div>

            <div>
              <label style={styles.label}>Market Price ($)</label>
              <input
                style={styles.input}
                type="number"
                step="0.001"
                value={form.market_price}
                onChange={(e) => handleMarketPriceChange(e.target.value)}
                placeholder="USD"
              />
            </div>

            <div>
              <label style={styles.label}>Market Entry Date</label>
              <input
                style={{ ...styles.input, background: "#f3f4f6" }}
                type="date"
                value={form.market_entry_date}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Order</th>
              <th style={styles.th}>Code</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Density</th>
              <th style={styles.th}>Tally Price</th>
              <th style={styles.th}>Tally Date</th>
              <th style={styles.th}>Market Price</th>
              <th style={styles.th}>Market Entry Date</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td style={styles.td} colSpan="9">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan="9">
                  No RM records found
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isEditing = editingRowId === row.id;

                return (
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    style={{
                      background:
                        selectedId === row.id
                          ? "rgba(59,130,246,0.10)"
                          : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <td style={styles.td}>{row.sort_order ?? ""}</td>
                    <td style={styles.td}>{row.rm_code}</td>

                    <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <input
                          style={styles.smallInput}
                          value={editingRowData.rm_name ?? ""}
                          onChange={(e) =>
                            handleEditChange("rm_name", e.target.value)
                          }
                        />
                      ) : (
                        row.rm_name
                      )}
                    </td>

                    <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <input
                          style={styles.smallInput}
                          type="number"
                          step="0.001"
                          value={editingRowData.density ?? ""}
                          onChange={(e) =>
                            handleEditChange("density", e.target.value)
                          }
                        />
                      ) : (
                        row.density ?? ""
                      )}
                    </td>

                    <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <input
                          style={styles.smallInput}
                          type="number"
                          step="0.001"
                          value={editingRowData.tally_price ?? ""}
                          onChange={(e) =>
                            handleEditChange("tally_price", e.target.value)
                          }
                        />
                      ) : (
                        formatUsd(row.tally_price)
                      )}
                    </td>

                    <td style={styles.td}>
                      {isEditing
                        ? toNullableNumber(editingRowData.tally_price) !==
                            (row.tally_price ?? null) &&
                          editingRowData.tally_price !== ""
                          ? todayISO()
                          : row.tally_date ?? ""
                        : row.tally_date ?? ""}
                    </td>

                    <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <input
                          style={styles.smallInput}
                          type="number"
                          step="0.001"
                          value={editingRowData.market_price ?? ""}
                          onChange={(e) =>
                            handleEditChange("market_price", e.target.value)
                          }
                        />
                      ) : (
                        formatUsd(row.market_price)
                      )}
                    </td>

                    <td style={styles.td}>
                      {isEditing
                        ? toNullableNumber(editingRowData.market_price) !==
                            (row.market_price ?? null) &&
                          editingRowData.market_price !== ""
                          ? todayISO()
                          : row.market_entry_date ?? ""
                        : row.market_entry_date ?? ""}
                    </td>

                    <td style={styles.td} onClick={(e) => e.stopPropagation()}>
                      {isEditing ? (
                        <div style={styles.rowActionWrap}>
                          <button
                            style={styles.updateButton}
                            onClick={() => handleSaveRow(row)}
                            disabled={saving}
                          >
                            Save Row
                          </button>
                          <button
                            style={styles.updateButton}
                            onClick={handleCancelEdit}
                            disabled={saving}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          style={styles.updateButton}
                          onClick={() => handleEditRow(row)}
                          disabled={saving}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 36px)",
    minHeight: 0,
  },
  topSection: {
    flexShrink: 0,
  },
  title: {
    fontSize: "28px",
    margin: "0 0 18px 0",
  },
  toolbar: {
    display: "flex",
    gap: "8px",
    marginBottom: "14px",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  button: {
    padding: "9px 14px",
    border: "1px solid #aab3c2",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
  },
  formCard: {
    background: "#fff",
    border: "1px solid #d9dfeb",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "12px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(170px, 1fr))",
    gap: "12px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #aab3c2",
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  tableWrap: {
    flex: 1,
    minHeight: 0,
    background: "#fff",
    border: "1px solid #d9dfeb",
    borderRadius: "10px",
    overflowX: "auto",
    overflowY: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "1px solid #d9dfeb",
    background: "#f8fafe",
    whiteSpace: "nowrap",
    position: "sticky",
    top: 0,
    zIndex: 5,
  },
  td: {
    padding: "12px 10px",
    borderBottom: "1px solid #eef2f7",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  },
  smallInput: {
    width: "120px",
    padding: "8px",
    border: "1px solid #aab3c2",
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  updateButton: {
    padding: "8px 12px",
    border: "1px solid #aab3c2",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  rowActionWrap: {
    display: "flex",
    gap: "6px",
  },
};