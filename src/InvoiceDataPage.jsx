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
    key: "currency_exchange",
    title: "Currency Exchange",
    description: "Define currency exchange rates",
    placeholder: "Ex: USD/AED",
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
    key: "port_of_discharge",
    title: "Port of Discharge",
    description: "Define port of discharge",
    placeholder: "Ex: Beirut / Jeddah / Umm Qasr",
  },
  {
    key: "shipping",
    title: "Shipping",
    description: "Define shipping method",
    placeholder: "Ex: By road / By sea",
  },
  {
    key: "hs_code",
    title: "HS Code",
    description: "Define HS Code values",
    placeholder: "Ex: 27101999",
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
  {
    key: "order_cancelation",
    title: "Order Cancelation",
    description: "Define order cancelation terms",
    placeholder: "Ex: Not allowed after confirmation",
  },
  {
    key: "delivery",
    title: "Delivery",
    description: "Define delivery terms",
    placeholder: "Ex: 15 working days after payment",
  },
  {
    key: "brand",
    title: "Brand",
    description: "Define invoice brand terms",
    placeholder: "Ex: MAKINALUBE",
  },
  {
    key: "manufacturer",
    title: "Manufacturer",
    description: "Define manufacturer details",
    placeholder: "Ex: Makina Lubricants",
  },
  {
    key: "country_of_origin",
    title: "Country of Origin",
    description: "Define country of origin values",
    placeholder: "Ex: UAE / Turkey / China",
  },
  {
    key: "others",
    title: "Others",
    description: "Define other invoice terms",
    placeholder: "Ex: Prices subject to change",
  },
  {
    key: "bank_details",
    title: "Bank Details",
    description: "Define bank details used in invoice",
    placeholder: "Enter bank details",
  },
  {
    key: "fixed_profit_pct",
    title: "Fixed Profit %",
    description: "Define fixed profit percentage for invoice calculation",
    placeholder: "Ex: 10",
  },
];

const EMPTY_BANK_DETAILS = {
  bank_name: "",
  account_name: "",
  account_number: "",
  iban: "",
  swift_code: "",
};

const EMPTY_CURRENCY_EXCHANGE = {
  from_currency: "",
  to_currency: "",
  exchange_rate: "",
};

function createInitialForms() {
  return CATEGORY_CONFIG.reduce((acc, item) => {
    acc[item.key] = {
      id: "",
      value: "",
      bankDetails: { ...EMPTY_BANK_DETAILS },
      currencyExchange: { ...EMPTY_CURRENCY_EXCHANGE },
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

function groupRowsByCategory(rows) {
  return CATEGORY_CONFIG.reduce((acc, item) => {
    acc[item.key] = rows
      .filter((row) => row.category === item.key)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
    return acc;
  }, {});
}

function formatBankDetails(bankDetails) {
  return JSON.stringify({
    bank_name: bankDetails.bank_name || "",
    account_name: bankDetails.account_name || "",
    account_number: bankDetails.account_number || "",
    iban: bankDetails.iban || "",
    swift_code: bankDetails.swift_code || "",
  });
}

function parseBankDetails(value) {
  if (!value) return { ...EMPTY_BANK_DETAILS };

  try {
    const parsed = JSON.parse(value);
    return {
      bank_name: parsed.bank_name || "",
      account_name: parsed.account_name || "",
      account_number: parsed.account_number || "",
      iban: parsed.iban || "",
      swift_code: parsed.swift_code || "",
    };
  } catch {
    return { ...EMPTY_BANK_DETAILS };
  }
}

function bankDetailsToSearchText(value) {
  const bank = parseBankDetails(value);
  return [
    bank.bank_name,
    bank.account_name,
    bank.account_number,
    bank.iban,
    bank.swift_code,
  ]
    .join(" ")
    .toLowerCase();
}

function formatCurrencyExchange(currencyExchange) {
  return JSON.stringify({
    from_currency: currencyExchange.from_currency || "",
    to_currency: currencyExchange.to_currency || "",
    exchange_rate: currencyExchange.exchange_rate || "",
  });
}

function parseCurrencyExchange(value) {
  if (!value) return { ...EMPTY_CURRENCY_EXCHANGE };

  try {
    const parsed = JSON.parse(value);
    return {
      from_currency: parsed.from_currency || "",
      to_currency: parsed.to_currency || "",
      exchange_rate: parsed.exchange_rate || "",
    };
  } catch {
    return { ...EMPTY_CURRENCY_EXCHANGE };
  }
}

function currencyExchangeToSearchText(value) {
  const exchange = parseCurrencyExchange(value);
  return [
    exchange.from_currency,
    exchange.to_currency,
    exchange.exchange_rate,
    `${exchange.from_currency}/${exchange.to_currency}`,
  ]
    .join(" ")
    .toLowerCase();
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
    CATEGORY_CONFIG.find((item) => item.key === activeCategory) ||
    CATEGORY_CONFIG[0];

  const activeRows = useMemo(() => {
    const baseRows = groupedRows[activeCategory] || [];
    const q = search.trim().toLowerCase();

    if (!q) return baseRows;

    return baseRows.filter((row) => {
      if (activeCategory === "bank_details") {
        return bankDetailsToSearchText(row.value || "").includes(q);
      }

      if (activeCategory === "currency_exchange") {
        return currencyExchangeToSearchText(row.value || "").includes(q);
      }

      return String(row.value || "").toLowerCase().includes(q);
    });
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

  function handleBankInputChange(field, value) {
    setForms((prev) => ({
      ...prev,
      bank_details: {
        ...prev.bank_details,
        bankDetails: {
          ...prev.bank_details.bankDetails,
          [field]: value,
        },
      },
    }));
  }

  function handleCurrencyExchangeInputChange(field, value) {
    setForms((prev) => ({
      ...prev,
      currency_exchange: {
        ...prev.currency_exchange,
        currencyExchange: {
          ...prev.currency_exchange.currencyExchange,
          [field]: value,
        },
      },
    }));
  }

  function clearForm(category) {
    setForms((prev) => ({
      ...prev,
      [category]: {
        id: "",
        value: "",
        bankDetails: { ...EMPTY_BANK_DETAILS },
        currencyExchange: { ...EMPTY_CURRENCY_EXCHANGE },
      },
    }));
    clearCategoryFeedback(category);
  }

  function getCategoryRows(category) {
    return rows
      .filter((row) => row.category === category)
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  }

  function getCurrentValue(category) {
    if (category === "bank_details") {
      const bankDetails = forms.bank_details?.bankDetails || EMPTY_BANK_DETAILS;
      return formatBankDetails(bankDetails);
    }

    if (category === "currency_exchange") {
      const currencyExchange =
        forms.currency_exchange?.currencyExchange || EMPTY_CURRENCY_EXCHANGE;
      return formatCurrencyExchange(currencyExchange);
    }

    return forms[category]?.value?.trim() || "";
  }

  function validateBankDetails() {
    const bankDetails = forms.bank_details?.bankDetails || EMPTY_BANK_DETAILS;

    if (!bankDetails.bank_name.trim()) return "Please enter Bank Name.";
    if (!bankDetails.account_name.trim()) return "Please enter Account Name.";
    if (!bankDetails.account_number.trim()) return "Please enter Account Number.";
    if (!bankDetails.iban.trim()) return "Please enter IBAN.";
    if (!bankDetails.swift_code.trim()) return "Please enter SWIFT CODE.";

    return "";
  }

  function validateCurrencyExchange() {
    const exchange =
      forms.currency_exchange?.currencyExchange || EMPTY_CURRENCY_EXCHANGE;

    if (!exchange.from_currency.trim()) return "Please enter From Currency.";
    if (!exchange.to_currency.trim()) return "Please enter To Currency.";
    if (!exchange.exchange_rate.trim()) return "Please enter Exchange Rate.";

    const rate = Number(exchange.exchange_rate);
    if (Number.isNaN(rate) || rate <= 0) {
      return "Exchange Rate must be a number greater than 0.";
    }

    return "";
  }

  async function handleAdd(category) {
    if (category === "bank_details") {
      const bankError = validateBankDetails();
      if (bankError) {
        setCategoryError(category, bankError);
        return;
      }
    }

    if (category === "currency_exchange") {
      const exchangeError = validateCurrencyExchange();
      if (exchangeError) {
        setCategoryError(category, exchangeError);
        return;
      }
    }

    const currentValue = getCurrentValue(category);

    if (!currentValue) {
      setCategoryError(category, "Please enter a value first.");
      return;
    }

    try {
      setSavingMap((prev) => ({ ...prev, [category]: true }));
      clearCategoryFeedback(category);

      const categoryRows = getCategoryRows(category);

      const duplicate = categoryRows.find((row) => {
        if (category === "bank_details") {
          const oldBank = parseBankDetails(row.value || "");
          const newBank = forms.bank_details?.bankDetails || EMPTY_BANK_DETAILS;

          return (
            oldBank.bank_name.trim().toLowerCase() ===
              newBank.bank_name.trim().toLowerCase() &&
            oldBank.account_number.trim().toLowerCase() ===
              newBank.account_number.trim().toLowerCase()
          );
        }

        if (category === "currency_exchange") {
          const oldExchange = parseCurrencyExchange(row.value || "");
          const newExchange =
            forms.currency_exchange?.currencyExchange ||
            EMPTY_CURRENCY_EXCHANGE;

          return (
            oldExchange.from_currency.trim().toLowerCase() ===
              newExchange.from_currency.trim().toLowerCase() &&
            oldExchange.to_currency.trim().toLowerCase() ===
              newExchange.to_currency.trim().toLowerCase()
          );
        }

        return (
          String(row.value || "").trim().toLowerCase() ===
          currentValue.toLowerCase()
        );
      });

      if (duplicate) {
        setCategoryError(category, "This value already exists.");
        return;
      }

      const nextSortOrder =
        categoryRows.length > 0
          ? Math.max(...categoryRows.map((row) => Number(row.sort_order || 0))) +
            1
          : 1;

      const payload = {
        category,
        value: currentValue,
        sort_order: nextSortOrder,
        is_active: true,
      };

      const { error } = await supabase
        .from("invoice_definitions")
        .insert([payload]);

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
    if (category === "bank_details") {
      const bankError = validateBankDetails();
      if (bankError) {
        setCategoryError(category, bankError);
        return;
      }
    }

    if (category === "currency_exchange") {
      const exchangeError = validateCurrencyExchange();
      if (exchangeError) {
        setCategoryError(category, exchangeError);
        return;
      }
    }

    const currentValue = getCurrentValue(category);
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

      const duplicate = categoryRows.find((row) => {
        if (String(row.id) === String(currentId)) return false;

        if (category === "bank_details") {
          const oldBank = parseBankDetails(row.value || "");
          const newBank = forms.bank_details?.bankDetails || EMPTY_BANK_DETAILS;

          return (
            oldBank.bank_name.trim().toLowerCase() ===
              newBank.bank_name.trim().toLowerCase() &&
            oldBank.account_number.trim().toLowerCase() ===
              newBank.account_number.trim().toLowerCase()
          );
        }

        if (category === "currency_exchange") {
          const oldExchange = parseCurrencyExchange(row.value || "");
          const newExchange =
            forms.currency_exchange?.currencyExchange ||
            EMPTY_CURRENCY_EXCHANGE;

          return (
            oldExchange.from_currency.trim().toLowerCase() ===
              newExchange.from_currency.trim().toLowerCase() &&
            oldExchange.to_currency.trim().toLowerCase() ===
              newExchange.to_currency.trim().toLowerCase()
          );
        }

        return (
          String(row.value || "").trim().toLowerCase() ===
          currentValue.toLowerCase()
        );
      });

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
    if (category === "bank_details") {
      setForms((prev) => ({
        ...prev,
        [category]: {
          id: row.id || "",
          value: row.value || "",
          bankDetails: parseBankDetails(row.value || ""),
          currencyExchange: { ...EMPTY_CURRENCY_EXCHANGE },
        },
      }));
    } else if (category === "currency_exchange") {
      setForms((prev) => ({
        ...prev,
        [category]: {
          id: row.id || "",
          value: row.value || "",
          bankDetails: { ...EMPTY_BANK_DETAILS },
          currencyExchange: parseCurrencyExchange(row.value || ""),
        },
      }));
    } else {
      setForms((prev) => ({
        ...prev,
        [category]: {
          id: row.id || "",
          value: row.value || "",
          bankDetails: { ...EMPTY_BANK_DETAILS },
          currencyExchange: { ...EMPTY_CURRENCY_EXCHANGE },
        },
      }));
    }

    clearCategoryFeedback(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(category, row) {
    const ok = window.confirm(`Delete this value?`);
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
    const currentIndex = categoryRows.findIndex(
      (item) => String(item.id) === String(row.id)
    );
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

  function renderValueCell(row) {
    if (activeCategory === "bank_details") {
      const bank = parseBankDetails(row.value || "");

      return (
        <div className="bank-preview">
          <div>
            <strong>Bank Name:</strong> {bank.bank_name}
          </div>
          <div>
            <strong>Account Name:</strong> {bank.account_name}
          </div>
          <div>
            <strong>Account Number:</strong> {bank.account_number}
          </div>
          <div>
            <strong>IBAN:</strong> {bank.iban}
          </div>
          <div>
            <strong>SWIFT CODE:</strong> {bank.swift_code}
          </div>
        </div>
      );
    }

    if (activeCategory === "currency_exchange") {
      const exchange = parseCurrencyExchange(row.value || "");

      return (
        <div className="exchange-preview">
          <div>
            <strong>Currency:</strong>{" "}
            {exchange.from_currency}/{exchange.to_currency}
          </div>
          <div>
            <strong>Exchange Rate:</strong> {exchange.exchange_rate}
          </div>
        </div>
      );
    }

    return row.value || "";
  }

  const form = forms[activeCategory] || {
    id: "",
    value: "",
    bankDetails: { ...EMPTY_BANK_DETAILS },
    currencyExchange: { ...EMPTY_CURRENCY_EXCHANGE },
  };

  const saving = !!savingMap[activeCategory];
  const bankForm = forms.bank_details?.bankDetails || EMPTY_BANK_DETAILS;
  const exchangeForm =
    forms.currency_exchange?.currencyExchange || EMPTY_CURRENCY_EXCHANGE;

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
                className={`category-tab ${
                  activeCategory === section.key ? "active" : ""
                }`}
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

            {activeCategory === "bank_details" ? (
              <div className="bank-form-grid">
                <div className="form-group">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    value={bankForm.bank_name}
                    onChange={(e) =>
                      handleBankInputChange("bank_name", e.target.value)
                    }
                    placeholder="National Bank of Fujairah"
                  />
                </div>

                <div className="form-group">
                  <label>Account Name</label>
                  <input
                    type="text"
                    value={bankForm.account_name}
                    onChange={(e) =>
                      handleBankInputChange("account_name", e.target.value)
                    }
                    placeholder="Makina Grease and Lubricants Manufacturing LLC"
                  />
                </div>

                <div className="form-group">
                  <label>Account Number</label>
                  <input
                    type="text"
                    value={bankForm.account_number}
                    onChange={(e) =>
                      handleBankInputChange("account_number", e.target.value)
                    }
                    placeholder="012001533116"
                  />
                </div>

                <div className="form-group">
                  <label>IBAN</label>
                  <input
                    type="text"
                    value={bankForm.iban}
                    onChange={(e) =>
                      handleBankInputChange("iban", e.target.value)
                    }
                    placeholder="AE640380000012001533116"
                  />
                </div>

                <div className="form-group">
                  <label>SWIFT CODE</label>
                  <input
                    type="text"
                    value={bankForm.swift_code}
                    onChange={(e) =>
                      handleBankInputChange("swift_code", e.target.value)
                    }
                    placeholder="NBFUAEAFDXB"
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
            ) : activeCategory === "currency_exchange" ? (
              <div className="exchange-form-grid">
                <div className="form-group">
                  <label>From Currency</label>
                  <input
                    type="text"
                    value={exchangeForm.from_currency}
                    onChange={(e) =>
                      handleCurrencyExchangeInputChange(
                        "from_currency",
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="USD"
                  />
                </div>

                <div className="form-group">
                  <label>To Currency</label>
                  <input
                    type="text"
                    value={exchangeForm.to_currency}
                    onChange={(e) =>
                      handleCurrencyExchangeInputChange(
                        "to_currency",
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="AED"
                  />
                </div>

                <div className="form-group">
                  <label>Exchange Rate</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={exchangeForm.exchange_rate}
                    onChange={(e) =>
                      handleCurrencyExchangeInputChange(
                        "exchange_rate",
                        e.target.value
                      )
                    }
                    placeholder="3.6725"
                  />
                </div>

                <div className="quick-values exchange-quick-values">
                  <button
                    type="button"
                    onClick={() => {
                      handleCurrencyExchangeInputChange("from_currency", "USD");
                      handleCurrencyExchangeInputChange("to_currency", "AED");
                    }}
                  >
                    USD/AED
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleCurrencyExchangeInputChange("from_currency", "USD");
                      handleCurrencyExchangeInputChange("to_currency", "EUR");
                    }}
                  >
                    USD/EUR
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleCurrencyExchangeInputChange("from_currency", "USD");
                      handleCurrencyExchangeInputChange("to_currency", "SYP");
                    }}
                  >
                    USD/SYP
                  </button>
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
            ) : (
              <div className="form-grid single-col">
                <div className="form-group">
                  <label>{activeSection.title}</label>
                  <input
                    type="text"
                    value={form.value}
                    onChange={(e) =>
                      handleInputChange(activeCategory, e.target.value)
                    }
                    placeholder={activeSection.placeholder}
                  />
                </div>

                {activeCategory === "shipping" ? (
                  <div className="quick-values">
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange(activeCategory, "By road")
                      }
                    >
                      By road
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange(activeCategory, "By sea")
                      }
                    >
                      By sea
                    </button>
                  </div>
                ) : null}

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
            )}

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
                          <td>{renderValueCell(row)}</td>
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
                                onClick={() =>
                                  handleMove(activeCategory, row, "up")
                                }
                                disabled={saving || index === 0}
                                title="Move Up"
                              >
                                ↑
                              </button>

                              <button
                                type="button"
                                className="btn-order"
                                onClick={() =>
                                  handleMove(activeCategory, row, "down")
                                }
                                disabled={
                                  saving || index === activeRows.length - 1
                                }
                                title="Move Down"
                              >
                                ↓
                              </button>

                              <button
                                type="button"
                                className="btn-delete"
                                onClick={() =>
                                  handleDelete(activeCategory, row)
                                }
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
        .bank-form-grid,
        .exchange-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .bank-form-grid .form-actions,
        .exchange-form-grid .form-actions,
        .exchange-form-grid .exchange-quick-values {
          grid-column: 1 / -1;
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
        .table-actions button,
        .quick-values button {
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
        .quick-values {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .quick-values button {
          background: #f8fafc;
          color: #111827;
          border: 1px solid #cbd5e1;
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
          vertical-align: top;
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
        .bank-preview,
        .exchange-preview {
          display: grid;
          gap: 4px;
          line-height: 1.5;
          color: #334155;
        }
        .bank-preview strong,
        .exchange-preview strong {
          color: #0f172a;
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
        @media (max-width: 800px) {
          .bank-form-grid,
          .exchange-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}