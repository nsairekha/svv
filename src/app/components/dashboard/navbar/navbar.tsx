'use client';

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { HiOfficeBuilding, HiUser, HiLogout, HiChevronDown, HiBell, HiCog, HiMoon, HiSun } from 'react-icons/hi'
import { useAuth } from '@/contexts/AuthContext'

import './navbar.css'

const navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    const handleUpdate = () => fetchUnreadCount();
    window.addEventListener('notificationUpdate', handleUpdate);
    return () => window.removeEventListener('notificationUpdate', handleUpdate);
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      if (response.ok) {
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const goToNotifications = () => {
    const roleBase = user?.role === 'contractor' ? '/contractor' : '';
    router.push(`${roleBase}/notifications`);
  };

  const goToProfile = () => {
    const roleBase = user?.role === 'contractor' ? '/contractor' : '';
    router.push(`${roleBase}/profile`);
    setShowDropdown(false);
  };

  return (
    <div className="DashboardNavComponent">
        <div className="DashboardNavComponent-in glass-card">
            <div className="dn-one">
                <div className="logo-container" onClick={() => router.push(`/${user?.role}/dashboard`)} style={{ cursor: 'pointer' }}>
                    <div className="p-2 gradient-accent rounded-xl text-white shadow-lg">
                      <HiOfficeBuilding className="text-xl" />
                    </div>
                    <span className="logo-text text-gradient">CivicIndia</span>
                </div>
            </div>
            <div className="dn-two">
                <h1 className="text-gradient">Operational Excellence Hub</h1>
            </div>
            <div className="dn-three">
                <div className="user-info" style={{ position: 'relative' }}>
                    <button 
                        onClick={toggleDarkMode}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                        title="Toggle Dark Mode"
                    >
                        {isDarkMode ? <HiSun className="text-xl" /> : <HiMoon className="text-xl" />}
                    </button>
                    <button 
                        onClick={goToNotifications}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors relative" 
                        title="Notifications"
                    >
                        <HiBell className="text-xl" />
                        {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] rounded-full border border-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                    </button>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#71717a'
                        }}
                    >
                        <HiUser className="user-avatar text-xl" />
                        <p className="hidden md:block">{user?.name || 'User'}</p>
                        <HiChevronDown className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid #e4e4e7',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            minWidth: '150px',
                            zIndex: 10,
                            marginTop: '0.5rem'
                        }}>
                            <div style={{
                                padding: '0.75rem 1rem',
                                borderBottom: '1px solid #e4e4e7',
                                fontSize: '0.875rem',
                                color: '#6b7280'
                            }}>
                                {user?.email}
                            </div>
                            <button
                                onClick={goToProfile}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: '#4b5563',
                                    fontSize: '0.875rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <HiUser />
                                Profile
                            </button>
                            <button
                                onClick={() => { router.push('/contractor/settings'); setShowDropdown(false); }}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: '#4b5563',
                                    fontSize: '0.875rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <HiCog />
                                Settings
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    textAlign: 'left',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: '#dc2626',
                                    fontSize: '0.875rem'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fef2f2';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <HiLogout />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default navbar