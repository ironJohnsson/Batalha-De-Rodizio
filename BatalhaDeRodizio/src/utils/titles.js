export function getTitleByStats(wins = 0, totalSlices = 0) {
  const w = Number(wins) || 0;
  const s = Number(totalSlices) || 0;

  if (w >= 35 || s >= 350) return 'Lenda Suprema do Rodízio';
  if (w >= 20 || s >= 200) return 'Comilão de Elite';
  if (w >= 10 || s >= 100) return 'Veterano do Buffet';
  if (w >= 5 || s >= 50) return 'Intermediário de Mesa';
  return 'Iniciante no Rodízio';
}
