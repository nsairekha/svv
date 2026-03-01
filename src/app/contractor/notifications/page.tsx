'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/app/components/dashboard/dashboard';
import { HiBell, HiCheck, HiTrash, HiInformationCircle, HiExclamation, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import './page.css';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function ContractorNotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'contractor')) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'contractor') {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications || []);
      } else {
        setError(data.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true })
      });

      if (response.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        // Use custom event to notify navbar to refresh count
        window.dispatchEvent(new Event('notificationUpdate'));
      }
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
        window.dispatchEvent(new Event('notificationUpdate'));
      }
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const clearAll = async () => {
    if (!confirm('Clear all notifications?')) return;
    try {
      const response = await fetch('/api/notifications', { method: 'DELETE' });
      if (response.ok) {
        setNotifications([]);
        window.dispatchEvent(new Event('notificationUpdate'));
      }
    } catch (err) {
      console.error('Failed to clear notifications', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <HiCheckCircle className="notif-icon text-green-500" />;
      case 'warning': return <HiExclamation className="notif-icon text-yellow-500" />;
      case 'error': return <HiXCircle className="notif-icon text-red-500" />;
      default: return <HiInformationCircle className="notif-icon text-blue-500" />;
    }
  };

  if (authLoading || (user && user.role !== 'contractor')) {
    return null;
  }

  const notificationsContent = (
    <div className="notifications-page animate-fade-in">
      <div className="notif-header">
        <div>
          <h1 className="text-4xl font-black text-gradient">Alert Center</h1>
          <p className="text-secondary mt-2 text-lg font-medium opacity-80">Stay tuned with real-time field updates</p>
        </div>
        {notifications.length > 0 && (
          <button onClick={clearAll} className="btn-clear-all hover-lift">
            <HiTrash /> Clear Everything
          </button>
        )}
      </div>

      {error && <div className="error-message glass-card">{error}</div>}

      <div className="notifications-list">
        {loading ? (
          <div className="loading-state">Syncing alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state glass-card border-dashed">
            <div className="p-6 bg-gray-50 rounded-full w-fit mx-auto mb-6">
              <HiBell className="empty-icon text-gray-300" />
            </div>
            <p className="text-xl font-bold text-gray-400">Zen Mode</p>
            <p className="text-gray-400 text-sm mt-1">No alerts at the moment.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className={`notification-item glass-card hover-lift ${notif.isRead ? 'read' : 'unread'}`}>
              <div className="notif-content-wrapper">
                {getNotificationIcon(notif.type)}
                <div className="notif-body">
                  <h3 className="notif-title">{notif.title}</h3>
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time">{new Date(notif.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="notif-actions">
                {!notif.isRead && (
                  <button onClick={() => markAsRead(notif.id)} className="action-btn" title="Mark as read">
                    <HiCheck />
                  </button>
                )}
                <button onClick={() => deleteNotification(notif.id)} className="action-btn delete" title="Delete">
                  <HiTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return <Dashboard role={user?.role || 'contractor'}>{notificationsContent}</Dashboard>;
}
