import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getNextShippingRef(rows) {
  let maxNumber = 0;

  (rows || []).forEach((row) => {
    const code = String(row?.shipping_ref || "");
    const match = code.match(/SHIP-(\d+)/i);

    if (match) {
      const n = Number(match[1]);
      if (!Number.isNaN(n) && n > maxNumber) maxNumber = n;
    }
  });

  return `SHIP-${String(maxNumber + 1).padStart(4, "0")}`;
}

function parsePackingLiters(packingText) {
  const text = String(packingText || "").trim();
  const match = text.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);

  if (!match) return 0;

  return Number(match[1]) * Number(match[2]);
}

export default function ShippingPage({ openPage }) {
  const [productionOrders, setProductionOrders] = useState([]);
  const [productionLines, setProductionLines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [shippingHeaders, setShippingHeaders] = useState([]);

  const [selectedProductionId, setSelectedProductionId] = useState("");
  const [shippingRef, setShippingRef] = useState("");
  const [shippingDate, setShippingDate] = useState(todayISO());
  const [notes, setNotes] = useState("");
  const [shippedQtyMap, setShippedQtyMap] = useState({});
  const [lastSavedShippingId, setLastSavedShippingId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [prodRes, custRes, shipRes] = await Promise.all([
        supabase
          .from("production_order_headers")
          .select("*")
          .order("id", { ascending: false }),
        supabase.from("customers").select("*").order("customer_code", { ascending: true }),
        supabase.from("shipping_headers").select("*").order("id", { ascending: false }),
      ]);

      if (prodRes.error) throw prodRes.error;
      if (custRes.error) throw custRes.error;
      if (shipRes.error) throw shipRes.error;

      const shippingRows = shipRes.data || [];

      setProductionOrders(prodRes.data || []);
      setCustomers(custRes.data || []);
      setShippingHeaders(shippingRows);
      setShippingRef(getNextShippingRef(shippingRows));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load Shipping page.");
    } finally {
      setLoading(false);
    }
  }

  async function loadProductionLines(productionId) {
    if (!productionId) {
      setProductionLines([]);
      setShippedQtyMap({});
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const { data, error: linesError } = await supabase
        .from("production_order_lines")
        .select("*")
        .eq("production_order_header_id", productionId)
        .order("line_no", { ascending: true })
        .order("id", { ascending: true });

      if (linesError) throw linesError;

      const rows = data || [];
      const initial = {};

      rows.forEach((row) => {
        initial[String(row.id)] = row.produced_qty || "";
      });

      setProductionLines(rows);
      setShippedQtyMap(initial);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load Production lines.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const customerMap = useMemo(() => {
    const map = {};
    customers.forEach((row) => {
      map[String(row.id)] = row;
    });
    return map;
  }, [customers]);

  const selectedProduction = useMemo(() => {
    return (
      productionOrders.find((row) => String(row.id) === String(selectedProductionId)) ||
      null
    );
  }, [productionOrders, selectedProductionId]);

  const selectedCustomer = selectedProduction
    ? customerMap[String(selectedProduction.customer_id)] || null
    : null;

  const packingColumns = useMemo(() => {
    const map = new Map();

    productionLines.forEach((line) => {
      const key = String(line.packing_brand_id || line.packing || "");
      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          key,
          packing_brand_id: line.packing_brand_id,
          packing: line.packing || "",
        });
      }
    });

    return Array.from(map.values());
  }, [productionLines]);

  const shippingRows = useMemo(() => {
    const grouped = new Map();

    productionLines.forEach((line) => {
      const groupKey = `${line.line_no || ""}__${line.brand_symbol || ""}__${line.item_id || ""}__${line.item_name || ""}`;

      if (!grouped.has(groupKey)) {
        grouped.set(groupKey, {
          rowKey: groupKey,
          line_no: line.line_no,
          brand_symbol: line.brand_symbol || "",
          item_id: line.item_id || "",
          item_name: line.item_name || "",
          packings: {},
        });
      }

      const row = grouped.get(groupKey);
      const packingKey = String(line.packing_brand_id || line.packing || "");
      const shippedQty = num(shippedQtyMap[String(line.id)]);
      const litersPerPacking = parsePackingLiters(line.packing);
      const totalLit = shippedQty * litersPerPacking;

      row.packings[packingKey] = {
        production_line_id: line.id,
        packing_brand_id: line.packing_brand_id || "",
        packing: line.packing || "",
        produced_qty: num(line.produced_qty),
        shipped_qty: shippedQty,
        total_lit: totalLit,
        total_kg:
          num(line.produced_qty) > 0
            ? (num(line.total_kg) / num(line.produced_qty)) * shippedQty
            : 0,
      };
    });

    return Array.from(grouped.values()).sort((a, b) => num(a.line_no) - num(b.line_no));
  }, [productionLines, shippedQtyMap]);

  const totals = useMemo(() => {
    const packingTotals = {};
    let totalLit = 0;
    let totalKg = 0;

    packingColumns.forEach((col) => {
      packingTotals[col.key] = {
        producedQty: 0,
        shippedQty: 0,
      };
    });

    shippingRows.forEach((row) => {
      packingColumns.forEach((col) => {
        const p = row.packings[col.key] || {};
        packingTotals[col.key].producedQty += num(p.produced_qty);
        packingTotals[col.key].shippedQty += num(p.shipped_qty);
        totalLit += num(p.total_lit);
        totalKg += num(p.total_kg);
      });
    });

    return {
      packingTotals,
      totalLit,
      totalKg,
    };
  }, [shippingRows, packingColumns]);

  function handleSelectProduction(productionId) {
    setSelectedProductionId(productionId);
    setShippedQtyMap({});
    setLastSavedShippingId("");
    loadProductionLines(productionId);
  }

  function handleShippedQtyChange(productionLineId, value) {
    setShippedQtyMap((prev) => ({
      ...prev,
      [String(productionLineId)]: value,
    }));
  }

  function clearForm() {
    setSelectedProductionId("");
    setProductionLines([]);
    setShippedQtyMap({});
    setShippingRef(getNextShippingRef(shippingHeaders));
    setShippingDate(todayISO());
    setNotes("");
    setLastSavedShippingId("");
    setMessage("");
    setError("");
  }

  async function handleSaveShipping() {
    if (!selectedProductionId) {
      setError("Please select Production Order first.");
      setMessage("");
      return;
    }

    if (productionLines.length === 0) {
      setError("No Production lines found.");
      setMessage("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const { data: header, error: headerError } = await supabase
        .from("shipping_headers")
        .insert([
          {
            shipping_ref: shippingRef || getNextShippingRef(shippingHeaders),
            shipping_date: shippingDate || todayISO(),
            production_order_id: selectedProductionId,
            customer_id: selectedProduction?.customer_id || null,
            status: "saved",
            notes,
          },
        ])
        .select()
        .single();

      if (headerError) throw headerError;

      const payload = [];

      shippingRows.forEach((row, rowIndex) => {
        packingColumns.forEach((col) => {
          const p = row.packings[col.key];
          if (!p) return;

          payload.push({
            shipping_header_id: header.id,
            production_line_id: p.production_line_id,
            line_no: row.line_no || rowIndex + 1,
            brand_symbol: row.brand_symbol || "",
            item_id: row.item_id || "",
            item_name: row.item_name || "",
            packing_brand_id: p.packing_brand_id || "",
            packing: p.packing || "",
            produced_qty: num(p.produced_qty),
            shipped_qty: num(p.shipped_qty),
            total_lit: num(p.total_lit),
            total_kg: num(p.total_kg),
          });
        });
      });

      const { error: lineError } = await supabase.from("shipping_lines").insert(payload);

      if (lineError) throw lineError;

      setMessage("Shipping saved successfully.");
      setLastSavedShippingId(String(header.id));
      localStorage.setItem("selected_shipping_id", String(header.id));

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save Shipping.");
    } finally {
      setSaving(false);
    }
  }

  function handleCreateFinalInvoice() {
    const savedShippingId =
      lastSavedShippingId || localStorage.getItem("selected_shipping_id") || "";

    if (!savedShippingId) {
      setError("Please click Save Shipping first, then Create Final Invoice.");
      setMessage("");
      return;
    }

    localStorage.setItem("selected_shipping_id", String(savedShippingId));

    if (typeof openPage === "function") {
      openPage("final-invoice");
    }
  }

  return (
    <div className="page-shell">
      <div className="page-title-wrap">
        <h1>Shipping</h1>
        <p>Enter actual shipped quantities based on Production Orders</p>
      </div>

      <div className="page-card header-card">
        <div className="form-grid four-cols compact-header-grid">
          <div className="form-group">
            <label>Production Order</label>
            <select
              value={selectedProductionId}
              onChange={(e) => handleSelectProduction(e.target.value)}
            >
              <option value="">Select Production Order</option>
              {productionOrders.map((row) => {
                const customer = customerMap[String(row.customer_id)] || {};
                return (
                  <option key={row.id} value={row.id}>
                    {row.production_ref || `Production #${row.id}`} -{" "}
                    {customer.customer_name || ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label>Shipping Ref</label>
            <input
              type="text"
              value={shippingRef}
              onChange={(e) => setShippingRef(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Shipping Date</label>
            <input
              type="date"
              value={shippingDate}
              onChange={(e) => setShippingDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Customer</label>
            <input
              type="text"
              value={selectedCustomer?.customer_name || ""}
              readOnly
              placeholder="Customer will appear after selecting Production Order"
            />
          </div>
        </div>

        <div className="form-group notes-box">
          <label>Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Shipping notes"
          />
        </div>
      </div>

      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div className="empty-state">Loading Shipping data...</div>
          ) : (
            <table className="data-table shipping-table">
              <thead>
                <tr>
                  <th rowSpan="2" style={{ width: "60px" }}>
                    S/N
                  </th>
                  <th rowSpan="2">Brand</th>
                  <th rowSpan="2">Item</th>
                  {packingColumns.map((col) => (
                    <th key={`packing-${col.key}`} colSpan="2">
                      {col.packing}
                    </th>
                  ))}
                  <th rowSpan="2">Total Lit</th>
                  <th rowSpan="2">Total Kg</th>
                </tr>
                <tr>
                  {packingColumns.map((col) => (
                    <React.Fragment key={`sub-${col.key}`}>
                      <th>Produced Qty</th>
                      <th>Shipped Qty</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>

              <tbody>
                {shippingRows.length === 0 ? (
                  <tr>
                    <td colSpan={5 + packingColumns.length * 2} className="empty-cell">
                      Select Production Order to load items.
                    </td>
                  </tr>
                ) : (
                  shippingRows.map((row, index) => {
                    let rowTotalLit = 0;
                    let rowTotalKg = 0;

                    packingColumns.forEach((col) => {
                      const p = row.packings[col.key] || {};
                      rowTotalLit += num(p.total_lit);
                      rowTotalKg += num(p.total_kg);
                    });

                    return (
                      <tr key={row.rowKey}>
                        <td>{index + 1}</td>
                        <td>{row.brand_symbol || ""}</td>
                        <td className="item-cell">{row.item_name || ""}</td>

                        {packingColumns.map((col) => {
                          const p = row.packings[col.key];

                          if (!p) {
                            return (
                              <React.Fragment key={`${row.rowKey}-${col.key}`}>
                                <td></td>
                                <td></td>
                              </React.Fragment>
                            );
                          }

                          return (
                            <React.Fragment key={`${row.rowKey}-${col.key}`}>
                              <td>{p.produced_qty}</td>
                              <td>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.001"
                                  className="qty-input"
                                  value={shippedQtyMap[String(p.production_line_id)] ?? ""}
                                  onChange={(e) =>
                                    handleShippedQtyChange(
                                      p.production_line_id,
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                            </React.Fragment>
                          );
                        })}

                        <td>{rowTotalLit.toFixed(2)}</td>
                        <td>{rowTotalKg.toFixed(4)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {shippingRows.length > 0 ? (
                <tfoot>
                  <tr>
                    <th colSpan="3" className="footer-label">
                      Total
                    </th>
                    {packingColumns.map((col) => (
                      <React.Fragment key={`total-${col.key}`}>
                        <th>
                          {totals.packingTotals[col.key]?.producedQty
                            .toFixed(3)
                            .replace(/\.?0+$/, "")}
                        </th>
                        <th>
                          {totals.packingTotals[col.key]?.shippedQty
                            .toFixed(3)
                            .replace(/\.?0+$/, "")}
                        </th>
                      </React.Fragment>
                    ))}
                    <th>{totals.totalLit.toFixed(2)}</th>
                    <th>{totals.totalKg.toFixed(4)}</th>
                  </tr>
                </tfoot>
              ) : null}
            </table>
          )}
        </div>
      </div>

      <div className="save-bar-card">
        <div className="save-buttons">
          <button type="button" onClick={handleSaveShipping} disabled={saving || !selectedProductionId}>
            {saving ? "Saving..." : "Save Shipping"}
          </button>

          <button
            type="button"
            className="btn-edit"
            onClick={handleCreateFinalInvoice}
            disabled={saving || !selectedProductionId}
          >
            Create Final Invoice
          </button>

          <button type="button" className="btn-secondary" onClick={clearForm} disabled={saving}>
            Clear
          </button>

          <button type="button" className="btn-refresh" onClick={loadData} disabled={saving}>
            Refresh
          </button>
        </div>
      </div>

      <div className="table-card history-card">
        <div className="table-title">Saved Shipping Records</div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shipping Ref</th>
                <th>Date</th>
                <th>Production Order</th>
                <th>Customer</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {shippingHeaders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-cell">
                    No Shipping records saved.
                  </td>
                </tr>
              ) : (
                shippingHeaders.map((row) => {
                  const prod = productionOrders.find(
                    (item) => String(item.id) === String(row.production_order_id)
                  );
                  const customer = customerMap[String(row.customer_id)] || {};

                  return (
                    <tr key={row.id}>
                      <td>{row.shipping_ref}</td>
                      <td>{row.shipping_date}</td>
                      <td>{prod?.production_ref || row.production_order_id || ""}</td>
                      <td>{customer.customer_name || ""}</td>
                      <td>{row.status || ""}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
        .table-card,
        .save-bar-card {
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 8px 26px rgba(15, 23, 42, 0.08);
          border: 1px solid #e5e7eb;
          max-width: 1400px;
          margin: 0 auto 22px;
        }
        .page-card,
        .save-bar-card {
          padding: 22px 18px;
        }
        .form-grid {
          display: grid;
          gap: 12px;
        }
        .four-cols {
          grid-template-columns: repeat(4, minmax(0, 1fr));
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
        .form-group textarea {
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 0 12px;
          font-size: 14px;
          outline: none;
          background: #fff;
        }
        .form-group input,
        .form-group select {
          height: 44px;
        }
        .form-group textarea {
          padding-top: 10px;
          resize: vertical;
        }
        .notes-box {
          margin-top: 14px;
        }
        .alert {
          max-width: 1400px;
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
        .table-card {
          padding: 0;
          overflow: hidden;
        }
        .table-title {
          padding: 16px 18px;
          font-size: 18px;
          font-weight: 700;
          color: #334155;
          border-bottom: 1px solid #e5e7eb;
        }
        .table-scroll {
          overflow: auto;
          max-height: 560px;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1050px;
        }
        .shipping-table {
          min-width: 1200px;
        }
        .data-table th,
        .data-table td {
          padding: 8px 8px;
          border-bottom: 1px solid #e5e7eb;
          text-align: center;
          font-size: 13px;
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
        .item-cell {
          text-align: left !important;
          min-width: 260px;
        }
        .qty-input {
          width: 82px;
          height: 34px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0 8px;
          text-align: center;
          font-size: 13px;
        }
        .footer-label {
          text-align: left !important;
          padding-left: 12px !important;
        }
        .data-table tfoot th {
          background: #e2e8f0;
        }
        .empty-cell,
        .empty-state {
          text-align: center;
          padding: 24px;
          color: #64748b;
          font-weight: 600;
        }
        .save-bar-card {
          min-height: 86px;
          display: flex;
          align-items: center;
        }
        .save-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
          border-left: 3px solid #e5e7eb;
          padding-left: 18px;
        }
        .save-buttons button,
        .btn-secondary,
        .btn-refresh,
        .btn-edit {
          height: 38px;
          border-radius: 8px;
          padding: 0 14px;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }
        .save-buttons button:first-child {
          background: #111827;
          color: #fff;
        }
        .btn-secondary {
          background: #d1d5db;
          color: #111827;
        }
        .btn-refresh {
          background: #6b7280;
          color: white;
        }
        .btn-edit {
          background: #2563eb;
          color: white;
        }
        button:disabled,
        select:disabled,
        input:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        @media (max-width: 1100px) {
          .four-cols {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 700px) {
          .four-cols {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
