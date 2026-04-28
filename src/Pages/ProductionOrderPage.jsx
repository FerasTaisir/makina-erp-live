import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parsePackingParts(packingText) {
  const text = String(packingText || "").trim();
  const match = text.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);

  if (!match) return { totalLit: 0 };

  return {
    totalLit: Number(match[1]) * Number(match[2]),
  };
}

function parsePackingLiters(packingText) {
  return parsePackingParts(packingText).totalLit;
}

function getNextProductionNo(rows) {
  let maxNumber = 0;

  (rows || []).forEach((row) => {
    const code = String(row?.production_no || "");
    const match = code.match(/PROD-(\d+)/i);
    if (match) {
      const n = Number(match[1]);
      if (!Number.isNaN(n) && n > maxNumber) maxNumber = n;
    }
  });

  return `PROD-${String(maxNumber + 1).padStart(4, "0")}`;
}

export default function ProductionOrderPage() {
  const [customers, setCustomers] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [productionHeaders, setProductionHeaders] = useState([]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLines, setOrderLines] = useState([]);
  const [packingColumns, setPackingColumns] = useState([]);
  const [productionDate, setProductionDate] = useState(todayISO());

  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const customerMap = useMemo(() => {
    const map = {};
    customers.forEach((row) => {
      map[row.id] = row;
    });
    return map;
  }, [customers]);

  const customerNames = useMemo(() => {
    const set = new Set();
    headers.forEach((row) => {
      const customer = customerMap[row.customer_id] || {};
      if (customer.customer_name) set.add(customer.customer_name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [headers, customerMap]);

  const filteredHeaders = useMemo(() => {
    const q = search.trim().toLowerCase();

    return headers
      .filter((row) => {
        const customer = customerMap[row.customer_id] || {};

        const matchesSearch =
          !q ||
          String(row.pdo_no || "").toLowerCase().includes(q) ||
          String(row.pdo_date || "").toLowerCase().includes(q) ||
          String(customer.customer_code || "").toLowerCase().includes(q) ||
          String(customer.customer_symbol || "").toLowerCase().includes(q) ||
          String(customer.customer_name || "").toLowerCase().includes(q);

        const matchesCustomer =
          !customerFilter ||
          String(customer.customer_name || "") === String(customerFilter);

        return matchesSearch && matchesCustomer;
      })
      .sort((a, b) => {
        const customerA = customerMap[a.customer_id]?.customer_name || "";
        const customerB = customerMap[b.customer_id]?.customer_name || "";
        const nameCompare = customerA.localeCompare(customerB);
        if (nameCompare !== 0) return nameCompare;
        return String(b.id).localeCompare(String(a.id));
      });
  }, [headers, search, customerFilter, customerMap]);

  const totals = useMemo(() => {
    return orderLines.reduce(
      (acc, line) => {
        packingColumns.forEach((col) => {
          const qty = num(line.quantities[String(col.id)]);
          const liters = parsePackingLiters(col.packing || "");
          acc.productionQty += qty;
          acc.totalLit += qty * liters;
          acc.totalKg += qty * liters * num(line.density);
        });
        return acc;
      },
      { productionQty: 0, totalLit: 0, totalKg: 0 }
    );
  }, [orderLines, packingColumns]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [customersRes, headersRes, productionHeadersRes] = await Promise.all([
        supabase.from("customers").select("*").order("customer_code", { ascending: true }),
        supabase.from("pdo_headers").select("*").order("id", { ascending: false }),
        supabase.from("production_headers").select("*").order("id", { ascending: false }),
      ]);

      if (customersRes.error) throw customersRes.error;
      if (headersRes.error) throw headersRes.error;
      if (productionHeadersRes.error) throw productionHeadersRes.error;

      setCustomers(customersRes.data || []);
      setHeaders(headersRes.data || []);
      setProductionHeaders(productionHeadersRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load Production Orders.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditOrder(row) {
    try {
      setDetailLoading(true);
      setError("");
      setMessage("");

      const { data: detailRows, error: linesError } = await supabase
        .from("pdo_lines")
        .select("*")
        .eq("pdo_header_id", row.id)
        .order("line_no", { ascending: true })
        .order("id", { ascending: true });

      if (linesError) throw linesError;

      const grouped = {};
      const packingMap = {};

      (detailRows || []).forEach((line) => {
        const packingId = String(line.packing_brand_id);

        packingMap[packingId] = {
          id: packingId,
          packing: line.packing || "",
        };

        const key = `${line.line_no}__${line.brand_symbol}__${line.item_id}__${line.item_name}`;

        if (!grouped[key]) {
          grouped[key] = {
            row_id: key,
            line_no: line.line_no,
            brand_symbol: line.brand_symbol || "",
            item_id: line.item_id || null,
            item_name: line.item_name || "",
            density: num(line.density),
            quantities: {},
            pdo_lines: {},
          };
        }

        grouped[key].quantities[packingId] = num(line.qty);
        grouped[key].pdo_lines[packingId] = line.id;
      });

      setSelectedOrder(row);
      setOrderLines(Object.values(grouped));
      setPackingColumns(Object.values(packingMap));
      setProductionDate(todayISO());

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load Order details.");
    } finally {
      setDetailLoading(false);
    }
  }

  function handleProductionQtyChange(rowIndex, packingId, value) {
    setOrderLines((prev) =>
      prev.map((line, index) => {
        if (index !== rowIndex) return line;

        return {
          ...line,
          quantities: {
            ...line.quantities,
            [String(packingId)]: value,
          },
        };
      })
    );
  }

  function getLineTotals(line) {
    let totalLit = 0;
    let totalKg = 0;

    packingColumns.forEach((col) => {
      const qty = num(line.quantities[String(col.id)]);
      const liters = parsePackingLiters(col.packing || "");
      totalLit += qty * liters;
      totalKg += qty * liters * num(line.density);
    });

    return { totalLit, totalKg };
  }

  async function handleSaveProduction() {
    if (!selectedOrder?.id) {
      setError("Please select an Order first.");
      setMessage("");
      return;
    }

    if (orderLines.length === 0) {
      setError("No lines found to save.");
      setMessage("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const productionNo = getNextProductionNo(productionHeaders);

      const { data: insertedHeader, error: headerError } = await supabase
        .from("production_headers")
        .insert([
          {
            pdo_header_id: selectedOrder.id,
            production_no: productionNo,
            production_date: productionDate || todayISO(),
          },
        ])
        .select()
        .single();

      if (headerError) throw headerError;

      const linePayload = [];

      orderLines.forEach((line, lineIndex) => {
        packingColumns.forEach((col) => {
          const qty = num(line.quantities[String(col.id)]);
          if (qty <= 0) return;

          const liters = parsePackingLiters(col.packing || "");
          const totalLit = qty * liters;
          const totalKg = totalLit * num(line.density);

          linePayload.push({
            production_header_id: insertedHeader.id,
            pdo_line_id: line.pdo_lines[String(col.id)] || null,
            line_no: lineIndex + 1,
            brand_symbol: line.brand_symbol,
            item_id: line.item_id,
            item_name: line.item_name,
            density: num(line.density),
            packing_brand_id: col.id,
            packing: col.packing,
            order_qty: qty,
            production_qty: qty,
            total_lit: totalLit,
            total_kg: totalKg,
          });
        });
      });

      const { error: linesError } = await supabase
        .from("production_lines")
        .insert(linePayload);

      if (linesError) throw linesError;

      setMessage(`Production saved successfully: ${productionNo}`);
      setSelectedOrder(null);
      setOrderLines([]);
      setPackingColumns([]);
      await loadAll();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save Production.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteOrder(row) {
    const ok = window.confirm(`Delete Order?\n\n${row.pdo_no}`);
    if (!ok) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const { error } = await supabase.from("pdo_headers").delete().eq("id", row.id);
      if (error) throw error;

      setMessage("Order deleted successfully.");
      await loadAll();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete Order.");
    } finally {
      setSaving(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handlePDF() {
    window.print();
  }

  return (
    <div className="page-shell">
      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      {selectedOrder ? (
        <div className="production-editor print-area">
          <div className="editor-header">
            <div>
              <h2>Production Order</h2>
              <p>
                Order No: <b>{selectedOrder.pdo_no}</b>
              </p>
            </div>

            <div className="editor-actions no-print">
              <button type="button" className="btn-print" onClick={handlePrint}>
                Print
              </button>
              <button type="button" className="btn-pdf" onClick={handlePDF}>
                PDF
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSelectedOrder(null);
                  setOrderLines([]);
                  setPackingColumns([]);
                }}
              >
                Close
              </button>
            </div>
          </div>

          <div className="info-grid">
            <div>
              <label>Order Date</label>
              <input type="text" value={selectedOrder.pdo_date || ""} readOnly />
            </div>

            <div>
              <label>Production Date</label>
              <input
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
              />
            </div>

            <div>
              <label>Customer</label>
              <input
                type="text"
                value={customerMap[selectedOrder.customer_id]?.customer_name || ""}
                readOnly
              />
            </div>
          </div>

          <div className="table-card">
            <div className="table-scroll">
              <table className="data-table production-table">
                <thead>
                  <tr>
                    <th>S/N</th>
                    <th>Brand</th>
                    <th>Item</th>
                    {packingColumns.map((col) => (
                      <th key={col.id}>{col.packing}</th>
                    ))}
                    <th>Total Lit</th>
                    <th>Total KG</th>
                  </tr>
                </thead>

                <tbody>
                  {detailLoading ? (
                    <tr>
                      <td colSpan="20" className="empty-cell">
                        Loading details...
                      </td>
                    </tr>
                  ) : orderLines.length === 0 ? (
                    <tr>
                      <td colSpan="20" className="empty-cell">
                        No lines found.
                      </td>
                    </tr>
                  ) : (
                    orderLines.map((line, index) => {
                      const lineTotals = getLineTotals(line);

                      return (
                        <tr key={line.row_id}>
                          <td>{index + 1}</td>
                          <td>{line.brand_symbol}</td>
                          <td className="item-cell">{line.item_name}</td>

                          {packingColumns.map((col) => (
                            <td key={`${line.row_id}-${col.id}`}>
                              <input
                                type="number"
                                min="0"
                                step="0.001"
                                value={line.quantities[String(col.id)] ?? ""}
                                onChange={(e) =>
                                  handleProductionQtyChange(index, col.id, e.target.value)
                                }
                                className="qty-input"
                              />
                            </td>
                          ))}

                          <td>{lineTotals.totalLit.toFixed(2)}</td>
                          <td>{lineTotals.totalKg.toFixed(4)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

                <tfoot>
                  <tr>
                    <th colSpan="3">Total</th>
                    {packingColumns.map((col) => {
                      const total = orderLines.reduce(
                        (sum, line) => sum + num(line.quantities[String(col.id)]),
                        0
                      );

                      return (
                        <th key={`total-${col.id}`}>
                          {total.toFixed(3).replace(/\.?0+$/, "")}
                        </th>
                      );
                    })}
                    <th>{totals.totalLit.toFixed(2)}</th>
                    <th>{totals.totalKg.toFixed(4)}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="save-card no-print">
            <button
              type="button"
              className="btn-save"
              onClick={handleSaveProduction}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Production"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="toolbar-card no-print">
        <div className="toolbar">
          <input
            type="text"
            placeholder="Search by Order No / Date / Customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          >
            <option value="">All Customers</option>
            {customerNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <button type="button" className="btn-refresh" onClick={loadAll}>
            Refresh
          </button>
        </div>
      </div>

      <div className="table-card no-print">
        <div className="table-scroll history-scroll">
          {loading ? (
            <div className="empty-state">Loading Production Orders...</div>
          ) : (
            <table className="data-table history-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Order Date</th>
                  <th>Customer Code</th>
                  <th>Customer Symbol</th>
                  <th>Customer Name</th>
                  <th style={{ width: "170px" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredHeaders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-cell">
                      No Order records found.
                    </td>
                  </tr>
                ) : (
                  filteredHeaders.map((row) => {
                    const customer = customerMap[row.customer_id] || {};

                    return (
                      <tr key={row.id}>
                        <td>{row.pdo_no}</td>
                        <td>{row.pdo_date}</td>
                        <td>{customer.customer_code || ""}</td>
                        <td>{customer.customer_symbol || ""}</td>
                        <td>{customer.customer_name || ""}</td>
                        <td>
                          <div className="table-actions vertical-actions">
                            <button
                              type="button"
                              className="btn-edit compact-btn"
                              onClick={() => handleEditOrder(row)}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn-print compact-btn"
                              onClick={handlePrint}
                            >
                              Print
                            </button>

                            <button
                              type="button"
                              className="btn-pdf compact-btn"
                              onClick={handlePDF}
                            >
                              PDF
                            </button>

                            <button
                              type="button"
                              className="btn-delete compact-btn"
                              onClick={() => handleDeleteOrder(row)}
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

      <style>{`
        .page-shell {
          padding: 0 24px 40px;
          background: #f5f7fb;
          min-height: 100vh;
          overflow: hidden;
        }

        .toolbar-card,
        .table-card,
        .production-editor,
        .save-card {
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 8px 26px rgba(15, 23, 42, 0.08);
          border: 1px solid #e5e7eb;
          max-width: 1400px;
          margin: 0 auto 22px;
        }

        .toolbar-card {
          padding: 18px;
        }

        .production-editor,
        .save-card {
          padding: 22px 18px;
        }

        .table-card {
          padding: 0;
          overflow: hidden;
        }

        .toolbar {
          display: grid;
          grid-template-columns: 1fr 260px 140px;
          gap: 12px;
        }

        .toolbar input,
        .toolbar select,
        .info-grid input {
          height: 44px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 0 12px;
          font-size: 14px;
          outline: none;
          background: #fff;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .editor-header h2 {
          margin: 0;
          font-size: 24px;
          color: #334155;
        }

        .editor-header p {
          margin: 6px 0 0;
          color: #64748b;
        }

        .editor-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .info-grid label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #334155;
        }

        .info-grid input {
          width: 100%;
          box-sizing: border-box;
        }

        .table-scroll {
          overflow: auto;
          max-height: 560px;
        }

        .history-scroll {
          max-height: 650px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1050px;
        }

        .production-table {
          min-width: 1100px;
        }

        .history-table th,
        .history-table td {
          height: 78px;
        }

        .data-table th,
        .data-table td {
          padding: 9px 8px;
          border-bottom: 1px solid #e5e7eb;
          text-align: center;
          font-size: 13px;
          vertical-align: middle;
          color: #1e3a5f;
        }

        .data-table th {
          background: #f1f5f9;
          color: #1e3a5f;
          font-weight: 700;
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 2;
        }

        .data-table tfoot th {
          background: #e2e8f0;
        }

        .data-table tbody tr:hover {
          background: #f8fafc;
        }

        .item-cell {
          text-align: left !important;
          min-width: 260px;
        }

        .qty-input {
          width: 86px;
          height: 34px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0 8px;
          font-size: 13px;
          text-align: center;
        }

        .table-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
        }

        .vertical-actions {
          flex-direction: column;
        }

        .compact-btn,
        .btn-refresh,
        .btn-secondary,
        .btn-edit,
        .btn-delete,
        .btn-print,
        .btn-pdf,
        .btn-save {
          height: 36px;
          border-radius: 8px;
          padding: 0 14px;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }

        .compact-btn {
          min-width: 72px;
        }

        .btn-refresh {
          background: #6b7280;
          color: white;
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

        .btn-print {
          background: #0f172a;
          color: #fff;
        }

        .btn-pdf {
          background: #475569;
          color: #fff;
        }

        .btn-save {
          background: #111827;
          color: #fff;
          min-width: 180px;
        }

        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .save-card {
          display: flex;
          justify-content: flex-start;
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

        .empty-cell,
        .empty-state {
          text-align: center;
          padding: 24px;
          color: #64748b;
          font-weight: 600;
        }

        @media (max-width: 960px) {
          .toolbar,
          .info-grid {
            grid-template-columns: 1fr;
          }

          .editor-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media print {
          body * {
            visibility: hidden;
          }

          .print-area,
          .print-area * {
            visibility: visible;
          }

          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
            border: none;
          }

          .no-print {
            display: none !important;
          }

          .page-shell {
            background: white;
            padding: 0;
          }

          .table-scroll {
            max-height: none;
            overflow: visible;
          }

          .data-table th {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}