'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/app/components/dashboard/dashboard';
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

interface TopContributor {
  userId: number;
  name: string;
  email: string;
  totalPoints: number;
  reportsFiled: number;
}

interface MonthlyTrendBucket {
  key: string;
  label: string;
  count: number;
}

interface AnalyticsPayload {
  analytics: {
    totals: {
      totalReports: number;
      pending: number;
      inProgress: number;
      resolved: number;
      other: number;
      avgResolutionTime: number;
    };
    statusBreakdown: Record<string, number>;
    issueTypeCounts: { issueType: string; count: number }[];
    severityDistribution: { low: number; moderate: number; high: number; critical: number };
    monthlyTrend: MonthlyTrendBucket[];
    topContributors: TopContributor[];
  };
  latestReports: Array<{
    id: number;
    issueType: string;
    severity: number;
    status: string;
    createdAt: string;
    avgTimeToFix: number;
    user: {
      id: number;
      name: string | null;
      email: string;
    } | null;
  }>;
  users: Array<{
    id: number;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
    totalPoints: number;
    availablePoints: number;
    isActive: boolean;
    reportCount: number;
  }>;
}

function formatIssueLabel(issue: string) {
  return issue
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function joinStatus(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'pending':
      return 'status-pill status-pending';
    case 'in_progress':
      return 'status-pill status-progress';
    case 'resolved':
      return 'status-pill status-resolved';
    default:
      return 'status-pill status-generic';
  }
}

const AdminAnalyticsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'super_admin' && user.role !== 'admin'))) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && (user.role === 'super_admin' || user.role === 'admin')) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/analytics');
      if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error || 'Failed to load analytics');
      }

      const payload: AnalyticsPayload = await response.json();
      setAnalyticsData(payload);
    } catch (err: any) {
      console.error('Analytics fetch failed:', err);
      setError(err.message || 'Unable to fetch analytics right now');
    } finally {
      setLoading(false);
    }
  };

  const issueTypeChartData = useMemo(() => {
    if (!analyticsData) return null;
    const labels = analyticsData.analytics.issueTypeCounts.map((entry) => formatIssueLabel(entry.issueType));
    const values = analyticsData.analytics.issueTypeCounts.map((entry) => entry.count);

    return {
      labels,
      datasets: [
        {
          label: 'Reports',
          data: values,
          backgroundColor: labels.map((_, index) => {
            const palette = ['#38bdf8', '#818cf8', '#fb7185', '#fbbf24', '#34d399', '#f472b6', '#60a5fa'];
            return palette[index % palette.length];
          }),
          borderRadius: 12,
          borderSkipped: false,
        },
      ],
    };
  }, [analyticsData]);

  const issueTypeChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#e2e8f0' },
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: '#e2e8f0' },
          grid: { color: 'rgba(226, 232, 240, 0.12)' },
        },
      },
      animation: {
        duration: 1100,
        easing: 'easeOutQuart' as const,
      },
    }),
    []
  );

  const severityChartData = useMemo(() => {
    if (!analyticsData) return null;
    const { low, moderate, high, critical } = analyticsData.analytics.severityDistribution;
    return {
      labels: ['Low', 'Moderate', 'High', 'Critical'],
      datasets: [
        {
          label: 'Severity distribution',
          data: [low, moderate, high, critical],
          backgroundColor: ['#22d3ee', '#34d399', '#fbbf24', '#f87171'],
          hoverOffset: 10,
        },
      ],
    };
  }, [analyticsData]);

  const severityChartOptions = useMemo(
    () => ({
      maintainAspectRatio: false,
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
        easing: 'easeOutQuint' as const,
      },
    }),
    []
  );

  const monthlyTrendChartData = useMemo(() => {
    if (!analyticsData) return null;
    const labels = analyticsData.analytics.monthlyTrend.map((bucket) => bucket.label);
    const values = analyticsData.analytics.monthlyTrend.map((bucket) => bucket.count);

    return {
      labels,
      datasets: [
        {
          label: 'Reports',
          data: values,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
        },
      ],
    };
  }, [analyticsData]);

  const monthlyTrendChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: { color: '#e2e8f0' },
          grid: { color: 'rgba(226, 232, 240, 0.1)' },
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0, color: '#e2e8f0' },
          grid: { color: 'rgba(99, 102, 241, 0.1)' },
        },
      },
      animation: {
        duration: 1400,
        easing: 'easeInOutQuart' as const,
      },
    }),
    []
  );

  const topContributorsChartData = useMemo(() => {
    if (!analyticsData || analyticsData.analytics.topContributors.length === 0) return null;
    const labels = analyticsData.analytics.topContributors.map((contributor) => contributor.name);
    const values = analyticsData.analytics.topContributors.map((contributor) => contributor.reportsFiled);

    return {
      labels,
      datasets: [
        {
          label: 'Reports filed',
          data: values,
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    };
  }, [analyticsData]);

  const topContributorsChartOptions = useMemo(
    () => ({
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<'bar'>) => `${context.parsed.x} reports`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { precision: 0, color: '#e2e8f0' },
          grid: { color: 'rgba(226, 232, 240, 0.14)' },
        },
        y: {
          ticks: { color: '#e2e8f0' },
          grid: { display: false },
        },
      },
      animation: {
        duration: 1200,
        easing: 'easeOutCubic' as const,
      },
    }),
    []
  );

  if (authLoading || (user && user.role !== 'super_admin' && user.role !== 'admin')) {
    return null;
  }

  const totals = analyticsData?.analytics.totals;
  const pendingTotal = (totals?.pending ?? 0) + (totals?.inProgress ?? 0) + (totals?.other ?? 0);

  const pageContent = (
    <div className="admin-analytics-page">
      <div className="analytics-headline">
        <div>
          <h1 className="page-title">City Issue Intelligence</h1>
          <p className="page-subtitle">Track reported problems, monitor resolution velocity, and spotlight your most engaged citizens.</p>
        </div>
        <button className="refresh-button" onClick={fetchAnalytics} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh data'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="metric-grid">
        <div className="metric-card">
          <span className="metric-label">Total Reports</span>
          <span className="metric-value">{totals?.totalReports ?? '—'}</span>
          <span className="metric-footnote">Lifetime reports captured</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Open & Pending</span>
          <span className="metric-value">{pendingTotal}</span>
          <span className="metric-footnote">Includes pending, in progress, other</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Resolved</span>
          <span className="metric-value text-success">{totals?.resolved ?? 0}</span>
          <span className="metric-footnote">Reports marked resolved</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Avg. Time to Fix</span>
          <span className="metric-value">{totals?.avgResolutionTime ?? 0} days</span>
          <span className="metric-footnote">Based on AI-estimated repair window</span>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h2 className="chart-title">Problems By Category</h2>
          <p className="chart-subtitle">Which infrastructure pain points are trending</p>
          <div className="chart-body">
            {!issueTypeChartData || issueTypeChartData.datasets[0].data.every((value) => value === 0) ? (
              <div className="chart-empty">No issues reported yet</div>
            ) : (
              <Bar data={issueTypeChartData} options={issueTypeChartOptions} />
            )}
          </div>
        </div>
        <div className="chart-card">
          <h2 className="chart-title">Severity Mix</h2>
          <p className="chart-subtitle">How urgent the current backlog is</p>
          <div className="chart-body">
            {!severityChartData || severityChartData.datasets[0].data.every((value) => value === 0) ? (
              <div className="chart-empty">No severity data available</div>
            ) : (
              <Doughnut data={severityChartData} options={severityChartOptions} />
            )}
          </div>
        </div>
        <div className="chart-card chart-card-wide">
          <h2 className="chart-title">Reporting Velocity</h2>
          <p className="chart-subtitle">Monthly inflow of new reports (last 6 months)</p>
          <div className="chart-body">
            {!monthlyTrendChartData || monthlyTrendChartData.datasets[0].data.every((value) => value === 0) ? (
              <div className="chart-empty">No activity recorded in the selected timeframe</div>
            ) : (
              <Line data={monthlyTrendChartData} options={monthlyTrendChartOptions} />
            )}
          </div>
        </div>
        <div className="chart-card chart-card-wide">
          <h2 className="chart-title">Top Contributors</h2>
          <p className="chart-subtitle">Citizens reporting the most issues</p>
          <div className="chart-body">
            {!topContributorsChartData ? (
              <div className="chart-empty">No contributor data yet</div>
            ) : (
              <Bar data={topContributorsChartData} options={topContributorsChartOptions} />
            )}
          </div>
        </div>
      </div>

      <div className="data-panels">
        <div className="data-card">
          <div className="data-card-header">
            <div>
              <h2 className="data-card-title">All Reports</h2>
              <p className="data-card-subtitle">Review the latest problem submissions across the city</p>
            </div>
            <span className="data-count">{analyticsData?.latestReports.length ?? 0} entries</span>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Reporter</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData?.latestReports.length ? (
                  analyticsData.latestReports.map((report) => (
                    <tr key={report.id}>
                      <td>{formatIssueLabel(report.issueType)}</td>
                      <td>{report.severity.toFixed(1)}</td>
                      <td>
                        <span className={getStatusBadgeClass(report.status)}>{joinStatus(report.status)}</span>
                      </td>
                      <td>
                        <div className="reporter-cell">
                          <span className="reporter-name">{report.user?.name || 'Unknown'}</span>
                          <span className="reporter-email">{report.user?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td>{formatDate(report.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-table">No reports available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="data-card">
          <div className="data-card-header">
            <div>
              <h2 className="data-card-title">Active Users</h2>
              <p className="data-card-subtitle">Monitor user engagement and points accumulation</p>
            </div>
            <span className="data-count">{analyticsData?.users.length ?? 0} profiles</span>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Reports</th>
                  <th>Total Points</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData?.users.length ? (
                  analyticsData.users.map((userRow) => (
                    <tr key={userRow.id}>
                      <td>
                        <div className="reporter-cell">
                          <span className="reporter-name">{userRow.name || 'Unnamed User'}</span>
                          <span className="reporter-email">{userRow.email}</span>
                        </div>
                      </td>
                      <td>{joinStatus(userRow.role)}</td>
                      <td>{userRow.reportCount}</td>
                      <td>{userRow.totalPoints}</td>
                      <td>{formatDate(userRow.createdAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="empty-table">No user data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return <Dashboard role={user?.role || 'admin'}>{pageContent}</Dashboard>;
};

export default AdminAnalyticsPage;
