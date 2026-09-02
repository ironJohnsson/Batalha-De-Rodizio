import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Crown, Medal, Home } from 'lucide-react';

export default function PodiumModal({ isOpen, room, onBackHome }) {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen || !room) return null;

  const participants = room.participants || [];
  const top1 = participants[0];
  const top2 = participants[1];
  const top3 = participants[2];

  const totalSlicesInRoom = participants.reduce((acc, p) => acc + (p.slices || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 transition-all text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 ring-8 ring-amber-500/5">
          <Trophy className="h-8 w-8 text-amber-500" />
        </div>

        <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          Competição Finalizada!
        </h2>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
          {room.name} • {participants.length} competidores na mesa
        </p>

        {top1 && top1.slices > 0 ? (
          <div className="my-6 rounded-2xl bg-gradient-to-b from-amber-500/10 to-orange-500/10 p-5 border border-amber-500/30 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
              <Crown className="h-4 w-4" />
              <span>Grande Campeão do Rodízio</span>
            </div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
              {top1.nickname}
            </h3>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="font-mono text-3xl font-black text-orange-600 dark:text-orange-400">
                {top1.slices}
              </span>
              <span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">
                fatias devoradas
              </span>
            </div>
          </div>
        ) : (
          <div className="my-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 p-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Nenhuma fatia registrada nesta rodada.
            </p>
          </div>
        )}

        {participants.length > 1 && (
          <div className="mb-6 grid grid-cols-3 gap-2 items-end pt-4">
            {top2 ? (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-850">
                <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                  <Medal className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">2º Lugar</span>
                <span className="text-xs font-bold text-zinc-900 dark:text-white truncate block">
                  {top2.nickname}
                </span>
                <span className="font-mono text-sm font-black text-zinc-700 dark:text-zinc-300">
                  {top2.slices} fatias
                </span>
              </div>
            ) : <div />}

            {top1 ? (
              <div className="rounded-xl border-2 border-amber-500/50 bg-amber-500/10 p-4 dark:border-amber-400/40">
                <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
                  <Crown className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase block">1º Lugar</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white truncate block">
                  {top1.nickname}
                </span>
                <span className="font-mono text-lg font-black text-amber-600 dark:text-amber-400">
                  {top1.slices} fatias
                </span>
              </div>
            ) : <div />}

            {top3 ? (
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-850">
                <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-800/20 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
                  <Medal className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">3º Lugar</span>
                <span className="text-xs font-bold text-zinc-900 dark:text-white truncate block">
                  {top3.nickname}
                </span>
                <span className="font-mono text-sm font-black text-zinc-700 dark:text-zinc-300">
                  {top3.slices} fatias
                </span>
              </div>
            ) : <div />}
          </div>
        )}

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/40 grid grid-cols-2 gap-3 text-left">
          <div>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">
              Total da Mesa
            </span>
            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              {totalSlicesInRoom} fatias
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">
              Média por Pessoa
            </span>
            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              {participants.length > 0 ? (totalSlicesInRoom / participants.length).toFixed(1) : 0} fatias
            </span>
          </div>
        </div>

        <button
          onClick={onBackHome}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        >
          <Home className="h-4 w-4" />
          <span>Voltar ao Painel Principal</span>
        </button>
      </div>
    </div>
  );
}

