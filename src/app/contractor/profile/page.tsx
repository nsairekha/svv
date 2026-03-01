'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/app/components/dashboard/dashboard';
import { HiUser, HiPhone, HiMail, HiSave, HiLockClosed, HiLocationMarker, HiOfficeBuilding, HiRefresh } from 'react-icons/hi';
import './page.css';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function ContractorProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'contractor')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'contractor') {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contractor/profile');
      const data = await response.json();

      if (response.ok) {
        setProfile({
          name: data.contractor.name || '',
          email: data.contractor.email || '',
          phone: data.contractor.phone || '',
          company: data.contractor.company || '',
          address: data.contractor.address || '',
          city: data.contractor.city || '',
          state: data.contractor.state || '',
          zipCode: data.contractor.zipCode || ''
        });
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

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/contractor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/contractor/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to update password');
      }
    } catch (err) {
      setError('An error occurred while updating password');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || (user && user.role !== 'contractor')) {
    return null;
  }

  const profileContent = (
    <div className="profile-page animate-fade-in">
      <div className="profile-header">
        <h1 className="text-4xl font-black text-gradient">Identity & Access</h1>
        <p className="text-secondary mt-2 text-lg font-medium opacity-80">Manage your digital footprint and professional credentials</p>
      </div>

      {error && <div className="error-message glass-card">{error}</div>}
      {success && <div className="success-message glass-card">{success}</div>}

      <div className="profile-grid">
        {/* Basic Info Form */}
        <div className="profile-card glass-card">
          <div className="card-header">
            <HiUser className="card-icon" />
            <h2>Personal & Business Details</h2>
          </div>
          <form onSubmit={handleProfileUpdate} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label><HiUser /> Full Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label><HiMail /> Email Address</label>
                <input 
                  type="email" 
                  value={profile.email}
                  disabled
                  className="disabled-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><HiPhone /> Phone Number</label>
                <input 
                  type="text" 
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label><HiOfficeBuilding /> Company Name</label>
                <input 
                  type="text" 
                  value={profile.company}
                  onChange={(e) => setProfile({...profile, company: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label><HiLocationMarker /> Address</label>
              <textarea 
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                rows={2}
              ></textarea>
            </div>

            <div className="form-row three-cols">
              <div className="form-group">
                <label>City</label>
                <input 
                  type="text" 
                  value={profile.city}
                  onChange={(e) => setProfile({...profile, city: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input 
                  type="text" 
                  value={profile.state}
                  onChange={(e) => setProfile({...profile, state: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input 
                  type="text" 
                  value={profile.zipCode}
                  onChange={(e) => setProfile({...profile, zipCode: e.target.value})}
                />
              </div>
            </div>

            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? 'Saving...' : <><HiSave /> Save Profile</>}
            </button>
          </form>
        </div>

        {/* Password Update Form */}
        <div className="profile-card password-card glass-card shadow-lg">
          <div className="card-header">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <HiLockClosed className="card-icon !m-0" />
            </div>
            <h2>Access Control</h2>
          </div>
          <form onSubmit={handlePasswordUpdate} className="profile-form">
            <div className="form-group">
              <label>Current Password</label>
              <input 
                type="password" 
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input 
                type="password" 
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input 
                type="password" 
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn-save btn-password" disabled={saving}>
              {saving ? 'Updating...' : <><HiRefresh /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return <Dashboard role={user?.role || 'contractor'}>{profileContent}</Dashboard>;
}
