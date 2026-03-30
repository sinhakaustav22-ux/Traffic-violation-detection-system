import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient.js';
import { useAuth } from './AuthContext.jsx';
import { useSocket } from '../hooks/useSocket.js';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await axiosClient.get('/notifications');
        const data = res.data || [];
        setNotifications(data);
        setUnreadCount(data.length);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();
  }, [user]);

  // Use the shared socket connection
  useSocket('new_violation', (violation) => {
    if (user) {
      toast.error(`New Violation: ${violation.violation_type.replace(/_/g, ' ')} detected!`);
    }
  });

  useSocket('new_notification', (notification) => {
    if (user) {
      setNotifications(prev => {
        const current = prev || [];
        return [notification, ...current];
      });
      setUnreadCount(prev => (prev || 0) + 1);
    }
  });

  const markAllRead = async () => {
    try {
      await axiosClient.post('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => {
        const current = prev || [];
        return current.map(n => ({ ...n, is_read: true }));
      });
    } catch (err) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
