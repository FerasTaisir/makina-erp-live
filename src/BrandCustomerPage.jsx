import React, { useEffect, useMemo, useState } from 'react'
import {
  fetchBrandCustomers,
  fetchBrandsLookup,
  fetchCustomersLookup,
  insertBrandCustomer,
  updateBrandCustomer,
  removeBrandCustomer,
} from './services/brandCustomersService'

function nextCode(rows = []) {
  const max = rows.reduce((m, r) => {
    const n = parseInt(String(r.bc_code || '').replace(/\D/g, ''), 10)
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)

  return `BC-${String(max + 1).padStart(4, '0')}`
}

function Field({ label, children }) {
  return (
    <div className="bc-field">
      <label className="bc-label">{label}</label>
      {children}
    </div>
  )
}

export default function BrandCustomerPage() {
  const [rows, setRows] = useState([])
  const [brands, setBrands] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)

  const selected = useMemo(
    () => rows.find((x) => String(x.id) === String(selectedId)) || null,
    [rows, selectedId]
  )

  const isReadOnly = !selected || String(editingId) !== String(selectedId)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    try {
      setLoading(true)

      const [bcRows, brandRows, customerRows] = await Promise.all([
        fetchBrandCustomers(),
        fetchBrandsLookup(),
        fetchCustomersLookup(),
      ])

      setRows(bcRows || [])
      setBrands(brandRows || [])
      setCustomers(customerRows || [])
      setSelectedId(bcRows?.[0]?.id ?? null)
    } catch (error) {
      console.error('LOAD BRAND-CUSTOMERS ERROR:', error)
      alert(error.message || 'Failed to load Brand-Customer page.')
    } finally {
      setLoading(false)
    }
  }

  function addRow() {
    const tempId = `temp-${Date.now()}`

    const newRow = {
      id: tempId,
      bc_code: nextCode(rows),
      brand_id: '',
      customer_id: '',
      status: 'active',
      notes: '',
      is_active: true,
      brands: null,
      customers: null,
      __isNew: true,
    }

    setRows((prev) => [newRow, ...prev])
    setSelectedId(tempId)
    setEditingId(tempId)
  }

  function editRow() {
    if (!selected) return
    setEditingId(selected.id)
  }

  async function saveRow() {
    if (!selected) return

    if (!selected.brand_id) {
      alert('Please select a brand.')
      return
    }

    if (!selected.customer_id) {
      alert('Please select a customer.')
      return
    }

    try {
      const payload = {
        bc_code: selected.bc_code,
        brand_id: selected.brand_id,
        customer_id: selected.customer_id,
        status: selected.status || 'active',
        notes: selected.notes || '',
        is_active: selected.is_active ?? true,
      }

      if (selected.__isNew) {
        const saved = await insertBrandCustomer(payload)
        setRows((prev) =>
          prev.map((row) =>
            String(row.id) === String(selected.id) ? saved : row
          )
        )
        setSelectedId(saved.id)
      } else {
        const saved = await updateBrandCustomer(selected.id, payload)
        setRows((prev) =>
          prev.map((row) =>
            String(row.id) === String(saved.id) ? saved : row
          )
        )
        setSelectedId(saved.id)
      }

      setEditingId(null)
      await loadAll()
    } catch (error) {
      console.error('SAVE BRAND-CUSTOMER ERROR:', error)
      alert(error.message || 'Failed to save Brand-Customer.')
    }
  }

  async function deleteRow() {
    if (!selected) return

    const ok = window.confirm('Delete this Brand-Customer record?')
    if (!ok) return

    try {
      if (selected.__isNew) {
        const nextRows = rows.filter((x) => String(x.id) !== String(selected.id))
        setRows(nextRows)
        setSelectedId(nextRows[0]?.id ?? null)
        setEditingId(null)
        return
      }

      await removeBrandCustomer(selected.id)

      const nextRows = rows.filter((x) => String(x.id) !== String(selected.id))
      setRows(nextRows)
      setSelectedId(nextRows[0]?.id ?? null)
      setEditingId(null)
    } catch (error) {
      console.error('DELETE BRAND-CUSTOMER ERROR:', error)
      alert(error.message || 'Failed to delete Brand-Customer.')
    }
  }

  function updateSelected(field, value) {
    if (!selected) return

    setRows((prev) =>
      prev.map((x) => {
        if (String(x.id) !== String(selected.id)) return x

        const updated = { ...x, [field]: value }

        if (field === 'brand_id') {
          const brand = brands.find((b) => String(b.id) === String(value))
          updated.brands = brand || null
        }

        if (field === 'customer_id') {
          const customer = customers.find((c) => String(c.id) === String(value))
          updated.customers = customer || null
        }

        return updated
      })
    )
  }

  if (loading) {
    return (
      <div className="bc-page">
        <style>{styles}</style>
        Loading Brand-Customer...
      </div>
    )
  }

  return (
    <div className="bc-page">
      <style>{styles}</style>

      <div className="bc-header">
        <div>
          <h1>Brand-Customer</h1>
          <p>Core entity linking Brands and Customers</p>
        </div>

        <div className="bc-toolbar">
          <button onClick={addRow}>Add</button>
          <button onClick={editRow} disabled={!selected}>
            Edit
          </button>
          <button onClick={deleteRow} disabled={!selected}>
            Delete
          </button>
          <button
            className="primary"
            onClick={saveRow}
            disabled={String(editingId) !== String(selectedId)}
          >
            Save
          </button>
        </div>
      </div>

      <div className="bc-layout">
        <div className="bc-main">
          <div className="bc-card">
            <h2>Brand-Customer Information</h2>

            <div className="bc-grid">
              <Field label="BC Code">
                <input
                  value={selected?.bc_code || ''}
                  readOnly
                  className="readonly"
                />
              </Field>

              <Field label="Brand">
                <select
                  value={selected?.brand_id ?? ''}
                  onChange={(e) => updateSelected('brand_id', e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="">Select brand...</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.brand_code} - {brand.brand_name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Customer">
                <select
                  value={selected?.customer_id ?? ''}
                  onChange={(e) => updateSelected('customer_id', e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="">Select customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customer_code} - {customer.customer_name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Brand Symbol">
                <input
                  value={selected?.brands?.brand_symbol || ''}
                  readOnly
                  className="readonly"
                />
              </Field>

              <Field label="Status">
                <select
                  value={selected?.status || 'active'}
                  onChange={(e) => updateSelected('status', e.target.value)}
                  disabled={isReadOnly}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </Field>

              <Field label="Is Active">
                <select
                  value={selected?.is_active ? 'true' : 'false'}
                  onChange={(e) =>
                    updateSelected('is_active', e.target.value === 'true')
                  }
                  disabled={isReadOnly}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </Field>

              <Field label="Notes">
                <input
                  value={selected?.notes || ''}
                  onChange={(e) => updateSelected('notes', e.target.value)}
                  readOnly={isReadOnly}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="bc-side">
          <div className="bc-card">
            <h2>Brand-Customer List</h2>

            <table className="bc-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Brand</th>
                  <th>Customer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className={String(row.id) === String(selectedId) ? 'selected' : ''}
                    onClick={() => {
                      setSelectedId(row.id)
                      setEditingId(null)
                    }}
                  >
                    <td>{row.bc_code}</td>
                    <td>{row.brands?.brand_name || ''}</td>
                    <td>{row.customers?.customer_name || ''}</td>
                    <td>{row.status || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = `
.bc-page {
  color: #111827;
}
.bc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}
.bc-header h1 {
  margin: 0 0 4px;
  font-size: 32px;
}
.bc-header p {
  margin: 0;
  color: #6b7280;
}
.bc-toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.bc-toolbar button {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  background: white;
  border-radius: 10px;
  cursor: pointer;
}
.bc-toolbar button.primary {
  background: #111827;
  color: white;
}
.bc-layout {
  display: grid;
  grid-template-columns: 1.3fr 0.9fr;
  gap: 16px;
}
.bc-main,
.bc-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.bc-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 14px;
  padding: 16px;
}
.bc-card h2 {
  margin: 0 0 12px;
  font-size: 20px;
}
.bc-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.bc-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
}
.bc-field input,
.bc-field select {
  width: 100%;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: white;
}
.bc-field .readonly {
  background: #f1f5f9;
}
.bc-table {
  width: 100%;
  border-collapse: collapse;
}
.bc-table th,
.bc-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.bc-table th {
  background: #fafafa;
}
.bc-table tr.selected {
  background: #e0e7ff;
}
@media (max-width: 1100px) {
  .bc-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 800px) {
  .bc-grid {
    grid-template-columns: 1fr;
  }
  .bc-header {
    flex-direction: column;
  }
}
`;