'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/app/components/dashboard/dashboard';
import { 
  HiClipboardList, 
  HiClock, 
  HiCheckCircle, 
  HiRefresh, 
  HiExclamation, 
  HiCalendar,
  HiBriefcase,
  HiTrendingUp,
  HiUser,
  HiStar
} from 'react-icons/hi';
import { PiCoin } from 'react-icons/pi';
import { usePoints } from '@/contexts/PointsContext';
import './page.css';

interface ContractorProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  rating: number;
  totalJobs: number;
  assignedJobs: number;
  completedJobs: number;
  pendingJobs: number;
  inProgressJobs: number;
  reopenedJobs: number;
  highPriorityJobs: number;
  dueTodayJobs: number;
  isAvailable: boolean;
  latitude?: number;
  longitude?: number;
}

export default function ContractorDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { availablePoints, totalPoints, loading: pointsLoading } = usePoints();
  const router = useRouter();
  const [profile, setProfile] = useState<ContractorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'contractor')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'contractor') {
      fetchContractorProfile();
    }
  }, [user]);

  const fetchContractorProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contractor/profile');
      const data = await response.json();

      if (response.ok) {
        setProfile(data.contractor);
      } else {
        setError(data.error || 'Failed to fetch profile');
      }
    } catch (err) {
      setError('Failed to fetch profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (user && user.role !== 'contractor')) {
    return null;
  }

  const dashboardContent = (
    <div className="contractor-dashboard animate-fade-in">
      <div className="dashboard-header">
        <h1 className="text-gradient">Contractor Console</h1>
        <p className="text-secondary text-lg">Welcome back, {profile?.name}. Here's your efficiency overview.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading profile...</div>
      ) : profile ? (
        <>
          {/* Profile Overview */}
          <div className="profile-overview">
            <div className="stats-grid">
              <div className="stat-card glass-card hover-lift">
                <div className={`stat-icon-wrapper ${profile.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  <HiUser />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Profile Status</div>
                  <div className={`stat-value status-${profile.status}`}>{profile.status.toUpperCase()}</div>
                </div>
              </div>

              <div className="stat-card glass-card hover-lift">
                <div className="stat-icon-wrapper bg-indigo-100 text-indigo-600">
                  <HiStar />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Rating</div>
                  <div className="stat-value">{profile.rating?.toFixed(1)} / 5.0</div>
                </div>
              </div>

              <div className="stat-card glass-card hover-lift">
                <div className="stat-icon-wrapper bg-sky-100 text-sky-600">
                  <HiBriefcase />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Lifetime Jobs</div>
                  <div className="stat-value">{profile.totalJobs}</div>
                </div>
              </div>

              <div className="stat-card glass-card hover-lift">
                <div className="stat-icon-wrapper bg-emerald-100 text-emerald-600">
                  <HiCheckCircle />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Success Rate</div>
                  <div className="stat-value">
                    {profile.totalJobs > 0 ? ((profile.completedJobs / profile.totalJobs) * 100).toFixed(0) : 0}%
                  </div>
                </div>
              </div>
            </div>

            <div className="stats-grid">
              <div 
                className="stat-card glass-card hover-lift clickable" 
                onClick={() => router.push('/contractor/jobs?status=assigned')}
              >
                <div className="stat-icon-wrapper bg-blue-100 text-blue-600">
                  <HiClipboardList />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Assigned</div>
                  <div className="stat-value">{profile.assignedJobs}</div>
                </div>
              </div>

              <div 
                className="stat-card glass-card hover-lift clickable" 
                onClick={() => router.push('/contractor/jobs?status=pending')}
              >
                <div className="stat-icon-wrapper bg-amber-100 text-amber-600">
                  <HiClock />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Available</div>
                  <div className="stat-value">{profile.pendingJobs}</div>
                </div>
              </div>

              <div 
                className="stat-card glass-card hover-lift clickable" 
                onClick={() => router.push('/contractor/jobs?status=in-progress')}
              >
                <div className="stat-icon-wrapper bg-indigo-100 text-indigo-600">
                  <HiRefresh />
                </div>
                <div className="stat-content">
                  <div className="stat-label">In Progress</div>
                  <div className="stat-value">{profile.inProgressJobs}</div>
                </div>
              </div>

              <div 
                className="stat-card glass-card hover-lift clickable" 
                onClick={() => router.push('/contractor/jobs?status=completed')}
              >
                <div className="stat-icon-wrapper bg-emerald-100 text-emerald-600">
                  <HiCheckCircle />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Completed</div>
                  <div className="stat-value">{profile.completedJobs}</div>
                </div>
              </div>

              <div className="stat-card glass-card hover-lift points-highlight">
                <div className="stat-icon-wrapper bg-emerald-500 text-white">
                  <PiCoin />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Civic Points</div>
                  <div className="stat-value text-emerald-600">{pointsLoading ? '...' : availablePoints}</div>
                  <div className="text-xs text-emerald-700 font-medium opacity-80">Accumulated: {totalPoints} PTS</div>
                </div>
              </div>

              <div 
                className="stat-card glass-card hover-lift clickable" 
                onClick={() => router.push('/contractor/jobs?priority=high')}
              >
                <div className="stat-icon-wrapper bg-rose-100 text-rose-600">
                  <HiExclamation />
                </div>
                <div className="stat-content">
                  <div className="stat-label">High Priority</div>
                  <div className="stat-value">{profile.highPriorityJobs}</div>
                </div>
              </div>

              <div 
                className="stat-card glass-card hover-lift clickable" 
                onClick={() => router.push('/contractor/jobs?due=today')}
              >
                <div className="stat-icon-wrapper bg-teal-100 text-teal-600">
                  <HiCalendar />
                </div>
                <div className="stat-content">
                  <div className="stat-label">Due Today</div>
                  <div className="stat-value">{profile.dueTodayJobs}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="profile-details glass-card">
            <h2 className="section-title">
              <HiUser className="text-indigo-600" /> Professional Profile
            </h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{profile.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{profile.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{profile.phone}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Availability:</span>
                <span className={`availability-badge ${profile.isAvailable ? 'available' : 'unavailable'}`}>
                  {profile.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              {profile.latitude && profile.longitude && (
                <div className="detail-item full-width">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">
                    {profile.latitude.toFixed(6)}, {profile.longitude.toFixed(6)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="quick-info">
            <h2 className="section-title">Quick Info</h2>
            <div className="info-box">
              <p>🔐 <strong>Default Password:</strong> If you haven't changed your password yet, please update it for security.</p>
              <p>📱 <strong>Contact:</strong> Super admins can reach you at {profile.phone}</p>
              <p>📍 <strong>Location:</strong> Your location is used to assign nearby jobs</p>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">No profile found</div>
      )}
    </div>
  );

  return <Dashboard role={user?.role || 'contractor'}>{dashboardContent}</Dashboard>;
}
