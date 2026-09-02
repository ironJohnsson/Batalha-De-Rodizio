import React, { useState, useEffect } from 'react';
import socket from './services/socket';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import PodiumModal from './components/PodiumModal';
import ProfileModal from './components/ProfileModal';
import HomeView from './views/HomeView';
import RoomView from './views/RoomView';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const { user, refreshProfile } = useAuth();
  const [currentRoom, setCurrentRoom] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPodium, setShowPodium] = useState(false);
  const [initialCode, setInitialCode] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam) {
      setInitialCode(codeParam.toUpperCase());
    }
  }, []);

  useEffect(() => {
    function onConnect() {
      console.log('Conectado ao servidor via Socket.IO:', socket.id);
      setSocketId(socket.id);
      setIsConnected(true);
    }

    function onDisconnect() {
      console.warn('Socket.IO desconectado.');
      setIsConnected(false);
    }

    function onRoomUpdated(updatedRoom) {
      setCurrentRoom(updatedRoom);
    }

    function onRoomFinished(finishedRoom) {
      setCurrentRoom(finishedRoom);
      setShowPodium(true);
      refreshProfile();
    }

    function onRoomClosed(data) {
      alert(data?.message || 'A sala foi encerrada pois todos os participantes saíram.');
      setCurrentRoom(null);
      setShowPodium(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room:updated', onRoomUpdated);
    socket.on('room:finished', onRoomFinished);
    socket.on('room:closed', onRoomClosed);

    if (socket.connected) {
      setSocketId(socket.id);
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room:updated', onRoomUpdated);
      socket.off('room:finished', onRoomFinished);
      socket.off('room:closed', onRoomClosed);
    };
  }, [refreshProfile]);

  const handleCreateRoom = ({ name, hostUserId, hostNickname, type, password }) => {
    if (!socket.connected) {
      alert('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
      return;
    }

    socket.emit('room:create', { name, hostUserId, hostNickname, type, password }, (response) => {
      if (response && response.success) {
        setCurrentRoom(response.room);
      } else {
        alert(response?.error || 'Erro ao criar sala.');
      }
    });
  };

  const handleJoinRoom = ({ code, userId, nickname, roomPassword }, callback) => {
    if (!socket.connected) {
      alert('Não foi possível conectar ao servidor. Verifique sua conexão com a internet.');
      return;
    }

    socket.emit('room:join', { code, userId, nickname, roomPassword }, (response) => {
      if (response && response.success) {
        setCurrentRoom(response.room);
        if (typeof callback === 'function') callback({ success: true, room: response.room });
      } else {
        if (typeof callback === 'function') {
          callback({ 
            success: false, 
            error: response?.error || 'Não foi possível entrar na sala.',
            requiresPassword: response?.requiresPassword 
          });
        } else {
          alert(response?.error || 'Não foi possível entrar na sala. Verifique o código.');
        }
      }
    });
  };

  const handleUpdateSlice = (delta) => {
    if (!currentRoom) return;
    socket.emit('room:slice', { code: currentRoom.code, delta }, (response) => {
      if (response && response.success) {
        setCurrentRoom(response.room);
      }
    });
  };

  const handleFinishRoom = () => {
    if (!currentRoom) return;
    socket.emit('room:finish', { code: currentRoom.code, userId: user?.id || null }, (response) => {
      if (response && response.success) {
        setCurrentRoom(response.room);
        setShowPodium(true);
        refreshProfile();
      } else {
        alert(response?.error || 'Apenas o anfitrião pode finalizar a competição.');
      }
    });
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Tem certeza que deseja sair da sala atual?')) {
      if (currentRoom) {
        socket.emit('room:leave', { code: currentRoom.code });
      }
      setCurrentRoom(null);
      setShowPodium(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const handleBackHomeFromPodium = () => {
    if (currentRoom) {
      socket.emit('room:leave', { code: currentRoom.code });
    }
    setShowPodium(false);
    setCurrentRoom(null);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onNavigateHome={() => {
          if (currentRoom) {
            if (window.confirm('Deseja realmente sair da sala atual e voltar ao início?')) {
              handleLeaveRoom();
              setShowPodium(false);
            }
          }
        }}
      />

      {/* Disconnection Warning Banner if backend is not running */}
      {!isConnected && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Servidor backend conectando... (Certifique-se de ter iniciado com <code>npm run dev</code>)</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentRoom ? (
          <RoomView
            room={currentRoom}
            currentSocketId={socketId}
            onUpdateSlice={handleUpdateSlice}
            onFinishRoom={handleFinishRoom}
            onLeaveRoom={handleLeaveRoom}
          />
        ) : (
          <HomeView
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenProfile={() => setShowProfileModal(true)}
            initialCode={initialCode}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-950/40 py-5 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <p className="text-zinc-600 dark:text-zinc-400 text-center sm:text-left">
            Batalha de Rodízio – Matheus Johnsson
          </p>

          <div className="flex items-center gap-6">
            <a
              href="https://www.linkedin.com/in/matheus-luiz-johnsson-9981642b9/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white underline underline-offset-4 decoration-zinc-400 dark:decoration-zinc-600 hover:decoration-orange-500 transition-colors"
            >
              LinkedIn
            </a>

            <a
              href="https://github.com/ironJohnsson"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white underline underline-offset-4 decoration-zinc-400 dark:decoration-zinc-600 hover:decoration-orange-500 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Podium Modal */}
      <PodiumModal
        isOpen={showPodium}
        room={currentRoom}
        onBackHome={handleBackHomeFromPodium}
      />
    </div>
  );
}
