import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  User, 
  Edit2, 
  Check, 
  Trophy, 
  Flame, 
  TrendingUp, 
  Award, 
  Shield, 
  Calendar,
  LogOut,
  AlertCircle
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
    if (!newNick || newNick.trim().length < 2) {
      setError('O apelido deve ter pelo menos 2 caracteres.');
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
      const res = await updateNickname(newNick.trim());
      setSuccess(res.message || 'Apelido atualizado!');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
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
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
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
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Apelido na Mesa
            </label>

            {isEditing ? (
              <form onSubmit={handleSaveNickname} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newNick}
                  onChange={(e) => setNewNick(e.target.value)}
                  placeholder="Novo apelido"
                  maxLength={20}
                  autoFocus
                  disabled={saving}
                  className="flex-1 px-3 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-zinc-900 border border-amber-500 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
                <button
                  type="submit"
                  disabled={saving}
                  className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50"
                  title="Salvar apelido"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                  title="Cancelar"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {user.nickname}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Award className="w-3.5 h-3.5" />
                    <span>{stats?.title || 'Iniciante no Rodízio'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Alterar</span>
                </button>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              Estatísticas da Carreira
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-1">
                  <Trophy className="w-4 h-4" />
                  <span>Vitórias</span>
                </div>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                  {stats?.wins || 0}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-xs text-orange-500 font-bold mb-1">
                  <Flame className="w-4 h-4" />
                  <span>Total Fatias</span>
                </div>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                  {stats?.total_slices || 0}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-xs text-blue-500 font-bold mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Média / Rodízio</span>
                </div>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                  {stats?.avg_slices || 0}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-xs text-purple-500 font-bold mb-1">
                  <Award className="w-4 h-4" />
                  <span>Recorde em 1x</span>
                </div>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                  {stats?.max_slices || 0} fatias
                </p>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">Batalhas disputadas:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">{stats?.total_battles || 0} rodízios</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
