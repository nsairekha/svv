'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/app/components/dashboard/dashboard';
import { HiCog, HiGlobe, HiMoon, HiBell, HiSave, HiLocationMarker } from 'react-icons/hi';
import './page.css';

export default function ContractorSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    language: 'en',
    theme: 'light',
    jobRadius: 50,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  if (authLoading || (user && user.role !== 'contractor')) {
    return null;
  }

  const settingsContent = (
    <div className="settings-page animate-fade-in">
      <div className="settings-header">
        <h1 className="text-4xl font-black text-gradient">Preferences</h1>
        <p className="text-secondary mt-2 text-lg font-medium opacity-80">Tailor your workspace settings to your unique workflow</p>
      </div>

      {success && <div className="success-message glass-card">{success}</div>}

      <form onSubmit={handleSave} className="settings-grid">
        {/* Localization */}
        <div className="settings-card glass-card shadow-lg">
          <div className="card-header">
            <HiGlobe className="card-icon" />
            <h2>Localization</h2>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label>Interface Language</label>
              <select 
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value})}
              >
                <option value="en">English (US)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="ta">Tamil (தமிழ்)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Regional Job Radius (km)</label>
              <div className="range-wrapper">
                <input 
                  type="range" 
                  min="5" 
                  max="200" 
                  step="5"
                  value={settings.jobRadius}
                  onChange={(e) => setSettings({...settings, jobRadius: parseInt(e.target.value)})}
                />
                <span className="range-value">{settings.jobRadius} km</span>
              </div>
              <p className="help-text">Filter available jobs within this distance from your location.</p>
            </div>
          </div>
        </div>

        {/* Appearance & Notifications */}
        <div className="settings-card glass-card shadow-lg">
          <div className="card-header">
            <HiMoon className="card-icon" />
            <h2>Ambiance & Alerts</h2>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label>Default Theme</label>
              <div className="theme-toggle-group">
                <button 
                  type="button"
                  className={`theme-opt ${settings.theme === 'light' ? 'active' : ''}`}
                  onClick={() => setSettings({...settings, theme: 'light'})}
                >
                  Light
                </button>
                <button 
                  type="button"
                  className={`theme-opt ${settings.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setSettings({...settings, theme: 'dark'})}
                >
                  Dark
                </button>
              </div>
            </div>
            
            <hr className="my-4" />
            
            <div className="form-group">
              <label><HiBell className="inline mr-1" /> Notification Channels</label>
              <div className="checkbox-group">
                <label className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  />
                  <span>Email Alerts</span>
                </label>
                <label className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                  />
                  <span>Push Notifications</span>
                </label>
                <label className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={settings.smsNotifications}
                    onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                  />
                  <span>SMS Alerts</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? 'Saving...' : <><HiSave /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );

  return <Dashboard role={user?.role || 'contractor'}>{settingsContent}</Dashboard>;
}
