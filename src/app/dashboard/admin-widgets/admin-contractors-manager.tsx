"use client"

import React, { useEffect, useState } from 'react'

interface Contractor {
  id: number
  name: string
  email: string
  phone: string
  company?: string
  status: string
  isAvailable: boolean
  createdAt: string
}

export default function AdminContractorsManager() {
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', status: 'active', isAvailable: true })
  const [error, setError] = useState('')

  const fetchContractors = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/contractors')
      const json = await res.json()
      if (res.ok) setContractors(json.contractors || [])
    } catch (err) {
      console.error('fetch contractors', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchContractors() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/admin/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to add')
      } else {
        setShowAdd(false)
        setForm({ name: '', email: '', phone: '', status: 'active', isAvailable: true })
        fetchContractors()
      }
    } catch (err) {
      console.error(err)
      setError('Failed to add')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this contractor?')) return
    try {
      const res = await fetch(`/api/admin/contractors?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (res.ok) fetchContractors()
      else setError(json.error || 'Delete failed')
    } catch (err) {
      console.error(err)
      setError('Delete failed')
    }
  }

  return (
    <div className="admin-contractors-manager" style={{background:'white',padding:12,borderRadius:8}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h4 style={{margin:0}}>Contractors</h4>
        <div>
          <button onClick={() => setShowAdd(true)} className="assign-btn">Add Contractor</button>
        </div>
      </div>

      {loading ? <div style={{padding:12}}>Loading...</div> : (
        <table style={{width:'100%',marginTop:12,borderCollapse:'collapse'}}>
          <thead>
            <tr style={{textAlign:'left',borderBottom:'1px solid #eee'}}>
              <th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Available</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contractors.map((c) => (
              <tr key={c.id} style={{borderBottom:'1px solid #fafafa'}}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.status}</td>
                <td>{c.isAvailable ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => handleDelete(c.id)} style={{marginRight:8}} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth:520}}>
            <h3>Add Contractor</h3>
            <form onSubmit={handleAdd}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <input required placeholder="Name" value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} />
                <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})} />
                <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({...form,phone:e.target.value})} />
                <select value={form.status} onChange={(e) => setForm({...form,status:e.target.value})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                <label style={{gridColumn:'1 / -1'}}>
                  <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({...form,isAvailable:e.target.checked})} /> Available
                </label>
              </div>
              {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
              <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
                <button type="button" onClick={() => setShowAdd(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
