import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Minus,
  Trophy,
  Crown,
  Medal,
  QrCode,
  Copy,
  Check,
  Utensils,
  LogOut,
  AlertTriangle,
  Radio,
  Clock
} from 'lucide-react';
import QrCodeModal from '../components/QrCodeModal';

export default function RoomView({
  room,
  currentSocketId,
  onUpdateSlice,
  onFinishRoom,
  onLeaveRoom
}) {
  const { user } = useAuth();
  const [showQrModal, setShowQrModal] = useState(false);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  if (!room) return null;

  const participants = room.participants || [];
  const myEntry = participants.find(p => p.socketId === currentSocketId) ||
                  participants.find(p => user && p.userId === user.id) ||
                  { nickname: 'Você', slices: 0 };

  const isHost = (currentSocketId && room.hostSocketId === currentSocketId) ||
                 (user && room.hostUserId && user.id === room.hostUserId);

  const handleAddSlice = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    onUpdateSlice(1);
  };

  const handleSubSlice = () => {
    if (myEntry.slices > 0) {
      onUpdateSlice(-1);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const totalTableSlices = participants.reduce((acc, p) => acc + (p.slices || 0), 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-md dark:border-zinc-800 dark:bg-zinc-900 transition-all flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Radio className="h-5 w-5 animate-pulse text-green-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Sala Ao Vivo
              </span>
              <span className="font-mono text-sm font-black text-orange-600 dark:text-orange-400">
                {room.code}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
              {room.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            title="Copiar código da sala"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750 transition-all"
          >
            {copiedCode ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar Código</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            title="Exibir QR Code para a mesa"
            className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-all shadow-sm"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>QR Code</span>
          </button>

          <button
            onClick={onLeaveRoom}
            title="Sair da sala"
            className="flex items-center justify-center h-8 w-8 rounded-xl border border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-200 dark:border-zinc-800 dark:hover:border-red-900 dark:hover:text-red-400 transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-7 space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-center transition-all">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600 dark:text-orange-400 mb-4">
              <Utensils className="h-3.5 w-3.5" />
              <span>{myEntry.nickname} (Seu Contador)</span>
            </div>

            <div className="my-3">
              <span
                className={`font-mono text-7xl sm:text-8xl font-black tracking-tight text-zinc-900 dark:text-white transition-all inline-block ${
                  isAnimating ? 'scale-110 text-orange-500' : 'scale-100'
                }`}
              >
                {myEntry.slices}
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-1">
                {myEntry.slices === 1 ? 'fatia comida' : 'fatias comidas'}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleAddSlice}
                className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 py-5 text-xl font-black text-white shadow-xl shadow-orange-500/30 active:scale-98 hover:brightness-105 transition-all focus:outline-none focus:ring-4 focus:ring-orange-500/40"
              >
                <Plus className="h-7 w-7 transition-transform group-hover:rotate-90" />
                <span>+1 FATIA</span>
              </button>

              <button
                type="button"
                onClick={handleSubSlice}
                disabled={myEntry.slices <= 0}
                className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 disabled:opacity-30 dark:text-zinc-400 dark:hover:text-white transition-all"
              >
                <Minus className="h-3.5 w-3.5" />
                <span>Desfazer última fatia (-1)</span>
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 transition-all">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-orange-500" />
              <span>Últimos Acontecimentos na Mesa</span>
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {room.logs && room.logs.length > 0 ? (
                room.logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-850"
                  >
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {log.text}
                    </span>
                    <span className="text-[10px] text-zinc-400 shrink-0 ml-2 font-mono">
                      {log.time}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 py-2">
                  Aguardando as primeiras fatias...
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-5 space-y-6">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 transition-all">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Placar ao Vivo
                </h3>
              </div>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                {participants.length} na mesa
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {participants.map((p, idx) => {
                const isMe = (currentSocketId && p.socketId === currentSocketId) || (user && p.userId === user.id);
                const isLeader = idx === 0 && p.slices > 0;

                return (
                  <div
                    key={p.socketId || idx}
                    className={`flex items-center justify-between rounded-2xl p-3.5 transition-all ${
                      isMe
                        ? 'border-2 border-orange-500/40 bg-orange-500/10 dark:bg-orange-500/10'
                        : isLeader
                        ? 'border border-amber-500/30 bg-amber-500/5'
                        : 'border border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl font-mono text-xs font-bold">
                        {idx === 0 ? (
                          <Crown className="h-5 w-5 text-amber-500" />
                        ) : idx === 1 ? (
                          <Medal className="h-4 w-4 text-zinc-400" />
                        ) : idx === 2 ? (
                          <Medal className="h-4 w-4 text-amber-700 dark:text-amber-600" />
                        ) : (
                          <span className="text-zinc-400 font-mono">#{idx + 1}</span>
                        )}
                      </div>

                      <div>
                        <span className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          {p.nickname}
                          {isMe && (
                            <span className="rounded-md bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-extrabold text-orange-600 dark:text-orange-400">
                              VOCÊ
                            </span>
                          )}
                        </span>
                        {p.socketId === room.hostSocketId && (
                          <span className="text-[10px] font-medium text-zinc-400">
                            Anfitrião
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-lg font-black text-orange-600 dark:text-orange-400">
                        {p.slices}
                      </span>
                      <span className="text-[10px] text-zinc-400 block font-medium">
                        fatias
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Total comido na mesa:</span>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">
                {totalTableSlices} fatias
              </span>
            </div>
          </div>

          {isHost ? (
            <div className="rounded-3xl border-2 border-orange-500/30 bg-orange-500/5 p-5 dark:border-orange-500/20 dark:bg-zinc-900 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-orange-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Painel do Dono da Sala
                </h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4">
                Apenas você tem autorização para encerrar a competição e calcular o vencedor.
              </p>

              <button
                type="button"
                onClick={() => setShowConfirmFinish(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-all"
              >
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>Finalizar Rodízio e Definir Campeão</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-950/40 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-0.5">
                Competição em andamento
              </span>
              O anfitrião ({room.hostNickname || 'Dono da sala'}) finalizará a rodada quando todos terminarem.
            </div>
          )}
        </div>
      </div>

      <QrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        roomCode={room.code}
      />

      {showConfirmFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Finalizar Rodízio?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
              Isso encerrará a contagem, salvará as estatísticas de todos os participantes e declarará o vencedor oficial.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmFinish(false)}
                className="flex-1 rounded-xl border border-zinc-200 py-3 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-all"
              >
                Continuar Comendo
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmFinish(false);
                  onFinishRoom();
                }}
                className="flex-1 rounded-xl bg-orange-600 py-3 text-xs font-bold text-white hover:bg-orange-500 shadow-md shadow-orange-600/20 transition-all"
              >
                Sim, Encerrar!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

