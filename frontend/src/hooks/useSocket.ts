import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

let socket: Socket | null = null;

export const useSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(window.location.origin, {
        path: '/socket.io',
        withCredentials: true,
      });

      socket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });
    }

    if (socket && isConnected) {
      if (user?.role === 'user') {
        socket.emit('join:user', user.id);
      } else if (user?.role === 'admin') {
        socket.emit('join:admin');
      }
    }

    return () => {
      // Don't disconnect on unmount to keep connection alive across pages
    };
  }, [user, isConnected]);

  return { socket, isConnected };
};
