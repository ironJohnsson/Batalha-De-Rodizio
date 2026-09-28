import { 
  Trophy, 
  Award, 
  Flame, 
  Swords, 
  Crown, 
  Compass, 
  Zap, 
  Target, 
  Shield, 
  Pizza, 
  Fish, 
  Sandwich, 
  Beer, 
  Star,
  Sparkles
} from 'lucide-react';

export const ACHIEVEMENT_TIERS = {
  bronze: {
    name: 'Bronze',
    badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
    border: 'border-amber-600/30',
    iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    glow: 'ring-amber-500/10'
  },
  prata: {
    name: 'Prata',
    badgeBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/25',
    border: 'border-slate-400/30',
    iconBg: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
    glow: 'ring-slate-400/10'
  },
  ouro: {
    name: 'Ouro',
    badgeBg: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/35',
    border: 'border-yellow-500/40',
    iconBg: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    glow: 'ring-yellow-500/20'
  },
  diamante: {
    name: 'Diamante',
    badgeBg: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/35',
    border: 'border-cyan-500/40',
    iconBg: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300',
    glow: 'ring-cyan-500/20'
  }
};

export const ACHIEVEMENT_CATEGORIES = [
  { id: 'all', label: 'Todas' },
  { id: 'geral', label: 'Gerais' },
  { id: 'vitorias', label: 'Vitórias' },
  { id: 'pizza', label: 'Pizza' },
  { id: 'churrasco', label: 'Churrasco' },
  { id: 'japones', label: 'Japonês' },
  { id: 'hamburguer', label: 'Hambúrguer' },
  { id: 'bebida', label: 'Bebida' }
];

/**
 * Catálogo Declarativo de Missões e Conquistas
 * Para adicionar uma nova conquista, basta acrescentar um novo objeto a este array!
 */
export const ACHIEVEMENTS_LIST = [
  // --- GERAIS & INICIAÇÃO ---
  {
    id: 'first_match',
    title: 'Batismo de Garfo',
    description: 'Dispute e finalize sua primeira batalha de rodízio.',
    category: 'geral',
    icon: Swords,
    tier: 'bronze',
    points: 10,
    target: 1,
    unit: 'batalha',
    getProgress: ({ stats }) => Number(stats?.total_battles) || 0
  },
  {
    id: 'five_matches',
    title: 'Habitué de Buffet',
    description: 'Participe de pelo menos 5 disputas oficiais de rodízio.',
    category: 'geral',
    icon: Shield,
    tier: 'prata',
    points: 25,
    target: 5,
    unit: 'batalhas',
    getProgress: ({ stats }) => Number(stats?.total_battles) || 0
  },
  {
    id: 'ten_matches',
    title: 'Veterano Insaciável',
    description: 'Participe de 10 disputas oficiais de rodízio.',
    category: 'geral',
    icon: Star,
    tier: 'ouro',
    points: 50,
    target: 10,
    unit: 'batalhas',
    getProgress: ({ stats }) => Number(stats?.total_battles) || 0
  },

  // --- VITÓRIAS & CAMPEONATO ---
  {
    id: 'first_win',
    title: 'O Primeiro Troféu',
    description: 'Conquiste sua primeira vitória oficial em uma mesa.',
    category: 'vitorias',
    icon: Trophy,
    tier: 'bronze',
    points: 15,
    target: 1,
    unit: 'vitória',
    getProgress: ({ stats }) => Number(stats?.wins) || 0
  },
  {
    id: 'three_wins',
    title: 'Campeão da Galera',
    description: 'Acumule 3 vitórias oficiais na sua carreira.',
    category: 'vitorias',
    icon: Award,
    tier: 'prata',
    points: 30,
    target: 3,
    unit: 'vitórias',
    getProgress: ({ stats }) => Number(stats?.wins) || 0
  },
  {
    id: 'five_wins',
    title: 'Inabalável na Mesa',
    description: 'Acumule 5 vitórias oficiais na sua carreira.',
    category: 'vitorias',
    icon: Crown,
    tier: 'ouro',
    points: 60,
    target: 5,
    unit: 'vitórias',
    getProgress: ({ stats }) => Number(stats?.wins) || 0
  },
  {
    id: 'ten_wins',
    title: 'Lenda Suprema dos Rodízios',
    description: 'Conquiste a impressionante marca de 10 vitórias oficiais.',
    category: 'vitorias',
    icon: Sparkles,
    tier: 'diamante',
    points: 100,
    target: 10,
    unit: 'vitórias',
    getProgress: ({ stats }) => Number(stats?.wins) || 0
  },

  // --- CONSUMO GLOBAL & RECORDES EM 1 SESSÃO ---
  {
    id: 'glutton_50',
    title: 'Boca Aberta',
    description: 'Consuma um total acumulado de 50 porções de rodízio.',
    category: 'geral',
    icon: Flame,
    tier: 'bronze',
    points: 15,
    target: 50,
    unit: 'porções',
    getProgress: ({ stats }) => Number(stats?.total_slices) || 0
  },
  {
    id: 'glutton_100',
    title: 'Centenário da Gula',
    description: 'Devore um total acumulado de 100 porções na sua trajetória.',
    category: 'geral',
    icon: Zap,
    tier: 'prata',
    points: 35,
    target: 100,
    unit: 'porções',
    getProgress: ({ stats }) => Number(stats?.total_slices) || 0
  },
  {
    id: 'glutton_200',
    title: 'Titã do Banquete',
    description: 'Alcance a marca épica de 200 porções devoradas.',
    category: 'geral',
    icon: Crown,
    tier: 'ouro',
    points: 70,
    target: 200,
    unit: 'porções',
    getProgress: ({ stats }) => Number(stats?.total_slices) || 0
  },
  {
    id: 'record_20',
    title: 'Recordista em 1 Mesa',
    description: 'Consuma pelo menos 20 porções em uma única partida.',
    category: 'geral',
    icon: Target,
    tier: 'prata',
    points: 30,
    target: 20,
    unit: 'porções em 1 mesa',
    getProgress: ({ stats }) => Number(stats?.max_slices) || 0
  },

  // --- PIZZA ---
  {
    id: 'pizza_lover',
    title: 'Pizzaiolo Honorário',
    description: 'Consuma 25 fatias em rodízios de pizza.',
    category: 'pizza',
    icon: Pizza,
    tier: 'bronze',
    points: 20,
    target: 25,
    unit: 'fatias',
    getProgress: ({ byType }) => byType?.pizza?.total_consumed || 0
  },

  // --- CHURRASCO ---
  {
    id: 'churrasco_carnivore',
    title: 'Mestre da Brasa',
    description: 'Consuma 20 pedaços de carne em rodízios de churrasco.',
    category: 'churrasco',
    icon: Flame,
    tier: 'bronze',
    points: 20,
    target: 20,
    unit: 'pedaços',
    getProgress: ({ byType }) => byType?.churrasco?.total_consumed || 0
  },
  {
    id: 'churrasco_champion',
    title: 'Rei do Espeto Corrido',
    description: 'Vença pelo menos 1 batalha em rodízio de churrasco.',
    category: 'churrasco',
    icon: Trophy,
    tier: 'prata',
    points: 35,
    target: 1,
    unit: 'vitória em churrasco',
    getProgress: ({ byType }) => byType?.churrasco?.wins || 0
  },

  // --- JAPONÊS ---
  {
    id: 'japones_sushi',
    title: 'Barco Viking',
    description: 'Consuma 30 peças em rodízios de culinária japonesa.',
    category: 'japones',
    icon: Fish,
    tier: 'bronze',
    points: 20,
    target: 30,
    unit: 'peças',
    getProgress: ({ byType }) => byType?.japones?.total_consumed || 0
  },

  // --- HAMBÚRGUER ---
  {
    id: 'burger_crusher',
    title: 'Moedor de Burgers',
    description: 'Consuma 5 hambúrgueres em rodízios de hambúrguer.',
    category: 'hamburguer',
    icon: Sandwich,
    tier: 'bronze',
    points: 20,
    target: 5,
    unit: 'burgers',
    getProgress: ({ byType }) => byType?.hamburguer?.total_consumed || 0
  },

  // --- BEBIDA ---
  {
    id: 'drink_hydrated',
    title: 'Tanque Cheio',
    description: 'Consuma 10 copos em rodízios de bebida.',
    category: 'bebida',
    icon: Beer,
    tier: 'bronze',
    points: 20,
    target: 10,
    unit: 'copos',
    getProgress: ({ byType }) => byType?.bebida?.total_consumed || 0
  },

  // --- EXPLORAÇÃO & POLIVALÊNCIA ---
  {
    id: 'all_rounder',
    title: 'Paladar Universal',
    description: 'Dispute partidas em pelo menos 3 modalidades diferentes de rodízio.',
    category: 'geral',
    icon: Compass,
    tier: 'ouro',
    points: 50,
    target: 3,
    unit: 'modalidades',
    getProgress: ({ byType }) => {
      if (!byType) return 0;
      return Object.values(byType).filter(t => (Number(t?.battles) || 0) > 0).length;
    }
  }
];

/**
 * Avalia o progresso de cada missão a partir das estatísticas consolidadas da conta
 */
export function calculateAchievements(stats, byType, history = []) {
  const context = {
    stats: stats || {},
    byType: byType || {},
    history: history || []
  };

  let unlockedCount = 0;
  let unlockedPoints = 0;
  let totalPoints = 0;

  const evaluated = ACHIEVEMENTS_LIST.map(ach => {
    const rawValue = ach.getProgress(context);
    const currentValue = Math.max(0, rawValue);
    const isUnlocked = currentValue >= ach.target;
    const progressPercent = Math.min(100, Math.round((currentValue / ach.target) * 100));

    totalPoints += ach.points;
    if (isUnlocked) {
      unlockedCount += 1;
      unlockedPoints += ach.points;
    }

    return {
      ...ach,
      currentValue,
      isUnlocked,
      progressPercent,
      tierConfig: ACHIEVEMENT_TIERS[ach.tier] || ACHIEVEMENT_TIERS.bronze
    };
  });

  const totalCount = ACHIEVEMENTS_LIST.length;
  const percentComplete = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return {
    achievements: evaluated,
    unlockedCount,
    totalCount,
    unlockedPoints,
    totalPoints,
    percentComplete
  };
}

