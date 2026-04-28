import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

const emptyHeader = {
  id: null,
  customer_id: "",
  customer_brand_id: "",
  item_id: "",
  sub_brand: "",
  tbn: "",
  note: "",
  density: "",
  revision: 1,
  formula_date: new Date().toISOString().slice(0, 10),
  formula_code_generated: "",
};

const emptyLine = {
  id: null,
  rm_id: "",
  wt_pct: "",
};

function toNumber(value) {
  if (value === "" || value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

function toTextId(value) {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function round3(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 1000) / 1000;
}

function getErrorMessage(err) {
  if (!err) return "Failed to save formula.";
  if (typeof err === "string") return err;
  return (
    err.message ||
    err.error_description ||
    err.details ||
    err.hint ||
    JSON.stringify(err)
  );
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function cleanCodePart(value) {
  return String(value || "")
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/\//g, "-");
}

function extractItemCodePart(itemName) {
  const text = String(itemName || "").toUpperCase().trim();

  const saeMatch = text.match(/SAE\s*(.+?)(?:\s+API\b|$)/i);
  if (saeMatch && saeMatch[1]) return cleanCodePart(saeMatch[1]);

  if (/\b2T\b/i.test(text)) return "2T";

  const atfMatch = text.match(/\bATF\s*(.+?)(?:\s+API\b|$)/i);
  if (atfMatch && atfMatch[1]) return cleanCodePart(atfMatch[1]);

  const hMatch = text.match(/\bH\s*([0-9]+(?:[-/][0-9]+)?)\b/i);
  if (hMatch && hMatch[1]) return cleanCodePart(hMatch[1]);

  return "00";
}

function parseFormulaSequence(code) {
  const text = String(code || "").trim().toUpperCase();
  const match = text.match(/^FORM-(\d{4})-/);
  if (!match) return 0;
  return Number(match[1] || 0);
}

function buildFormulaCode(nextSeq, itemName) {
  const seq = String(nextSeq).padStart(4, "0");
  const suffix = extractItemCodePart(itemName);
  return `FORM-${seq}-${suffix}`;
}

function normalizeForSort(value) {
  return String(value || "").trim().toLowerCase();
}

function getRmMarketPrice(rm) {
  if (!rm || typeof rm !== "object") return 0;
  return toNumber(rm.market_price);
}

function calcLineCostFromValues(marketPrice, wtPct) {
  return round3(toNumber(marketPrice) * (toNumber(wtPct) / 100));
}

function calcCostPerMTFromLines(lines, rmMap) {
  return round3(
    (lines || []).reduce((sum, line) => {
      const rm = rmMap[String(line.rm_id)] || {};
      const marketPrice = getRmMarketPrice(rm);
      const wtPct = toNumber(line.wt_pct);
      return sum + calcLineCostFromValues(marketPrice, wtPct);
    }, 0)
  );
}

function calcLiterCostFromMTDensity(costPerMT, density) {
  return round3((toNumber(costPerMT) / 1000) * toNumber(density));
}

function calcTonCost(row) {
  return round3(toNumber(row.cost_per_kg));
}

function calcLiterCost(row) {
  const storedCostPerLiter = toNumber(row.cost_per_lit);
  if (storedCostPerLiter > 0) return round3(storedCostPerLiter);

  const costPerMT = toNumber(row.cost_per_kg);
  const density = toNumber(row.density);
  return calcLiterCostFromMTDensity(costPerMT, density);
}

export default function FormulaPage() {
  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [items, setItems] = useState([]);
  const [customerItems, setCustomerItems] = useState([]);
  const [rmRows, setRmRows] = useState([]);

  const [rows, setRows] = useState([]);
  const [formulaLines, setFormulaLines] = useState([{ ...emptyLine }]);
  const [form, setForm] = useState({ ...emptyHeader });

  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("view");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [customerFilter, setCustomerFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [itemFilter, setItemFilter] = useState("all");

  const [tableCodeFilter, setTableCodeFilter] = useState("all");
  const [tableBrandFilter, setTableBrandFilter] = useState("all");
  const [tableCustomerSymbolFilter, setTableCustomerSymbolFilter] =
    useState("all");

  const [sortField, setSortField] = useState("formula_code_generated");
  const [sortDirection, setSortDirection] = useState("asc");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [
        customersRes,
        brandsRes,
        itemsRes,
        customerItemsRes,
        rmRes,
        headersRes,
        linesRes,
      ] = await Promise.all([
        supabase
          .from("customers")
          .select("*")
          .order("customer_code", { ascending: true }),
        supabase
          .from("brand_customer")
          .select("*")
          .order("customer_brand", { ascending: true }),
        supabase
          .from("item_master")
          .select("*")
          .order("item_name", { ascending: true }),
        supabase
          .from("customer_items")
          .select("*")
          .order("id", { ascending: true }),
        supabase
          .from("rm")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("id", { ascending: true }),
        supabase
          .from("formula_headers")
          .select("*")
          .order("id", { ascending: false }),
        supabase
          .from("formula_lines")
          .select("*")
          .order("sort_order", { ascending: true })
          .order("id", { ascending: true }),
      ]);

      if (customersRes.error) throw customersRes.error;
      if (brandsRes.error) throw brandsRes.error;
      if (itemsRes.error) throw itemsRes.error;
      if (customerItemsRes.error) throw customerItemsRes.error;
      if (rmRes.error) throw rmRes.error;
      if (headersRes.error) throw headersRes.error;
      if (linesRes.error) throw linesRes.error;

      const linesData = linesRes.data || [];

      const merged = (headersRes.data || []).map((header) => ({
        ...header,
        formula_lines: linesData.filter(
          (line) => String(line.formula_id) === String(header.id)
        ),
      }));

      setCustomers(customersRes.data || []);
      setBrands(brandsRes.data || []);
      setItems(itemsRes.data || []);
      setCustomerItems(customerItemsRes.data || []);
      setRmRows(rmRes.data || []);
      setRows(merged);
    } catch (err) {
      console.error("Formula loadData error:", err);
      setError(getErrorMessage(err));
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

  const brandMap = useMemo(() => {
    const map = {};
    brands.forEach((row) => {
      map[String(row.id)] = row;
    });
    return map;
  }, [brands]);

  const itemMap = useMemo(() => {
    const map = {};
    items.forEach((row) => {
      map[String(row.id)] = row;
    });
    return map;
  }, [items]);

  const rmMap = useMemo(() => {
    const map = {};
    rmRows.forEach((row) => {
      map[String(row.id)] = row;
    });
    return map;
  }, [rmRows]);

  const nextFormulaSequence = useMemo(() => {
    let maxSeq = 0;
    rows.forEach((row) => {
      const seq = parseFormulaSequence(row.formula_code_generated);
      if (seq > maxSeq) maxSeq = seq;
    });
    return maxSeq + 1;
  }, [rows]);

  const filteredBrandsForForm = useMemo(() => {
    if (!form.customer_id) return [];
    return brands.filter(
      (row) => String(row.customer_id) === String(form.customer_id)
    );
  }, [brands, form.customer_id]);

  const filteredCustomerItemsForForm = useMemo(() => {
    if (!form.customer_id || !form.customer_brand_id) return [];

    return customerItems
      .filter(
        (row) =>
          String(row.customer_id) === String(form.customer_id) &&
          String(row.customer_brand_id) === String(form.customer_brand_id)
      )
      .map((row) => {
        const item = items.find((it) => String(it.id) === String(row.item_id));
        return {
          customer_item_id: row.id,
          item_id: row.item_id,
          sub_brand: row.sub_brand || "",
          item_name: item?.item_name || "",
          item_code: item?.item_code || "",
          label: row.sub_brand
            ? `${row.sub_brand} - ${item?.item_name || ""}`
            : `${item?.item_name || ""}`,
        };
      });
  }, [customerItems, items, form.customer_id, form.customer_brand_id]);

  const selectedCustomer = customerMap[String(form.customer_id)] || null;
  const selectedBrand = brandMap[String(form.customer_brand_id)] || null;
  const selectedItem = itemMap[String(form.item_id)] || null;

  const generatedFormulaCode = useMemo(() => {
    if (mode === "edit" && form.formula_code_generated) {
      return form.formula_code_generated;
    }
    return buildFormulaCode(nextFormulaSequence, selectedItem?.item_name || "");
  }, [mode, form.formula_code_generated, nextFormulaSequence, selectedItem]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      formula_code_generated: generatedFormulaCode,
    }));
  }, [generatedFormulaCode]);

  const currentCostPerMT = useMemo(() => {
    return calcCostPerMTFromLines(formulaLines, rmMap);
  }, [formulaLines, rmMap]);

  const currentTonCost = useMemo(() => currentCostPerMT, [currentCostPerMT]);

  const currentLiterCost = useMemo(() => {
    return calcLiterCostFromMTDensity(currentCostPerMT, form.density);
  }, [currentCostPerMT, form.density]);

  function getCustomerLabel(customer) {
    if (!customer) return "";
    return `${customer.customer_code || ""} - ${
      customer.customer_symbol || ""
    } - ${customer.customer_name || ""}`.trim();
  }

  function getBrandLabel(brand) {
    if (!brand) return "";
    return brand.customer_brand || "";
  }

  function getRmLabel(rm) {
    if (!rm) return "";
    return rm.rm_name || rm.rm_code || "";
  }

  function getItemDisplay() {
    if (!selectedItem) return "-";
    return form.sub_brand
      ? `${form.sub_brand} - ${selectedItem.item_name || ""}`
      : `${selectedItem.item_name || "-"}`;
  }

  function clearForm() {
    setForm({
      ...emptyHeader,
      formula_date: todayISO(),
    });
    setFormulaLines([{ ...emptyLine }]);
    setSelectedId(null);
    setMode("view");
    setMessage("");
    setError("");
  }

  function handleAddFormula() {
    setForm({
      ...emptyHeader,
      formula_date: todayISO(),
    });
    setFormulaLines([{ ...emptyLine }]);
    setSelectedId(null);
    setMode("add");
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleUseFormula(row) {
    const sourceLines = row?.formula_lines || [];

    setForm({
      ...emptyHeader,
      tbn: row?.tbn ?? "",
      note: row?.note ?? "",
      density: row?.density ?? "",
      formula_date: todayISO(),
    });

    setFormulaLines(
      sourceLines.length > 0
        ? sourceLines.map((line) => ({
            ...emptyLine,
            rm_id: line.rm_id || "",
            wt_pct: line.wt_pct ?? line.qty_kg ?? "",
          }))
        : [{ ...emptyLine }]
    );

    setSelectedId(null);
    setMode("add");
    setError("");
    setMessage(
      "Formula copied. Now choose new Customer, Customer Brand, Item, and Density."
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function getNextRevision(customerId, customerBrandId, itemId, subBrand) {
    let query = supabase
      .from("formula_headers")
      .select("revision")
      .eq("customer_id", String(customerId))
      .eq("customer_brand_id", String(customerBrandId))
      .eq("item_id", String(itemId));

    if (subBrand) query = query.eq("sub_brand", subBrand);

    const { data, error } = await query
      .order("revision", { ascending: false })
      .limit(1);

    if (error) throw error;

    const lastRevision =
      data && data.length > 0 ? Number(data[0].revision || 0) : 0;
    return lastRevision + 1;
  }

  function handleHeaderChange(name, value) {
    if (name === "customer_id") {
      setForm((prev) => ({
        ...prev,
        customer_id: value,
        customer_brand_id: "",
        item_id: "",
        sub_brand: "",
        density: "",
        formula_code_generated: "",
      }));
      return;
    }

    if (name === "customer_brand_id") {
      setForm((prev) => ({
        ...prev,
        customer_brand_id: value,
        item_id: "",
        sub_brand: "",
        density: "",
        formula_code_generated: "",
      }));
      return;
    }

    if (name === "customer_item_key") {
      const selected = filteredCustomerItemsForForm.find(
        (row) => `${row.item_id}|||${row.sub_brand || ""}` === value
      );

      setForm((prev) => ({
        ...prev,
        item_id: selected?.item_id || "",
        sub_brand: selected?.sub_brand || "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function addLine() {
    setFormulaLines((prev) => [...prev, { ...emptyLine }]);
  }

  function deleteLine(index) {
    setFormulaLines((prev) => {
      if (prev.length === 1) return [{ ...emptyLine }];
      return prev.filter((_, i) => i !== index);
    });
  }

  function updateLine(index, field, value) {
    setFormulaLines((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [field]: value,
      };
      return next;
    });
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function renderSortArrow(field) {
    if (sortField !== field) return "↕";
    return sortDirection === "asc" ? "▲" : "▼";
  }

  const totalWtPct = useMemo(() => {
    return round3(
      formulaLines.reduce((sum, line) => sum + toNumber(line.wt_pct), 0)
    );
  }, [formulaLines]);

  const isWtPctValid = Math.abs(totalWtPct - 100) < 0.0005;

  async function handleSave() {
    if (!form.customer_id) return setError("Please select Customer.");
    if (!form.customer_brand_id) return setError("Please select Customer Brand.");
    if (!form.item_id) return setError("Please select Item.");
    if (!form.density) return setError("Please enter Density.");
    if (!form.formula_date) return setError("Please select Formula Date.");

    const validLines = formulaLines.filter(
      (line) => line.rm_id && String(line.wt_pct).trim() !== ""
    );

    if (validLines.length === 0) {
      return setError("Please add at least one RM line.");
    }

    if (!isWtPctValid) {
      return setError(
        `Total Wt% must be exactly 100. Current total is ${totalWtPct.toFixed(
          3
        )}%.`
      );
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      let revisionToUse = 1;

      if (mode === "edit" && form.id) {
        revisionToUse = Number(form.revision || 1);
      } else {
        revisionToUse = await getNextRevision(
          form.customer_id,
          form.customer_brand_id,
          form.item_id,
          form.sub_brand
        );
      }

      const calculatedCostPerMT = calcCostPerMTFromLines(validLines, rmMap);
      const calculatedLiterCost = calcLiterCostFromMTDensity(
        calculatedCostPerMT,
        form.density
      );

      const headerPayload = {
        customer_id: toTextId(form.customer_id),
        customer_code: selectedCustomer?.customer_code || null,
        customer_symbol: selectedCustomer?.customer_symbol || null,
        customer_name: selectedCustomer?.customer_name || null,

        customer_brand_id: toTextId(form.customer_brand_id),
        brand_symbol: selectedBrand?.brand_symbol || null,
        customer_brand: selectedBrand?.customer_brand || null,

        formula_code_generated: form.formula_code_generated || null,

        item_id: toTextId(form.item_id),
        item_code: selectedItem?.item_code || null,
        item_name: selectedItem?.item_name || null,
        sub_brand: form.sub_brand || null,

        tbn: form.tbn === "" ? null : Number(form.tbn),
        note: form.note || null,
        density: form.density === "" ? null : Number(form.density),
        revision: revisionToUse,
        version_date: form.formula_date,

        loss_pct: 0,
        rm_loss_pct: 0,
        fix_margin: 0,

        total_qty: totalWtPct,
        total_effective_qty: totalWtPct,
        raw_cost: calculatedCostPerMT,
        total_cost_with_loss: calculatedCostPerMT,
        sell_total: calculatedCostPerMT,
        cost_per_kg: calculatedCostPerMT,
        cost_per_lit: calculatedLiterCost,
        sell_per_kg: calculatedCostPerMT,
        sell_per_lit: calculatedLiterCost,
      };

      let formulaId = form.id;

      if (mode === "edit" && formulaId) {
        const { error: updateError } = await supabase
          .from("formula_headers")
          .update(headerPayload)
          .eq("id", formulaId);

        if (updateError) throw updateError;

        const { error: deleteLinesError } = await supabase
          .from("formula_lines")
          .delete()
          .eq("formula_id", formulaId);

        if (deleteLinesError) throw deleteLinesError;
      } else {
        const { data: insertedHeader, error: insertError } = await supabase
          .from("formula_headers")
          .insert([headerPayload])
          .select()
          .single();

        if (insertError) throw insertError;

        formulaId = insertedHeader.id;
      }

      const linePayload = validLines.map((line, index) => {
        const rm = rmMap[String(line.rm_id)] || {};
        const wtPctValue = toNumber(line.wt_pct);
        const marketPrice = getRmMarketPrice(rm);
        const lineCost = calcLineCostFromValues(marketPrice, wtPctValue);

        return {
          formula_id: formulaId,
          rm_id: toTextId(line.rm_id),
          rm_code: rm.rm_code || null,
          rm_name: rm.rm_name || null,
          unit: "Wt%",
          wt_pct: wtPctValue,
          qty_kg: wtPctValue,
          rm_price: marketPrice,
          effective_qty_kg: wtPctValue,
          line_cost: lineCost,
          sort_order: index + 1,
        };
      });

      const { error: insertLinesError } = await supabase
        .from("formula_lines")
        .insert(linePayload);

      if (insertLinesError) throw insertLinesError;

      setMessage(
        mode === "edit"
          ? "Formula updated successfully."
          : "Formula added successfully."
      );
      clearForm();
      await loadData();
    } catch (err) {
      console.error("Formula save error:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(row) {
    setSelectedId(row.id);
    setMode("edit");
    setMessage("");
    setError("");

    setForm({
      id: row.id,
      customer_id: row.customer_id || "",
      customer_brand_id: row.customer_brand_id || "",
      item_id: row.item_id || "",
      sub_brand: row.sub_brand || "",
      tbn: row.tbn ?? "",
      note: row.note || "",
      density: row.density ?? "",
      revision: row.revision || 1,
      formula_date: row.version_date || todayISO(),
      formula_code_generated: row.formula_code_generated || "",
    });

    setFormulaLines(
      row.formula_lines && row.formula_lines.length > 0
        ? row.formula_lines.map((line) => ({
            id: line.id,
            rm_id: line.rm_id || "",
            wt_pct: line.wt_pct ?? line.qty_kg ?? "",
          }))
        : [{ ...emptyLine }]
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(row) {
    const ok = window.confirm(
      `Delete Formula?\n\n${row.customer_brand || ""} | ${row.item_name || ""}`
    );
    if (!ok) return;

    try {
      setError("");
      setMessage("");

      const { error: deleteError } = await supabase
        .from("formula_headers")
        .delete()
        .eq("id", row.id);

      if (deleteError) throw deleteError;

      if (selectedId === row.id) clearForm();

      setMessage("Formula deleted successfully.");
      await loadData();
    } catch (err) {
      console.error("Formula delete error:", err);
      setError(getErrorMessage(err));
    }
  }

  const filteredRows = useMemo(() => {
    let result = [...rows];

    if (customerFilter !== "all") {
      result = result.filter(
        (row) => String(row.customer_id) === String(customerFilter)
      );
    }

    if (brandFilter !== "all") {
      result = result.filter(
        (row) => String(row.customer_brand_id) === String(brandFilter)
      );
    }

    if (itemFilter !== "all") {
      result = result.filter(
        (row) => String(row.item_id) === String(itemFilter)
      );
    }

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((row) => {
        return (
          String(row.customer_code || "").toLowerCase().includes(q) ||
          String(row.customer_symbol || "").toLowerCase().includes(q) ||
          String(row.customer_name || "").toLowerCase().includes(q) ||
          String(row.customer_brand || "").toLowerCase().includes(q) ||
          String(row.formula_code_generated || "").toLowerCase().includes(q) ||
          String(row.item_code || "").toLowerCase().includes(q) ||
          String(row.item_name || "").toLowerCase().includes(q) ||
          String(row.sub_brand || "").toLowerCase().includes(q) ||
          String(row.note || "").toLowerCase().includes(q)
        );
      });
    }

    if (tableCodeFilter !== "all") {
      result = result.filter(
        (row) =>
          String(row.formula_code_generated || "") === String(tableCodeFilter)
      );
    }

    if (tableBrandFilter !== "all") {
      result = result.filter(
        (row) => String(row.customer_brand || "") === String(tableBrandFilter)
      );
    }

    if (tableCustomerSymbolFilter !== "all") {
      result = result.filter(
        (row) =>
          String(row.customer_symbol || "") ===
          String(tableCustomerSymbolFilter)
      );
    }

    const direction = sortDirection === "asc" ? 1 : -1;

    result.sort((a, b) => {
      let aValue = "";
      let bValue = "";

      if (sortField === "formula_code_generated") {
        aValue = normalizeForSort(a.formula_code_generated);
        bValue = normalizeForSort(b.formula_code_generated);
      } else if (sortField === "customer_symbol") {
        aValue = normalizeForSort(a.customer_symbol);
        bValue = normalizeForSort(b.customer_symbol);
      } else if (sortField === "customer_brand") {
        aValue = normalizeForSort(a.customer_brand);
        bValue = normalizeForSort(b.customer_brand);
      } else if (sortField === "item_display") {
        aValue = normalizeForSort(
          `${a.sub_brand ? `${a.sub_brand} - ` : ""}${a.item_name || ""}`
        );
        bValue = normalizeForSort(
          `${b.sub_brand ? `${b.sub_brand} - ` : ""}${b.item_name || ""}`
        );
      } else if (sortField === "ton_cost") {
        aValue = calcTonCost(a);
        bValue = calcTonCost(b);
      } else if (sortField === "liter_cost") {
        aValue = calcLiterCost(a);
        bValue = calcLiterCost(b);
      }

      if (aValue < bValue) return -1 * direction;
      if (aValue > bValue) return 1 * direction;
      return 0;
    });

    return result;
  }, [
    rows,
    search,
    customerFilter,
    brandFilter,
    itemFilter,
    tableCodeFilter,
    tableBrandFilter,
    tableCustomerSymbolFilter,
    sortField,
    sortDirection,
  ]);

  const tableCodeOptions = useMemo(() => {
    return [
      ...new Set(rows.map((row) => row.formula_code_generated).filter(Boolean)),
    ].sort();
  }, [rows]);

  const tableBrandOptions = useMemo(() => {
    return [...new Set(rows.map((row) => row.customer_brand).filter(Boolean))].sort();
  }, [rows]);

  const tableCustomerSymbolOptions = useMemo(() => {
    return [
      ...new Set(rows.map((row) => row.customer_symbol).filter(Boolean)),
    ].sort();
  }, [rows]);

  const selectedCustomerItemKey = `${form.item_id || ""}|||${
    form.sub_brand || ""
  }`;

  return (
    <div className="page-shell">
      <div className="page-title-wrap">
        <h1>Formula</h1>
        <p>Create and manage formula by Customer / Customer Brand / Item</p>
      </div>

      <div className="page-card compact-top-card">
        <div className="form-grid formula-top-grid compact-grid">
          <div className="form-group">
            <label>Customer</label>
            <select
              value={form.customer_id}
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
            <label>Customer Brand</label>
            <select
              value={form.customer_brand_id}
              onChange={(e) =>
                handleHeaderChange("customer_brand_id", e.target.value)
              }
              disabled={!form.customer_id}
            >
              <option value="">
                {!form.customer_id
                  ? "Select Customer first"
                  : filteredBrandsForForm.length === 0
                  ? "No Customer Brand found"
                  : "Select Customer Brand"}
              </option>
              {filteredBrandsForForm.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {getBrandLabel(brand)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Item</label>
            <select
              value={selectedCustomerItemKey}
              onChange={(e) =>
                handleHeaderChange("customer_item_key", e.target.value)
              }
              disabled={!form.customer_brand_id}
            >
              <option value="">
                {!form.customer_brand_id
                  ? "Select Customer Brand first"
                  : filteredCustomerItemsForForm.length === 0
                  ? "No Item found for this Customer Brand"
                  : "Select Item"}
              </option>
              {filteredCustomerItemsForForm.map((item) => (
                <option
                  key={`${item.item_id}-${item.sub_brand || ""}-${
                    item.customer_item_id
                  }`}
                  value={`${item.item_id}|||${item.sub_brand || ""}`}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Density</label>
            <input
              type="number"
              step="any"
              value={form.density}
              onChange={(e) => handleHeaderChange("density", e.target.value)}
              placeholder="Manual"
            />
          </div>

          <div className="form-group">
            <label>Formula Code</label>
            <input
              type="text"
              value={form.formula_code_generated || ""}
              readOnly
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label>TBN</label>
            <input
              type="number"
              step="any"
              value={form.tbn}
              onChange={(e) => handleHeaderChange("tbn", e.target.value)}
              placeholder="Manual"
            />
          </div>

          <div className="form-group note-field">
            <label>Note</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => handleHeaderChange("note", e.target.value)}
              placeholder="Write notes for this formula"
            />
          </div>

          <div className="form-group">
            <label>Formula Date</label>
            <input
              type="date"
              value={form.formula_date}
              onChange={(e) =>
                handleHeaderChange("formula_date", e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {message ? <div className="alert success">{message}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}

      <div className="table-card formula-details-card">
        <div className="section-head">
          <h2>Formula Details</h2>
        </div>

        <div className="formula-details-wrap">
          <table className="details-table">
            <tbody>
              <tr>
                <td className="details-label">Customer Brand</td>
                <td className="details-value">
                  {selectedBrand?.customer_brand || "-"}
                </td>
              </tr>
              <tr>
                <td className="details-label">Formula Code</td>
                <td className="details-value">
                  {form.formula_code_generated || "-"}
                </td>
              </tr>
              <tr>
                <td className="details-label">Item</td>
                <td className="details-value">{getItemDisplay()}</td>
              </tr>
              <tr>
                <td className="details-label">Customer</td>
                <td className="details-value">
                  {selectedCustomer?.customer_symbol || "-"}
                </td>
              </tr>
              <tr>
                <td className="details-label">TBN</td>
                <td className="details-value">
                  {form.tbn === "" ? "-" : form.tbn}
                </td>
              </tr>
              <tr>
                <td className="details-label">Note</td>
                <td className="details-value">{form.note || "-"}</td>
              </tr>
              <tr>
                <td className="details-label">Density</td>
                <td className="details-value">
                  {form.density === "" ? "-" : form.density}
                </td>
              </tr>
              <tr>
                <td className="details-label">Cost / MT</td>
                <td className="details-value">{currentCostPerMT.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="details-label">Ton Cost</td>
                <td className="details-value">{currentTonCost.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="details-label">Liter Cost</td>
                <td className="details-value">{currentLiterCost.toFixed(3)}</td>
              </tr>
              <tr>
                <td className="details-label">Formula Date</td>
                <td className="details-value">{form.formula_date || "-"}</td>
              </tr>
            </tbody>
          </table>

          <div className="formula-lines-scroll">
            <table className="data-table formula-lines-table">
              <thead>
                <tr>
                  <th style={{ width: "40%" }}>RM</th>
                  <th style={{ width: "12%" }}>Market Price</th>
                  <th style={{ width: "12%" }}>Wt%</th>
                  <th style={{ width: "16%" }}>RM Cost</th>
                  <th style={{ width: "10%" }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {formulaLines.map((line, index) => {
                  const rm = rmMap[String(line.rm_id)] || {};
                  const marketPrice = getRmMarketPrice(rm);
                  const lineCost = calcLineCostFromValues(
                    marketPrice,
                    line.wt_pct
                  );

                  return (
                    <tr key={index}>
                      <td>
                        <select
                          value={line.rm_id}
                          onChange={(e) =>
                            updateLine(index, "rm_id", e.target.value)
                          }
                        >
                          <option value="">Select RM</option>
                          {rmRows.map((rmRow) => (
                            <option key={rmRow.id} value={rmRow.id}>
                              {getRmLabel(rmRow)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{marketPrice.toFixed(3)}</td>
                      <td>
                        <input
                          type="number"
                          step="0.001"
                          value={line.wt_pct}
                          onChange={(e) =>
                            updateLine(index, "wt_pct", e.target.value)
                          }
                          placeholder="0.000"
                        />
                      </td>
                      <td>{lineCost.toFixed(3)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-delete small-btn"
                          onClick={() => deleteLine(index)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}

                <tr className={isWtPctValid ? "total-row ok" : "total-row bad"}>
                  <td>
                    <strong>Total</strong>
                  </td>
                  <td></td>
                  <td>
                    <strong>{totalWtPct.toFixed(3)}%</strong>
                  </td>
                  <td>
                    <strong>{currentCostPerMT.toFixed(3)}</strong>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {!isWtPctValid ? (
            <div className="wt-warning">
              Total Wt% must be exactly 100.000%. Please adjust the entries.
            </div>
          ) : null}

          <div className="bottom-action-row">
            <button type="button" className="btn-add-row" onClick={addLine}>
              + Add RM Row
            </button>
            <button
              type="button"
              className="primary-action"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
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
              className="primary-action"
              onClick={handleAddFormula}
              disabled={saving}
            >
              Add Formula
            </button>
          </div>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="toolbar formula-toolbar">
          <input
            type="text"
            placeholder="Search by Customer / Customer Brand / Formula Code / Item"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          >
            <option value="all">All Customers</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.customer_code} - {customer.customer_symbol}
              </option>
            ))}
          </select>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="all">All Customer Brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.customer_brand}
              </option>
            ))}
          </select>

          <select
            value={itemFilter}
            onChange={(e) => setItemFilter(e.target.value)}
          >
            <option value="all">All Items</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.item_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-card saved-formulas-card">
        <div className="saved-formulas-filters">
          <div className="filter-box">
            <label>CODE</label>
            <select
              value={tableCodeFilter}
              onChange={(e) => setTableCodeFilter(e.target.value)}
            >
              <option value="all">All Codes</option>
              {tableCodeOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-box">
            <label>CUSTOMER BRAND</label>
            <select
              value={tableBrandFilter}
              onChange={(e) => setTableBrandFilter(e.target.value)}
            >
              <option value="all">All Customer Brands</option>
              {tableBrandOptions.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-box">
            <label>Customer Symbol</label>
            <select
              value={tableCustomerSymbolFilter}
              onChange={(e) => setTableCustomerSymbolFilter(e.target.value)}
            >
              <option value="all">All Customer Symbols</option>
              {tableCustomerSymbolOptions.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="saved-formulas-scroll roomy-saved-scroll">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <table className="data-table roomy-table compact-bottom-table">
              <thead>
                <tr>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort("formula_code_generated")}
                  >
                    <div className="th-inner">
                      <span>Formula Code</span>
                      <span className="sort-arrow">
                        {renderSortArrow("formula_code_generated")}
                      </span>
                    </div>
                  </th>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort("customer_symbol")}
                  >
                    <div className="th-inner">
                      <span>Customer Symbol</span>
                      <span className="sort-arrow">
                        {renderSortArrow("customer_symbol")}
                      </span>
                    </div>
                  </th>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort("customer_brand")}
                  >
                    <div className="th-inner">
                      <span>Customer Brand</span>
                      <span className="sort-arrow">
                        {renderSortArrow("customer_brand")}
                      </span>
                    </div>
                  </th>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort("item_display")}
                  >
                    <div className="th-inner">
                      <span>Item</span>
                      <span className="sort-arrow">
                        {renderSortArrow("item_display")}
                      </span>
                    </div>
                  </th>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort("ton_cost")}
                  >
                    <div className="th-inner">
                      <span>Ton Cost</span>
                      <span className="sort-arrow">
                        {renderSortArrow("ton_cost")}
                      </span>
                    </div>
                  </th>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort("liter_cost")}
                  >
                    <div className="th-inner">
                      <span>Liter Cost</span>
                      <span className="sort-arrow">
                        {renderSortArrow("liter_cost")}
                      </span>
                    </div>
                  </th>
                  <th>Use</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-cell">
                      No formulas found.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.formula_code_generated || "-"}</td>
                      <td>{row.customer_symbol || "-"}</td>
                      <td>{row.customer_brand || "-"}</td>
                      <td>{`${row.sub_brand ? `${row.sub_brand} - ` : ""}${
                        row.item_name || "-"
                      }`}</td>
                      <td>{calcTonCost(row).toFixed(3)}</td>
                      <td>{calcLiterCost(row).toFixed(3)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-use"
                          onClick={() => handleUseFormula(row)}
                        >
                          Use
                        </button>
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
          padding: 18px 18px 28px;
          background: #f5f7fb;
          min-height: 100vh;
        }

        .page-title-wrap {
          text-align: center;
          margin-bottom: 12px;
        }

        .page-title-wrap h1 {
          margin: 0;
          font-size: 34px;
          font-weight: 700;
          color: #334155;
        }

        .page-title-wrap p {
          margin: 8px 0 0;
          font-size: 14px;
          color: #64748b;
        }

        .page-card,
        .toolbar-card,
        .table-card {
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 8px 26px rgba(15, 23, 42, 0.08);
          border: 1px solid #e5e7eb;
          max-width: 1200px;
          margin: 0 auto 14px;
        }

        .compact-top-card,
        .toolbar-card {
          padding: 14px 16px;
        }

        .form-grid {
          display: grid;
          gap: 12px;
        }

        .formula-top-grid {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }

        .note-field {
          grid-column: span 2;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label,
        .filter-box label {
          margin-bottom: 6px;
          font-size: 13px;
          font-weight: 700;
          color: #334155;
        }

        .form-group input,
        .form-group select,
        .toolbar input,
        .toolbar select,
        .data-table input,
        .data-table select,
        .filter-box select {
          height: 42px;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 0 12px;
          font-size: 14px;
          background: #fff;
          outline: none;
          color: #1f2937;
          width: 100%;
        }

        .readonly-input {
          background: #f1f5f9 !important;
        }

        button {
          border: none;
          border-radius: 10px;
          padding: 0 22px;
          height: 42px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .primary-action,
        .btn-add-row {
          background: #1565f7;
          color: white;
        }

        .btn-secondary {
          background: #eef1f5;
          color: #475569;
          border: 1px solid #d7dce2;
        }

        .btn-use {
          background: #0f766e;
          color: #ffffff;
          height: 38px;
          padding: 0 16px;
          border-radius: 10px;
        }

        .btn-edit {
          background: #2563eb;
          color: white;
          height: 38px;
          padding: 0 16px;
          border-radius: 10px;
        }

        .btn-delete {
          background: #ef4444;
          color: white;
          height: 38px;
          padding: 0 16px;
          border-radius: 10px;
        }

        .small-btn {
          height: 36px;
          padding: 0 14px;
        }

        .alert {
          max-width: 1200px;
          margin: 0 auto 12px;
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
          white-space: pre-wrap;
          word-break: break-word;
        }

        .section-head {
          padding: 16px 16px 10px;
        }

        .section-head h2 {
          margin: 0;
          font-size: 20px;
          color: #1e3a5f;
        }

        .formula-details-wrap {
          padding: 0 16px 16px;
        }

        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14px;
        }

        .details-table td {
          border: 1px solid #e5e7eb;
          padding: 10px 12px;
          font-size: 14px;
        }

        .details-label {
          width: 220px;
          font-weight: 700;
          background: #f8fafc;
          color: #334155;
        }

        .details-value {
          background: #fff;
          color: #111827;
        }

        .formula-lines-scroll,
        .saved-formulas-scroll {
          max-height: 460px;
          overflow-y: auto;
          overflow-x: auto;
          padding: 0 0 12px;
        }

        .roomy-saved-scroll {
          max-height: 520px;
          padding: 8px 12px 18px;
        }

        .saved-formulas-filters {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          padding: 14px 14px 0;
        }

        .filter-box {
          display: flex;
          flex-direction: column;
        }

        .toolbar {
          display: grid;
          gap: 12px;
        }

        .formula-toolbar {
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1180px;
          background: #fff;
        }

        .data-table thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          background: #f1f5f9;
          color: #1e3a5f;
          text-align: left;
          padding: 14px 16px;
          font-size: 13px;
          border-bottom: 1px solid #dbe3ee;
          white-space: nowrap;
        }

        .data-table tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid #edf2f7;
          font-size: 14px;
          color: #1f2937;
          white-space: nowrap;
        }

        .compact-bottom-table {
          min-width: 1080px;
        }

        .sortable-th {
          cursor: pointer;
          user-select: none;
        }

        .th-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          width: 100%;
        }

        .sort-arrow {
          font-size: 12px;
          color: #375a8c;
          min-width: 16px;
          text-align: right;
          font-weight: 700;
        }

        .total-row.ok td {
          background: #ecfdf5;
          color: #065f46;
        }

        .total-row.bad td {
          background: #fef2f2;
          color: #991b1b;
        }

        .wt-warning {
          margin-top: 12px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          font-size: 14px;
          font-weight: 700;
        }

        .bottom-action-row {
          display: flex;
          gap: 10px;
          justify-content: flex-start;
          align-items: center;
          flex-wrap: wrap;
          padding-top: 6px;
        }

        .loading,
        .empty-cell {
          text-align: center;
          padding: 24px;
          color: #64748b;
        }

        @media (max-width: 1400px) {
          .formula-top-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .note-field {
            grid-column: span 2;
          }
        }

        @media (max-width: 1100px) {
          .formula-toolbar,
          .saved-formulas-filters {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 700px) {
          .formula-top-grid,
          .formula-toolbar,
          .saved-formulas-filters {
            grid-template-columns: 1fr;
          }

          .note-field {
            grid-column: span 1;
          }

          .bottom-action-row {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}