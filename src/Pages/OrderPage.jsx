import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const emptyHeader = {
  id: "",
  customer_id: "",
  pdo_no: "",
  pdo_date: "",
};

const emptyLine = {
  row_id: "",
  line_no: 1,
  brand_symbol: "",
  item_id: "",
  quantities: {},
};

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

function parsePackingLiters(packingText) {
  return parsePackingParts(packingText).totalLit;
}

function formatSizeLabel(unitValue) {
  const value = num(unitValue);
  if (!value) return "";
  return `${String(value).replace(/\.0+$/, "")} L`;
}

function getNextOrderNo(headers) {
  let maxNumber = 0;

  (headers || []).forEach((row) => {
    const code = String(row?.pdo_no || "");
    const match = code.match(/PDO-(\d+)/i);
    if (match) {
      const n = Number(match[1]);
      if (!Number.isNaN(n) && n > maxNumber) {
        maxNumber = n;
      }
    }
  });

  return `PDO-${String(maxNumber + 1).padStart(4, "0")}`;
}

function getCustomerLabel(customer) {
  return [
    customer?.customer_code || "",
    customer?.customer_symbol || "",
    customer?.customer_name || "",
  ]
    .filter(Boolean)
    .join(" - ");
}

function buildItemLabel(row, itemMasterMap) {
  const item = itemMasterMap[row.item_id];
  if (item?.item_name) return item.item_name;
  if (row.item) return row.item;
  return row.item_id ? `Item #${row.item_id}` : "";
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

function calcLineTotals(line, packingBrandMap, itemMasterMap) {
  const item = itemMasterMap[line.item_id] || {};
  const density = num(item.density);

  let totalLit = 0;
  let totalProductKg = 0;
  let totalPackingEmptyWeight = 0;

  Object.entries(line.quantities || {}).forEach(([packingBrandId, qty]) => {
    const packingRow = packingBrandMap[packingBrandId] || {};
    const litersPerPacking = parsePackingLiters(packingRow.packing || "");
    const quantity = num(qty);
    const packingLit = quantity * litersPerPacking;
    const packingProductKg = packingLit * density;
    const packingEmptyWeight = quantity * num(packingRow.packing_empty_weight);

    totalLit += packingLit;
    totalProductKg += packingProductKg;
    totalPackingEmptyWeight += packingEmptyWeight;
  });

  return {
    totalLit,
    totalKg: totalProductKg,
    totalPackingEmptyWeight,
    totalWeightWithoutPallets: totalProductKg + totalPackingEmptyWeight,
  };
}

export default function OrderPage() {
  const [customers, setCustomers] = useState([]);
  const [customerBrands, setCustomerBrands] = useState([]);
  const [customerItems, setCustomerItems] = useState([]);
  const [itemMasterRows, setItemMasterRows] = useState([]);
  const [packingBrandRows, setPackingBrandRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [palletData, setPalletData] = useState(null);

  const [headerForm, setHeaderForm] = useState({
    ...emptyHeader,
    pdo_date: todayISO(),
  });

  const [lines, setLines] = useState([{ ...emptyLine, row_id: crypto.randomUUID() }]);
  const [packingColumns, setPackingColumns] = useState([]);

  const [editingRowId, setEditingRowId] = useState("");
  const [bottomPackingId, setBottomPackingId] = useState("");
  const [bottomPackingQty, setBottomPackingQty] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const itemMasterMap = useMemo(() => {
    const map = {};
    (itemMasterRows || []).forEach((row) => {
      map[row.id] = row;
    });
    return map;
  }, [itemMasterRows]);

  const packingBrandMap = useMemo(() => {
    const map = {};
    (packingBrandRows || []).forEach((row) => {
      map[String(row.id)] = row;
    });
    return map;
  }, [packingBrandRows]);

  const customerMap = useMemo(() => {
    const map = {};
    (customers || []).forEach((row) => {
      map[row.id] = row;
    });
    return map;
  }, [customers]);

  const editingRowIndex = useMemo(() => {
    return lines.findIndex((line) => line.row_id === editingRowId);
  }, [lines, editingRowId]);

  const editingRow = editingRowIndex >= 0 ? lines[editingRowIndex] : null;

  const filteredHeaders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return headers;

    return headers.filter((row) => {
      const customer = customerMap[row.customer_id] || {};
      return (
        String(row.pdo_no || "").toLowerCase().includes(q) ||
        String(row.pdo_date || "").toLowerCase().includes(q) ||
        String(customer.customer_code || "").toLowerCase().includes(q) ||
        String(customer.customer_symbol || "").toLowerCase().includes(q) ||
        String(customer.customer_name || "").toLowerCase().includes(q)
      );
    });
  }, [headers, search, customerMap]);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [
        customersRes,
        brandCustomerRes,
        customerItemsRes,
        itemMasterRes,
        packingBrandRes,
        headersRes,
        palletDataRes,
      ] = await Promise.all([
        supabase.from("customers").select("*").order("customer_code", { ascending: true }),
        supabase
          .from("brand_customer")
          .select("id, customer_id, customer_brand, brand_symbol")
          .order("customer_brand", { ascending: true }),
        supabase.from("v_customer_items").select("*").order("item", { ascending: true }),
        supabase.from("item_master").select("*").order("item_name", { ascending: true }),
        supabase
          .from("packing_brand")
          .select("id, brand_symbol, packing, can_color, carton_color, sort_order, pack_per_pallet, packing_empty_weight")
          .order("sort_order", { ascending: true })
          .order("id", { ascending: true }),
        supabase.from("pdo_headers").select("*").order("id", { ascending: false }),
        supabase.from("pallet_data").select("*").order("id", { ascending: true }).limit(1),
      ]);

      if (customersRes.error) throw customersRes.error;
      if (brandCustomerRes.error) throw brandCustomerRes.error;
      if (customerItemsRes.error) throw customerItemsRes.error;
      if (itemMasterRes.error) throw itemMasterRes.error;
      if (packingBrandRes.error) throw packingBrandRes.error;
      if (headersRes.error) throw headersRes.error;
      if (palletDataRes.error) throw palletDataRes.error;

      const customersData = customersRes.data || [];
      const customerBrandsData = brandCustomerRes.data || [];
      const customerItemsData = customerItemsRes.data || [];
      const itemMasterData = itemMasterRes.data || [];
      const packingBrandData = packingBrandRes.data || [];
      const headersData = headersRes.data || [];
      const palletDataRow = (palletDataRes.data || [])[0] || null;

      setCustomers(customersData);
      setCustomerBrands(customerBrandsData);
      setCustomerItems(customerItemsData);
      setItemMasterRows(itemMasterData);
      setPackingBrandRows(packingBrandData);
      setHeaders(headersData);
      setPalletData(palletDataRow);

      setHeaderForm((prev) => ({
        ...prev,
        pdo_no: prev.id ? prev.pdo_no : getNextOrderNo(headersData),
        pdo_date: prev.pdo_date || todayISO(),
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load Order data.");
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    const newRowId = crypto.randomUUID();

    setHeaderForm({
      ...emptyHeader,
      pdo_no: getNextOrderNo(headers),
      pdo_date: todayISO(),
    });
    setLines([{ ...emptyLine, line_no: 1, row_id: newRowId }]);
    setPackingColumns([]);
    setEditingRowId(newRowId);
    setBottomPackingId("");
    setBottomPackingQty("");
    setMessage("");
    setError("");
  }

  function handleHeaderChange(field, value) {
    setHeaderForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleLineChange(index, field, value) {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;

        const updated = {
          ...line,
          [field]: value,
        };

        if (field === "brand_symbol") {
          updated.quantities = {};
        }

        return updated;
      })
    );
  }

  function addRow() {
    const newRowId = crypto.randomUUID();

    setLines((prev) => [
      ...prev,
      {
        ...emptyLine,
        line_no: prev.length + 1,
        row_id: newRowId,
      },
    ]);

    setEditingRowId(newRowId);
    setBottomPackingId("");
    setBottomPackingQty("");
  }

  function removeRow(index) {
    setLines((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        const newRowId = crypto.randomUUID();
        setEditingRowId(newRowId);
        return [{ ...emptyLine, line_no: 1, row_id: newRowId }];
      }

      const normalized = next.map((line, i) => ({
        ...line,
        line_no: i + 1,
      }));

      if (!normalized.some((line) => line.row_id === editingRowId)) {
        setEditingRowId(normalized[0].row_id);
      }

      return normalized;
    });
  }

  function getBrandOptionsForCustomer(customerId) {
    if (!customerId) return [];
    return customerBrands.filter(
      (row) => String(row.customer_id) === String(customerId)
    );
  }

  function getItemOptionsForCustomer(customerId) {
    if (!customerId) return [];
    return customerItems.filter(
      (row) => String(row.customer_id) === String(customerId)
    );
  }

  function getPackingOptionsForBrand(brandSymbol) {
    if (!brandSymbol) return [];
    return packingBrandRows.filter(
      (row) => String(row.brand_symbol) === String(brandSymbol)
    );
  }

  function handleAddPackingBottom() {
    if (!editingRow) {
      setError("Please select a row to edit first.");
      setMessage("");
      return;
    }

    if (!editingRow.brand_symbol) {
      setError("Please select Brand in the edited row first.");
      setMessage("");
      return;
    }

    if (!bottomPackingId) {
      setError("Please select Packing.");
      setMessage("");
      return;
    }

    const qty = num(bottomPackingQty);
    if (qty <= 0) {
      setError("Please enter Qty greater than zero.");
      setMessage("");
      return;
    }

    const packingRow = packingBrandMap[String(bottomPackingId)];
    if (!packingRow) {
      setError("Selected Packing not found.");
      setMessage("");
      return;
    }

    if (String(packingRow.brand_symbol || "") !== String(editingRow.brand_symbol || "")) {
      setError("Selected Packing does not belong to this row Brand.");
      setMessage("");
      return;
    }

    setError("");
    setMessage("");

    setPackingColumns((prev) => {
      const exists = prev.some((col) => String(col.id) === String(packingRow.id));
      if (exists) return prev;

      return [...prev, packingRow].sort((a, b) => {
        const aOrder = Number(a.sort_order || 0);
        const bOrder = Number(b.sort_order || 0);
        if (aOrder !== bOrder) return aOrder - bOrder;
        return String(a.packing || "").localeCompare(String(b.packing || ""));
      });
    });

    setLines((prev) =>
      prev.map((row) => {
        if (row.row_id !== editingRowId) return row;

        return {
          ...row,
          quantities: {
            ...row.quantities,
            [String(bottomPackingId)]:
              num(row.quantities[String(bottomPackingId)]) + qty,
          },
        };
      })
    );

    setBottomPackingId("");
    setBottomPackingQty("");
  }

  function handleQuantityCellChange(index, packingBrandId, value) {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;

        return {
          ...line,
          quantities: {
            ...line.quantities,
            [String(packingBrandId)]: value,
          },
        };
      })
    );
  }

  async function handleSave() {
    if (!headerForm.customer_id) {
      setError("Please select Customer.");
      setMessage("");
      return;
    }

    const validLines = lines.filter((line) => {
      const totalQty = Object.values(line.quantities || {}).reduce(
        (sum, qty) => sum + num(qty),
        0
      );

      return (
        String(line.brand_symbol || "").trim() &&
        String(line.item_id || "").trim() &&
        totalQty > 0
      );
    });

    if (validLines.length === 0) {
      setError("Please add at least one valid line.");
      setMessage("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const orderNo = headerForm.pdo_no || getNextOrderNo(headers);
      const orderDate = headerForm.pdo_date || todayISO();

      let headerId = headerForm.id;

      if (headerId) {
        const { error: updateHeaderError } = await supabase
          .from("pdo_headers")
          .update({
            customer_id: headerForm.customer_id,
            pdo_no: orderNo,
            pdo_date: orderDate,
          })
          .eq("id", headerId);

        if (updateHeaderError) throw updateHeaderError;

        const { error: deleteLinesError } = await supabase
          .from("pdo_lines")
          .delete()
          .eq("pdo_header_id", headerId);

        if (deleteLinesError) throw deleteLinesError;
      } else {
        const { data: insertedHeader, error: insertHeaderError } = await supabase
          .from("pdo_headers")
          .insert([
            {
              customer_id: headerForm.customer_id,
              pdo_no: orderNo,
              pdo_date: orderDate,
            },
          ])
          .select()
          .single();

        if (insertHeaderError) throw insertHeaderError;
        headerId = insertedHeader.id;
      }

      const linePayload = [];

      validLines.forEach((line, lineIndex) => {
        const item = itemMasterMap[line.item_id] || {};
        const density = num(item.density);

        Object.entries(line.quantities || {}).forEach(([packingBrandId, qty]) => {
          const quantity = num(qty);
          if (quantity <= 0) return;

          const packingRow = packingBrandMap[String(packingBrandId)] || {};
          const litersPerPacking = parsePackingLiters(packingRow.packing || "");
          const total_lit = quantity * litersPerPacking;
          const total_kg = total_lit * density;

          linePayload.push({
            pdo_header_id: headerId,
            line_no: lineIndex + 1,
            brand_symbol: line.brand_symbol,
            item_id: line.item_id || null,
            item_name:
              item.item_name ||
              item.item_code ||
              buildItemLabel(line, itemMasterMap) ||
              "",
            density,
            packing_brand_id: packingBrandId,
            packing: packingRow.packing || "",
            qty: quantity,
            total_lit,
            total_kg,
          });
        });
      });

      if (linePayload.length === 0) {
        throw new Error("No packing quantities found to save.");
      }

      const { error: insertLinesError } = await supabase
        .from("pdo_lines")
        .insert(linePayload);

      if (insertLinesError) throw insertLinesError;

      setMessage(headerForm.id ? "Order updated successfully." : "Order added successfully.");
      clearForm();
      await loadAll();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save Order.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEditHeader(row) {
    try {
      setLoading(true);
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
      const usedPackingIds = new Set();

      (detailRows || []).forEach((detail) => {
        const lineKey = `${detail.line_no}__${detail.brand_symbol}__${detail.item_id}`;
        if (!grouped[lineKey]) {
          grouped[lineKey] = {
            row_id: crypto.randomUUID(),
            line_no: detail.line_no,
            brand_symbol: detail.brand_symbol || "",
            item_id: detail.item_id || "",
            quantities: {},
          };
        }

        grouped[lineKey].quantities[String(detail.packing_brand_id)] = detail.qty;
        usedPackingIds.add(String(detail.packing_brand_id));
      });

      const rebuiltLines = Object.values(grouped).sort(
        (a, b) => num(a.line_no) - num(b.line_no)
      );

      const rebuiltPackingColumns = packingBrandRows
        .filter((row) => usedPackingIds.has(String(row.id)))
        .sort((a, b) => {
          const aOrder = Number(a.sort_order || 0);
          const bOrder = Number(b.sort_order || 0);
          if (aOrder !== bOrder) return aOrder - bOrder;
          return String(a.packing || "").localeCompare(String(b.packing || ""));
        });

      const preparedLines =
        rebuiltLines.length > 0
          ? rebuiltLines.map((line, index) => ({
              ...line,
              line_no: index + 1,
            }))
          : [{ ...emptyLine, line_no: 1, row_id: crypto.randomUUID() }];

      setHeaderForm({
        id: row.id,
        customer_id: row.customer_id || "",
        pdo_no: row.pdo_no || "",
        pdo_date: row.pdo_date || todayISO(),
      });

      setLines(preparedLines);
      setPackingColumns(rebuiltPackingColumns);
      setEditingRowId(preparedLines[0]?.row_id || "");
      setBottomPackingId("");
      setBottomPackingQty("");

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load Order details.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteHeader(row) {
    const ok = window.confirm(`Delete Order?\n\n${row.pdo_no}`);
    if (!ok) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const { error } = await supabase
        .from("pdo_headers")
        .delete()
        .eq("id", row.id);

      if (error) throw error;

      if (String(headerForm.id) === String(row.id)) {
        clearForm();
      }

      setMessage("Order deleted successfully.");
      await loadAll();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete Order.");
    } finally {
      setSaving(false);
    }
  }

  const packingTotals = useMemo(() => {
    const totals = {};

    packingColumns.forEach((col) => {
      totals[String(col.id)] = 0;
    });

    lines.forEach((line) => {
      packingColumns.forEach((col) => {
        totals[String(col.id)] += num(line.quantities[String(col.id)]);
      });
    });

    return totals;
  }, [lines, packingColumns]);

  const palletTotals = useMemo(() => {
    const totals = {};

    packingColumns.forEach((col) => {
      const totalPackages = packingTotals[String(col.id)] || 0;
      const packPerPallet = num(col.pack_per_pallet);
      totals[String(col.id)] =
        packPerPallet > 0 ? totalPackages / packPerPallet : 0;
    });

    return totals;
  }, [packingColumns, packingTotals]);

  const grandTotals = useMemo(() => {
    return lines.reduce(
      (acc, line) => {
        const totals = calcLineTotals(line, packingBrandMap, itemMasterMap);
        acc.totalLit += totals.totalLit;
        acc.totalKg += totals.totalKg;
        acc.totalPackingEmptyWeight += totals.totalPackingEmptyWeight;
        acc.totalWeightWithoutPallets += totals.totalWeightWithoutPallets;
        return acc;
      },
      {
        totalLit: 0,
        totalKg: 0,
        totalPackingEmptyWeight: 0,
        totalWeightWithoutPallets: 0,
      }
    );
  }, [lines, packingBrandMap, itemMasterMap]);

  const totalPackagesAll = useMemo(() => {
    return Object.values(packingTotals).reduce((sum, value) => sum + num(value), 0);
  }, [packingTotals]);

  const totalPalletsAll = useMemo(() => {
    return Object.values(palletTotals).reduce((sum, value) => sum + num(value), 0);
  }, [palletTotals]);

  const palletWeightValue = num(palletData?.pallet_weight);
  const totalWeightWithPallets =
    grandTotals.totalWeightWithoutPallets + totalPalletsAll * palletWeightValue;

  const bottomPackingOptions = useMemo(() => {
    if (!editingRow?.brand_symbol) return [];
    return getPackingOptionsForBrand(editingRow.brand_symbol);
  }, [editingRow, packingBrandRows]);

  const packingDescriptionRows = useMemo(() => {
    return packingColumns.map((col, index) => {
      const packageQty = packingTotals[String(col.id)] || 0;
      const parts = parsePackingParts(col.packing || "");
      const canDescription = buildCanDescription(col);
      const cartonDescription = buildCartonDescription(col);
      const canQty = packageQty * parts.packCount;

      return {
        id: col.id,
        sn: index + 1,
        packageName: cartonDescription || col.packing || "",
        packageQty,
        canDescription,
        canQty,
      };
    });
  }, [packingColumns, packingTotals]);

  const stickerSizeColumns = useMemo(() => {
    const set = new Set();

    packingColumns.forEach((col) => {
      const parts = parsePackingParts(col.packing || "");
      const label = formatSizeLabel(parts.packUnit);
      if (label) set.add(label);
    });

    return Array.from(set).sort((a, b) => num(a) - num(b));
  }, [packingColumns]);

  const stickerRows = useMemo(() => {
    return lines.map((line, index) => {
      const row = {
        sn: index + 1,
        itemName: buildItemLabel(line, itemMasterMap),
        sizes: {},
      };

      stickerSizeColumns.forEach((size) => {
        row.sizes[size] = 0;
      });

      Object.entries(line.quantities || {}).forEach(([packingBrandId, qty]) => {
        const packingRow = packingBrandMap[packingBrandId] || {};
        const parts = parsePackingParts(packingRow.packing || "");
        const sizeLabel = formatSizeLabel(parts.packUnit);
        const stickersQty = num(qty) * parts.packCount;

        if (sizeLabel) {
          row.sizes[sizeLabel] = (row.sizes[sizeLabel] || 0) + stickersQty;
        }
      });

      return row;
    });
  }, [lines, stickerSizeColumns, packingBrandMap, itemMasterMap]);

  return (
    <div className="page-shell">
      <div className="page-title-wrap">
        <h1>Order Page</h1>
        <p>Create dynamic packing columns by Customer / Brand / Item</p>
      </div>

      <div className="page-card">
        <div className="form-grid three-cols compact-header-grid">
          <div className="form-group">
            <label>Customer</label>
            <select
              value={headerForm.customer_id}
              onChange={(e) => handleHeaderChange("customer_id", e.target.value)}
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {getCustomerLabel(customer)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Order No.</label>
            <input type="text" value={headerForm.pdo_no} readOnly />
          </div>

          <div className="form-group">
            <label>Order Date</label>
            <input
              type="date"
              value={headerForm.pdo_date}
              onChange={(e) => handleHeaderChange("pdo_date", e.target.value)}
            />
          </div>
        </div>
      </div>

      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <div className="table-card">
        <div className="table-scroll">
          <table className="data-table order-table">
            <thead>
              <tr>
                <th rowSpan="2" className="th-sn">S/N</th>
                <th rowSpan="2" className="th-brand">Brand</th>
                <th rowSpan="2" className="th-item">Item</th>
                {packingColumns.map((col) => (
                  <th key={`top-${col.id}`} className="packing-top-cell">
                    Packing
                  </th>
                ))}
                <th rowSpan="2" className="th-total">Total Lit</th>
                <th rowSpan="2" className="th-total">Total kg</th>
                <th rowSpan="2" className="th-actions">Actions</th>
              </tr>
              <tr>
                {packingColumns.map((col) => (
                  <th key={`name-${col.id}`} className="packing-name-cell">
                    {col.packing}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {lines.length === 0 ? (
                <tr>
                  <td colSpan={7 + packingColumns.length} className="empty-cell">
                    No lines.
                  </td>
                </tr>
              ) : (
                lines.map((line, index) => {
                  const brandOptions = getBrandOptionsForCustomer(headerForm.customer_id);
                  const itemOptions = getItemOptionsForCustomer(headerForm.customer_id);
                  const totals = calcLineTotals(line, packingBrandMap, itemMasterMap);
                  const isEditing = editingRowId === line.row_id;

                  return (
                    <tr key={line.row_id || index} className={isEditing ? "editing-row" : ""}>
                      <td>{index + 1}</td>

                      <td>
                        {isEditing ? (
                          <select
                            value={line.brand_symbol}
                            onChange={(e) =>
                              handleLineChange(index, "brand_symbol", e.target.value)
                            }
                            disabled={!headerForm.customer_id}
                            className="compact-select"
                          >
                            <option value="">
                              {!headerForm.customer_id
                                ? "Select Customer first"
                                : "Select Brand"}
                            </option>
                            {brandOptions.map((brand) => (
                              <option key={brand.id} value={brand.brand_symbol}>
                                {brand.brand_symbol}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span>{line.brand_symbol || ""}</span>
                        )}
                      </td>

                      <td className="item-cell">
                        {isEditing ? (
                          <select
                            value={line.item_id}
                            onChange={(e) =>
                              handleLineChange(index, "item_id", e.target.value)
                            }
                            disabled={!headerForm.customer_id}
                            className="compact-select"
                          >
                            <option value="">
                              {!headerForm.customer_id
                                ? "Select Customer first"
                                : "Select Item"}
                            </option>
                            {itemOptions.map((row) => (
                              <option key={`${row.id}-${row.item_id}`} value={row.item_id}>
                                {buildItemLabel(row, itemMasterMap)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span>{buildItemLabel(line, itemMasterMap)}</span>
                        )}
                      </td>

                      {packingColumns.map((col) => (
                        <td key={`qty-${line.row_id}-${col.id}`} className="qty-cell">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              step="0.001"
                              value={line.quantities[String(col.id)] ?? ""}
                              onChange={(e) =>
                                handleQuantityCellChange(index, col.id, e.target.value)
                              }
                              className="compact-qty-input"
                            />
                          ) : (
                            <span>{line.quantities[String(col.id)] ?? ""}</span>
                          )}
                        </td>
                      ))}

                      <td>{totals.totalLit.toFixed(2)}</td>
                      <td>{totals.totalKg.toFixed(4)}</td>

                      <td>
                        <div className="table-actions">
                          {isEditing ? (
                            <button
                              type="button"
                              className="btn-edit compact-btn"
                              onClick={() => {
                                setEditingRowId("");
                                setBottomPackingId("");
                                setBottomPackingQty("");
                              }}
                            >
                              Done
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="btn-edit compact-btn"
                              onClick={() => {
                                setEditingRowId(line.row_id);
                                setBottomPackingId("");
                                setBottomPackingQty("");
                              }}
                            >
                              Edit
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn-delete compact-btn"
                            onClick={() => removeRow(index)}
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

            <tfoot>
              <tr>
                <th colSpan="3" className="footer-label">No. of Package</th>
                {packingColumns.map((col) => (
                  <th key={`pkg-${col.id}`}>
                    {packingTotals[String(col.id)].toFixed(3).replace(/\.?0+$/, "")}
                  </th>
                ))}
                <th>{grandTotals.totalLit.toFixed(2)}</th>
                <th>{grandTotals.totalKg.toFixed(4)}</th>
                <th></th>
              </tr>

              <tr>
                <th colSpan="3" className="footer-label">No. of Pallets</th>
                {packingColumns.map((col) => (
                  <th key={`plt-${col.id}`}>
                    {palletTotals[String(col.id)].toFixed(6).replace(/\.?0+$/, "")}
                  </th>
                ))}
                <th>{totalPalletsAll.toFixed(6).replace(/\.?0+$/, "")}</th>
                <th></th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-grid">
          <div className="summary-box">
            <div className="summary-label">Total Pallet</div>
            <div className="summary-value">
              {totalPalletsAll.toFixed(6).replace(/\.?0+$/, "")}
            </div>
          </div>

          <div className="summary-box">
            <div className="summary-label">Total Packing</div>
            <div className="summary-value">
              {totalPackagesAll.toFixed(3).replace(/\.?0+$/, "")}
            </div>
          </div>

          <div className="summary-box">
            <div className="summary-label">Total Weight W/O Pallets</div>
            <div className="summary-value">
              {grandTotals.totalWeightWithoutPallets.toFixed(3)}
            </div>
          </div>

          <div className="summary-box">
            <div className="summary-label">Total Weight With Pallets</div>
            <div className="summary-value">
              {totalWeightWithPallets.toFixed(3)}
            </div>
          </div>
        </div>

        <div className="summary-note">
          Pallet Weight used: {palletWeightValue.toFixed(3)}
        </div>
      </div>

      <div className="report-card">
        <div className="report-title">Packing Description</div>
        <div className="table-scroll">
          <table className="data-table report-table">
            <thead>
              <tr>
                <th style={{ width: "70px" }}>S/N</th>
                <th>Package</th>
                <th style={{ width: "100px" }}>Qty</th>
                <th>Remarks</th>
                <th>Can</th>
                <th style={{ width: "100px" }}>Qty</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {packingDescriptionRows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">No packing description.</td>
                </tr>
              ) : (
                packingDescriptionRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.sn}</td>
                    <td>{row.packageName}</td>
                    <td>{row.packageQty}</td>
                    <td></td>
                    <td>{row.canDescription}</td>
                    <td>{row.canQty}</td>
                    <td></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-card">
        <div className="report-title">Stickers Requirement</div>
        <div className="table-scroll">
          <table className="data-table report-table">
            <thead>
              <tr>
                <th style={{ width: "70px" }}>S/N</th>
                <th>Stickers</th>
                {stickerSizeColumns.map((size) => (
                  <th key={size}>{size}</th>
                ))}
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {stickerRows.length === 0 ? (
                <tr>
                  <td colSpan={3 + stickerSizeColumns.length} className="empty-cell">
                    No stickers requirement.
                  </td>
                </tr>
              ) : (
                stickerRows.map((row) => (
                  <tr key={`${row.sn}-${row.itemName}`}>
                    <td>{row.sn}</td>
                    <td className="item-cell">{row.itemName}</td>
                    {stickerSizeColumns.map((size) => (
                      <td key={`${row.sn}-${size}`}>
                        {row.sizes[size] ? row.sizes[size] : ""}
                      </td>
                    ))}
                    <td></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bottom-bar-card">
        <div className="bottom-bar">
          <div className="bottom-buttons">
            <button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : headerForm.id ? "Update Order" : "Save Order"}
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={clearForm}
              disabled={saving}
            >
              Clear
            </button>

            <button
              type="button"
              className="btn-dark"
              onClick={addRow}
              disabled={!headerForm.customer_id}
            >
              Add Row
            </button>
          </div>

          <div className="bottom-packing">
            <div className="bottom-packing-title">
              {editingRow ? `Editing Row #${editingRow.line_no}` : "Select a row with Edit"}
            </div>

            <select
              value={bottomPackingId}
              onChange={(e) => setBottomPackingId(e.target.value)}
              disabled={!editingRow || !editingRow.brand_symbol}
            >
              <option value="">
                {!editingRow
                  ? "Select row first"
                  : !editingRow.brand_symbol
                  ? "Select Brand in row first"
                  : bottomPackingOptions.length === 0
                  ? "No Packing found"
                  : "Select Packing"}
              </option>

              {bottomPackingOptions.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.packing}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              step="0.001"
              value={bottomPackingQty}
              onChange={(e) => setBottomPackingQty(e.target.value)}
              placeholder="Qty"
              disabled={!editingRow}
            />

            <button
              type="button"
              className="btn-dark"
              onClick={handleAddPackingBottom}
              disabled={!editingRow}
            >
              Add Packing
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="toolbar toolbar-two">
          <input
            type="text"
            placeholder="Search by Order No / Date / Customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="btn-refresh" onClick={loadAll}>
            Refresh
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          {loading ? (
            <div className="empty-state">Loading Order records...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Order Date</th>
                  <th>Customer Code</th>
                  <th>Customer Symbol</th>
                  <th>Customer Name</th>
                  <th style={{ width: "160px" }}>Actions</th>
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
                          <div className="table-actions">
                            <button
                              type="button"
                              className="btn-edit compact-btn"
                              onClick={() => handleEditHeader(row)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn-delete compact-btn"
                              onClick={() => handleDeleteHeader(row)}
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
        .toolbar-card,
        .table-card,
        .bottom-bar-card,
        .summary-card,
        .report-card {
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 8px 26px rgba(15, 23, 42, 0.08);
          border: 1px solid #e5e7eb;
          max-width: 1400px;
          margin: 0 auto 22px;
        }

        .page-card,
        .toolbar-card,
        .bottom-bar-card,
        .summary-card,
        .report-card {
          padding: 22px 18px;
        }

        .table-card {
          padding: 0;
          overflow: hidden;
        }

        .report-title {
          font-size: 18px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 12px;
        }

        .form-grid,
        .toolbar {
          display: grid;
          gap: 12px;
        }

        .three-cols {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .toolbar-two {
          grid-template-columns: 1fr 140px;
        }

        .compact-header-grid {
          gap: 10px;
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
        .toolbar input,
        .bottom-packing select,
        .bottom-packing input {
          height: 44px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 0 12px;
          font-size: 14px;
          outline: none;
          background: #fff;
        }

        .table-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
        }

        .compact-btn,
        .btn-refresh,
        .btn-dark,
        .btn-secondary,
        .btn-edit,
        .btn-delete,
        .bottom-buttons button,
        .bottom-packing button {
          height: 38px;
          border-radius: 8px;
          padding: 0 14px;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
        }

        .bottom-buttons button:first-child {
          background: #111827;
          color: #fff;
        }

        .btn-secondary {
          background: #d1d5db;
          color: #111827;
        }

        .btn-dark {
          background: #0f172a;
          color: white;
        }

        .btn-edit {
          background: #2563eb;
          color: #fff;
        }

        .btn-delete {
          background: #dc2626;
          color: #fff;
        }

        .btn-refresh {
          background: #6b7280;
          color: white;
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

        .table-scroll {
          overflow: auto;
          max-height: 520px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1050px;
        }

        .order-table {
          min-width: 980px;
        }

        .report-table {
          min-width: 900px;
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

        .th-sn {
          width: 46px;
          min-width: 46px;
        }

        .th-brand {
          width: 90px;
          min-width: 90px;
        }

        .th-item {
          width: 240px;
          min-width: 240px;
        }

        .th-total {
          width: 92px;
          min-width: 92px;
        }

        .th-actions {
          width: 130px;
          min-width: 130px;
        }

        .packing-top-cell,
        .packing-name-cell {
          text-align: center !important;
          min-width: 72px;
        }

        .item-cell {
          text-align: left !important;
        }

        .qty-cell {
          min-width: 72px;
        }

        .compact-select {
          width: 100%;
          height: 34px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0 8px;
          font-size: 12px;
          background: #fff;
        }

        .compact-qty-input {
          width: 58px;
          height: 34px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0 6px;
          font-size: 12px;
          text-align: center;
          background: #fff;
        }

        .editing-row {
          background: #f8fafc;
        }

        .footer-label {
          text-align: left !important;
          padding-left: 12px !important;
        }

        .data-table tfoot th {
          background: #e2e8f0;
        }

        .data-table tbody tr:hover {
          background: #f8fafc;
        }

        .empty-cell,
        .empty-state {
          text-align: center;
          padding: 24px;
          color: #64748b;
          font-weight: 600;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .summary-box {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 14px 16px;
          background: #f8fafc;
        }

        .summary-label {
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          margin-bottom: 8px;
        }

        .summary-value {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
        }

        .summary-note {
          margin-top: 12px;
          font-size: 13px;
          color: #64748b;
        }

        .bottom-bar {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 16px;
          align-items: end;
        }

        .bottom-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }

        .bottom-packing {
          display: grid;
          grid-template-columns: 170px 1fr 110px 120px;
          gap: 10px;
          align-items: end;
        }

        .bottom-packing-title {
          height: 44px;
          display: flex;
          align-items: center;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          white-space: nowrap;
        }

        @media (max-width: 1100px) {
          .bottom-bar {
            grid-template-columns: 1fr;
          }

          .bottom-packing {
            grid-template-columns: 1fr 1fr 120px 120px;
          }

          .summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 960px) {
          .three-cols,
          .toolbar-two,
          .bottom-packing,
          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}