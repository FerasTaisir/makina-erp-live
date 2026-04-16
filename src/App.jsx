import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";
import useUserRole from "./useUserRole";

import Login from "./Login";
import CustomersPage from "./CustomersPage";
import BrandsPage from "./BrandsPage";
import BrandCustomerPage from "./BrandCustomerPage";
import RMPage from "./RMPage";

function DashboardPage() {
  return <h2>Dashboard</h2>;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const { role, loading } = useUserRole(session?.user?.id || null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoadingSession(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ⛔ لا تعرض أي شيء حتى نتأكد من session
  if (loadingSession) {
    return <div style={{ padding: 30 }}>Loading...</div>;
  }

  // 🔐 إذا لا يوجد session → اجبار login
  if (!session) {
    return <Login />;
  }

  // ⛔ انتظر تحميل role
  if (loading) {
    return <div style={{ padding: 30 }}>Loading role...</div>;
  }

  return (
    <Router>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <div style={{ width: "250px", background: "#071a3a", color: "#fff", padding: "20px" }}>
          <h2>MAKINA ERP</h2>

          <p>User: {session.user.email}</p>
          <p>Role: {role}</p>

          <hr />

          <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link to="/" style={linkStyle}>Dashboard</Link>

            {(role === "admin" || role === "user") && (
              <>
                <Link to="/customers" style={linkStyle}>Customers</Link>
                <Link to="/brands" style={linkStyle}>Brands</Link>
                <Link to="/brand-customer" style={linkStyle}>Brand-Customer</Link>
                <Link to="/rm" style={linkStyle}>RM</Link>
              </>
            )}
          </nav>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setSession(null);
            }}
            style={logoutBtn}
          >
            Logout
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "20px" }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />

            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/brand-customer" element={<BrandCustomerPage />} />
            <Route path="/rm" element={<RMPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  fontSize: "16px",
};

const logoutBtn = {
  marginTop: "20px",
  background: "red",
  color: "#fff",
  padding: "10px",
  border: "none",
  cursor: "pointer",
};