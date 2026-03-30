import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Create a singleton socket instance outside the hook
// This prevents multiple connections when the hook is used in multiple components
let socketInstance = null;

const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io('/', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
};

export const useSocket = (event, callback) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const socket = getSocket();

    const handleEvent = (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };

    socket.on(event, handleEvent);

    return () => {
      socket.off(event, handleEvent);
    };
  }, [event]);

  return getSocket();
};
