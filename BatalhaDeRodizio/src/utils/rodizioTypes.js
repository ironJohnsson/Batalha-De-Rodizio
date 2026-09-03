import { Pizza, Fish, Sandwich, Beer, Flame, Utensils } from 'lucide-react';

export const RODIZIO_TYPES = [
  {
    id: 'pizza',
    label: 'Pizza',
    icon: Pizza,
    emoji: '🍕',
    unitSingular: 'fatia',
    unitPlural: 'fatias',
    buttonAdd: '+1 FATIA',
    actionSub: 'Desfazer última fatia (-1)',
    color: 'orange',
    accentBorder: 'border-orange-500',
    accentBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    description: 'Pizzas salgadas e doces'
  },
  {
    id: 'japones',
    label: 'Japonês',
    icon: Fish,
    emoji: '🍣',
    unitSingular: 'peça',
    unitPlural: 'peças',
    buttonAdd: '+1 PEÇA',
    actionSub: 'Desfazer última peça (-1)',
    color: 'rose',
    accentBorder: 'border-rose-500',
    accentBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    description: 'Sushis, sashimis e temakis'
  },
  {
    id: 'hamburguer',
    label: 'Hambúrguer',
    icon: Sandwich,
    emoji: '🍔',
    unitSingular: 'burger',
    unitPlural: 'burgers',
    buttonAdd: '+1 BURGER',
    actionSub: 'Desfazer último burger (-1)',
    color: 'amber',
    accentBorder: 'border-amber-500',
    accentBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    description: 'Mini hambúrgueres e lanches'
  },
  {
    id: 'bebida',
    label: 'Bebida',
    icon: Beer,
    emoji: '🍻',
    unitSingular: 'copo',
    unitPlural: 'copos',
    buttonAdd: '+1 COPO',
    actionSub: 'Desfazer último copo (-1)',
    color: 'sky',
    accentBorder: 'border-sky-500',
    accentBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    description: 'Chopps, cervejas e drinks'
  },
  {
    id: 'churrasco',
    label: 'Churrasco',
    icon: Flame,
    emoji: '🥩',
    unitSingular: 'pedaço',
    unitPlural: 'pedaços',
    buttonAdd: '+1 PEDAÇO',
    actionSub: 'Desfazer último pedaço (-1)',
    color: 'red',
    accentBorder: 'border-red-500',
    accentBg: 'bg-red-500/10 text-red-600 dark:text-red-400',
    description: 'Carnes nobres e espetos'
  }
];

export const CHURRASCO_RULES = [
  {
    number: 1,
    badge: 'Regra Principal',
    title: 'Porções Múltiplas = 1 Pedaço',
    description: 'Carnes servidas em porções com vários itens de uma só vez (como coração de galinha, cubos de queijo coalho ou tulipas de frango servidas juntas) contam como apenas 1 unidade/rodada para medição justa.',
    highlight: true
  },
  {
    number: 2,
    badge: 'Cortes Tradicionais',
    title: 'Fatias e Cortes Individuais',
    description: 'Cada fatia ou corte servido individualmente pelo garçom (picanha, maminha, alcatra, fraldinha, etc.) conta normalmente como 1 pedaço.',
    highlight: false
  },
  {
    number: 3,
    badge: 'Acompanhamentos',
    title: 'Itens do Rodízio vs Guarnições',
    description: 'Apenas os espetos que passam na mesa entram na disputa (pão de alho e queijo no espeto contam). Guarnições do buffet de apoio (farofa, arroz, batata frita e saladas) não contam na pontuação.',
    highlight: false
  },
  {
    number: 4,
    badge: 'Fair Play',
    title: 'Consenso da Mesa',
    description: 'Caso surja qualquer dúvida sobre um corte ou porção durante a rodada, a decisão oficial deve ser tomada por acordo mútuo entre os amigos da mesa antes de registrar.',
    highlight: false
  }
];

export function getRodizioConfig(type) {
  const normalized = (type || 'pizza').toLowerCase().trim();
  return RODIZIO_TYPES.find(t => t.id === normalized) || RODIZIO_TYPES[0];
}

export function getUnitLabel(type, count) {
  const config = getRodizioConfig(type);
  return count === 1 ? config.unitSingular : config.unitPlural;
}

