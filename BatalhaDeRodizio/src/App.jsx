import React, { useState, useEffect } from 'react';
import socket from './services/socket';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import PodiumModal from './components/PodiumModal';
import ProfileModal from './components/ProfileModal';
import HomeView from './views/HomeView';
import RoomView from './views/RoomView';
import { AlertCircle, Utensils } from 'lucide-react';

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

      {/* Footer com design próprio da Batalha de Rodízio */}
      <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md py-4 transition-colors">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Brand & Author */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-500/20 shadow-xs">
              <Utensils className="h-4 w-4" />
            </div>
            <div className="text-center sm:text-left">
              <span className="text-xs font-black tracking-tight text-zinc-900 dark:text-white block">
                Batalha de Rodízio
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Desenvolvido por <span className="font-bold text-orange-600 dark:text-orange-400">Matheus Johnsson</span>
              </p>
            </div>
          </div>

          {/* Center Status Tagline */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 px-3.5 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Placar ao vivo para disputar quem come mais</span>
          </div>

          {/* Social Action Pills */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://www.linkedin.com/in/matheus-luiz-johnsson-9981642b9/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-white dark:bg-zinc-900 dark:hover:bg-zinc-850 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 transition-all shadow-2xs hover:scale-105 active:scale-95"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.78a1.64 1.64 0 0 0-1.63 1.63 1.63 1.63 0 0 0 1.63 1.63 1.63 1.63 0 0 0 1.63-1.63c0-.9-.73-1.63-1.63-1.63Z" />
              </svg>
              <span>LinkedIn</span>
            </a>

            <a
              href="https://github.com/ironJohnsson"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 hover:bg-white dark:bg-zinc-900 dark:hover:bg-zinc-850 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-500/30 transition-all shadow-2xs hover:scale-105 active:scale-95"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
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
