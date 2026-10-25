/**
 * FC27 Tournament ELO Rating Engine
 * 
 * Rules & Formula:
 * 1. Default starting rating for all participants: 500 ELO.
 * 2. Matches where a player withdrew/walkover (status === 'walkover') are strictly EXCLUDED.
 *    Only matches where both players actually played (status === 'completed' with valid scores) are considered.
 * 3. Chronological simulation: matches are processed in exact completion order (completedAt or matchNumber).
 * 4. Expected Score:
 *    E1 = 1 / (1 + 10 ^ ((R2 - R1) / 400))
 *    E2 = 1 - E1
 * 5. Actual Outcome:
 *    Win = 1.0, Draw = 0.5, Loss = 0.0
 * 6. Stage-based K-Factor:
 *    - Group stage: K = 32
 *    - Round of 32: K = 36
 *    - Round of 16: K = 40
 *    - Quarterfinals: K = 44
 *    - Semifinals: K = 48
 *    - Final: K = 56
 * 7. Goal Margin Multiplier (MOV):
 *    - diff <= 1: 1.0x
 *    - diff == 2: 1.25x
 *    - diff == 3: 1.50x
 *    - diff >= 4: min(2.2x, 1.75 + (diff - 4) * 0.1)
 * 8. Rating Delta:
 *    Delta1 = round(K * MOV * (S1 - E1))
 *    (Guaranteed >= 1 on win, <= -1 on loss)
 *    Delta2 = -Delta1
 * 9. Unranked players:
 *    Players who played 0 matches are designated as 'غير مصنف' (Unranked) with null ELO.
 */

export const DEFAULT_ELO = 500;

export const STAGE_K = {
  group: 32,
  r32: 36,
  r16: 40,
  qf: 44,
  sf: 48,
  final: 56
};

export const STAGE_NAMES_AR = {
  group: 'المجموعات',
  r32: 'دور الـ 32',
  r16: 'ثمن النهائي (16)',
  qf: 'ربع النهائي',
  sf: 'نصف النهائي',
  final: 'المباراة النهائية 🏆'
};

export const ELO_TIERS = {
  ELITE: {
    id: 'elite',
    name: 'النخبة',
    englishName: 'Elite',
    min: 600,
    max: 9999,
    badgeClass: 'badge-gold',
    icon: '💎',
    color: '#B45309',
    bgColor: '#FEF3C7',
    borderColor: '#FCD34D'
  },
  GOLD: {
    id: 'gold',
    name: 'الذهبي',
    englishName: 'Gold',
    min: 550,
    max: 599,
    badgeClass: 'badge-gold',
    icon: '🥇',
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A'
  },
  SILVER: {
    id: 'silver',
    name: 'الفضي',
    englishName: 'Silver',
    min: 500,
    max: 549,
    badgeClass: 'badge-green',
    icon: '🥈',
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  BRONZE: {
    id: 'bronze',
    name: 'البرونزي',
    englishName: 'Bronze',
    min: 450,
    max: 499,
    badgeClass: 'badge-gray',
    icon: '🥉',
    color: '#78350F',
    bgColor: '#F5F5F4',
    borderColor: '#D6D3D1'
  },
  CHALLENGER: {
    id: 'challenger',
    name: 'المتحدي',
    englishName: 'Challenger',
    min: 0,
    max: 449,
    badgeClass: 'badge-gray',
    icon: '🛡️',
    color: '#475569',
    bgColor: '#F8FAFC',
    borderColor: '#CBD5E1'
  },
  UNRANKED: {
    id: 'unranked',
    name: 'غير مصنف',
    englishName: 'Unranked',
    min: null,
    max: null,
    badgeClass: 'badge-gray',
    icon: '⚪',
    color: '#94A3B8',
    bgColor: '#F1F5F9',
    borderColor: '#E2E8F0'
  }
};

/**
 * Goal Margin of Victory Multiplier
 */
export function getGoalMarginMultiplier(goalDiff) {
  const d = Math.abs(goalDiff || 0);
  if (d <= 1) return 1.0;
  if (d === 2) return 1.25;
  if (d === 3) return 1.5;
  return Math.min(2.2, 1.75 + (d - 4) * 0.1);
}

/**
 * Return tier info for a given ELO rating and match count
 */
export function getEloTier(elo, playedCount = 1) {
  if (playedCount === 0 || elo === null || elo === undefined) {
    return ELO_TIERS.UNRANKED;
  }
  if (elo >= 600) return ELO_TIERS.ELITE;
  if (elo >= 550) return ELO_TIERS.GOLD;
  if (elo >= 500) return ELO_TIERS.SILVER;
  if (elo >= 450) return ELO_TIERS.BRONZE;
  return ELO_TIERS.CHALLENGER;
}

/**
 * Calculate single match ELO delta
 */
export function calculateMatchEloDelta(r1, r2, score1, score2, stage = 'group') {
  const rating1 = Number(r1) || DEFAULT_ELO;
  const rating2 = Number(r2) || DEFAULT_ELO;
  const s1 = Number(score1) || 0;
  const s2 = Number(score2) || 0;

  const expected1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 400));
  const expected2 = 1 - expected1;

  let actual1 = 0.5;
  let actual2 = 0.5;
  if (s1 > s2) {
    actual1 = 1.0;
    actual2 = 0.0;
  } else if (s2 > s1) {
    actual1 = 0.0;
    actual2 = 1.0;
  }

  const k = STAGE_K[stage] || 32;
  const goalDiff = Math.abs(s1 - s2);
  const mov = getGoalMarginMultiplier(goalDiff);

  let delta1 = Math.round(k * mov * (actual1 - expected1));
  if (actual1 === 1.0 && delta1 < 1) delta1 = 1;
  if (actual1 === 0.0 && delta1 > -1) delta1 = -1;
  const delta2 = -delta1;

  return {
    delta1,
    delta2,
    expected1: Math.round(expected1 * 100),
    expected2: Math.round(expected2 * 100),
    mov
  };
}

/**
 * Simulate the complete tournament ELO progression chronologically.
 * Strictly ignores walkover / forfeit matches.
 * 
 * @param {Array} matches - All tournament matches
 * @param {Array} participants - All registered participants
 * @returns {Object} Simulation results including player ratings, deltas, and stats
 */
export function simulateTournamentElo(matches = [], participants = []) {
  const pMap = {};
  participants.forEach(p => {
    if (p && p.id) {
      pMap[p.id] = p;
    }
  });

  // Filter ONLY valid completed matches where both players actually played (no walkovers)
  const validMatches = matches.filter(m => {
    if (!m) return false;
    if (m.status !== 'completed') return false;
    if (m.score1 === null || m.score1 === undefined || m.score2 === null || m.score2 === undefined) return false;
    if (!m.player1Id || !m.player2Id) return false;
    return true;
  });

  // Sort chronologically: completedAt timestamp first, then dayNumber, then matchNumber
  const sortedMatches = [...validMatches].sort((a, b) => {
    const tA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const tB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    if (tA && tB && tA !== tB) return tA - tB;
    if (tA && !tB) return -1;
    if (!tA && tB) return 1;
    const dayA = a.dayNumber || 1;
    const dayB = b.dayNumber || 1;
    if (dayA !== dayB) return dayA - dayB;
    return (a.matchNumber || 0) - (b.matchNumber || 0);
  });

  // Initialize all participants with DEFAULT_ELO
  const ratings = {};
  const stats = {};
  participants.forEach(p => {
    ratings[p.id] = DEFAULT_ELO;
    stats[p.id] = {
      id: p.id,
      name: p.name || 'لاعب',
      team: p.team || '',
      room: p.room || '',
      building: p.building || '',
      phone: p.phone || p.displayPhone || '',
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      highestElo: DEFAULT_ELO,
      lowestElo: DEFAULT_ELO,
      eloHistory: [
        {
          matchNumber: 0,
          stage: 'initial',
          stageName: 'نقطة الانطلاق',
          eloBefore: DEFAULT_ELO,
          delta: 0,
          eloAfter: DEFAULT_ELO,
          opponentName: 'بداية التصنيف',
          score: '—',
          isWin: null
        }
      ]
    };
  });

  const matchEloDeltas = {};

  // Step-by-step chronological simulation
  sortedMatches.forEach(m => {
    const p1Id = m.player1Id;
    const p2Id = m.player2Id;

    if (ratings[p1Id] === undefined) ratings[p1Id] = DEFAULT_ELO;
    if (ratings[p2Id] === undefined) ratings[p2Id] = DEFAULT_ELO;

    if (!stats[p1Id]) {
      const p = pMap[p1Id] || {};
      stats[p1Id] = {
        id: p1Id,
        name: p.name || m.player1Placeholder || 'لاعب',
        team: p.team || '',
        room: p.room || '',
        building: p.building || '',
        phone: p.phone || p.displayPhone || '',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        highestElo: DEFAULT_ELO,
        lowestElo: DEFAULT_ELO,
        eloHistory: []
      };
    }

    if (!stats[p2Id]) {
      const p = pMap[p2Id] || {};
      stats[p2Id] = {
        id: p2Id,
        name: p.name || m.player2Placeholder || 'لاعب',
        team: p.team || '',
        room: p.room || '',
        building: p.building || '',
        phone: p.phone || p.displayPhone || '',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        highestElo: DEFAULT_ELO,
        lowestElo: DEFAULT_ELO,
        eloHistory: []
      };
    }

    const r1Before = ratings[p1Id];
    const r2Before = ratings[p2Id];

    const s1 = Number(m.score1) || 0;
    const s2 = Number(m.score2) || 0;

    const { delta1, delta2, expected1, expected2 } = calculateMatchEloDelta(r1Before, r2Before, s1, s2, m.stage);

    ratings[p1Id] += delta1;
    ratings[p2Id] += delta2;

    const r1After = ratings[p1Id];
    const r2After = ratings[p2Id];

    // Update stats
    stats[p1Id].played += 1;
    stats[p2Id].played += 1;
    stats[p1Id].goalsFor += s1;
    stats[p1Id].goalsAgainst += s2;
    stats[p2Id].goalsFor += s2;
    stats[p2Id].goalsAgainst += s1;

    let isP1Win = false;
    let isP2Win = false;
    let isDraw = false;

    if (s1 > s2) {
      stats[p1Id].won += 1;
      stats[p2Id].lost += 1;
      isP1Win = true;
    } else if (s2 > s1) {
      stats[p2Id].won += 1;
      stats[p1Id].lost += 1;
      isP2Win = true;
    } else {
      stats[p1Id].drawn += 1;
      stats[p2Id].drawn += 1;
      isDraw = true;
    }

    stats[p1Id].highestElo = Math.max(stats[p1Id].highestElo, r1After);
    stats[p1Id].lowestElo = Math.min(stats[p1Id].lowestElo, r1After);
    stats[p2Id].highestElo = Math.max(stats[p2Id].highestElo, r2After);
    stats[p2Id].lowestElo = Math.min(stats[p2Id].lowestElo, r2After);

    const stageLabel = STAGE_NAMES_AR[m.stage] || 'مباراة';

    // Record history
    stats[p1Id].eloHistory.push({
      matchId: m.id,
      matchNumber: m.matchNumber,
      stage: m.stage || 'group',
      stageName: stageLabel,
      eloBefore: r1Before,
      delta: delta1,
      eloAfter: r1After,
      opponentId: p2Id,
      opponentName: stats[p2Id].name,
      opponentTeam: stats[p2Id].team,
      score: `${s1} - ${s2}`,
      expectedPercent: expected1,
      isWin: isP1Win ? true : (isDraw ? 'draw' : false)
    });

    stats[p2Id].eloHistory.push({
      matchId: m.id,
      matchNumber: m.matchNumber,
      stage: m.stage || 'group',
      stageName: stageLabel,
      eloBefore: r2Before,
      delta: delta2,
      eloAfter: r2After,
      opponentId: p1Id,
      opponentName: stats[p1Id].name,
      opponentTeam: stats[p1Id].team,
      score: `${s2} - ${s1}`,
      expectedPercent: expected2,
      isWin: isP2Win ? true : (isDraw ? 'draw' : false)
    });

    // Save delta map indexed by match ID
    matchEloDeltas[m.id] = {
      p1Delta: delta1,
      p2Delta: delta2,
      p1Before: r1Before,
      p2Before: r2Before,
      p1After: r1After,
      p2After: r2After,
      expected1,
      expected2
    };
  });

  // Split into Ranked and Unranked
  const allList = Object.values(stats).map(p => {
    const isRanked = p.played > 0;
    const finalElo = isRanked ? ratings[p.id] : null;
    const goalDiff = p.goalsFor - p.goalsAgainst;
    const deltaTotal = isRanked ? (ratings[p.id] - DEFAULT_ELO) : 0;
    const tier = getEloTier(finalElo, p.played);
    const winRate = p.played > 0 ? Math.round((p.won / p.played) * 100) : 0;

    return {
      ...p,
      isRanked,
      elo: finalElo,
      goalDiff,
      deltaTotal,
      tier,
      winRate
    };
  });

  const rankedPlayers = allList
    .filter(p => p.isRanked)
    .sort((a, b) => {
      if (b.elo !== a.elo) return b.elo - a.elo;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return b.won - a.won;
    })
    .map((p, index) => ({
      ...p,
      rank: index + 1
    }));

  const unrankedPlayers = allList
    .filter(p => !p.isRanked)
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'))
    .map(p => ({
      ...p,
      rank: null
    }));

  return {
    playerRatings: ratings,
    matchDeltas: matchEloDeltas,
    rankedPlayers,
    unrankedPlayers,
    allPlayers: [...rankedPlayers, ...unrankedPlayers],
    totalMatchesCount: validMatches.length
  };
}
