import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRankInfo } from '../utils/titles';
import { RODIZIO_TYPES, getRodizioConfig, getUnitLabel } from '../utils/rodizioTypes';
import { ACHIEVEMENT_CATEGORIES, calculateAchievements } from '../utils/achievements';
import { apiRequest } from '../services/api';
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
  Swords,
  Star,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ArrowUpDown
} from 'lucide-react';

export default function ProfileModal({ isOpen, onClose, initialTab = 'general' }) {
  const { user, stats, updateNickname, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedRodizio, setSelectedRodizio] = useState('pizza');
  const [selectedAchievementCategory, setSelectedAchievementCategory] = useState('all');
  const [achievementSortOrder, setAchievementSortOrder] = useState('default');
  const [wrapCategories, setWrapCategories] = useState(false);
  const categoryScrollRef = useRef(null);
  const [typeStats, setTypeStats] = useState(null);
  const [loadingTypeStats, setLoadingTypeStats] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [newNick, setNewNick] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setLoadingTypeStats(true);
      apiRequest('/stats/by-type')
        .then(data => {
          setTypeStats(data.byTypeMap || {});
        })
        .catch(() => {})
        .finally(() => setLoadingTypeStats(false));
    }
  }, [isOpen, initialTab]);

  // Overall rank progression & general career metrics
  const wins = Number(stats?.wins) || 0;
  const totalItems = Number(stats?.total_slices) || 0;
  const totalBattles = Number(stats?.total_battles) || 0;

  const rankInfo = getRankInfo(wins, totalItems);
  const currentTitle = rankInfo.currentRank.title;

  // Gamified achievements calculation
  const achievementData = useMemo(() => {
    return calculateAchievements(stats, typeStats, []);
  }, [stats, typeStats]);

  const filteredAchievements = useMemo(() => {
    const RARITY_WEIGHTS = {
      diamante: 4,
      ouro: 3,
      prata: 2,
      bronze: 1
    };

    let list = selectedAchievementCategory === 'all'
      ? [...achievementData.achievements]
      : achievementData.achievements.filter(a => a.category === selectedAchievementCategory);

    if (achievementSortOrder === 'rarity_desc') {
      list.sort((a, b) => {
        const diff = (RARITY_WEIGHTS[b.tier] || 0) - (RARITY_WEIGHTS[a.tier] || 0);
        if (diff !== 0) return diff;
        return b.points - a.points;
      });
    } else if (achievementSortOrder === 'rarity_asc') {
      list.sort((a, b) => {
        const diff = (RARITY_WEIGHTS[a.tier] || 0) - (RARITY_WEIGHTS[b.tier] || 0);
        if (diff !== 0) return diff;
        return a.points - b.points;
      });
    }

    return list;
  }, [achievementData, selectedAchievementCategory, achievementSortOrder]);

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

  const renderTypeContent = () => {
    if (loadingTypeStats && !typeStats) {
      return (
        <div className="p-8 text-center text-xs text-zinc-400 font-medium animate-pulse">
          Carregando dados das modalidades...
        </div>
      );
    }

    const currentConfig = getRodizioConfig(selectedRodizio);
    const currentData = typeStats ? typeStats[selectedRodizio] : null;
    const CurrentIcon = currentConfig.icon;
    const typeBattles = currentData?.battles || 0;
    const typeWins = currentData?.wins || 0;
    const typeTotal = currentData?.total_consumed || 0;
    const typeMax = currentData?.max_consumed || 0;
    const typeAvg = currentData?.avg_consumed || 0;

    return (
      <div className="space-y-2.5">
        {/* Header banner of selected type */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${currentConfig.accentBg}`}>
              <CurrentIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                Rodízio de {currentConfig.label}
              </h4>
              <span className="text-[10px] text-zinc-400 block">
                Unidade de medida: <strong>{currentConfig.unitPlural}</strong>
              </span>
            </div>
          </div>

          {typeWins > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
              <Trophy className="w-3 h-3 shrink-0" />
              <span>{typeWins} {typeWins === 1 ? 'vitória' : 'vitórias'}</span>
            </div>
          )}
        </div>

        {typeBattles === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50/50 dark:bg-zinc-950/20">
            <CurrentIcon className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Nenhum rodízio de {currentConfig.label} disputado ainda
            </p>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
              Crie ou entre em uma mesa de {currentConfig.label} para começar a registrar vitórias e {currentConfig.unitPlural}!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {/* Vitórias no tipo */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-1">
                <Trophy className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Vitórias</span>
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                {typeWins}
              </p>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                campeão em {currentConfig.label}
              </span>
            </div>

            {/* Batalhas no tipo */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold mb-1">
                <Swords className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Batalhas</span>
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                {typeBattles}
              </p>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                mesas disputadas
              </span>
            </div>

            {/* Total consumido no tipo */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-xs text-orange-500 font-bold mb-1">
                <Flame className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Total Consumido</span>
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                {typeTotal}
              </p>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                {getUnitLabel(selectedRodizio, typeTotal)} devorados
              </span>
            </div>

            {/* Média no tipo */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-xs text-blue-500 font-bold mb-1">
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Média / Mesa</span>
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                {typeAvg}
              </p>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                {getUnitLabel(selectedRodizio, 2)} por rodada
              </span>
            </div>

            {/* Recorde em 1 mesa */}
            <div className="col-span-2 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-purple-500 font-bold mb-0.5">
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>Recorde em 1 Mesa</span>
                </div>
                <span className="text-[10px] text-zinc-400 block">
                  Maior marca em {currentConfig.label}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                  {typeMax}
                </span>
                <span className="text-[10px] text-zinc-400 font-semibold block">
                  {getUnitLabel(selectedRodizio, typeMax)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -160 : 160,
        behavior: 'smooth'
      });
    }
  };

  const renderAchievementsContent = () => {
    return (
      <div className="space-y-3.5">
        {/* Global Progress Header Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/25">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                  Progresso das Missões
                </h4>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {achievementData.unlockedCount} de {achievementData.totalCount} conquistas alcançadas
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-xs font-black text-amber-600 dark:text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{achievementData.unlockedPoints} / {achievementData.totalPoints} pts</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 font-bold block">
                {achievementData.percentComplete}% concluído
              </span>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, achievementData.percentComplete)}%` }}
            />
          </div>
        </div>

        {/* Category Filter Slider with Navigation Arrows & Wrap Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
            <span>Filtrar por Modalidade:</span>
            <button
              type="button"
              onClick={() => setWrapCategories(!wrapCategories)}
              className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>{wrapCategories ? 'Modo Carrossel' : 'Ver Todas'}</span>
            </button>
          </div>

          {wrapCategories ? (
            /* Multi-line Wrapped Grid */
            <div className="flex flex-wrap items-center gap-1.5 py-1">
              {ACHIEVEMENT_CATEGORIES.map(cat => {
                const count = cat.id === 'all' 
                  ? achievementData.achievements.length 
                  : achievementData.achievements.filter(a => a.category === cat.id).length;
                if (count === 0 && cat.id !== 'all') return null;
                const isSelected = selectedAchievementCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedAchievementCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-xs shadow-amber-500/20'
                        : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Horizontal Slider with Left & Right Arrows and Wheel Support */
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 shadow-2xs cursor-pointer"
                title="Rolar para esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div 
                ref={categoryScrollRef}
                onWheel={(e) => {
                  if (categoryScrollRef.current && e.deltaY !== 0) {
                    categoryScrollRef.current.scrollLeft += e.deltaY;
                  }
                }}
                className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1 scroll-smooth scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700"
              >
                {ACHIEVEMENT_CATEGORIES.map(cat => {
                  const count = cat.id === 'all' 
                    ? achievementData.achievements.length 
                    : achievementData.achievements.filter(a => a.category === cat.id).length;
                  if (count === 0 && cat.id !== 'all') return null;
                  const isSelected = selectedAchievementCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedAchievementCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-xs shadow-amber-500/20'
                          : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollCategories('right')}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 shadow-2xs cursor-pointer"
                title="Rolar para direita"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Sort by Rarity Bar & Counter */}
        <div className="flex items-center justify-between pt-1 pb-0.5 text-xs">
          <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            {filteredAchievements.length} {filteredAchievements.length === 1 ? 'missão' : 'missões'}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Raridade:</span>
            </span>

            <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setAchievementSortOrder('default')}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  achievementSortOrder === 'default'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Padrão
              </button>
              <button
                type="button"
                onClick={() => setAchievementSortOrder('rarity_desc')}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  achievementSortOrder === 'rarity_desc'
                    ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                title="Mais Raras primeiro (Diamante -> Ouro -> Prata -> Bronze)"
              >
                Mais Raras
              </button>
              <button
                type="button"
                onClick={() => setAchievementSortOrder('rarity_asc')}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  achievementSortOrder === 'rarity_asc'
                    ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                title="Mais Comuns primeiro (Bronze -> Prata -> Ouro -> Diamante)"
              >
                Mais Comuns
              </button>
            </div>
          </div>
        </div>

        {/* Achievements Cards List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {filteredAchievements.map(ach => {
            const Icon = ach.icon;
            const tier = ach.tierConfig;

            return (
              <div 
                key={ach.id}
                className={`p-3 rounded-2xl border transition-all ${
                  ach.isUnlocked
                    ? 'bg-zinc-50/90 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/80 shadow-2xs'
                    : 'bg-zinc-50/40 dark:bg-zinc-900/30 border-dashed border-zinc-200 dark:border-zinc-800 opacity-85'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon with Tier indicator */}
                  <div className={`p-2.5 rounded-2xl ${ach.isUnlocked ? tier.iconBg : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'} shrink-0 relative`}>
                    <Icon className="w-5 h-5" />
                    {ach.isUnlocked && (
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <h5 className={`text-xs font-black truncate ${ach.isUnlocked ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 dark:text-zinc-400'}`}>
                          {ach.title}
                        </h5>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${tier.badgeBg}`}>
                          {tier.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                          +{ach.points} pts
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight mb-2">
                      {ach.description}
                    </p>

                    {/* Progress Bar & Value */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium">
                        <span>
                          {ach.currentValue} / {ach.target} {ach.unit}
                        </span>
                        <span className="font-mono font-bold">
                          {ach.isUnlocked ? 'Desbloqueado' : `${ach.progressPercent}%`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            ach.isUnlocked 
                              ? 'bg-emerald-500' 
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.max(ach.currentValue > 0 ? 5 : 0, ach.progressPercent)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
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
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{saving ? 'Salvando...' : 'Salvar Novo Apelido'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-colors cursor-pointer"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
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

          {/* Stats Section with 3 Tabs: Geral, Por Rodízio, Conquistas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Estatísticas & Missões
              </h3>
              
              {/* Tab Selector Pill */}
              <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'general'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Geral
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('by-type')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'by-type'
                      ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  Por Rodízio
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('conquistas')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'conquistas'
                      ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>Conquistas</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === 'conquistas'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                  }`}>
                    {achievementData.unlockedCount}/{achievementData.totalCount}
                  </span>
                </button>
              </div>
            </div>

            {/* General Tab */}
            {activeTab === 'general' && (
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
            )}

            {/* By Rodizio Type Detailed Tab */}
            {activeTab === 'by-type' && (
              <div className="space-y-3">
                {/* Rodízio Type Buttons Selector */}
                <div className="grid grid-cols-5 gap-1.5">
                  {RODIZIO_TYPES.map(type => {
                    const Icon = type.icon;
                    const isSelected = selectedRodizio === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedRodizio(type.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? `border-2 ${type.accentBorder} ${type.accentBg} shadow-sm ring-2 ring-orange-500/20`
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                        title={type.label}
                      >
                        <Icon className="w-4 h-4 mb-1 shrink-0" />
                        <span className="text-[10px] font-black truncate w-full">
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Rodízio Stats View */}
                {renderTypeContent()}
              </div>
            )}

            {/* Achievements & Missions Tab */}
            {activeTab === 'conquistas' && renderAchievementsContent()}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
            >
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
