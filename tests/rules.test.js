const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "app.js"), "utf8");

const appNode = {};
const sandbox = {
  console,
  window: {
    setTimeout: () => 0,
    clearTimeout: () => {},
  },
  document: {
    querySelector: () => appNode,
  },
};

vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const trainer = sandbox.window.CoachTarot;

function createPlayer(name, team = "defense") {
  return { name, team, hand: [], won: [], tricks: 0, points: 0 };
}

assert.strictEqual(
  new Set(Array.from({ length: 78 }, (_, index) => index)).size,
  78,
  "test harness sanity check"
);

const scenario0 = trainer.createScenarioGame(0);
assert.deepStrictEqual(
  Array.from(scenario0.players, (player) => player.name),
  ["Vous", "Est", "Nord", "Ouest"],
  "engine order should follow the visible counter-clockwise table order"
);
assert.deepStrictEqual(
  [0, trainer.nextPlayer(0), trainer.nextPlayer(1), trainer.nextPlayer(2), trainer.nextPlayer(3)],
  [0, 1, 2, 3, 0],
  "nextPlayer should cycle through the table order"
);
assert.strictEqual(trainer.nextPlayer(4, 5), 0, "nextPlayer should cycle through five-player tables");
assert.deepStrictEqual(
  Array.from(trainer.getLegalCards(scenario0.players[0].hand, scenario0.trick), (card) => card.id).sort(),
  ["excuse", "hearts-1", "hearts-9"],
  "must provide the requested suit before cutting"
);
assert.strictEqual(
  trainer.playCard(scenario0, 0, "spades-R"),
  false,
  "engine API should reject illegal cards, not only the UI"
);
assert(
  scenario0.players[0].hand.some((card) => card.id === "spades-R"),
  "rejected illegal cards should stay in hand"
);
assert(
  !scenario0.trick.some((entry) => entry.card.id === "spades-R"),
  "rejected illegal cards should not enter the trick"
);

const dealsByPlayerCount = [
  [3, 6, 24],
  [4, 6, 18],
  [5, 3, 15],
];
for (const [playerCount, dogSize, handSize] of dealsByPlayerCount) {
  const deal = trainer.createNewGame("test", playerCount);
  assert.strictEqual(deal.players.length, playerCount, `${playerCount}p deal should have the right table size`);
  assert.strictEqual(deal.dog.length, dogSize, `${playerCount}p deal should have the right dog size`);
  assert.strictEqual(deal.totalTricks, handSize, `${playerCount}p deal should expose the right trick count`);
  assert.strictEqual(deal.bidding.passed.length, playerCount, `${playerCount}p bidding should track every player`);
  assert(
    deal.players.every((player) => player.hand.length === handSize),
    `${playerCount}p deal should distribute equal hand sizes`
  );
  assert.strictEqual(
    deal.dogConstitution.slots.length,
    dogSize,
    `${playerCount}p deal should constitute the dog during the deal`
  );
  assert(
    deal.dogConstitution.slots.every((slot) => slot > 0 && slot < deal.dogConstitution.packetCount),
    `${playerCount}p dog cards should be inserted between player packets`
  );
  const dealtIds = [...deal.players.flatMap((player) => player.hand), ...deal.dog].map((card) => card.id);
  assert.strictEqual(new Set(dealtIds).size, 78, `${playerCount}p deal should distribute every card exactly once`);
}

const userTakeDogGame = trainer.createNewGame("test", 4);
userTakeDogGame.bidding.highestBidder = 0;
userTakeDogGame.bidding.highestContractId = "garde";
sandbox.finishBidding(userTakeDogGame);
assert.strictEqual(userTakeDogGame.phase, "dog", "user taker should see the dog before making the discard");
assert.strictEqual(userTakeDogGame.dog.length, 6, "user taker should receive a constituted dog");
assert.strictEqual(userTakeDogGame.players[0].hand.length, 18, "dog should not enter the hand before it is taken");

const dogTestGame = trainer.createDogTestGame("test", 4);
assert.strictEqual(dogTestGame.testDeal, "dog-easter-egg", "dog test deal should be marked as an easter egg");
assert(dogTestGame.players[0].hand.some((card) => card.id === "trump-21"), "dog test deal should give 21 to user");
assert(dogTestGame.players[0].hand.some((card) => card.id === "trump-1"), "dog test deal should give petit to user");
assert(dogTestGame.players[0].hand.some((card) => card.id === "excuse"), "dog test deal should give excuse to user");
assert.strictEqual(trainer.chooseOpponentBid(dogTestGame, 1), "pass", "dog test opponent should not overbid the user");
dogTestGame.bidding.highestBidder = 0;
dogTestGame.bidding.highestContractId = "garde";
sandbox.finishBidding(dogTestGame);
assert.strictEqual(dogTestGame.phase, "dog", "dog test user taker should see the dog");
dogTestGame.players[0].hand = [...dogTestGame.players[0].hand, ...dogTestGame.dog];
dogTestGame.dog = [];
dogTestGame.phase = "discard";
const dogTestDiscard = trainer.suggestedDiscardCards(dogTestGame);
assert.strictEqual(dogTestDiscard.length, 6, "dog test coach should suggest a full discard");
assert(!dogTestDiscard.some((card) => card.bout), "dog test coach should protect bouts in the discard");

const scenario2 = trainer.createScenarioGame(2);
assert.deepStrictEqual(
  Array.from(trainer.getLegalCards(scenario2.players[0].hand, scenario2.trick), (card) => card.id),
  ["trump-20"],
  "must overtrump when possible and cannot sacrifice Petit"
);

const excuseGame = {
  id: 1,
  kind: "test",
  players: [
    createPlayer("Vous", "taker"),
    createPlayer("Nord"),
    createPlayer("Est"),
    createPlayer("Ouest"),
  ],
  dog: [],
  discard: [],
  selectedDiscard: [],
  taker: 0,
  contract: { name: "Garde", multiplier: 2 },
  pendingExcuseCompensations: [],
  handfuls: [],
  petitAuBout: null,
  leader: 0,
  currentPlayer: 3,
  trickNumber: 1,
  phase: "playing",
  log: [],
  hint: null,
  feedback: "",
  trick: [
    { player: 0, card: trainer.cardById("excuse") },
    { player: 1, card: trainer.cardById("hearts-R") },
    { player: 2, card: trainer.cardById("hearts-1") },
    { player: 3, card: trainer.cardById("hearts-2") },
  ],
};

excuseGame.players[0].won.push(trainer.cardById("spades-1"));
excuseGame.players[0].points = 0.5;
trainer.resolveTrick(excuseGame);

assert.strictEqual(excuseGame.players[0].points, 4.5, "Excuse stays with the player who played it");
assert.strictEqual(excuseGame.players[1].points, 6, "winner receives trick cards plus compensation");
assert.strictEqual(
  excuseGame.pendingExcuseCompensations.length,
  0,
  "compensation is settled when possible"
);

assert.strictEqual(trainer.targetForBouts(0), 56);
assert.strictEqual(trainer.targetForBouts(1), 51);
assert.strictEqual(trainer.targetForBouts(2), 41);
assert.strictEqual(trainer.targetForBouts(3), 36);

const finalGame = trainer.createScenarioGame(0);
finalGame.players[0].won = [
  trainer.cardById("trump-1"),
  trainer.cardById("trump-21"),
  trainer.cardById("excuse"),
  trainer.cardById("hearts-R"),
  trainer.cardById("spades-R"),
  trainer.cardById("diamonds-R"),
  trainer.cardById("clubs-R"),
];
finalGame.players[0].points = finalGame.players[0].won.reduce((sum, card) => sum + card.points, 0);
finalGame.contract = { name: "Garde", multiplier: 2 };
const finalScore = trainer.calculateFinalScore(finalGame);
assert.strictEqual(finalScore.bouts, 3, "three bouts lower the target");
assert.strictEqual(finalScore.target, 36, "target with three bouts is 36");
assert.strictEqual(finalScore.winnerTeam, "defense", "failed contracts should mark defense as winner");

const explainedTrick = [
  { player: 0, card: trainer.cardById("hearts-R") },
  { player: 1, card: trainer.cardById("hearts-1") },
  { player: 2, card: trainer.cardById("trump-9") },
  { player: 3, card: trainer.cardById("hearts-D") },
];
const trickExplanation = trainer.explainTrickWinner(explainedTrick, 2, finalGame);
assert(trickExplanation.includes("coupe"), "trick explanation should describe trump cuts");
assert(trickExplanation.includes("point"), "trick explanation should include trick points");

const voidMemoryGame = {
  players: [
    createPlayer("Vous", "defense"),
    createPlayer("Est", "taker"),
    createPlayer("Nord", "defense"),
    createPlayer("Ouest", "defense"),
  ],
  trick: [],
  trickReviews: [
    {
      trickNumber: 1,
      cards: [
        { player: 3, card: trainer.cardById("hearts-R") },
        { player: 0, card: trainer.cardById("trump-3") },
        { player: 1, card: trainer.cardById("hearts-1") },
        { player: 2, card: trainer.cardById("hearts-2") },
      ],
    },
  ],
};
assert(
  trainer.knownVoidSuits(voidMemoryGame).get(0).has("hearts"),
  "playing trump on a led suit should mark the player void in that suit"
);
const visibleMemory = trainer.cardMemorySummary(voidMemoryGame);
assert.strictEqual(visibleMemory.totalSeen, 4, "memory should count cards from completed trick reviews");
assert.strictEqual(
  visibleMemory.bySuit.find((suit) => suit.id === "hearts").seen,
  3,
  "memory should count seen cards by suit"
);
assert.strictEqual(visibleMemory.trumpCount, 1, "memory should count seen trumps");
assert(
  trainer.replayStepExplanation(voidMemoryGame, voidMemoryGame.trickReviews[0], 2).includes("tient provisoirement"),
  "partial replay should explain the provisional winner"
);

const hiddenKnowledgeGame = {
  players: [
    createPlayer("Vous", "defense"),
    createPlayer("Est", "taker"),
    createPlayer("Nord", "defense"),
    createPlayer("Ouest", "defense"),
  ],
  taker: 1,
  contract: { name: "Garde", multiplier: 2, dogMode: "take" },
  dog: [],
  discard: [trainer.cardById("clubs-1")],
  trick: [],
  playedCards: [],
  trickReviews: [],
  trickNumber: 1,
  phase: "playing",
};
hiddenKnowledgeGame.players[0].hand = [trainer.cardById("hearts-1")];
hiddenKnowledgeGame.players[1].hand = [trainer.cardById("hearts-2")];
hiddenKnowledgeGame.players[1].won = [trainer.cardById("trump-21")];
hiddenKnowledgeGame.players[1].points = 4.5;
const defenseKnownCards = sandbox.knownCardIdsForSimulation(hiddenKnowledgeGame, 0);
const takerKnownCards = sandbox.knownCardIdsForSimulation(hiddenKnowledgeGame, 1);
assert(!defenseKnownCards.has("trump-21"), "simulation should not reveal hidden scored dog cards");
assert(!defenseKnownCards.has("clubs-1"), "simulation should not reveal the taker's discard to defense");
assert(takerKnownCards.has("clubs-1"), "simulation may keep the taker's own discard known to the taker");

const allyLoadGame = {
  id: 55,
  kind: "test",
  players: [
    createPlayer("Vous", "defense"),
    createPlayer("Est", "taker"),
    createPlayer("Nord", "defense"),
    createPlayer("Ouest", "defense"),
  ],
  dog: [],
  discard: [],
  selectedDiscard: [],
  taker: 1,
  contract: { name: "Garde", multiplier: 2 },
  pendingExcuseCompensations: [],
  handfuls: [],
  petitAuBout: null,
  leader: 3,
  currentPlayer: 0,
  trickNumber: 3,
  phase: "playing",
  log: [],
  playedCards: [],
  trickReviews: [],
  hint: null,
  feedback: "",
  finalScore: null,
  trick: [{ player: 3, card: trainer.cardById("hearts-R") }],
  trickComplete: false,
};
allyLoadGame.players[0].hand = [trainer.cardById("hearts-D"), trainer.cardById("hearts-1")];
const allyLoadAnalyses = trainer.bestAnalysis(allyLoadGame, 0, 0, { perfectKnowledge: false });
const loadedQueen = allyLoadAnalyses.find((analysis) => analysis.card.id === "hearts-D");
const lowHeart = allyLoadAnalyses.find((analysis) => analysis.card.id === "hearts-1");
assert(
  loadedQueen.score > lowHeart.score,
  "defense should prefer loading points when an ally already controls the trick"
);
assert(
  loadedQueen.reasons.some((reason) => reason.includes("votre camp")),
  "analysis should explain the allied defensive load"
);

finalGame.phase = "ended";
finalGame.finalScore = finalScore;
finalGame.trickReviews = [
  {
    trickNumber: 4,
    winner: 1,
    userReview: {
      played: trainer.cardById("hearts-1"),
      playedScore: 42,
      playedHeadline: "Carte jouable",
      playedReasons: ["Vous limitez les points donnes."],
      best: trainer.cardById("trump-21"),
      bestScore: 73,
      bestHeadline: "Atout 21 prend souvent le pli",
      bestReasons: ["Le pli contient déjà beaucoup de points."],
      gap: 31,
    },
  },
];
const finalSummaryHtml = sandbox.renderFinalSummary(finalGame);
assert(finalSummaryHtml.includes("Bilan de partie"), "final summary should render a party recap");
assert(finalSummaryHtml.includes("Camp gagnant"), "final summary should show the winning camp");
assert(finalSummaryHtml.includes("Vos choix"), "final summary should include player choice analysis");
assert(finalSummaryHtml.includes("À revoir"), "final summary should flag large coaching gaps");

const strongHand = [
  "trump-1",
  "trump-21",
  "excuse",
  "trump-20",
  "trump-19",
  "trump-18",
  "trump-17",
  "trump-16",
  "trump-15",
  "trump-14",
  "hearts-R",
  "spades-R",
  "diamonds-R",
  "clubs-R",
  "hearts-D",
  "spades-D",
  "diamonds-9",
  "clubs-8",
].map(trainer.cardById);
const weakHand = [
  "trump-2",
  "trump-4",
  "hearts-1",
  "hearts-2",
  "hearts-3",
  "spades-1",
  "spades-2",
  "spades-3",
  "diamonds-1",
  "diamonds-2",
  "diamonds-3",
  "clubs-1",
  "clubs-2",
  "clubs-3",
  "clubs-4",
  "clubs-5",
  "clubs-6",
  "clubs-7",
].map(trainer.cardById);

assert(
  trainer.evaluateHandForBid(strongHand) > trainer.evaluateHandForBid(weakHand),
  "strong hands should evaluate higher for bidding"
);

assert.strictEqual(
  trainer.detectHandfuls([{ hand: strongHand }])[0].level,
  "poignée",
  "ten trumps or excuse should detect a handful"
);

const discard = trainer.chooseDiscardCards(strongHand);
assert.strictEqual(discard.length, 6, "auto discard should pick six cards");
assert(!discard.some((card) => card.bout), "auto discard must not discard bouts when avoidable");
assert.strictEqual(trainer.chooseDiscardCards(strongHand, 3).length, 3, "five-player auto discard should pick three cards");
const shortSuitDiscard = trainer.chooseDiscardCards(
  ["hearts-1", "hearts-2", "hearts-D", "clubs-1", "diamonds-1", "spades-R"].map(trainer.cardById),
  3
);
assert(
  shortSuitDiscard.some((card) => card.id === "clubs-1") && shortSuitDiscard.some((card) => card.id === "diamonds-1"),
  "auto discard should prefer creating short suits when points are low"
);

const eightTrumpHand = [
  "trump-1",
  "trump-4",
  "trump-6",
  "trump-8",
  "trump-10",
  "trump-12",
  "trump-14",
  "excuse",
].map(trainer.cardById);
assert.strictEqual(
  trainer.detectHandfuls([{ hand: eightTrumpHand }], 4).length,
  0,
  "eight trumps should not be a four-player handful"
);
assert.strictEqual(
  trainer.detectHandfuls([{ hand: eightTrumpHand }], 5)[0].level,
  "poignée",
  "eight trumps should be a five-player handful"
);

const visibilityGame = {
  id: 99,
  kind: "test",
  players: [
    createPlayer("Vous", "taker"),
    createPlayer("Est"),
    createPlayer("Nord"),
    createPlayer("Ouest"),
  ],
  dog: [],
  discard: [],
  selectedDiscard: [],
  taker: 0,
  contract: { name: "Petite", multiplier: 1 },
  pendingExcuseCompensations: [],
  handfuls: [],
  petitAuBout: null,
  leader: 0,
  currentPlayer: 0,
  trickNumber: 1,
  phase: "playing",
  log: [],
  playedCards: [],
  trickReviews: [],
  hint: null,
  feedback: "",
  finalScore: null,
  trick: [],
  trickComplete: false,
};
visibilityGame.players[0].hand = [trainer.cardById("hearts-1"), trainer.cardById("clubs-1")];
visibilityGame.players[1].hand = [trainer.cardById("hearts-2"), trainer.cardById("clubs-2")];
visibilityGame.players[2].hand = [trainer.cardById("hearts-3"), trainer.cardById("clubs-3")];
visibilityGame.players[3].hand = [trainer.cardById("hearts-4"), trainer.cardById("clubs-4")];

trainer.playCard(visibilityGame, 0, "hearts-1");
trainer.playCard(visibilityGame, 1, "hearts-2");
trainer.playCard(visibilityGame, 2, "hearts-3");
trainer.playCard(visibilityGame, 3, "hearts-4");
assert.strictEqual(visibilityGame.trick.length, 4, "fourth card should remain visible before trick resolution");
assert.strictEqual(visibilityGame.trickComplete, true, "completed trick should wait for delayed resolution");
assert.strictEqual(visibilityGame.players[3].points, 0, "completed trick should not be scored immediately");

const finalInsights = trainer.finalLearningInsights(finalGame);
assert(finalInsights.items.length >= 3, "final learning report should produce coaching insights");
assert(
  finalInsights.items.some((item) => item.includes("Priorité")),
  "final learning report should include a training priority"
);

assert(fs.existsSync(path.join(root, "manifest.webmanifest")), "PWA manifest should exist");
assert(fs.existsSync(path.join(root, "service-worker.js")), "service worker should exist");

const hostileStatsSandbox = {
  console,
  window: {
    setTimeout: () => 0,
    clearTimeout: () => {},
  },
  document: {
    querySelector: () => ({}),
  },
  localStorage: {
    getItem: () =>
      JSON.stringify({
        stats: {
          learningAttempts: '<img src=x onerror="alert(1)">',
          goodLearningChoices: "<script>alert(1)</script>",
          gamesFinished: "bad",
          userWins: {},
          cumulativeUserScore: "NaN",
        },
      }),
    setItem: () => {},
  },
};
vm.createContext(hostileStatsSandbox);
vm.runInContext(source, hostileStatsSandbox);
const progressHtml = hostileStatsSandbox.renderProgressPanel();
assert(!progressHtml.includes("<img"), "progress panel should not render hostile stored HTML");
assert(!progressHtml.includes("<script"), "progress panel should not render hostile stored scripts");

let dogTestSequencePrevented = false;
for (const key of "chien") {
  sandbox.handleDogTestSequence({
    key,
    target: { closest: () => null },
    preventDefault: () => {
      dogTestSequencePrevented = true;
    },
  });
}
assert(dogTestSequencePrevented, "dog test sequence should consume the final key");
assert.strictEqual(
  sandbox.getCurrentGame().testDeal,
  "dog-easter-egg",
  "typing chien should activate the dog test deal"
);

const savedGuidedGame = trainer.createNewGame("guided", 4);
savedGuidedGame.id = 8801;
const savedGameSandbox = {
  console,
  window: {
    setTimeout: () => 0,
    clearTimeout: () => {},
  },
  document: {
    querySelector: () => ({}),
  },
  localStorage: {
    getItem: () =>
      JSON.stringify({
        games: {
          guided: savedGuidedGame,
        },
      }),
    setItem: () => {},
  },
};
vm.createContext(savedGameSandbox);
vm.runInContext(source, savedGameSandbox);
const savedHomeHtml = savedGameSandbox.renderHomeMode();
assert(savedHomeHtml.includes("Continuer la donne"), "home should expose resumable saved games");
assert(savedHomeHtml.includes("à vous de parler"), "saved bidding game summary should use correct French wording");

console.log("rules.test.js: OK");
