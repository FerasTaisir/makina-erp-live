import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import MakinaLogo from "./assets/Makian_Logo_3_Red.jpg";

const emptyForm = {
  order_id: "",
  currency: "",
  price_as: "",
  payment: "",
  shipping: "",
  port_of_loading: "",
  order_cancelation: "",
  delivery: "",
  packaging: "",
  brand: "",
  manufacturer: "",
  country_of_origin: "",
  others: "",
  hs_code: "",
  bank_details: "",
  extra_profit_pct: "",
  freight_charges: "",
  discount_percent: "",
  offer_type: "",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(value) {
  if (!value) return "";
  const parts = String(value).split("-");
  if (parts.length !== 3) return value;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function money(value) {
  return num(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parsePackingLiters(packingText) {
  const text = String(packingText || "").trim();
  const match = text.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);
  if (!match) return 0;
  return Number(match[1]) * Number(match[2]);
}

function getNextOfferRef(existingRefs) {
  let maxNumber = 0;

  (existingRefs || []).forEach((row) => {
    const code = String(row?.offer_ref || "");
    const match = code.match(/PO-(\d+)/i);

    if (match) {
      const n = Number(match[1]);
      if (!Number.isNaN(n) && n > maxNumber) maxNumber = n;
    }
  });

  return `PO-${String(maxNumber + 1).padStart(6, "0")}`;
}

function getDefinitionRows(rows, category) {
  return (rows || [])
    .filter((row) => row.category === category)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}


function getPackingUnit(line, packingRow) {
  const direct =
    packingRow?.unit ||
    packingRow?.packing_unit ||
    packingRow?.pack_unit ||
    packingRow?.pm_unit ||
    packingRow?.package_type ||
    line?.unit ||
    "";

  if (direct) return String(direct).trim();

  const packingText = String(line?.packing || packingRow?.packing || "").toLowerCase();

  if (packingText.includes("drum") || packingText.includes("200")) return "Drum";
  if (packingText.includes("jerry") || packingText.includes("25")) return "Jerrycan";
  return "Carton";
}

function getFirstDefinitionValue(rows, category) {
  return getDefinitionRows(rows, category)[0]?.value || "";
}

function numberToWordsBelow1000(n) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  let words = "";

  if (n >= 100) {
    words += ones[Math.floor(n / 100)] + " Hundred";
    n = n % 100;
    if (n) words += " ";
  }

  if (n >= 20) {
    words += tens[Math.floor(n / 10)];
    n = n % 10;
    if (n) words += " " + ones[n];
  } else if (n > 0) {
    words += ones[n];
  }

  return words;
}

function numberToWords(number) {
  const n = Math.floor(num(number));

  if (n === 0) return "Zero";

  const parts = [];
  const billions = Math.floor(n / 1000000000);
  const millions = Math.floor((n % 1000000000) / 1000000);
  const thousands = Math.floor((n % 1000000) / 1000);
  const rest = n % 1000;

  if (billions) parts.push(`${numberToWordsBelow1000(billions)} Billion`);
  if (millions) parts.push(`${numberToWordsBelow1000(millions)} Million`);
  if (thousands) parts.push(`${numberToWordsBelow1000(thousands)} Thousand`);
  if (rest) parts.push(numberToWordsBelow1000(rest));

  return parts.join(" ");
}


function parseExchangeRateValue(rawValue, selectedCurrency) {
  const text = String(rawValue || "").trim();
  const currency = String(selectedCurrency || "").trim().toUpperCase();

  if (!text || !currency) return null;

  const upper = text.toUpperCase();

  if (!upper.includes(currency)) return null;

  const numberMatch = text.match(/(\d+(?:\.\d+)?)/);
  if (!numberMatch) return null;

  const rate = Number(numberMatch[1]);
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

function getCurrencySymbol(currency) {
  const c = String(currency || "USD").trim().toUpperCase();

  if (c === "USD") return "$";
  if (c === "AED") return "AED ";
  if (c === "EUR") return "EUR ";
  if (c === "GBP") return "GBP ";

  return `${c} `;
}

function amountInWords(amount, currency) {
  const value = num(amount);
  const whole = Math.floor(value);
  const cents = Math.round((value - whole) * 100);

  return `${currency || "USD"} ${numberToWords(whole)} and ${String(cents).padStart(
    2,
    "0"
  )}/100 Only`;
}

export default function PriceOfferPage() {
  const [orders, setOrders] = useState([]);
  const [orderLines, setOrderLines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [invoiceDefinitions, setInvoiceDefinitions] = useState([]);
  const [formulaRows, setFormulaRows] = useState([]);
  const [packingBrandRows, setPackingBrandRows] = useState([]);
  const [invoiceRefs, setInvoiceRefs] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [invoiceRef, setInvoiceRef] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(todayISO());

  const [loading, setLoading] = useState(true);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [
        ordersRes,
        linesRes,
        customersRes,
        brandsRes,
        definitionsRes,
        formulasRes,
        packingRes,
        refsRes,
      ] = await Promise.all([
        supabase.from("pdo_headers").select("*").order("id", { ascending: false }),
        supabase.from("pdo_lines").select("*").order("line_no", { ascending: true }),
        supabase.from("customers").select("*").order("customer_code", { ascending: true }),
        supabase.from("brands").select("*").order("brand_symbol", { ascending: true }),
        supabase
          .from("invoice_definitions")
          .select("*")
          .order("category", { ascending: true })
          .order("sort_order", { ascending: true }),
        supabase.from("formula_headers").select("*").order("id", { ascending: false }),
        supabase.from("packing_brand").select("*").order("id", { ascending: true }),
        supabase.from("price_offer_headers").select("offer_ref"),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (linesRes.error) throw linesRes.error;
      if (customersRes.error) throw customersRes.error;
      if (brandsRes.error) throw brandsRes.error;
      if (definitionsRes.error) throw definitionsRes.error;
      if (formulasRes.error) throw formulasRes.error;
      if (packingRes.error) throw packingRes.error;

      const refsData = refsRes?.data || [];

      setOrders(ordersRes.data || []);
      setOrderLines(linesRes.data || []);
      setCustomers(customersRes.data || []);
      setBrands(brandsRes.data || []);
      setInvoiceDefinitions(definitionsRes.data || []);
      setFormulaRows(formulasRes.data || []);
      setPackingBrandRows(packingRes.data || []);
      setInvoiceRefs(refsData);
      setInvoiceRef(getNextOfferRef(refsData));

      const selectedFromOrder = localStorage.getItem("selected_invoice_order_id");
      if (selectedFromOrder) {
        setForm((prev) => ({
          ...prev,
          order_id: selectedFromOrder,
        }));
        localStorage.removeItem("selected_invoice_order_id");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load invoice data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    if (!invoiceDefinitions.length) return;

    setForm((prev) => ({
      ...prev,
      offer_type: prev.offer_type || getFirstDefinitionValue(invoiceDefinitions, "offer_type") || getFirstDefinitionValue(invoiceDefinitions, "invoice_title") || "Price Offer",
      currency: prev.currency || getFirstDefinitionValue(invoiceDefinitions, "currency"),
      price_as: prev.price_as || getFirstDefinitionValue(invoiceDefinitions, "price_as"),
      payment: prev.payment || getFirstDefinitionValue(invoiceDefinitions, "payment"),
      shipping: prev.shipping || getFirstDefinitionValue(invoiceDefinitions, "shipping"),
      port_of_loading:
        prev.port_of_loading ||
        getFirstDefinitionValue(invoiceDefinitions, "port_of_loading"),
      order_cancelation:
        prev.order_cancelation ||
        getFirstDefinitionValue(invoiceDefinitions, "order_cancelation"),
      delivery:
        prev.delivery || getFirstDefinitionValue(invoiceDefinitions, "delivery"),
      packaging:
        prev.packaging || getFirstDefinitionValue(invoiceDefinitions, "packing"),
      brand: prev.brand || getFirstDefinitionValue(invoiceDefinitions, "brand"),
      manufacturer:
        prev.manufacturer ||
        getFirstDefinitionValue(invoiceDefinitions, "manufacturer"),
      country_of_origin:
        prev.country_of_origin ||
        getFirstDefinitionValue(invoiceDefinitions, "country_of_origin"),
      others:
        prev.others || getFirstDefinitionValue(invoiceDefinitions, "others"),
      hs_code:
        prev.hs_code || getFirstDefinitionValue(invoiceDefinitions, "hs_code"),
      bank_details:
        prev.bank_details ||
        getFirstDefinitionValue(invoiceDefinitions, "bank_details"),
    }));
  }, [invoiceDefinitions]);

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
      const symbol = String(row.brand_symbol || row.symbol || "").trim();
      if (!symbol) return;
      map[symbol] =
        row.brand_name ||
        row.name ||
        row.brand ||
        row.brand_symbol ||
        symbol;
    });
    return map;
  }, [brands]);

  const packingMap = useMemo(() => {
    const map = {};
    packingBrandRows.forEach((row) => {
      map[String(row.id)] = row;
    });
    return map;
  }, [packingBrandRows]);

  const selectedOrder = useMemo(() => {
    return (
      orders.find((row) => String(row.id) === String(form.order_id)) || null
    );
  }, [orders, form.order_id]);

  const selectedCustomer = selectedOrder
    ? customerMap[String(selectedOrder.customer_id)] || null
    : null;

  const selectedOrderLines = useMemo(() => {
    if (!form.order_id) return [];

    return orderLines.filter(
      (row) => String(row.pdo_header_id) === String(form.order_id)
    );
  }, [orderLines, form.order_id]);

  const fixedProfitPct = useMemo(() => {
    const value = getFirstDefinitionValue(
      invoiceDefinitions,
      "fixed_profit_pct"
    );
    return num(value);
  }, [invoiceDefinitions]);

  function findFormulaForLine(line) {
    return (
      formulaRows.find(
        (row) =>
          String(row.customer_id || "") ===
            String(selectedOrder?.customer_id || "") &&
          String(row.item_id || "") === String(line.item_id || "")
      ) || null
    );
  }

  function getBrandFullName(symbol) {
    const cleanSymbol = String(symbol || "").trim();
    if (!cleanSymbol) return "";
    return brandMap[cleanSymbol] || cleanSymbol;
  }

  const invoiceLines = useMemo(() => {
    return selectedOrderLines.map((line, index) => {
      const formula = findFormulaForLine(line);

      const packingRow =
        packingMap[String(line.packing_brand_id)] ||
        packingBrandRows.find(
          (row) =>
            String(row.packing || "") === String(line.packing || "")
        ) ||
        {};

      const litersPerPacking =
        parsePackingLiters(line.packing) ||
        parsePackingLiters(packingRow.packing);

      const literCost = num(formula?.cost_per_lit);
      const packingPrice = num(packingRow?.packing_price);
      const qty = num(line.qty);

      const baseUnitPrice =
        literCost * litersPerPacking + packingPrice;

      const totalProfitPct =
        fixedProfitPct + num(form.extra_profit_pct);

      const finalUnitPrice =
        baseUnitPrice +
        baseUnitPrice * (totalProfitPct / 100);

      const totalUsd = finalUnitPrice * qty;
      const unitType = getPackingUnit(line, packingRow);
      const brandSymbol = String(line.brand_symbol || "").trim();
      const brandName = getBrandFullName(brandSymbol);
      const itemName = String(line.item_name || "").trim();

      return {
        no: index + 1,
        brandSymbol: brandSymbol,
        item: [brandName, itemName].filter(Boolean).join(" "),
        description: "Lubricants",
        unit: unitType,
        packing: line.packing || "",
        qty,
        tax: "0%",
        taxValue: "-",
        unitPrice: finalUnitPrice,
        totalUsd,
      };
    });
  }, [
    selectedOrderLines,
    formulaRows,
    packingMap,
    packingBrandRows,
    fixedProfitPct,
    form.extra_profit_pct,
    selectedOrder,
    brandMap,
  ]);

  const autoBrandText = useMemo(() => {
    const brands = Array.from(
      new Set(
        invoiceLines
          .map((line) => getBrandFullName(line.brandSymbol))
          .filter(Boolean)
      )
    );

    return brands.join(" / ");
  }, [invoiceLines, brandMap]);

  const autoPackingText = useMemo(() => {
    const packingTypes = Array.from(
      new Set(
        invoiceLines
          .map((line) => String(line.unit || "").trim())
          .filter(Boolean)
      )
    );

    if (packingTypes.length === 0) return "";
    if (packingTypes.length === 1) return packingTypes[0];
    if (packingTypes.length === 2) return `${packingTypes[0]} & ${packingTypes[1]}`;

    return `${packingTypes.slice(0, -1).join(", ")} & ${packingTypes[packingTypes.length - 1]}`;
  }, [invoiceLines]);

  const totalUsd = useMemo(() => {
    return invoiceLines.reduce(
      (sum, line) => sum + num(line.totalUsd),
      0
    );
  }, [invoiceLines]);

  const freightCharges = num(form.freight_charges);
  const discountPercent = num(form.discount_percent);
  const discountUsd = discountPercent > 0 ? totalUsd * (discountPercent / 100) : 0;
  const grandTotalUsd = totalUsd + freightCharges - discountUsd;

  const selectedCurrency = form.currency || "USD";

  const exchangeRate = useMemo(() => {
    const currency = String(selectedCurrency || "USD").trim().toUpperCase();

    if (!currency || currency === "USD") return 1;

    const rows = getDefinitionRows(invoiceDefinitions, "currency_exchange");

    for (const row of rows) {
      const rate = parseExchangeRateValue(row.value, currency);
      if (rate) return rate;
    }

    return 1;
  }, [invoiceDefinitions, selectedCurrency]);

  const currencySymbol = getCurrencySymbol(selectedCurrency);

  function convertAmount(value) {
    return num(value) * exchangeRate;
  }

  const totalDisplay = convertAmount(totalUsd);
  const freightDisplay = convertAmount(freightCharges);
  const discountDisplay = convertAmount(discountUsd);
  const grandTotalDisplay = convertAmount(grandTotalUsd);

  const hasFreight = freightCharges > 0;
  const hasDiscount = discountUsd > 0;
  const showGrandTotal = hasFreight || hasDiscount;
  const finalInvoiceTotal = showGrandTotal ? grandTotalDisplay : totalDisplay;

  function handleChange(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function renderSelect(category, field, label) {
    const options = getDefinitionRows(invoiceDefinitions, category);

    return (
      <div className="form-group">
        <label>{label}</label>
        <select
          value={form[field]}
          onChange={(e) => handleChange(field, e.target.value)}
        >
          <option value="">Select {label}</option>

          {options.map((row) => (
            <option key={row.id} value={row.value}>
              {row.value}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function renderInvoiceDataDropdown(category, field, placeholder = "Select") {
    const options = getDefinitionRows(invoiceDefinitions, category);

    return (
      <select
        className="invoice-data-dropdown"
        value={form[field] || ""}
        onChange={(e) => handleChange(field, e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((row) => (
          <option key={row.id} value={row.value}>
            {row.value}
          </option>
        ))}
      </select>
    );
  }

  function handlePrint() {
    window.print();
  }

  function clearForm() {
    setForm(emptyForm);
    setInvoiceDate(todayISO());
    setInvoiceRef(getNextOfferRef(invoiceRefs));
    setMessage("");
    setError("");
  }

  async function handleSaveInvoice() {
    if (!form.order_id) {
      setError("Please select Order first.");
      return;
    }

    try {
      setSavingInvoice(true);
      setError("");
      setMessage("");

      const payload = {
        offer_ref: invoiceRef,
        offer_date: invoiceDate,
        pdo_header_id: form.order_id,
        customer_id: selectedOrder?.customer_id || null,
        currency: form.currency,
        price_as: form.price_as,
        payment: form.payment,
        shipping: form.shipping,
        port_of_loading: form.port_of_loading,
        order_cancelation: form.order_cancelation,
        delivery: form.delivery,
        packaging: autoPackingText || form.packaging,
        brand: autoBrandText || form.brand,
        manufacturer: form.manufacturer,
        country_of_origin: form.country_of_origin,
        others: form.others,
        hs_code: form.hs_code,
        bank_details: form.bank_details,
        fixed_profit_pct: fixedProfitPct,
        extra_profit_pct: num(form.extra_profit_pct),
        total_amount: finalInvoiceTotal,
        amount_in_words: amountInWords(
          finalInvoiceTotal,
          selectedCurrency
        ),
      };

      const { data: header, error: headerError } = await supabase
        .from("price_offer_headers")
        .insert([payload])
        .select()
        .single();

      if (headerError) throw headerError;

      const linesPayload = invoiceLines.map((line) => ({
        price_offer_header_id: header.id,
        line_no: line.no,
        item_name: line.item,
        description: line.description,
        unit: line.unit,
        packing: line.packing,
        qty: line.qty,
        tax: line.tax,
        tax_value: line.taxValue,
        unit_price: convertAmount(line.unitPrice),
        total_price: convertAmount(line.totalUsd),
      }));

      if (linesPayload.length > 0) {
        const { error: linesError } = await supabase
          .from("price_offer_lines")
          .insert(linesPayload);

        if (linesError) throw linesError;
      }

      setMessage("Price Offer saved successfully.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save Price Offer.");
    } finally {
      setSavingInvoice(false);
    }
  }
  return (
    <div className="invoice-page">
      <div className="no-print page-title-wrap">
        <h1>Price Offer</h1>
        <p>Create Price Offer from saved Order</p>
      </div>

      <div className="invoice-paper">
        <div className="top-brand">
          <div className="logo-wrap">
            <img src={MakinaLogo} alt="Makinalube" />
          </div>

          <div className="company-name">
            <div>Makina Grease & Lubricants</div>
            <div>Manufacturing L.L.C</div>
          </div>
        </div>

        <div className="invoice-title">
          <select
            className="invoice-title-select"
            value={form.offer_type || ""}
            onChange={(e) => handleChange("offer_type", e.target.value)}
          >
            <option value="Price Offer">Price Offer</option>
            {[
              ...getDefinitionRows(invoiceDefinitions, "offer_type"),
              ...getDefinitionRows(invoiceDefinitions, "invoice_title"),
            ].map((row) => (
              <option key={row.id} value={row.value}>
                {row.value}
              </option>
            ))}
          </select>
        </div>

        <div className="info-grid">
          <div className="info-cell">
            <span>Ref No.</span>
            <b>{invoiceRef}</b>
          </div>
          <div className="info-cell">
            <span>Date</span>
            <b>{formatDisplayDate(invoiceDate)}</b>
          </div>

          <div className="info-cell">
            <span>Customer</span>
            <b>{selectedCustomer?.customer_name || "-"}</b>
          </div>
          <div className="info-cell">
            <span>Customer TRN</span>
            <b>N/A</b>
          </div>

          <div className="info-cell">
            <span>Address</span>
            <b>
              {[selectedCustomer?.address, selectedCustomer?.city, selectedCustomer?.country]
                .filter(Boolean)
                .join(", ") || "-"}
            </b>
          </div>
          <div className="info-cell">
            <span>Supplier TRN</span>
            <b>100383760400003</b>
          </div>

          <div className="info-cell">
            <span>Contact Person</span>
            <b>{selectedCustomer?.contact_person || "-"}</b>
          </div>
          <div className="info-cell">
            <span>Page</span>
            <b>1 Of 1</b>
          </div>

          <div className="info-cell">
            <span>Tel</span>
            <b>{selectedCustomer?.phone || "-"}</b>
          </div>
          <div className="info-cell">
            <span>Place of Supply</span>
            <b>{selectedCustomer?.country || "-"}</b>
          </div>

          <div className="info-cell">
            <span>Despatch Through</span>
            <b>{form.shipping || "-"}</b>
          </div>
          <div className="info-cell">
            <span>Emirate</span>
            <b>Sharjah</b>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>S/N</th>
              <th>Item</th>
              <th>Description</th>
              <th>Unit</th>
              <th>Packing</th>
              <th>Qty</th>
              <th>Tax%</th>
              <th>TAX Value</th>
              <th>{selectedCurrency}/Unit</th>
              <th>Total {selectedCurrency}</th>
            </tr>
          </thead>

          <tbody>
            {invoiceLines.length === 0 ? (
              <tr>
                <td colSpan="10" className="empty-cell">
                  No Order selected.
                </td>
              </tr>
            ) : (
              invoiceLines.map((line) => (
                <tr key={`${line.no}-${line.item}-${line.packing}`}>
                  <td>{line.no}</td>
                  <td>{line.item}</td>
                  <td>{line.description}</td>
                  <td>{line.unit}</td>
                  <td>{line.packing}</td>
                  <td>{line.qty}</td>
                  <td>{line.tax}</td>
                  <td>{line.taxValue}</td>
                  <td>{currencySymbol}{money(convertAmount(line.unitPrice))}</td>
                  <td>{currencySymbol}{money(convertAmount(line.totalUsd))}</td>
                </tr>
              ))
            )}

            <tr className="total-row">
              <td colSpan="9">Total {selectedCurrency || "USD"}</td>
              <td>{currencySymbol}{money(totalDisplay)}</td>
            </tr>

            {hasFreight ? (
              <tr className="total-row">
                <td colSpan="9">Freight Charges</td>
                <td>{currencySymbol}{money(freightDisplay)}</td>
              </tr>
            ) : null}

            {hasDiscount ? (
              <tr className="total-row">
                <td colSpan="9">Discount {discountPercent}%</td>
                <td>- {currencySymbol}{money(discountDisplay)}</td>
              </tr>
            ) : null}

            {showGrandTotal ? (
              <tr className="grand-row">
                <td colSpan="9">Grand Total {selectedCurrency || "USD"}</td>
                <td>{currencySymbol}{money(grandTotalDisplay)}</td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <div className="amount-row">
          <div className="amount-label">Amount in words :</div>
          <div className="amount-value">
            {amountInWords(finalInvoiceTotal, selectedCurrency)}
          </div>
        </div>

        <div className="terms-title">Terms and Conditions</div>

        <table className="terms-table">
          <tbody>
            <tr>
              <td>Price</td>
              <td>{renderInvoiceDataDropdown("price_as", "price_as")}</td>
            </tr>
            <tr>
              <td>Currency</td>
              <td>{renderInvoiceDataDropdown("currency", "currency")}</td>
            </tr>
            <tr>
              <td>Payment</td>
              <td>{renderInvoiceDataDropdown("payment", "payment")}</td>
            </tr>
            <tr>
              <td>Order Cancelation</td>
              <td>{renderInvoiceDataDropdown("order_cancelation", "order_cancelation")}</td>
            </tr>
            <tr>
              <td>Delivery</td>
              <td>{renderInvoiceDataDropdown("delivery", "delivery")}</td>
            </tr>
            <tr>
              <td>Packaging</td>
              <td>{autoPackingText || "-"}</td>
            </tr>
            <tr>
              <td>Brand</td>
              <td>{autoBrandText || "-"}</td>
            </tr>
            <tr>
              <td>Manufacturer</td>
              <td>{renderInvoiceDataDropdown("manufacturer", "manufacturer")}</td>
            </tr>
            <tr>
              <td>Country of origin</td>
              <td>{renderInvoiceDataDropdown("country_of_origin", "country_of_origin")}</td>
            </tr>
            <tr>
              <td>Others</td>
              <td>{renderInvoiceDataDropdown("others", "others")}</td>
            </tr>
            <tr>
              <td>Shipping</td>
              <td>{renderInvoiceDataDropdown("shipping", "shipping")}</td>
            </tr>
            <tr>
              <td>Port of Loading</td>
              <td>{renderInvoiceDataDropdown("port_of_loading", "port_of_loading")}</td>
            </tr>
            <tr>
              <td>HS Code</td>
              <td>{renderInvoiceDataDropdown("hs_code", "hs_code")}</td>
            </tr>
          </tbody>
        </table>

        <div className="bank-section">
          <div className="bank-title">Bank Details</div>
          <div className="bank-text">
            {renderInvoiceDataDropdown("bank_details", "bank_details")}
          </div>
        </div>

        <div className="company-footer">
          Makina Grease & Lubricants Manufacturing L.L.C
        </div>

        <div className="system-note">
          This is system-generated Price Offer and does not require any signature or stamp.
        </div>
      </div>
      <div className="no-print bottom-invoice-controls">
        <div className="bottom-controls-grid">
          <div className="form-group">
            <label>Order</label>
            <select
              value={form.order_id}
              onChange={(e) => handleChange("order_id", e.target.value)}
            >
              <option value="">Select Order</option>
              {orders.map((order) => {
                const customer = customerMap[String(order.customer_id)] || {};
                return (
                  <option key={order.id} value={order.id}>
                    {order.pdo_no || `Order #${order.id}`} - {customer.customer_name || ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label>Freight Charges</label>
            <input
              type="number"
              value={form.freight_charges}
              onChange={(e) => handleChange("freight_charges", e.target.value)}
              placeholder="Ex: 11500"
            />
          </div>

          <div className="form-group">
            <label>Extra Profit %</label>
            <input
              type="number"
              value={form.extra_profit_pct}
              onChange={(e) => handleChange("extra_profit_pct", e.target.value)}
              placeholder="Ex: 5"
            />
          </div>

          <div className="form-group">
            <label>Discount %</label>
            <input
              type="number"
              value={form.discount_percent}
              onChange={(e) => handleChange("discount_percent", e.target.value)}
              placeholder="Ex: 10"
            />
          </div>
        </div>

        <div className="actions bottom-actions">
          <button type="button" onClick={handleSaveInvoice} disabled={savingInvoice}>
            {savingInvoice ? "Saving..." : "Save Price Offer"}
          </button>

          <button type="button" className="btn-secondary" onClick={handlePrint}>
            Print
          </button>

          <button type="button" className="btn-secondary" onClick={clearForm}>
            Clear
          </button>
        </div>

        {loading ? <div className="alert info">Loading...</div> : null}
        {message ? <div className="alert success">{message}</div> : null}
        {error ? <div className="alert error">{error}</div> : null}
      </div>

      <style>{`
        .invoice-page {
          padding: 24px;
          background: #f3f4f6;
          min-height: 100vh;
        }

        .page-title-wrap {
          text-align: center;
          margin-bottom: 20px;
        }

        .page-title-wrap h1 {
          margin: 0;
          font-size: 34px;
          font-weight: 800;
          color: #1f2937;
        }

        .page-title-wrap p {
          margin-top: 8px;
          color: #6b7280;
          font-size: 14px;
        }

        .invoice-controls {
          max-width: 1400px;
          margin: 0 auto 24px;
          background: #ffffff;
          border-radius: 14px;
          padding: 24px;
          border: 1px solid #d1d5db;
          box-shadow: 0 8px 20px rgba(0,0,0,0.05);
        }

        .form-grid {
          display: grid;
          gap: 14px;
          margin-bottom: 16px;
        }

        .four-cols {
          grid-template-columns: repeat(4, 1fr);
        }

        .two-cols {
          grid-template-columns: repeat(2, 1fr);
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 6px;
          color: #111827;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 14px;
          background: #fff;
          outline: none;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .actions button {
          height: 42px;
          border: none;
          border-radius: 8px;
          padding: 0 18px;
          font-weight: 700;
          cursor: pointer;
          background: #111827;
          color: white;
        }

        .btn-secondary {
          background: #e5e7eb !important;
          color: #111827 !important;
        }

        .alert {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
        }

        .alert.success {
          background: #ecfdf5;
          color: #166534;
        }

        .alert.error {
          background: #fef2f2;
          color: #991b1b;
        }

        .alert.info {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .invoice-paper {
          max-width: 1400px;
          margin: 0 auto;
          background: white;
          border: 1px solid #111;
          padding: 12px;
        }

        .top-brand {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 8px;
        }

        .logo-wrap img {
          width: 85px;
          height: auto;
          object-fit: contain;
        }

        .company-name {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.4;
        }

        .invoice-title {
          text-align: center;
          font-size: 20px;
          font-weight: 800;
          color: #b91c1c;
          border-top: 1px solid #111;
          border-bottom: 1px solid #111;
          padding: 6px 0;
          margin-bottom: 8px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          border: 1px solid #111;
          border-bottom: none;
        }

        .info-cell {
          display: grid;
          grid-template-columns: 180px 1fr;
          border-bottom: 1px solid #111;
          font-size: 13px;
        }

        .info-cell span {
          padding: 6px 8px;
          border-right: 1px solid #111;
          font-weight: 700;
          background: #fafafa;
        }

        .info-cell b {
          padding: 6px 8px;
          font-weight: 600;
        }

        .invoice-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        .invoice-table th,
        .invoice-table td {
          border: 1px solid #111;
          padding: 6px;
          font-size: 12px;
          text-align: center;
        }

        .invoice-table th {
          color: #b91c1c;
          font-weight: 800;
          background: #fafafa;
        }

        .invoice-table td:nth-child(2) {
          text-align: left;
        }

        .total-row td,
        .grand-row td {
          font-weight: 800;
          color: #b91c1c;
          font-size: 13px;
        }

        .empty-cell {
          padding: 20px !important;
          color: #6b7280;
          font-weight: 700;
        }

        .amount-row {
          display: grid;
          grid-template-columns: 220px 1fr;
          border: 1px solid #111;
          border-top: none;
        }

        .amount-label {
          border-right: 1px solid #111;
          padding: 8px;
          font-weight: 800;
          color: #b91c1c;
          text-align: center;
        }

        .amount-value {
          padding: 8px;
          font-weight: 700;
        }

        .terms-title {
          margin-top: 12px;
          font-weight: 800;
          text-decoration: underline;
          font-size: 14px;
        }

        .terms-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }

        .terms-table td {
          border: 1px solid #111;
          padding: 6px 8px;
          font-size: 13px;
        }

        .terms-table td:first-child {
          width: 220px;
          font-weight: 700;
          background: #fafafa;
        }

        .bank-section {
          margin-top: 12px;
          border: 1px solid #111;
        }

        .bank-title {
          padding: 8px;
          font-weight: 800;
          border-bottom: 1px solid #111;
          background: #fafafa;
        }

        .bank-text {
          padding: 10px;
          white-space: pre-wrap;
          font-size: 13px;
        }

        .company-footer {
          margin-top: 14px;
          font-weight: 800;
          font-size: 14px;
        }

        .system-note {
          margin-top: 10px;
          border: 1px solid #111;
          text-align: center;
          padding: 8px;
          font-size: 12px;
          color: #7c2d12;
        }

        @media (max-width: 1000px) {
          .four-cols,
          .two-cols,
          .info-grid {
            grid-template-columns: 1fr;
          }

          .info-cell {
            grid-template-columns: 1fr;
          }
        }

        @media print {
          .no-print {
            display: none !important;
          }

          .invoice-title-select,
          .invoice-data-dropdown {
            border: none !important;
            background: transparent !important;
            -webkit-appearance: none;
            appearance: none;
          }

          .invoice-page {
            padding: 0;
            background: white;
          }

          .invoice-paper {
            border: none;
            padding: 0;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
}
