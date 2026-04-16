import React, { useEffect, useMemo, useState } from 'react'
import {
  fetchBrands,
  insertBrand,
  updateBrand,
  removeBrand,
  updateBrandOrder,
} from './services/brandsService'

function nextCode(rows = []) {
  const max = rows.reduce((m, r) => {
    const n = parseInt(String(r.brand_code || '').replace(/\D/g, ''), 10)
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)

  return `BR-${String(max + 1).padStart(4, '0')}`
}

function Field({ label, children }) {
  return (
    <div className="brands-field">
      <label className="brands-label">{label}</label>
      {children}
    </div>
  )
}

export default function BrandsPage() {
  const [brands, setBrands] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)

  const selected = useMemo(
    () => brands.find((x) => x.id === selectedId) || null,
    [brands, selectedId]
  )

  const isReadOnly = !selected || editingId !== selectedId

  useEffect(() => {
    loadBrands()
  }, [])

  async function loadBrands() {
    try {
      setLoading(true)
      const rows = await fetchBrands()
      setBrands(rows)
      setSelectedId(rows[0]?.id ?? null)
    } catch (error) {
      console.error('LOAD BRANDS ERROR:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function addBrand() {
    try {
      const maxSortOrder = brands.reduce((max, row) => {
        const value = Number(row.sort_order)
        return Number.isFinite(value) ? Math.max(max, value) : max
      }, 0)

      const newRow = {
        brand_code: nextCode(brands),
        brand_name: '',
        brand_symbol: '',
        notes: '',
        is_active: true,
        sort_order: maxSortOrder + 1,
      }

      const saved = await insertBrand(newRow)
      const nextRows = [saved, ...brands]

      setBrands(nextRows)
      setSelectedId(saved.id)
      setEditingId(saved.id)
    } catch (error) {
      console.error('ADD BRAND ERROR:', error)
      alert(error.message)
    }
  }

  function editBrand() {
    if (!selected) return
    setEditingId(selected.id)
  }

  async function saveBrand() {
    if (!selected) return

    try {
      const updates = {
        brand_name: selected.brand_name || '',
        brand_symbol: selected.brand_symbol || '',
        notes: selected.notes || '',
        is_active: selected.is_active ?? true,
      }

      const saved = await updateBrand(selected.id, updates)

      setBrands((prev) =>
        prev.map((row) => (row.id === saved.id ? { ...row, ...saved } : row))
      )

      setEditingId(null)
      await loadBrands()
    } catch (error) {
      console.error('SAVE BRAND ERROR:', error)
      alert(error.message)
    }
  }

  async function deleteBrand() {
    if (!selected) return

    const ok = window.confirm('Delete this brand?')
    if (!ok) return

    try {
      await removeBrand(selected.id)

      const nextRows = brands.filter((x) => x.id !== selected.id)
      setBrands(nextRows)
      setSelectedId(nextRows[0]?.id ?? null)
      setEditingId(null)
    } catch (error) {
      console.error('DELETE BRAND ERROR:', error)
      alert(error.message)
    }
  }

  async function moveUp() {
    if (!selected) return

    const index = brands.findIndex((b) => b.id === selected.id)
    if (index <= 0) return

    const current = brands[index]
    const above = brands[index - 1]

    try {
      const currentOrder = Number.isFinite(Number(current.sort_order))
        ? Number(current.sort_order)
        : index + 1

      const aboveOrder = Number.isFinite(Number(above.sort_order))
        ? Number(above.sort_order)
        : index

      await updateBrandOrder(current.id, aboveOrder)
      await updateBrandOrder(above.id, currentOrder)

      await loadBrands()
      setSelectedId(current.id)
    } catch (error) {
      console.error('MOVE UP ERROR:', error)
      alert(error.message)
    }
  }

  async function moveDown() {
    if (!selected) return

    const index = brands.findIndex((b) => b.id === selected.id)
    if (index === -1 || index >= brands.length - 1) return

    const current = brands[index]
    const below = brands[index + 1]

    try {
      const currentOrder = Number.isFinite(Number(current.sort_order))
        ? Number(current.sort_order)
        : index + 1

      const belowOrder = Number.isFinite(Number(below.sort_order))
        ? Number(below.sort_order)
        : index + 2

      await updateBrandOrder(current.id, belowOrder)
      await updateBrandOrder(below.id, currentOrder)

      await loadBrands()
      setSelectedId(current.id)
    } catch (error) {
      console.error('MOVE DOWN ERROR:', error)
      alert(error.message)
    }
  }

  function updateSelected(field, value) {
    if (!selected) return

    setBrands((prev) =>
      prev.map((x) => (x.id === selected.id ? { ...x, [field]: value } : x))
    )
  }

  if (loading) {
    return (
      <div className="brands-page">
        <style>{styles}</style>
        Loading brands...
      </div>
    )
  }

  return (
    <div className="brands-page">
      <style>{styles}</style>

      <div className="brands-header">
        <div>
          <h1>Brands</h1>
          <p>Alphabetical by default + manual up/down ordering</p>
        </div>

        <div className="brands-toolbar">
          <button onClick={addBrand}>Add</button>
          <button onClick={editBrand} disabled={!selected}>
            Edit
          </button>
          <button onClick={deleteBrand} disabled={!selected}>
            Delete
          </button>
          <button onClick={moveUp} disabled={!selected}>
            ↑ Up
          </button>
          <button onClick={moveDown} disabled={!selected}>
            ↓ Down
          </button>
          <button
            className="primary"
            onClick={saveBrand}
            disabled={editingId !== selectedId}
          >
            Save
          </button>
        </div>
      </div>

      <div className="brands-layout">
        <div className="brands-main">
          <div className="brands-card">
            <h2>Brand Information</h2>

            <div className="brands-grid">
              <Field label="Brand Code">
                <input
                  value={selected?.brand_code || ''}
                  readOnly
                  className="readonly"
                />
              </Field>

              <Field label="Brand Name">
                <input
                  value={selected?.brand_name || ''}
                  onChange={(e) => updateSelected('brand_name', e.target.value)}
                  readOnly={isReadOnly}
                />
              </Field>

              <Field label="Brand Symbol">
                <input
                  value={selected?.brand_symbol || ''}
                  onChange={(e) =>
                    updateSelected('brand_symbol', e.target.value.toUpperCase())
                  }
                  readOnly={isReadOnly}
                />
              </Field>

              <Field label="Active">
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

        <div className="brands-side">
          <div className="brands-card">
            <h2>Brands List</h2>

            <table className="brands-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((row) => (
                  <tr
                    key={row.id}
                    className={row.id === selectedId ? 'selected' : ''}
                    onClick={() => {
                      setSelectedId(row.id)
                      setEditingId(null)
                    }}
                  >
                    <td>{row.brand_code}</td>
                    <td>{row.brand_name || ''}</td>
                    <td>{row.brand_symbol || ''}</td>
                    <td>{row.is_active ? 'Active' : 'Inactive'}</td>
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
.brands-page {
  color: #111827;
}
.brands-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}
.brands-header h1 {
  margin: 0 0 4px;
  font-size: 32px;
}
.brands-header p {
  margin: 0;
  color: #6b7280;
}
.brands-toolbar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.brands-toolbar button {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  background: white;
  border-radius: 10px;
  cursor: pointer;
}
.brands-toolbar button.primary {
  background: #111827;
  color: white;
}
.brands-layout {
  display: grid;
  grid-template-columns: 1.3fr 0.9fr;
  gap: 16px;
}
.brands-main,
.brands-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.brands-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 14px;
  padding: 16px;
}
.brands-card h2 {
  margin: 0 0 12px;
  font-size: 20px;
}
.brands-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.brands-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
}
.brands-field input,
.brands-field select {
  width: 100%;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: white;
}
.brands-field .readonly {
  background: #f1f5f9;
}
.brands-table {
  width: 100%;
  border-collapse: collapse;
}
.brands-table th,
.brands-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.brands-table th {
  background: #fafafa;
}
.brands-table tr.selected {
  background: #e0e7ff;
}
@media (max-width: 1100px) {
  .brands-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 800px) {
  .brands-grid {
    grid-template-columns: 1fr;
  }
  .brands-header {
    flex-direction: column;
  }
}
`;