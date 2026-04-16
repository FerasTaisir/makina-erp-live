import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function RMPage() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    rm_code: "",
    rm_name: "",
    density: "",
    tally_price: "",
    tally_date: "",
    market_price: "",
    market_entry_date: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from("rm")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setData(data || []);
  }

  function toNullableNumber(value) {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }

  async function handleAdd() {
    if (!form.rm_code.trim()) {
      alert("Code is required");
      return;
    }

    if (!form.rm_name.trim()) {
      alert("Name is required");
      return;
    }

    const payload = {
      rm_code: form.rm_code.trim(),
      rm_name: form.rm_name.trim(),
      density: toNullableNumber(form.density),
      tally_price: toNullableNumber(form.tally_price),
      tally_date: form.tally_date || null,
      market_price: toNullableNumber(form.market_price),
      market_entry_date: form.market_entry_date || null,
    };

    const { error } = await supabase.from("rm").insert([payload]);

    if (error) {
      alert(error.message);
      return;
    }

    setForm({
      rm_code: "",
      rm_name: "",
      density: "",
      tally_price: "",
      tally_date: "",
      market_price: "",
      market_entry_date: "",
    });

    fetchData();
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>RM</h1>

      <div style={styles.formRow}>
        <input
          style={styles.input}
          placeholder="Code"
          value={form.rm_code}
          onChange={(e) => setForm({ ...form, rm_code: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Name"
          value={form.rm_name}
          onChange={(e) => setForm({ ...form, rm_name: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Density"
          value={form.density}
          onChange={(e) => setForm({ ...form, density: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Tally Price"
          value={form.tally_price}
          onChange={(e) => setForm({ ...form, tally_price: e.target.value })}
        />

        <input
          style={styles.input}
          type="date"
          value={form.tally_date}
          onChange={(e) => setForm({ ...form, tally_date: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Market Price"
          value={form.market_price}
          onChange={(e) => setForm({ ...form, market_price: e.target.value })}
        />

        <input
          style={styles.input}
          type="date"
          value={form.market_entry_date}
          onChange={(e) =>
            setForm({ ...form, market_entry_date: e.target.value })
          }
        />

        <button style={styles.addButton} onClick={handleAdd}>
          Add
        </button>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Code</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Density</th>
              <th style={styles.th}>Tally Price</th>
              <th style={styles.th}>Tally Date</th>
              <th style={styles.th}>Market Price</th>
              <th style={styles.th}>Market Date</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td style={styles.td}>{row.rm_code}</td>
                <td style={styles.td}>{row.rm_name}</td>
                <td style={styles.td}>{row.density ?? ""}</td>
                <td style={styles.td}>{row.tally_price ?? ""}</td>
                <td style={styles.td}>{row.tally_date ?? ""}</td>
                <td style={styles.td}>{row.market_price ?? ""}</td>
                <td style={styles.td}>{row.market_entry_date ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#f5f7fb",
    minHeight: "100vh",
  },
  title: {
    fontSize: "28px",
    marginBottom: "20px",
  },
  formRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  input: {
    padding: "8px",
    border: "1px solid #999",
    minWidth: "120px",
  },
  addButton: {
    padding: "8px 14px",
    border: "1px solid #999",
    background: "#fff",
    cursor: "pointer",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    borderCollapse: "collapse",
    background: "#fff",
  },
  th: {
    border: "1px solid #777",
    padding: "10px",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  td: {
    border: "1px solid #777",
    padding: "10px",
    whiteSpace: "nowrap",
  },
};