import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (event, callback) => {
  const socketRef = useRef(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const socketUrl = '/';
    socketRef.current = io(socketUrl);

    socketRef.current.on(event, (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [event]);

  return socketRef.current;
};
