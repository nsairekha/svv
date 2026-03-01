'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { usePoints } from '@/contexts/PointsContext';
import Dashboard from '@/app/components/dashboard/dashboard';
import { 
  HiLocationMarker, 
  HiCheckCircle, 
  HiClock, 
  HiExclamation, 
  HiSearch, 
  HiViewGrid, 
  HiMenu, 
  HiUpload,
  HiRefresh
} from 'react-icons/hi';
import './page.css';

interface Job {
  id: number;
  lat: number;
  lng: number;
  imageUrl: string;
  issueType: string;
  severity: number;
  description: string | null;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  distance: number;
  userId: number;
  userName: string;
  userEmail: string;
  resolutionImageUrl?: string | null;
  contractorRemarks?: string | null;
  workDescription?: string | null;
  cost?: number | null;
}

interface ContractorLocation {
  latitude: number;
  longitude: number;
}

export default function ContractorJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshPoints } = usePoints();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [contractorLocation, setContractorLocation] = useState<ContractorLocation | null>(null);
  
  // Controls state
  const [viewType, setViewType] = useState<'card' | 'table'>('card');
  const [filterStatus, setFilterStatus] = useState<string>(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Resolution Form State
  const [resolutionForm, setResolutionForm] = useState({
    workDescription: '',
    contractorRemarks: '',
    cost: '',
    resolutionImageUrl: ''
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'contractor')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'contractor') {
      fetchJobs();
    }
  }, [user, filterStatus, priority, category, sortBy, sortOrder]);

  // Sync state with URL search params (Fix for dashboard navigation)
  useEffect(() => {
    const status = searchParams.get('status');
    const prio = searchParams.get('priority');
    
    if (status && status !== filterStatus) {
      setFilterStatus(status);
      setCurrentPage(1); // Reset to first page on filter change
    }
    
    if (prio && prio !== priority) {
      setPriority(prio);
      setCurrentPage(1);
    }
  }, [searchParams]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = new URLSearchParams({
        status: filterStatus,
        priority: priority,
        category: category,
        search: searchQuery,
        sortBy: sortBy,
        sortOrder: sortOrder
      });

      const response = await fetch(`/api/contractor/jobs?${queryParams.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs || []);
        setContractorLocation(data.contractorLocation);
      } else {
        setError(data.error || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Failed to fetch jobs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleAcceptJob = async (jobId: number) => {
    try {
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/contractor/jobs/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Job accepted successfully!');
        fetchJobs();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to accept job');
      }
    } catch (err) {
      setError('Failed to accept job');
      console.error(err);
    }
  };

  const handleStartJob = async (jobId: number) => {
    try {
      setError('');
      setSuccess('');
      // Per workflow: clicking Start on an assigned issue should directly mark it completed
      // to match requested UX (Assigned -> Start -> Completed). We call the complete endpoint
      // with a minimal workDescription so backend marks it as resolved.
      const response = await fetch('/api/contractor/jobs/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, workDescription: 'Auto-completed via Start action' }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Job marked completed via Start action');
        // Update local state: mark job as resolved
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'resolved' } : j));
        setFilterStatus('resolved');
        fetchJobs();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to start work');
      }
    } catch (err) {
      setError('Failed to start work');
      console.error(err);
    }
  };

  const handleCompleteJob = async (jobId: number) => {
    if (!resolutionForm.workDescription) {
      setError('Please provide a work description');
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/contractor/jobs/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          jobId,
          ...resolutionForm
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Job marked as completed!');
        fetchJobs();
        setShowDetailsModal(false);
        await refreshPoints();
        setResolutionForm({
          workDescription: '',
          contractorRemarks: '',
          cost: '',
          resolutionImageUrl: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to complete job');
      }
    } catch (err) {
      setError('Failed to complete job');
      console.error(err);
    }
  };

  const handleReopenJob = async (jobId: number) => {
    try {
      setError('');
      setSuccess('');
      const response = await fetch('/api/contractor/jobs/reopen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Job reopened');
        // Update local state to reopened
        setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'reopened' } : j));
        fetchJobs();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to reopen job');
      }
    } catch (err) {
      setError('Failed to reopen job');
      console.error(err);
    }
  };

  const openJobDetails = (job: Job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
    setError('');
    setSuccess('');
    
    // Pre-fill form if already resolved
    if (job.status === 'resolved') {
      setResolutionForm({
        workDescription: job.workDescription || '',
        contractorRemarks: job.contractorRemarks || '',
        cost: job.cost?.toString() || '',
        resolutionImageUrl: job.resolutionImageUrl || ''
      });
    } else {
      setResolutionForm({
        workDescription: '',
        contractorRemarks: '',
        cost: '',
        resolutionImageUrl: ''
      });
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 0.7) return 'high';
    if (severity >= 0.4) return 'medium';
    return 'low';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge status-pending"><HiClock /> Pending</span>;
      case 'assigned':
        return <span className="status-badge status-assigned"><HiExclamation /> Assigned</span>;
      case 'in_progress':
        return <span className="status-badge status-progress"><HiRefresh className="animate-spin" /> In Progress</span>;
      case 'resolved':
        return <span className="status-badge status-resolved"><HiCheckCircle /> Resolved</span>;
      default:
        return <span className="status-badge">{status.replace('_', ' ')}</span>;
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentJobs = jobs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(jobs.length / itemsPerPage);

  if (authLoading || (user && user.role !== 'contractor')) {
    return null;
  }

  const controlsContent = (
    <div className="jobs-controls">
      <form onSubmit={handleSearch} className="search-section">
        <div className="search-input-wrapper">
          <HiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by ID, title, or location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-search">Search</button>
      </form>

      <div className="filters-section">
        <div className="filter-group">
          <label>Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Available (Pending)</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="road">Road</option>
            <option value="water">Water</option>
            <option value="electricity">Electricity</option>
            <option value="waste">Waste</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Date Reported</option>
            <option value="severity">Priority</option>
            <option value="distance">Distance</option>
          </select>
        </div>
        <div className="view-toggle">
          <button 
            className={`view-btn ${viewType === 'card' ? 'active' : ''}`}
            onClick={() => setViewType('card')}
            title="Card View"
          >
            <HiViewGrid />
          </button>
          <button 
            className={`view-btn ${viewType === 'table' ? 'active' : ''}`}
            onClick={() => setViewType('table')}
            title="Table View"
          >
            <HiMenu />
          </button>
        </div>
      </div>
    </div>
  );

  const jobsContent = (
    <div className="contractor-jobs-page animate-fade-in">
      <div className="jobs-header mb-8">
        <div>
          <h1 className="text-4xl font-black text-gradient">Field Operations</h1>
          <p className="text-secondary mt-2 text-lg">
            Operational connectivity: <span className="font-bold text-indigo-500">Global</span> (All reports)
            {contractorLocation && (
              <span className="ml-3 glass-card px-3 py-1 rounded-full text-sm font-medium">
                <HiLocationMarker className="inline mr-1 text-indigo-500" /> 
                {contractorLocation.latitude.toFixed(4)}, {contractorLocation.longitude.toFixed(4)}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="glass-card jobs-controls-wrapper rounded-3xl mb-8 p-1">
        {controlsContent}
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="jobs-container">
        {loading ? (
          <div className="loading-state">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <HiLocationMarker className="empty-icon" />
            <p>No jobs found matching your criteria</p>
          </div>
        ) : viewType === 'card' ? (
          <div className="jobs-grid">
            {currentJobs.map((job) => (
              <div key={job.id} className="job-card glass-card hover-lift">
                <div className="job-image">
                  <img src={job.imageUrl} alt={job.issueType} />
                  <div className={`severity-badge severity-${getSeverityColor(job.severity)}`}>
                    {(job.severity * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="job-content">
                  <div className="job-header-row">
                    <span className="job-id">#{job.id}</span>
                    <h3 className="job-title-text">
                      {job.issueType.charAt(0).toUpperCase() + job.issueType.slice(1).replace('_', ' ')}
                    </h3>
                  </div>
                  <div className="job-status-row">
                    {getStatusBadge(job.status)}
                  </div>
                  <p className="job-description">
                    {job.description || 'No description provided'}
                  </p>
                  <div className="job-meta">
                    <div className="meta-item">
                      <HiLocationMarker className="meta-icon" />
                      <span>{job.distance.toFixed(2)} km</span>
                    </div>
                    <div className="meta-item">
                      <HiClock className="meta-icon" />
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="job-actions">
                    <button onClick={() => openJobDetails(job)} className="btn-view">Details</button>
                    {job.status === 'pending' && (
                      <button onClick={() => handleAcceptJob(job.id)} className="btn-accept">Accept</button>
                    )}
                    {job.status === 'assigned' && (
                      <button onClick={() => handleStartJob(job.id)} className="btn-start">Start Work</button>
                    )}
                    {job.status === 'in_progress' && (
                      <button onClick={() => handleCompleteJob(job.id)} className="btn-complete">Resolve</button>
                    )}
                    {job.status === 'resolved' && (
                      <button onClick={() => handleReopenJob(job.id)} className="btn-reopen">Reopen</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Issue Type</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Date</th>
                  <th>Distance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentJobs.map((job) => (
                  <tr key={job.id}>
                    <td>#{job.id}</td>
                    <td>{job.issueType.replace('_', ' ')}</td>
                    <td>{getStatusBadge(job.status)}</td>
                    <td>
                      <span className={`severity-tag severity-${getSeverityColor(job.severity)}`}>
                        {getSeverityColor(job.severity).toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td>{job.distance.toFixed(1)} km</td>
                    <td>
                      <div className="table-actions">
                        <button onClick={() => openJobDetails(job)} className="action-icon-btn" title="View Details"><HiMenu /></button>
                        {job.status === 'pending' && (
                          <button onClick={() => handleAcceptJob(job.id)} className="action-icon-btn btn-accept" title="Accept Job"><HiCheckCircle /></button>
                        )}
                        {job.status === 'assigned' && (
                          <button onClick={() => handleStartJob(job.id)} className="action-icon-btn btn-start" title="Start Work"><HiRefresh /></button>
                        )}
                        {job.status === 'in_progress' && (
                          <button onClick={() => handleCompleteJob(job.id)} className="action-icon-btn btn-complete" title="Resolve Job"><HiCheckCircle /></button>
                        )}
                        {job.status === 'resolved' && (
                          <button onClick={() => handleReopenJob(job.id)} className="action-icon-btn btn-reopen" title="Reopen Job">↺</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {jobs.length > itemsPerPage && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, jobs.length)} of {jobs.length} items
          </div>
          <div className="pagination-controls">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </button>
            <span className="page-number">Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </button>
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="items-per-page"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      )}

      {/* Job Details Modal - Keeping it simple for now, but adding placeholders for new fields */}
      {showDetailsModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content job-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Job Details - #{selectedJob.id}</h2>
            <div className="job-details">
              <div className="detail-image">
                <label className="image-label">Before Work</label>
                <img src={selectedJob.imageUrl} alt="Before" />
              </div>
              <div className="detail-info">
                <div className="detail-row">
                  <span className="detail-label">Issue Type</span>
                  <span className="detail-value">{selectedJob.issueType.replace('_', ' ')}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status</span>
                  {getStatusBadge(selectedJob.status)}
                </div>
                <div className="detail-row">
                  <span className="detail-label">Priority</span>
                  <span className={`severity-text severity-${getSeverityColor(selectedJob.severity)}`}>
                    {getSeverityColor(selectedJob.severity).toUpperCase()} ({(selectedJob.severity * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Reported By</span>
                  <span className="detail-value">{selectedJob.userName}</span>
                </div>
                <div className="detail-row full-width">
                  <span className="detail-label">Description</span>
                  <p className="detail-description">{selectedJob.description || "No description provided"}</p>
                </div>
              </div>
            </div>

            {selectedJob.status === 'in_progress' && (
              <div className="resolution-section">
                <hr />
                <h3 className="section-subtitle">Work Resolution</h3>
                <div className="resolution-form">
                  <div className="form-group full-width">
                    <label>Work Description *</label>
                    <textarea 
                      placeholder="Describe the work done in detail..." 
                      rows={3}
                      value={resolutionForm.workDescription}
                      onChange={(e) => setResolutionForm({...resolutionForm, workDescription: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Contractor Remarks</label>
                    <input 
                      type="text" 
                      placeholder="Additional remarks..." 
                      value={resolutionForm.contractorRemarks}
                      onChange={(e) => setResolutionForm({...resolutionForm, contractorRemarks: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cost Estimation (Optional)</label>
                    <div className="input-with-prefix">
                      <span>₹</span>
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        value={resolutionForm.cost}
                        onChange={(e) => setResolutionForm({...resolutionForm, cost: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Resolution Image URL</label>
                    <div className="search-input-wrapper">
                      <HiUpload className="search-icon" />
                      <input 
                        type="text" 
                        placeholder="Enter URL for resolution image (after fix)..." 
                        value={resolutionForm.resolutionImageUrl}
                        onChange={(e) => setResolutionForm({...resolutionForm, resolutionImageUrl: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedJob.status === 'resolved' && (
              <div className="resolution-section">
                <hr />
                <h3 className="section-subtitle">Resolution Details</h3>
                <div className="job-details">
                  <div className="detail-image">
                    <label className="image-label">After Work</label>
                    {selectedJob.resolutionImageUrl ? (
                      <img src={selectedJob.resolutionImageUrl} alt="After" />
                    ) : (
                      <div className="upload-placeholder">No after image provided</div>
                    )}
                  </div>
                  <div className="detail-info">
                    <div className="detail-row">
                      <span className="detail-label">Work Description</span>
                      <p className="detail-description">{selectedJob.workDescription}</p>
                    </div>
                    {selectedJob.contractorRemarks && (
                      <div className="detail-row">
                        <span className="detail-label">Remarks</span>
                        <span className="detail-value">{selectedJob.contractorRemarks}</span>
                      </div>
                    )}
                    {selectedJob.cost && (
                      <div className="detail-row">
                        <span className="detail-label">Total Cost</span>
                        <span className="detail-value">₹ {selectedJob.cost.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowDetailsModal(false);
                  setResolutionForm({
                    workDescription: '',
                    contractorRemarks: '',
                    cost: '',
                    resolutionImageUrl: ''
                  });
                }} 
                className="cancel-btn"
              >
                Close
              </button>
              {selectedJob.status === 'pending' && (
                <button onClick={() => { handleAcceptJob(selectedJob.id); setShowDetailsModal(false); }} className="submit-btn btn-accept">Accept Job</button>
              )}
              {selectedJob.status === 'assigned' && (
                <button onClick={() => { handleStartJob(selectedJob.id); setShowDetailsModal(false); }} className="submit-btn btn-start">Start Work</button>
              )}
              {selectedJob.status === 'in_progress' && (
                <button onClick={() => handleCompleteJob(selectedJob.id)} className="submit-btn btn-complete">Submit Resolution</button>
              )}
              {selectedJob.status === 'resolved' && (
                <button onClick={() => { handleReopenJob(selectedJob.id); setShowDetailsModal(false); }} className="submit-btn btn-reopen">Reopen</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return <Dashboard role={user?.role || 'contractor'}>{jobsContent}</Dashboard>;
}
