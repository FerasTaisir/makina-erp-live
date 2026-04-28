import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabaseClient";

import Login from "./Login";
import BackupButton from "./BackupButton";

import BrandCustomerPage from "./BrandCustomerPage";
import BrandsPage from "./BrandsPage";
import CustomersPage from "./CustomersPage";
import FormulaPage from "./FormulaPage";
import InvoiceDataPage from "./InvoiceDataPage";
import InvoicePage from "./InvoicePage";
import PriceOfferPage from "./PriceOfferPage";
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
  { key: "brands", label: "Brands", component: BrandsPage },
  { key: "customers", label: "Customers", component: CustomersPage },
  { key: "brand-customer", label: "Brand-Customer", component: BrandCustomerPage },
  { key: "item-master", label: "Item Master", component: ItemMasterPage },
  { key: "customer-items", label: "Customer Items", component: CustomerItemsPage },
  { key: "formula", label: "Formula", component: FormulaPage },
  { key: "packing-master", label: "Packing Master", component: PackingMasterPage },
  { key: "packing-definitions", label: "Packing Data", component: PackagingDefinitionsPage },
  { key: "packing-brand", label: "Packing Brand", component: PackingBrandPage },
  { key: "packing-store", label: "Packing Store", component: PackingStorePage },
  { key: "pallet-data", label: "Pallet Data", component: PalletDataPage },
  { key: "rm", label: "RM", component: RMPage },
  { key: "invoice-data", label: "Invoice Data", component: InvoiceDataPage },
  { key: "order", label: "Order", component: OrderPage },
  { key: "production-order", label: "Production Order", component: ProductionOrderPage },
  { key: "price-offer", label: "Price Offer", component: PriceOfferPage },
  { key: "invoice", label: "Invoice", component: InvoicePage },
];

export default function App() {
  const [activePage, setActivePage] = useState("formula");
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

  const allowedPages = useMemo(() => {
    if (!currentUser.userId || !currentUser.role) return [];
    if (currentUser.role === "admin") return pages;
    if (currentUser.role === "user") return pages;
    return [];
  }, [currentUser]);

  useEffect(() => {
    if (!allowedPages.some((page) => page.key === activePage)) {
      setActivePage(allowedPages[0]?.key || "formula");
    }
  }, [allowedPages, activePage]);

  const CurrentPage =
    allowedPages.find((page) => page.key === activePage)?.component || null;

  async function handleLogout() {
    await supabase.auth.signOut();
    setRoleRow(null);
    setRoleError("");
  }

  if (authLoading) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.loadingCard}>Loading session...</div>
      </div>
    );
  }

  if (!session) return <Login />;

  if (roleLoading) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.loadingCard}>Checking permissions...</div>
      </div>
    );
  }

  if (roleError) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.errorCard}>
          <div style={styles.errorTitle}>Permission Error</div>
          <div>{roleError}</div>
          <button type="button" onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (!roleRow) {
    return (
      <div style={styles.centerScreen}>
        <div style={styles.errorCard}>
          <div style={styles.errorTitle}>Access Denied</div>
          <div>
            Your account is not allowed to use this app.
            <br />
            Signed in as: {currentUser.email || "-"}
          </div>
          <button type="button" onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appShell}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTitle}>MAKINA ERP</div>

        <div style={styles.userBox}>
          <div style={styles.userEmail}>{currentUser.email}</div>
          <div style={styles.userRole}>
            Role: {currentUser.role} | Delete:{" "}
            {currentUser.canDelete ? "Yes" : "No"}
          </div>
        </div>

        <div style={styles.backupWrap}>
          <BackupButton />
        </div>

        <div style={styles.navList}>
          {allowedPages.map((page) => (
            <button
              key={page.key}
              type="button"
              onClick={() => setActivePage(page.key)}
              style={{
                ...styles.navButton,
                ...(activePage === page.key ? styles.navButtonActive : {}),
              }}
            >
              {page.label}
            </button>
          ))}
        </div>

        <button type="button" onClick={handleLogout} style={styles.logoutBtnFull}>
          Logout
        </button>
      </aside>

      <main style={styles.mainContent}>
        {CurrentPage ? (
          <CurrentPage currentUser={currentUser} openPage={setActivePage} />
        ) : null}
      </main>
    </div>
  );
}

const styles = {
  appShell: {
    display: "flex",
    minHeight: "100vh",
    background: "#e2e8f0",
  },
  sidebar: {
    width: "260px",
    background: "#0f172a",
    color: "#fff",
    padding: "20px 16px",
    boxSizing: "border-box",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
  },
  sidebarTitle: {
    fontSize: "24px",
    fontWeight: 800,
    marginBottom: "20px",
    textAlign: "center",
  },
  userBox: {
    background: "#1e293b",
    borderRadius: "10px",
    padding: "12px",
    marginBottom: "14px",
  },
  userEmail: {
    fontSize: "13px",
    fontWeight: 700,
    wordBreak: "break-word",
    marginBottom: "6px",
  },
  userRole: {
    fontSize: "12px",
    color: "#cbd5e1",
  },
  backupWrap: {
    marginBottom: "14px",
  },
  navList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
  },
  navButton: {
    height: "46px",
    border: "none",
    borderRadius: "10px",
    background: "#1e293b",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "left",
    padding: "0 14px",
  },
  navButtonActive: {
    background: "#1565c0",
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
  },
  centerScreen: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#e2e8f0",
    padding: "20px",
  },
  loadingCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "24px 28px",
    boxShadow: "0 8px 26px rgba(15, 23, 42, 0.08)",
    fontWeight: 700,
    color: "#334155",
  },
  errorCard: {
    background: "#fff",
    borderRadius: "14px",
    padding: "24px 28px",
    boxShadow: "0 8px 26px rgba(15, 23, 42, 0.08)",
    color: "#334155",
    maxWidth: "420px",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#dc2626",
    marginBottom: "12px",
  },
  logoutBtn: {
    marginTop: "16px",
    height: "40px",
    border: "none",
    borderRadius: "10px",
    background: "#dc2626",
    color: "#fff",
    fontWeight: 700,
    padding: "0 18px",
    cursor: "pointer",
  },
  logoutBtnFull: {
    marginTop: "16px",
    height: "44px",
    border: "none",
    borderRadius: "10px",
    background: "#dc2626",
    color: "#fff",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
};