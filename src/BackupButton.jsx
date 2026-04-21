import React from "react";
import * as XLSX from "xlsx";
import { supabase } from "./lib/supabaseClient";

export default function BackupButton() {
  async function fetchTable(tableName) {
    const { data, error } = await supabase.from(tableName).select("*");

    if (error) {
      throw new Error(`Error exporting ${tableName}: ${error.message}`);
    }

    return data || [];
  }

  async function handleFullBackup() {
    try {
      const tables = [
        { name: "customers", sheet: "Customers" },
        { name: "brands", sheet: "Brands" },
        { name: "brand_customer", sheet: "CustomerBrand" },
        { name: "item_master", sheet: "ItemMaster" },
        { name: "customer_items", sheet: "CustomerItems" },
        { name: "rm", sheet: "RM" },
      ];

      const workbook = XLSX.utils.book_new();

      for (const table of tables) {
        const rows = await fetchTable(table.name);

        const safeRows =
          rows.length > 0
            ? rows
            : [{ Info: `${table.name} is empty` }];

        const worksheet = XLSX.utils.json_to_sheet(safeRows);
        XLSX.utils.book_append_sheet(workbook, worksheet, table.sheet);
      }

      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const filename = `ERP_FULL_BACKUP_${now.getFullYear()}-${pad(
        now.getMonth() + 1
      )}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(
        now.getMinutes()
      )}.xlsx`;

      XLSX.writeFile(workbook, filename);

      alert("Excel backup downloaded successfully ✅");
    } catch (err) {
      console.error(err);
      alert(err.message || "Backup failed ❌");
    }
  }

  return (
    <button
      onClick={handleFullBackup}
      style={{
        width: "100%",
        padding: "12px 14px",
        background: "#16a34a",
        color: "white",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      Download Full Backup
    </button>
  );
}