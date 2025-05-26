import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    // Only fetch if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/notifications');
      
      if (response.data.success) {
        setNotifications(response.data.data || []);
        
        // Calculate unread count
        const unread = (response.data.data || []).filter(notification => !notification.read_at).length;
        setUnreadCount(unread);
      } else {
        setError(response.data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await api.post(`/notifications/${notificationId}/read`);
      
      if (response.data.success) {
        // Update local state
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read_at: new Date().toISOString() } 
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await api.post('/notifications/read-all');
      
      if (response.data.success) {
        // Update local state
        const now = new Date().toISOString();
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            !notification.read_at ? { ...notification, read_at: now } : notification
          )
        );
        
        // Reset unread count
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Check for new notifications periodically
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 2 minutes (reduced frequency to avoid rate limiting)
    const intervalId = setInterval(fetchNotifications, 120000);
    
    // Also fetch when user becomes active (focus/visibility change)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotifications();
      }
    };
    
    const handleFocus = () => {
      fetchNotifications();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Provide notification context value
  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
