import React from "react";

export default function MainLayout({ sidebar, children }) {
  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>{sidebar}</div>
      <div style={styles.content}>{children}</div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    gap: "20px",
    minHeight: "100vh",
    padding: "20px",
    background: "#f5f7fb",
  },
  sidebar: {
    position: "sticky",
    top: "20px",
    height: "fit-content",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: "150px",
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
};