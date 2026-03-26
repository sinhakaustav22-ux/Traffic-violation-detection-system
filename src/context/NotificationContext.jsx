import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient.js';
import { useAuth } from './AuthContext.jsx';

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
        setNotifications(res.data);
        setUnreadCount(res.data.length);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };

    fetchNotifications();

    const socketUrl = '/';
    const socket = io(socketUrl);

    socket.on('new_violation', (violation) => {
      toast.error(`New Violation: ${violation.violation_type.replace(/_/g, ' ')} detected!`);
    });

    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const markAllRead = async () => {
    try {
      await axiosClient.post('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
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
