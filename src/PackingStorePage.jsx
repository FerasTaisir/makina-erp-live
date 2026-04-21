import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
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

function parsePackingParts(packingText) {
  const text = String(packingText || "").trim();
  const match = text.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);

  if (!match) {
    return {
      packCount: 0,
      packUnit: 0,
      totalLit: 0,
      packingCompact: text,
    };
  }

  const packCount = Number(match[1]);
  const packUnit = Number(match[2]);

  const compactUnit = String(packUnit).replace(/\.0+$/, "");
  const packingCompact = `${packCount}x${compactUnit}`;

  if (!Number.isFinite(packCount) || !Number.isFinite(packUnit)) {
    return {
      packCount: 0,
      packUnit: 0,
      totalLit: 0,
      packingCompact,
    };
  }

  return {
    packCount,
    packUnit,
    totalLit: packCount * packUnit,
    packingCompact,
  };
}

function buildCanDescription(row) {
  const brand = String(row?.brand_symbol || "").trim();
  const canColor = String(row?.can_color || "").trim();

  if (!brand && !canColor) return "";
  if (brand && canColor) return `${brand} CAN ${canColor}`;
  if (brand) return `${brand} CAN`;
  return `CAN ${canColor}`;
}

function buildCartonDescription(row) {
  const brand = String(row?.brand_symbol || "").trim();
  const cartonColor = String(row?.carton_color || "").trim();
  const parts = parsePackingParts(row?.packing || "");
  const packingCompact = parts.packingCompact || String(row?.packing || "").trim();

  if (!brand && !packingCompact && !cartonColor) return "";
  if (brand && packingCompact && cartonColor) {
    return `${brand} Carton ${packingCompact} ${cartonColor}`;
  }
  if (brand && packingCompact) {
    return `${brand} Carton ${packingCompact}`;
  }
  if (packingCompact && cartonColor) {
    return `Carton ${packingCompact} ${cartonColor}`;
  }
  return `${brand} Carton`.trim();
}

function extractBrandSymbolFromCustomerBrand(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  return value.split("-")[0]?.trim() || "";
}

function buildStickerDescription(brandSymbol, itemName) {
  const brand = String(brandSymbol || "").trim();
  const item = String(itemName || "").trim();

  if (brand && item) return `${brand} Sticker ${item}`;
  if (brand) return `${brand} Sticker`;
  return `Sticker ${item}`.trim();
}

function makeCanKey(packingBrandId) {
  return `can|${packingBrandId}`;
}

function makeCartonKey(packingBrandId) {
  return `carton|${packingBrandId}`;
}

function makeStickerKey(brandSymbol, itemId) {
  return `sticker|${String(brandSymbol || "").trim()}|${String(itemId || "").trim()}`;
}

export default function PackingStorePage() {
  const [packingBrandRows, setPackingBrandRows] = useState([]);
  const [customerItemsRows, setCustomerItemsRows] = useState([]);
  const [itemMasterRows, setItemMasterRows] = useState([]);
  const [orderHeaders, setOrderHeaders] = useState([]);
  const [orderLines, setOrderLines] = useState([]);
  const [stockRows, setStockRows] = useState([]);

  const [storeQtyInputs, setStoreQtyInputs] = useState({});
  const [brandFilter, setBrandFilter] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const [
        packingBrandRes,
        customerItemsRes,
        itemMasterRes,
        headersRes,
        linesRes,
        stockRes,
      ] = await Promise.all([
        supabase
          .from("packing_brand")
          .select("id, brand_symbol, packing, can_color, carton_color, sort_order")
          .order("sort_order", { ascending: true })
          .order("id", { ascending: true }),

        supabase
          .from("v_customer_items")
          .select("*")
          .order("customer_brand", { ascending: true })
          .order("item", { ascending: true }),

        supabase
          .from("item_master")
          .select("*")
          .order("item_name", { ascending: true }),

        supabase
          .from("pdo_headers")
          .select("*")
          .order("id", { ascending: true }),

        supabase
          .from("pdo_lines")
          .select("*")
          .order("pdo_header_id", { ascending: true })
          .order("line_no", { ascending: true })
          .order("id", { ascending: true }),

        supabase
          .from("packing_store_stock")
          .select("*")
          .order("id", { ascending: true }),
      ]);

      if (packingBrandRes.error) throw packingBrandRes.error;
      if (customerItemsRes.error) throw customerItemsRes.error;
      if (itemMasterRes.error) throw itemMasterRes.error;
      if (headersRes.error) throw headersRes.error;
      if (linesRes.error) throw linesRes.error;
      if (stockRes.error) throw stockRes.error;

      const packingData = packingBrandRes.data || [];
      const customerItemsData = customerItemsRes.data || [];
      const itemMasterData = itemMasterRes.data || [];
      const headersData = headersRes.data || [];
      const linesData = linesRes.data || [];
      const stockData = stockRes.data || [];

      setPackingBrandRows(packingData);
      setCustomerItemsRows(customerItemsData);
      setItemMasterRows(itemMasterData);
      setOrderHeaders(headersData);
      setOrderLines(linesData);
      setStockRows(stockData);

      const inputs = {};
      stockData.forEach((row) => {
        inputs[row.stock_key] =
          row.store_qty === null || row.store_qty === undefined ? "" : String(row.store_qty);
      });
      setStoreQtyInputs(inputs);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load Packing Store data.");
    } finally {
      setLoading(false);
    }
  }

  const itemMasterMap = useMemo(() => {
    const map = {};
    (itemMasterRows || []).forEach((row) => {
      map[row.id] = row;
    });
    return map;
  }, [itemMasterRows]);

  const stockMap = useMemo(() => {
    const map = {};
    (stockRows || []).forEach((row) => {
      map[row.stock_key] = row;
    });
    return map;
  }, [stockRows]);

  const orderColumns = useMemo(() => {
    return (orderHeaders || []).map((row) => ({
      id: row.id,
      orderNo: row.pdo_no || `Order ${row.id}`,
      date: row.pdo_date || "",
    }));
  }, [orderHeaders]);

  const brandOptions = useMemo(() => {
    const set = new Set();

    (packingBrandRows || []).forEach((row) => {
      if (row.brand_symbol) set.add(String(row.brand_symbol));
    });

    (customerItemsRows || []).forEach((row) => {
      const brand =
        row.brand_symbol ||
        extractBrandSymbolFromCustomerBrand(row.customer_brand);
      if (brand) set.add(String(brand));
    });

    return Array.from(set).sort(compareValuesAsc);
  }, [packingBrandRows, customerItemsRows]);

  const stickerMasterRows = useMemo(() => {
    const map = new Map();

    (customerItemsRows || []).forEach((row) => {
      const brandSymbol =
        row.brand_symbol ||
        extractBrandSymbolFromCustomerBrand(row.customer_brand);

      const itemId = row.item_id || "";
      const itemName =
        row.item ||
        itemMasterMap[itemId]?.item_name ||
        itemMasterMap[itemId]?.item_code ||
        "";

      if (!brandSymbol || !itemId || !itemName) return;

      const stockKey = makeStickerKey(brandSymbol, itemId);

      if (!map.has(stockKey)) {
        map.set(stockKey, {
          stock_key: stockKey,
          stock_type: "sticker",
          packing_name: buildStickerDescription(brandSymbol, itemName),
          brand_symbol: brandSymbol,
          packing_brand_id: null,
          item_id: itemId,
          sort_group: 3,
          sort_brand: brandSymbol,
          sort_name: buildStickerDescription(brandSymbol, itemName),
        });
      }
    });

    return Array.from(map.values());
  }, [customerItemsRows, itemMasterMap]);

  const canAndCartonMasterRows = useMemo(() => {
    const result = [];

    (packingBrandRows || []).forEach((row) => {
      const canName = buildCanDescription(row);
      const cartonName = buildCartonDescription(row);

      result.push({
        stock_key: makeCanKey(row.id),
        stock_type: "can",
        packing_name: canName,
        brand_symbol: row.brand_symbol || "",
        packing_brand_id: row.id,
        item_id: null,
        sort_group: 1,
        sort_brand: row.brand_symbol || "",
        sort_name: canName,
      });

      result.push({
        stock_key: makeCartonKey(row.id),
        stock_type: "carton",
        packing_name: cartonName,
        brand_symbol: row.brand_symbol || "",
        packing_brand_id: row.id,
        item_id: null,
        sort_group: 2,
        sort_brand: row.brand_symbol || "",
        sort_name: cartonName,
      });
    });

    return result;
  }, [packingBrandRows]);

  const allMasterRows = useMemo(() => {
    const map = new Map();

    [...canAndCartonMasterRows, ...stickerMasterRows].forEach((row) => {
      map.set(row.stock_key, row);
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.sort_brand !== b.sort_brand) {
        return compareValuesAsc(a.sort_brand, b.sort_brand);
      }
      if (a.sort_group !== b.sort_group) {
        return a.sort_group - b.sort_group;
      }
      return compareValuesAsc(a.sort_name, b.sort_name);
    });
  }, [canAndCartonMasterRows, stickerMasterRows]);

  const requirementsMap = useMemo(() => {
    const map = {};

    function add(stockKey, pdoHeaderId, qty) {
      if (!map[stockKey]) map[stockKey] = {};
      map[stockKey][pdoHeaderId] = num(map[stockKey][pdoHeaderId]) + num(qty);
    }

    (orderLines || []).forEach((line) => {
      const packingBrandId = line.packing_brand_id;
      const packingBrandRow = packingBrandRows.find(
        (row) => String(row.id) === String(packingBrandId)
      );

      if (!packingBrandRow) return;

      const parts = parsePackingParts(packingBrandRow.packing || "");
      const packCount = num(parts.packCount);
      const orderQty = num(line.qty);

      if (orderQty <= 0) return;

      add(makeCartonKey(packingBrandId), line.pdo_header_id, orderQty);
      add(makeCanKey(packingBrandId), line.pdo_header_id, orderQty * packCount);

      if (line.brand_symbol && line.item_id) {
        add(
          makeStickerKey(line.brand_symbol, line.item_id),
          line.pdo_header_id,
          orderQty * packCount
        );
      }
    });

    return map;
  }, [orderLines, packingBrandRows]);

  const tableRows = useMemo(() => {
    let rows = allMasterRows.map((row) => {
      const byOrder = {};
      let requiredTotal = 0;

      orderColumns.forEach((order) => {
        const qty = num(requirementsMap[row.stock_key]?.[order.id]);
        byOrder[order.id] = qty;
        requiredTotal += qty;
      });

      const stockQtyInput =
        storeQtyInputs[row.stock_key] ??
        (stockMap[row.stock_key]?.store_qty ?? "");

      const storeQty = num(stockQtyInput);
      const balance = storeQty - requiredTotal;

      return {
        ...row,
        byOrder,
        store_qty: stockQtyInput,
        required_total: requiredTotal,
        balance,
      };
    });

    if (brandFilter) {
      rows = rows.filter(
        (row) => String(row.brand_symbol || "") === String(brandFilter)
      );
    }

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((row) => {
        return (
          String(row.packing_name || "").toLowerCase().includes(q) ||
          String(row.brand_symbol || "").toLowerCase().includes(q) ||
          String(row.stock_type || "").toLowerCase().includes(q)
        );
      });
    }

    return rows;
  }, [
    allMasterRows,
    orderColumns,
    requirementsMap,
    storeQtyInputs,
    stockMap,
    brandFilter,
    search,
  ]);

  const totals = useMemo(() => {
    const totalByOrder = {};
    orderColumns.forEach((order) => {
      totalByOrder[order.id] = 0;
    });

    let totalStoreQty = 0;
    let totalRequired = 0;
    let totalBalance = 0;

    tableRows.forEach((row) => {
      totalStoreQty += num(row.store_qty);
      totalRequired += num(row.required_total);
      totalBalance += num(row.balance);

      orderColumns.forEach((order) => {
        totalByOrder[order.id] += num(row.byOrder[order.id]);
      });
    });

    return {
      totalByOrder,
      totalStoreQty,
      totalRequired,
      totalBalance,
    };
  }, [tableRows, orderColumns]);

  function handleStoreQtyChange(stockKey, value) {
    setStoreQtyInputs((prev) => ({
      ...prev,
      [stockKey]: value,
    }));
  }

  async function handleSaveStoreQty() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = allMasterRows.map((row) => ({
        stock_key: row.stock_key,
        stock_type: row.stock_type,
        packing_name: row.packing_name,
        brand_symbol: row.brand_symbol || null,
        packing_brand_id: row.packing_brand_id || null,
        item_id: row.item_id || null,
        store_qty: num(storeQtyInputs[row.stock_key]),
      }));

      if (payload.length === 0) {
        setMessage("Nothing to save.");
        return;
      }

      const { error } = await supabase
        .from("packing_store_stock")
        .upsert(payload, { onConflict: "stock_key" });

      if (error) throw error;

      setMessage("Packing Store quantities saved successfully.");
      await loadAll();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save Packing Store quantities.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="page-title-wrap">
        <h1>Packing Store</h1>
        <p>Store stock vs required quantities for Can / Carton / Sticker</p>
      </div>

      <div className="toolbar-card">
        <div className="toolbar toolbar-three">
          <input
            type="text"
            placeholder="Search by Packing Name / Brand / Type"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="">All Brands</option>
            {brandOptions.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <button type="button" className="btn-refresh" onClick={loadAll}>
            Refresh
          </button>
        </div>
      </div>

      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div className="empty-state">Loading Packing Store...</div>
          ) : tableRows.length === 0 ? (
            <div className="empty-state">No Packing Store rows found.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: "70px" }}>No.</th>
                  <th style={{ minWidth: "340px" }}>Packing Name</th>
                  <th style={{ minWidth: "120px" }}>Type</th>
                  <th style={{ minWidth: "120px" }}>Store Qty</th>

                  {orderColumns.map((order) => (
                    <th key={order.id} style={{ minWidth: "120px" }}>
                      {order.orderNo}
                    </th>
                  ))}

                  <th style={{ minWidth: "130px" }}>Required Total</th>
                  <th style={{ minWidth: "120px" }}>Balance</th>
                </tr>
              </thead>

              <tbody>
                {tableRows.map((row, index) => (
                  <tr key={row.stock_key}>
                    <td>{index + 1}</td>
                    <td>{row.packing_name}</td>
                    <td style={{ textTransform: "capitalize" }}>{row.stock_type}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={row.store_qty}
                        onChange={(e) =>
                          handleStoreQtyChange(row.stock_key, e.target.value)
                        }
                        className="store-qty-input"
                      />
                    </td>

                    {orderColumns.map((order) => (
                      <td key={`${row.stock_key}-${order.id}`}>
                        {num(row.byOrder[order.id]).toFixed(3).replace(/\.?0+$/, "")}
                      </td>
                    ))}

                    <td>
                      {num(row.required_total).toFixed(3).replace(/\.?0+$/, "")}
                    </td>
                    <td
                      className={
                        num(row.balance) < 0 ? "negative-balance" : "positive-balance"
                      }
                    >
                      {num(row.balance).toFixed(3).replace(/\.?0+$/, "")}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <th colSpan="3">Totals</th>
                  <th>
                    {totals.totalStoreQty.toFixed(3).replace(/\.?0+$/, "")}
                  </th>

                  {orderColumns.map((order) => (
                    <th key={`total-${order.id}`}>
                      {num(totals.totalByOrder[order.id])
                        .toFixed(3)
                        .replace(/\.?0+$/, "")}
                    </th>
                  ))}

                  <th>
                    {totals.totalRequired.toFixed(3).replace(/\.?0+$/, "")}
                  </th>
                  <th className={totals.totalBalance < 0 ? "negative-balance" : "positive-balance"}>
                    {totals.totalBalance.toFixed(3).replace(/\.?0+$/, "")}
                  </th>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      <div className="bottom-bar-card">
        <div className="bottom-bar">
          <div className="bottom-buttons">
            <button type="button" onClick={handleSaveStoreQty} disabled={saving}>
              {saving ? "Saving..." : "Save Store Qty"}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                const reset = {};
                stockRows.forEach((row) => {
                  reset[row.stock_key] =
                    row.store_qty === null || row.store_qty === undefined
                      ? ""
                      : String(row.store_qty);
                });
                setStoreQtyInputs(reset);
                setMessage("");
                setError("");
              }}
              disabled={saving}
            >
              Reset
            </button>
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

        .toolbar-card,
        .table-card,
        .bottom-bar-card {
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 8px 26px rgba(15, 23, 42, 0.08);
          border: 1px solid #e5e7eb;
          max-width: 1400px;
          margin: 0 auto 22px;
        }

        .toolbar-card {
          padding: 18px 22px;
        }

        .bottom-bar-card {
          padding: 16px 22px;
        }

        .table-card {
          padding: 0;
          overflow: hidden;
        }

        .toolbar {
          display: grid;
          gap: 12px;
        }

        .toolbar-three {
          grid-template-columns: 1.6fr 1fr auto;
        }

        .toolbar input,
        .toolbar select,
        .store-qty-input {
          height: 44px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 0 14px;
          font-size: 14px;
          background: #fff;
          outline: none;
          color: #1f2937;
          width: 100%;
          box-sizing: border-box;
        }

        .alert {
          max-width: 1400px;
          margin: 0 auto 18px;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 600;
        }

        .alert.success {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .alert.error {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .table-scroll {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1100px;
        }

        .data-table thead th {
          background: #0f172a;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          padding: 14px 12px;
          text-align: left;
          border-bottom: 1px solid #1e293b;
          white-space: nowrap;
        }

        .data-table tbody td,
        .data-table tfoot th,
        .data-table tfoot td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
          color: #1f2937;
          background: #ffffff;
          vertical-align: middle;
          white-space: nowrap;
        }

        .data-table tbody tr:hover td {
          background: #f8fafc;
        }

        .data-table tfoot th,
        .data-table tfoot td {
          background: #f8fafc;
          font-weight: 700;
        }

        .empty-state {
          padding: 28px;
          text-align: center;
          color: #64748b;
          font-size: 15px;
        }

        .bottom-bar {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .bottom-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        button {
          border: none;
          border-radius: 10px;
          padding: 0 22px;
          height: 46px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          background: #1565c0;
          color: #fff;
        }

        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .btn-secondary,
        .btn-refresh {
          background: #475569;
          color: #fff;
        }

        .negative-balance {
          color: #b91c1c !important;
          font-weight: 700;
        }

        .positive-balance {
          color: #166534 !important;
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .toolbar-three {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}