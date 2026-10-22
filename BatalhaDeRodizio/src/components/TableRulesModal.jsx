import React from 'react';
import { getRodizioConfig, getUnitLabel } from '../utils/rodizioTypes';
import { X, BookOpen, Sliders, CheckCircle2, FileText, Info } from 'lucide-react';

export default function TableRulesModal({ isOpen, onClose, room }) {
  if (!isOpen || !room) return null;

  const typeConfig = getRodizioConfig(room.type);
  const TypeIcon = typeConfig.icon;
  const unitSingular = typeConfig.unitSingular;
  const unitPlural = typeConfig.unitPlural;

  const customRules = Array.isArray(room.customRules) ? room.customRules : [];
  const notes = room.customRulesNotes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${typeConfig.accentBg}`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-white">
                Regras e Equivalências da Mesa
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                {room.name || `Sala ${room.code}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          {/* Base Unit Box */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <TypeIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Item Principal: {typeConfig.label}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Unidade padrão de contagem
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-black text-orange-600 dark:text-orange-400 bg-orange-500/10 dark:bg-orange-500/20 px-2.5 py-1 rounded-lg border border-orange-500/20">
              1 {unitSingular} = 1 ponto
            </span>
          </div>

          {/* Custom Equivalencies */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-orange-500" />
                <span>Itens Extras e Equivalências</span>
              </span>
              <span className="text-[11px] font-bold text-zinc-400">
                {customRules.length} {customRules.length === 1 ? 'regra' : 'regras'}
              </span>
            </div>

            {customRules.length > 0 ? (
              <div className="space-y-2">
                {customRules.map((rule, idx) => (
                  <div
                    key={rule.id || idx}
                    className="flex items-center justify-between p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-850/60 shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {rule.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-black text-orange-600 dark:text-orange-400 bg-orange-500/10 dark:bg-orange-500/20 px-2 py-0.5 rounded-lg border border-orange-500/20 shrink-0">
                      vale {rule.points} {rule.points === 1 ? unitSingular : unitPlural}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 py-4">
                Nenhum item extra configurado. Apenas {unitPlural} tradicionais valem pontos.
              </div>
            )}
          </div>

          {/* Custom Notes */}
          {notes && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Observações Especiais do Anfitrião:</span>
              </div>
              <p className="text-[11px] leading-relaxed whitespace-pre-line text-zinc-700 dark:text-zinc-300">
                {notes}
              </p>
            </div>
          )}

          {/* Fair Play Notice */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-850 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <span>
              As regras foram definidas pelo anfitrião ao criar a mesa. Ao computar itens adicionais, sua pontuação será somada automaticamente com a equivalência definida.
            </span>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Entendido, Voltar ao Jogo
          </button>
        </div>
      </div>
    </div>
  );
}
