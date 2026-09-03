import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRankInfo } from '../utils/titles';
import { 
  X, 
  User, 
  Edit2, 
  Check, 
  Trophy, 
  Flame, 
  TrendingUp, 
  Award, 
  LogOut,
  AlertCircle,
  Target,
  Swords
} from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, stats, updateNickname, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newNick, setNewNick] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen || !user) return null;

  const handleStartEdit = () => {
    setNewNick(user.nickname);
    setError('');
    setSuccess('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
  };

  const handleSaveNickname = async (e) => {
    e.preventDefault();
    if (!newNick.trim()) {
      setError('O apelido não pode ficar vazio.');
      return;
    }
    if (newNick.trim() === user.nickname) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateNickname(newNick.trim());
      setSuccess('Apelido atualizado com sucesso!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao alterar apelido.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    onClose();
  };

  // Rank progression & extra career metrics
  const wins = Number(stats?.wins) || 0;
  const totalItems = Number(stats?.total_slices) || 0;
  const totalBattles = Number(stats?.total_battles) || 0;

  const rankInfo = getRankInfo(wins, totalItems);
  const currentTitle = rankInfo.currentRank.title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <User className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-black tracking-tight">Perfil do Guerreiro</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Error / Success Feedback */}
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Nickname Section with inline edit */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Apelido na Mesa
            </label>

            {isEditing ? (
              <form onSubmit={handleSaveNickname} className="space-y-3">
                <input
                  type="text"
                  value={newNick}
                  onChange={(e) => setNewNick(e.target.value)}
                  placeholder="Novo apelido"
                  maxLength={20}
                  autoFocus
                  disabled={saving}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl bg-white dark:bg-zinc-900 border border-amber-500 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{saving ? 'Salvando...' : 'Salvar Novo Apelido'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {user.nickname}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    <span>Nível {rankInfo.currentRank.level} • {currentTitle}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Alterar</span>
                </button>
              </div>
            )}
          </div>

          {/* Rank Progression Info with visual progress bar */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 font-black text-amber-800 dark:text-amber-300">
                <Target className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Patente: {currentTitle}</span>
              </div>
              {!rankInfo.isMaxRank && (
                <span className="font-mono text-[11px] font-black text-amber-600 dark:text-amber-400">
                  {rankInfo.progressPercent}%
                </span>
              )}
            </div>

            {!rankInfo.isMaxRank ? (
              <>
                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(6, rankInfo.progressPercent)}%` }}
                  />
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-[11px]">
                  Próxima patente: <strong className="text-amber-600 dark:text-amber-400 font-bold">{rankInfo.nextRank.title}</strong>.
                  <br />
                  Falta ganhar mais <strong className="text-amber-600 dark:text-amber-400">{rankInfo.neededWins} {rankInfo.neededWins === 1 ? 'partida' : 'partidas'}</strong> OU consumir mais <strong className="text-orange-600 dark:text-orange-400">{rankInfo.neededItems} porções</strong> no total.
                </p>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Patente máxima alcançada! Você é a lenda suprema da mesa.</span>
              </div>
            )}
          </div>

          {/* Stats Grid - 6 Comprehensive Cards */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Estatísticas da Carreira
              </h3>
              <span className="text-[10px] text-zinc-400 font-medium">
                Consolidado geral
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Vitórias */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-1">
                  <Trophy className="w-4 h-4 shrink-0" />
                  <span className="truncate">Vitórias</span>
                </div>
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                  {wins}
                </p>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  campeão oficial
                </span>
              </div>

              {/* Batalhas Disputadas */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold mb-1">
                  <Swords className="w-4 h-4 shrink-0" />
                  <span className="truncate">Batalhas</span>
                </div>
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                  {totalBattles}
                </p>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  mesas disputadas
                </span>
              </div>

              {/* Total Consumido */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-xs text-orange-500 font-bold mb-1">
                  <Flame className="w-4 h-4 shrink-0" />
                  <span className="truncate">Total Porções</span>
                </div>
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                  {totalItems}
                </p>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  itens devorados
                </span>
              </div>

              {/* Média por Batalha */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-xs text-blue-500 font-bold mb-1">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span className="truncate">Média / Batalha</span>
                </div>
                <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                  {stats?.avg_slices || 0}
                </p>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  porções por rodada
                </span>
              </div>

              {/* Recorde em 1 Mesa (col-span-2) */}
              <div className="col-span-2 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-purple-500 font-bold mb-0.5">
                    <Award className="w-4 h-4 shrink-0" />
                    <span>Recorde em 1 Mesa</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">
                    Maior consumo registrado em uma única sessão
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                    {stats?.max_slices || 0}
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold block">
                    porções
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-xs"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
