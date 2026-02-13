'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/app/components/dashboard/dashboard';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiFilter } from 'react-icons/hi';
import './page.css';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Filler,
  TooltipItem,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Filler);

interface Contractor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  company?: string;
  status: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  active: number;
  available: number;
  suspended: number;
}

export default function ContractorsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, available: 0, suspended: 0 });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<Contractor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [gettingLocation, setGettingLocation] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    latitude: '',
    longitude: '',
    status: 'active',
    isAvailable: true,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const statusCounts = useMemo(() => {
    // Aggregate contractors by status for the status doughnut chart.
    const counts = { active: 0, inactive: 0, suspended: 0, other: 0 };
    contractors.forEach((contractor) => {
      const statusKey = contractor.status?.toLowerCase() as keyof typeof counts | undefined;
      if (statusKey && statusKey in counts) {
        counts[statusKey] += 1;
      } else {
        counts.other += 1;
      }
    });
    return counts;
  }, [contractors]);

  const availabilityCounts = useMemo(() => {
    return contractors.reduce(
      (acc, contractor) => {
        if (contractor.isAvailable) {
          acc.available += 1;
        } else {
          acc.unavailable += 1;
        }
        return acc;
      },
      { available: 0, unavailable: 0 }
    );
  }, [contractors]);

  const monthlyRegistrations = useMemo(() => {
    // Track new contractor onboarding across the last six months.
    const now = new Date();
    type MonthlyBucket = { key: string; label: string; count: number };
    const buckets: MonthlyBucket[] = [];

    for (let i = 5; i >= 0; i -= 1) {
      const bucketDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${bucketDate.getFullYear()}-${bucketDate.getMonth()}`;
      const monthLabel = bucketDate.toLocaleString(undefined, { month: 'short' });
      const yearLabel = String(bucketDate.getFullYear()).slice(-2);
      buckets.push({ key, label: `${monthLabel} '${yearLabel}`, count: 0 });
    }

    const lookup = new Map(buckets.map((bucket, index) => [bucket.key, index]));

    contractors.forEach((contractor) => {
      const created = new Date(contractor.createdAt);
      const createdKey = `${created.getFullYear()}-${created.getMonth()}`;
      const bucketIndex = lookup.get(createdKey);
      if (bucketIndex !== undefined) {
        buckets[bucketIndex].count += 1;
      }
    });

    return buckets;
  }, [contractors]);

  const topPerformers = useMemo(() => {
    return contractors
      .map((contractor) => {
        const completionRate = contractor.totalJobs > 0
          ? Math.round((contractor.completedJobs / contractor.totalJobs) * 100)
          : 0;
        return {
          name: contractor.name,
          completionRate,
        };
      })
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5);
  }, [contractors]);

  const averageCompletionRate = useMemo(() => {
    if (contractors.length === 0) return 0;
    const totals = contractors.reduce(
      (acc, contractor) => {
        acc.assigned += contractor.totalJobs || 0;
        acc.completed += contractor.completedJobs || 0;
        return acc;
      },
      { assigned: 0, completed: 0 }
    );

    if (totals.assigned === 0) return 0;
    return Math.round((totals.completed / totals.assigned) * 100);
  }, [contractors]);

  const recentOnboardingTotal = useMemo(
    () => monthlyRegistrations.reduce((sum, bucket) => sum + bucket.count, 0),
    [monthlyRegistrations]
  );

  const newThisMonth = monthlyRegistrations.length
    ? monthlyRegistrations[monthlyRegistrations.length - 1].count
    : 0;

  const totalAvailability = availabilityCounts.available + availabilityCounts.unavailable;
  const availabilityPercent = totalAvailability
    ? Math.round((availabilityCounts.available / totalAvailability) * 100)
    : 0;

  const statusChartData = useMemo(() => {
    const labels = ['Active', 'Inactive', 'Suspended'];
    const values = [statusCounts.active, statusCounts.inactive, statusCounts.suspended];

    if (statusCounts.other > 0) {
      labels.push('Other');
      values.push(statusCounts.other);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Contractors',
          data: values,
          backgroundColor: ['#34d399', '#fbbf24', '#f87171', '#94a3b8'],
          hoverOffset: 10,
        },
      ],
    };
  }, [statusCounts]);

  const statusChartOptions = useMemo(
    () => ({
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            usePointStyle: true,
            color: '#e2e8f0',
          },
        },
      },
      animation: {
        duration: 1200,
        easing: 'easeOutQuart' as const,
      },
      maintainAspectRatio: false,
    }),
    []
  );

  const availabilityChartData = useMemo(() => ({
    labels: ['Available', 'Unavailable'],
    datasets: [
      {
        label: 'Contractors',
        data: [availabilityCounts.available, availabilityCounts.unavailable],
        backgroundColor: ['rgba(59, 130, 246, 0.75)', 'rgba(239, 68, 68, 0.75)'],
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  }), [availabilityCounts]);

  const availabilityChartOptions = useMemo(
    () => ({
      indexAxis: 'x' as const,
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: 'easeOutQuint' as const,
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#e2e8f0',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: '#e2e8f0',
          },
          grid: {
            color: 'rgba(226, 232, 240, 0.2)',
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    }),
    []
  );

  const onboardingChartData = useMemo(
    () => ({
      labels: monthlyRegistrations.map((bucket) => bucket.label),
      datasets: [
        {
          label: 'New Contractors',
          data: monthlyRegistrations.map((bucket) => bucket.count),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          tension: 0.4,
          pointRadius: 4,
          fill: true,
        },
      ],
    }),
    [monthlyRegistrations]
  );

  const onboardingChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1400,
        easing: 'easeInOutQuart' as const,
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(99, 102, 241, 0.05)',
          },
          ticks: {
            color: '#e2e8f0',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: '#e2e8f0',
          },
          grid: {
            color: 'rgba(226, 232, 240, 0.15)',
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    }),
    []
  );

  const topPerformersChartData = useMemo(
    () => ({
      labels: topPerformers.map((performer) => performer.name),
      datasets: [
        {
          label: 'Completion Rate (%)',
          data: topPerformers.map((performer) => performer.completionRate),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    }),
    [topPerformers]
  );

  const topPerformersChartOptions = useMemo(
    () => ({
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: 'easeOutCubic' as const,
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value: string | number) => `${value}%`,
            color: '#e2e8f0',
          },
          grid: {
            color: 'rgba(226, 232, 240, 0.2)',
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            color: '#e2e8f0',
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'bar'>) => `${context.parsed.x}% complete`,
          },
        },
      },
    }),
    []
  );

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'super_admin' && user.role !== 'admin'))) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && (user.role === 'super_admin' || user.role === 'admin')) {
      fetchContractors();
    }
  }, [user]);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        });
        setGettingLocation(false);
        setSuccess('Location captured successfully!');
        setTimeout(() => setSuccess(''), 3000);
      },
      (error) => {
        setError('Unable to retrieve your location. Please enter manually.');
        setGettingLocation(false);
        console.error('Geolocation error:', error);
      }
    );
  };

  const fetchContractors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/contractors');
      const data = await response.json();

      if (response.ok) {
        setContractors(data.contractors);
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch contractors');
      }
    } catch (err) {
      setError('Failed to fetch contractors');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Contractor added successfully!');
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          latitude: '',
          longitude: '',
          status: 'active',
          isAvailable: true,
        });
        fetchContractors();
      } else {
        setError(data.error || 'Failed to add contractor');
      }
    } catch (err) {
      setError('Failed to add contractor');
      console.error(err);
    }
  };

  const handleEditContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedContractor) return;

    try {
      const response = await fetch('/api/admin/contractors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedContractor.id, ...formData }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Contractor updated successfully!');
        setShowEditModal(false);
        setSelectedContractor(null);
        fetchContractors();
      } else {
        setError(data.error || 'Failed to update contractor');
      }
    } catch (err) {
      setError('Failed to update contractor');
      console.error(err);
    }
  };

  const handleDeleteContractor = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contractor?')) return;

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/contractors?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Contractor deleted successfully!');
        fetchContractors();
      } else {
        setError(data.error || 'Failed to delete contractor');
      }
    } catch (err) {
      setError('Failed to delete contractor');
      console.error(err);
    }
  };

  const openEditModal = (contractor: Contractor) => {
    setSelectedContractor(contractor);
    setFormData({
      name: contractor.name,
      email: contractor.email,
      phone: contractor.phone,
      latitude: contractor.latitude?.toString() || '',
      longitude: contractor.longitude?.toString() || '',
      status: contractor.status,
      isAvailable: contractor.isAvailable,
    });
    setShowEditModal(true);
    setError('');
    setSuccess('');
  };

  const filteredContractors = contractors.filter((contractor) => {
    const matchesSearch =
      contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || contractor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || (user && user.role !== 'super_admin' && user.role !== 'admin')) {
    return null;
  }

  const contractorContent = (
    <div className="contractors-page">
      <div className="contractors-header">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contractor Management</h1>
          <p className="text-gray-600 mt-2">Manage contractors and assign them to civic issues</p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setError('');
            setSuccess('');
          }}
          className="add-contractor-btn"
        >
          <HiPlus className="mr-2" />
          Add Contractor
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Contractors</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value text-green-600">{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Available</div>
          <div className="stat-value text-blue-600">{stats.available}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Suspended</div>
          <div className="stat-value text-red-600">{stats.suspended}</div>
        </div>
      </div>

      {/* Analytics */}
      <div className="analytics-section">
        <div className="analytics-header">
          <div>
            <h2 className="analytics-title">Super Admin Analytics</h2>
            <p className="analytics-subtitle">Understand contractor availability and performance in seconds</p>
          </div>
        </div>
        <div className="analytics-metrics">
          <div className="analytics-metric">
            <span className="metric-label">Average Completion Rate</span>
            <span className="metric-value">{averageCompletionRate}%</span>
            <span className="metric-footnote">Across {stats.total} contractors</span>
          </div>
          <div className="analytics-metric">
            <span className="metric-label">Available Right Now</span>
            <span className="metric-value">{availabilityCounts.available}</span>
            <span className="metric-footnote">{availabilityPercent}% of your workforce</span>
          </div>
          <div className="analytics-metric">
            <span className="metric-label">New This Month</span>
            <span className="metric-value">{newThisMonth}</span>
            <span className="metric-footnote">{recentOnboardingTotal} joined in 6 months</span>
          </div>
        </div>
        <div className="chart-grid">
          <div className="chart-card">
            <h3 className="chart-title">Status Distribution</h3>
            <p className="chart-subtitle">Live view of contractor status spread</p>
            <div className="chart-wrapper">
              {contractors.length === 0 ? (
                <div className="chart-empty">No contractor data available yet</div>
              ) : (
                <Doughnut data={statusChartData} options={statusChartOptions} />
              )}
            </div>
          </div>
          <div className="chart-card">
            <h3 className="chart-title">Availability Snapshot</h3>
            <p className="chart-subtitle">Monitor ready-to-dispatch capacity</p>
            <div className="chart-wrapper">
              {contractors.length === 0 ? (
                <div className="chart-empty">No availability data to display</div>
              ) : (
                <Bar data={availabilityChartData} options={availabilityChartOptions} />
              )}
            </div>
          </div>
          <div className="chart-card chart-card-wide">
            <h3 className="chart-title">Onboarding Trend</h3>
            <p className="chart-subtitle">Track new contractor growth over time</p>
            <div className="chart-wrapper">
              {monthlyRegistrations.every((bucket) => bucket.count === 0) ? (
                <div className="chart-empty">No onboarding activity recorded for this period</div>
              ) : (
                <Line data={onboardingChartData} options={onboardingChartOptions} />
              )}
            </div>
          </div>
          <div className="chart-card chart-card-wide">
            <h3 className="chart-title">Top Performers</h3>
            <p className="chart-subtitle">Highest completion rates across the team</p>
            <div className="chart-wrapper">
              {topPerformers.length === 0 ? (
                <div className="chart-empty">Assign jobs to contractors to unlock insights</div>
              ) : (
                <Bar data={topPerformersChartData} options={topPerformersChartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <HiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search contractors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">
          <HiFilter className="filter-icon" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Contractors Table */}
      <div className="contractors-table-container">
        {loading ? (
          <div className="loading-state">Loading contractors...</div>
        ) : filteredContractors.length === 0 ? (
          <div className="empty-state">No contractors found</div>
        ) : (
          <table className="contractors-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Jobs</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContractors.map((contractor) => (
                <tr key={contractor.id}>
                  <td className="font-medium">{contractor.name}</td>
                  <td>{contractor.email}</td>
                  <td>{contractor.phone}</td>
                  <td>{contractor.company || 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-${contractor.status}`}>
                      {contractor.status}
                    </span>
                  </td>
                  <td>
                    <div className="rating">
                      ⭐ {contractor.rating?.toFixed(1) || '0.0'}
                    </div>
                  </td>
                  <td>
                    {contractor.completedJobs}/{contractor.totalJobs}
                  </td>
                  <td>
                    <span className={`availability-badge ${contractor.isAvailable ? 'available' : 'unavailable'}`}>
                      {contractor.isAvailable ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => openEditModal(contractor)}
                        className="edit-btn"
                        title="Edit"
                      >
                        <HiPencil />
                      </button>
                      <button
                        onClick={() => handleDeleteContractor(contractor.id)}
                        className="delete-btn"
                        title="Delete"
                      >
                        <HiTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Contractor Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Add New Contractor</h2>
            <form onSubmit={handleAddContractor}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Location Coordinates</label>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="get-location-btn"
                  >
                    {gettingLocation ? '📍 Getting Location...' : '📍 Get Current Location'}
                  </button>
                </div>
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="e.g., 40.7128"
                  />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="e.g., -74.0060"
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    />
                    Available for work
                  </label>
                </div>
              </div>
              {error && <div className="error-message mt-4">{error}</div>}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Contractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contractor Modal */}
      {showEditModal && selectedContractor && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Contractor</h2>
            <form onSubmit={handleEditContractor}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Location Coordinates</label>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={gettingLocation}
                    className="get-location-btn"
                  >
                    {gettingLocation ? '📍 Getting Location...' : '📍 Get Current Location'}
                  </button>
                </div>
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="e.g., 40.7128"
                  />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="e.g., -74.0060"
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    />
                    Available for work
                  </label>
                </div>
              </div>
              {error && <div className="error-message mt-4">{error}</div>}
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Contractor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return <Dashboard role={user?.role || 'user'}>{contractorContent}</Dashboard>;
}
