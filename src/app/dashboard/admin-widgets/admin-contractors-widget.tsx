"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

interface Report {
  id: number
  issueType: string
  severity: number
  status: string
  imageUrl?: string
  assignedTo?: string | null
}

interface Contractor {
  id: number
  name: string
  email: string
  city?: string
  company?: string
  isAvailable: boolean
}

export default function AdminContractorsWidget() {
  const [reports, setReports] = useState<Report[]>([])
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState<{ [k: number]: boolean }>({})
  const [error, setError] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [rRes, cRes] = await Promise.all([
        fetch('/api/admin/reports'),
        fetch('/api/admin/contractors')
      ])
      const rJson = await rRes.json()
      const cJson = await cRes.json()
      if (rRes.ok) setReports(rJson.reports || [])
      if (cRes.ok) setContractors(cJson.contractors || [])
    } catch (err) {
      console.error('admin widget fetch error', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleAssign = async (reportId: number, contractorId: number) => {
    setAssigning((s) => ({ ...s, [reportId]: true }))
    setError('')
    try {
      const res = await fetch('/api/admin/reports/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, contractorId })
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Assign failed')
      } else {
        await fetchData()
      }
    } catch (err) {
      console.error(err)
      setError('Assign failed')
    } finally {
      setAssigning((s) => ({ ...s, [reportId]: false }))
    }
  }

  return (
    <div className="admin-contractors-widget">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h3 style={{margin:0}}>Admin Quick Actions</h3>
        <div>
          <Link href="/admin/contractors"><button className="assign-btn">Manage Contractors</button></Link>
          <Link href="/dashboard?tab=upload"><button style={{marginLeft:8}} className="assign-btn">Add Issue</button></Link>
        </div>
      </div>

      {loading ? (
        <div style={{padding:12}}>Loading admin data...</div>
      ) : (
        <div>
          <div style={{marginTop:12}}>
            <strong>Recent Issues</strong>
            {reports.length === 0 && <div className="empty-state">No reports</div>}
            {reports.slice(0,5).map((r) => (
              <div key={r.id} style={{display:'flex',alignItems:'center',gap:8,marginTop:8,padding:8,border:'1px solid #eee',borderRadius:8}}>
                <div style={{flex:1}}>
                  <div><strong>{r.issueType}</strong> — Severity: {r.severity}</div>
                  <div style={{fontSize:12,color:'#666'}}>Status: {r.status} — Assigned: {r.assignedTo || '—'}</div>
                </div>
                <div>
                  <select defaultValue="" aria-label={`assign-${r.id}`}>
                    <option value="">Assign...</option>
                    {contractors.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button onClick={async (e) => {
                    const sel = (e.currentTarget.previousElementSibling as HTMLSelectElement)
                    const val = sel?.value
                    if (!val) { setError('Select contractor'); return }
                    await handleAssign(r.id, parseInt(val))
                  }} disabled={!!assigning[r.id]} style={{marginLeft:8}} className="assign-btn">{assigning[r.id] ? 'Assigning...' : 'Assign'}</button>
                </div>
              </div>
            ))}
          </div>
          {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
        </div>
      )}
    </div>
  )
}
