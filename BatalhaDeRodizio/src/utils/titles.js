export const RANKS = [
  { level: 1, title: 'Iniciante do Rodízio', minWins: 0, minItems: 0 },
  { level: 2, title: 'Aspirante de Mesa', minWins: 1, minItems: 20 },
  { level: 3, title: 'Veterano do Buffet', minWins: 2, minItems: 40 },
  { level: 4, title: 'Guerreiro do Rodízio', minWins: 3, minItems: 60 },
  { level: 5, title: 'Comilão de Elite', minWins: 4, minItems: 80 },
  { level: 6, title: 'Mestre da Degustação', minWins: 5, minItems: 100 },
  { level: 7, title: 'Titã do Banquete', minWins: 6, minItems: 120 },
  { level: 8, title: 'Lenda do Rodízio', minWins: 7, minItems: 140 },
  { level: 9, title: 'Mito da Mesa', minWins: 8, minItems: 160 },
  { level: 10, title: 'Lenda Suprema do Rodízio', minWins: 9, minItems: 180 },
  { level: 11, title: 'Divindade do Rodízio', minWins: 10, minItems: 200 }
];

export function getRankInfo(wins = 0, totalItems = 0) {
  const w = Math.max(0, Number(wins) || 0);
  const s = Math.max(0, Number(totalItems) || 0);

  // Find current rank (highest rank where user meets either win OR items requirement)
  let currentRankIndex = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (w >= RANKS[i].minWins || s >= RANKS[i].minItems) {
      currentRankIndex = i;
      break;
    }
  }

  const currentRank = RANKS[currentRankIndex];
  const nextRank = currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null;

  let neededWins = 0;
  let neededItems = 0;
  let progressPercent = 100;

  if (nextRank) {
    neededWins = Math.max(0, nextRank.minWins - w);
    neededItems = Math.max(0, nextRank.minItems - s);

    // Progress within current tier (0-100%)
    const winsInTier = Math.max(0, w - currentRank.minWins);
    const winsNeededInTier = nextRank.minWins - currentRank.minWins;
    const winProg = winsNeededInTier > 0 ? winsInTier / winsNeededInTier : 0;

    const itemsInTier = Math.max(0, s - currentRank.minItems);
    const itemsNeededInTier = nextRank.minItems - currentRank.minItems;
    const itemProg = itemsNeededInTier > 0 ? itemsInTier / itemsNeededInTier : 0;

    progressPercent = Math.min(99, Math.max(0, Math.round(Math.max(winProg, itemProg) * 100)));
  }

  return {
    currentRank,
    nextRank,
    neededWins,
    neededItems,
    progressPercent,
    isMaxRank: !nextRank
  };
}

export function getTitleByStats(wins = 0, totalItems = 0) {
  return getRankInfo(wins, totalItems).currentRank.title;
}
