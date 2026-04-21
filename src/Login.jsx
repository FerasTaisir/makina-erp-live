import React, { useState } from "react";
import { supabase } from "./lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage(error.message || "Login failed.");
    }

    setLoading(false);
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      setErrorMessage("Please enter your email first.");
      setMessage("");
      return;
    }

    try {
      setResetLoading(true);
      setErrorMessage("");
      setMessage("");

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });

      if (error) {
        setErrorMessage(error.message || "Failed to send reset email.");
      } else {
        setMessage("Check your email to reset password.");
      }
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h2 style={styles.title}>Login</h2>
        <p style={styles.subtitle}>Sign in to MAKINA ERP</p>

        {message ? <div style={styles.success}>{message}</div> : null}
        {errorMessage ? <div style={styles.error}>{errorMessage}</div> : null}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          style={styles.secondaryButton}
          disabled={resetLoading}
        >
          {resetLoading ? "Sending..." : "Forgot Password?"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f3f4f6",
    padding: "20px",
  },
  card: {
    width: "360px",
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  title: {
    margin: 0,
    textAlign: "center",
    color: "#111827",
  },
  subtitle: {
    margin: 0,
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryButton: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
    fontWeight: 700,
  },
  success: {
    background: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
  },
  error: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
  },
};