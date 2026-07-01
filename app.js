"use strict";

const PLAYER_PRESETS = {
  3: {
    names: ["Vous", "Est", "Ouest"],
    positions: ["south", "east", "west"],
    dogSize: 6,
  },
  4: {
    names: ["Vous", "Est", "Nord", "Ouest"],
    positions: ["south", "east", "north", "west"],
    dogSize: 6,
  },
  5: {
    names: ["Vous", "Est", "Nord-Est", "Nord-Ouest", "Ouest"],
    positions: ["south", "east", "north-east", "north-west", "west"],
    dogSize: 3,
  },
};

const PLAYER_NAMES = PLAYER_PRESETS[4].names;

const OPPONENT_SPEEDS = {
  slow: { label: "Lente", bidDelay: 1500, cardDelay: 2000, trickDelay: 3800 },
  normal: { label: "Normale", bidDelay: 900, cardDelay: 1200, trickDelay: 2400 },
  fast: { label: "Rapide", bidDelay: 450, cardDelay: 650, trickDelay: 1300 },
};

const OPPONENT_LEVELS = {
  beginner: { label: "Débutant", samples: 4, randomness: 0.48, bidFactor: 0.86 },
  normal: { label: "Normal", samples: 14, randomness: 0.22, bidFactor: 1 },
  strong: { label: "Fort", samples: 26, randomness: 0.08, bidFactor: 1.08 },
};

const COACH_MODES = {
  none: { label: "Sans aide" },
  hint: { label: "Indice avant" },
  review: { label: "Analyse après" },
  full: { label: "Coach complet" },
};

const SIDE_TABS = [
  { id: "coach", label: "Coach" },
  { id: "score", label: "Score" },
  { id: "history", label: "Historique" },
];

const SIDE_PANELS = [
  { id: "actions", label: "Actions" },
  { id: "coach", label: "Coach" },
  { id: "score", label: "Score" },
  { id: "history", label: "Historique" },
  { id: "settings", label: "Réglages" },
];

const BOUT_IDS = ["trump-1", "trump-21", "excuse"];

const HANDFUL_THRESHOLDS = {
  3: { poignee: 13, double: 15, triple: 18 },
  4: { poignee: 10, double: 13, triple: 15 },
  5: { poignee: 8, double: 10, triple: 13 },
};

const SUITS = [
  { id: "spades", name: "Pique", symbol: "♠", color: "black" },
  { id: "hearts", name: "Cœur", symbol: "♥", color: "red" },
  { id: "diamonds", name: "Carreau", symbol: "♦", color: "red" },
  { id: "clubs", name: "Trèfle", symbol: "♣", color: "black" },
];

const RANKS = [
  { id: "1", label: "1", strength: 1, points: 0.5 },
  { id: "2", label: "2", strength: 2, points: 0.5 },
  { id: "3", label: "3", strength: 3, points: 0.5 },
  { id: "4", label: "4", strength: 4, points: 0.5 },
  { id: "5", label: "5", strength: 5, points: 0.5 },
  { id: "6", label: "6", strength: 6, points: 0.5 },
  { id: "7", label: "7", strength: 7, points: 0.5 },
  { id: "8", label: "8", strength: 8, points: 0.5 },
  { id: "9", label: "9", strength: 9, points: 0.5 },
  { id: "10", label: "10", strength: 10, points: 0.5 },
  { id: "V", label: "V", strength: 11, points: 1.5 },
  { id: "C", label: "C", strength: 12, points: 2.5 },
  { id: "D", label: "D", strength: 13, points: 3.5 },
  { id: "R", label: "R", strength: 14, points: 4.5 },
];

const MODES = [
  { id: "home", label: "Accueil", icon: "home" },
  { id: "learn", label: "Apprentissage", icon: "book" },
  { id: "guided", label: "Partie guidée", icon: "cards" },
  { id: "versus", label: "Contre ordinateur", icon: "computer" },
  { id: "strategy", label: "Stratégies", icon: "target" },
];

const CONTRACTS = {
  petite: { id: "petite", name: "Petite", multiplier: 1, dogMode: "take" },
  garde: { id: "garde", name: "Garde", multiplier: 2, dogMode: "take" },
  gardeSans: { id: "gardeSans", name: "Garde sans le chien", multiplier: 4, dogMode: "taker" },
  gardeContre: { id: "gardeContre", name: "Garde contre le chien", multiplier: 6, dogMode: "defense" },
};

const DEFAULT_CONTRACT_ID = "garde";
const CONTRACT_ORDER = ["petite", "garde", "gardeSans", "gardeContre"];
const PASS_BID = "pass";

const OPPONENT_PROFILES = [
  { id: "player", label: "Joueur", risk: 0.95, defense: 0.8, memory: 0.8 },
  { id: "prudent", label: "Prudent", risk: 0.78, defense: 1.08, memory: 0.9 },
  { id: "aggressive", label: "Agressif", risk: 1.18, defense: 0.85, memory: 0.65 },
  { id: "defender", label: "Défenseur", risk: 0.9, defense: 1.22, memory: 1 },
];

const STORAGE_KEY = "coach-tarot-progress-v2";
const LEGACY_STORAGE_KEYS = ["tarot-trainer-progress-v2"];
const DOG_TEST_SEQUENCE = "chien";
let dogTestSequenceBuffer = "";
let dogTestKeydownBound = false;

const STRATEGY_LESSONS = [
  {
    title: "Lire sa main avant d'enchérir",
    text:
      "Comptez les bouts, les gros atouts, les rois et les longues couleurs. Une main forte doit pouvoir prendre des plis et protéger ses bouts après l'écart.",
    scenario: 4,
  },
  {
    title: "Choisir quand couper",
    text:
      "Couper sert à prendre la main, mais chaque atout dépensé réduit votre contrôle futur. Le bon réflexe est de couper petit quand le pli est faible et de garder les gros atouts pour les plis chargés.",
    scenario: 1,
  },
  {
    title: "Protéger les bouts",
    text:
      "Le Petit, le 21 et l'Excuse valent cher pour le contrat. Un bout joué sans sécurité doit compenser par un gain clair: sauver un pli lourd, reprendre la main, ou éviter une perte forcée.",
    scenario: 2,
  },
  {
    title: "Défausser utilement",
    text:
      "Quand vous ne pouvez ni fournir ni couper, la défausse doit retirer une carte faible ou dangereuse. Garder les rois et dames devient prioritaire si l'adversaire contrôle encore la couleur.",
    scenario: 3,
  },
  {
    title: "Charger ou sauver",
    text:
      "En défense, chargez un pli promis à votre camp, mais ne donnez pas une tête quand le preneur peut encore couper ou surcouper.",
    scenario: 4,
  },
  {
    title: "Compter les atouts",
    text:
      "Mémoriser les atouts tombés permet d'anticiper les fins de pli, de protéger le Petit et de savoir quand un gros atout devient maître.",
    scenario: 2,
  },
  {
    title: "Finir une couleur",
    text:
      "Quand une couleur est épuisée chez un adversaire, chaque retour dans cette couleur peut forcer une coupe ou une défausse utile.",
    scenario: 0,
  },
];

const SCENARIOS = [
  {
    title: "Fournir avant de couper",
    focus: "Règle de couleur",
    difficulty: "Débutant",
    lesson:
      "Si une couleur est demandée et que vous en avez, vous devez fournir cette couleur. Couper avec un atout serait illégal, même si l'atout gagne le pli.",
    goal: "Identifier les cartes jouables, puis choisir la moins coûteuse.",
    currentPlayer: 0,
    leader: 1,
    trick: [
      { player: 1, card: "hearts-R" },
    ],
    hands: [
      ["hearts-1", "hearts-9", "trump-1", "spades-R", "clubs-7", "excuse"],
      ["hearts-R", "diamonds-5", "clubs-3", "trump-8"],
      ["hearts-D", "spades-3", "clubs-R", "trump-4"],
      ["hearts-7", "diamonds-R", "spades-10", "trump-12"],
    ],
  },
  {
    title: "Couper sans gaspiller",
    focus: "Gestion des atouts",
    difficulty: "Intermédiaire",
    lesson:
      "Quand vous n'avez pas la couleur demandée, vous devez couper si vous possédez un atout. Si personne n'a coupé plus haut, le plus petit atout suffisant garde vos gros atouts pour plus tard.",
    goal: "Prendre le pli avec le coût minimal.",
    currentPlayer: 0,
    leader: 1,
    trick: [
      { player: 1, card: "diamonds-D" },
      { player: 2, card: "diamonds-10" },
    ],
    hands: [
      ["trump-3", "trump-11", "trump-21", "spades-8", "clubs-C", "excuse"],
      ["diamonds-D", "diamonds-4", "spades-2", "trump-7"],
      ["diamonds-10", "hearts-R", "clubs-6", "trump-14"],
      ["diamonds-R", "spades-D", "clubs-1", "trump-9"],
    ],
  },
  {
    title: "Surcouper et sauver le Petit",
    focus: "Petit en danger",
    difficulty: "Intermédiaire",
    lesson:
      "À l'atout, si vous pouvez monter au-dessus du meilleur atout déjà posé, vous devez le faire. Cela peut éviter de livrer le Petit quand un atout supérieur est disponible.",
    goal: "Respecter la surcoupe obligatoire sans sacrifier un bout.",
    currentPlayer: 0,
    leader: 1,
    trick: [
      { player: 1, card: "trump-18" },
    ],
    hands: [
      ["trump-1", "trump-5", "trump-20", "spades-R", "diamonds-2", "clubs-8"],
      ["trump-18", "hearts-5", "spades-4", "clubs-R"],
      ["trump-21", "hearts-D", "clubs-2", "diamonds-6"],
      ["trump-7", "hearts-1", "clubs-D", "spades-6"],
    ],
  },
  {
    title: "Défausser quand tout est perdu",
    focus: "Défausse",
    difficulty: "Débutant",
    lesson:
      "Sans couleur demandée et sans atout, vous ne pouvez pas gagner le pli. La meilleure carte est souvent une petite carte sans valeur, pas une tête que vous pourriez sauver plus tard.",
    goal: "Limiter les points donnés à l'adversaire.",
    currentPlayer: 0,
    leader: 1,
    trick: [
      { player: 1, card: "clubs-R" },
      { player: 2, card: "clubs-10" },
      { player: 3, card: "clubs-D" },
    ],
    hands: [
      ["spades-2", "spades-R", "hearts-D", "diamonds-1", "diamonds-C", "excuse"],
      ["clubs-R", "trump-6", "hearts-4", "diamonds-9"],
      ["clubs-10", "trump-8", "spades-5", "diamonds-R"],
      ["clubs-D", "trump-4", "hearts-7", "spades-C"],
    ],
  },
  {
    title: "Prendre la main au bon moment",
    focus: "Contrôle",
    difficulty: "Avancé",
    lesson:
      "Un gros atout dépensé pour un pli vide est rarement rentable. Sur un pli chargé en points, prendre la main peut protéger votre camp et vous donner l'initiative au pli suivant.",
    goal: "Comparer le gain immédiat avec la valeur de contrôle de la carte.",
    currentPlayer: 0,
    leader: 1,
    trick: [
      { player: 1, card: "spades-R" },
      { player: 2, card: "spades-D" },
    ],
    hands: [
      ["spades-1", "trump-9", "trump-21", "hearts-3", "clubs-9", "excuse"],
      ["spades-R", "diamonds-4", "trump-3", "hearts-8"],
      ["spades-D", "diamonds-D", "trump-12", "clubs-5"],
      ["spades-C", "diamonds-R", "trump-17", "clubs-2"],
    ],
  },
];

const CARD_LIBRARY = createDeck();
const CARD_BY_ID = new Map(CARD_LIBRARY.map((card) => [card.id, card]));
const SAVED_GAMES = loadSavedGames();

const state = {
  mode: "home",
  learning: {
    scenarioIndex: 0,
    selectedCardId: null,
    inspectedIllegalCard: null,
    analyses: [],
    attempts: [],
  },
  games: {
    guided: SAVED_GAMES.games.guided,
    versus: SAVED_GAMES.games.versus,
  },
  stats: loadProgress(),
  settings: { ...loadSettings(), navCollapsed: false },
  message: "",
  animating: false,
  opponentTimer: null,
  gameSequence: Math.max(1, SAVED_GAMES.maxId || 1),
};

function createDeck() {
  const cards = [];

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({
        id: `${suit.id}-${rank.id}`,
        type: "suit",
        suit: suit.id,
        suitName: suit.name,
        symbol: suit.symbol,
        color: suit.color,
        rank: rank.id,
        label: rank.label,
        strength: rank.strength,
        points: rank.points,
        bout: false,
      });
    }
  }

  for (let value = 1; value <= 21; value += 1) {
    cards.push({
      id: `trump-${value}`,
      type: "trump",
      suit: "trump",
      suitName: "Atout",
      symbol: "A",
      color: "gold",
      rank: String(value),
      label: String(value),
      strength: value,
      points: value === 1 || value === 21 ? 4.5 : 0.5,
      bout: value === 1 || value === 21,
    });
  }

  cards.push({
    id: "excuse",
    type: "excuse",
    suit: "excuse",
    suitName: "Excuse",
    symbol: "E",
    color: "blue",
    rank: "Excuse",
    label: "Excuse",
    strength: 0,
    points: 4.5,
    bout: true,
  });

  return cards;
}

function cardById(id) {
  const card = CARD_BY_ID.get(id);
  if (!card) {
    throw new Error(`Carte inconnue: ${id}`);
  }
  return { ...card };
}

function cloneCard(card) {
  return { ...card };
}

function cloneGame(game) {
  return {
    ...game,
    players: game.players.map((player) => ({
      ...player,
      hand: player.hand.map(cloneCard),
      won: player.won ? player.won.map(cloneCard) : [],
    })),
    dog: game.dog ? game.dog.map(cloneCard) : [],
    discard: game.discard ? game.discard.map(cloneCard) : [],
    trick: game.trick.map((entry) => ({ player: entry.player, card: cloneCard(entry.card) })),
    trickComplete: game.trickComplete || false,
    lastPlay: game.lastPlay ? { ...game.lastPlay, card: cloneCard(game.lastPlay.card) } : null,
    calledCard: game.calledCard ? cloneCard(game.calledCard) : null,
    playedCards: (game.playedCards || []).map((entry) => ({
      player: entry.player,
      trickNumber: entry.trickNumber,
      card: cloneCard(entry.card),
    })),
    trickReviews: game.trickReviews ? [...game.trickReviews] : [],
    log: [...game.log],
  };
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function sortHand(hand) {
  const suitOrder = {
    trump: 0,
    excuse: 1,
    spades: 2,
    hearts: 3,
    diamonds: 4,
    clubs: 5,
  };

  return [...hand].sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return a.strength - b.strength;
  });
}

function pointsOf(cards) {
  return cards.reduce((sum, card) => sum + card.points, 0);
}

function cardName(card) {
  if (card.type === "trump") {
    return `Atout ${card.label}`;
  }
  if (card.type === "excuse") {
    return "Excuse";
  }
  return `${card.label} de ${card.suitName}`;
}

function cardShort(card) {
  if (card.type === "trump") {
    return `A${card.label}`;
  }
  if (card.type === "excuse") {
    return "Exc";
  }
  return `${card.label}${card.symbol}`;
}

function defaultProgress() {
  return {
    completedLessons: 0,
    learningAttempts: 0,
    goodLearningChoices: 0,
    gamesFinished: 0,
    takerWins: 0,
    defenseWins: 0,
    userWins: 0,
    cumulativeTakerScore: 0,
    cumulativeDefenseScore: 0,
    cumulativeUserScore: 0,
    cumulativeCoachGap: 0,
    analyzedGameChoices: 0,
    lastMode: "home",
  };
}

function defaultSettings() {
  return {
    playerCount: 4,
    opponentSpeed: "slow",
    opponentLevel: "normal",
    coachMode: "full",
    sideTab: "coach",
    sidePanel: "actions",
    navCollapsed: false,
    sidePanelCollapsed: false,
    cardSize: "normal",
  };
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function nonNegativeInteger(value, fallback = 0) {
  return Math.max(0, Math.trunc(finiteNumber(value, fallback)));
}

function sanitizeProgress(input = {}) {
  const defaults = defaultProgress();
  const source = input && typeof input === "object" ? input : {};
  const stats = { ...defaults };

  for (const field of [
    "completedLessons",
    "learningAttempts",
    "goodLearningChoices",
    "gamesFinished",
    "takerWins",
    "defenseWins",
    "userWins",
    "analyzedGameChoices",
  ]) {
    stats[field] = nonNegativeInteger(source[field], defaults[field]);
  }

  for (const field of [
    "cumulativeTakerScore",
    "cumulativeDefenseScore",
    "cumulativeUserScore",
    "cumulativeCoachGap",
  ]) {
    stats[field] = finiteNumber(source[field], defaults[field]);
  }

  if (typeof source.lastMode === "string" && MODES.some((mode) => mode.id === source.lastMode)) {
    stats.lastMode = source.lastMode;
  }

  return stats;
}

function sanitizeSettings(input = {}) {
  const settings = { ...defaultSettings(), ...(input && typeof input === "object" ? input : {}) };
  settings.playerCount = Number(settings.playerCount);
  if (!PLAYER_PRESETS[settings.playerCount]) {
    settings.playerCount = defaultSettings().playerCount;
  }
  if (!OPPONENT_SPEEDS[settings.opponentSpeed]) {
    settings.opponentSpeed = defaultSettings().opponentSpeed;
  }
  if (!OPPONENT_LEVELS[settings.opponentLevel]) {
    settings.opponentLevel = defaultSettings().opponentLevel;
  }
  if (!COACH_MODES[settings.coachMode]) {
    settings.coachMode = defaultSettings().coachMode;
  }
  if (!SIDE_TABS.some((tab) => tab.id === settings.sideTab)) {
    settings.sideTab = defaultSettings().sideTab;
  }
  if (!SIDE_PANELS.some((panel) => panel.id === settings.sidePanel)) {
    settings.sidePanel = defaultSettings().sidePanel;
  }
  if (!["normal", "large"].includes(settings.cardSize)) {
    settings.cardSize = defaultSettings().cardSize;
  }
  settings.navCollapsed = Boolean(settings.navCollapsed);
  settings.sidePanelCollapsed = Boolean(settings.sidePanelCollapsed);
  return settings;
}

function readStoredData() {
  try {
    if (typeof localStorage === "undefined") {
      return {};
    }

    const keys = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    }
    return {};
  } catch (error) {
    return {};
  }
}

function loadProgress() {
  const stored = readStoredData();
  const { settings, stats, ...legacyStats } = stored && typeof stored === "object" ? stored : {};
  void settings;
  return sanitizeProgress(stats || legacyStats);
}

function loadSettings() {
  const stored = readStoredData();
  return sanitizeSettings(stored?.settings || {});
}

function reviveStoredCard(input) {
  const id = typeof input === "string" ? input : input?.id;
  if (typeof id !== "string") {
    return null;
  }

  try {
    return cardById(id);
  } catch (error) {
    return null;
  }
}

function reviveStoredCards(cards) {
  if (!Array.isArray(cards)) {
    return [];
  }
  return cards.map(reviveStoredCard).filter(Boolean);
}

function boundedPlayerIndex(value, playerCount, fallback = 0) {
  const index = Math.trunc(finiteNumber(value, fallback));
  if (index < 0 || index >= playerCount) {
    return fallback;
  }
  return index;
}

function sanitizeStoredTeam(team, fallback = "undecided") {
  return ["taker", "defense", "undecided"].includes(team) ? team : fallback;
}

function sanitizeStoredPlayer(player, index, playerCount, taker) {
  const names = playerNamesForCount(playerCount);
  const fallback = createPlayer(names[index] || `J${index + 1}`, index, taker);
  const won = reviveStoredCards(player?.won);

  return {
    ...fallback,
    name: typeof player?.name === "string" && player.name.trim() ? player.name.trim().slice(0, 32) : fallback.name,
    profile: OPPONENT_PROFILES[index] || OPPONENT_PROFILES[0],
    team: sanitizeStoredTeam(player?.team, fallback.team),
    hand: sortHand(reviveStoredCards(player?.hand)),
    won,
    tricks: nonNegativeInteger(player?.tricks, 0),
    points: pointsOf(won),
    announcedHandful: Boolean(player?.announcedHandful),
  };
}

function sanitizeStoredTrickEntries(entries, playerCount) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => {
      const card = reviveStoredCard(entry?.card);
      if (!card) {
        return null;
      }
      return {
        player: boundedPlayerIndex(entry?.player, playerCount, 0),
        card,
      };
    })
    .filter(Boolean);
}

function sanitizeStoredPlayedEntries(entries, playerCount) {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => {
      const card = reviveStoredCard(entry?.card);
      if (!card) {
        return null;
      }
      return {
        player: boundedPlayerIndex(entry?.player, playerCount, 0),
        trickNumber: nonNegativeInteger(entry?.trickNumber, 1),
        card,
      };
    })
    .filter(Boolean);
}

function sanitizeStoredAnalysis(analysis) {
  const card = reviveStoredCard(analysis?.card);
  if (!card) {
    return null;
  }

  return {
    card,
    legal: analysis?.legal !== false,
    score: Math.max(0, Math.min(100, Math.round(finiteNumber(analysis?.score, 0)))),
    winRate: Math.max(0, Math.min(1, finiteNumber(analysis?.winRate, 0))),
    teamWinRate: Math.max(0, Math.min(1, finiteNumber(analysis?.teamWinRate, finiteNumber(analysis?.winRate, 0)))),
    averageSwing: finiteNumber(analysis?.averageSwing, 0),
    averageTeamSwing: finiteNumber(analysis?.averageTeamSwing, finiteNumber(analysis?.averageSwing, 0)),
    winsNow: Boolean(analysis?.winsNow),
    teamWinNow: Boolean(analysis?.teamWinNow),
    headline: typeof analysis?.headline === "string" ? analysis.headline.slice(0, 160) : "Carte jouable",
    reasons: Array.isArray(analysis?.reasons)
      ? analysis.reasons.filter((reason) => typeof reason === "string").slice(0, 5)
      : [],
  };
}

function sanitizeStoredUserReview(review) {
  const played = reviveStoredCard(review?.played);
  const best = reviveStoredCard(review?.best);
  if (!played || !best) {
    return null;
  }

  return {
    played,
    playedScore: Math.max(0, Math.min(100, Math.round(finiteNumber(review?.playedScore, 0)))),
    playedHeadline: typeof review?.playedHeadline === "string" ? review.playedHeadline.slice(0, 160) : "",
    playedReasons: Array.isArray(review?.playedReasons)
      ? review.playedReasons.filter((reason) => typeof reason === "string").slice(0, 5)
      : [],
    best,
    bestScore: Math.max(0, Math.min(100, Math.round(finiteNumber(review?.bestScore, 0)))),
    bestHeadline: typeof review?.bestHeadline === "string" ? review.bestHeadline.slice(0, 160) : "",
    bestReasons: Array.isArray(review?.bestReasons)
      ? review.bestReasons.filter((reason) => typeof reason === "string").slice(0, 5)
      : [],
    gap: Math.max(0, Math.min(100, finiteNumber(review?.gap, 0))),
  };
}

function sanitizeStoredPendingUserReview(review) {
  const played = sanitizeStoredAnalysis(review?.played);
  const best = sanitizeStoredAnalysis(review?.best);
  if (!played || !best) {
    return null;
  }
  return {
    trickNumber: nonNegativeInteger(review?.trickNumber, 1),
    played,
    best,
  };
}

function sanitizeStoredTrickReviews(reviews, playerCount) {
  if (!Array.isArray(reviews)) {
    return [];
  }

  return reviews
    .map((review) => {
      const cards = sanitizeStoredTrickEntries(review?.cards, playerCount);
      return {
        trickNumber: nonNegativeInteger(review?.trickNumber, 1),
        winner: boundedPlayerIndex(review?.winner, playerCount, 0),
        cards,
        trickPoints: finiteNumber(review?.trickPoints, pointsOf(cards.map((entry) => entry.card))),
        explanation: typeof review?.explanation === "string" ? review.explanation.slice(0, 260) : "",
        userReview: sanitizeStoredUserReview(review?.userReview),
      };
    })
    .filter((review) => review.cards.length > 0)
    .slice(0, 80);
}

function sanitizeStoredBidding(bidding, playerCount) {
  const passed = Array.isArray(bidding?.passed)
    ? Array.from({ length: playerCount }, (_, index) => Boolean(bidding.passed[index]))
    : Array(playerCount).fill(false);
  const highestContractId =
    typeof bidding?.highestContractId === "string" && CONTRACTS[bidding.highestContractId]
      ? bidding.highestContractId
      : null;
  const highestBidder = highestContractId === null ? null : boundedPlayerIndex(bidding?.highestBidder, playerCount, 0);

  return {
    currentPlayer: boundedPlayerIndex(bidding?.currentPlayer, playerCount, 0),
    passed,
    highestBidder,
    highestContractId,
    history: Array.isArray(bidding?.history)
      ? bidding.history
          .map((entry) => ({
            player: boundedPlayerIndex(entry?.player, playerCount, 0),
            bid:
              entry?.bid === PASS_BID || CONTRACTS[entry?.bid]
                ? entry.bid
                : PASS_BID,
          }))
          .slice(-24)
      : [],
    turnsSinceBid: nonNegativeInteger(bidding?.turnsSinceBid, 0),
  };
}

function sanitizeStoredFinalScore(score, game) {
  if (!score || typeof score !== "object") {
    return null;
  }
  if (game?.contract) {
    return calculateFinalScore(game);
  }

  const winnerTeam = score.winnerTeam === "taker" ? "taker" : "defense";
  return {
    taker: boundedPlayerIndex(score.taker, game.playerCount, game.taker ?? 0),
    contract: typeof score.contract === "string" ? score.contract.slice(0, 40) : game.contract?.name || "",
    multiplier: finiteNumber(score.multiplier, game.contract?.multiplier || 1),
    takerPoints: finiteNumber(score.takerPoints, teamPoints(game, "taker")),
    defensePoints: finiteNumber(score.defensePoints, teamPoints(game, "defense")),
    scoredTakerPoints: finiteNumber(score.scoredTakerPoints, score.takerPoints ?? teamPoints(game, "taker")),
    scoredDefensePoints: finiteNumber(score.scoredDefensePoints, score.defensePoints ?? teamPoints(game, "defense")),
    bouts: nonNegativeInteger(score.bouts, countBouts(teamCards(game, "taker"))),
    target: finiteNumber(score.target, 0),
    delta: finiteNumber(score.delta, 0),
    contractScore: finiteNumber(score.contractScore, 0),
    petitBonus: finiteNumber(score.petitBonus, 0),
    handfulBonus: finiteNumber(score.handfulBonus, 0),
    signedScore: finiteNumber(score.signedScore, 0),
    success: Boolean(score.success),
    winnerTeam,
  };
}

function sanitizeStoredGame(rawGame, kind) {
  if (!rawGame || typeof rawGame !== "object" || rawGame.kind !== kind) {
    return null;
  }

  const playerCount = Number(rawGame.playerCount);
  if (!PLAYER_PRESETS[playerCount] || !Array.isArray(rawGame.players) || rawGame.players.length !== playerCount) {
    return null;
  }

  const validPhases = ["bidding", "dog", "discard", "playing", "passedOut", "ended"];
  const phase = validPhases.includes(rawGame.phase) ? rawGame.phase : "bidding";
  const taker =
    rawGame.taker === null || rawGame.taker === undefined
      ? null
      : boundedPlayerIndex(rawGame.taker, playerCount, 0);
  const contract =
    typeof rawGame.contract?.id === "string" && CONTRACTS[rawGame.contract.id]
      ? CONTRACTS[rawGame.contract.id]
      : null;
  const dogSize = dogSizeForCount(playerCount);
  const game = {
    id: nonNegativeInteger(rawGame.id, 1),
    kind,
    playerCount,
    dogSize,
    totalTricks: nonNegativeInteger(rawGame.totalTricks, (CARD_LIBRARY.length - dogSize) / playerCount),
    players: rawGame.players.map((player, index) => sanitizeStoredPlayer(player, index, playerCount, taker)),
    dog: reviveStoredCards(rawGame.dog),
    discard: reviveStoredCards(rawGame.discard),
    selectedDiscard: Array.isArray(rawGame.selectedDiscard)
      ? rawGame.selectedDiscard.filter((id) => typeof id === "string").slice(0, dogSize)
      : [],
    taker,
    contract,
    bidding: sanitizeStoredBidding(rawGame.bidding, playerCount),
    pendingExcuseCompensations: Array.isArray(rawGame.pendingExcuseCompensations)
      ? rawGame.pendingExcuseCompensations
          .map((compensation) => ({
            from: boundedPlayerIndex(compensation?.from, playerCount, 0),
            to: boundedPlayerIndex(compensation?.to, playerCount, 0),
          }))
          .slice(0, 8)
      : [],
    handfuls: Array.isArray(rawGame.handfuls)
      ? rawGame.handfuls
          .map((handful) => ({
            player: boundedPlayerIndex(handful?.player, playerCount, 0),
            level: typeof handful?.level === "string" ? handful.level.slice(0, 40) : "poignée",
            bonus: finiteNumber(handful?.bonus, 0),
          }))
          .slice(0, playerCount)
      : [],
    potentialHandfuls: Array.isArray(rawGame.potentialHandfuls) ? rawGame.potentialHandfuls.slice(0, playerCount) : [],
    petitAuBout:
      rawGame.petitAuBout && typeof rawGame.petitAuBout === "object"
        ? {
            player: boundedPlayerIndex(rawGame.petitAuBout.player, playerCount, 0),
            team: sanitizeStoredTeam(rawGame.petitAuBout.team, "defense"),
          }
        : null,
    leader: boundedPlayerIndex(rawGame.leader, playerCount, 0),
    currentPlayer: boundedPlayerIndex(rawGame.currentPlayer, playerCount, 0),
    trick: sanitizeStoredTrickEntries(rawGame.trick, playerCount),
    trickComplete: Boolean(rawGame.trickComplete),
    playedCards: sanitizeStoredPlayedEntries(rawGame.playedCards, playerCount).slice(-78),
    trickReviews: sanitizeStoredTrickReviews(rawGame.trickReviews, playerCount),
    replayReviewIndex: nonNegativeInteger(rawGame.replayReviewIndex, 0),
    replayStep: rawGame.replayStep === null ? null : nonNegativeInteger(rawGame.replayStep, 0),
    pendingUserReview: sanitizeStoredPendingUserReview(rawGame.pendingUserReview),
    trickNumber: Math.max(1, nonNegativeInteger(rawGame.trickNumber, 1)),
    phase,
    log: Array.isArray(rawGame.log)
      ? rawGame.log.filter((entry) => typeof entry === "string").slice(0, 80)
      : [`Donne reprise à ${playerCount} joueurs.`],
    hint: Array.isArray(rawGame.hint) ? rawGame.hint.map(sanitizeStoredAnalysis).filter(Boolean).slice(0, 8) : null,
    hintSelectedId: typeof rawGame.hintSelectedId === "string" ? rawGame.hintSelectedId : null,
    hintTitle: typeof rawGame.hintTitle === "string" ? rawGame.hintTitle.slice(0, 80) : null,
    feedback: typeof rawGame.feedback === "string" ? rawGame.feedback.slice(0, 220) : "",
    lastUserFeedback:
      rawGame.lastUserFeedback && typeof rawGame.lastUserFeedback === "object"
        ? {
            tone: ["success", "warning", "danger", "info"].includes(rawGame.lastUserFeedback.tone)
              ? rawGame.lastUserFeedback.tone
              : "info",
            title:
              typeof rawGame.lastUserFeedback.title === "string"
                ? rawGame.lastUserFeedback.title.slice(0, 80)
                : "Retour du coach",
            detail:
              typeof rawGame.lastUserFeedback.detail === "string"
                ? rawGame.lastUserFeedback.detail.slice(0, 220)
                : "",
            playedId:
              typeof rawGame.lastUserFeedback.playedId === "string" ? rawGame.lastUserFeedback.playedId : null,
            bestId: typeof rawGame.lastUserFeedback.bestId === "string" ? rawGame.lastUserFeedback.bestId : null,
            score: Math.max(0, Math.min(100, Math.round(finiteNumber(rawGame.lastUserFeedback.score, 0)))),
            trickNumber: Math.max(1, nonNegativeInteger(rawGame.lastUserFeedback.trickNumber, 1)),
          }
        : null,
    inspectedIllegalCard:
      rawGame.inspectedIllegalCard && typeof rawGame.inspectedIllegalCard === "object"
        ? {
            cardId: typeof rawGame.inspectedIllegalCard.cardId === "string" ? rawGame.inspectedIllegalCard.cardId : null,
            title:
              typeof rawGame.inspectedIllegalCard.title === "string"
                ? rawGame.inspectedIllegalCard.title.slice(0, 80)
                : "Carte non jouable",
            reason:
              typeof rawGame.inspectedIllegalCard.reason === "string"
                ? rawGame.inspectedIllegalCard.reason.slice(0, 220)
                : "",
          }
        : null,
    beginnerDeal: Boolean(rawGame.beginnerDeal),
    finalScore: null,
    calledCard: reviveStoredCard(rawGame.calledCard),
    calledPlayer:
      rawGame.calledPlayer === null || rawGame.calledPlayer === undefined
        ? null
        : boundedPlayerIndex(rawGame.calledPlayer, playerCount, 0),
    lastPlay:
      rawGame.lastPlay && reviveStoredCard(rawGame.lastPlay.card)
        ? {
            player: boundedPlayerIndex(rawGame.lastPlay.player, playerCount, 0),
            card: reviveStoredCard(rawGame.lastPlay.card),
            trickNumber: nonNegativeInteger(rawGame.lastPlay.trickNumber, 1),
          }
        : null,
    statsRecorded: Boolean(rawGame.statsRecorded),
  };

  if (game.phase !== "bidding" && !game.contract) {
    return null;
  }

  if (game.phase === "ended") {
    game.finalScore = sanitizeStoredFinalScore(rawGame.finalScore, game) || calculateFinalScore(game);
  }

  return game;
}

function loadSavedGames() {
  const stored = readStoredData();
  const saved = stored?.games && typeof stored.games === "object" ? stored.games : {};
  const games = {
    guided: sanitizeStoredGame(saved.guided, "guided"),
    versus: sanitizeStoredGame(saved.versus, "versus"),
  };
  const maxId = Math.max(0, ...Object.values(games).map((game) => game?.id || 0));
  return { games, maxId };
}

function serializeSavedGames(games) {
  return {
    guided: games.guided ? cloneGame(games.guided) : null,
    versus: games.versus ? cloneGame(games.versus) : null,
  };
}

function saveProgress() {
  try {
    if (typeof localStorage !== "undefined") {
      state.stats = sanitizeProgress(state.stats);
      state.settings = sanitizeSettings(state.settings);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ stats: state.stats, settings: state.settings, games: serializeSavedGames(state.games) })
      );
    }
  } catch (error) {
    // Local storage can be unavailable in private or embedded contexts.
  }
}

function recordLearningAttempt(analyses, selectedCardId) {
  const selected = analyses.find((analysis) => analysis.card.id === selectedCardId);
  const best = analyses[0];
  if (!selected || !best) {
    return;
  }

  state.stats.learningAttempts += 1;
  if (best.score - selected.score <= 6) {
    state.stats.goodLearningChoices += 1;
  }
  saveProgress();
}

function recordGameFinished(game) {
  if (game.statsRecorded || !game.finalScore) {
    return;
  }

  game.statsRecorded = true;
  state.stats.gamesFinished += 1;
  if (game.finalScore.success) {
    state.stats.takerWins += 1;
  } else {
    state.stats.defenseWins += 1;
  }
  if (game.players[0]?.team === game.finalScore.winnerTeam) {
    state.stats.userWins += 1;
  }

  state.stats.cumulativeTakerScore += playerFinalScore(game, game.taker);
  state.stats.cumulativeDefenseScore += campFinalScore(game, "defense");
  state.stats.cumulativeUserScore += playerFinalScore(game, 0);

  const reviews = userChoiceReviews(game);
  state.stats.analyzedGameChoices += reviews.length;
  state.stats.cumulativeCoachGap += reviews.reduce((sum, review) => sum + Math.max(0, review.userReview.gap), 0);
  saveProgress();
}

function contractRank(contractId) {
  return CONTRACT_ORDER.indexOf(contractId);
}

function nextContractOptions(currentContractId) {
  const currentRank = currentContractId ? contractRank(currentContractId) : -1;
  return CONTRACT_ORDER.filter((contractId) => contractRank(contractId) > currentRank);
}

function getCurrentGame() {
  return state.games[state.mode];
}

function playerPreset(playerCount = state.settings.playerCount) {
  return PLAYER_PRESETS[playerCount] || PLAYER_PRESETS[4];
}

function playerNamesForCount(playerCount) {
  return playerPreset(playerCount).names;
}

function dogSizeForCount(playerCount) {
  return playerPreset(playerCount).dogSize;
}

function playerName(game, playerIndex) {
  return game?.players?.[playerIndex]?.name || playerNamesForCount(game?.playerCount || 4)[playerIndex] || PLAYER_NAMES[playerIndex] || `J${playerIndex + 1}`;
}

function seatPosition(game, playerIndex) {
  return playerPreset(game?.playerCount || game?.players?.length || 4).positions[playerIndex] || "north";
}

function roleLabel(game, playerIndex) {
  const player = game.players[playerIndex];
  if (!player || player.team === "undecided") {
    return "Enchères";
  }
  if (playerIndex === game.taker) {
    return "Preneur";
  }
  if (player.team === "taker") {
    return "Partenaire";
  }
  return "Défense";
}

function trickOrder(game) {
  const playerCount = game.players.length;
  return Array.from({ length: playerCount }, (_, offset) => (game.leader + offset) % playerCount);
}

function opponentSpeed() {
  return OPPONENT_SPEEDS[state.settings.opponentSpeed] || OPPONENT_SPEEDS.slow;
}

function opponentLevel() {
  return OPPONENT_LEVELS[state.settings.opponentLevel] || OPPONENT_LEVELS.normal;
}

function coachMode() {
  return state.settings.coachMode || "full";
}

function coachAllowsHint() {
  return coachMode() === "hint" || coachMode() === "full";
}

function coachAllowsReview() {
  return coachMode() === "review" || coachMode() === "full";
}

function createPlayer(name, index, taker = 0) {
  return {
    name,
    profile: OPPONENT_PROFILES[index] || OPPONENT_PROFILES[0],
    team: taker === null ? "undecided" : index === taker ? "taker" : "defense",
    hand: [],
    won: [],
    tricks: 0,
    points: 0,
    announcedHandful: false,
  };
}

function addCardToPile(player, card) {
  player.won.push(card);
  player.points += card.points;
}

function removeCardFromPile(player, cardId) {
  const index = player.won.findIndex((card) => card.id === cardId);
  if (index === -1) {
    return null;
  }
  const [card] = player.won.splice(index, 1);
  player.points -= card.points;
  return card;
}

function giveCardsToPlayer(game, playerIndex, cards, source = "cartes") {
  for (const card of cards) {
    addCardToPile(game.players[playerIndex], card);
  }
  game.log?.unshift(`${playerName(game, playerIndex)} ajoute ${cards.length} ${source} a son score.`);
}

function dogInsertionSlots(packetCount, dogSize) {
  const availableSlots = Array.from({ length: Math.max(0, packetCount - 1) }, (_, index) => index + 1);
  return shuffle(availableSlots).slice(0, dogSize).sort((a, b) => a - b);
}

function dealCardsWithDog(players, deck, playerCount, dogSize) {
  const handSize = (CARD_LIBRARY.length - dogSize) / playerCount;
  const packetsPerPlayer = handSize / 3;
  const packetCount = packetsPerPlayer * playerCount;
  const dogSlots = dogInsertionSlots(packetCount, dogSize);
  const dog = [];
  let packetIndex = 0;
  let dogSlotIndex = 0;

  for (let round = 0; round < packetsPerPlayer; round += 1) {
    for (let player = 0; player < playerCount; player += 1) {
      for (let offset = 0; offset < 3; offset += 1) {
        players[player].hand.push(deck.pop());
      }
      packetIndex += 1;

      if (dogSlotIndex < dogSlots.length && dogSlots[dogSlotIndex] === packetIndex) {
        dog.push(deck.pop());
        dogSlotIndex += 1;
      }
    }
  }

  return {
    dog,
    handSize,
    dogConstitution: {
      dogSize,
      packetCount,
      slots: dogSlots,
    },
  };
}

function createNewGame(kind, playerCount = state.settings.playerCount) {
  const deck = shuffle(CARD_LIBRARY.map(cloneCard));
  const taker = null;
  const contract = null;
  const names = playerNamesForCount(playerCount);
  const dogSize = dogSizeForCount(playerCount);
  const players = names.map((name, index) => createPlayer(name, index, taker));
  const deal = dealCardsWithDog(players, deck, playerCount, dogSize);

  for (const player of players) {
    player.hand = sortHand(player.hand);
  }

  const leader = Math.floor(Math.random() * playerCount);
  const potentialHandfuls = detectHandfuls(players, playerCount);
  const game = {
    id: state.gameSequence += 1,
    kind,
    playerCount,
    dogSize,
    totalTricks: deal.handSize,
    players,
    dog: deal.dog,
    dogConstitution: deal.dogConstitution,
    discard: [],
    selectedDiscard: [],
    taker,
    contract,
    bidding: {
      currentPlayer: 0,
      passed: Array(playerCount).fill(false),
      highestBidder: null,
      highestContractId: null,
      history: [],
      turnsSinceBid: 0,
    },
    pendingExcuseCompensations: [],
    handfuls: [],
    potentialHandfuls,
    petitAuBout: null,
    leader,
    currentPlayer: leader,
    trick: [],
    trickComplete: false,
    playedCards: [],
    trickReviews: [],
    replayReviewIndex: 0,
    replayStep: null,
    pendingUserReview: null,
    trickNumber: 1,
    phase: "bidding",
    log: [
      `Chien constitué pendant la donne: ${dogSize} carte${dogSize > 1 ? "s" : ""}.`,
      `Nouvelle donne à ${playerCount} joueurs. ${playerName({ players }, leader)} entamera le premier pli après les enchères.`,
    ],
    hint: null,
    hintSelectedId: null,
    hintTitle: null,
    feedback: "",
    lastUserFeedback: null,
    inspectedIllegalCard: null,
    beginnerDeal: false,
    finalScore: null,
  };

  return game;
}

function createDogTestGame(kind, playerCount = state.settings.playerCount) {
  const taker = null;
  const names = playerNamesForCount(playerCount);
  const dogSize = dogSizeForCount(playerCount);
  const handSize = (CARD_LIBRARY.length - dogSize) / playerCount;
  const players = names.map((name, index) => createPlayer(name, index, taker));
  const used = new Set();
  const takeCards = (ids, count = ids.length) => {
    const cards = [];
    for (const id of ids) {
      if (cards.length >= count || used.has(id)) {
        continue;
      }
      used.add(id);
      cards.push(cardById(id));
    }
    return cards;
  };
  const trumpIds = [
    "trump-21",
    "trump-1",
    "excuse",
    ...Array.from({ length: 19 }, (_, index) => `trump-${20 - index}`),
  ];
  const courtIds = ["R", "D", "C", "V"].flatMap((rank) => SUITS.map((suit) => `${suit.id}-${rank}`));
  const lowSuitIds = ["1", "2", "3", "4", "5", "6", "7", "8"].flatMap((rank) =>
    SUITS.map((suit) => `${suit.id}-${rank}`)
  );
  const dogIds = ["1", "2", "3"].flatMap((rank) => SUITS.map((suit) => `${suit.id}-${rank}`));

  players[0].hand = sortHand(takeCards([...trumpIds, ...courtIds, ...lowSuitIds], handSize));
  const dog = takeCards(dogIds, dogSize);
  const remaining = CARD_LIBRARY.filter((card) => !used.has(card.id))
    .map(cloneCard)
    .sort((a, b) => {
      const score = (card) =>
        (card.bout ? 1000 : 0) +
        (card.type === "trump" ? 120 + card.strength : 0) +
        (card.type === "suit" ? card.points * 20 + card.strength : 0);
      return score(a) - score(b);
    });

  for (let playerIndex = 1; playerIndex < playerCount; playerIndex += 1) {
    players[playerIndex].hand = sortHand(remaining.splice(0, handSize));
  }

  const packetCount = (handSize / 3) * playerCount;
  const dogSlots = Array.from({ length: dogSize }, (_, index) => Math.min(packetCount - 1, 1 + index * 2));
  const leader = 0;
  const game = {
    id: state.gameSequence += 1,
    kind,
    testDeal: "dog-easter-egg",
    playerCount,
    dogSize,
    totalTricks: handSize,
    players,
    dog,
    dogConstitution: {
      dogSize,
      packetCount,
      slots: dogSlots,
    },
    discard: [],
    selectedDiscard: [],
    taker,
    contract: null,
    bidding: {
      currentPlayer: 0,
      passed: Array(playerCount).fill(false),
      highestBidder: null,
      highestContractId: null,
      history: [],
      turnsSinceBid: 0,
    },
    pendingExcuseCompensations: [],
    handfuls: [],
    potentialHandfuls: detectHandfuls(players, playerCount),
    petitAuBout: null,
    leader,
    currentPlayer: leader,
    trick: [],
    trickComplete: false,
    playedCards: [],
    trickReviews: [],
    replayReviewIndex: 0,
    replayStep: null,
    pendingUserReview: null,
    trickNumber: 1,
    phase: "bidding",
    log: [
      "Easter egg chien: main de test et adversaires verrouillés sur passe.",
      `Chien constitué pendant la donne: ${dogSize} carte${dogSize > 1 ? "s" : ""}.`,
    ],
    hint: null,
    hintSelectedId: null,
    hintTitle: null,
    feedback: "Donne de test chien activée: annonce Petite ou Garde, les adversaires passeront.",
    lastUserFeedback: null,
    inspectedIllegalCard: null,
    beginnerDeal: false,
    finalScore: null,
  };

  return game;
}

function createScenarioGame(index) {
  const scenario = SCENARIOS[index];
  const players = PLAYER_NAMES.map((name, playerIndex) => ({
    ...createPlayer(name, playerIndex, 0),
    hand: sortHand((scenario.hands[playerIndex] || []).map(cardById)),
  }));

  return {
    id: state.gameSequence += 1,
    kind: "scenario",
    playerCount: 4,
    dogSize: 0,
    totalTricks: 18,
    players,
    dog: [],
    discard: [],
    selectedDiscard: [],
    taker: 0,
    contract: CONTRACTS.petite,
    pendingExcuseCompensations: [],
    handfuls: [],
    potentialHandfuls: [],
    petitAuBout: null,
    leader: scenario.leader,
    currentPlayer: scenario.currentPlayer,
    trick: scenario.trick.map((entry) => ({
      player: entry.player,
      card: cardById(entry.card),
    })),
    trickComplete: false,
    playedCards: scenario.trick.map((entry) => ({
      player: entry.player,
      card: cardById(entry.card),
      trickNumber: 1,
    })),
    trickReviews: [],
    replayReviewIndex: 0,
    replayStep: null,
    pendingUserReview: null,
    trickNumber: 1,
    phase: "playing",
    log: [],
    hint: null,
    hintSelectedId: null,
    hintTitle: null,
    feedback: "",
    lastUserFeedback: null,
    inspectedIllegalCard: null,
    beginnerDeal: false,
    finalScore: null,
  };
}

function nextPlayer(player, playerCount = 4) {
  return (player + 1) % playerCount;
}

function findLeadCard(trick) {
  return trick.find((entry) => entry.card.type !== "excuse")?.card || null;
}

function highestTrumpInTrick(trick) {
  return trick
    .filter((entry) => entry.card.type === "trump")
    .reduce((max, entry) => Math.max(max, entry.card.strength), 0);
}

function getLegalCards(hand, trick) {
  if (hand.length === 0) {
    return [];
  }

  const excuse = hand.filter((card) => card.type === "excuse");
  const normalCards = hand.filter((card) => card.type !== "excuse");
  const lead = findLeadCard(trick);

  if (!lead) {
    return [...hand];
  }

  if (lead.type === "suit") {
    const sameSuit = normalCards.filter((card) => card.type === "suit" && card.suit === lead.suit);
    if (sameSuit.length > 0) {
      return [...sameSuit, ...excuse];
    }

    const trumps = normalCards.filter((card) => card.type === "trump");
    if (trumps.length === 0) {
      return [...hand];
    }

    const bestTrump = highestTrumpInTrick(trick);
    const overtrumps = trumps.filter((card) => card.strength > bestTrump);
    return [...(overtrumps.length > 0 ? overtrumps : trumps), ...excuse];
  }

  if (lead.type === "trump") {
    const trumps = normalCards.filter((card) => card.type === "trump");
    if (trumps.length === 0) {
      return [...hand];
    }

    const bestTrump = highestTrumpInTrick(trick);
    const overtrumps = trumps.filter((card) => card.strength > bestTrump);
    return [...(overtrumps.length > 0 ? overtrumps : trumps), ...excuse];
  }

  return [...hand];
}

function isLegalCard(card, hand, trick) {
  return getLegalCards(hand, trick).some((legal) => legal.id === card.id);
}

function illegalReason(card, hand, trick) {
  if (isLegalCard(card, hand, trick)) {
    return "";
  }

  const lead = findLeadCard(trick);
  if (!lead) {
    return "";
  }

  const hasLeadSuit = hand.some((item) => item.type === "suit" && item.suit === lead.suit);
  if (lead.type === "suit" && hasLeadSuit && card.suit !== lead.suit && card.type !== "excuse") {
    return `Vous devez fournir ${lead.suitName}.`;
  }

  const hasTrump = hand.some((item) => item.type === "trump");
  if (lead.type === "suit" && !hasLeadSuit && hasTrump && card.type !== "trump" && card.type !== "excuse") {
    return "Vous devez couper avec un atout.";
  }

  const bestTrump = highestTrumpInTrick(trick);
  const canOvertrump = hand.some((item) => item.type === "trump" && item.strength > bestTrump);
  if ((lead.type === "trump" || bestTrump > 0) && canOvertrump && card.type === "trump" && card.strength <= bestTrump) {
    return "Vous devez monter à l'atout.";
  }

  return "Cette carte n'est pas jouable dans ce pli.";
}

function getWinningEntry(trick) {
  const lead = findLeadCard(trick);
  if (!lead) {
    return trick[0] || null;
  }

  const trumps = trick.filter((entry) => entry.card.type === "trump");
  if (trumps.length > 0) {
    return trumps.reduce((best, entry) =>
      entry.card.strength > best.card.strength ? entry : best
    );
  }

  return trick
    .filter((entry) => entry.card.type === "suit" && entry.card.suit === lead.suit)
    .reduce((best, entry) => (entry.card.strength > best.card.strength ? entry : best));
}

function wouldCurrentlyWin(game, playerIndex, card) {
  const trick = [...game.trick, { player: playerIndex, card }];
  return getWinningEntry(trick)?.player === playerIndex;
}

function playerTeam(game, playerIndex) {
  return game.players[playerIndex]?.team || "undecided";
}

function strategicTeamLabel(team) {
  if (team === "taker") {
    return "camp preneur";
  }
  if (team === "defense") {
    return "defense";
  }
  return "camp";
}

function winnerAfterCard(game, playerIndex, card) {
  return getWinningEntry([...game.trick, { player: playerIndex, card }]);
}

function wouldTeamWinAfter(game, playerIndex, card) {
  const team = playerTeam(game, playerIndex);
  const winner = winnerAfterCard(game, playerIndex, card);
  return team !== "undecided" && winner ? playerTeam(game, winner.player) === team : false;
}

function playersAfterCurrentInTrick(game, playerIndex) {
  const remainingCount = Math.max(0, game.players.length - game.trick.length - 1);
  const players = [];
  let cursor = nextPlayer(playerIndex, game.players.length);

  for (let index = 0; index < remainingCount; index += 1) {
    players.push(cursor);
    cursor = nextPlayer(cursor, game.players.length);
  }

  return players;
}

function knownVoidSuits(game) {
  const voids = new Map();
  const ensure = (playerIndex) => {
    if (!voids.has(playerIndex)) {
      voids.set(playerIndex, new Set());
    }
    return voids.get(playerIndex);
  };
  const inspectEntries = (entries = []) => {
    const lead = findLeadCard(entries);
    if (!lead || lead.type !== "suit") {
      return;
    }

    for (const entry of entries) {
      if (entry.card.type === "excuse") {
        continue;
      }
      if (entry.card.type !== "suit" || entry.card.suit !== lead.suit) {
        ensure(entry.player).add(lead.suit);
      }
    }
  };

  for (const review of game.trickReviews || []) {
    inspectEntries(review.cards || []);
  }
  inspectEntries(game.trick || []);

  return voids;
}

function knownCuttersAfter(game, playerIndex, suitId) {
  if (!suitId) {
    return [];
  }

  const voids = knownVoidSuits(game);
  return playersAfterCurrentInTrick(game, playerIndex).filter((index) => voids.get(index)?.has(suitId));
}

function allSeenEntries(game) {
  const entries = [];
  const seenIds = new Set();
  const addEntry = (entry, trickNumber) => {
    if (!entry?.card) {
      return;
    }
    const key = `${trickNumber}:${entry.player}:${entry.card.id}`;
    if (seenIds.has(key)) {
      return;
    }
    entries.push({ player: entry.player, trickNumber, card: entry.card });
    seenIds.add(key);
  };

  for (const review of game.trickReviews || []) {
    for (const entry of review.cards || []) {
      addEntry(entry, review.trickNumber);
    }
  }
  for (const entry of game.playedCards || []) {
    addEntry(entry, entry.trickNumber);
  }

  for (const entry of game.trick || []) {
    addEntry(entry, game.trickNumber);
  }

  return entries;
}

function cardMemorySummary(game) {
  const entries = allSeenEntries(game);
  const cards = entries.map((entry) => entry.card);
  const bySuit = SUITS.map((suit) => {
    const suitCards = cards.filter((card) => card.type === "suit" && card.suit === suit.id);
    const heads = suitCards
      .filter((card) => card.points >= 2.5)
      .sort((a, b) => b.strength - a.strength);
    return {
      ...suit,
      seen: suitCards.length,
      total: RANKS.length,
      heads,
      remaining: RANKS.length - suitCards.length,
    };
  });
  const trumps = cards
    .filter((card) => card.type === "trump")
    .sort((a, b) => a.strength - b.strength);
  const bouts = BOUT_IDS.map((id) => {
    const entry = entries.find((item) => item.card.id === id);
    return {
      id,
      card: cardById(id),
      seen: Boolean(entry),
      player: entry?.player ?? null,
      trickNumber: entry?.trickNumber ?? null,
    };
  });
  const voids = Array.from(knownVoidSuits(game).entries())
    .map(([player, suits]) => ({
      player,
      suits: Array.from(suits).map((suitId) => SUITS.find((suit) => suit.id === suitId)).filter(Boolean),
    }))
    .filter((entry) => entry.suits.length > 0);

  return {
    totalSeen: cards.length,
    bySuit,
    trumps,
    trumpCount: trumps.length,
    highestTrump: trumps[trumps.length - 1] || null,
    bouts,
    voids,
  };
}

function explainTrickWinner(entries, winner, game) {
  const winningEntry = getWinningEntry(entries);
  const lead = findLeadCard(entries);
  const trumps = entries.filter((entry) => entry.card.type === "trump");
  const value = pointsOf(entries.map((entry) => entry.card));

  if (!winningEntry || !lead) {
    return `Pli de ${formatPoints(value)} point(s).`;
  }

  const winnerName = playerName(game, winner);
  if (winningEntry.card.type === "trump" && lead.type === "suit") {
    return `${winnerName} gagne avec ${cardName(winningEntry.card)}: il coupe la couleur demandée (${lead.suitName}). Le pli vaut ${formatPoints(value)} point(s).`;
  }
  if (winningEntry.card.type === "trump") {
    return `${winnerName} gagne avec ${cardName(winningEntry.card)}: c'est le plus fort atout posé. Le pli vaut ${formatPoints(value)} point(s).`;
  }
  if (trumps.length === 0) {
    return `${winnerName} gagne avec ${cardName(winningEntry.card)}: personne n'a coupé et c'est la plus forte carte en ${lead.suitName}. Le pli vaut ${formatPoints(value)} point(s).`;
  }
  return `${winnerName} gagne le pli. Le pli vaut ${formatPoints(value)} point(s).`;
}

function removeCardFromHand(hand, cardId) {
  const index = hand.findIndex((card) => card.id === cardId);
  if (index === -1) {
    return null;
  }
  return hand.splice(index, 1)[0];
}

function playCard(game, playerIndex, cardId) {
  if (game.trickComplete) {
    return false;
  }

  const player = game.players[playerIndex];
  const pendingCard = player.hand.find((item) => item.id === cardId);
  if (!pendingCard || !isLegalCard(pendingCard, player.hand, game.trick)) {
    return false;
  }

  const card = removeCardFromHand(player.hand, cardId);
  if (!card) {
    return false;
  }

  game.trick.push({ player: playerIndex, card });
  game.playedCards.push({ player: playerIndex, card: cloneCard(card), trickNumber: game.trickNumber });
  game.log.unshift(`${player.name} joue ${cardName(card)}.`);
  game.lastPlay = { player: playerIndex, card: cloneCard(card), trickNumber: game.trickNumber };
  game.feedback = `${player.name} joue ${cardName(card)}.`;

  if (game.trick.length === 1 && card.type !== "excuse") {
    game.leader = playerIndex;
  }

  if (game.trick.length === game.players.length) {
    game.trickComplete = true;
    game.currentPlayer = getWinningEntry(game.trick)?.player ?? game.leader;
  } else {
    game.currentPlayer = nextPlayer(playerIndex, game.players.length);
  }

  return true;
}

function cardCanPayExcuseCompensation(card) {
  return card.type !== "excuse" && !card.bout && card.points === 0.5;
}

function settlePendingExcuseCompensations(game) {
  if (!game.pendingExcuseCompensations?.length) {
    return;
  }

  const remaining = [];
  for (const compensation of game.pendingExcuseCompensations) {
    const fromPlayer = game.players[compensation.from];
    const toPlayer = game.players[compensation.to];
    const card = fromPlayer.won.find(cardCanPayExcuseCompensation);

    if (!card) {
      remaining.push(compensation);
      continue;
    }

    const moved = removeCardFromPile(fromPlayer, card.id);
    addCardToPile(toPlayer, moved);
    game.log.unshift(
      `${fromPlayer.name} compense l'Excuse avec ${cardName(moved)} pour ${toPlayer.name}.`
    );
  }

  game.pendingExcuseCompensations = remaining;
}

function assignTrickCards(game, winner) {
  for (const entry of game.trick) {
    if (entry.card.type === "excuse" && entry.player !== winner) {
      addCardToPile(game.players[entry.player], entry.card);
      game.pendingExcuseCompensations.push({ from: entry.player, to: winner });
      game.log.unshift(`L'Excuse reste a ${playerName(game, entry.player)}.`);
      continue;
    }

    addCardToPile(game.players[winner], entry.card);
  }

  settlePendingExcuseCompensations(game);
}

function teamCards(game, team) {
  return game.players
    .filter((player) => player.team === team)
    .flatMap((player) => player.won);
}

function teamPoints(game, team) {
  return game.players
    .filter((player) => player.team === team)
    .reduce((sum, player) => sum + player.points, 0);
}

function countBouts(cards) {
  return cards.filter((card) => card.bout).length;
}

function targetForBouts(bouts) {
  if (bouts <= 0) {
    return 56;
  }
  if (bouts === 1) {
    return 51;
  }
  if (bouts === 2) {
    return 41;
  }
  return 36;
}

function scoringTakerPoints(takerPoints, target) {
  if (Number.isInteger(takerPoints)) {
    return takerPoints;
  }
  return takerPoints >= target ? Math.ceil(takerPoints) : Math.floor(takerPoints);
}

function detectHandfuls(players, playerCount = 4) {
  const thresholds = HANDFUL_THRESHOLDS[playerCount] || HANDFUL_THRESHOLDS[4];
  return players
    .map((player, index) => {
      const trumps = player.hand.filter((card) => card.type === "trump" || card.type === "excuse").length;
      if (trumps >= thresholds.triple) {
        return { player: index, level: "triple poignée", bonus: 40 };
      }
      if (trumps >= thresholds.double) {
        return { player: index, level: "double poignée", bonus: 30 };
      }
      if (trumps >= thresholds.poignee) {
        return { player: index, level: "poignée", bonus: 20 };
      }
      return null;
    })
    .filter(Boolean);
}

function announceHandful(playerIndex) {
  const game = getCurrentGame();
  if (!game || game.phase !== "playing" || game.trickNumber !== 1 || game.trick.length > 0) {
    return;
  }

  const handful = detectHandfuls([game.players[playerIndex]], game.playerCount)[0];
  if (!handful || game.players[playerIndex].announcedHandful) {
    return;
  }

  const announced = { ...handful, player: playerIndex };
  game.players[playerIndex].announcedHandful = true;
  game.handfuls.push(announced);
  game.log.unshift(`${playerName(game, playerIndex)} annonce une ${announced.level} (${announced.bonus} points).`);
  saveProgress();
  render();
}

function autoAnnounceOpponentHandfuls(game) {
  if (game.trickNumber !== 1 || game.trick.length > 0) {
    return;
  }

  for (let playerIndex = 1; playerIndex < game.players.length; playerIndex += 1) {
    const handful = detectHandfuls([game.players[playerIndex]], game.playerCount)[0];
    if (!handful || game.players[playerIndex].announcedHandful) {
      continue;
    }

    const announced = { ...handful, player: playerIndex };
    game.players[playerIndex].announcedHandful = true;
    game.handfuls.push(announced);
    game.log.unshift(`${playerName(game, playerIndex)} annonce une ${announced.level} (${announced.bonus} points).`);
  }
}

function calculateFinalScore(game) {
  const takerCards = teamCards(game, "taker");
  const takerPoints = teamPoints(game, "taker");
  const defensePoints = teamPoints(game, "defense");
  const bouts = countBouts(takerCards);
  const target = targetForBouts(bouts);
  const scoredTakerPoints = scoringTakerPoints(takerPoints, target);
  const scoredDefensePoints = 91 - scoredTakerPoints;
  const delta = scoredTakerPoints - target;
  const contractScore = (25 + Math.abs(delta)) * game.contract.multiplier;
  const petitBonus = game.petitAuBout
    ? (game.petitAuBout.team === "taker" ? 1 : -1) * 10 * game.contract.multiplier
    : 0;
  const totalHandfulBonus = (game.handfuls || []).reduce((sum, handful) => sum + handful.bonus, 0);
  const handfulBonus = (delta >= 0 ? 1 : -1) * totalHandfulBonus;
  const signedScore = (delta >= 0 ? 1 : -1) * contractScore + petitBonus + handfulBonus;
  const winnerTeam = delta >= 0 ? "taker" : "defense";

  return {
    taker: game.taker,
    contract: game.contract.name,
    multiplier: game.contract.multiplier,
    takerPoints,
    defensePoints,
    scoredTakerPoints,
    scoredDefensePoints,
    bouts,
    target,
    delta,
    contractScore,
    petitBonus,
    handfulBonus,
    signedScore,
    success: delta >= 0,
    winnerTeam,
  };
}

function playerFinalScore(game, playerIndex) {
  const final = game.finalScore;
  const player = game.players[playerIndex];
  if (!final || !player) {
    return 0;
  }
  if (player.team === "defense") {
    return -final.signedScore;
  }

  const defenseCount = game.players.filter((seat) => seat.team === "defense").length;
  const takerTeamCount = game.players.filter((seat) => seat.team === "taker").length;
  if (takerTeamCount <= 1) {
    return final.signedScore * defenseCount;
  }
  return playerIndex === game.taker ? final.signedScore * 2 : final.signedScore;
}

function campFinalScore(game, team) {
  return game.players.reduce((sum, player, index) => {
    if (player.team !== team) {
      return sum;
    }
    return sum + playerFinalScore(game, index);
  }, 0);
}

function resolveTrick(game) {
  const winner = getWinningEntry(game.trick)?.player ?? game.leader;
  const cards = game.trick.map((entry) => entry.card);
  const player = game.players[winner];
  const beforePoints = player.points;

  assignTrickCards(game, winner);
  player.tricks += 1;

  if (game.trickNumber === (game.totalTricks || 18) && cards.some((card) => card.id === "trump-1")) {
    game.petitAuBout = {
      player: winner,
      team: player.team,
    };
  }

  game.log.unshift(
    `${playerName(game, winner)} remporte le pli ${game.trickNumber} (${formatPoints(
      Math.max(0, player.points - beforePoints)
    )} points marques).`
  );
  if (!game.trickReviews) {
    game.trickReviews = [];
  }
  const reviewCards = game.trick.map((entry) => ({ player: entry.player, card: cloneCard(entry.card) }));
  const review = {
    trickNumber: game.trickNumber,
    winner,
    cards: reviewCards,
    trickPoints: pointsOf(cards),
    explanation: explainTrickWinner(reviewCards, winner, game),
    userReview:
      game.pendingUserReview?.trickNumber === game.trickNumber
        ? {
            played: cloneCard(game.pendingUserReview.played.card),
            playedScore: game.pendingUserReview.played.score,
            playedHeadline: game.pendingUserReview.played.headline,
            playedReasons: [...(game.pendingUserReview.played.reasons || [])],
            best: cloneCard(game.pendingUserReview.best.card),
            bestScore: game.pendingUserReview.best.score,
            bestHeadline: game.pendingUserReview.best.headline,
            bestReasons: [...(game.pendingUserReview.best.reasons || [])],
            gap: game.pendingUserReview.best.score - game.pendingUserReview.played.score,
          }
        : null,
  };
  game.trickReviews.unshift(review);
  game.replayReviewIndex = 0;
  game.replayStep = review.cards.length;
  game.pendingUserReview = null;
  game.feedback = `${playerName(game, winner)} prend la main.`;
  game.trick = [];
  game.trickComplete = false;
  game.leader = winner;
  game.currentPlayer = winner;
  game.trickNumber += 1;
  game.hint = null;
  game.hintSelectedId = null;
  game.hintTitle = null;

  if (game.players.every((seat) => seat.hand.length === 0)) {
    game.phase = "ended";
    game.finalScore = calculateFinalScore(game);
    recordGameFinished(game);
    game.log.unshift(
      `Partie terminée. ${playerName(game, game.taker)} ${game.finalScore.success ? "réussit" : "chute"} ${
        game.contract.name
      } de ${formatPoints(Math.abs(game.finalScore.delta))} point(s).`
    );
  }
}

function formatPoints(points) {
  return Number.isInteger(points) ? String(points) : points.toFixed(1).replace(".", ",");
}

function chooseOpponentCard(game, playerIndex, options = {}) {
  const hand = game.players[playerIndex].hand;
  const legal = getLegalCards(hand, game.trick);
  const level = OPPONENT_LEVELS[options.level] || opponentLevel();
  const analyses = legal.map((card) =>
    analyzeCandidate(game, playerIndex, card, options.samples ?? level.samples, {
      perfectKnowledge: options.perfectKnowledge ?? false,
    })
  );
  adjustAnalysisForProfile(game, playerIndex, analyses);
  analyses.sort((a, b) => b.score - a.score);

  const randomness = options.randomness ?? level.randomness;
  if (Math.random() < randomness && analyses.length > 1) {
    const topCount = level === OPPONENT_LEVELS.beginner ? 5 : 3;
    const top = analyses.slice(0, Math.min(topCount, analyses.length));
    return top[Math.floor(Math.random() * top.length)].card;
  }

  return analyses[0]?.card || legal[0];
}

function adjustAnalysisForProfile(game, playerIndex, analyses) {
  const player = game.players[playerIndex];
  const profile = player.profile || OPPONENT_PROFILES[0];
  const currentWinner = getWinningEntry(game.trick);
  const playerTeamName = playerTeam(game, playerIndex);
  const currentWinnerTeam = currentWinner ? playerTeam(game, currentWinner.player) : null;
  const allyIsWinning = Boolean(
    currentWinner && currentWinner.player !== playerIndex && currentWinnerTeam === playerTeamName
  );
  const opponentIsWinning = Boolean(currentWinner && currentWinnerTeam && currentWinnerTeam !== playerTeamName);
  const lead = findLeadCard(game.trick);
  const cuttersAfter = lead?.type === "suit" ? knownCuttersAfter(game, playerIndex, lead.suit) : [];
  const allyCanCutAfter = cuttersAfter.some((index) => playerTeam(game, index) === playerTeamName);
  const opponentCanCutAfter = cuttersAfter.some((index) => playerTeam(game, index) !== playerTeamName);

  for (const analysis of analyses) {
    const teamWinRate = analysis.teamWinRate ?? analysis.winRate;

    if (profile.id === "aggressive") {
      analysis.score += Math.round(analysis.winRate * 7);
      if (analysis.card.type === "trump" && analysis.card.strength >= 15) {
        analysis.score += 3;
      }
    }

    if (profile.id === "prudent") {
      if (analysis.card.bout && teamWinRate < 0.75) {
        analysis.score -= 10;
      }
      if (analysis.winRate < 0.3 && analysis.card.points <= 0.5) {
        analysis.score += 5;
      }
    }

    if (allyIsWinning && analysis.teamWinNow) {
      if (analysis.card.points >= 3.5) {
        analysis.score += playerTeamName === "defense" ? 12 : 8;
      }
      if (analysis.card.type === "trump" && analysis.card.strength >= 15 && !analysis.winsNow) {
        analysis.score -= 9;
      }
    }

    if (opponentIsWinning) {
      if (analysis.teamWinNow || teamWinRate > 0.5) {
        analysis.score += playerTeamName === "defense" && currentWinnerTeam === "taker" ? 12 : 8;
      }
      if (!analysis.teamWinNow && analysis.card.points >= 3.5 && teamWinRate < 0.45) {
        analysis.score -= playerTeamName === "defense" && currentWinnerTeam === "taker" ? 14 : 10;
      }
      if (!analysis.teamWinNow && analysis.card.points <= 0.5) {
        analysis.score += 4;
      }
    }

    if (allyCanCutAfter && analysis.card.type === "trump" && analysis.card.strength >= 14 && !analysis.winsNow) {
      analysis.score -= 7;
    }

    if (opponentCanCutAfter && analysis.card.points >= 3.5 && !analysis.winsNow) {
      analysis.score -= 8;
    }

    if (profile.id === "defender" && player.team === "defense") {
      if (currentWinnerTeam === "taker" && teamWinRate > 0.45) {
        analysis.score += 7;
      }
      if (currentWinnerTeam === "defense" && analysis.card.points >= 3.5 && teamWinRate >= 0.45) {
        analysis.score += 5;
      }
      if (currentWinnerTeam !== "defense" && analysis.card.points >= 3.5 && teamWinRate < 0.45) {
        analysis.score -= 8;
      }
    }

    analysis.score = Math.max(1, Math.min(99, analysis.score));
  }
}

function scheduleOpponents() {
  const game = getCurrentGame();
  if (game?.phase === "bidding") {
    scheduleBiddingOpponents();
    return;
  }
  if (game?.phase === "playing" && game.trickComplete) {
    scheduleTrickResolution(game);
    return;
  }
  if (!game || game.phase !== "playing" || game.currentPlayer === 0 || state.animating) {
    return;
  }

  const mode = state.mode;
  const gameId = game.id;
  state.animating = true;
  state.opponentTimer = window.setTimeout(() => {
    const liveGame = getCurrentGame();
    if (
      state.mode !== mode ||
      !liveGame ||
      liveGame.id !== gameId ||
      liveGame.phase !== "playing" ||
      liveGame.currentPlayer === 0
    ) {
      state.animating = false;
      state.opponentTimer = null;
      render();
      return;
    }

    const playerIndex = liveGame.currentPlayer;
    const choice = chooseOpponentCard(liveGame, playerIndex, { perfectKnowledge: false });
    playCard(liveGame, playerIndex, choice.id);
    state.animating = false;
    state.opponentTimer = null;
    saveProgress();
    render();
    scheduleOpponents();
  }, opponentSpeed().cardDelay);
}

function scheduleTrickResolution(game) {
  if (!game || state.animating || state.opponentTimer) {
    return;
  }

  const mode = state.mode;
  const gameId = game.id;
  state.animating = true;
  state.opponentTimer = window.setTimeout(() => {
    const liveGame = getCurrentGame();
    if (
      state.mode !== mode ||
      !liveGame ||
      liveGame.id !== gameId ||
      liveGame.phase !== "playing" ||
      !liveGame.trickComplete ||
      liveGame.trick.length !== liveGame.players.length
    ) {
      state.animating = false;
      state.opponentTimer = null;
      render();
      return;
    }

    resolveTrick(liveGame);
    state.animating = false;
    state.opponentTimer = null;
    saveProgress();
    render();
    scheduleOpponents();
  }, opponentSpeed().trickDelay);
}

function knownCardIdsForSimulation(game, playerIndex) {
  const ids = new Set();
  for (const card of game.players[playerIndex].hand) {
    ids.add(card.id);
  }

  for (const entry of allSeenEntries(game)) {
    ids.add(entry.card.id);
  }

  if (playerIndex === game.taker) {
    for (const card of game.discard || []) {
      ids.add(card.id);
    }
  }

  if (game.phase === "dog" && playerIndex === game.taker) {
    for (const card of game.dog || []) {
      ids.add(card.id);
    }
  }

  return ids;
}

function createImperfectSimulation(game, playerIndex) {
  const simulation = cloneGame(game);
  const knownIds = knownCardIdsForSimulation(game, playerIndex);
  const unknownPool = shuffle(
    CARD_LIBRARY.filter((card) => !knownIds.has(card.id)).map(cloneCard)
  );

  for (let index = 0; index < simulation.players.length; index += 1) {
    if (index === playerIndex) {
      simulation.players[index].hand = simulation.players[index].hand.map(cloneCard);
      continue;
    }

    const hiddenCount = game.players[index].hand.length;
    simulation.players[index].hand = sortHand(unknownPool.splice(0, hiddenCount));
  }

  return simulation;
}

function simulateCandidate(game, playerIndex, candidate, samples, options = {}) {
  let wins = 0;
  let teamWins = 0;
  let pointSwing = 0;
  let teamPointSwing = 0;

  for (let sample = 0; sample < samples; sample += 1) {
    const simulation = options.perfectKnowledge
      ? cloneGame(game)
      : createImperfectSimulation(game, playerIndex);
    const playerHand = simulation.players[playerIndex].hand;
    removeCardFromHand(playerHand, candidate.id);
    simulation.trick.push({ player: playerIndex, card: cloneCard(candidate) });

    let cursor = nextPlayer(playerIndex, simulation.players.length);
    while (simulation.trick.length < simulation.players.length) {
      const choice = chooseOpponentCard(simulation, cursor, {
        randomness: 0.42,
        samples: 0,
        perfectKnowledge: false,
      });
      removeCardFromHand(simulation.players[cursor].hand, choice.id);
      simulation.trick.push({ player: cursor, card: choice });
      cursor = nextPlayer(cursor, simulation.players.length);
    }

    const winner = getWinningEntry(simulation.trick)?.player;
    const trickPoints = pointsOf(simulation.trick.map((entry) => entry.card));
    const playerTeamName = playerTeam(simulation, playerIndex);
    const winnerTeam = winner === undefined ? "undecided" : playerTeam(simulation, winner);
    if (winner === playerIndex) {
      wins += 1;
      pointSwing += trickPoints;
    } else {
      pointSwing -= trickPoints * 0.6;
    }
    if (playerTeamName !== "undecided" && winnerTeam === playerTeamName) {
      teamWins += 1;
      teamPointSwing += trickPoints;
    } else {
      teamPointSwing -= trickPoints * 0.6;
    }
  }

  const immediateValue = pointsOf([...game.trick.map((entry) => entry.card), candidate]);
  const teamWinNow = wouldTeamWinAfter(game, playerIndex, candidate);

  return {
    winRate: samples > 0 ? wins / samples : wouldCurrentlyWin(game, playerIndex, candidate) ? 1 : 0,
    teamWinRate: samples > 0 ? teamWins / samples : teamWinNow ? 1 : 0,
    averageSwing: samples > 0 ? pointSwing / samples : 0,
    averageTeamSwing: samples > 0 ? teamPointSwing / samples : teamWinNow ? immediateValue : -immediateValue * 0.5,
  };
}

function analyzeCandidate(game, playerIndex, card, samples = 60, options = {}) {
  const legal = isLegalCard(card, game.players[playerIndex].hand, game.trick);
  const lead = findLeadCard(game.trick);
  const currentWinner = getWinningEntry(game.trick);
  const playerTeamName = playerTeam(game, playerIndex);
  const currentWinnerTeam = currentWinner ? playerTeam(game, currentWinner.player) : null;
  const trickValue = pointsOf(game.trick.map((entry) => entry.card));
  const winsNow = wouldCurrentlyWin(game, playerIndex, card);
  const afterWinner = winnerAfterCard(game, playerIndex, card);
  const winningTeamAfter = afterWinner ? playerTeam(game, afterWinner.player) : null;
  const teamWinNow = playerTeamName !== "undecided" && winningTeamAfter === playerTeamName;
  const allyCurrentlyWinning = Boolean(
    currentWinner && currentWinner.player !== playerIndex && currentWinnerTeam === playerTeamName
  );
  const opponentCurrentlyWinning = Boolean(
    currentWinner && currentWinnerTeam && currentWinnerTeam !== playerTeamName
  );
  const cuttersAfter = lead?.type === "suit" ? knownCuttersAfter(game, playerIndex, lead.suit) : [];
  const allyCuttersAfter = cuttersAfter.filter((index) => playerTeam(game, index) === playerTeamName);
  const opponentCuttersAfter = cuttersAfter.filter((index) => playerTeam(game, index) !== playerTeamName);
  const simulation = legal && samples > 0 ? simulateCandidate(game, playerIndex, card, samples, options) : {
    winRate: winsNow ? 1 : 0,
    teamWinRate: teamWinNow ? 1 : 0,
    averageSwing: winsNow ? trickValue + card.points : -(trickValue + card.points) * 0.5,
    averageTeamSwing: teamWinNow ? trickValue + card.points : -(trickValue + card.points) * 0.5,
  };
  const reasons = [];
  let score = 45;

  if (!legal) {
    return {
      card,
      legal: false,
      score: 0,
      winRate: 0,
      averageSwing: 0,
      reasons: ["Cette carte ne respecte pas la couleur ou la surcoupe obligatoire."],
      headline: "Carte non jouable",
    };
  }

  const teamWinRate = simulation.teamWinRate ?? simulation.winRate;
  const averageTeamSwing = simulation.averageTeamSwing ?? simulation.averageSwing;

  score += simulation.winRate * 25;
  score += teamWinRate * 14;
  score += Math.max(-10, Math.min(12, simulation.averageSwing * 1.2));
  score += Math.max(-10, Math.min(14, averageTeamSwing * 1.2));

  if (!lead) {
    reasons.push("Vous entamez: la carte choisie fixe la couleur ou le rythme du pli.");
    if (card.type === "trump" && card.strength >= 16) {
      score += 5;
      reasons.push("Un gros atout peut prendre le contrôle, mais il engage une ressource forte.");
    }
  }

  if (lead?.type === "suit" && card.type === "suit" && card.suit === lead.suit) {
    reasons.push(`Vous fournissez ${lead.suitName}, ce qui respecte la demande.`);
    if (!winsNow && card.points <= 0.5) {
      score += 8;
      reasons.push("Vous limitez les points donnés en jouant une petite carte.");
    }
  }

  if (lead?.type === "suit" && card.type === "trump") {
    const bestTrump = highestTrumpInTrick(game.trick);
    if (card.strength > bestTrump) {
      score += 7;
      reasons.push("Vous coupez et prenez provisoirement le pli.");
    }
    const legalTrumps = getLegalCards(game.players[playerIndex].hand, game.trick).filter(
      (candidate) => candidate.type === "trump"
    );
    const lowestWinningTrump = legalTrumps
      .filter((candidate) => candidate.strength > bestTrump)
      .sort((a, b) => a.strength - b.strength)[0];
    if (lowestWinningTrump && lowestWinningTrump.id === card.id) {
      score += 10;
      reasons.push("C'est le plus petit atout suffisant: vous gardez les gros atouts.");
    }
  }

  if (lead?.type === "trump" && card.type === "trump") {
    const bestTrump = highestTrumpInTrick(game.trick);
    if (card.strength > bestTrump) {
      score += 8;
      reasons.push("Vous surcoupez, donc vous respectez la contrainte de monter a l'atout.");
    } else {
      reasons.push("Vous jouez atout sans reprendre la main.");
    }
  }

  if (allyCurrentlyWinning && teamWinNow) {
    if (card.points >= 3.5) {
      score += 18;
      reasons.push(
        `${playerName(game, currentWinner.player)} tient déjà le pli pour votre camp: charger cette tête peut rapporter sans rendre la main.`
      );
    } else if (!winsNow) {
      score += 5;
      reasons.push("Votre allié tient le pli: vous pouvez l'accompagner sans dépenser une carte forte.");
    }
  }

  if (opponentCurrentlyWinning) {
    const opponentCamp = strategicTeamLabel(currentWinnerTeam);
    if (teamWinNow) {
      score += playerTeamName === "defense" && currentWinnerTeam === "taker" ? 14 : 10;
      reasons.push(`Vous reprenez le pli au ${opponentCamp}, ce qui protège les points de votre camp.`);
    } else if (card.points >= 3.5) {
      score -= playerTeamName === "defense" && currentWinnerTeam === "taker" ? 16 : 12;
      reasons.push(`Le ${opponentCamp} tient le pli: donner une tête ici est dangereux.`);
    } else if (card.points <= 0.5) {
      score += 6;
      reasons.push("Le camp adverse tient le pli: vous limitez les points abandonnes.");
    }
  }

  if (lead?.type === "suit" && allyCuttersAfter.length > 0 && card.type === "trump" && card.strength >= 14 && !winsNow) {
    score -= 8;
    reasons.push(
      `${playerName(game, allyCuttersAfter[0])} est renonce connu en ${lead.suitName}: gardez ce gros atout si votre allié peut couper derrière.`
    );
  }

  if (lead?.type === "suit" && opponentCuttersAfter.length > 0 && card.points >= 3.5 && !winsNow) {
    score -= 8;
    reasons.push(
      `${playerName(game, opponentCuttersAfter[0])} est renonce connu en ${lead.suitName}: cette tête peut être coupée par le camp adverse.`
    );
  }

  if (card.bout) {
    const isProtectedWin = teamWinNow && teamWinRate >= 0.65;
    if (isProtectedWin) {
      score += 4;
      reasons.push("Le bout est engage dans une situation ou il a de bonnes chances de rester dans votre camp.");
    } else {
      score -= 18;
      reasons.push("Un bout joué sans sécurité est très coûteux si le pli échappe ensuite.");
    }
  }

  if (card.points >= 3.5 && !teamWinNow && teamWinRate < 0.45) {
    score -= 13;
    reasons.push("Cette tête risque d'offrir beaucoup de points au camp adverse sans garantir le pli.");
  }

  if (teamWinNow && trickValue + card.points >= 8) {
    score += 10;
    reasons.push("Le pli contient déjà beaucoup de points: le garder dans votre camp a une vraie valeur.");
  }

  if (card.type === "excuse") {
    score -= game.trick.length <= 1 ? 8 : 2;
    reasons.push("L'Excuse sauve un bout, mais elle ne prend pas la main dans ce prototype.");
  }

  if (reasons.length === 0) {
    reasons.push("Carte jouable, mais sans avantage strategique net dans cette position.");
  }

  const headline = buildHeadline(card, winsNow, simulation.winRate, simulation.averageSwing, teamWinNow, teamWinRate, averageTeamSwing);

  return {
    card,
    legal: true,
    score: Math.max(1, Math.min(99, Math.round(score))),
    winRate: simulation.winRate,
    teamWinRate,
    averageSwing: simulation.averageSwing,
    averageTeamSwing,
    reasons,
    headline,
    currentWinner: currentWinner?.player,
    currentWinnerTeam,
    winningTeamAfter,
    winsNow,
    teamWinNow,
  };
}

function buildHeadline(card, winsNow, winRate, averageSwing, teamWinNow = winsNow, teamWinRate = winRate, averageTeamSwing = averageSwing) {
  if (teamWinNow && !winsNow && teamWinRate >= 0.65) {
    return `${cardName(card)} aide votre camp a tenir`;
  }
  if (winsNow && winRate >= 0.65) {
    return `${cardName(card)} prend souvent le pli`;
  }
  if (averageTeamSwing > 2.5) {
    return `${cardName(card)} cree un bon gain de points`;
  }
  if (card.bout) {
    return `${cardName(card)} demande de la prudence`;
  }
  if (teamWinRate < 0.25) {
    return `${cardName(card)} sert surtout a limiter la perte`;
  }
  return `${cardName(card)} reste jouable`;
}

function bestAnalysis(game, playerIndex, samples = 80, options = {}) {
  return getLegalCards(game.players[playerIndex].hand, game.trick)
    .map((card) => analyzeCandidate(game, playerIndex, card, samples, options))
    .sort((a, b) => b.score - a.score);
}

function ensureGame(mode) {
  if (!state.games[mode]) {
    state.games[mode] = createNewGame(mode);
  }
  return state.games[mode];
}

function isResumableGame(game) {
  return Boolean(game && game.phase !== "ended" && game.phase !== "passedOut");
}

function gamePhaseLabel(game) {
  if (!game) {
    return "Aucune donne";
  }
  if (game.phase === "bidding") {
    return "Enchères";
  }
  if (game.phase === "dog") {
    return "Chien";
  }
  if (game.phase === "discard") {
    return "Écart";
  }
  if (game.phase === "playing") {
    return `Pli ${Math.min(game.trickNumber, game.totalTricks || 18)} / ${game.totalTricks || 18}`;
  }
  if (game.phase === "ended") {
    return "Terminée";
  }
  return "Donne passée";
}

function gameResumeText(game) {
  if (!game) {
    return "";
  }

  const contract = game.contract?.name || "contrat à déterminer";
  const playerCount = `${game.playerCount} joueurs`;
  if (game.phase === "bidding") {
    const bidderText = game.bidding.currentPlayer === 0 ? "à vous de parler" : `${playerName(game, game.bidding.currentPlayer)} doit parler`;
    return `${playerCount} · ${gamePhaseLabel(game)} · ${bidderText}`;
  }
  if (game.phase === "playing") {
    return `${playerCount} · ${gamePhaseLabel(game)} · ${contract}`;
  }
  return `${playerCount} · ${gamePhaseLabel(game)} · ${contract}`;
}

function startNewGameMode(mode) {
  if (mode !== "guided" && mode !== "versus") {
    return;
  }
  cancelOpponentTimer();
  state.games[mode] = createNewGame(mode);
  setMode(mode);
}

function evaluateHandForBid(hand) {
  const trumps = hand.filter((card) => card.type === "trump");
  const bouts = hand.filter((card) => card.bout).length;
  const kings = hand.filter((card) => card.rank === "R").length;
  const queens = hand.filter((card) => card.rank === "D").length;
  const highTrumps = trumps.filter((card) => card.strength >= 16).length;
  const lowCards = hand.filter((card) => card.type === "suit" && card.points === 0.5).length;
  const longSuitBonus = SUITS.reduce((best, suit) => {
    const count = hand.filter((card) => card.suit === suit.id).length;
    return Math.max(best, count);
  }, 0);

  return trumps.length * 2.1 + highTrumps * 3.1 + bouts * 6.5 + kings * 3.2 + queens * 1.4 + longSuitBonus - lowCards * 0.25;
}

function chooseOpponentBid(game, playerIndex) {
  if (game.testDeal === "dog-easter-egg" && playerIndex !== 0) {
    return PASS_BID;
  }

  const profile = game.players[playerIndex].profile;
  const strength = evaluateHandForBid(game.players[playerIndex].hand) * profile.risk * opponentLevel().bidFactor;
  const options = nextContractOptions(game.bidding.highestContractId);
  let desired = PASS_BID;

  if (strength >= 31) {
    desired = "gardeContre";
  } else if (strength >= 27) {
    desired = "gardeSans";
  } else if (strength >= 22) {
    desired = "garde";
  } else if (strength >= 17) {
    desired = "petite";
  }

  if (desired === PASS_BID || !options.includes(desired)) {
    const fallback = [...options].reverse().find((contractId) => contractRank(contractId) <= contractRank(desired));
    return fallback || PASS_BID;
  }

  return desired;
}

function desiredBidForStrength(strength) {
  if (strength >= 31) {
    return "gardeContre";
  }
  if (strength >= 27) {
    return "gardeSans";
  }
  if (strength >= 22) {
    return "garde";
  }
  if (strength >= 17) {
    return "petite";
  }
  return PASS_BID;
}

function biddingAdvice(game, playerIndex = 0) {
  const hand = game.players[playerIndex].hand;
  const trumps = hand.filter((card) => card.type === "trump");
  const bouts = hand.filter((card) => card.bout).length;
  const kings = hand.filter((card) => card.rank === "R").length;
  const queens = hand.filter((card) => card.rank === "D").length;
  const highTrumps = trumps.filter((card) => card.strength >= 16).length;
  const lowCards = hand.filter((card) => card.type === "suit" && card.points === 0.5).length;
  const suitCounts = SUITS.map((suit) => ({
    suit,
    count: hand.filter((card) => card.suit === suit.id).length,
  })).sort((a, b) => b.count - a.count);
  const longestSuit = suitCounts[0];
  const strength = evaluateHandForBid(hand);
  const desired = desiredBidForStrength(strength);
  const options = nextContractOptions(game.bidding.highestContractId);
  let recommended = PASS_BID;

  if (desired !== PASS_BID) {
    recommended = options.includes(desired)
      ? desired
      : [...options].reverse().find((contractId) => contractRank(contractId) <= contractRank(desired)) || PASS_BID;
  }

  const reasons = [];
  if (bouts > 0) {
    reasons.push(`${bouts} bout${bouts > 1 ? "s" : ""}: gros levier pour abaisser l'objectif de points.`);
  }
  if (trumps.length >= 7) {
    reasons.push(`${trumps.length} atouts: bonne capacité à contrôler les plis.`);
  } else if (trumps.length <= 4) {
    reasons.push(`${trumps.length} atouts seulement: prudence, le contrôle sera limité.`);
  }
  if (highTrumps > 0) {
    reasons.push(`${highTrumps} gros atout${highTrumps > 1 ? "s" : ""} utile${highTrumps > 1 ? "s" : ""} pour reprendre la main.`);
  }
  if (kings > 0) {
    reasons.push(`${kings} roi${kings > 1 ? "s" : ""}: points solides à protéger ou valoriser.`);
  }
  if (queens >= 2) {
    reasons.push(`${queens} dames: potentiel de points, mais elles restent exposées sans tenue.`);
  }
  if (longestSuit?.count >= 5) {
    reasons.push(`Longue à ${longestSuit.suit.name}: ${longestSuit.count} cartes, utile pour construire un plan.`);
  }
  if (lowCards >= 7) {
    reasons.push(`${lowCards} petites cartes: le chien peut aider à nettoyer la main.`);
  }
  if (recommended === PASS_BID && strength < 17) {
    reasons.push("La main paraît trop courte pour ouvrir sans chien connu.");
  } else if (recommended === PASS_BID) {
    reasons.push("L'enchère actuelle est au-dessus de la force estimée de la main.");
  }

  return {
    strength,
    desired,
    recommended,
    options,
    reasons: reasons.slice(0, 5),
    stats: { trumps: trumps.length, bouts, kings, highTrumps },
  };
}

function nextBidder(game, fromPlayer) {
  for (let offset = 1; offset <= game.players.length; offset += 1) {
    const candidate = (fromPlayer + offset) % game.players.length;
    if (!game.bidding.passed[candidate]) {
      return candidate;
    }
  }
  return fromPlayer;
}

function placeBid(contractId) {
  const game = getCurrentGame();
  if (!game || game.phase !== "bidding") {
    return;
  }

  const playerIndex = game.bidding.currentPlayer;
  if (playerIndex === 0 && state.animating) {
    return;
  }

  const isPass = contractId === PASS_BID;
  if (!isPass && !nextContractOptions(game.bidding.highestContractId).includes(contractId)) {
    game.feedback = "Cette enchere ne monte pas assez haut.";
    render();
    return;
  }

  if (isPass) {
    game.bidding.passed[playerIndex] = true;
    game.bidding.turnsSinceBid += 1;
    game.bidding.history.push({ player: playerIndex, bid: PASS_BID });
    game.log.unshift(`${playerName(game, playerIndex)} passe.`);
  } else {
    game.bidding.highestBidder = playerIndex;
    game.bidding.highestContractId = contractId;
    game.bidding.turnsSinceBid = 0;
    game.bidding.history.push({ player: playerIndex, bid: contractId });
    game.log.unshift(`${playerName(game, playerIndex)} annonce ${CONTRACTS[contractId].name}.`);
  }

  if (shouldFinishBidding(game)) {
    finishBidding(game);
  } else {
    game.bidding.currentPlayer = nextBidder(game, playerIndex);
  }

  saveProgress();
  render();
  scheduleOpponents();
}

function shouldFinishBidding(game) {
  const activePlayers = game.bidding.passed.filter((passed) => !passed).length;
  if (!game.bidding.highestContractId) {
    return activePlayers === 0;
  }
  return game.bidding.turnsSinceBid >= game.players.length - 1 || activePlayers <= 1;
}

function finishBidding(game) {
  if (!game.bidding.highestContractId) {
    game.phase = "passedOut";
    game.feedback = "Tout le monde passe. Recommencez pour une nouvelle donne.";
    game.log.unshift("La donne est passée par tous les joueurs.");
    return;
  }

  const taker = game.bidding.highestBidder;
  const contract = CONTRACTS[game.bidding.highestContractId];
  game.taker = taker;
  game.contract = contract;
  for (let index = 0; index < game.players.length; index += 1) {
    game.players[index].team = index === taker ? "taker" : "defense";
  }
  if (game.playerCount === 5) {
    assignCalledPartner(game, taker);
  }

  game.log.unshift(`${playerName(game, taker)} devient preneur sur ${contract.name}.`);
  prepareGameAfterBidding(game);
}

function assignCalledPartner(game, taker) {
  const ranks = ["R", "D", "C", "V"];
  let calledCard = null;
  let calledPlayer = taker;

  for (const rank of ranks) {
    const candidates = SUITS.map((suit) => `${suit.id}-${rank}`).map(cardById);
    const heldByAnother = candidates.find((candidate) =>
      game.players.some((player, index) => index !== taker && player.hand.some((card) => card.id === candidate.id))
    );
    const fallbackHeld = candidates.find((candidate) =>
      game.players.some((player) => player.hand.some((card) => card.id === candidate.id))
    );
    calledCard = heldByAnother || fallbackHeld || null;
    if (calledCard) {
      calledPlayer = game.players.findIndex((player) => player.hand.some((card) => card.id === calledCard.id));
      break;
    }
  }

  if (!calledCard || calledPlayer === -1) {
    return;
  }

  game.calledCard = calledCard;
  game.calledPlayer = calledPlayer;
  if (calledPlayer !== taker) {
    game.players[calledPlayer].team = "taker";
    game.log.unshift(
      `${playerName(game, taker)} appelle ${cardName(calledCard)}: ${playerName(game, calledPlayer)} est partenaire.`
    );
  } else {
    game.log.unshift(`${playerName(game, taker)} appelle ${cardName(calledCard)} et joue seul.`);
  }
}

function prepareGameAfterBidding(game) {
  if (game.contract.dogMode === "take") {
    if (game.taker === 0) {
      game.phase = "dog";
      game.feedback = "Prenez le chien, puis faites votre écart.";
      return;
    }

    game.players[game.taker].hand = sortHand([...game.players[game.taker].hand, ...game.dog]);
    game.log.unshift(`${playerName(game, game.taker)} prend le chien.`);
    game.dog = [];
    autoDiscardForTaker(game);
    game.phase = "playing";
    autoAnnounceOpponentHandfuls(game);
    game.feedback = `${playerName(game, game.taker)} a fait son écart. Vous jouez en défense.`;
    return;
  }

  if (game.contract.dogMode === "taker") {
    giveCardsToPlayer(game, game.taker, game.dog, "cartes du chien");
    game.dog = [];
  } else if (game.contract.dogMode === "defense") {
    const defenseIndex = game.players.findIndex((player) => player.team === "defense");
    for (const card of game.dog) {
      addCardToPile(game.players[defenseIndex], card);
    }
    game.dog = [];
    game.log.unshift("Le chien est réservé à la défense pour le score.");
  }

  game.phase = "playing";
  autoAnnounceOpponentHandfuls(game);
}

function autoDiscardForTaker(game) {
  const player = game.players[game.taker];
  const discard = chooseDiscardCards(player.hand, game.dogSize || 6);
  for (const card of discard) {
    removeCardFromHand(player.hand, card.id);
    addCardToPile(player, card);
  }
  player.hand = sortHand(player.hand);
  game.discard = discard;
  game.log.unshift(`${playerName(game, game.taker)} écarte ${game.dogSize || 6} cartes.`);
}

function chooseDiscardCards(hand, count = 6) {
  const legal = discardableCards(hand, count);
  const suitCounts = SUITS.reduce((counts, suit) => {
    counts[suit.id] = hand.filter((card) => card.type === "suit" && card.suit === suit.id).length;
    return counts;
  }, {});
  const discardScore = (card) => {
    if (card.bout) {
      return 1000;
    }
    if (card.type === "trump") {
      return 160 + card.strength * 2;
    }
    if (card.type === "excuse") {
      return 1000;
    }

    let score = card.points * 22 + card.strength * 0.35;
    const suitCount = suitCounts[card.suit] || 0;
    if (suitCount === 1) {
      score -= 12;
    } else if (suitCount === 2) {
      score -= 6;
    } else if (suitCount >= 6) {
      score += 4;
    }
    if (card.rank === "R") {
      score += 90;
    } else if (card.rank === "D") {
      score += 32;
    } else if (card.rank === "C") {
      score += 18;
    } else if (card.rank === "V") {
      score += 8;
    }
    return score;
  };

  return [...legal]
    .sort((a, b) => {
      const scoreDelta = discardScore(a) - discardScore(b);
      if (Math.abs(scoreDelta) > 0.001) {
        return scoreDelta;
      }
      return a.strength - b.strength;
    })
    .slice(0, count);
}

function suggestedDiscardCards(game) {
  if (!game || game.phase !== "discard" || game.taker !== 0) {
    return [];
  }
  return chooseDiscardCards(game.players[0].hand, game.dogSize || 6);
}

function applyDiscardSuggestion() {
  const game = getCurrentGame();
  const suggestion = suggestedDiscardCards(game);
  if (!suggestion.length) {
    return;
  }

  game.selectedDiscard = suggestion.map((card) => card.id);
  game.feedback = `Suggestion du coach appliquée: ${suggestion.map(cardShort).join(", ")}.`;
  state.settings.sidePanel = "coach";
  saveProgress();
  render();
}

function scheduleBiddingOpponents() {
  const game = getCurrentGame();
  if (!game || game.phase !== "bidding" || game.bidding.currentPlayer === 0 || state.animating) {
    return;
  }

  const mode = state.mode;
  const gameId = game.id;
  state.animating = true;
  state.opponentTimer = window.setTimeout(() => {
    const liveGame = getCurrentGame();
    if (
      state.mode !== mode ||
      !liveGame ||
      liveGame.id !== gameId ||
      liveGame.phase !== "bidding" ||
      liveGame.bidding.currentPlayer === 0
    ) {
      state.animating = false;
      state.opponentTimer = null;
      render();
      return;
    }

    const playerIndex = liveGame.bidding.currentPlayer;
    const bid = chooseOpponentBid(liveGame, playerIndex);
    state.animating = false;
    state.opponentTimer = null;
    placeBid(bid);
  }, opponentSpeed().bidDelay);
}

function cancelOpponentTimer() {
  if (state.opponentTimer) {
    window.clearTimeout(state.opponentTimer);
    state.opponentTimer = null;
  }
  state.animating = false;
}

function resetScrollPosition() {
  if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }
}

function setMode(mode) {
  cancelOpponentTimer();
  state.mode = mode;
  state.settings.navCollapsed = mode !== "home";
  state.stats.lastMode = mode;
  state.message = "";
  if (mode === "guided" || mode === "versus") {
    ensureGame(mode);
  }
  saveProgress();
  render();
  resetScrollPosition();
  scheduleOpponents();
}

function startFirstGame() {
  cancelOpponentTimer();
  state.mode = "guided";
  state.settings.playerCount = 4;
  state.settings.opponentSpeed = "slow";
  state.settings.coachMode = "full";
  state.settings.cardSize = "large";
  state.settings.sidePanel = "actions";
  state.settings.navCollapsed = true;
  state.stats.lastMode = "guided";
  state.message = "";
  const game = createNewGame("guided", 4);
  game.beginnerDeal = true;
  game.feedback = "Première partie: laissez-vous guider étape par étape, sans chercher à tout mémoriser.";
  game.log.unshift("Parcours première partie lancé.");
  state.games.guided = game;
  saveProgress();
  render();
  resetScrollPosition();
  scheduleOpponents();
}

function restartCurrent() {
  cancelOpponentTimer();
  if (state.mode === "learn") {
    state.learning.selectedCardId = null;
    state.learning.inspectedIllegalCard = null;
    state.learning.analyses = [];
  }
  if (state.mode === "guided" || state.mode === "versus") {
    state.games[state.mode] = createNewGame(state.mode);
  }
  saveProgress();
  render();
  scheduleOpponents();
}

function activateDogTestDeal() {
  const mode = isGameMode(state.mode) ? state.mode : isGameMode(state.stats.lastMode) ? state.stats.lastMode : "versus";
  cancelOpponentTimer();
  state.mode = mode;
  state.settings.navCollapsed = true;
  state.settings.coachMode = "full";
  state.settings.sidePanel = "actions";
  state.stats.lastMode = mode;
  state.message = "Donne de test chien activée.";
  state.games[mode] = createDogTestGame(mode, state.settings.playerCount);
  saveProgress();
  render();
  resetScrollPosition();
  scheduleOpponents();
}

function setPlayerCount(playerCount) {
  if (!PLAYER_PRESETS[playerCount]) {
    return;
  }
  cancelOpponentTimer();
  state.settings.playerCount = playerCount;
  saveProgress();
  if (state.mode === "guided" || state.mode === "versus") {
    state.games[state.mode] = createNewGame(state.mode, playerCount);
  }
  saveProgress();
  render();
  scheduleOpponents();
}

function setOpponentSpeed(speed) {
  if (!OPPONENT_SPEEDS[speed]) {
    return;
  }
  cancelOpponentTimer();
  state.settings.opponentSpeed = speed;
  saveProgress();
  render();
  scheduleOpponents();
}

function setOpponentLevel(level) {
  if (!OPPONENT_LEVELS[level]) {
    return;
  }
  cancelOpponentTimer();
  state.settings.opponentLevel = level;
  saveProgress();
  render();
  scheduleOpponents();
}

function setCoachMode(mode) {
  if (!COACH_MODES[mode]) {
    return;
  }
  state.settings.coachMode = mode;
  saveProgress();
  render();
}

function setCardSize(size) {
  if (!["normal", "large"].includes(size)) {
    return;
  }
  state.settings.cardSize = size;
  saveProgress();
  render();
}

function toggleNavigation() {
  state.settings.navCollapsed = !state.settings.navCollapsed;
  saveProgress();
  render();
}

function toggleSidePanelCollapsed() {
  state.settings.sidePanelCollapsed = !state.settings.sidePanelCollapsed;
  saveProgress();
  render();
}

function setSideTab(tab) {
  if (!SIDE_TABS.some((item) => item.id === tab)) {
    return;
  }
  state.settings.sideTab = tab;
  saveProgress();
  render();
}

function setSidePanel(panel) {
  if (!SIDE_PANELS.some((item) => item.id === panel)) {
    return;
  }
  state.settings.sidePanel = panel;
  saveProgress();
  render();
}

function gameNeedsActionPanel(game) {
  if (!game || game.phase === "ended" || game.phase === "passedOut") {
    return false;
  }
  if (game.phase === "bidding") {
    return game.bidding.currentPlayer === 0;
  }
  if (game.phase === "playing" && game.trickNumber === 1 && game.trick.length === 0) {
    return Boolean(detectHandfuls([game.players[0]], game.playerCount)[0] && !game.players[0].announcedHandful);
  }
  return false;
}

function activeReplayReview(game) {
  const reviews = game.trickReviews || [];
  if (reviews.length === 0) {
    return { review: null, index: 0 };
  }

  const index = Math.max(0, Math.min(reviews.length - 1, game.replayReviewIndex || 0));
  if (index !== game.replayReviewIndex) {
    game.replayReviewIndex = index;
  }
  return { review: reviews[index], index };
}

function activeReplayStep(game, review) {
  const maxStep = review?.cards?.length || 0;
  if (maxStep === 0) {
    return 0;
  }
  const requested = Number.isInteger(game.replayStep) ? game.replayStep : maxStep;
  const step = Math.max(1, Math.min(maxStep, requested));
  if (step !== game.replayStep) {
    game.replayStep = step;
  }
  return step;
}

function moveReplayReview(delta) {
  const game = getCurrentGame();
  const reviews = game?.trickReviews || [];
  if (reviews.length === 0) {
    return;
  }

  game.replayReviewIndex = Math.max(0, Math.min(reviews.length - 1, (game.replayReviewIndex || 0) + delta));
  game.replayStep = reviews[game.replayReviewIndex]?.cards?.length || 0;
  render();
}

function moveReplayStep(delta) {
  const game = getCurrentGame();
  const { review } = activeReplayReview(game || {});
  if (!game || !review) {
    return;
  }

  const maxStep = review.cards.length;
  game.replayStep = Math.max(1, Math.min(maxStep, activeReplayStep(game, review) + delta));
  render();
}

function setContract(contractId) {
  const game = getCurrentGame();
  const contract = CONTRACTS[contractId];
  if (!game || !contract || game.phase !== "dog" || game.dog.length !== (game.dogSize || 6)) {
    return;
  }

  cancelOpponentTimer();
  game.contract = contract;
  game.feedback = "";
  game.log.unshift(`${playerName(game, game.taker)} choisit ${contract.name}.`);

  if (contract.dogMode === "taker") {
    giveCardsToPlayer(game, game.taker, game.dog, "cartes du chien");
    game.dog = [];
    game.phase = "playing";
  } else if (contract.dogMode === "defense") {
    const defenseIndex = game.players.findIndex((player) => player.team === "defense");
    for (const card of game.dog) {
      addCardToPile(game.players[defenseIndex], card);
    }
    game.dog = [];
    game.phase = "playing";
    game.log.unshift("Le chien est réservé à la défense pour le score.");
  }

  saveProgress();
  render();
  scheduleOpponents();
}

function takeDog() {
  const game = getCurrentGame();
  if (!game || game.phase !== "dog" || game.contract.dogMode !== "take") {
    return;
  }

  cancelOpponentTimer();
  game.players[game.taker].hand = sortHand([...game.players[game.taker].hand, ...game.dog]);
  game.log.unshift(`${playerName(game, game.taker)} prend le chien et prépare son écart.`);
  game.dog = [];
  game.selectedDiscard = [];
  game.phase = "discard";
  game.feedback = `Sélectionnez ${game.dogSize || 6} cartes autorisées pour l'écart.`;
  if (game.taker === 0) {
    state.settings.sidePanel = "coach";
  }
  saveProgress();
  render();
}

function discardableCards(hand, count = 6) {
  const preferred = hand.filter(
    (card) => card.type === "suit" && card.rank !== "R" && !card.bout
  );
  if (preferred.length >= count) {
    return preferred;
  }

  const withoutBoutsAndKings = hand.filter((card) => !card.bout && card.rank !== "R");
  if (withoutBoutsAndKings.length >= count) {
    return withoutBoutsAndKings;
  }

  return hand.filter((card) => !card.bout);
}

function toggleDiscard(cardId) {
  const game = getCurrentGame();
  if (!game || game.phase !== "discard") {
    return;
  }

  const hand = game.players[game.taker].hand;
  const requiredDiscard = game.dogSize || 6;
  const legal = new Set(discardableCards(hand, requiredDiscard).map((card) => card.id));
  if (!legal.has(cardId)) {
    const card = hand.find((item) => item.id === cardId);
    game.inspectedIllegalCard = {
      cardId,
      title: card ? `${cardName(card)} est protégée` : "Carte protégée",
      reason: "Cette carte ne peut pas aller à l'écart tant qu'une carte plus faible est disponible.",
    };
    game.feedback = "Carte protégée pour l'écart.";
    render();
    return;
  }

  game.inspectedIllegalCard = null;
  if (game.selectedDiscard.includes(cardId)) {
    game.selectedDiscard = game.selectedDiscard.filter((id) => id !== cardId);
  } else if (game.selectedDiscard.length < requiredDiscard) {
    game.selectedDiscard = [...game.selectedDiscard, cardId];
  }

  game.feedback = `${game.selectedDiscard.length} / ${requiredDiscard} cartes sélectionnées pour l'écart.`;
  saveProgress();
  render();
}

function confirmDiscard() {
  const game = getCurrentGame();
  if (!game || game.phase !== "discard") {
    return;
  }
  const requiredDiscard = game.dogSize || 6;
  if (game.selectedDiscard.length !== requiredDiscard) {
    game.feedback = `L'écart doit contenir exactement ${requiredDiscard} cartes.`;
    render();
    return;
  }

  const player = game.players[game.taker];
  const discard = [];
  for (const cardId of game.selectedDiscard) {
    const card = removeCardFromHand(player.hand, cardId);
    if (card) {
      discard.push(card);
      addCardToPile(player, card);
    }
  }

  game.discard = discard;
  game.selectedDiscard = [];
  player.hand = sortHand(player.hand);
  game.phase = "playing";
  autoAnnounceOpponentHandfuls(game);
  game.feedback = "Ecart valide. La partie commence.";
  game.log.unshift(`${playerName(game, game.taker)} écarte ${requiredDiscard} cartes.`);
  saveProgress();
  render();
  scheduleOpponents();
}

function playUserCard(cardId) {
  const game = getCurrentGame();
  if (!game || game.phase !== "playing") {
    return;
  }
  if (game.trickComplete) {
    game.feedback = "Le pli est complet, les cartes vont être ramassées.";
    render();
    return;
  }
  if (game.currentPlayer !== 0) {
    game.feedback = "Attendez votre tour.";
    render();
    return;
  }

  const card = game.players[0].hand.find((item) => item.id === cardId);
  if (!card) {
    return;
  }

  if (!isLegalCard(card, game.players[0].hand, game.trick)) {
    const reason = illegalReason(card, game.players[0].hand, game.trick);
    game.inspectedIllegalCard = {
      cardId: card.id,
      title: `${cardName(card)} est bloquée`,
      reason,
    };
    game.feedback = "Carte bloquée.";
    render();
    return;
  }

  game.inspectedIllegalCard = null;
  const before = bestAnalysis(game, 0, 54, { perfectKnowledge: false });
  const playedAnalysis = before.find((analysis) => analysis.card.id === card.id);
  if (playedAnalysis && before[0]) {
    game.pendingUserReview = {
      trickNumber: game.trickNumber,
      played: playedAnalysis,
      best: before[0],
    };
    if (coachAllowsReview()) {
      game.hint = before;
      game.hintSelectedId = card.id;
      game.hintTitle = "Analyse de votre coup";
    }
  }
  playCard(game, 0, cardId);

  if ((state.mode === "guided" || state.mode === "versus") && playedAnalysis && coachAllowsReview()) {
    const best = before[0];
    game.lastUserFeedback = feedbackFromAnalysis(playedAnalysis, best);
    game.lastUserFeedback.trickNumber = game.trickNumber;
    game.feedback =
      game.lastUserFeedback.tone === "success"
        ? `Bon choix: ${playedAnalysis.headline}.`
        : `Coach: ${cardName(best.card)} était mieux évaluée (${best.score} contre ${playedAnalysis.score}).`;
  } else {
    game.lastUserFeedback = feedbackFromAnalysis(playedAnalysis, before[0]);
    game.lastUserFeedback.trickNumber = game.trickNumber;
  }

  saveProgress();
  render();
  scheduleOpponents();
}

function requestHint() {
  const game = getCurrentGame();
  if (!game || game.phase !== "playing" || game.currentPlayer !== 0 || game.trickComplete || !coachAllowsHint()) {
    return;
  }
  game.hint = bestAnalysis(game, 0, 90, { perfectKnowledge: false });
  game.hintSelectedId = game.hint[0]?.card.id || null;
  game.hintTitle = "Aide avant de jouer";
  game.inspectedIllegalCard = null;
  game.feedback = "";
  state.settings.sidePanel = "coach";
  saveProgress();
  render();
}

function selectGameHint(cardId) {
  const game = getCurrentGame();
  if (!game || !game.hint) {
    return;
  }
  game.hintSelectedId = cardId;
  saveProgress();
  render();
}

function selectLearningCard(cardId, countAttempt = true) {
  const scenarioGame = createScenarioGame(state.learning.scenarioIndex);
  const card = scenarioGame.players[0].hand.find((item) => item.id === cardId);
  const legalCards = new Set(getLegalCards(scenarioGame.players[0].hand, scenarioGame.trick).map((item) => item.id));
  if (!card || !legalCards.has(cardId)) {
    state.learning.selectedCardId = null;
    state.learning.inspectedIllegalCard = card
      ? {
          cardId,
          title: `${cardName(card)} est bloquée`,
          reason: illegalReason(card, scenarioGame.players[0].hand, scenarioGame.trick),
        }
      : null;
    state.learning.analyses = [];
    render();
    return;
  }

  state.learning.selectedCardId = cardId;
  state.learning.inspectedIllegalCard = null;
  state.learning.analyses = bestAnalysis(scenarioGame, 0, 96, { perfectKnowledge: true });
  if (countAttempt) {
    recordLearningAttempt(state.learning.analyses, cardId);
  }
  render();
}

function revealBestLearningCard() {
  const scenarioGame = createScenarioGame(state.learning.scenarioIndex);
  const analyses = bestAnalysis(scenarioGame, 0, 112, { perfectKnowledge: true });
  state.learning.analyses = analyses;
  state.learning.selectedCardId = analyses[0]?.card.id || null;
  state.learning.inspectedIllegalCard = null;
  state.stats.completedLessons += 1;
  saveProgress();
  render();
}

function switchScenario(index) {
  state.learning.scenarioIndex = index;
  state.learning.selectedCardId = null;
  state.learning.inspectedIllegalCard = null;
  state.learning.analyses = [];
  render();
}

function useLessonScenario(index) {
  state.mode = "learn";
  state.settings.navCollapsed = true;
  saveProgress();
  switchScenario(index);
  resetScrollPosition();
}

function cardClass(card, extra = "") {
  const classes = ["card-button"];
  if (card.color === "red") {
    classes.push("red");
  }
  if (card.type === "suit") {
    classes.push(`suit-${card.suit}`);
  }
  if (card.type === "trump") {
    classes.push("trump");
  }
  if (card.type === "excuse") {
    classes.push("excuse");
  }
  if (extra) {
    classes.push(extra);
  }
  return classes.join(" ");
}

function cardCornerLabel(card) {
  if (card.type === "excuse") {
    return "Exc";
  }
  return card.label;
}

function cardCornerSuit(card) {
  if (card.type === "trump") {
    return "A";
  }
  if (card.type === "excuse") {
    return "E";
  }
  return card.symbol;
}

function suitPipLayout(count) {
  return {
    1: [[3, 2]],
    2: [
      [1, 2],
      [5, 2],
    ],
    3: [
      [1, 2],
      [3, 2],
      [5, 2],
    ],
    4: [
      [1, 1],
      [1, 3],
      [5, 1],
      [5, 3],
    ],
    5: [
      [1, 1],
      [1, 3],
      [3, 2],
      [5, 1],
      [5, 3],
    ],
    6: [
      [1, 1],
      [1, 3],
      [3, 1],
      [3, 3],
      [5, 1],
      [5, 3],
    ],
    7: [
      [1, 1],
      [1, 3],
      [2, 2],
      [3, 1],
      [3, 3],
      [5, 1],
      [5, 3],
    ],
    8: [
      [1, 1],
      [1, 3],
      [2, 2],
      [3, 1],
      [3, 3],
      [4, 2],
      [5, 1],
      [5, 3],
    ],
    9: [
      [1, 1],
      [1, 3],
      [2, 1],
      [2, 3],
      [3, 2],
      [4, 1],
      [4, 3],
      [5, 1],
      [5, 3],
    ],
    10: [
      [1, 1],
      [1, 3],
      [2, 1],
      [2, 3],
      [3, 1],
      [3, 3],
      [4, 1],
      [4, 3],
      [5, 1],
      [5, 3],
    ],
  }[count];
}

function renderCardArt(card) {
  if (card.type === "suit") {
    const pipCount = Number(card.rank);
    const courtNames = {
      V: "Valet",
      C: "Cavalier",
      D: "Dame",
      R: "Roi",
    };

    if (Number.isInteger(pipCount) && pipCount >= 1 && pipCount <= 10) {
      const pips = suitPipLayout(pipCount)
        .map(
          ([row, column], index) =>
            `<span class="pip ${row >= 4 ? "inverted" : ""}" style="grid-row: ${row}; grid-column: ${column}; --pip-delay: ${index};">${escapeHtml(card.symbol)}</span>`
        )
        .join("");
      return `<span class="card-art pip-grid pip-count-${pipCount}">${pips}</span>`;
    }

    return `
      <span class="card-art court-art">
        <span class="court-frame">
          <span class="court-symbol">${escapeHtml(card.symbol)}</span>
          <span class="court-rank">${escapeHtml(card.label)}</span>
          <span class="court-title">${escapeHtml(courtNames[card.rank] || card.suitName)}</span>
        </span>
      </span>
    `;
  }

  if (card.type === "trump") {
    return `
      <span class="card-art trump-art">
        <span class="trump-number">${escapeHtml(card.label)}</span>
        <span class="trump-label">Atout</span>
      </span>
    `;
  }

  return `
    <span class="card-art excuse-art">
      <span class="excuse-motif">☾</span>
      <span class="excuse-title">Excuse</span>
    </span>
  `;
}

function renderCardButton(card, options = {}) {
  const {
    disabled = false,
    selected = false,
    legal = true,
    best = false,
    inspected = false,
    action = "",
    title = cardName(card),
  } = options;

  const classes = [
    cardClass(card),
    selected ? "selected" : "",
    !legal ? "illegal" : "",
    best ? "best" : "",
    inspected ? "inspected" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const disabledAttr = disabled ? "disabled" : "";
  const actionAttr = action ? `data-action="${action}" data-card-id="${escapeHtml(card.id)}"` : "";
  const ariaDisabled = disabled || !legal ? "true" : "false";
  const cornerLabel = cardCornerLabel(card);
  const cornerSuit = cardCornerSuit(card);
  const familyLabel = card.type === "suit" ? card.suitName : card.suitName;

  return `
    <button class="${classes}" ${disabledAttr} ${actionAttr} data-legal="${legal ? "true" : "false"}" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}" aria-disabled="${ariaDisabled}">
      ${card.bout ? `<span class="bout-badge">B</span>` : ""}
      <span class="card-corner card-top"><span>${escapeHtml(cornerLabel)}</span><span>${escapeHtml(cornerSuit)}</span></span>
      ${renderCardArt(card)}
      <span class="card-corner card-bottom"><span>${escapeHtml(cornerLabel)}</span><span>${escapeHtml(cornerSuit)}</span></span>
      <span class="card-name">${escapeHtml(familyLabel)}</span>
    </button>
  `;
}

function renderMiniCard(card) {
  const classes = ["mini-card"];
  if (card.color === "red") {
    classes.push("red");
  }
  if (card.type === "suit") {
    classes.push(`suit-${card.suit}`);
  }
  if (card.type === "trump") {
    classes.push("trump");
  }
  if (card.type === "excuse") {
    classes.push("excuse");
  }
  const cornerLabel = cardCornerLabel(card);
  const cornerSuit = cardCornerSuit(card);

  return `
    <div class="${classes.join(" ")}" title="${escapeHtml(cardName(card))}">
      <span class="mini-top"><span>${escapeHtml(cornerLabel)}</span><span>${escapeHtml(cornerSuit)}</span></span>
      <span class="mini-face">${escapeHtml(card.type === "suit" ? card.symbol : card.type === "trump" ? card.label : "☾")}</span>
      <span class="mini-label">${escapeHtml(card.type === "suit" ? card.suitName : card.suitName)}</span>
    </div>
  `;
}

function tableCourtName(card) {
  return {
    V: "Valet",
    C: "Cavalier",
    D: "Dame",
    R: "Roi",
  }[card.rank] || "";
}

function tableCourtFigure(card) {
  return {
    V: "V",
    C: "C",
    D: "D",
    R: "R",
  }[card.rank] || card.label;
}

function renderTableCardBody(card) {
  if (card.type === "suit") {
    const pipCount = Number(card.rank);
    if (Number.isInteger(pipCount) && pipCount >= 1 && pipCount <= 10) {
      return `
        <span class="table-card-body table-card-pip">
          <span class="table-card-jumbo">${escapeHtml(card.label)}</span>
          <span class="table-card-symbol">${escapeHtml(card.symbol)}</span>
        </span>
      `;
    }

    return `
      <span class="table-card-body table-card-court">
        <span class="table-court-figure">${escapeHtml(tableCourtFigure(card))}</span>
        <span class="table-court-title">${escapeHtml(tableCourtName(card))}</span>
        <span class="table-card-symbol">${escapeHtml(card.symbol)}</span>
      </span>
    `;
  }

  if (card.type === "trump") {
    return `
      <span class="table-card-body table-card-trump">
        <span class="table-card-jumbo">${escapeHtml(card.label)}</span>
        <span class="table-court-title">Atout</span>
      </span>
    `;
  }

  return `
    <span class="table-card-body table-card-excuse">
      <span class="table-card-jumbo">☾</span>
      <span class="table-court-title">Excuse</span>
    </span>
  `;
}

function renderTableCard(card) {
  const classes = ["mini-card", "table-card"];
  if (card.color === "red") {
    classes.push("red");
  }
  if (card.type === "suit") {
    classes.push(`suit-${card.suit}`);
  }
  if (card.type === "trump") {
    classes.push("trump");
  }
  if (card.type === "excuse") {
    classes.push("excuse");
  }
  const cornerLabel = cardCornerLabel(card);
  const cornerSuit = cardCornerSuit(card);

  return `
    <div class="${classes.join(" ")}" title="${escapeHtml(cardName(card))}" aria-label="${escapeHtml(cardName(card))}">
      <span class="table-card-corner table-card-top"><span>${escapeHtml(cornerLabel)}</span><span>${escapeHtml(cornerSuit)}</span></span>
      ${renderTableCardBody(card)}
      <span class="table-card-corner table-card-bottom"><span>${escapeHtml(cornerLabel)}</span><span>${escapeHtml(cornerSuit)}</span></span>
    </div>
  `;
}

function isGameMode(mode = state.mode) {
  return mode === "guided" || mode === "versus";
}

function renderSettingsControls(options = {}) {
  const { includeRestart = true } = options;
  return `
    <label class="control-select">
      <span>Joueurs</span>
      <select data-action="set-player-count">
        ${Object.keys(PLAYER_PRESETS)
          .map(
            (count) => `
              <option value="${count}" ${Number(count) === state.settings.playerCount ? "selected" : ""}>${count}</option>
            `
          )
          .join("")}
      </select>
    </label>
    <label class="control-select">
      <span>Vitesse</span>
      <select data-action="set-opponent-speed">
        ${Object.entries(OPPONENT_SPEEDS)
          .map(
            ([speed, config]) => `
              <option value="${speed}" ${speed === state.settings.opponentSpeed ? "selected" : ""}>${config.label}</option>
            `
          )
          .join("")}
      </select>
    </label>
    <label class="control-select">
      <span>Niveau</span>
      <select data-action="set-opponent-level">
        ${Object.entries(OPPONENT_LEVELS)
          .map(
            ([level, config]) => `
              <option value="${level}" ${level === state.settings.opponentLevel ? "selected" : ""}>${config.label}</option>
            `
          )
          .join("")}
      </select>
    </label>
    <label class="control-select">
      <span>Coach</span>
      <select data-action="set-coach-mode">
        ${Object.entries(COACH_MODES)
          .map(
            ([mode, config]) => `
              <option value="${mode}" ${mode === state.settings.coachMode ? "selected" : ""}>${config.label}</option>
            `
          )
          .join("")}
      </select>
    </label>
    <label class="control-select">
      <span>Cartes</span>
      <select data-action="set-card-size">
        <option value="normal" ${state.settings.cardSize === "normal" ? "selected" : ""}>Standard</option>
        <option value="large" ${state.settings.cardSize === "large" ? "selected" : ""}>Grandes</option>
      </select>
    </label>
    ${includeRestart ? `<button class="ghost-button" data-action="restart" title="Réinitialiser le mode courant">Recommencer</button>` : ""}
  `;
}

function renderNavIcon(icon) {
  const icons = {
    home: `<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/>`,
    book: `<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z"/><path d="M4 5.5A3.5 3.5 0 0 1 7.5 9H20"/>`,
    cards: `<path d="m8 3 9 2.5-4 15L4 18 8 3Z"/><path d="M13 5.5 16 4l6 12-7 3"/>`,
    computer: `<path d="M12 8V4"/><path d="M7 8h10a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-5a4 4 0 0 1 4-4Z"/><path d="M8.5 14h.01"/><path d="M15.5 14h.01"/><path d="M9 18h6"/>`,
    target: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/>`,
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[icon] || icons.home}</svg>`;
}

function renderAppSidebar() {
  const collapsed = state.settings.navCollapsed;
  return `
    <aside class="app-sidebar" aria-label="Navigation principale">
      <div class="sidebar-top">
        <button class="icon-button sidebar-toggle" data-action="toggle-nav" aria-label="${collapsed ? "Déployer le menu" : "Réduire le menu"}" aria-expanded="${collapsed ? "false" : "true"}">
          ${collapsed ? ">" : "<"}
        </button>
      </div>
      <div class="brand sidebar-brand">
        <div class="brand-mark" aria-hidden="true"><img src="./icon.svg" alt="" /></div>
        <div class="sidebar-label">
          <h1>Coach Tarot</h1>
          <span>Apprendre, simuler, jouer contre l'ordinateur</span>
        </div>
      </div>
      <nav class="mode-tabs sidebar-nav" aria-label="Modes">
        ${MODES.map(
          (mode) => `
            <button class="mode-tab ${state.mode === mode.id ? "active" : ""}" data-action="set-mode" data-mode="${mode.id}" aria-label="${escapeHtml(mode.label)}" title="${escapeHtml(mode.label)}" aria-pressed="${state.mode === mode.id ? "true" : "false"}" ${state.mode === mode.id ? 'aria-current="page"' : ""}>
              <span class="nav-icon" aria-hidden="true">${renderNavIcon(mode.icon)}</span>
              <span class="sidebar-label">${escapeHtml(mode.label)}</span>
            </button>
          `
        ).join("")}
      </nav>
    </aside>
  `;
}

function renderScoreStrip(game) {
  return `
    <div class="score-strip">
      ${game.players
        .map(
          (player, index) => `
          <div class="score-card ${game.currentPlayer === index ? "active" : ""} team-${escapeHtml(player.team)} ${index === game.taker ? "taker-card" : ""}">
            <div class="score-card-top">
              <strong>${escapeHtml(player.name)}</strong>
              <span class="role-badge">${escapeHtml(roleLabel(game, index))}</span>
            </div>
            <span>${escapeHtml(player.profile.label)} · ${player.hand.length} cartes · ${formatPoints(player.points)} pts</span>
          </div>
        `
        )
        .join("")}
    </div>
  `;
}

function handRuleHint(game) {
  if (!game || game.phase !== "playing") {
    return "";
  }
  if (game.trickComplete) {
    return "Le pli est complet: attendez le ramassage.";
  }
  if (game.currentPlayer !== 0) {
    return "Les cartes seront jouables à votre tour.";
  }

  const hand = game.players[0].hand;
  const legalCards = getLegalCards(hand, game.trick);
  const lead = findLeadCard(game.trick);
  const blocked = hand.find((card) => !legalCards.some((legal) => legal.id === card.id));
  if (blocked) {
    return illegalReason(blocked, hand, game.trick);
  }
  if (!lead) {
    return "Vous entamez: choisissez la couleur ou l'atout qui prépare le mieux la suite.";
  }
  return `Vous respectez la demande: ${lead.type === "trump" ? "Atout" : lead.suitName}.`;
}

function turnContext(game) {
  const lead = findLeadCard(game.trick);
  const leadText = lead
    ? `Couleur demandée: ${lead.type === "trump" ? "Atout" : lead.suitName}.`
    : "Le joueur qui entame choisit la couleur du pli.";

  if (game.phase === "bidding") {
    const isUser = game.bidding.currentPlayer === 0;
    return {
      tone: isUser ? "your-turn" : "waiting",
      title: isUser ? "À vous d'enchérir" : `${playerName(game, game.bidding.currentPlayer)} prépare son annonce`,
      detail: isUser ? "Choisissez un contrat ou passez selon la force de votre main." : "Les enchères avancent automatiquement.",
    };
  }
  if (game.phase === "dog") {
    return {
      tone: "your-turn",
      title: "Contrat à confirmer",
      detail: "Prenez le chien pour préparer votre écart.",
    };
  }
  if (game.phase === "discard") {
    return {
      tone: "your-turn",
      title: "Écart à préparer",
      detail: `Sélectionnez exactement ${game.dogSize || 6} cartes autorisées.`,
    };
  }
  if (game.phase === "passedOut") {
    return {
      tone: "neutral",
      title: "Donne passée",
      detail: "Tous les joueurs ont passé.",
    };
  }
  if (game.phase === "ended") {
    const userScore = game.finalScore ? playerFinalScore(game, 0) : 0;
    return {
      tone: "neutral",
      title: "Partie terminée",
      detail: game.finalScore
        ? `${game.finalScore.success ? "Contrat gagné" : "Contrat chuté"}: votre marque ${formatSignedPoints(
            userScore
          )}.`
        : "La donne est terminée.",
    };
  }
  if (game.trickComplete && game.trick.length === game.players.length) {
    const winner = getWinningEntry(game.trick)?.player ?? game.leader;
    return {
      tone: "neutral",
      title: "Pli complet",
      detail: `${playerName(game, winner)} va ramasser le pli.`,
    };
  }
  if (game.currentPlayer === 0) {
    return {
      tone: "your-turn",
      title: "À vous de jouer",
      detail: leadText,
    };
  }
  return {
    tone: "waiting",
    title: `${playerName(game, game.currentPlayer)} réfléchit`,
    detail: "Votre main se réactive automatiquement à votre tour.",
  };
}

function renderTurnBanner(game) {
  const context = turnContext(game);
  const detail = game.trickComplete ? context.detail : game.feedback || context.detail;
  const calledText = game.calledCard ? ` · Appel ${cardShort(game.calledCard)}` : "";
  const modeLabel = game.kind === "guided" ? "Guidé" : game.kind === "versus" ? "Libre" : "";
  return `
    <section class="turn-banner ${context.tone}" aria-live="polite">
      <span class="status-dot" aria-hidden="true"></span>
      <div>
        <strong>${escapeHtml(context.title)}</strong>
        <span>${escapeHtml(detail)}</span>
      </div>
      ${modeLabel ? `<div class="mode-marker"><span>Mode</span><strong>${escapeHtml(modeLabel)}</strong></div>` : ""}
      ${
        game.taker !== null && game.contract
          ? `<div class="contract-marker"><span>Preneur</span><strong>${escapeHtml(playerName(game, game.taker))}</strong><small>${escapeHtml(game.contract.name + calledText)}</small></div>`
          : ""
      }
    </section>
  `;
}

function currentActionContext(game) {
  if (!game || game.phase === "ended" || game.phase === "passedOut") {
    return null;
  }
  if (game.phase === "bidding" && game.bidding.currentPlayer === 0) {
    return {
      title: "À faire maintenant",
      detail: "Choisissez une enchère ou passez.",
      action: null,
    };
  }
  if (game.phase === "dog" && game.taker === 0) {
    return {
      title: "À faire maintenant",
      detail: `Prenez le chien, puis préparez un écart de ${game.dogSize || 6} cartes.`,
      action: { label: "Prendre le chien", name: "take-dog" },
    };
  }
  if (game.phase === "discard" && game.taker === 0) {
    const requiredDiscard = game.dogSize || 6;
    const detail = game.inspectedIllegalCard
      ? "Carte protégée: l'explication est affichée sous votre main."
      : `Sélectionnez ${requiredDiscard} cartes autorisées pour l'écart.`;
    return {
      title: "À faire maintenant",
      detail,
      action: {
        label: `Valider (${game.selectedDiscard.length}/${requiredDiscard})`,
        name: "confirm-discard",
        disabled: game.selectedDiscard.length !== requiredDiscard,
      },
    };
  }
  if (game.phase === "playing" && game.trickNumber === 1 && game.trick.length === 0) {
    const userHandful = detectHandfuls([game.players[0]], game.playerCount)[0];
    if (userHandful && !game.players[0].announcedHandful) {
      return {
        title: "À faire maintenant",
        detail: `Votre main permet une ${userHandful.level}. Annoncez-la avant de jouer la première carte.`,
        action: { label: "Annoncer", name: "announce-handful" },
      };
    }
  }
  if (game.phase === "playing" && game.currentPlayer === 0 && !game.trickComplete) {
    const detail = game.inspectedIllegalCard
      ? "Carte bloquée: l'explication est affichée sous votre main."
      : "Jouez une carte autorisée ou demandez l'analyse du coach.";
    return {
      title: "À faire maintenant",
      detail,
      action: coachAllowsHint() ? { label: "Analyser ma main", name: "hint", secondary: true } : null,
    };
  }
  return null;
}

function renderNowPanel(game) {
  const action = currentActionContext(game);
  if (!action || game.phase === "bidding") {
    return "";
  }

  return `
    <section class="now-panel panel" aria-live="polite">
      <div>
        <span>Action</span>
        <h2>${escapeHtml(action.title)}</h2>
        <p>${escapeHtml(action.detail)}</p>
      </div>
      ${
        action.action
          ? `<button class="${action.action.secondary ? "ghost-button" : "primary-button"}" data-action="${escapeHtml(action.action.name)}" ${action.action.disabled ? "disabled" : ""}>${escapeHtml(action.action.label)}</button>`
          : ""
      }
    </section>
  `;
}

function renderTrickSequence(game) {
  const trickByPlayer = new Map(game.trick.map((entry, index) => [entry.player, { ...entry, order: index + 1 }]));
  return `
    <div class="trick-sequence trick-sequence-panel" aria-label="Chronologie du pli">
      ${trickOrder(game)
        .map((playerIndex, index) => {
          const entry = trickByPlayer.get(playerIndex);
          const status = entry
            ? "played"
            : game.currentPlayer === playerIndex && !game.trickComplete
              ? "current"
              : "pending";
          const statusText = entry ? cardShort(entry.card) : status === "current" ? "Tour" : "Attente";
          return `
            <div class="sequence-chip ${status} team-${escapeHtml(game.players[playerIndex].team)} ${playerIndex === game.taker ? "taker-chip" : ""}">
              <span class="sequence-order">${entry?.order || index + 1}</span>
              <span class="sequence-player">${escapeHtml(playerName(game, playerIndex))}</span>
              <span class="sequence-card">${escapeHtml(statusText)}</span>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderBiddingTableOverlay(game) {
  if (game.phase !== "bidding") {
    return "";
  }

  const currentBidder = game.bidding.currentPlayer;
  const isUser = currentBidder === 0;
  const options = nextContractOptions(game.bidding.highestContractId);
  const highestBid = game.bidding.highestContractId
    ? `${playerName(game, game.bidding.highestBidder)} · ${CONTRACTS[game.bidding.highestContractId].name}`
    : "Aucune enchère";

  return `
    <div class="table-action-overlay bidding-overlay">
      <div class="table-action-copy">
        <span>Enchères</span>
        <strong>${escapeHtml(isUser ? "À vous de parler" : `${playerName(game, currentBidder)} réfléchit`)}</strong>
        <small>${escapeHtml(highestBid)}</small>
      </div>
      <div class="contract-grid table-contract-grid">
        ${options
          .map(
            (contractId) => `
              <button class="chip-button" data-action="place-bid" data-contract="${contractId}" ${
                isUser ? "" : "disabled"
              }>
                ${escapeHtml(CONTRACTS[contractId].name)}
              </button>
            `
          )
          .join("")}
        <button class="chip-button" data-action="place-bid" data-contract="${PASS_BID}" ${
          isUser ? "" : "disabled"
        }>Passe</button>
      </div>
      <div class="bid-history table-bid-history">
        ${game.bidding.history.length === 0
          ? `<span>Aucune annonce pour le moment.</span>`
          : game.bidding.history
              .slice(-5)
              .map(
                (entry) =>
                  `<span>${escapeHtml(playerName(game, entry.player))}: ${escapeHtml(
                    entry.bid === PASS_BID ? "Passe" : CONTRACTS[entry.bid].name
                  )}</span>`
              )
              .join("")}
      </div>
    </div>
  `;
}

function renderFelt(game, contextText = "") {
  const trickByPlayer = new Map(game.trick.map((entry, index) => [entry.player, { ...entry, order: index + 1 }]));
  const currentWinner = game.trick.length > 0 ? getWinningEntry(game.trick) : null;
  const context = turnContext(game);
  const details = contextText || context.detail;
  const feltTitle = game.phase === "bidding" ? "Table des enchères" : context.title;
  const showLastPlay = game.lastPlay && game.lastPlay.trickNumber === game.trickNumber;

  return `
    <section class="felt phase-${escapeHtml(game.phase)} players-${game.playerCount || game.players.length}">
      <div class="felt-status">
        <div>
          <strong>${escapeHtml(feltTitle)}</strong>
          <span>${escapeHtml(details)}</span>
        </div>
        <div class="felt-meta">
          <span class="trick-counter">Pli ${Math.min(game.trickNumber, game.totalTricks || 18)} / ${game.totalTricks || 18}</span>
          ${
            showLastPlay
              ? `<div class="last-play-feed"><strong>Dernier coup</strong><span>${escapeHtml(playerName(game, game.lastPlay.player))} joue ${escapeHtml(cardName(game.lastPlay.card))}</span></div>`
              : ""
          }
        </div>
      </div>
      ${
        currentWinner
          ? `<div class="table-callout ${game.trickComplete ? "complete" : ""}">
              <span>${game.trickComplete ? "Pli" : "Tient"}</span>
              <strong>${escapeHtml(playerName(game, currentWinner.player))}</strong>
              <small>${escapeHtml(cardName(currentWinner.card))}</small>
            </div>`
          : ""
      }
      ${renderBiddingTableOverlay(game)}
      <div class="trick-slots">
        ${game.players.map((player, index) => {
          const entry = trickByPlayer.get(index);
          const card = entry?.card;
          const isLast = game.lastPlay?.player === index && game.lastPlay?.card?.id === card?.id && game.lastPlay?.trickNumber === game.trickNumber;
          const isWinner = currentWinner?.player === index;
          return `
            <div class="slot ${seatPosition(game, index)} ${game.currentPlayer === index && !game.trickComplete ? "active" : ""} ${card ? "has-card" : ""} ${isLast ? "last-play" : ""} ${isWinner ? "provisional-winner" : ""} team-${escapeHtml(player.team)} ${index === game.taker ? "taker-slot" : ""}">
              <span>${escapeHtml(player.name)}${player.team !== "undecided" ? ` · ${escapeHtml(roleLabel(game, index))}` : ""}</span>
              ${
                card
                  ? `<div class="played-slot-card"><span class="play-order">${entry.order}</span>${renderTableCard(card)}</div>`
                  : `<div class="empty-slot"></div>`
              }
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderHandScrollButtons() {
  return `
    <div class="hand-scroll-buttons" aria-label="Défilement de la main">
      <button class="icon-button hand-scroll-button" data-action="scroll-hand" data-direction="-1" aria-label="Cartes précédentes" title="Cartes précédentes">‹</button>
      <button class="icon-button hand-scroll-button" data-action="scroll-hand" data-direction="1" aria-label="Cartes suivantes" title="Cartes suivantes">›</button>
    </div>
  `;
}

function renderHandActionBar(game, isDiscard, requiredDiscard) {
  if (game.phase === "dog" && game.taker === 0) {
    return `
      <div class="hand-action-bar dog-action-bar">
        <div class="hand-action-copy">
          <span>Chien</span>
          <strong>${escapeHtml(game.dog.length)} cartes à prendre</strong>
          <small>Prenez le chien, puis préparez votre écart.</small>
        </div>
        <div class="dog-cards hand-dog-cards" aria-label="Chien">
          ${game.dog.map((card) => renderMiniCard(card)).join("")}
        </div>
        <div class="hand-action-controls">
          <button class="primary-button" data-action="take-dog">Prendre le chien</button>
        </div>
      </div>
    `;
  }

  if (!isDiscard) {
    return "";
  }

  return `
    <div class="hand-action-bar discard-action-bar">
      <div class="hand-action-copy">
        <span>Écart</span>
        <strong>${escapeHtml(game.selectedDiscard.length)} / ${escapeHtml(requiredDiscard)} cartes sélectionnées</strong>
        <small>Les cartes conseillées par le coach sont surlignées.</small>
      </div>
      <div class="hand-action-controls">
        <button class="ghost-button" data-action="apply-discard-suggestion">Suggestion coach</button>
        <button class="primary-button" data-action="confirm-discard" ${
          game.selectedDiscard.length === requiredDiscard ? "" : "disabled"
        }>Valider l'écart</button>
      </div>
    </div>
  `;
}

function handGroupKey(card) {
  if (card.type === "trump" || card.type === "excuse") {
    return "trumps";
  }
  return card.suit;
}

function handGroupLabel(key) {
  if (key === "trumps") {
    return "Atouts";
  }
  return SUITS.find((suit) => suit.id === key)?.name || "Cartes";
}

function groupedHandCards(hand) {
  const order = ["trumps", ...SUITS.map((suit) => suit.id)];
  const groups = new Map(order.map((key) => [key, []]));
  for (const card of hand) {
    const key = handGroupKey(card);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(card);
  }
  return order
    .map((key) => ({ key, label: handGroupLabel(key), cards: groups.get(key) || [] }))
    .filter((group) => group.cards.length > 0);
}

function userTurnNeedsFocus(game) {
  return Boolean(game?.phase === "playing" && game.currentPlayer === 0 && !game.trickComplete);
}

function feedbackFromAnalysis(playedAnalysis, bestAnalysisResult) {
  if (!playedAnalysis || !bestAnalysisResult) {
    return {
      tone: "info",
      title: "Carte jouée",
      detail: "Votre coup est enregistré. Le coach pourra l'expliquer après le pli.",
      playedId: playedAnalysis?.card?.id || null,
      bestId: bestAnalysisResult?.card?.id || null,
      score: playedAnalysis?.score || 0,
    };
  }

  const gap = bestAnalysisResult.score - playedAnalysis.score;
  if (gap <= 6) {
    return {
      tone: "success",
      title: "Bon choix",
      detail: playedAnalysis.headline,
      playedId: playedAnalysis.card.id,
      bestId: bestAnalysisResult.card.id,
      score: playedAnalysis.score,
    };
  }
  if (gap <= 18) {
    return {
      tone: "warning",
      title: "Jouable, mais améliorable",
      detail: `${cardName(bestAnalysisResult.card)} était mieux évaluée (${bestAnalysisResult.score} contre ${playedAnalysis.score}).`,
      playedId: playedAnalysis.card.id,
      bestId: bestAnalysisResult.card.id,
      score: playedAnalysis.score,
    };
  }
  return {
    tone: "danger",
    title: "Coup coûteux",
    detail: `Meilleur coup: ${cardName(bestAnalysisResult.card)} (${bestAnalysisResult.score} contre ${playedAnalysis.score}).`,
    playedId: playedAnalysis.card.id,
    bestId: bestAnalysisResult.card.id,
    score: playedAnalysis.score,
  };
}

function renderUserFeedback(game) {
  const feedback = game.lastUserFeedback;
  if (!feedback || feedback.trickNumber !== game.trickNumber) {
    return "";
  }

  return `
    <div class="turn-feedback ${escapeHtml(feedback.tone)}">
      <div>
        <span>Retour immédiat</span>
        <strong>${escapeHtml(feedback.title)}</strong>
        <p>${escapeHtml(feedback.detail)}</p>
      </div>
      ${Number.isFinite(feedback.score) ? `<b>${escapeHtml(feedback.score)}</b>` : ""}
    </div>
  `;
}

function renderIllegalInspection(game) {
  const inspection = game.inspectedIllegalCard;
  if (!inspection?.reason) {
    return "";
  }

  return `
    <div class="illegal-inspection">
      <strong>${escapeHtml(inspection.title || "Carte non jouable")}</strong>
      <p>${escapeHtml(inspection.reason)}</p>
    </div>
  `;
}

function renderFocusCoachSummary(game, hint) {
  if (!hint || !userTurnNeedsFocus(game)) {
    return "";
  }
  const selected = game.hint?.find((analysis) => analysis.card.id === game.hintSelectedId) || hint;
  const best = game.hint?.[0] || hint;

  return `
    <section class="focus-coach-panel panel">
      <div>
        <span>Coach</span>
        <strong>${escapeHtml(cardName(best.card))}</strong>
        <p>${escapeHtml(selected.headline)}</p>
      </div>
      <button class="ghost-button" data-action="set-side-panel" data-panel="coach">Détails</button>
    </section>
  `;
}

function renderInlineReplaySummary(game) {
  const review = game.trickReviews?.[0];
  if (!review || game.phase === "ended") {
    return "";
  }

  return `
    <section class="inline-replay-panel panel">
      <div>
        <span>Dernier pli</span>
        <strong>${escapeHtml(playerName(game, review.winner))} gagne le pli ${review.trickNumber}</strong>
        <p>${formatPoints(review.trickPoints || 0)} point(s). ${escapeHtml(review.explanation || "")}</p>
      </div>
      <div class="inline-replay-actions">
        <button class="ghost-button" data-action="set-side-panel" data-panel="coach">Revoir le pli</button>
        <button class="ghost-button" data-action="set-side-panel" data-panel="history">Pourquoi ?</button>
      </div>
    </section>
  `;
}

function renderHand(game, options = {}) {
  const hand = game.players[0].hand;
  const isDiscard = game.phase === "discard" && game.taker === 0;
  const requiredDiscard = game.dogSize || 6;
  const legalCards = new Set(
    (isDiscard ? discardableCards(hand, requiredDiscard) : getLegalCards(hand, game.trick)).map((card) => card.id)
  );
  const discardSuggestion = isDiscard ? suggestedDiscardCards(game) : [];
  const discardSuggestionIds = new Set(discardSuggestion.map((card) => card.id));
  const bestId = options.bestId || game.hint?.[0]?.card.id || null;
  const disabled = isDiscard ? false : game.phase !== "playing" || game.currentPlayer !== 0 || game.trickComplete || state.animating;
  const canAskHint =
    !options.hideHintButton &&
    !isDiscard &&
    coachAllowsHint() &&
    game.phase === "playing" &&
    game.currentPlayer === 0 &&
    !game.trickComplete;
  const ruleHint = isDiscard
    ? "Le coach surligne les cartes conseillées pour l'écart. Les rois et les bouts restent protégés sauf absence d'autre choix."
    : handRuleHint(game);
  let help = "Les adversaires terminent leur séquence.";
  if (isDiscard) {
    help = `Sélectionnez ${requiredDiscard} cartes pour l'écart.`;
  } else if (game.phase === "bidding") {
    help = "Votre main sert à choisir votre enchère.";
  } else if (game.phase === "passedOut") {
    help = "La donne est passée.";
  } else if (game.phase === "dog") {
    help = "Prenez le chien ou changez de contrat avant de jouer.";
  } else if (game.phase === "ended") {
    help = "La donne est terminée.";
  } else if (game.trickComplete) {
    help = "Le pli complet reste visible avant d'être ramassé.";
  } else if (game.currentPlayer === 0) {
    help = "Choisissez une carte jouable. Une carte bloquée peut être cliquée pour rappeler la règle.";
  }
  const inspectedCardId = game.inspectedIllegalCard?.cardId || null;

  return `
    <section class="hand-panel panel ${isDiscard ? "discard-hand-panel" : ""}">
      <div class="panel-body">
        <div class="hand-header">
          <div>
            <h2>Votre main</h2>
            <p>${escapeHtml(help)}</p>
          </div>
          <div class="top-actions">
            ${renderHandScrollButtons()}
            ${
              canAskHint
                ? `<button class="ghost-button" data-action="hint" ${
                    disabled ? "disabled" : ""
                  }>Indice</button>`
                : ""
            }
          </div>
        </div>
        ${ruleHint ? `<div class="hand-rule-hint">${escapeHtml(ruleHint)}</div>` : ""}
        ${renderIllegalInspection(game)}
        ${renderUserFeedback(game)}
        ${renderHandActionBar(game, isDiscard, requiredDiscard)}
        <div class="hand grouped-hand">
          ${groupedHandCards(hand)
            .map(
              (group) => `
                <div class="hand-group">
                  <span class="hand-group-label">${escapeHtml(group.label)}</span>
                  <div class="hand-group-cards">
                    ${group.cards
                      .map((card) =>
                        renderCardButton(card, {
                          disabled,
                          legal: legalCards.has(card.id),
                          selected: isDiscard && game.selectedDiscard.includes(card.id),
                          best: isDiscard ? discardSuggestionIds.has(card.id) : bestId === card.id,
                          inspected: inspectedCardId === card.id,
                          action: isDiscard ? "toggle-discard" : "play-card",
                          title: legalCards.has(card.id)
                            ? isDiscard && discardSuggestionIds.has(card.id)
                              ? `${cardName(card)} - suggestion coach`
                              : cardName(card)
                            : isDiscard
                              ? "Carte protégée pour l'écart."
                              : illegalReason(card, hand, game.trick),
                        })
                      )
                      .join("")}
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderGamePhasePanel(game) {
  if (game.phase === "bidding") {
    return "";
  }

  if (game.phase === "passedOut") {
    return `
      <section class="panel phase-panel phase-panel-ended">
        <div class="panel-header">
          <div>
            <h2>Donne passée</h2>
            <p>Tous les joueurs ont passé. Relancez une donne pour continuer.</p>
          </div>
          <button class="primary-button" data-action="restart">Nouvelle donne</button>
        </div>
      </section>
    `;
  }

  if (game.phase === "ended") {
    return renderFinalSummary(game);
  }

  if (game.phase === "dog") {
    return `
      <section class="panel phase-panel phase-panel-dog">
        <div class="panel-header">
          <div>
            <h2>Contrat et chien</h2>
            <p>Vous êtes preneur sur ${escapeHtml(game.contract.name)}. Prenez le chien puis écartez ${game.dogSize || 6} cartes.</p>
          </div>
          <button class="primary-button" data-action="take-dog">Prendre le chien</button>
        </div>
        <div class="panel-body">
          <div class="dog-cards" aria-label="Chien">
            ${game.dog.map((card) => renderMiniCard(card)).join("")}
          </div>
        </div>
      </section>
    `;
  }

  if (game.phase === "discard") {
    return `
      <section class="panel phase-panel phase-panel-discard">
        <div class="panel-header">
          <div>
            <h2>Écart</h2>
            <p>Sélectionnez ${game.dogSize || 6} cartes. Les bouts et les rois sont protégés, sauf absence d'autre choix.</p>
          </div>
          <span class="pill gold">${game.selectedDiscard.length} / ${game.dogSize || 6}</span>
        </div>
      </section>
    `;
  }

  if (game.phase === "playing" && game.trickNumber === 1 && game.trick.length === 0) {
    const userHandful = detectHandfuls([game.players[0]], game.playerCount)[0];
    if (userHandful && !game.players[0].announcedHandful) {
      return `
        <section class="panel phase-panel phase-panel-handful">
          <div class="panel-header">
            <div>
              <h2>Annonce possible</h2>
              <p>Votre main permet une ${escapeHtml(userHandful.level)}.</p>
            </div>
            <button class="primary-button" data-action="announce-handful">Annoncer</button>
          </div>
        </section>
      `;
    }
  }

  return "";
}

function teamLabel(team) {
  return team === "taker" ? "Preneur" : "Défense";
}

function formatSignedPoints(points) {
  const sign = points >= 0 ? "+" : "-";
  return `${sign}${formatPoints(Math.abs(points))}`;
}

function formatScoredPoints(rawPoints, scoredPoints) {
  if (rawPoints === scoredPoints) {
    return formatPoints(rawPoints);
  }
  return `${formatPoints(rawPoints)} (compté ${formatPoints(scoredPoints)})`;
}

function userChoiceReviews(game) {
  return [...(game.trickReviews || [])].filter((review) => review.userReview).reverse();
}

function choiceQuality(gap) {
  if (gap <= 6) {
    return { label: "Bon choix", className: "good", text: "Votre coup était proche du meilleur choix simulé." };
  }
  if (gap <= 14) {
    return { label: "Correct", className: "ok", text: "Le coup reste défendable, mais le coach voyait une option plus forte." };
  }
  return { label: "À revoir", className: "risk", text: "Le coach détecte un écart net avec le meilleur coup simulé." };
}

function renderChoiceReviewItem(review) {
  const quality = choiceQuality(review.userReview.gap);
  const bestReason = review.userReview.bestReasons?.[0] || review.userReview.bestHeadline || "Le meilleur coup simulait une meilleure suite de pli.";
  return `
    <div class="choice-review ${quality.className}">
      <div class="choice-review-top">
        <strong>Pli ${review.trickNumber}</strong>
        <span>${escapeHtml(quality.label)}</span>
      </div>
      <p>${escapeHtml(quality.text)}</p>
      <div class="choice-line">
        <span>Joué: ${escapeHtml(cardShort(review.userReview.played))} (${review.userReview.playedScore})</span>
        <span>Coach: ${escapeHtml(cardShort(review.userReview.best))} (${review.userReview.bestScore})</span>
      </div>
      <p class="choice-reason">${escapeHtml(bestReason)}</p>
    </div>
  `;
}

function renderFinalChoiceSummary(game) {
  const reviews = userChoiceReviews(game);
  if (reviews.length === 0) {
    return `
      <div class="final-section">
        <h3>Vos choix</h3>
        <p>Aucun coup du joueur n'a pu être comparé dans cette donne.</p>
      </div>
    `;
  }

  const closeChoices = reviews.filter((review) => review.userReview.gap <= 6).length;
  const riskyChoices = reviews.filter((review) => review.userReview.gap > 14).length;
  const averageGap = reviews.reduce((sum, review) => sum + Math.max(0, review.userReview.gap), 0) / reviews.length;
  const keyReviews = [...reviews]
    .sort((a, b) => b.userReview.gap - a.userReview.gap)
    .slice(0, 3);
  const bestReviews = [...reviews]
    .sort((a, b) => a.userReview.gap - b.userReview.gap)
    .slice(0, 3);

  return `
    <div class="final-section">
      <h3>Vos choix</h3>
      <div class="stat-grid final-choice-stats">
        <div class="stat"><strong>${closeChoices}/${reviews.length}</strong><span>Proches du coach</span></div>
        <div class="stat"><strong>${riskyChoices}</strong><span>Coups à revoir</span></div>
        <div class="stat"><strong>${formatPoints(averageGap)}</strong><span>Écart moyen</span></div>
        <div class="stat"><strong>${reviews.length}</strong><span>Coups analysés</span></div>
      </div>
      <div class="choice-review-columns">
        <div>
          <h4>Coups à revoir</h4>
          <div class="choice-review-list">
            ${keyReviews.map(renderChoiceReviewItem).join("")}
          </div>
        </div>
        <div>
          <h4>Vos meilleurs coups</h4>
          <div class="choice-review-list">
            ${bestReviews.map(renderChoiceReviewItem).join("")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function finalLearningInsights(game) {
  const reviews = userChoiceReviews(game);
  const userTeam = game.players[0]?.team;
  const userWon = userTeam === game.finalScore?.winnerTeam;
  const riskyChoices = reviews.filter((review) => review.userReview.gap > 14);
  const closeChoices = reviews.filter((review) => review.userReview.gap <= 6);
  const heavyLost = [...(game.trickReviews || [])]
    .filter((review) => playerTeam(game, review.winner) !== userTeam)
    .sort((a, b) => (b.trickPoints || 0) - (a.trickPoints || 0))[0];
  const heavyWon = [...(game.trickReviews || [])]
    .filter((review) => playerTeam(game, review.winner) === userTeam)
    .sort((a, b) => (b.trickPoints || 0) - (a.trickPoints || 0))[0];
  const memory = cardMemorySummary(game);
  const boutsSeen = memory.bouts.filter((bout) => bout.seen);
  const items = [];

  items.push(
    userWon
      ? "Votre camp a transformé suffisamment de plis importants pour gagner la donne."
      : "Votre camp perd la donne: le bilan indique surtout les plis et décisions qui ont fait basculer l'écart."
  );

  if (reviews.length > 0) {
    items.push(
      `${closeChoices.length}/${reviews.length} coup(s) analysés étaient proches du coach; ${riskyChoices.length} demandent une vraie relecture.`
    );
  } else {
    items.push("Aucun coup joueur n'a été comparé: jouez une donne complète avec coach actif pour obtenir une analyse personnalisée.");
  }

  if (heavyLost) {
    items.push(
      `Le pli perdu le plus lourd est le pli ${heavyLost.trickNumber} (${formatPoints(
        heavyLost.trickPoints || 0
      )} pts): c'est un bon point de replay.`
    );
  }
  if (heavyWon) {
    items.push(
      `Votre camp a le mieux capitalisé au pli ${heavyWon.trickNumber} (${formatPoints(
        heavyWon.trickPoints || 0
      )} pts).`
    );
  }

  if (boutsSeen.length > 0) {
    items.push(
      `Bouts vus: ${boutsSeen
        .map((bout) => `${cardShort(bout.card)} par ${playerName(game, bout.player)}`)
        .join(", ")}.`
    );
  }

  if (riskyChoices.length > 0) {
    const worst = [...riskyChoices].sort((a, b) => b.userReview.gap - a.userReview.gap)[0];
    items.push(
      `Priorité d'entraînement: revoir le pli ${worst.trickNumber}, où ${cardShort(
        worst.userReview.best
      )} était nettement préféré à ${cardShort(worst.userReview.played)}.`
    );
  } else if (reviews.length > 0) {
    items.push("Priorité d'entraînement: continuer le comptage des atouts et des renonces, vos choix analysés sont stables.");
  }

  return {
    items,
    riskyChoices: riskyChoices.length,
    closeChoices: closeChoices.length,
    analyzedChoices: reviews.length,
    heavyLost,
    heavyWon,
  };
}

function renderFinalLearningReport(game) {
  const report = finalLearningInsights(game);
  return `
    <div class="final-section learning-report">
      <h3>Analyse du coach</h3>
      <div class="stat-grid final-choice-stats">
        <div class="stat"><strong>${report.closeChoices}/${report.analyzedChoices}</strong><span>Choix proches</span></div>
        <div class="stat"><strong>${report.riskyChoices}</strong><span>Choix à revoir</span></div>
        <div class="stat"><strong>${report.heavyWon ? formatPoints(report.heavyWon.trickPoints || 0) : "-"}</strong><span>Meilleur pli gagné</span></div>
        <div class="stat"><strong>${report.heavyLost ? formatPoints(report.heavyLost.trickPoints || 0) : "-"}</strong><span>Pli perdu lourd</span></div>
      </div>
      <ul class="reason-list">
        ${report.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderFinalKeyTricks(game) {
  const keyTricks = [...(game.trickReviews || [])]
    .sort((a, b) => (b.trickPoints || 0) - (a.trickPoints || 0))
    .slice(0, 3);
  return `
    <div class="final-section">
      <h3>Plis clés</h3>
      ${
        keyTricks.length === 0
          ? `<p>Aucun pli terminé.</p>`
          : `<div class="log-list">${keyTricks
              .map(
                (review) =>
                  `<div class="log-entry"><strong>Pli ${review.trickNumber}: ${formatPoints(review.trickPoints || 0)} pts</strong><br>${escapeHtml(review.explanation || "")}</div>`
              )
              .join("")}</div>`
      }
    </div>
  `;
}

function renderFinalSummary(game) {
  const final = game.finalScore;
  if (!final) {
    return "";
  }

  const winnerLabel = teamLabel(final.winnerTeam);
  const userWon = game.players[0].team === final.winnerTeam;
  const userScore = playerFinalScore(game, 0);
  const takerScore = playerFinalScore(game, game.taker);
  const defenderScore = -final.signedScore;
  const takerPointText = formatScoredPoints(final.takerPoints, final.scoredTakerPoints ?? final.takerPoints);
  const defensePointText = formatScoredPoints(final.defensePoints, final.scoredDefensePoints ?? final.defensePoints);
  const scoringPointText =
    final.takerPoints === final.scoredTakerPoints
      ? `Il termine à ${formatPoints(final.takerPoints)}`
      : `Il termine à ${formatPoints(final.takerPoints)}, compté ${formatPoints(final.scoredTakerPoints)} pour la marque`;
  const takerTeam = game.players.filter((player) => player.team === "taker").map((player) => player.name).join(", ");
  const defenseTeam = game.players.filter((player) => player.team === "defense").map((player) => player.name).join(", ");
  const petitText = game.petitAuBout
    ? `${playerName(game, game.petitAuBout.player)} marque le Petit au bout pour ${teamLabel(game.petitAuBout.team).toLowerCase()}.`
    : "Pas de Petit au bout.";

  return `
    <section class="panel phase-panel final-summary">
      <div class="panel-header">
        <div>
          <h2>Bilan de partie</h2>
          <p>${escapeHtml(userWon ? "Votre camp gagne la donne." : "Votre camp perd la donne.")}</p>
        </div>
        <button class="primary-button" data-action="restart">Nouvelle donne</button>
      </div>
      <div class="panel-body">
        <div class="final-hero ${escapeHtml(final.winnerTeam)}">
          <div>
            <span>Camp gagnant</span>
            <strong>${escapeHtml(winnerLabel)}</strong>
          </div>
          <div>
            <span>Votre marque</span>
            <strong>${escapeHtml(formatSignedPoints(userScore))}</strong>
          </div>
        </div>
        <div class="stat-grid final-score-grid">
          <div class="stat"><strong>${escapeHtml(playerName(game, game.taker))}</strong><span>Preneur</span></div>
          <div class="stat"><strong>${escapeHtml(final.contract)}</strong><span>Contrat</span></div>
          <div class="stat"><strong>${escapeHtml(`${takerPointText} / ${formatPoints(final.target)}`)}</strong><span>Points / objectif</span></div>
          <div class="stat"><strong>${escapeHtml(formatSignedPoints(final.delta))}</strong><span>Écart au contrat</span></div>
          <div class="stat"><strong>${final.bouts}</strong><span>Bouts preneur</span></div>
          <div class="stat"><strong>${escapeHtml(formatSignedPoints(final.petitBonus))}</strong><span>Petit au bout</span></div>
          <div class="stat"><strong>${escapeHtml(formatSignedPoints(final.handfulBonus))}</strong><span>Poignées</span></div>
          <div class="stat"><strong>${escapeHtml(defensePointText)}</strong><span>Points défense</span></div>
          <div class="stat"><strong>${escapeHtml(formatSignedPoints(takerScore))}</strong><span>Marque preneur</span></div>
          <div class="stat"><strong>${escapeHtml(formatSignedPoints(defenderScore))}</strong><span>Chaque défenseur</span></div>
        </div>
        <div class="final-section">
          <h3>Lecture de la donne</h3>
          <p>Le preneur devait atteindre ${formatPoints(final.target)} points avec ${final.bouts} bout(s). ${escapeHtml(scoringPointText)}, soit ${escapeHtml(formatSignedPoints(final.delta))} point(s) par rapport au contrat. ${escapeHtml(petitText)}</p>
          <div class="team-summary">
            <span><strong>Preneur</strong>${escapeHtml(takerTeam || "-")}</span>
            <span><strong>Défense</strong>${escapeHtml(defenseTeam || "-")}</span>
          </div>
        </div>
        ${renderFinalKeyTricks(game)}
        ${renderFinalLearningReport(game)}
        ${renderFinalChoiceSummary(game)}
      </div>
    </section>
  `;
}

function renderSideTabs(activeTab) {
  return `
    <div class="side-tabs" role="tablist" aria-label="Panneaux de partie">
      ${SIDE_TABS.map(
        (tab) => `
          <button class="side-tab ${activeTab === tab.id ? "active" : ""}" data-action="set-side-tab" data-tab="${tab.id}" role="tab" aria-selected="${activeTab === tab.id ? "true" : "false"}">
            ${escapeHtml(tab.label)}
          </button>
        `
      ).join("")}
    </div>
  `;
}

function renderGameStatusPanel(game, isGuided, target, contractName, bouts) {
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>${isGuided ? "Coach de partie" : "Partie contre ordinateur"}</h2>
          <p>${isGuided ? "Le coach compare votre coup avec les simulations." : "Mode libre avec aide, indice et analyse automatique de vos coups."}</p>
        </div>
        <span class="pill mode-pill">${isGuided ? "Guidé" : "Libre"}</span>
      </div>
      <div class="panel-body">
        <div class="stat-grid">
          <div class="stat"><strong>${formatPoints(teamPoints(game, "taker"))}</strong><span>Points preneur</span></div>
          <div class="stat"><strong>${formatPoints(target)}</strong><span>Objectif actuel</span></div>
          <div class="stat"><strong>${bouts}</strong><span>Bouts preneur</span></div>
          <div class="stat"><strong>${escapeHtml(contractName)}</strong><span>Contrat</span></div>
        </div>
        ${
          game.feedback
            ? `<div class="hint-card best-hint feedback-card"><h3>Retour</h3><p>${escapeHtml(game.feedback)}</p></div>`
            : ""
        }
      </div>
    </section>
  `;
}

function replayStepExplanation(game, review, step) {
  const visibleCards = review.cards.slice(0, step);
  const lastEntry = visibleCards[visibleCards.length - 1];
  const currentWinner = getWinningEntry(visibleCards);
  if (!lastEntry || !currentWinner) {
    return "Aucune carte visible dans ce replay.";
  }
  if (step < review.cards.length) {
    return `${playerName(game, lastEntry.player)} joue ${cardName(lastEntry.card)}. À ce moment, ${playerName(
      game,
      currentWinner.player
    )} tient provisoirement le pli avec ${cardName(currentWinner.card)}.`;
  }
  return review.explanation || explainTrickWinner(review.cards, review.winner, game);
}

function renderPreviousTrickPanel(game) {
  const reviews = game.trickReviews || [];
  const { review, index } = activeReplayReview(game);
  if (!review) {
    return renderDetailsPanel(
      "Replay de pli",
      "Aucun pli terminé pour le moment.",
      `<div class="hint-card"><p>Le replay carte par carte apparaîtra ici après le premier pli terminé.</p></div>`,
      true,
      "previous-trick-panel"
    );
  }

  const step = activeReplayStep(game, review);
  const stepExplanation = replayStepExplanation(game, review, step);
  const body = `
    <div class="previous-trick">
      <div class="replay-toolbar">
        <button class="ghost-button" data-action="replay-older" ${index >= reviews.length - 1 ? "disabled" : ""}>Pli précédent</button>
        <span>Pli ${review.trickNumber} · carte ${step}/${review.cards.length}</span>
        <button class="ghost-button" data-action="replay-newer" ${index <= 0 ? "disabled" : ""}>Pli suivant</button>
      </div>
      <div class="review-card-row">
        ${review.cards
          .map((entry, cardIndex) => {
            const visible = cardIndex < step;
            return `
              <div class="review-card-item ${entry.player === review.winner ? "winner" : ""} ${visible ? "" : "pending"}">
                <span>${escapeHtml(playerName(game, entry.player))}</span>
                ${visible ? renderMiniCard(entry.card) : `<div class="empty-slot"></div>`}
                <small>${cardIndex + 1}</small>
              </div>
            `;
          })
          .join("")}
      </div>
      <div class="replay-toolbar replay-stepper">
        <button class="ghost-button" data-action="replay-prev-card" ${step <= 1 ? "disabled" : ""}>Carte précédente</button>
        <button class="ghost-button" data-action="replay-next-card" ${step >= review.cards.length ? "disabled" : ""}>Carte suivante</button>
      </div>
      <div class="hint-card best-hint">
        <h3>${escapeHtml(step >= review.cards.length ? `${playerName(game, review.winner)} remporte le pli` : "Lecture provisoire")}</h3>
        <p>${escapeHtml(stepExplanation)}</p>
      </div>
      ${review.userReview ? renderChoiceReviewItem(review) : ""}
    </div>
  `;
  return renderDetailsPanel(
    "Replay de pli",
    `${reviews.length} pli(s) revu(s), ${formatPoints(review.trickPoints || 0)} point(s) sur celui-ci.`,
    body,
    true,
    "previous-trick-panel"
  );
}

function renderScoreTab(game, isGuided, target, contractName, bouts) {
  const takerTeam = game.players.filter((player) => player.team === "taker").map((player) => player.name).join(", ") || "-";
  const defenseTeam = game.players.filter((player) => player.team === "defense").map((player) => player.name).join(", ") || "-";
  const final = game.finalScore;
  const finalTakerPointText = final ? formatScoredPoints(final.takerPoints, final.scoredTakerPoints ?? final.takerPoints) : "";
  const userScore = final ? playerFinalScore(game, 0) : 0;
  const topTricks = [...(game.trickReviews || [])]
    .sort((a, b) => (b.trickPoints || 0) - (a.trickPoints || 0))
    .slice(0, 3);

  return `
    ${renderGameStatusPanel(game, isGuided, target, contractName, bouts)}
    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>Lecture du score</h3>
          <p>Objectif, équipes et plis qui ont pesé dans la donne.</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="team-summary">
          <span><strong>Preneur</strong>${escapeHtml(takerTeam)}</span>
          <span><strong>Défense</strong>${escapeHtml(defenseTeam)}</span>
        </div>
        <div class="player-score-list">
          ${game.players
            .map(
              (player, index) => `
                <div class="player-score-row team-${escapeHtml(player.team)} ${index === game.taker ? "taker-row" : ""}">
                  <strong>${escapeHtml(player.name)}</strong>
                  <span>${escapeHtml(roleLabel(game, index))}</span>
                  <span>${player.tricks} pli(s)</span>
                  <span>${formatPoints(player.points)} pts</span>
                </div>
              `
            )
            .join("")}
        </div>
        ${
          final
            ? `<div class="hint-card best-hint score-breakdown">
                <h3>${final.success ? "Contrat gagné" : "Contrat chuté"}</h3>
                <p>Le preneur termine à ${escapeHtml(finalTakerPointText)} / ${formatPoints(final.target)}, soit ${escapeHtml(formatSignedPoints(final.delta))} point(s) par rapport à l'objectif. Votre marque: ${escapeHtml(formatSignedPoints(userScore))}.</p>
              </div>`
            : `<div class="hint-card score-breakdown">
                <h3>Score provisoire</h3>
                <p>Le preneur vise ${formatPoints(target)} point(s). Les bouts déjà gagnés peuvent encore faire baisser ou monter cet objectif.</p>
              </div>`
        }
        <div class="final-section">
          <h3>Plis les plus lourds</h3>
          ${
            topTricks.length === 0
              ? `<p>Aucun pli terminé pour le moment.</p>`
              : `<div class="log-list">${topTricks
                  .map(
                    (review) =>
                      `<div class="log-entry"><strong>Pli ${review.trickNumber}: ${formatPoints(review.trickPoints || 0)} pts</strong><br>${escapeHtml(review.explanation || "")}</div>`
                  )
                  .join("")}</div>`
          }
        </div>
      </div>
    </section>
  `;
}

function renderDiscardCoachPanel(game) {
  const requiredDiscard = game.dogSize || 6;
  const suggestion = suggestedDiscardCards(game);
  const summary = suggestion.length
    ? suggestion.map(cardShort).join(", ")
    : "Aucune suggestion disponible pour le moment.";

  return `
    <section class="panel discard-coach-panel">
      <div class="panel-header">
        <div>
          <h3>Coach d'écart</h3>
          <p>${escapeHtml(requiredDiscard)} cartes à sortir avant de jouer.</p>
        </div>
        <span class="pill gold">${escapeHtml(game.selectedDiscard.length)} / ${escapeHtml(requiredDiscard)}</span>
      </div>
      <div class="panel-body">
        <p class="panel-copy">Suggestion: ${escapeHtml(summary)}</p>
        <div class="dog-cards discard-suggestion-cards" aria-label="Cartes conseillées pour l'écart">
          ${suggestion.map((card) => renderMiniCard(card)).join("")}
        </div>
        <button class="primary-button" data-action="apply-discard-suggestion">Appliquer la suggestion</button>
        <ul class="reason-list">
          <li>Priorité aux petites cartes et aux couleurs courtes.</li>
          <li>Les bouts et les rois restent protégés sauf absence d'autre choix.</li>
          <li>Les cartes validées iront au pli du preneur pour le comptage final.</li>
        </ul>
      </div>
    </section>
  `;
}

function renderBiddingCoachPanel(game) {
  const isUserTurn = game.bidding.currentPlayer === 0;
  const advice = biddingAdvice(game, 0);
  const recommendation = advice.recommended === PASS_BID ? "Passe" : CONTRACTS[advice.recommended].name;
  const desired = advice.desired === PASS_BID ? "Passe" : CONTRACTS[advice.desired].name;
  const highestBid = game.bidding.highestContractId
    ? `${playerName(game, game.bidding.highestBidder)} tient ${CONTRACTS[game.bidding.highestContractId].name}`
    : "Aucune enchère pour le moment";
  const availableText = advice.options.length
    ? advice.options.map((contractId) => CONTRACTS[contractId].name).join(", ")
    : "Aucune montée disponible";

  return `
    <section class="panel bidding-coach-panel">
      <div class="panel-header">
        <div>
          <h3>Avis d'enchère</h3>
          <p>${escapeHtml(isUserTurn ? "Le coach évalue votre main avant l'annonce." : "Le coach prépare votre prochaine décision.")}</p>
        </div>
        <span class="pill gold">${escapeHtml(Math.round(advice.strength))}</span>
      </div>
      <div class="panel-body">
        <div class="bidding-advice-card">
          <span>Recommandation</span>
          <strong>${escapeHtml(recommendation)}</strong>
          <p>Lecture brute: ${escapeHtml(desired)}. ${escapeHtml(highestBid)}.</p>
          ${
            isUserTurn
              ? `<button class="primary-button" data-action="place-bid" data-contract="${escapeHtml(advice.recommended)}">Choisir ${escapeHtml(recommendation)}</button>`
              : ""
          }
        </div>
        <div class="stat-grid bidding-advice-stats">
          <div class="stat"><strong>${advice.stats.trumps}</strong><span>Atouts</span></div>
          <div class="stat"><strong>${advice.stats.bouts}</strong><span>Bouts</span></div>
          <div class="stat"><strong>${advice.stats.highTrumps}</strong><span>Gros atouts</span></div>
          <div class="stat"><strong>${advice.stats.kings}</strong><span>Rois</span></div>
        </div>
        <p class="panel-copy">Enchères possibles: ${escapeHtml(availableText)}.</p>
        <ul class="reason-list">
          ${advice.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
        </ul>
      </div>
    </section>
  `;
}

function renderCoachTab(game, isGuided, hint) {
  if (game.phase === "bidding") {
    return `
      ${renderBiddingCoachPanel(game)}
      ${renderPreviousTrickPanel(game)}
    `;
  }

  if (game.phase === "discard" && game.taker === 0) {
    return `
      ${renderDiscardCoachPanel(game)}
      ${renderPreviousTrickPanel(game)}
    `;
  }

  return `
    ${
      hint
        ? renderAnalysisPanel(game.hint, game.hintSelectedId || hint.card.id, game.hintTitle || "Meilleur coup simulé", "game")
        : renderCoachHelpPanel(game, isGuided)
    }
    ${renderPreviousTrickPanel(game)}
  `;
}

function renderHistoryTab(game) {
  return `
    ${renderCardMemoryPanel(game)}
    ${renderTrickReviewPanel(game)}
    ${renderPlayedCardsPanel(game)}
    ${renderLogPanel(game)}
    ${renderProgressPanel()}
  `;
}

function sidePanelShortLabel(panel) {
  return {
    actions: "Act.",
    coach: "Coach",
    score: "Score",
    history: "Hist.",
    settings: "Régl.",
  }[panel.id] || panel.label;
}

function renderSidePanelHeader(collapsed) {
  return `
    <div class="side-panel-header">
      <span>${collapsed ? "Menu" : "Panneau"}</span>
      <button class="icon-button side-panel-toggle" data-action="toggle-side-panel" aria-label="${collapsed ? "Ouvrir le panneau droit" : "Réduire le panneau droit"}" aria-expanded="${collapsed ? "false" : "true"}" title="${collapsed ? "Ouvrir le panneau droit" : "Réduire le panneau droit"}">
        ${collapsed ? "<" : ">"}
      </button>
    </div>
  `;
}

function renderSidePanelTabs(panels, activePanel, collapsed = false) {
  return `
    <div class="side-panel-tabs" role="tablist" aria-label="Menu de partie">
      ${panels
        .map(
          (panel) => `
            <button class="side-panel-tab ${activePanel === panel.id ? "active" : ""}" data-action="set-side-panel" data-panel="${escapeHtml(panel.id)}" role="tab" aria-label="${escapeHtml(panel.label)}" title="${escapeHtml(panel.label)}" aria-selected="${activePanel === panel.id ? "true" : "false"}">
              ${escapeHtml(collapsed ? sidePanelShortLabel(panel) : panel.label)}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function activeSidePanel(panels, game = null) {
  const available = new Set(panels.map((panel) => panel.id));
  if (available.has(state.settings.sidePanel)) {
    return state.settings.sidePanel;
  }
  return panels[0]?.id || "coach";
}

function renderQuickActionsPanel(game) {
  const isUserBidding = game.phase === "bidding" && game.bidding.currentPlayer === 0;
  const canAskHint =
    coachAllowsHint() &&
    game.phase === "playing" &&
    game.currentPlayer === 0 &&
    !game.trickComplete &&
    !state.animating;

  return `
    <section class="panel quick-actions-panel">
      <div class="panel-header">
        <div>
          <h2>Actions rapides</h2>
          <p>Commandes utiles pendant la donne.</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="quick-action-grid">
          <button class="primary-button" data-action="restart">Redistribuer</button>
          <button class="ghost-button" data-action="set-side-panel" data-panel="coach">${isUserBidding ? "Avis d'enchère" : "Voir le coach"}</button>
          ${
            canAskHint
              ? `<button class="ghost-button" data-action="hint">Indice</button>`
              : ""
          }
        </div>
      </div>
    </section>
  `;
}

function renderGameSidebar(game, isGuided, hint, target, contractName, bouts, phasePanel = "") {
  const actionsBody = `${phasePanel || ""}${renderQuickActionsPanel(game)}`;
  const panels = [
    { id: "actions", label: "Actions", body: actionsBody },
    { id: "coach", label: "Coach", body: renderCoachTab(game, isGuided, hint) },
    { id: "score", label: "Score", body: renderScoreTab(game, isGuided, target, contractName, bouts) },
    { id: "history", label: "Historique", body: renderHistoryTab(game) },
    {
      id: "settings",
      label: "Réglages",
      body: `<div class="top-actions side-settings-controls">${renderSettingsControls()}</div>`,
    },
  ];
  const activePanel = activeSidePanel(panels, game);
  const activeBody = panels.find((panel) => panel.id === activePanel)?.body || panels[0]?.body || "";
  const collapsed = state.settings.sidePanelCollapsed;

  return `
    <aside class="side-stack game-side-panel ${collapsed ? "collapsed" : ""}" aria-label="Panneau de partie">
      ${renderSidePanelHeader(collapsed)}
      ${renderSidePanelTabs(panels, activePanel, collapsed)}
      ${
        collapsed
          ? ""
          : `<section class="side-panel-content" role="tabpanel">
              ${activeBody}
            </section>`
      }
    </aside>
  `;
}

function renderGameMode(mode) {
  const game = ensureGame(mode);
  const hint = game.hint?.[0] || null;
  const isGuided = mode === "guided";
  const takerCards = teamCards(game, "taker");
  const bouts = countBouts(takerCards);
  const target = targetForBouts(bouts);
  const contractName = game.contract?.name || "Enchères";
  const phasePanel = renderGamePhasePanel(game);
  const showPhasePanelInCenter = game.phase === "ended" || gameNeedsActionPanel(game);
  const centerPhasePanel = showPhasePanelInCenter ? phasePanel : "";
  const sidePhasePanel = showPhasePanelInCenter ? "" : phasePanel;
  const nowPanel = renderNowPanel(game);
  const handMarkup = game.phase === "ended" ? "" : renderHand(game, { hideHintButton: Boolean(nowPanel) });
  const showInlineCoachSummary = state.settings.sidePanelCollapsed;
  const focusMode = userTurnNeedsFocus(game) && !hint;
  const hasCurrentUserFeedback = game.lastUserFeedback?.trickNumber === game.trickNumber;
  const prioritizeHand =
    focusMode ||
    (game.phase === "discard" && game.taker === 0) ||
    Boolean(game.phase === "playing" && hasCurrentUserFeedback && game.players[0].hand.length > 0);

  return `
    <div class="workspace game-workspace ${state.settings.sidePanelCollapsed ? "side-panel-collapsed" : ""}">
      <div class="table-zone game-table phase-${escapeHtml(game.phase)} ${prioritizeHand ? "user-action-priority" : ""}">
        ${renderTurnBanner(game)}
        ${nowPanel}
        ${centerPhasePanel}
        ${showInlineCoachSummary ? renderFocusCoachSummary(game, hint) : ""}
        ${renderFelt(game)}
        ${game.phase === "playing" ? renderTrickSequence(game) : ""}
        ${handMarkup}
        ${renderInlineReplaySummary(game)}
      </div>
      ${renderGameSidebar(game, isGuided, hint, target, contractName, bouts, sidePhasePanel)}
    </div>
  `;
}

function renderRulesPanel() {
  const body = `
    <ul class="reason-list">
      <li>Fournissez la couleur demandée si vous le pouvez.</li>
      <li>Sans la couleur, coupez avec un atout si vous en avez.</li>
      <li>À l'atout, montez si vous pouvez battre le meilleur atout déjà joué.</li>
      <li>L'Excuse reste au camp qui la joue et déclenche une compensation de 0,5 point.</li>
    </ul>
  `;
  return renderDetailsPanel(
    "Rappels rapides",
    "La donne inclut contrat, chien, écart, preneur et défense.",
    body,
    true,
    "rules-panel"
  );
}

function renderCoachHelpPanel(game, isGuided) {
  const mode = coachMode();
  const canAskHint = coachAllowsHint() && game.phase === "playing" && game.currentPlayer === 0 && !game.trickComplete;
  const latestReview = coachAllowsReview() ? (game.trickReviews || []).find((review) => review.userReview) : null;
  const modeText = {
    none: "Le coach est désactivé pour cette partie. Vous pouvez le réactiver dans la barre du haut.",
    hint: "Le coach donne une aide avant de jouer, puis vous laisse analyser seul vos coups.",
    review: "Le coach ne donne pas d'indice avant le coup, mais explique vos décisions après coup.",
    full: "Le coach peut proposer un indice avant le coup et analyse automatiquement vos cartes après coup.",
  }[mode];
  const body = `
    <div class="coach-help">
      <div class="hint-card best-hint">
        <h3>${isGuided ? "Coach actif" : "Aide contre ordinateur"}</h3>
        <p>${escapeHtml(modeText)}</p>
        ${
          canAskHint
            ? `<button class="ghost-button coach-hint-button" data-action="hint">Analyser ma main</button>`
            : ""
        }
      </div>
      ${
        latestReview
          ? `<div class="coach-latest">${renderChoiceReviewItem(latestReview)}</div>`
          : `<ul class="reason-list">
              <li>Le score 0-100 mesure la pertinence estimée dans la position.</li>
              <li>Le pourcentage indique la chance de remporter le pli avec cette carte.</li>
              <li>Les raisons expliquent fourniture, coupe, protection des bouts et points donnés.</li>
            </ul>`
      }
    </div>
  `;
  return renderDetailsPanel(
    isGuided ? "Coach de partie" : "Aide contre ordinateur",
    canAskHint ? "Demandez une analyse avant de poser une carte." : "Vos coups seront expliqués après coup.",
    body,
    true,
    "coach-help-panel"
  );
}

function renderDetailsPanel(title, subtitle, body, open = false, className = "") {
  return `
    <details class="panel details-panel ${escapeHtml(className)}" ${open ? "open" : ""}>
      <summary class="panel-summary">
        <div>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(subtitle)}</p>
        </div>
      </summary>
      <div class="panel-body">
        ${body}
      </div>
    </details>
  `;
}

function renderLogPanel(game) {
  const body = `
    <div class="log-list">
      ${game.log.slice(0, 12).map((entry) => `<div class="log-entry">${escapeHtml(entry)}</div>`).join("")}
    </div>
  `;
  return renderDetailsPanel("Journal", "Derniers coups et résultats de plis.", body, false, "log-panel");
}

function renderProgressPanel() {
  const stats = sanitizeProgress(state.stats);
  const averageCoachGap = stats.analyzedGameChoices > 0
    ? stats.cumulativeCoachGap / stats.analyzedGameChoices
    : 0;
  const body = `
    <div class="stat-grid">
      <div class="stat"><strong>${stats.learningAttempts}</strong><span>Choix analysés</span></div>
      <div class="stat"><strong>${stats.goodLearningChoices}</strong><span>Bons choix</span></div>
      <div class="stat"><strong>${stats.gamesFinished}</strong><span>Parties finies</span></div>
      <div class="stat"><strong>${stats.userWins}</strong><span>Victoires joueur</span></div>
      <div class="stat"><strong>${escapeHtml(formatSignedPoints(stats.cumulativeUserScore))}</strong><span>Score cumulé joueur</span></div>
      <div class="stat"><strong>${escapeHtml(formatSignedPoints(stats.cumulativeTakerScore))}</strong><span>Score preneur</span></div>
      <div class="stat"><strong>${escapeHtml(formatSignedPoints(stats.cumulativeDefenseScore))}</strong><span>Score défense</span></div>
      <div class="stat"><strong>${escapeHtml(formatPoints(averageCoachGap))}</strong><span>Écart coach moyen</span></div>
    </div>
  `;
  return renderDetailsPanel("Progression", "Statistiques locales de votre entraînement.", body, false, "progress-panel");
}

function renderTrickReviewPanel(game) {
  const reviews = (game.trickReviews || []).slice(0, game.phase === "ended" ? 8 : 3);
  const body =
    reviews.length === 0
      ? `<div class="hint-card"><p>Aucun pli terminé pour le moment.</p></div>`
      : `<div class="log-list">${reviews
          .map((review) => {
            if (review.userReview) {
              return `
                <div class="trick-review-block">
                  <div class="log-entry"><strong>Pli ${review.trickNumber}: ${escapeHtml(playerName(game, review.winner))}</strong><br>${escapeHtml(review.explanation || "")}</div>
                  ${renderChoiceReviewItem(review)}
                </div>
              `;
            }
            return `<div class="log-entry"><strong>Pli ${review.trickNumber}: ${escapeHtml(
              playerName(game, review.winner)
            )}</strong><br>${escapeHtml(review.explanation || "Vous n'avez pas joué dans ce pli.")}</div>`;
          })
          .join("")}</div>`;
  return renderDetailsPanel(
    "Analyse après coup",
    "Derniers plis et écart avec le coach.",
    body,
    game.phase === "ended",
    "review-panel"
  );
}

function renderPlayedCardsPanel(game) {
  const cards = (game.playedCards || []).slice(-24).reverse();
  const body =
    cards.length === 0
      ? `<div class="hint-card"><p>Aucune carte jouée.</p></div>`
      : `<div class="played-card-grid">${cards
          .map(
            (entry) =>
              `<span class="played-card-token" title="${escapeHtml(
                `${playerName(game, entry.player)} · pli ${entry.trickNumber}`
              )}">${escapeHtml(cardShort(entry.card))}</span>`
          )
          .join("")}</div>`;
  return renderDetailsPanel("Cartes tombées", "Les 24 dernières cartes vues.", body, false, "played-panel");
}

function renderCardMemoryPanel(game) {
  const memory = cardMemorySummary(game);
  const trumpText =
    memory.trumps.length === 0
      ? "Aucun atout vu."
      : memory.trumps.map((card) => card.label).join(", ");
  const body = `
    <div class="card-memory">
      <div class="memory-strip">
        <div class="stat"><strong>${memory.totalSeen}</strong><span>Cartes vues</span></div>
        <div class="stat"><strong>${memory.trumpCount}/21</strong><span>Atouts tombés</span></div>
        <div class="stat"><strong>${memory.highestTrump ? cardShort(memory.highestTrump) : "-"}</strong><span>Plus fort atout vu</span></div>
        <div class="stat"><strong>${memory.bouts.filter((bout) => bout.seen).length}/3</strong><span>Bouts vus</span></div>
      </div>
      <div class="memory-suits">
        ${memory.bySuit
          .map(
            (suit) => `
              <div class="memory-suit">
                <strong>${escapeHtml(suit.symbol)} ${escapeHtml(suit.name)}</strong>
                <span>${suit.seen}/${suit.total} vues · ${suit.remaining} restantes</span>
                <small>${suit.heads.length ? `Têtes vues: ${suit.heads.map(cardShort).join(", ")}` : "Aucune tête vue"}</small>
              </div>
            `
          )
          .join("")}
      </div>
      <div class="hint-card">
        <h4>Atouts</h4>
        <p>${escapeHtml(trumpText)}</p>
      </div>
      <div class="bout-grid">
        ${memory.bouts
          .map(
            (bout) => `
              <div class="bout-memory ${bout.seen ? "seen" : ""}">
                <strong>${escapeHtml(cardShort(bout.card))}</strong>
                <span>${escapeHtml(bout.seen ? `${playerName(game, bout.player)} · pli ${bout.trickNumber}` : "Non vu")}</span>
              </div>
            `
          )
          .join("")}
      </div>
      ${
        memory.voids.length === 0
          ? `<div class="hint-card"><p>Aucune renonce certaine détectée pour le moment.</p></div>`
          : `<div class="void-list">${memory.voids
              .map(
                (entry) =>
                  `<span><strong>${escapeHtml(playerName(game, entry.player))}</strong>${escapeHtml(
                    entry.suits.map((suit) => suit.name).join(", ")
                  )}</span>`
              )
              .join("")}</div>`
      }
    </div>
  `;
  return renderDetailsPanel(
    "Mémoire de partie",
    "Atouts, bouts, couleurs tombées et renonces certaines.",
    body,
    true,
    "memory-panel"
  );
}

function renderLearningMode() {
  const scenario = SCENARIOS[state.learning.scenarioIndex];
  const game = createScenarioGame(state.learning.scenarioIndex);
  const selectedId = state.learning.selectedCardId;
  const analyses = state.learning.analyses;
  const selectedAnalysis = analyses.find((analysis) => analysis.card.id === selectedId) || analyses[0];
  const bestId = analyses[0]?.card.id;
  const legalCards = new Set(getLegalCards(game.players[0].hand, game.trick).map((card) => card.id));
  const inspectedLearningCardId = state.learning.inspectedIllegalCard?.cardId || null;

  return `
    <div class="workspace learn ${state.settings.sidePanelCollapsed ? "side-panel-collapsed" : ""}">
      <aside class="panel scenario-panel">
        <div class="panel-header">
          <div>
            <h2>Scénarios</h2>
            <p>Chaque situation isole une décision typique.</p>
          </div>
        </div>
        <div class="panel-body">
          <div class="scenario-list">
            ${SCENARIOS.map(
              (item, index) => `
                <button class="scenario-button ${index === state.learning.scenarioIndex ? "active" : ""}" data-action="switch-scenario" data-index="${index}">
                  <strong>${escapeHtml(item.title)}</strong>
                  <span>${escapeHtml(item.focus)} · ${escapeHtml(item.difficulty)}</span>
                </button>
              `
            ).join("")}
          </div>
        </div>
      </aside>

      <main class="table-zone learning-table">
        <section class="panel learning-brief">
          <div class="panel-header">
            <div>
              <h2>${escapeHtml(scenario.title)}</h2>
              <p>${escapeHtml(scenario.lesson)}</p>
              <div class="scenario-meta">
                <span class="pill gold">${escapeHtml(scenario.focus)}</span>
                <span class="pill">${escapeHtml(scenario.difficulty)}</span>
              </div>
            </div>
            <button class="primary-button" data-action="reveal-best">Voir le meilleur choix</button>
          </div>
        </section>
        <section class="hand-panel panel action-panel">
          <div class="panel-body">
            <div class="hand-header">
              <div>
                <h2>Vos options</h2>
                <p>Cliquez une carte pour comparer sa pertinence avec les simulations.</p>
              </div>
            </div>
            ${renderIllegalInspection({ inspectedIllegalCard: state.learning.inspectedIllegalCard })}
            <div class="hand">
              ${game.players[0].hand
                .map((card) =>
                  renderCardButton(card, {
                    selected: selectedId === card.id,
                    legal: legalCards.has(card.id),
                    disabled: false,
                    best: state.learning.analyses.length > 0 && bestId === card.id,
                    inspected: inspectedLearningCardId === card.id,
                    action: "select-learning-card",
                    title: legalCards.has(card.id) ? cardName(card) : illegalReason(card, game.players[0].hand, game.trick),
                  })
                )
                .join("")}
            </div>
          </div>
        </section>
        ${
          analyses.length > 0
            ? `<div class="learning-result-panel">${renderAnalysisPanel(
                analyses,
                selectedAnalysis?.card.id,
                "Simulation du choix",
                "learn"
              )}</div>`
            : ""
        }
        ${renderFelt(game, scenario.goal)}
      </main>

      <aside class="side-stack learning-side-panel ${state.settings.sidePanelCollapsed ? "collapsed" : ""}" aria-label="Panneau d'apprentissage">
        ${renderSidePanelHeader(state.settings.sidePanelCollapsed)}
        ${
          state.settings.sidePanelCollapsed
            ? ""
            : `<section class="side-panel-content">
                ${
                  analyses.length > 0
                    ? ""
                    : renderLearningPromptPanel(scenario)
                }
                <section class="panel">
                  <div class="panel-header">
                    <div>
                      <h3>Objectif tactique</h3>
                      <p>${escapeHtml(scenario.goal)}</p>
                    </div>
                  </div>
                  <div class="panel-body">
                    <ul class="reason-list">
                      <li>Le score combine légalité, probabilité de prendre le pli et valeur des points sauvés.</li>
                      <li>Les simulations rejouent la fin du pli avec des adversaires légèrement variables.</li>
                      <li>Le but n'est pas de mémoriser une carte, mais d'apprendre le raisonnement.</li>
                    </ul>
                  </div>
                </section>
              </section>`
        }
      </aside>
    </div>
  `;
}

function renderLearningPromptPanel(scenario) {
  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>À vous d'abord</h3>
          <p>Choisissez une carte ou révélez le meilleur choix pour lancer l'analyse.</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="hint-card">
          <h4>${escapeHtml(scenario.focus)}</h4>
          <p>${escapeHtml(scenario.goal)}</p>
        </div>
        <ul class="reason-list">
          <li>Les cartes grisées sont interdites par la règle de fourniture ou de surcoupe.</li>
          <li>Après votre choix, le coach compare les cartes légalement jouables.</li>
          <li>Les scénarios gardent les mains adverses fixes pour expliquer une position précise.</li>
        </ul>
      </div>
    </section>
  `;
}

function coachAdvice(selected, best) {
  const gap = best.score - selected.score;
  const selectedTeamWinRate = selected.teamWinRate ?? selected.winRate;
  const bestTeamSwing = best.averageTeamSwing ?? best.averageSwing;
  const selectedTeamSwing = selected.averageTeamSwing ?? selected.averageSwing;
  if (gap <= 6) {
    if (selected.card.bout) {
      return "Votre choix engage un bout, mais la simulation estime que la situation le justifie. Gardez ce réflexe: un bout se joue surtout quand il est protégé ou quand le pli vaut vraiment le risque.";
    }
    if (selectedTeamWinRate >= 0.65 && selected.winRate < 0.45) {
      return "Votre carte ne prend pas forcément elle-même, mais elle aide votre camp à garder le pli. C'est souvent le bon réflexe en défense quand un allié tient déjà.";
    }
    if (selected.winRate >= 0.65) {
      return "Votre carte prend souvent le pli. Le bon point est que vous gardez l'initiative sans donner trop de points.";
    }
    return "Votre choix est proche du meilleur coup. Il respecte la contrainte du pli et ne crée pas de grosse perte immédiate.";
  }

  if (selected.card.points >= 3.5 && selectedTeamWinRate < 0.45) {
    return `Le risque principal est de donner une tête sans contrôle du pli. ${cardName(best.card)} était préféré car il protégeait mieux les points ou reprenait plus souvent la main.`;
  }

  if (selected.card.bout && selectedTeamWinRate < 0.65) {
    return `Le risque principal est d'exposer un bout. ${cardName(best.card)} permettait de garder cette ressource pour un pli plus sûr.`;
  }

  if (bestTeamSwing > selectedTeamSwing + 2) {
    return `${cardName(best.card)} simulait un meilleur gain de points sur le pli. Votre carte est jouable, mais elle laisse plus souvent l'adversaire ramasser la valeur déjà posée.`;
  }

  return `${cardName(best.card)} était mieux noté surtout pour le contrôle du pli. Essayez de penser à deux choses: qui prend la main maintenant, et quelle ressource vous gardez pour le pli suivant.`;
}

function renderAnalysisPanel(analyses, selectedId, title, context) {
  if (!analyses || analyses.length === 0) {
    return "";
  }

  const selected = analyses.find((analysis) => analysis.card.id === selectedId) || analyses[0];
  const best = analyses[0];
  const selectedIsBest = selected.card.id === best.card.id;
  const comparisonText = selectedIsBest
    ? "C'est le meilleur choix simulé dans cette position."
    : `${cardName(best.card)} est mieux évaluée (${best.score} contre ${selected.score}).`;
  const candidateAction = context === "game" ? "select-game-hint" : "inspect-learning-card";
  const advice = coachAdvice(selected, best);
  const selectedTeamWinRate = selected.teamWinRate ?? selected.winRate;
  const selectedTeamSwing = selected.averageTeamSwing ?? selected.averageSwing;

  return `
    <section class="panel">
      <div class="panel-header">
        <div>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(selected.headline)}</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="analysis-summary">
          <div class="analysis-card primary-analysis">
            <span>${context === "learn" ? "Votre choix" : "Carte inspectée"}</span>
            <strong>${escapeHtml(cardName(selected.card))}</strong>
            <p>${escapeHtml(selected.headline)}</p>
          </div>
          <div class="analysis-card ${selectedIsBest ? "success-analysis" : ""}">
            <span>${selectedIsBest ? "Verdict" : "Meilleur choix"}</span>
            <strong>${escapeHtml(selectedIsBest ? "Optimal" : cardName(best.card))}</strong>
            <p>${escapeHtml(comparisonText)}</p>
          </div>
        </div>

        <div class="hint-card best-hint analysis-verdict">
          <div class="verdict-line">
            <strong>Pertinence ${selected.score}/100</strong>
            <span>${formatPoints(selectedTeamSwing)} pts camp · ${Math.round(selectedTeamWinRate * 100)}% camp · ${Math.round(selected.winRate * 100)}% carte</span>
          </div>
          <div class="meter" aria-label="Pertinence ${selected.score}">
            <span style="--value: ${selected.score}%"></span>
          </div>
        </div>

        <div class="reason-block">
          <h4>Pourquoi</h4>
          <ul class="reason-list">
            ${selected.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
          </ul>
        </div>

        <div class="hint-card coach-advice">
          <h4>Conseil du coach</h4>
          <p>${escapeHtml(advice)}</p>
        </div>

        <details class="candidate-details">
          <summary>Comparer les coups simulés</summary>
          <div class="analysis-list">
            ${analyses
              .slice(0, 7)
              .map(
                (analysis) => `
                <button class="candidate-row ${analysis.card.id === selected.card.id ? "active" : ""}" data-action="${candidateAction}" data-card-id="${analysis.card.id}">
                  <span class="candidate-rank">${escapeHtml(cardShort(analysis.card))}</span>
                  <span>
                    ${escapeHtml(analysis.headline)}
                    <small>${Math.round((analysis.teamWinRate ?? analysis.winRate) * 100)}% camp · ${Math.round(analysis.winRate * 100)}% carte · ${formatPoints(analysis.averageTeamSwing ?? analysis.averageSwing)} pts</small>
                  </span>
                  <span class="score-badge">${analysis.score}</span>
                </button>
              `
              )
              .join("")}
          </div>
        </details>
      </div>
    </section>
  `;
}

function homeRecommendation(stats) {
  if (stats.learningAttempts < 3) {
    return {
      title: "Prochaine étape: apprendre les cartes jouables",
      text: "Commencez par quelques scénarios courts avant une donne complète.",
      action: "Faire un exercice",
      actionType: "set-mode",
      mode: "learn",
    };
  }
  if (stats.gamesFinished === 0) {
    return {
      title: "Prochaine étape: première partie guidée",
      text: "Le coach vous accompagne sur les enchères, le chien, l'écart et les premiers plis.",
      action: "Première partie",
      actionType: "first-game",
      mode: "guided",
    };
  }
  if (stats.cumulativeCoachGap > 80) {
    return {
      title: "Prochaine étape: revoir les choix coûteux",
      text: "Vos derniers écarts avec le coach indiquent que le replay et les analyses seront utiles.",
      action: "Continuer guidé",
      actionType: "set-mode",
      mode: "guided",
    };
  }
  return {
    title: "Prochaine étape: consolider en partie libre",
    text: "Vous avez les bases. Jouez une donne contre l'ordinateur et gardez l'analyse après coup.",
    action: "Jouer libre",
    actionType: "set-mode",
    mode: "versus",
  };
}

function renderHomeMode() {
  const stats = sanitizeProgress(state.stats);
  const recommendation = homeRecommendation(stats);
  const resumableGames = ["guided", "versus"]
    .map((mode) => ({ mode, game: state.games[mode] }))
    .filter((entry) => isResumableGame(entry.game));
  const quickModes = [
    {
      id: "learn",
      title: "Apprendre une règle",
      text: "Scénarios courts, cartes jouables et comparaison immédiate avec le coach.",
      action: "Commencer",
      actionType: "set-mode",
    },
    {
      id: "guided",
      title: "Jouer une donne guidée",
      text: "Enchères, chien, écart et conseils pendant une partie complète.",
      action: isResumableGame(state.games.guided) ? "Continuer" : "Nouvelle donne",
      actionType: isResumableGame(state.games.guided) ? "set-mode" : "new-game",
    },
    {
      id: "versus",
      title: "Affronter l'ordinateur",
      text: "Partie libre contre des adversaires paramétrés, analyse après coup et score local.",
      action: isResumableGame(state.games.versus) ? "Continuer" : "Nouvelle donne",
      actionType: isResumableGame(state.games.versus) ? "set-mode" : "new-game",
    },
    {
      id: "strategy",
      title: "Réviser la stratégie",
      text: "Feuille de route pour enchérir, défendre, attaquer et protéger les bouts.",
      action: "Explorer",
      actionType: "set-mode",
    },
  ];
  const settingsPanel = `
    <section class="panel home-settings-panel">
      <div class="panel-header">
        <div>
          <h2>Préférences de table</h2>
          <p>Ces réglages s'appliqueront aux prochaines donnes.</p>
        </div>
      </div>
      <div class="panel-body">
        <div class="top-actions side-settings-controls home-settings-grid">${renderSettingsControls({ includeRestart: false })}</div>
      </div>
    </section>
  `;

  return `
    <div class="home-workspace">
      <section class="home-hero panel">
        <div class="home-copy">
          <span class="pill gold">Tableau de bord</span>
          <h2>Choisissez votre prochaine donne</h2>
          <p>Accédez vite aux exercices, aux parties guidées et aux analyses sans traverser l'interface de jeu.</p>
        </div>
        <div class="home-stats">
          <div class="stat"><strong>${stats.learningAttempts}</strong><span>Choix analysés</span></div>
          <div class="stat"><strong>${stats.gamesFinished}</strong><span>Parties finies</span></div>
          <div class="stat"><strong>${stats.userWins}</strong><span>Victoires joueur</span></div>
        </div>
      </section>
      <section class="home-next-step panel">
        <div>
          <span class="pill gold">Recommandé</span>
          <h2>${escapeHtml(recommendation.title)}</h2>
          <p>${escapeHtml(recommendation.text)}</p>
        </div>
        <button class="primary-button" data-action="${escapeHtml(recommendation.actionType)}" data-mode="${escapeHtml(recommendation.mode)}">${escapeHtml(recommendation.action)}</button>
      </section>
      ${settingsPanel}
      ${
        resumableGames.length > 0
          ? `<section class="resume-panel panel" aria-label="Donnes en cours">
              <div class="panel-header">
                <div>
                  <h2>Continuer la donne</h2>
                  <p>Reprenez exactement là où la table s'est arrêtée.</p>
                </div>
              </div>
              <div class="panel-body resume-grid">
                ${resumableGames
                  .map(
                    ({ mode, game }) => `
                      <article class="resume-card">
                        <div>
                          <strong>${escapeHtml(mode === "guided" ? "Partie guidée" : "Contre ordinateur")}</strong>
                          <span>${escapeHtml(gameResumeText(game))}</span>
                        </div>
                        <div class="resume-actions">
                          <button class="primary-button" data-action="set-mode" data-mode="${escapeHtml(mode)}">Continuer</button>
                          <button class="ghost-button" data-action="new-game" data-mode="${escapeHtml(mode)}">Nouvelle donne</button>
                        </div>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            </section>`
          : ""
      }
      <section class="home-actions" aria-label="Entrées principales">
        ${quickModes
          .map(
            (mode) => `
              <article class="lesson-card home-card">
                <h3>${escapeHtml(mode.title)}</h3>
                <p>${escapeHtml(mode.text)}</p>
                <div class="home-card-actions">
                  <button class="primary-button" data-action="${escapeHtml(mode.actionType)}" data-mode="${escapeHtml(mode.id)}">${escapeHtml(mode.action)}</button>
                  ${
                    mode.actionType !== "first-game" &&
                    (mode.id === "guided" || mode.id === "versus") &&
                    isResumableGame(state.games[mode.id])
                      ? `<button class="ghost-button" data-action="new-game" data-mode="${escapeHtml(mode.id)}">Nouvelle donne</button>`
                      : ""
                  }
                </div>
              </article>
            `
          )
          .join("")}
      </section>
    </div>
  `;
}

function renderStrategyMode() {
  return `
    <div class="side-stack">
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Stratégies à travailler</h2>
            <p>Choisissez une situation typique, jouez l'exercice lié, puis revenez ici pour consolider le raisonnement.</p>
          </div>
        </div>
      </section>
      <section class="lesson-grid">
        ${STRATEGY_LESSONS.map(
          (lesson) => `
            <article class="lesson-card">
              <h3>${escapeHtml(lesson.title)}</h3>
              <p>${escapeHtml(lesson.text)}</p>
              <button class="ghost-button" data-action="lesson-scenario" data-index="${lesson.scenario}">Ouvrir un exercice</button>
            </article>
          `
        ).join("")}
      </section>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h2>Axes d'entraînement</h2>
            <p>Travaillez une habitude à la fois pendant vos prochaines donnes guidées.</p>
          </div>
        </div>
        <div class="panel-body">
          <ul class="reason-list">
            <li>Avant d'enchérir: compter les bouts, les atouts et les longues utiles.</li>
            <li>Pendant l'écart: retirer les pertes évidentes sans exposer les rois ni les bouts.</li>
            <li>En défense: protéger les points quand un partenaire tient déjà le pli.</li>
            <li>Après la donne: relire les plis où le coach détecte le plus gros écart.</li>
          </ul>
        </div>
      </section>
    </div>
  `;
}

function handleAppClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) {
    return;
  }

  const action = target.dataset.action;
  const cardId = target.dataset.cardId;
  const index = Number(target.dataset.index);
  if (action !== "scroll-hand" && target.closest?.(".hand-panel")) {
    rememberHandScrollFrom(target);
  }

  if (action === "set-mode") {
    setMode(target.dataset.mode);
  } else if (action === "first-game") {
    startFirstGame();
  } else if (action === "new-game") {
    startNewGameMode(target.dataset.mode);
  } else if (action === "scroll-hand") {
    scrollHandFromControl(target, Number(target.dataset.direction) || 1);
  } else if (action === "toggle-nav") {
    toggleNavigation();
  } else if (action === "toggle-side-panel") {
    toggleSidePanelCollapsed();
  } else if (action === "restart") {
    restartCurrent();
  } else if (action === "hint") {
    requestHint();
  } else if (action === "play-card") {
    playUserCard(cardId);
  } else if (action === "toggle-discard") {
    toggleDiscard(cardId);
  } else if (action === "apply-discard-suggestion") {
    applyDiscardSuggestion();
  } else if (action === "confirm-discard") {
    confirmDiscard();
  } else if (action === "take-dog") {
    takeDog();
  } else if (action === "place-bid") {
    placeBid(target.dataset.contract);
  } else if (action === "announce-handful") {
    announceHandful(0);
  } else if (action === "select-game-hint") {
    selectGameHint(cardId);
  } else if (action === "select-learning-card") {
    selectLearningCard(cardId);
  } else if (action === "inspect-learning-card") {
    selectLearningCard(cardId, false);
  } else if (action === "reveal-best") {
    revealBestLearningCard();
  } else if (action === "switch-scenario") {
    switchScenario(index);
  } else if (action === "lesson-scenario") {
    useLessonScenario(index);
  } else if (action === "set-side-tab") {
    setSideTab(target.dataset.tab);
  } else if (action === "set-side-panel") {
    setSidePanel(target.dataset.panel);
  } else if (action === "replay-older") {
    moveReplayReview(1);
  } else if (action === "replay-newer") {
    moveReplayReview(-1);
  } else if (action === "replay-prev-card") {
    moveReplayStep(-1);
  } else if (action === "replay-next-card") {
    moveReplayStep(1);
  }
}

function handleAppChange(event) {
  const target = event.target.closest("[data-action]");
  if (!target) {
    return;
  }

  if (target.dataset.action === "set-player-count") {
    setPlayerCount(Number(target.value));
  } else if (target.dataset.action === "set-opponent-speed") {
    setOpponentSpeed(target.value);
  } else if (target.dataset.action === "set-opponent-level") {
    setOpponentLevel(target.value);
  } else if (target.dataset.action === "set-coach-mode") {
    setCoachMode(target.value);
  } else if (target.dataset.action === "set-card-size") {
    setCardSize(target.value);
  }
}

function handleAppKeydown(event) {
  const cardButton = event.target.closest?.(".card-button");
  if (!cardButton || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
    return;
  }

  const hand = cardButton.closest(".hand");
  if (!hand) {
    return;
  }

  const cards = Array.from(hand.querySelectorAll(".card-button:not(:disabled)"));
  const currentIndex = cards.indexOf(cardButton);
  if (currentIndex === -1) {
    return;
  }

  let nextIndex = currentIndex;
  if (event.key === "ArrowLeft") {
    nextIndex = Math.max(0, currentIndex - 1);
  } else if (event.key === "ArrowRight") {
    nextIndex = Math.min(cards.length - 1, currentIndex + 1);
  } else if (event.key === "Home") {
    nextIndex = 0;
  } else if (event.key === "End") {
    nextIndex = cards.length - 1;
  }

  if (nextIndex !== currentIndex) {
    event.preventDefault();
    cards[nextIndex].focus();
    cards[nextIndex].scrollIntoView({ block: "nearest", inline: "nearest" });
  }
}

function shouldIgnoreDogTestKey(event) {
  const target = event.target;
  return Boolean(
    event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      target?.closest?.("input, select, textarea, [contenteditable='true']")
  );
}

function handleDogTestSequence(event) {
  if (shouldIgnoreDogTestKey(event) || typeof event.key !== "string" || event.key.length !== 1) {
    return false;
  }

  dogTestSequenceBuffer = (dogTestSequenceBuffer + event.key.toLowerCase()).slice(-DOG_TEST_SEQUENCE.length);
  if (dogTestSequenceBuffer !== DOG_TEST_SEQUENCE) {
    return false;
  }

  dogTestSequenceBuffer = "";
  event.preventDefault?.();
  activateDogTestDeal();
  return true;
}

function bindDogTestSequence() {
  if (
    dogTestKeydownBound ||
    typeof document === "undefined" ||
    typeof document.addEventListener !== "function"
  ) {
    return;
  }

  document.addEventListener("keydown", handleDogTestSequence);
  dogTestKeydownBound = true;
}

function wheelDeltaPixels(event, hand) {
  const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
  if (event.deltaMode === 1) {
    return dominantDelta * 36;
  }
  if (event.deltaMode === 2) {
    return dominantDelta * hand.clientWidth;
  }
  return dominantDelta;
}

function temporarilyDisableHandSnap(hand) {
  if (!hand) {
    return;
  }

  if (hand.dataset.snapRestoreValue === undefined) {
    hand.dataset.snapRestoreValue = hand.style.scrollSnapType || "";
  }
  hand.style.scrollSnapType = "none";

  if (hand._snapRestoreTimer) {
    window.clearTimeout(hand._snapRestoreTimer);
  }
  hand._snapRestoreTimer = window.setTimeout(() => {
    hand.style.scrollSnapType = hand.dataset.snapRestoreValue || "";
    delete hand.dataset.snapRestoreValue;
    hand._snapRestoreTimer = null;
  }, 180);
}

function scrollHandBy(hand, delta, smooth = false) {
  if (!hand || hand.scrollWidth <= hand.clientWidth) {
    return false;
  }

  const maxScroll = hand.scrollWidth - hand.clientWidth;
  const nextScroll = Math.max(0, Math.min(maxScroll, hand.scrollLeft + delta));
  if (nextScroll === hand.scrollLeft) {
    return false;
  }

  temporarilyDisableHandSnap(hand);
  if (smooth && typeof hand.scrollTo === "function") {
    hand.scrollTo({ left: nextScroll, behavior: "auto" });
  } else {
    hand.scrollLeft = nextScroll;
  }
  return true;
}

function scrollHandFromControl(control, direction) {
  const panel = control.closest?.(".hand-panel");
  const hand = panel?.querySelector(".grouped-hand") || document.querySelector(".grouped-hand");
  if (!hand) {
    return;
  }

  scrollHandBy(hand, direction * Math.max(220, hand.clientWidth * 0.72), true);
}

function handleWheelForHand(event, hand) {
  if (!hand || hand.scrollWidth <= hand.clientWidth) {
    return false;
  }

  const delta = wheelDeltaPixels(event, hand);
  if (!delta) {
    return false;
  }

  const moved = scrollHandBy(hand, delta);
  if (moved && typeof event.preventDefault === "function") {
    event.preventDefault();
    event.stopPropagation();
  }
  return moved;
}

function handleHandWheel(event) {
  handleWheelForHand(event, event.currentTarget);
}

function handFromWheelTarget(target) {
  const closest = target.closest?.(".grouped-hand");
  if (closest) {
    return closest;
  }

  return target.closest?.(".hand-panel")?.querySelector(".grouped-hand") || null;
}

function handleHandPanelWheel(event) {
  const hand = event.currentTarget?.querySelector?.(".grouped-hand");
  handleWheelForHand(event, hand);
}

function handleDocumentHandWheel(event) {
  const hand = handFromWheelTarget(event.target);
  handleWheelForHand(event, hand);
}

let pendingHandScroll = null;
let handWheelDelegationBound = false;

function rememberHandScrollFrom(target) {
  const hand = handFromWheelTarget(target);
  if (!hand) {
    return;
  }

  const maxScroll = Math.max(0, hand.scrollWidth - hand.clientWidth);
  pendingHandScroll = {
    left: hand.scrollLeft,
    ratio: maxScroll > 0 ? hand.scrollLeft / maxScroll : 0,
  };
}

function restorePendingHandScroll(root) {
  if (!pendingHandScroll || !root || typeof root.querySelector !== "function") {
    pendingHandScroll = null;
    return;
  }

  const snapshot = pendingHandScroll;
  pendingHandScroll = null;
  const hand = root.querySelector(".grouped-hand");
  if (!hand) {
    return;
  }

  const restore = () => {
    const maxScroll = Math.max(0, hand.scrollWidth - hand.clientWidth);
    const left = Math.max(snapshot.left, Math.round(maxScroll * snapshot.ratio));
    hand.scrollLeft = Math.max(0, Math.min(maxScroll, left));
  };

  temporarilyDisableHandSnap(hand);
  restore();
  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(restore);
  }
}

function bindHandWheelScroll(root) {
  if (!root || typeof root.querySelectorAll !== "function") {
    return;
  }
  root.querySelectorAll(".grouped-hand").forEach((hand) => {
    hand.addEventListener("wheel", handleHandWheel, { passive: false });
  });
  root.querySelectorAll(".hand-panel").forEach((panel) => {
    panel.addEventListener("wheel", handleHandPanelWheel, { passive: false });
  });
  if (
    !handWheelDelegationBound &&
    typeof document !== "undefined" &&
    typeof document.addEventListener === "function"
  ) {
    document.addEventListener("wheel", handleDocumentHandWheel, { passive: false, capture: true });
    handWheelDelegationBound = true;
  }
}

function render() {
  const app = document.querySelector("#app");
  const content =
    state.mode === "home"
      ? renderHomeMode()
      : state.mode === "learn"
      ? renderLearningMode()
      : state.mode === "strategy"
        ? renderStrategyMode()
        : renderGameMode(state.mode);
  const phaseClass =
    state.mode === "guided" || state.mode === "versus"
      ? ` mode-${state.mode} phase-${state.games[state.mode]?.phase || "setup"}`
      : ` mode-${state.mode}`;

  app.innerHTML = `
    <div class="app-shell ${state.settings.navCollapsed ? "sidebar-collapsed" : ""} card-size-${escapeHtml(state.settings.cardSize)}${phaseClass}">
      ${renderAppSidebar()}
      <main class="main${phaseClass}">${content}</main>
    </div>
  `;
  app.onclick = handleAppClick;
  app.onchange = handleAppChange;
  app.onkeydown = handleAppKeydown;
  bindHandWheelScroll(app);
  restorePendingHandScroll(app);
  bindDogTestSequence();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.CoachTarot = {
  createScenarioGame,
  createNewGame,
  createDogTestGame,
  nextPlayer,
  playCard,
  getLegalCards,
  getWinningEntry,
  wouldTeamWinAfter,
  knownVoidSuits,
  cardMemorySummary,
  resolveTrick,
  settlePendingExcuseCompensations,
  calculateFinalScore,
  playerFinalScore,
  teamPoints,
  countBouts,
  targetForBouts,
  scoringTakerPoints,
  cardById,
  bestAnalysis,
  evaluateHandForBid,
  chooseOpponentBid,
  chooseDiscardCards,
  suggestedDiscardCards,
  detectHandfuls,
  explainTrickWinner,
  replayStepExplanation,
  finalLearningInsights,
};
window.TarotTrainer = window.CoachTarot;

if (
  typeof navigator !== "undefined" &&
  "serviceWorker" in navigator &&
  typeof window.addEventListener === "function" &&
  /^https?:$/.test(window.location?.protocol || "")
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

render();
