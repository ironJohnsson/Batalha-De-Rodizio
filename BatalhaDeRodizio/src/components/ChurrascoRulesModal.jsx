import React from 'react';
import { Flame, X, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { CHURRASCO_RULES } from '../utils/rodizioTypes';

export default function ChurrascoRulesModal({
  isOpen,
  onClose,
  onConfirm,
  mode = 'create', // 'create' | 'join' | 'info'
  roomName = ''
}) {
  if (!isOpen) return null;

  const isCreate = mode === 'create';
  const isJoin = mode === 'join';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-red-500/30 bg-white p-6 sm:p-7 shadow-2xl dark:border-red-900/60 dark:bg-zinc-900 transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          title="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with Flame Icon */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20 shadow-xs">
            <Flame className="h-6 w-6 animate-pulse text-red-500" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-red-600 dark:text-red-400 mb-1 border border-red-500/20">
              <ShieldAlert className="h-3 w-3" />
              <span>Medição Oficial • Rodízio de Churrasco</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white tracking-tight">
              {isCreate && 'Regras do Rodízio de Churrasco'}
              {isJoin && (roomName ? `Regras da Mesa: ${roomName}` : 'Regras do Churrasco desta Mesa')}
              {mode === 'info' && 'Regras Oficiais do Churrasco'}
            </h3>
          </div>
        </div>

        {/* Subtitle description */}
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
          {isCreate && 'Antes de abrir a mesa, confira as diretrizes para que todos meçam os pedaços com os mesmos critérios:'}
          {isJoin && 'Para garantir que a contagem seja justa e sem discussões, revise as regras antes de se juntar aos competidores:'}
          {mode === 'info' && 'Diretrizes acordadas para contagem justa de pedaços durante a competição:'}
        </p>

        {/* Rules Cards List */}
        <div className="space-y-2.5 max-h-[52vh] overflow-y-auto pr-1">
          {CHURRASCO_RULES.map((rule) => (
            <div
              key={rule.number}
              className={`rounded-2xl p-3.5 transition-all text-left ${
                rule.highlight
                  ? 'border-2 border-red-500/40 bg-red-500/5 dark:bg-red-950/20'
                  : 'border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-xl text-xs font-black ${
                  rule.highlight
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                }`}>
                  {rule.number}
                </span>

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                      {rule.title}
                    </h4>
                    {rule.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        rule.highlight
                          ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                          : 'bg-zinc-200/80 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {rule.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
                    {rule.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pro Tip Box */}
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Dica:</strong> Em caso de empate ou divergência, vale o que a maioria da mesa deliberar!
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center gap-2.5">
          {mode !== 'info' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-zinc-200 py-3 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof onConfirm === 'function') {
                    onConfirm();
                  }
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-red-600 py-3 text-xs font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-500 transition-all cursor-pointer"
              >
                <span>{isCreate ? 'Concordar e Criar Sala' : 'Entendi e Entrar na Mesa'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl bg-zinc-900 py-3 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-all cursor-pointer"
            >
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

