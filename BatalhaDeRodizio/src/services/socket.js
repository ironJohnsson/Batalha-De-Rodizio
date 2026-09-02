import { io } from 'socket.io-client';

// Connect directly to port 4000 when running dev on port 5173/5174 or use same origin
const socketUrl = (typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '5174'))
  ? `http://${window.location.hostname}:4000`
  : '/';

const socket = io(socketUrl, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

export default socket;
