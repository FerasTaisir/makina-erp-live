import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

import Login from "./Login";
import BackupButton from "./BackupButton";

import BrandCustomerPage from "./BrandCustomerPage";
import BrandsPage from "./BrandsPage";
import CustomersPage from "./CustomersPage";
import FormulaMasterPage from "./FormulaMasterPage";
import FormulaListPage from "./FormulaListPage";
import InvoiceDataPage from "./InvoiceDataPage";
import InvoicePage from "./InvoicePage";
import FinalInvoicePage from "./FinalInvoicePage";
import PackagingDefinitionsPage from "./PackagingDefinitionsPage";
import PackingBrandPage from "./PackingBrandPage";
import PackingMasterPage from "./PackingMasterPage";
import PackingStorePage from "./PackingStorePage";
import PalletDataPage from "./PalletDataPage";
import RMPage from "./RMPage";

import CustomerItemsPage from "./Pages/CustomerItemsPage";
import ItemMasterPage from "./Pages/ItemMasterPage";
import OrderPage from "./Pages/OrderPage";
import ProductionOrderPage from "./Pages/ProductionOrderPage";

const pages = [
  { key: "brands", label: "Brand Master", component: BrandsPage },
  { key: "brand-customer", label: "Brand-Customer", component: BrandCustomerPage },

  { key: "customers", label: "Customers", component: CustomersPage },
  { key: "item-master", label: "Item Master", component: ItemMasterPage },
  { key: "customer-items", label: "Customer Items", component: CustomerItemsPage },

  { key: "formula-master", label: "Formula Master", component: FormulaMasterPage },
  { key: "formula-list", label: "Formula List", component: FormulaListPage },

  { key: "packing-master", label: "Packing Master", component: PackingMasterPage },
  { key: "packing-definitions", label: "Packing Data", component: PackagingDefinitionsPage },
  { key: "packing-brand", label: "Packing Brand", component: PackingBrandPage },
  { key: "packing-store", label: "Packing Store", component: PackingStorePage },
  { key: "pallet-data", label: "Pallet Data", component: PalletDataPage },

  { key: "rm", label: "RM", component: RMPage },
  { key: "invoice-data", label: "Invoice Data", component: InvoiceDataPage },
  { key: "order", label: "Order", component: OrderPage },
  { key: "production-order", label: "Production & Shipping", component: ProductionOrderPage },
  { key: "final-invoice", label: "Final Invoice", component: FinalInvoicePage },
  { key: "invoice", label: "Invoice", component: InvoicePage },
];

const brandPages = ["brands", "brand-customer"];
const formulaPages = ["formula-master", "formula-list"];

const packingPages = [
  "packing-master",
  "packing-definitions",
  "packing-brand",
  "packing-store",
  "pallet-data",
];

export default function App() {
  const [activePage, setActivePage] = useState(() => {
    const saved = localStorage.getItem("makina_active_page") || "formula-master";
    return saved === "formula" ? "formula-master" : saved;
  });

  const [brandsOpen, setBrandsOpen] = useState(false);
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [packingOpen, setPackingOpen] = useState(false);

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [roleRow, setRoleRow] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);
  const [roleError, setRoleError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        setAuthLoading(true);

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return;

        setSession(data?.session || null);
      } catch (err) {
        console.error(err);
        if (mounted) setSession(null);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession || null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadRole() {
      const userId = session?.user?.id || "";

      if (!userId) {
        setRoleRow(null);
        setRoleError("");
        return;
      }

      try {
        setRoleLoading(true);
        setRoleError("");

        const { data, error } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", userId);

        if (error) throw error;
        if (!mounted) return;

        setRoleRow(data && data.length > 0 ? data[0] : null);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setRoleRow(null);
          setRoleError(err.message || "Failed to load user role.");
        }
      } finally {
        if (mounted) setRoleLoading(false);
      }
    }

    loadRole();

    return () => {
      mounted = false;
    };
  }, [session]);

  const currentUser = useMemo(() => {
    return {
      email: session?.user?.email || "",
      userId: session?.user?.id || "",
      role: roleRow?.role || "",
      canDelete: roleRow?.role === "admin",
    };
  }, [session, roleRow]);

  function openPage(pageKey) {
    const normalizedKey = pageKey === "formula" ? "formula-master" : pageKey;

    setActivePage(normalizedKey);
    localStorage.setItem("makina_active_page", normalizedKey);

    setBrandsOpen(false);
    setFormulaOpen(false);
    setPackingOpen(false);
  }

  const allowedPages = useMemo(() => {
    if (!currentUser.userId || !currentUser.role) return [];
    if (currentUser.role === "admin") return pages;
    if (currentUser.role === "user") return pages;
    return [];
  }, [currentUser]);

  useEffect(() => {
    if (authLoading || roleLoading || !currentUser.userId || allowedPages.length === 0) {
      return;
    }

    const savedRaw = localStorage.getItem("makina_active_page") || activePage;
    const savedPage = savedRaw === "formula" ? "formula-master" : savedRaw;
    const savedPageAllowed = allowedPages.some((page) => page.key === savedPage);

    if (savedPageAllowed) {
      if (savedPage !== activePage) {
        setActivePage(savedPage);
        localStorage.setItem("makina_active_page", savedPage);
      }
      return;
    }

    const activePageAllowed = allowedPages.some((page) => page.key === activePage);
    if (!activePageAllowed) {
      openPage(allowedPages[0]?.key || "formula-master");
    }
  }, [
    allowedPages,
    activePage,
    authLoading,
    roleLoading,
    currentUser.userId,
  ]);

  const CurrentPage =
    allowedPages.find((page) => page.key === activePage)?.component || null;

  async function handleLogout() {
    await supabase.auth.signOut();
    setRoleRow(null);
    setRoleError("");
  }

  const normalPages = allowedPages.filter(
    (page) =>
      !brandPages.includes(page.key) &&
      !formulaPages.includes(page.key) &&
      !packingPages.includes(page.key)
  );

  const allowedBrandPages = allowedPages.filter((page) =>
    brandPages.includes(page.key)
  );

  const allowedFormulaPages = allowedPages.filter((page) =>
    formulaPages.includes(page.key)
  );

  const allowedPackingPages = allowedPages.filter((page) =>
    packingPages.includes(page.key)
  );

  function renderSidebarButton(page) {
    return (
      <button
        key={page.key}
        type="button"
        onClick={() => openPage(page.key)}
        style={{
          display: "block",
          width: "100%",
          marginBottom: 8,
          padding: 10,
          background: activePage === page.key ? "#1565c0" : "#1e293b",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {page.label}
      </button>
    );
  }

  function renderSideMenuButton({
    title,
    isActive,
    isOpen,
    setIsOpen,
    subPages,
  }) {
    return (
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            display: "block",
            width: "100%",
            marginBottom: 8,
            padding: 10,
            background: isActive ? "#1565c0" : "#1e293b",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            textAlign: "left",
            fontWeight: "bold",
          }}
        >
          {title}
        </button>

        {isOpen && (
          <div
            style={{
              position: "absolute",
              left: "105%",
              top: 0,
              width: 240,
              background: "#0f172a",
              padding: 12,
              borderRadius: 10,
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              zIndex: 9999,
            }}
          >
            {subPages.map((subPage) => (
              <button
                key={subPage.key}
                type="button"
                onClick={() => openPage(subPage.key)}
                style={{
                  display: "block",
                  width: "100%",
                  marginBottom: 8,
                  padding: 10,
                  background:
                    activePage === subPage.key ? "#1565c0" : "#1e293b",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {subPage.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (authLoading) return <div>Loading session...</div>;
  if (!session) return <Login />;
  if (roleLoading) return <div>Checking permissions...</div>;

  if (roleError) {
    return (
      <div>
        <div>{roleError}</div>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 260,
          background: "#0f172a",
          color: "white",
          padding: 16,
          position: "relative",
        }}
      >
        <h2>MAKINA ERP</h2>
        <BackupButton />

        {renderSideMenuButton({
          title: "Brands",
          isActive: brandPages.includes(activePage),
          isOpen: brandsOpen,
          setIsOpen: setBrandsOpen,
          subPages: allowedBrandPages,
        })}

        {normalPages.map((page) => {
          if (page.key === "rm") {
            return (
              <React.Fragment key="packing-group-before-rm">
                {renderSideMenuButton({
                  title: "Packing",
                  isActive: packingPages.includes(activePage),
                  isOpen: packingOpen,
                  setIsOpen: setPackingOpen,
                  subPages: allowedPackingPages,
                })}

                {renderSidebarButton(page)}
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={page.key}>
              {page.key === "invoice-data" &&
                renderSideMenuButton({
                  title: "Formula",
                  isActive: formulaPages.includes(activePage),
                  isOpen: formulaOpen,
                  setIsOpen: setFormulaOpen,
                  subPages: allowedFormulaPages,
                })}

              {renderSidebarButton(page)}
            </React.Fragment>
          );
        })}

        <button onClick={handleLogout}>Logout</button>
      </aside>

      <main style={{ flex: 1 }}>
        {CurrentPage ? (
          <CurrentPage currentUser={currentUser} openPage={openPage} />
        ) : null}
      </main>
    </div>
  );
}