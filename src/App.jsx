import React, { useState } from "react";
import CustomersPage from "./CustomersPage";
import BrandsPage from "./BrandsPage";
import BrandCustomerPage from "./BrandCustomerPage";
import RMPage from "./RMPage";

function DashboardPage() {
  return (
    <div style={styles.dashboardCard}>
      <h1 style={styles.dashboardTitle}>Dashboard</h1>
      <p style={styles.dashboardText}>Welcome to MAKINA ERP</p>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");

  const renderPage = () => {
    switch (page) {
      case "customers":
        return <CustomersPage />;
      case "brands":
        return <BrandsPage />;
      case "brandCustomer":
        return <BrandCustomerPage />;
      case "items":
        return <ItemsPage />;
      case "rm":
        return <RMPage />;
      case "dashboard":
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div style={styles.app}>
      <aside style={styles.sidebar}>
        <div style={styles.logoWrap}>
          <div style={styles.logo}>MAKINA ERP</div>
        </div>

        <button
          style={page === "dashboard" ? styles.menuActive : styles.menu}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>

        <button
          style={page === "customers" ? styles.menuActive : styles.menu}
          onClick={() => setPage("customers")}
        >
          Customers
        </button>

        <button
          style={page === "brands" ? styles.menuActive : styles.menu}
          onClick={() => setPage("brands")}
        >
          Brands
        </button>

        <button
          style={page === "brandCustomer" ? styles.menuActive : styles.menu}
          onClick={() => setPage("brandCustomer")}
        >
          Brand-Customer
        </button>

        <button
          style={page === "items" ? styles.menuActive : styles.menu}
          onClick={() => setPage("items")}
        >
          Items
        </button>

        <button
          style={page === "rm" ? styles.menuActive : styles.menu}
          onClick={() => setPage("rm")}
        >
          RM
        </button>
      </aside>

      <main style={styles.content}>{renderPage()}</main>
    </div>
  );
}

const styles = {
  app: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    background: "#eef2f7",
  },
  sidebar: {
    width: "220px",
    background: "#041738",
    color: "#fff",
    padding: "12px 0",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  logoWrap: {
    padding: "14px 16px 18px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    marginBottom: "8px",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "700",
    lineHeight: "1.2",
  },
  menu: {
    background: "transparent",
    color: "#fff",
    border: "none",
    textAlign: "left",
    padding: "14px 24px",
    cursor: "pointer",
    fontSize: "16px",
  },
  menuActive: {
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    border: "none",
    textAlign: "left",
    padding: "14px 24px",
    cursor: "pointer",
    fontSize: "16px",
  },
  content: {
    flex: 1,
    padding: "20px",
    boxSizing: "border-box",
    overflow: "auto",
  },
  dashboardCard: {
    background: "#fff",
    border: "1px solid #d9dfeb",
    borderRadius: "12px",
    padding: "28px",
    minHeight: "calc(100vh - 40px)",
    boxSizing: "border-box",
  },
  dashboardTitle: {
    margin: 0,
    fontSize: "36px",
    fontWeight: "700",
  },
  dashboardText: {
    marginTop: "12px",
    color: "#555",
    fontSize: "18px",
  },
};