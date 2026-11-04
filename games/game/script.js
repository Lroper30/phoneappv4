const STARTING_BALANCE = 500;
const houses = [
	{ id: "cottage", name: "Meadow Cottage", price: 0, description: "A sunny little hideaway with room to dream.", sky: "mint", wall: "#e8d4ab", roof: "#b96048" },
	{ id: "cabin", name: "Pinecone Cabin", price: 3200, description: "A snug cabin tucked between the pines.", sky: "blue", wall: "#bdcbb1", roof: "#78564a" },
	{ id: "bungalow", name: "Sunday Bungalow", price: 6500, description: "A breezy porch made for slow mornings.", sky: "pink", wall: "#f0d5b8", roof: "#bf7559" },
	{ id: "manor", name: "Clover Manor", price: 16000, description: "A little grand, and completely yours.", sky: "gold", wall: "#e8e1c3", roof: "#667d65" },
	{ id: "willow-loft", name: "Willow Loft", price: 4500, description: "A bright little loft beneath the willow trees.", sky: "mint", wall: "#dfc9a6", roof: "#738a72" },
	{ id: "seaside-cabin", name: "Seaglass Cottage", price: 9500, description: "A breezy porch with a view of the water.", sky: "blue", wall: "#d5e0d5", roof: "#668f88" },
	{ id: "greenhouse-home", name: "Glasshouse Retreat", price: 25000, description: "A leafy hideaway filled with morning light.", sky: "mint", wall: "#dbe2c7", roof: "#778c66" },
	{ id: "storybook-estate", name: "Storybook Estate", price: 50000, description: "A big-hearted home for a very big dream.", sky: "pink", wall: "#efe0c4", roof: "#a96352" },
	{ id: "lakeside-bungalow", name: "Stillwater Bungalow", price: 35000, description: "A quiet little home beside the glassy lake.", sky: "blue", wall: "#e4d6b8", roof: "#6e8b7d" },
	{ id: "hilltop-manor", name: "Sunrise Manor", price: 85000, description: "A hilltop home with room for every next chapter.", sky: "gold", wall: "#efe3c7", roof: "#b66c53" },
	{ id: "garden-chalet", name: "Foxglove Chalet", price: 125000, description: "A timber-and-stone retreat on a hillside of wildflowers.", sky: "mint", wall: "#d9c7a4", roof: "#745b47" },
	{ id: "rainy-day-villa", name: "Rainy Day Villa", price: 190000, description: "A glass-roofed hideaway made for long, cozy afternoons.", sky: "blue", wall: "#e8dfc9", roof: "#6e8882" }
];
const keepsakes = [
	{ id: "lantern", name: "Lucky Lantern", price: 650, icon: "🏮", detail: "A warm glow for your new place." },
	{ id: "plant", name: "Little Fern", price: 900, icon: "🌿", detail: "A leafy friend that never needs much." },
	{ id: "clock", name: "Cuckoo Clock", price: 1800, icon: "🕰️", detail: "A cheerful tick-tock for the hallway." },
	{ id: "painting", name: "Sunny Day Print", price: 2400, icon: "🖼️", detail: "A bright view, even on rainy days." },
	{ id: "tea-set", name: "Sunday Tea Set", price: 450, icon: "🫖", detail: "A cup of something nice for slow mornings." },
	{ id: "birdhouse", name: "Bluebird House", price: 700, icon: "🐦", detail: "A little visitor for the garden." },
	{ id: "record-player", name: "Old-Soul Record Player", price: 1700, icon: "📻", detail: "Put a favorite tune on repeat." },
	{ id: "bicycle", name: "Market Bicycle", price: 2200, icon: "🚲", detail: "The scenic route is always the best one." },
	{ id: "telescope", name: "Pocket Telescope", price: 3400, icon: "🔭", detail: "A closer look at the stars above home." },
	{ id: "quilt", name: "Patchwork Quilt", price: 1350, icon: "🧵", detail: "A cozy blanket made of little stories." },
	{ id: "garden-lights", name: "Garden String Lights", price: 2700, icon: "💡", detail: "Make the backyard glow after sunset." },
	{ id: "mailbox", name: "Red Postbox", price: 600, icon: "📮", detail: "A cheerful hello at the end of the path." },
	{ id: "porch-swing", name: "Porch Swing", price: 4200, icon: "🪑", detail: "The perfect seat for a slow afternoon." },
	{ id: "birdbath", name: "Stone Birdbath", price: 3100, icon: "🪨", detail: "A little landmark for your garden visitors." },
	{ id: "music-box", name: "Moonlight Music Box", price: 5600, icon: "🎼", detail: "A tiny tune for the quiet hours." },
	{ id: "greenhouse-kit", name: "Mini Greenhouse Kit", price: 7800, icon: "🪴", detail: "Grow your own patch of green, whatever the weather." },
	{ id: "star-map", name: "Hand-drawn Star Map", price: 12000, icon: "🌌", detail: "A one-of-a-kind map of the night sky." },
	{ id: "grand-piano", name: "Parlor Piano", price: 24000, icon: "🎹", detail: "A centerpiece for a home full of music." },
	{ id: "fountain", name: "Courtyard Fountain", price: 36000, icon: "⛲", detail: "A little splash of old-world grandeur." },
	{ id: "glasshouse", name: "Garden Glasshouse", price: 55000, icon: "🏡", detail: "A sunlit room for a serious plant collection." },
	{ id: "foxglove-rug", name: "Foxglove Woven Rug", price: 7200, icon: "🌸", detail: "A handwoven splash of color for the sitting room." },
	{ id: "ceramic-stove", name: "Blue Ceramic Stove", price: 14500, icon: "🫖", detail: "A warm, old-fashioned heart for the kitchen." },
	{ id: "windmill", name: "Garden Windmill", price: 9800, icon: "🌬️", detail: "A little color that spins above the garden beds." },
	{ id: "reading-nook", name: "Window Reading Nook", price: 18500, icon: "📚", detail: "A built-in corner for rainy-day chapters." },
	{ id: "moon-bench", name: "Moonlit Garden Bench", price: 26000, icon: "🌙", detail: "A quiet place to sit beneath the evening sky." },
	{ id: "glass-atrium", name: "Glass Atrium", price: 92000, icon: "🌿", detail: "A bright conservatory for your rarest garden finds." }
];
const dailyJobs = [
	{ id: "flower-stand", title: "Flower Stand Helper", detail: "Remember bouquet orders to earn your shift pay.", reward: 95, icon: "💐", minigameId: "cafe-memory" },
	{ id: "market-route", title: "Market Route Courier", detail: "Sort packages into the right delivery baskets.", reward: 140, icon: "🧺", minigameId: "parcel-sort" },
	{ id: "garden-shift", title: "Community Garden Keeper", detail: "Catch the garden fireflies before they flutter off.", reward: 120, icon: "🪴", minigameId: "firefly-catch" },
	{ id: "bakery-assistant", title: "Bakery Counter Assistant", detail: "Memorize pastry orders during the morning rush.", reward: 135, icon: "🥐", minigameId: "cafe-memory" },
	{ id: "courier-run", title: "Express Parcel Runner", detail: "Keep a longer string of deliveries on track.", reward: 190, icon: "📦", minigameId: "parcel-sort" },
	{ id: "pond-keeper", title: "Moonpond Caretaker", detail: "Gather fireflies along the pond path at dusk.", reward: 175, icon: "🪷", minigameId: "firefly-catch" },
	{ id: "tea-room-server", title: "Tea Room Server", detail: "Remember a longer string of afternoon orders.", reward: 210, icon: "🫖", minigameId: "cafe-memory" },
	{ id: "express-dispatch", title: "Express Dispatch Clerk", detail: "Sort the late delivery rush before closing.", reward: 245, icon: "📮", minigameId: "parcel-sort" },
	{ id: "orchard-scout", title: "Orchard Firefly Scout", detail: "Catch lights over the late-season trees.", reward: 230, icon: "🍎", minigameId: "firefly-catch" }
];
const minigames = [
	{ id: "cafe-memory", name: "Cafe Order Recall", description: "Watch the order, then repeat it from memory.", icon: "☕", entry: 45, maxPrize: 130, type: "memory", rounds: 4 },
	{ id: "parcel-sort", name: "Parcel Sorting Dash", description: "Match each parcel to its correct delivery basket.", icon: "📦", entry: 60, maxPrize: 190, type: "sorting", rounds: 5 },
	{ id: "firefly-catch", name: "Firefly Catch", description: "Catch as many glowing fireflies as you can before time runs out.", icon: "✨", entry: 35, maxPrize: 120, type: "catch", rounds: 6 }
];
const investmentProjects = [
	{ id: "seed-fund", name: "Community Seed Fund", detail: "A careful first stake in neighborhood growers.", icon: "🌱", minimum: 180, duration: 25000, winChance: 0.78, winRate: 0.32, lossRate: 0.28 },
	{ id: "market-stall", name: "Market Stall Co-op", detail: "Back a busy market day for a stronger possible return.", icon: "🧺", minimum: 650, duration: 45000, winChance: 0.62, winRate: 0.78, lossRate: 0.55 },
	{ id: "orchard", name: "Hilltop Orchard", detail: "A longer-growing orchard with bigger swings either way.", icon: "🍎", minimum: 1800, duration: 70000, winChance: 0.43, winRate: 1.65, lossRate: 0.78 },
	{ id: "moonshot", name: "Moonrise Observatory", detail: "A rare sky event could pay huge; a miss costs most of your stake.", icon: "🔭", minimum: 4200, duration: 95000, winChance: 0.24, winRate: 4, lossRate: 0.92 },
	{ id: "river-ferry", name: "River Ferry Partnership", detail: "A busy crossing can pay well, but the current is unpredictable.", icon: "⛴️", minimum: 2800, duration: 60000, winChance: 0.52, winRate: 1.15, lossRate: 0.64 },
	{ id: "comet-survey", name: "Comet Survey Mission", detail: "An expensive long-shot with a rare, enormous payout.", icon: "☄️", minimum: 9000, duration: 120000, winChance: 0.14, winRate: 7, lossRate: 0.98 }
];
const gameMechanics = {
	flip: { label: "PICK A SIDE", animation: "flip", token: "🪙", choices: [["Heads", "heads"], ["Tails", "tails"]] },
	parity: { label: "PICK YOUR NUMBER", animation: "dice", token: "⚄", choices: [["Even", "even"], ["Odd", "odd"]] },
	highlow: { label: "HIGH OR LOW?", animation: "cards", token: "🂠", choices: [["High", "high"], ["Low", "low"]] },
	number6: { label: "PICK A NUMBER", animation: "dice", token: "🎲", choices: Array.from({ length: 6 }, (_, index) => [`${index + 1}`, String(index + 1)]) },
	wheelColor: { label: "PICK A COLOR", animation: "wheel", token: "🎡", choices: [["Red", "red"], ["Black", "black"]] },
	slots: { label: "READY TO SPIN?", animation: "slots", token: "🎰", choices: [["Spin the reels", "spin"]] },
	pick3: { label: "MAKE YOUR PICK", animation: "cups", token: "🥤", choices: [["Left", "left"], ["Middle", "middle"], ["Right", "right"]] },
	cardHigh: { label: "CALL THE CARD", animation: "cards", token: "🂡", choices: [["High card", "high"], ["Low card", "low"]] },
	cardSuit: { label: "PICK A SUIT", animation: "cards", token: "🃏", choices: [["Hearts", "hearts"], ["Diamonds", "diamonds"], ["Clubs", "clubs"], ["Spades", "spades"]] },
	faceCard: { label: "FACE OR NUMBER?", animation: "cards", token: "👑", choices: [["Face card", "face"], ["Number card", "number"]] },
	diceHigh: { label: "CALL THE TOTAL", animation: "dice", token: "🎲", choices: [["Low · 2–6", "low"], ["High · 8–12", "high"]] },
	doubles: { label: "PAIR OR NO PAIR?", animation: "dice", token: "⚄", choices: [["A pair", "pair"], ["No pair", "no-pair"]] },
	target: { label: "AIM YOUR LUCK", animation: "target", token: "🎯", choices: [["Bullseye", "bullseye"], ["Outer ring", "outer"]] },
	color4: { label: "PICK A COLOR", animation: "wheel", token: "🌈", choices: [["Red", "red"], ["Blue", "blue"], ["Green", "green"], ["Gold", "gold"]] },
	wheelParity: { label: "EVEN OR ODD?", animation: "wheel", token: "🎡", choices: [["Even", "even"], ["Odd", "odd"]] },
	wheelGreen: { label: "GREEN OR COLOR?", animation: "wheel", token: "🎡", choices: [["Green", "green"], ["Red or black", "color"]] },
	skillAim: { label: "AIM AND TAKE YOUR SHOT", animation: "target", token: "🎯", skill: "aim", choices: [] },
	skillTiming: { label: "STOP THE NEEDLE ON THE MARK", animation: "timing", token: "⏱️", skill: "timing", choices: [] },
	blackjack: { label: "DEAL YOUR HAND", animation: "cards", token: "🂡", skill: "blackjack", choices: [] },
	pokerDraw: { label: "DEAL FIVE CARDS", animation: "cards", token: "🂠", skill: "poker", choices: [] },
	highlowRun: { label: "START YOUR RUN", animation: "cards", token: "🂡", skill: "highlow", choices: [] },
	baccarat: { label: "PICK YOUR HAND", animation: "cards", token: "🃏", choices: [["Player", "player"], ["Banker", "banker"], ["Tie", "tie"]] },
	war: { label: "BACK YOUR CARD", animation: "cards", token: "🂡", choices: [["Player", "player"], ["Dealer", "dealer"]] },
	redDog: { label: "CALL THE NEXT CARD", animation: "cards", token: "🐕", choices: [["In between", "inside"], ["Outside", "outside"]] },
	craps: { label: "CHOOSE YOUR LINE", animation: "dice", token: "🎲", choices: [["Pass line", "pass"], ["Don't pass", "dont"]] },
	rouletteNumber: { label: "PICK YOUR POCKET", animation: "wheel", token: "🎡", choices: Array.from({ length: 37 }, (_, number) => [`${number}`, String(number)]) },
	rouletteDozen: { label: "PICK A DOZEN", animation: "wheel", token: "🎡", choices: [["1st · 1–12", "1"], ["2nd · 13–24", "2"], ["3rd · 25–36", "3"]] },
	rollTotal: { label: "CALL THE TOTAL", animation: "dice", token: "🎲", choices: Array.from({ length: 11 }, (_, index) => [`${index + 2}`, String(index + 2)]) },
	crownAnchor: { label: "PICK A SYMBOL", animation: "dice", token: "⚓", choices: [["Crown", "👑"], ["Anchor", "⚓"], ["Heart", "♥"], ["Diamond", "♦"], ["Spade", "♠"], ["Club", "♣"]] },
	race4: { label: "PICK YOUR HORSE", animation: "race", token: "🐎", choices: [["No. 1", "1"], ["No. 2", "2"], ["No. 3", "3"], ["No. 4", "4"]] }
};
const featuredGames = [
	{ id: "flip", name: "Lucky flip", description: "Heads or tails. Double your stake.", category: "Classics", icon: "🪙", mechanic: "flip", tag: "50 / 50" },
	{ id: "dice", name: "High roller", description: "Pick even or odd. Roll the dice.", category: "Classics", icon: "🎲", mechanic: "parity", tag: "1 IN 2" },
	{ id: "slots", name: "Lucky slots", description: "Match a pair for 2×, or three for 12×.", category: "Arcade", icon: "🎰", mechanic: "slots", tag: "UP TO 12×" },
	{ id: "wheel", name: "Color wheel", description: "Bet on red or black. Green zero is a surprise.", category: "Wheels", icon: "🎡", mechanic: "wheelColor", tag: "RED / BLACK" }
];
const extraGames = [
	["moon-flip", "Moonshot Flip", "Call the moon or the stars on a lucky toss.", "Classics", "🌙", "flip"],
	["double-daisy", "Double Daisy", "Pick a petal and let the coin decide.", "Classics", "🌼", "flip"],
	["lucky-penny", "Lucky Penny", "A tiny toss with a tidy little payout.", "Classics", "🪙", "flip"],
	["sunrise-high-low", "Sunrise High-Low", "Guess if the number lands over or under fifty.", "Classics", "🌅", "highlow"],
	["garden-gate", "Garden Gate", "Choose a gate. One hides the prize.", "Classics", "🚪", "pick3"],
	["clover-scratch", "Clover Scratch", "Match symbols to uncover a clover prize.", "Classics", "🍀", "slots"],
	["seven-bells", "Seven Bells", "Pick a number and see what rings true.", "Classics", "🔔", "number6"],
	["golden-target", "Golden Target", "Find the bullseye or take the outer ring.", "Classics", "🎯", "target"],
	["color-pop", "Color Pop", "Call the color before it pops up.", "Classics", "🎨", "color4"],
	["mystery-draw", "Mystery Draw", "Will the next card be high or low?", "Classics", "🂠", "cardHigh"],
	["ace-chase", "Ace Chase", "Call high or low on the next card.", "Cards", "🂡", "cardHigh"],
	["red-suit-rally", "Red Suit Rally", "Pick hearts or diamonds from the deck.", "Cards", "♥", "cardSuit"],
	["face-card-frenzy", "Face Card Frenzy", "Call face card or number card.", "Cards", "👑", "faceCard"],
	["high-card-picnic", "High Card Picnic", "A friendly high-or-low draw.", "Cards", "🃏", "cardHigh"],
	["suitcase-surprise", "Suitcase Surprise", "Choose one of four suits to take home.", "Cards", "♠", "cardSuit"],
	["queens-call", "Queen's Call", "Will a face card show up next?", "Cards", "♛", "faceCard"],
	["royal-hearts", "Royal Hearts", "Pick a suit and see what the deck deals.", "Cards", "♥", "cardSuit"],
	["jack-jackpot", "Jack's Jackpot", "Call the next card high or low.", "Cards", "♞", "cardHigh"],
	["card-shark", "Card Shark Showdown", "Choose a face card or a number card.", "Cards", "🂱", "faceCard"],
	["diamond-dash", "Diamond Dash", "Pick the suit hiding in the deck.", "Cards", "♦", "cardSuit"],
	["snake-eyes-club", "Snake Eyes Club", "Roll a pair or take the no-pair side.", "Dice", "🐍", "doubles"],
	["odd-duck-roll", "Odd Duck Roll", "A quick roll with an odd-or-even call.", "Dice", "🦆", "parity"],
	["even-stevens", "Even Stevens", "Choose the parity before the dice tumble.", "Dice", "⚄", "parity"],
	["high-five", "High Five", "Two dice: call a low or high total.", "Dice", "✋", "diceHigh"],
	["sum-garden", "Sum Garden", "Pick the low or high side of two dice.", "Dice", "🌱", "diceHigh"],
	["lucky-six", "Lucky Six", "Choose the face that comes up on one die.", "Dice", "🎲", "number6"],
	["double-trouble", "Double Trouble", "Will the dice show matching faces?", "Dice", "🎲", "doubles"],
	["pair-parade", "Pair Parade", "Call a pair or a mixed-up roll.", "Dice", "🎲", "doubles"],
	["dice-duel", "Dice Duel", "Take your pick: even or odd.", "Dice", "⚄", "parity"],
	["triple-six", "Triple Six", "Pick a number and let one die decide.", "Dice", "🎲", "number6"],
	["clover-spin", "Clover Spin", "A green zero can make this wheel interesting.", "Wheels", "🍀", "wheelColor"],
	["red-barn-wheel", "Red Barn Wheel", "Choose a side and watch the wheel turn.", "Wheels", "🏚️", "wheelColor"],
	["odd-orbit", "Odd Orbit", "Call even or odd as the wheel spins.", "Wheels", "🪐", "wheelParity"],
	["even-orbit", "Even Orbit", "A numbered wheel and one quick prediction.", "Wheels", "🌌", "wheelParity"],
	["color-carousel", "Color Carousel", "Pick one of four colors on the carousel.", "Wheels", "🎠", "color4"],
	["wagon-wheel", "Wagon Wheel", "Red or black? Give it a whirl.", "Wheels", "☸", "wheelColor"],
	["starry-spin", "Starry Spin", "Choose even or odd under the stars.", "Wheels", "✨", "wheelParity"],
	["number-wheel", "Number Wheel", "Pick one through six before the spin.", "Wheels", "🎡", "number6"],
	["red-black-bonanza", "Red-Black Bonanza", "Call the color and let it land.", "Wheels", "🔴", "wheelColor"],
	["zeros-chance", "Zero's Chance", "Go green or back the rest of the wheel.", "Wheels", "🟢", "wheelGreen"],
	["cupcake-shuffle", "Cupcake Shuffle", "Find the cherry under one of three cups.", "Arcade", "🧁", "pick3"],
	["treasure-chest", "Treasure Chest", "Pick a chest. One holds the coins.", "Arcade", "🧰", "pick3"],
	["three-doors", "Three Doors", "Choose a door and see what's behind it.", "Arcade", "🚪", "pick3"],
	["bullseye-club", "Bullseye Club", "Aim for the center or play the outer ring.", "Arcade", "🎯", "target"],
	["sweet-tooth-slots", "Sweet Tooth Slots", "Match sweets for a small or super-sized win.", "Arcade", "🍬", "slots"],
	["berry-bonanza", "Berry Bonanza", "Line up matching berries on the reels.", "Arcade", "🍓", "slots"],
	["rainbow-ribbons", "Rainbow Ribbons", "Pick one of four colors to win.", "Arcade", "🌈", "color4"],
	["lucky-lanterns", "Lucky Lanterns", "Choose the number your lantern reveals.", "Arcade", "🏮", "number6"],
	["star-catcher", "Star Catcher", "Try for the bullseye or the wide ring.", "Arcade", "🌠", "target"],
	["pocket-change", "Pocket Change", "One last little heads-or-tails call.", "Arcade", "👛", "flip"],
	["precision-shot", "Precision Shot", "Place your shot close to the bullseye to earn a bigger payout.", "Skill", "🎯", "skillAim"],
	["needle-stop", "Needle Stop", "Stop the moving marker as close to center as you can.", "Skill", "⏱️", "skillTiming"],
	["blackjack-table", "Black Jack", "Play your hand: hit, stand, and beat the dealer to 21.", "Skill", "🂡", "blackjack"],
	["poker-draw", "Five Card Draw", "Choose what to hold, draw replacements, and make your hand.", "Skill", "🂠", "pokerDraw"],
	["highlow-ladder", "High-Low Ladder", "Call the next card and decide when to cash out your streak.", "Skill", "♠", "highlowRun"],
	["baccarat-lounge", "Baccarat Lounge", "Pick Player, Banker, or Tie in a classic card duel.", "Table", "🃏", "baccarat"],
	["casino-war", "Casino War", "Draw against the dealer. Ties go to a sudden war.", "Table", "⚔️", "war"],
	["red-dog", "Red Dog", "Read the spread and call where the next card will land.", "Table", "🐕", "redDog"],
	["craps-pass-line", "Craps Pass Line", "Roll a point and see if you can bring it home.", "Table", "🎲", "craps"],
	["lucky-37", "Lucky 37", "Pick one pocket on the 0–36 roulette wheel.", "Table", "🎡", "rouletteNumber"],
	["roulette-dozens", "Roulette Dozens", "Back one of three numbered sections of the wheel.", "Table", "🔴", "rouletteDozen"],
	["sum-setter", "Sum Setter", "Call the exact total of two dice.", "Table", "🎲", "rollTotal"],
	["crown-and-anchor", "Crown & Anchor", "Pick a symbol and match it on three dice.", "Table", "⚓", "crownAnchor"],
	["triple-crown-dice", "Triple Crown Dice", "Pick a crown symbol and try for a triple match.", "Table", "👑", "crownAnchor"],
	["pass-line-deluxe", "Pass Line Deluxe", "Play a full pass-line roll with point and seven-out rules.", "Table", "🎲", "craps"],
	["high-roller-roulette", "High-Roller Roulette", "Choose a dozen and watch the wheel decide.", "Table", "🎡", "rouletteDozen"],
	["golden-pocket", "Golden Pocket", "Choose an exact number for a 36-to-1 wheel hit.", "Table", "🟡", "rouletteNumber"],
	["baccarat-bonanza", "Baccarat Bonanza", "Take another seat for Player, Banker, or Tie.", "Table", "♦", "baccarat"],
	["warpath-cards", "Warpath Cards", "A second card duel with a tie-breaking war.", "Table", "🛡️", "war"],
	["red-dog-dash", "Red Dog Dash", "Place your call between two cards or beyond them.", "Table", "🐾", "redDog"],
	["snake-eyes-seven", "Snake Eyes Seven", "Pick the exact total your pair of dice will show.", "Dice", "🐍", "rollTotal"],
	["lucky-twelve", "Lucky Twelve", "Call an exact total from two tumbling dice.", "Dice", "🎲", "rollTotal"],
	["four-horse-race", "Four Horse Race", "Choose a runner before the field charges for the line.", "Arcade", "🏇", "race4"],
	["race-to-riches", "Race to Riches", "Back one of four colors in a fast little race.", "Arcade", "🏁", "race4"],
	["gold-cup-sprint", "Gold Cup Sprint", "Pick a horse and see who wins the photo finish.", "Arcade", "🏆", "race4"],
	["last-lap-derby", "Last Lap Derby", "One more four-runner race around the oval.", "Arcade", "🏎️", "race4"]
].map(([id, name, description, category, icon, mechanic]) => ({ id, name, description, category, icon, mechanic }));
const gameCatalog = [...featuredGames, ...extraGames];
const gameCategories = ["All games", "Classics", "Cards", "Dice", "Wheels", "Arcade", "Table", "Skill"];
let activeGameCategory = "All games";
const defaultState = () => ({ balance: STARTING_BALANCE, bestRun: 0, totalWon: 0, ownedHomes: [], ownedItems: [], currentHome: null, homeRooms: {}, homeRoomLevels: {}, jobsDate: "", claimedJobs: [], investments: [] });
let state = loadState();
let currentGame = "flip";
let isPlaying = false;
let tableRound = null;
let activityRound = null;
let activityTimer = null;
let activityRevealTimer = null;
let decoratingHomeId = null;
let selectedKeepsakeId = null;

const $ = (selector) => document.querySelector(selector);
const formatCoins = (amount) => Math.floor(amount).toLocaleString("en-US");

function renderGameCatalog() {
	const query = $("#game-search").value.trim().toLowerCase();
	const filteredGames = gameCatalog.filter((game) => {
		const matchesCategory = activeGameCategory === "All games" || game.category === activeGameCategory;
		const matchesSearch = `${game.name} ${game.description} ${game.category}`.toLowerCase().includes(query);
		return matchesCategory && matchesSearch;
	});
	$("#game-filters").innerHTML = gameCategories.map((category) => {
		const count = category === "All games" ? gameCatalog.length : gameCatalog.filter((game) => game.category === category).length;
		return `<button class="game-filter ${activeGameCategory === category ? "active" : ""}" data-category="${category}" aria-pressed="${activeGameCategory === category}">${category}<span>${count}</span></button>`;
	}).join("");
	$("#game-filters").querySelectorAll("[data-category]").forEach((button) => button.addEventListener("click", () => {
		activeGameCategory = button.dataset.category;
		renderGameCatalog();
	}));
	const featuredArt = {
		flip: `<div class="game-art coin-art"><div class="coin coin-back">✦</div><div class="coin coin-front">L</div><span class="art-spark spark-one">✳</span><span class="art-spark spark-two">✧</span></div>`,
		dice: `<div class="game-art dice-art"><div class="die die-one"><i></i><i></i><i></i><i></i><i></i></div><div class="die die-two"><i></i><i></i><i></i><i></i><i></i></div><span class="art-spark spark-three">✳</span></div>`,
		slots: `<div class="game-art slot-art"><div class="slot-machine"><div class="slot-window"><span>🍋</span><span>✦</span><span>🍒</span></div><div class="slot-knob"></div></div><span class="art-spark spark-four">✧</span></div>`,
		wheel: `<div class="game-art wheel-art"><div class="wheel"><span>1</span><span>2</span><span>3</span><span>4</span><div class="wheel-center">✦</div></div><span class="wheel-pointer"></span><span class="art-spark spark-five">✳</span></div>`
	};
	$("#games-grid").innerHTML = filteredGames.length ? filteredGames.map((game) => {
		const art = featuredArt[game.id] || `<div class="game-art game-art-library category-${game.category.toLowerCase()}"><span class="game-art-icon">${game.icon}</span><span class="game-art-spark">✧</span></div>`;
		const tag = gameMechanics[game.mechanic].skill ? "SKILL" : game.tag || game.category.toUpperCase();
		return `<article class="game-card game-card-${game.id}"><div class="game-card-top"><span class="game-symbol">${game.icon}</span><span class="game-tag">${tag}</span></div>${art}<h3>${game.name}</h3><p>${game.description}</p><button class="game-play-button" data-game="${game.id}"><span class="game-play-label">Play ${game.name}</span><span>→</span></button></article>`;
	}).join("") : `<p class="no-games">No games match that search. Try another name or category.</p>`;
	$("#games-grid").querySelectorAll("[data-game]").forEach((button) => button.addEventListener("click", () => openGame(button.dataset.game)));
	$("#game-count").textContent = query || activeGameCategory !== "All games" ? `${filteredGames.length} of ${gameCatalog.length} games` : `${gameCatalog.length} games open`;
	document.querySelector(".floor-highlights strong").textContent = gameCatalog.length;
	document.querySelector(".floor-highlights span:nth-of-type(2) strong").textContent = gameCategories.includes("Skill") ? gameCatalog.filter((game) => game.category === "Skill").length : 0;
}

function loadState() {
	try {
		const saved = JSON.parse(localStorage.getItem("lucky-acres-save"));
		if (saved && typeof saved.balance === "number") return { ...defaultState(), ...saved };
	} catch (error) {
		console.warn("Could not load saved game.", error);
	}
	return defaultState();
}

function saveState() {
	localStorage.setItem("lucky-acres-save", JSON.stringify(state));
}

function render() {
	$("#balance").textContent = formatCoins(state.balance);
	$("#dialog-balance").textContent = formatCoins(state.balance);
	$("#best-run").innerHTML = `${formatCoins(state.bestRun)} <span>coins</span>`;
	$("#owned-count").innerHTML = `${state.ownedHomes.length} <span>home${state.ownedHomes.length === 1 ? "" : "s"}</span>`;
	$("#collection-homes").textContent = `${state.ownedHomes.length} / ${houses.length}`;
	$("#collection-items").textContent = state.ownedItems.length;
	$("#collection-winnings").innerHTML = `${formatCoins(state.totalWon)} <small>coins</small>`;
	$("#growth-balance").textContent = formatCoins(state.balance);
	renderHouses();
	renderCollection();
	renderHomeDecorator();
	renderGrowth();
}

function houseArtwork(house, className) {
	const buildings = {
		cottage: `<path d="M194 127 250 82 306 127V191H194Z" fill="var(--house-wall)"/><path d="m182 130 68-61 68 61h-20l-48-43-48 43Z" fill="var(--house-roof)"/><path d="M238 191v-47q12-13 24 0v47Z" fill="#496b59"/><rect x="208" y="139" width="19" height="20" fill="#96bcb0" stroke="#fff0d8" stroke-width="3"/><rect x="273" y="139" width="19" height="20" fill="#96bcb0" stroke="#fff0d8" stroke-width="3"/><path d="M207 149h21m44 0h21" stroke="#fff0d8" stroke-width="2"/>`,
		cabin: `<path d="m194 179 56-94 56 94v12H194Z" fill="var(--house-wall)"/><path d="m176 183 74-124 74 124h-20l-54-92-54 92Z" fill="var(--house-roof)"/><path d="M238 191v-38q12-12 24 0v38Z" fill="#496b59"/><rect x="207" y="152" width="18" height="18" fill="#9dc5c1" stroke="#fff0d8" stroke-width="3"/><rect x="275" y="152" width="18" height="18" fill="#9dc5c1" stroke="#fff0d8" stroke-width="3"/><path d="M199 167h101M218 122h64" stroke="#fff0d8" stroke-width="3" opacity=".65"/>`,
		bungalow: `<path d="M170 128 250 92 330 128v63H170Z" fill="var(--house-wall)"/><path d="m155 130 95-57 95 57-12 11-83-49-83 49Z" fill="var(--house-roof)"/><path d="M190 143h120v9H190zm8 9v39m102-39v39m-68-39v39m35-39v39" stroke="#f9efd8" stroke-width="4"/><path d="M239 157v34h22v-34Z" fill="#557560"/><rect x="184" y="139" width="24" height="22" fill="#93b9b4" stroke="#fff0d8" stroke-width="3"/><rect x="292" y="139" width="24" height="22" fill="#93b9b4" stroke="#fff0d8" stroke-width="3"/>`,
		manor: `<path d="M177 116h42V82h62v34h42v75H177Z" fill="var(--house-wall)"/><path d="m168 121 30-30 30 30m28-31 36-38 36 38m-15 32 28-29 28 29" fill="var(--house-roof)"/><path d="M248 191v-48q12-13 24 0v48Z" fill="#496b59"/><rect x="184" y="133" width="19" height="22" fill="#96bcb0" stroke="#fff0d8" stroke-width="3"/><rect x="213" y="133" width="19" height="22" fill="#96bcb0" stroke="#fff0d8" stroke-width="3"/><rect x="287" y="133" width="19" height="22" fill="#96bcb0" stroke="#fff0d8" stroke-width="3"/><path d="M205 91V71m88-13V39m57 53V70" stroke="#f3d7a1" stroke-width="4"/>`,
		"willow-loft": `<path d="M184 106h132v85H184Z" fill="var(--house-wall)"/><path d="M174 107h152l-11-20H185Z" fill="var(--house-roof)"/><path d="M224 191v-42h27v42Z" fill="#496b59"/><g fill="#94b9b2" stroke="#fff0d8" stroke-width="3"><rect x="195" y="119" width="23" height="22"/><rect x="240" y="119" width="23" height="22"/><rect x="285" y="119" width="19" height="22"/><rect x="195" y="151" width="23" height="22"/><rect x="270" y="151" width="28" height="22"/></g><path d="M250 85V71" stroke="#f4d7a0" stroke-width="5"/>`,
		"seaside-cabin": `<path d="M194 119 250 76 306 119v63H194Z" fill="var(--house-wall)"/><path d="m182 122 68-61 68 61h-20l-48-43-48 43Z" fill="var(--house-roof)"/><path d="M205 182v14m90-14v14m-90-9h90" stroke="#795b46" stroke-width="5"/><path d="M239 147v35h22v-35Z" fill="#496b59"/><rect x="207" y="132" width="20" height="22" fill="#90c3c5" stroke="#fff0d8" stroke-width="3"/><rect x="273" y="132" width="20" height="22" fill="#90c3c5" stroke="#fff0d8" stroke-width="3"/>`,
		"greenhouse-home": `<path d="M184 112h132v79H184Z" fill="var(--house-wall)"/><path d="m176 114 74-56 74 56Z" fill="var(--house-roof)"/><path d="M185 114h130m-98-23v99m66-99v99m-66-99 66 99m0-99-66 99" stroke="#e6f0d8" stroke-width="4" opacity=".8"/><path d="M239 155v36h22v-36Z" fill="#52715a"/>`,
		"storybook-estate": `<path d="M165 125h48V94l36-32 36 32v31h50v66H165Z" fill="var(--house-wall)"/><path d="m153 129 60-51 36 30 36-30 60 51-10 11-50-39-36 30-36-30-50 39Z" fill="var(--house-roof)"/><path d="M238 191v-43q12-13 24 0v43Z" fill="#4e7158"/><g fill="#91bab6" stroke="#fff1d7" stroke-width="3"><rect x="177" y="142" width="21" height="23"/><rect x="216" y="113" width="17" height="20"/><rect x="267" y="113" width="17" height="20"/><rect x="302" y="142" width="21" height="23"/></g><path d="M249 62V44" stroke="#e8c579" stroke-width="4"/>`,
		"lakeside-bungalow": `<path d="M168 127h164v64H168Z" fill="var(--house-wall)"/><path d="m157 129 93-52 93 52-10 12-83-44-83 44Z" fill="var(--house-roof)"/><path d="M190 153h121m-105 0v38m87-38v38m-56-38v38" stroke="#fff0d8" stroke-width="4"/><path d="M239 158v33h22v-33Z" fill="#4c715d"/><rect x="180" y="139" width="21" height="17" fill="#8dbdc2" stroke="#fff0d8" stroke-width="3"/><rect x="299" y="139" width="21" height="17" fill="#8dbdc2" stroke="#fff0d8" stroke-width="3"/>`,
		"hilltop-manor": `<path d="M174 121h40V82h33V59h29v23h33v39h36v70H174Z" fill="var(--house-wall)"/><path d="m164 124 30-34 30 27 15-22 22-54 22 54 15 22 30-27 30 34-10 12-20-17-20 24H194l-20-24-10 17Z" fill="var(--house-roof)"/><path d="M238 191v-45q12-14 24 0v45Z" fill="#496b59"/><g fill="#96bcb0" stroke="#fff0d8" stroke-width="3"><rect x="186" y="139" width="18" height="21"/><rect x="215" y="139" width="18" height="21"/><rect x="281" y="139" width="18" height="21"/><rect x="310" y="139" width="18" height="21"/></g><path d="M260 58V44" stroke="#edce82" stroke-width="4"/>`,
		"garden-chalet": `<path d="M183 115 250 69 317 115v76H183Z" fill="var(--house-wall)"/><path d="m170 119 80-69 80 69-17 7-63-53-63 53Z" fill="var(--house-roof)"/><path d="M238 191v-43q12-13 24 0v43Z" fill="#4c6f56"/><path d="M190 121h120v8H190m8 0v62m104-62v62" stroke="#f5ead0" stroke-width="4"/><rect x="198" y="137" width="26" height="22" fill="#8faaa0" stroke="#f5ead0" stroke-width="3"/><rect x="276" y="137" width="26" height="22" fill="#8faaa0" stroke="#f5ead0" stroke-width="3"/><path d="M260 75 288 99h-28Z" fill="#e6d5b1"/>`,
		"rainy-day-villa": `<path d="M178 115h144v76H178Z" fill="var(--house-wall)"/><path d="m169 118 81-56 81 56h-19l-62-42-62 42Z" fill="var(--house-roof)"/><path d="M187 120h126m-90-42v70m54-70v70" stroke="#d8ebe2" stroke-width="5" opacity=".9"/><path d="M238 154v37h24v-37Z" fill="#496b59"/><path d="M187 148h30m66 0h30" stroke="#fff1d7" stroke-width="4"/><path d="M230 62V48m40 14V48" stroke="#cce0d9" stroke-width="4"/>`
	};
	return `<div class="${className}" data-sky="${house.sky}" data-home-style="${house.id}" style="--house-wall:${house.wall};--house-roof:${house.roof}" role="img" aria-label="${house.name}"><svg viewBox="0 0 500 230" aria-hidden="true"><circle cx="399" cy="47" r="21" fill="#f0ca6b"/><path d="M0 159Q83 125 172 157T341 152T500 145V230H0Z" fill="#98b68a"/><path d="M0 185Q92 160 192 187T367 180T500 174V230H0Z" fill="#527a61"/><path d="M50 113q14-19 30 0h22q12-18 25-1" fill="none" stroke="#fff8e9" stroke-width="5" stroke-linecap="round" opacity=".8"/><path d="M400 190V92m0 30q-26-28-39-9 4 22 39 22m0-24q20-31 42-15-2 22-42 30" fill="none" stroke="#49694d" stroke-width="8" stroke-linecap="round"/><path d="M60 198V139m0 19q-21-24-35-6 3 18 35 20m0-22q20-24 36-10-2 18-36 23" fill="none" stroke="#607b53" stroke-width="7" stroke-linecap="round"/>${buildings[house.id] || buildings.cottage}<path d="M215 199q35-9 70 0l25 31h-120Z" fill="#d7c79e"/><circle cx="118" cy="196" r="4" fill="#efcf74"/><circle cx="133" cy="191" r="3" fill="#f5e4c3"/><circle cx="365" cy="198" r="4" fill="#e9c875"/><path d="M15 222H485" stroke="#d0bb8e" stroke-width="3" opacity=".65"/></svg><span class="house-scene-label">${house.name}</span></div>`;
}

function renderHouses() {
	const available = houses.filter((house) => house.id !== "cottage");
	$("#house-count-note").textContent = `${state.ownedHomes.length} of ${houses.length} collected`;
	$("#house-grid").innerHTML = available.map((house) => {
		const owned = state.ownedHomes.includes(house.id);
		const canAfford = state.balance >= house.price;
		return `<article class="house-card">${houseArtwork(house, "house-illustration")}<div class="house-card-body"><h3>${house.name}</h3><p>${house.description}</p><div class="house-card-footer"><span class="house-price-label"><span class="coin-mark">✦</span>${formatCoins(house.price)}</span><button class="house-buy" data-house="${house.id}" ${owned || !canAfford ? "disabled" : ""}>${owned ? "Owned" : canAfford ? "Make it yours" : "Not yet"}</button></div></div></article>`;
	}).join("");
	$("#house-grid").querySelectorAll("[data-house]").forEach((button) => button.addEventListener("click", () => buyHouse(button.dataset.house)));
}

function renderCollection() {
	const ownedHouses = houses.filter((house) => state.ownedHomes.includes(house.id));
	$("#collection-home-grid").innerHTML = ownedHouses.length ? ownedHouses.map((house) => `<article class="collection-home-item">${houseArtwork(house, "collection-home-art")}<strong>${house.name}${state.currentHome === house.id ? " · Home" : ""}</strong></article>`).join("") : `<p class="empty-collection">Your first place is waiting in My homes.</p>`;
	const items = keepsakes.filter((item) => state.ownedItems.includes(item.id));
	$("#item-grid").innerHTML = items.length ? items.map((item) => `<article class="item-card"><div class="item-art">${item.icon}</div><strong>${item.name}</strong><span>${item.detail}</span></article>`).join("") : `<p class="item-empty">No keepsakes just yet. There's something cute in the shop for every budget.</p>`;
	$("#shop-grid").innerHTML = keepsakes.map((item) => {
		const owned = state.ownedItems.includes(item.id);
		const canAfford = state.balance >= item.price;
		return `<article class="shop-card"><div class="item-art">${item.icon}</div><h3>${item.name}</h3><p>${item.detail}</p><div class="shop-card-footer"><span class="house-price-label"><span class="coin-mark">✦</span>${formatCoins(item.price)}</span><button class="shop-buy" data-buy-item="${item.id}" ${owned || !canAfford ? "disabled" : ""}>${owned ? "Owned" : canAfford ? "Buy" : "Not yet"}</button></div></article>`;
	}).join("");
	$("#shop-grid").querySelectorAll("[data-buy-item]").forEach((button) => button.addEventListener("click", () => buyKeepsake(button.dataset.buyItem)));
}

function renderHomeDecorator() {
	const picker = $("#home-picker");
	const rooms = $("#decorator-rooms");
	const inventory = $("#decorator-inventory-count");
	const upgradeButton = $("#upgrade-home-room");
	if (!picker || !rooms || !inventory || !upgradeButton) return;
	const ownedHomes = houses.filter((house) => state.ownedHomes.includes(house.id));
	if (!ownedHomes.length) {
		rooms.parentElement.querySelector(".decorator-inventory-list")?.remove();
		picker.innerHTML = `<option value="">No home yet</option>`;
		picker.disabled = true;
		rooms.innerHTML = `<div class="decorator-empty"><span>⌂</span><strong>Your first room is waiting.</strong><p>Claim Meadow Cottage from the homes page to start decorating.</p></div>`;
		inventory.textContent = `${state.ownedItems.length} keepsakes owned`;
		$("#room-upgrade-copy").textContent = "Claim a home to unlock its rooms.";
		upgradeButton.disabled = true;
		upgradeButton.textContent = "No home selected";
		return;
	}
	picker.disabled = false;
	if (!ownedHomes.some((house) => house.id === decoratingHomeId)) decoratingHomeId = state.currentHome && ownedHomes.some((house) => house.id === state.currentHome) ? state.currentHome : ownedHomes[0].id;
	picker.innerHTML = ownedHomes.map((house) => `<option value="${house.id}" ${house.id === decoratingHomeId ? "selected" : ""}>${house.name}</option>`).join("");
	const home = houses.find((house) => house.id === decoratingHomeId);
	const roomCount = Math.max(1, Math.min(5, state.homeRoomLevels[home.id] || 1));
	const placements = state.homeRooms[home.id] || [];
	const roomNames = ["Front Parlor", "Garden Kitchen", "Reading Nook", "Sun Room", "Little Attic"];
	const placedItems = placements.filter(Boolean);
	const availableItems = keepsakes.filter((item) => state.ownedItems.includes(item.id) && !placedItems.includes(item.id));
	if (selectedKeepsakeId && !availableItems.some((item) => item.id === selectedKeepsakeId)) selectedKeepsakeId = null;
	rooms.innerHTML = Array.from({ length: roomCount }, (_, index) => {
		const item = keepsakes.find((entry) => entry.id === placements[index]);
		return `<article class="interior-room" data-room="${index}"><div class="room-scene room-scene-${index + 1}" data-sky="${home.sky}" style="--house-wall:${home.wall};--house-roof:${home.roof}"><span class="room-window"></span><span class="room-artwork">${item ? item.icon : ""}</span><span class="room-plant">🪴</span><div class="room-floor"></div><span class="room-name">${roomNames[index]}</span></div><div class="room-controls">${item ? `<span class="placed-item-name">${item.name}</span><button class="room-remove" data-remove-room="${index}" aria-label="Remove ${item.name}">Remove</button>` : `<span class="empty-room-label">${selectedKeepsakeId ? "Ready for a keepsake" : "Empty room"}</span><button class="room-place" data-place-room="${index}" ${selectedKeepsakeId ? "" : "disabled"}>Place here</button>`}</div></article>`;
	}).join("");
	rooms.querySelectorAll("[data-place-room]").forEach((button) => button.addEventListener("click", () => placeKeepsake(decoratingHomeId, Number(button.dataset.placeRoom))));
	rooms.querySelectorAll("[data-remove-room]").forEach((button) => button.addEventListener("click", () => removeKeepsake(decoratingHomeId, Number(button.dataset.removeRoom))));
	const remainingRooms = keepsakes.filter((item) => state.ownedItems.includes(item.id) && !placedItems.includes(item.id));
	const inventoryList = document.createElement("div");
	inventoryList.className = "decorator-inventory-list";
	inventoryList.innerHTML = remainingRooms.length ? remainingRooms.map((item) => `<button type="button" class="decorator-item ${selectedKeepsakeId === item.id ? "selected" : ""}" data-select-item="${item.id}"><span>${item.icon}</span><strong>${item.name}</strong><small>${selectedKeepsakeId === item.id ? "Selected" : "Select to place"}</small></button>`).join("") : `<p class="decorator-empty-inventory">${state.ownedItems.length ? "Every keepsake you own is already in a room." : "Visit the little shop to get your first keepsake."}</p>`;
	rooms.parentElement.querySelector(".decorator-inventory").querySelector(".decorator-inventory-list")?.remove();
	rooms.parentElement.querySelector(".decorator-inventory").append(inventoryList);
	inventoryList.querySelectorAll("[data-select-item]").forEach((button) => button.addEventListener("click", () => {
		selectedKeepsakeId = selectedKeepsakeId === button.dataset.selectItem ? null : button.dataset.selectItem;
		renderHomeDecorator();
	}));
	inventory.textContent = `${remainingItemsCount()} keepsake${remainingItemsCount() === 1 ? "" : "s"} available`;
	const nextRoomCost = roomCount < 5 ? Math.floor(1600 * Math.pow(1.85, roomCount - 1)) : 0;
	$("#room-upgrade-copy").textContent = roomCount < 5 ? `Room ${roomCount + 1} · ${formatCoins(nextRoomCost)} coins` : "All five rooms are open.";
	upgradeButton.textContent = roomCount < 5 ? `Unlock room · ${formatCoins(nextRoomCost)}` : "Fully upgraded";
	upgradeButton.disabled = roomCount >= 5 || state.balance < nextRoomCost;
}

function remainingItemsCount() {
	return state.ownedItems.filter((itemId) => !Object.values(state.homeRooms).some((placements) => placements.includes(itemId))).length;
}

function placeKeepsake(homeId, roomIndex) {
	if (!selectedKeepsakeId || !state.ownedItems.includes(selectedKeepsakeId)) return;
	const placements = state.homeRooms[homeId] || [];
	if (placements[roomIndex] || Object.values(state.homeRooms).some((items) => items.includes(selectedKeepsakeId))) return;
	placements[roomIndex] = selectedKeepsakeId;
	state.homeRooms[homeId] = placements;
	selectedKeepsakeId = null;
	saveState();
	render();
}

function removeKeepsake(homeId, roomIndex) {
	const placements = state.homeRooms[homeId];
	if (!placements?.[roomIndex]) return;
	placements[roomIndex] = null;
	saveState();
	render();
}

function upgradeHomeRoom() {
	if (!decoratingHomeId) return;
	const currentLevel = state.homeRoomLevels[decoratingHomeId] || 1;
	if (currentLevel >= 5) return;
	const cost = Math.floor(1600 * Math.pow(1.85, currentLevel - 1));
	if (state.balance < cost) return;
	state.balance -= cost;
	state.homeRoomLevels[decoratingHomeId] = currentLevel + 1;
	saveState();
	render();
}

function renderGrowth() {
	const today = new Date().toISOString().slice(0, 10);
	if (state.jobsDate !== today) {
		state.jobsDate = today;
		state.claimedJobs = [];
		saveState();
	}
	$("#minigame-grid").innerHTML = minigames.map((game) => `<article class="minigame-card"><div class="minigame-card-top"><span class="minigame-icon">${game.icon}</span><span class="minigame-entry">ENTRY · ${formatCoins(game.entry)} ✦</span></div><h3>${game.name}</h3><p>${game.description}</p><div class="minigame-payout"><span>TOP SCORE</span><strong>Up to ${formatCoins(game.maxPrize)} coins</strong></div><div class="minigame-card-footer"><span>${game.rounds} quick rounds</span><button class="minigame-button" data-minigame="${game.id}" ${state.balance < game.entry ? "disabled" : ""}>Play · ${formatCoins(game.entry)} coins</button></div></article>`).join("");
	$("#minigame-grid").querySelectorAll("[data-minigame]").forEach((button) => button.addEventListener("click", () => startActivity(button.dataset.minigame, "arcade")));
	const remainingJobs = dailyJobs.filter((job) => !state.claimedJobs.includes(job.id)).length;
	$("#jobs-remaining").textContent = remainingJobs ? `${remainingJobs} still to do` : "All done for today";
	$("#jobs-grid").innerHTML = dailyJobs.map((job) => {
		const claimed = state.claimedJobs.includes(job.id);
		const minigame = minigames.find((game) => game.id === job.minigameId);
		return `<article class="job-card"><span class="job-icon">${job.icon}</span><div class="job-copy"><h3>${job.title}</h3><p>${job.detail}</p><span class="job-minigame">Challenge · ${minigame.name}</span></div><div class="job-reward"><span>SHIFT PAY · UP TO</span><strong>${formatCoins(job.reward)} <small>✦</small></strong><button class="job-button" data-job="${job.id}" ${claimed ? "disabled" : ""}>${claimed ? "Done today" : "Start shift"}</button></div></article>`;
	}).join("");
	$("#jobs-grid").querySelectorAll("[data-job]").forEach((button) => button.addEventListener("click", () => startJob(button.dataset.job)));
	$("#investment-grid").innerHTML = investmentProjects.map((project) => `<article class="investment-card" data-project-card="${project.id}"><div class="investment-card-top"><span class="investment-icon">${project.icon}</span><span class="investment-rate">${Math.round(project.winChance * 100)}% WIN CHANCE</span></div><h3>${project.name}</h3><p>${project.detail}</p><div class="investment-terms"><span>Buy-in <strong>${formatCoins(project.minimum)} coins</strong></span><span>Wait <strong>${Math.round(project.duration / 1000)} sec</strong></span></div><div class="investment-outcomes"><span>WIN <strong>+${Math.round(project.winRate * 100)}%</strong><small>${formatCoins(Math.floor(project.minimum * (1 + project.winRate)))} back</small></span><span>LOSS <strong>−${Math.round(project.lossRate * 100)}%</strong><small>${formatCoins(Math.floor(project.minimum * (1 - project.lossRate)))} back</small></span></div><span class="investment-status" data-investment-status="${project.id}"></span><button class="investment-button" data-investment="${project.id}"></button></article>`).join("");
	$("#investment-grid").querySelectorAll("[data-investment]").forEach((button) => button.addEventListener("click", () => handleInvestment(button.dataset.investment)));
	updateInvestmentButtons();
}

function updateInvestmentButtons() {
	investmentProjects.forEach((project) => {
		const button = $(`[data-investment="${project.id}"]`);
		if (!button) return;
		const status = $(`[data-investment-status="${project.id}"]`);
		const investment = state.investments.find((entry) => entry.projectId === project.id);
		if (investment) {
			if (typeof investment.outcomeRoll !== "number") {
				investment.outcomeRoll = Math.random();
				saveState();
			}
			const remaining = investment.maturesAt - Date.now();
			if (remaining <= 0) {
				status.textContent = "Ready to reveal your outcome";
				button.textContent = "Reveal outcome";
				button.disabled = false;
			} else {
				status.textContent = `${Math.ceil(remaining / 1000)} sec left · outcome locked`;
				button.textContent = "Investment growing";
				button.disabled = true;
			}
			return;
		}
		status.textContent = `Win ${Math.round(project.winChance * 100)}% · lose ${Math.round((1 - project.winChance) * 100)}%`;
		button.textContent = `Invest ${formatCoins(project.minimum)} coins`;
		button.disabled = state.balance < project.minimum;
	});
}

function setView(view) {
	document.querySelectorAll(".view-panel").forEach((panel) => panel.classList.add("hidden"));
	$(`#${view}-view`).classList.remove("hidden");
	document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.view === view));
	document.querySelectorAll(".casino-nav-link").forEach((link) => link.classList.toggle("active", link.dataset.view === view));
	document.querySelector(".app-shell").classList.toggle("casino-mode", view === "play");
	$("#page-label").textContent = { play: "THE CASINO FLOOR", homes: "YOUR NEXT CHAPTER", grow: "GROW YOUR COINS", collection: "THE GOOD THINGS" }[view];
	window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderRoundArt(animation, phase, outcome = {}) {
	const reveal = outcome.reveal || {};
	if (animation === "flip") {
		const side = phase === "result" ? reveal.side : "?";
		return `<div class="flip-scene"><div class="flip-coin ${phase === "running" ? "spinning-coin" : ""}"><span>${side === "heads" ? "L" : side === "tails" ? "✦" : "?"}</span></div><span class="scene-note">${side === "heads" ? "HEADS" : side === "tails" ? "TAILS" : "FLIPPING"}</span></div>`;
	}
	if (animation === "dice") {
		if (phase === "result" && reveal.symbols) return `<div class="dice-scene symbol-dice-scene">${reveal.symbols.map((symbol) => `<span class="symbol-die">${symbol}</span>`).join("")}</div>`;
		const values = phase === "result" && reveal.values ? reveal.values : [3, 5];
		const faces = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
		return `<div class="dice-scene">${values.map((value) => `<span class="draw-die ${phase === "running" ? "rolling-die" : ""}">${phase === "result" ? faces[value] : "⚄"}</span>`).join("")}</div>`;
	}
	if (animation === "cards") {
		if (phase === "result" && reveal.cards) return `<div class="table-card-reveal">${reveal.cards.map((card) => `<div class="drawn-card ${card.color === "red" ? "card-red" : ""}"><strong>${cardRankLabel(card.rank)}</strong><span>${card.suit}</span><small>${card.suitName}</small></div>`).join("")}</div>`;
		const card = reveal.card || {};
		const isNumberDraw = reveal.number !== undefined;
		const face = phase === "result" ? `<div class="drawn-card ${card.color === "red" ? "card-red" : ""}"><strong>${card.rank ?? reveal.number ?? "?"}</strong><span>${card.suit || (isNumberDraw ? "↕" : "✦")}</span><small>${card.suitName || (isNumberDraw ? "HIGH / LOW" : "LUCKY DRAW")}</small></div>` : "";
		const back = phase === "result" ? "" : `<div class="drawn-card card-back ${phase === "running" ? "drawing-card" : ""}">${phase === "running" ? "✦" : "DRAW"}</div>`;
		return `<div class="card-scene"><div class="card-stack"><span>✦</span></div>${back}${face}</div>`;
	}
	if (animation === "wheel") {
		const wheelValue = phase === "result" ? (reveal.number ?? reveal.color ?? "✦") : "";
		return `<div class="wheel-scene"><span class="scene-pointer">▼</span><div class="result-wheel ${phase === "running" ? "spinning-wheel" : ""}"><span>1</span><span>2</span><span>3</span><span>4</span><i>✦</i></div><span class="wheel-readout">${wheelValue}</span></div>`;
	}
	if (animation === "slots") {
		const reels = phase === "result" && reveal.reels ? reveal.reels : ["🍋", "✦", "🍒"];
		const symbols = ["🍋", "🍒", "✦", "🍀", "🔔", "🍇"];
		return `<div class="slot-cabinet"><div class="reel-scene">${reels.map((symbol, index) => {
			const stripSymbols = phase === "running" ? Array.from({ length: 12 }, (_, row) => symbols[(row + index * 2) % symbols.length]) : [symbol];
			return `<span class="reel-window ${phase === "running" ? "spinning-reel" : "stopped-reel"} ${phase === "result" && symbol === reels[0] && reels.filter((item) => item === symbol).length > 1 ? "matched-reel" : ""}"><span class="reel-strip" style="--reel-delay:${index * 110}ms">${stripSymbols.map((entry) => `<span>${entry}</span>`).join("")}</span></span>`;
		}).join("")}</div></div>`;
	}
	if (animation === "cups") {
		const prize = phase === "result" ? reveal.position : "";
		return `<div class="cup-scene">${["left", "middle", "right"].map((position) => `<span class="cup-wrap ${phase === "running" ? "shuffling-cup" : ""} ${prize === position ? "prize-cup" : ""}">${prize === position ? "✦" : ""}<b>🥤</b></span>`).join("")}</div>`;
	}
	if (animation === "target") {
		const bullseye = phase === "result" && reveal.ring === "bullseye";
		return `<div class="target-scene"><span class="target-rings ${bullseye ? "hit-bullseye" : ""}">◎</span><span class="target-arrow ${phase === "running" ? "flying-arrow" : ""}">➶</span></div>`;
	}
	if (animation === "timing") {
		return `<div class="timing-readout"><span class="timing-clock">⏱</span><span>${phase === "result" ? reveal.accuracy <= .08 ? "PERFECT STOP" : "NICE TRY" : phase === "running" ? "WATCH THE NEEDLE" : "READY WHEN YOU ARE"}</span></div>`;
	}
	if (animation === "race") {
		const order = phase === "result" && reveal.order ? reveal.order : [1, 2, 3, 4];
		return `<div class="race-scene">${order.map((horse, index) => `<div class="race-lane ${phase === "result" && index === 0 ? "race-winner" : ""}"><span class="race-number">${horse}</span><span class="race-runner ${phase === "running" ? "running-horse" : ""}" style="--race-delay:${index * 90}ms">${["🐎", "🏇", "🐎", "🏇"][horse - 1]}</span><span class="race-line"></span></div>`).join("")}<span class="race-finish">FINISH</span></div>`;
	}
	return `<span class="round-token">✦</span>`;
}

function bindSkillControls(mechanic) {
	if (mechanic.skill === "aim") {
		const arena = $("#aim-arena");
		const updateAim = (event) => {
			const bounds = arena.getBoundingClientRect();
			const x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
			const y = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
			arena.style.setProperty("--aim-x", `${x * 100}%`);
			arena.style.setProperty("--aim-y", `${y * 100}%`);
			return Math.min(1, Math.hypot(x - .5, y - .5) / .5);
		};
		arena.addEventListener("pointermove", updateAim);
		arena.addEventListener("click", (event) => playRound("aim", { accuracy: updateAim(event) }));
	}
	if (mechanic.skill === "timing") {
		$("#skill-stop").addEventListener("click", () => {
			const track = $("#timing-track").getBoundingClientRect();
			const needle = $("#timing-needle").getBoundingClientRect();
			const distance = Math.abs((needle.left + needle.width / 2) - (track.left + track.width / 2)) / (track.width / 2);
			playRound("timing", { accuracy: Math.min(1, distance) });
		});
	}
}

function openGame(gameId) {
	if (isPlaying) return;
	const game = gameCatalog.find((entry) => entry.id === gameId);
	if (!game) return;
	currentGame = gameId;
	tableRound = null;
	const config = gameMechanics[game.mechanic];
	const isCardTable = ["blackjack", "poker", "highlow"].includes(config.skill);
	$("#dialog-kicker").textContent = `${game.category.toUpperCase()} · A LITTLE GAME`;
	$("#dialog-title").textContent = game.name;
	$("#dialog-description").textContent = game.description;
	$("#choice-label").textContent = config.label;
	$("#dialog-balance").textContent = formatCoins(state.balance);
	$("#control-rail-title").textContent = ["blackjack", "poker", "highlow"].includes(config.skill) ? "Play the hand" : "Place your wager";
	$("#game-result").textContent = "";
	$("#game-result").className = "game-result";
	$("#hand-table").innerHTML = "";
	$("#hand-table").classList.toggle("hidden", !isCardTable);
	$("#round-stage").className = "round-stage";
	$("#round-stage").classList.toggle("hidden", isCardTable);
	$("#round-animation").className = `round-animation animation-${config.animation}`;
	$("#round-animation").innerHTML = renderRoundArt(config.animation, "ready");
	$("#round-caption").textContent = "YOUR LUCK IS READY";
	$("#round-stage").classList.toggle("hidden", ["blackjack", "poker", "highlow"].includes(config.skill));
	$("#wager").max = Math.max(10, state.balance);
	$("#wager").value = Math.min(50, state.balance);
	$("#wager").disabled = state.balance < 10;
	$("#choice-buttons").classList.toggle("number-grid", config.choices.length > 12);
	document.querySelectorAll(".wager-presets button").forEach((button) => { button.disabled = state.balance < 10; });
	if (config.skill === "aim") {
		$("#choice-buttons").innerHTML = `<div class="skill-instructions">Move your marker. Tap as close to center as you can.</div><button type="button" class="aim-arena" id="aim-arena" aria-label="Aim and take your shot" ${state.balance < 10 ? "disabled" : ""}><span class="aim-rings"><i></i></span><span class="aim-reticle" id="aim-reticle">＋</span></button><span class="skill-hint">TAP THE TARGET TO SHOOT</span>`;
		bindSkillControls(config);
	} else if (config.skill === "timing") {
		$("#choice-buttons").innerHTML = `<div class="skill-instructions">Stop the moving marker inside the gold zone.</div><div class="timing-track" id="timing-track"><span class="timing-perfect-zone"></span><span class="timing-needle" id="timing-needle"></span></div><button type="button" class="skill-action" id="skill-stop" ${state.balance < 10 ? "disabled" : ""}>Stop the needle</button>`;
		bindSkillControls(config);
	} else if (config.skill === "blackjack") {
		$("#choice-buttons").innerHTML = `<p class="skill-instructions">Get as close to 21 as you can. A natural blackjack pays 3:2.</p><button type="button" class="game-action" id="blackjack-start" ${state.balance < 10 ? "disabled" : ""}>Deal hand</button>`;
		$("#blackjack-start").addEventListener("click", startBlackjack);
	} else if (config.skill === "poker") {
		$("#choice-buttons").innerHTML = `<p class="skill-instructions">Choose up to three cards to replace. Better hands pay more.</p><button type="button" class="game-action" id="poker-start" ${state.balance < 10 ? "disabled" : ""}>Deal five cards</button>`;
		$("#poker-start").addEventListener("click", startPokerDraw);
	} else if (config.skill === "highlow") {
		$("#choice-buttons").innerHTML = `<p class="skill-instructions">Guess higher or lower. Cash out your growing streak whenever you like.</p><button type="button" class="game-action" id="highlow-start" ${state.balance < 10 ? "disabled" : ""}>Start ladder</button>`;
		$("#highlow-start").addEventListener("click", startHighLowLadder);
	} else {
		$("#choice-buttons").innerHTML = config.choices.map(([label, choice]) => `<button class="choice-button" data-choice="${choice}" ${state.balance < 10 ? "disabled" : ""}>${label}</button>`).join("");
		$("#choice-buttons").querySelectorAll("button").forEach((button) => button.addEventListener("click", () => playRound(button.dataset.choice)));
	}
	$("#game-dialog").showModal();
}

function createDeck() {
	const suits = [{ name: "hearts", icon: "♥", color: "red" }, { name: "diamonds", icon: "♦", color: "red" }, { name: "clubs", icon: "♣", color: "black" }, { name: "spades", icon: "♠", color: "black" }];
	const deck = suits.flatMap((suit) => Array.from({ length: 13 }, (_, index) => ({ rank: index + 2, suit: suit.icon, suitName: suit.name, color: suit.color })));
	for (let index = deck.length - 1; index > 0; index -= 1) {
		const other = Math.floor(Math.random() * (index + 1));
		[deck[index], deck[other]] = [deck[other], deck[index]];
	}
	return deck;
}

function cardRankLabel(rank) {
	return ({ 11: "J", 12: "Q", 13: "K", 14: "A" })[rank] || String(rank);
}

function cardElement(card, extraClass = "") {
	return `<div class="playing-card ${card.color === "red" ? "red-suit" : ""} ${extraClass}"><strong>${cardRankLabel(card.rank)}</strong><span>${card.suit}</span><small>${card.suitName}</small></div>`;
}

function beginTableWager(type) {
	if (isPlaying) return 0;
	const wager = Math.floor(Number($("#wager").value));
	if (!Number.isFinite(wager) || wager < 10 || wager > state.balance) {
		showResult(wager > state.balance ? "That wager is more than your balance." : "Choose a wager of at least 10 coins.", "loss");
		return 0;
	}
	state.balance -= wager;
	tableRound = { type, wager, status: "playing" };
	isPlaying = true;
	saveState();
	render();
	$("#dialog-balance").textContent = formatCoins(state.balance);
	$("#wager").disabled = true;
	document.querySelectorAll(".wager-presets button").forEach((button) => { button.disabled = true; });
	$("#game-result").textContent = "";
	$("#game-result").className = "game-result";
	return wager;
}

function finishTableRound(payout, message) {
	const wager = tableRound.wager;
	const returned = Math.floor(payout);
	state.balance += returned;
	if (returned > wager) {
		state.totalWon += returned - wager;
		state.bestRun = Math.max(state.bestRun, returned - wager);
	}
	tableRound.status = "complete";
	isPlaying = false;
	saveState();
	render();
	$("#dialog-balance").textContent = formatCoins(state.balance);
	$("#wager").max = Math.max(10, state.balance);
	$("#wager").disabled = state.balance < 10;
	document.querySelectorAll(".wager-presets button").forEach((button) => { button.disabled = state.balance < 10; });
	const resultClass = returned >= wager ? "win" : "loss";
	const payoutText = returned > wager ? ` You won ${formatCoins(returned - wager)} coins.` : returned === wager ? " Your wager is returned." : ` You lost ${formatCoins(wager)} coins.`;
	showResult(`${message}${payoutText}`, resultClass);
	$("#control-rail-title").textContent = "Hand complete";
	if (tableRound.type === "blackjack") {
		$("#choice-buttons").innerHTML = `<button type="button" class="game-action" id="blackjack-start" ${state.balance < 10 ? "disabled" : ""}>Deal again</button>`;
		$("#blackjack-start").addEventListener("click", startBlackjack);
	} else if (tableRound.type === "poker") {
		$("#choice-buttons").innerHTML = `<button type="button" class="game-action" id="poker-start" ${state.balance < 10 ? "disabled" : ""}>Deal again</button>`;
		$("#poker-start").addEventListener("click", startPokerDraw);
	} else {
		$("#choice-buttons").innerHTML = `<button type="button" class="game-action" id="highlow-start" ${state.balance < 10 ? "disabled" : ""}>Try another run</button>`;
		$("#highlow-start").addEventListener("click", startHighLowLadder);
	}
}

function handValue(cards) {
	let total = cards.reduce((sum, card) => sum + (card.rank === 14 ? 11 : Math.min(card.rank, 10)), 0);
	let aces = cards.filter((card) => card.rank === 14).length;
	while (total > 21 && aces > 0) {
		total -= 10;
		aces -= 1;
	}
	return total;
}

function renderBlackjackTable() {
	const hideHole = tableRound.status === "player-turn";
	const visibleDealerCards = hideHole ? tableRound.dealer.slice(0, 1) : tableRound.dealer;
	const dealerScore = handValue(visibleDealerCards);
	$("#hand-table").innerHTML = `<div class="blackjack-layout"><div class="hand-zone"><div class="hand-label">THE DEALER</div><div class="playing-hand">${tableRound.dealer.map((card, index) => hideHole && index === 1 ? `<div class="playing-card face-down">✦</div>` : cardElement(card)).join("")}</div><div class="hand-score">${hideHole ? `Showing ${dealerScore}` : `Dealer · ${dealerScore}`}</div></div><div class="blackjack-outcome">21</div><div class="hand-zone"><div class="hand-label">YOUR HAND</div><div class="playing-hand">${tableRound.player.map((card) => cardElement(card)).join("")}</div><div class="hand-score">You · ${handValue(tableRound.player)}</div></div></div>`;
}

function startBlackjack() {
	const wager = beginTableWager("blackjack");
	if (!wager) return;
	const deck = createDeck();
	tableRound.deck = deck;
	tableRound.player = [deck.pop(), deck.pop()];
	tableRound.dealer = [deck.pop(), deck.pop()];
	tableRound.status = "player-turn";
	$("#control-rail-title").textContent = "Hit or stand?";
	renderBlackjackTable();
	if (handValue(tableRound.player) === 21) {
		tableRound.status = "complete";
		renderBlackjackTable();
		if (handValue(tableRound.dealer) === 21) finishTableRound(wager, "Both hands have blackjack.");
		else finishTableRound(Math.floor(wager * 2.5), "Blackjack! A natural 21.");
		return;
	}
	if (handValue(tableRound.dealer) === 21) {
		tableRound.status = "complete";
		renderBlackjackTable();
		finishTableRound(0, "Dealer has a natural blackjack.");
		return;
	}
	$("#choice-label").textContent = "YOUR MOVE";
	$("#choice-buttons").innerHTML = `<button type="button" class="game-action" id="blackjack-hit">Hit</button><button type="button" class="game-action secondary-action" id="blackjack-stand">Stand</button>`;
	$("#blackjack-hit").addEventListener("click", hitBlackjack);
	$("#blackjack-stand").addEventListener("click", standBlackjack);
}

function hitBlackjack() {
	if (!tableRound || tableRound.type !== "blackjack" || tableRound.status !== "player-turn") return;
	tableRound.player.push(tableRound.deck.pop());
	renderBlackjackTable();
	if (handValue(tableRound.player) > 21) {
		tableRound.status = "complete";
		renderBlackjackTable();
		finishTableRound(0, `Bust at ${handValue(tableRound.player)}.`);
	}
}

function standBlackjack() {
	if (!tableRound || tableRound.type !== "blackjack" || tableRound.status !== "player-turn") return;
	tableRound.status = "dealer-turn";
	while (handValue(tableRound.dealer) < 17) tableRound.dealer.push(tableRound.deck.pop());
	renderBlackjackTable();
	const player = handValue(tableRound.player);
	const dealer = handValue(tableRound.dealer);
	if (dealer > 21 || player > dealer) finishTableRound(tableRound.wager * 2, `You win ${player} to ${dealer}.`);
	else if (player === dealer) finishTableRound(tableRound.wager, `Push. Both hands finish at ${player}.`);
	else finishTableRound(0, `Dealer wins ${dealer} to ${player}.`);
}

function renderPokerTable() {
	const heldCount = tableRound.held.filter(Boolean).length;
	$("#hand-table").innerHTML = `<div class="poker-layout"><div><div class="hand-label">YOUR FIVE-CARD HAND · ${heldCount} HELD</div><div class="playing-hand">${tableRound.hand.map((card, index) => `<button type="button" class="playing-card poker-selectable ${card.color === "red" ? "red-suit" : ""} ${tableRound.held[index] ? "held" : ""}" data-poker-card="${index}" ${tableRound.status !== "draw" || (!tableRound.held[index] && heldCount >= 3) ? "disabled" : ""}><strong>${cardRankLabel(card.rank)}</strong><span>${card.suit}</span><small>${tableRound.held[index] ? "KEEP" : "TAP TO KEEP"}</small></button>`).join("")}</div></div></div>`;
	$("#hand-table").querySelectorAll("[data-poker-card]").forEach((button) => button.addEventListener("click", () => {
		const index = Number(button.dataset.pokerCard);
		if (!tableRound || tableRound.status !== "draw") return;
		if (!tableRound.held[index] && tableRound.held.filter(Boolean).length >= 3) return;
		tableRound.held[index] = !tableRound.held[index];
		renderPokerTable();
	}));
}

function evaluatePokerHand(cards) {
	const values = cards.map((card) => card.rank).sort((a, b) => a - b);
	const counts = new Map();
	values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
	const groups = [...counts.values()].sort((a, b) => b - a);
	const flush = cards.every((card) => card.suitName === cards[0].suitName);
	const unique = [...new Set(values)];
	const straight = unique.length === 5 && (unique[4] - unique[0] === 4 || unique.join(",") === "2,3,4,5,14");
	const straightFlush = straight && flush;
	if (straightFlush) return { name: "Straight flush", multiplier: 30 };
	if (groups[0] === 4) return { name: "Four of a kind", multiplier: 15 };
	if (groups[0] === 3 && groups[1] === 2) return { name: "Full house", multiplier: 7 };
	if (flush) return { name: "Flush", multiplier: 5 };
	if (straight) return { name: "Straight", multiplier: 4 };
	if (groups[0] === 3) return { name: "Three of a kind", multiplier: 3 };
	if (groups[0] === 2 && groups[1] === 2) return { name: "Two pair", multiplier: 2 };
	if (groups[0] === 2) return { name: "One pair", multiplier: 1.2 };
	return { name: "High card", multiplier: 0 };
}

function startPokerDraw() {
	const wager = beginTableWager("poker");
	if (!wager) return;
	const deck = createDeck();
	tableRound.deck = deck;
	tableRound.hand = Array.from({ length: 5 }, () => deck.pop());
	tableRound.held = Array(5).fill(false);
	tableRound.status = "draw";
	$("#control-rail-title").textContent = "Choose what to keep";
	$("#choice-label").textContent = "HOLD UP TO THREE CARDS";
	renderPokerTable();
	$("#choice-buttons").innerHTML = `<button type="button" class="game-action" id="poker-draw">Draw replacements</button>`;
	$("#poker-draw").addEventListener("click", drawPokerCards);
}

function drawPokerCards() {
	if (!tableRound || tableRound.type !== "poker" || tableRound.status !== "draw") return;
	tableRound.status = "complete";
	tableRound.hand = tableRound.hand.map((card, index) => tableRound.held[index] ? card : tableRound.deck.pop());
	renderPokerTable();
	const result = evaluatePokerHand(tableRound.hand);
	finishTableRound(Math.floor(tableRound.wager * result.multiplier), `${result.name}!`);
}

function renderHighLowTable() {
	const multiplier = tableRound.streak ? Math.min(8, 1.5 ** tableRound.streak) : 1;
	$("#hand-table").innerHTML = `<div class="highlow-layout"><div class="highlow-progress">STEP ${tableRound.streak} OF 5 · ${tableRound.streak ? `${multiplier.toFixed(2)}× CURRENT RUN` : "FIRST CARD"}</div><div class="hand-zone"><div class="hand-label">CURRENT CARD</div><div class="playing-hand">${cardElement(tableRound.current)}</div></div></div>`;
}

function startHighLowLadder() {
	const wager = beginTableWager("highlow");
	if (!wager) return;
	tableRound.deck = createDeck();
	tableRound.current = tableRound.deck.pop();
	tableRound.streak = 0;
	tableRound.status = "predict";
	$("#control-rail-title").textContent = "Call the next card";
	$("#choice-label").textContent = "HIGHER OR LOWER?";
	renderHighLowTable();
	setHighLowControls();
}

function setHighLowControls(message = "") {
	const canCashOut = tableRound.streak > 0;
	$("#choice-buttons").innerHTML = `${message ? `<p class="skill-instructions">${message}</p>` : ""}<button type="button" class="game-action" id="highlow-higher">Higher</button><button type="button" class="game-action secondary-action" id="highlow-lower">Lower</button>${canCashOut ? `<button type="button" class="game-action secondary-action cashout-action" id="highlow-cashout">Cash out · ${Math.min(8, 1.5 ** tableRound.streak).toFixed(2)}×</button>` : ""}`;
	$("#highlow-higher").addEventListener("click", () => predictHighLow("high"));
	$("#highlow-lower").addEventListener("click", () => predictHighLow("low"));
	$("#highlow-cashout")?.addEventListener("click", cashOutHighLow);
}

function predictHighLow(choice) {
	if (!tableRound || tableRound.type !== "highlow" || tableRound.status !== "predict") return;
	const next = tableRound.deck.pop();
	const result = next.rank > tableRound.current.rank ? "high" : next.rank < tableRound.current.rank ? "low" : "tie";
	tableRound.current = next;
	if (result !== "tie" && result !== choice) {
		tableRound.status = "complete";
		renderHighLowTable();
		finishTableRound(0, `Wrong call. The ${cardRankLabel(next.rank)} did not go ${choice === "high" ? "higher" : "lower"}.`);
		return;
	}
	if (result !== "tie") tableRound.streak += 1;
	renderHighLowTable();
	if (tableRound.streak >= 5) {
		cashOutHighLow();
		return;
	}
	setHighLowControls(result === "tie" ? "Same rank. Your streak holds; call again." : `Good call! ${tableRound.streak} right in a row.`);
}

function cashOutHighLow() {
	if (!tableRound || tableRound.type !== "highlow" || tableRound.streak < 1) return;
	const multiplier = Math.min(8, 1.5 ** tableRound.streak);
	tableRound.status = "complete";
	finishTableRound(Math.floor(tableRound.wager * multiplier), `You banked a ${tableRound.streak}-card streak at ${multiplier.toFixed(2)}×.`);
}

function playRound(choice, skillData = {}) {
	if (isPlaying) return;
	const wager = Math.floor(Number($("#wager").value));
	if (!Number.isFinite(wager) || wager < 10 || wager > state.balance) {
		showResult(wager > state.balance ? "That wager is more than your balance." : "Choose a wager of at least 10 coins.", "loss");
		return;
	}
	const game = gameCatalog.find((entry) => entry.id === currentGame);
	const mechanic = gameMechanics[game.mechanic];
	isPlaying = true;
	state.balance -= wager;
	saveState();
	render();
	document.querySelectorAll(".choice-button, .wager-presets button, .skill-action, .aim-arena").forEach((button) => { button.disabled = true; });
	$("#wager").disabled = true;
	$("#round-stage").className = `round-stage is-running animation-${mechanic.animation}`;
	$("#round-animation").className = `round-animation animation-${mechanic.animation} is-running`;
	$("#round-animation").innerHTML = renderRoundArt(mechanic.animation, "running");
	$("#round-caption").textContent = "YOUR LUCK IS IN MOTION";
	$("#game-result").textContent = "";
	$("#game-result").className = "game-result";
	window.setTimeout(() => {
		const outcome = resolveGame(game, choice, skillData);
		const won = outcome.multiplier > 0;
		const payout = Math.floor(wager * outcome.multiplier);
		if (won) {
			state.balance += payout;
			state.totalWon += payout - wager;
			state.bestRun = Math.max(state.bestRun, payout - wager);
		}
		saveState();
		render();
		$("#round-stage").className = `round-stage result-stage ${won ? "result-win" : "result-loss"} animation-${mechanic.animation}`;
		$("#round-animation").className = `round-animation animation-${mechanic.animation} result-${won ? "win" : "loss"}`;
		$("#round-animation").innerHTML = renderRoundArt(mechanic.animation, "result", outcome);
		$("#round-caption").textContent = won ? "LUCK FOUND YOU" : "NEXT ROUND, MAYBE";
		showResult(`${outcome.message} ${won ? `You won ${formatCoins(payout - wager)} coins!` : `You lost ${formatCoins(wager)} coins.`}`, won ? "win" : "loss");
		isPlaying = false;
		if (!$("#game-dialog").open) return;
		$("#choice-buttons").querySelectorAll("button").forEach((button) => { button.disabled = state.balance < 10; });
		document.querySelectorAll(".wager-presets button").forEach((button) => { button.disabled = state.balance < 10; });
		$("#wager").max = Math.max(10, state.balance);
		$("#wager").value = Math.min(wager, state.balance);
		$("#wager").disabled = state.balance < 10;
	}, 1150);
}

function resolveGame(game, choice, skillData = {}) {
	const rollDie = () => Math.floor(Math.random() * 6) + 1;
	const win = (message, multiplier = 2, reveal = {}) => ({ multiplier, message, reveal });
	const lose = (message, reveal = {}) => ({ multiplier: 0, message, reveal });
	if (game.mechanic === "baccarat") {
		const deck = createDeck();
		const player = [deck.pop(), deck.pop()];
		const banker = [deck.pop(), deck.pop()];
		const points = (cards) => cards.reduce((sum, card) => sum + (card.rank === 14 ? 1 : card.rank >= 10 ? 0 : card.rank), 0) % 10;
		const playerPoints = points(player);
		const bankerPoints = points(banker);
		let playerThird = null;
		if (playerPoints < 8 && bankerPoints < 8) {
			if (playerPoints <= 5) {
				playerThird = deck.pop();
				player.push(playerThird);
			}
			const thirdPoint = playerThird ? (playerThird.rank === 14 ? 1 : playerThird.rank >= 10 ? 0 : playerThird.rank) : null;
			const bankerDraws = playerThird === null ? bankerPoints <= 5 : bankerPoints <= 2 || bankerPoints === 3 && thirdPoint !== 8 || bankerPoints === 4 && thirdPoint >= 2 && thirdPoint <= 7 || bankerPoints === 5 && thirdPoint >= 4 && thirdPoint <= 7 || bankerPoints === 6 && thirdPoint >= 6 && thirdPoint <= 7;
			if (bankerDraws) banker.push(deck.pop());
		}
		const finalPlayer = points(player);
		const finalBanker = points(banker);
		const result = finalPlayer === finalBanker ? "tie" : finalPlayer > finalBanker ? "player" : "banker";
		const multiplier = result === "tie" ? 8 : result === "banker" ? 1.95 : 2;
		const message = `Player ${finalPlayer} · Banker ${finalBanker}. ${result === "tie" ? "A tie!" : `${result} wins!`}`;
		const cards = [...player, ...banker];
		return choice === result ? win(message, multiplier, { cards }) : lose(message, { cards });
	}
	if (game.mechanic === "war") {
		const deck = createDeck();
		let player = deck.pop();
		let dealer = deck.pop();
		const cards = [player, dealer];
		if (player.rank === dealer.rank) {
			for (let index = 0; index < 3; index += 1) {
				deck.pop();
				deck.pop();
			}
			player = deck.pop();
			dealer = deck.pop();
			cards.push(player, dealer);
		}
		const result = player.rank === dealer.rank ? "tie" : player.rank > dealer.rank ? "player" : "dealer";
		const multiplier = result === "tie" ? 1 : 2;
		const message = `Your ${cardRankLabel(player.rank)} ${result === "player" ? "beats" : result === "tie" ? "ties" : "faces"} the dealer's ${cardRankLabel(dealer.rank)}${result === "dealer" ? " and loses" : result === "tie" ? " again" : ""}.`;
		if (result === "tie") return win(message, multiplier, { cards });
		return choice === result ? win(message, multiplier, { cards }) : lose(message, { cards });
	}
	if (game.mechanic === "redDog") {
		const deck = createDeck();
		const first = deck.pop();
		const second = deck.pop();
		const low = Math.min(first.rank, second.rank);
		const high = Math.max(first.rank, second.rank);
		const third = deck.pop();
		const gap = high - low - 1;
		const inside = third.rank > low && third.rank < high;
		const edge = third.rank === low || third.rank === high;
		const result = inside ? "inside" : "outside";
		const insideMultiplier = gap <= 1 ? 2 : gap <= 3 ? 3 : gap <= 6 ? 5 : 10;
		const multiplier = edge || gap === 0 ? 1 : choice === result ? choice === "inside" ? insideMultiplier : 1.5 : 0;
		const message = gap === 0 ? `A pair: ${cardRankLabel(first.rank)} and ${cardRankLabel(second.rank)}. Your wager pushes.` : `The ${cardRankLabel(third.rank)} lands ${inside ? "between" : "outside"} ${cardRankLabel(low)} and ${cardRankLabel(high)}.`;
		return { multiplier, message, reveal: { cards: [first, second, third] } };
	}
	if (game.mechanic === "craps") {
		let first = rollDie();
		let second = rollDie();
		let total = first + second;
		const opening = total;
		if (total === 7 || total === 11) return choice === "pass" ? win(`Natural ${total}! Pass line wins.`, 2, { values: [first, second] }) : lose(`Natural ${total}. Don't pass loses.`, { values: [first, second] });
		if ([2, 3, 12].includes(total)) {
			if (total === 12 && choice === "dont") return win("A 12 on the come-out roll. Don't pass pushes.", 1, { values: [first, second] });
			return choice === "dont" ? win(`Craps ${total}! Don't pass wins.`, 2, { values: [first, second] }) : lose(`Craps ${total}. Pass line loses.`, { values: [first, second] });
		}
		const point = total;
		for (let rolls = 0; rolls < 60; rolls += 1) {
			first = rollDie();
			second = rollDie();
			total = first + second;
			if (total === point || total === 7) break;
		}
		const passWins = total === point;
		const won = choice === "pass" ? passWins : !passWins;
		const reveal = { values: [first, second] };
		return won ? win(`${total === 7 ? "Seven-out" : `Point ${point} made`}! ${choice === "pass" ? "Pass line wins." : "Don't pass wins."} Come-out was ${opening}.`, 2, reveal) : lose(`${total === 7 ? "Seven-out" : `Point ${point} made`} against your line. Come-out was ${opening}.`, reveal);
	}
	if (game.mechanic === "rouletteNumber") {
		const number = Math.floor(Math.random() * 37);
		const reveal = { number, color: number === 0 ? "green" : number % 2 === 0 ? "black" : "red" };
		return choice === String(number) ? win(`Pocket ${number}! Exact number.`, 36, reveal) : lose(`The ball lands in ${number} ${reveal.color}.`, reveal);
	}
	if (game.mechanic === "rouletteDozen") {
		const number = Math.floor(Math.random() * 37);
		const result = number === 0 ? "0" : String(Math.ceil(number / 12));
		const reveal = { number, color: number === 0 ? "green" : number % 2 === 0 ? "black" : "red" };
		return choice === result ? win(`Pocket ${number}! Your dozen hits.`, 3, reveal) : lose(`Pocket ${number}. Your dozen misses.`, reveal);
	}
	if (game.mechanic === "rollTotal") {
		const first = rollDie();
		const second = rollDie();
		const total = first + second;
		const waysToRoll = [0, 0, 1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1][total];
		const multiplier = Math.max(2, Math.floor(32.4 / waysToRoll));
		const reveal = { values: [first, second] };
		return choice === String(total) ? win(`${first} + ${second} = ${total}! Exact total.`, multiplier, reveal) : lose(`${first} + ${second} = ${total}.`, reveal);
	}
	if (game.mechanic === "crownAnchor") {
		const symbols = ["👑", "⚓", "♥", "♦", "♠", "♣"];
		const rolls = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
		const matches = rolls.filter((symbol) => symbol === choice).length;
		const multiplier = matches === 3 ? 12 : matches === 2 ? 2.5 : matches === 1 ? 1.2 : 0;
		const message = `${rolls.join("  ")} · ${matches ? `${matches} match${matches === 1 ? "" : "es"}!` : "No matches."}`;
		return { multiplier, message, reveal: { symbols: rolls } };
	}
	if (game.mechanic === "race4") {
		const order = [1, 2, 3, 4].sort(() => Math.random() - .5);
		const winner = String(order[0]);
		const reveal = { winner, order };
		return choice === winner ? win(`Horse ${winner} wins the race!`, 4, reveal) : lose(`Horse ${winner} takes the finish.`, reveal);
	}
	if (game.mechanic === "skillAim") {
		const accuracy = skillData.accuracy ?? 1;
		const multiplier = accuracy <= .1 ? 8 : accuracy <= .22 ? 4 : accuracy <= .4 ? 2 : 0;
		const reveal = { accuracy, ring: accuracy <= .1 ? "bullseye" : "outer" };
		return multiplier ? win(`Your shot landed ${Math.round(accuracy * 100)}% from center!`, multiplier, reveal) : lose(`Your shot landed ${Math.round(accuracy * 100)}% from center.`, reveal);
	}
	if (game.mechanic === "skillTiming") {
		const accuracy = skillData.accuracy ?? 1;
		const multiplier = accuracy <= .08 ? 5 : accuracy <= .2 ? 2.5 : accuracy <= .38 ? 1.5 : 0;
		const reveal = { accuracy };
		return multiplier ? win(`You stopped ${Math.round(accuracy * 100)}% from the mark!`, multiplier, reveal) : lose(`You stopped ${Math.round(accuracy * 100)}% from the mark.`, reveal);
	}
	if (game.mechanic === "flip") {
		const result = Math.random() < .5 ? "heads" : "tails";
		return choice === result ? win(`It's ${result}!`, 2, { side: result }) : lose(`It's ${result}!`, { side: result });
	}
	if (game.mechanic === "parity") {
		const roll = rollDie();
		const result = roll % 2 === 0 ? "even" : "odd";
		return choice === result ? win(`You rolled a ${roll}, ${result}!`, 2, { values: [roll] }) : lose(`You rolled a ${roll}, ${result}!`, { values: [roll] });
	}
	if (game.mechanic === "highlow") {
		const roll = Math.floor(Math.random() * 100) + 1;
		const result = roll > 50 ? "high" : "low";
		return choice === result ? win(`The number was ${roll}, ${result}!`, 2, { number: roll }) : lose(`The number was ${roll}, ${result}!`, { number: roll });
	}
	if (game.mechanic === "number6") {
		const roll = rollDie();
		return choice === String(roll) ? win(`You picked it! The die shows ${roll}.`, 6, { values: [roll] }) : lose(`The die shows ${roll}.`, { values: [roll] });
	}
	if (game.mechanic === "wheelColor" || game.mechanic === "wheelParity" || game.mechanic === "wheelGreen") {
		const roll = Math.floor(Math.random() * 37);
		const color = roll === 0 ? "green" : roll % 2 === 0 ? "black" : "red";
		const result = game.mechanic === "wheelColor" ? color : game.mechanic === "wheelParity" ? roll === 0 ? "zero" : roll % 2 === 0 ? "even" : "odd" : color === "green" ? "green" : "color";
		const multiplier = game.mechanic === "wheelGreen" && result === "green" ? 30 : 2;
		const reveal = { number: roll, color };
		return choice === result ? win(`The wheel lands on ${roll} ${color}!`, multiplier, reveal) : lose(`The wheel lands on ${roll} ${color}!`, reveal);
	}
	if (game.mechanic === "slots") {
		const symbols = ["🍋", "🍒", "✦", "🍀", "🔔"];
		const reels = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
		const matches = reels.filter((symbol) => symbol === reels[0]).length;
		const multiplier = matches === 3 ? 12 : matches === 2 ? 2 : 0;
		return { multiplier, message: `${reels.join("  ")} ${multiplier ? `${matches === 3 ? "Triple match" : "A pair"}!` : "No match this time."}`, reveal: { reels } };
	}
	if (game.mechanic === "pick3") {
		const result = ["left", "middle", "right"][Math.floor(Math.random() * 3)];
		return choice === result ? win(`The prize was hiding ${result}!`, 3, { position: result }) : lose(`The prize was hiding ${result}.`, { position: result });
	}
	if (game.mechanic === "cardHigh" || game.mechanic === "faceCard") {
		const rank = Math.floor(Math.random() * 13) + 2;
		const rankName = ({ 11: "Jack", 12: "Queen", 13: "King", 14: "Ace" })[rank] || rank;
		const suit = [{ name: "hearts", icon: "♥", color: "red" }, { name: "diamonds", icon: "♦", color: "red" }, { name: "clubs", icon: "♣", color: "black" }, { name: "spades", icon: "♠", color: "black" }][Math.floor(Math.random() * 4)];
		const card = { rank: rankName, suit: suit.icon, suitName: suit.name, color: suit.color };
		const result = game.mechanic === "cardHigh" ? rank >= 8 ? "high" : "low" : rank >= 11 ? "face" : "number";
		const multiplier = game.mechanic === "faceCard" && result === "face" ? 4 : game.mechanic === "faceCard" ? 1.2 : 2;
		return choice === result ? win(`You drew the ${rankName} of ${suit.name}!`, multiplier, { card }) : lose(`You drew the ${rankName} of ${suit.name}.`, { card });
	}
	if (game.mechanic === "cardSuit") {
		const suits = ["hearts", "diamonds", "clubs", "spades"];
		const result = suits[Math.floor(Math.random() * suits.length)];
		const rank = Math.floor(Math.random() * 13) + 2;
		const rankName = ({ 11: "Jack", 12: "Queen", 13: "King", 14: "Ace" })[rank] || rank;
		const suit = { hearts: { icon: "♥", color: "red" }, diamonds: { icon: "♦", color: "red" }, clubs: { icon: "♣", color: "black" }, spades: { icon: "♠", color: "black" } }[result];
		const card = { rank: rankName, suit: suit.icon, suitName: result, color: suit.color };
		return choice === result ? win(`You drew the ${rankName} of ${result}!`, 4, { card }) : lose(`You drew the ${rankName} of ${result}.`, { card });
	}
	if (game.mechanic === "diceHigh") {
		const first = rollDie();
		const second = rollDie();
		const total = first + second;
		const result = total < 7 ? "low" : total > 7 ? "high" : "seven";
		return choice === result ? win(`You rolled ${first} + ${second} = ${total}!`, 2, { values: [first, second] }) : lose(`You rolled ${first} + ${second} = ${total}.`, { values: [first, second] });
	}
	if (game.mechanic === "doubles") {
		const first = rollDie();
		const second = rollDie();
		const result = first === second ? "pair" : "no-pair";
		const multiplier = result === "pair" ? 5 : 1.1;
		return choice === result ? win(`You rolled ${first} and ${second}: ${result === "pair" ? "a pair" : "no pair"}!`, multiplier, { values: [first, second] }) : lose(`You rolled ${first} and ${second}: ${result === "pair" ? "a pair" : "no pair"}.`, { values: [first, second] });
	}
	if (game.mechanic === "target") {
		const roll = Math.floor(Math.random() * 10) + 1;
		const result = roll === 1 ? "bullseye" : "outer";
		const reveal = { ring: result, number: roll };
		return choice === result ? win(roll === 1 ? "Bullseye! Right in the middle." : `The dart lands in the outer ring (${roll}).`, roll === 1 ? 8 : 1.1, reveal) : lose(roll === 1 ? "Bullseye! Right in the middle." : `The dart lands in the outer ring (${roll}).`, reveal);
	}
	if (game.mechanic === "color4") {
		const colors = ["red", "blue", "green", "gold"];
		const result = colors[Math.floor(Math.random() * colors.length)];
		return choice === result ? win(`The color is ${result}!`, 4, { color: result }) : lose(`The color is ${result}.`, { color: result });
	}
	return lose("No result this round. Try another game.");
}

function showResult(message, result) {
	$("#game-result").textContent = message;
	$("#game-result").className = `game-result ${result}`;
}

function buyHouse(id) {
	const house = houses.find((entry) => entry.id === id);
	if (!house || state.ownedHomes.includes(id) || state.balance < house.price) return;
	state.balance -= house.price;
	state.ownedHomes.push(id);
	if (!state.currentHome) state.currentHome = id;
	saveState();
	render();
	showToast("A place of your own", `${house.name} is yours. Here's to making it home.`, "⌂");
}

function claimHome() {
	if (state.ownedHomes.includes("cottage")) {
		showToast("Your first place", "Your Meadow Cottage is ready whenever you need a little reset.", "⌂");
		return;
	}
	state.ownedHomes.push("cottage");
	state.currentHome = "cottage";
	saveState();
	render();
	showToast("Home, sweet home", "Meadow Cottage is all yours. Your next adventure starts at home.", "⌂");
}

function showToast(title, message, icon = "✦") {
	$("#toast-title").textContent = title;
	$("#toast-message").textContent = message;
	$("#toast-mark").textContent = icon;
	$("#toast-dialog").showModal();
}

function buyKeepsake(id) {
	const item = keepsakes.find((entry) => entry.id === id);
	if (!item || state.ownedItems.includes(id) || state.balance < item.price) return;
	state.balance -= item.price;
	state.ownedItems.push(id);
	saveState();
	render();
	showToast("A lucky little find", `${item.name} is yours. ${item.detail}`, item.icon);
}

function startJob(id) {
	const job = dailyJobs.find((entry) => entry.id === id);
	if (!job || state.claimedJobs.includes(id)) return;
	startActivity(job.minigameId, "job", id);
}

function startActivity(id, mode, jobId = null) {
	if ($("#activity-dialog").open) return;
	const game = minigames.find((entry) => entry.id === id);
	const job = mode === "job" ? dailyJobs.find((entry) => entry.id === jobId) : null;
	if (!game || mode === "job" && (!job || state.claimedJobs.includes(job.id))) return;
	if (mode === "arcade" && state.balance < game.entry) {
		showToast("A few more coins", `${game.name} costs ${formatCoins(game.entry)} coins to enter.`, game.icon);
		return;
	}
	if (mode === "arcade") state.balance -= game.entry;
	activityRound = { game, mode, job, jobId, score: 0, step: 0, total: game.rounds, phase: "ready", timeLeft: 8 };
	if (mode === "arcade") {
		state.totalWon = Math.max(0, state.totalWon);
		saveState();
		render();
	}
	$("#activity-kicker").textContent = mode === "job" ? `TODAY'S SHIFT · ${job.title.toUpperCase()}` : "BLACK JACK · PAID ARCADE";
	$("#activity-title").textContent = mode === "job" ? job.title : game.name;
	$("#activity-mode").textContent = mode === "job" ? `SHIFT PAY · UP TO ${formatCoins(job.reward)}` : `ENTRY PAID · ${formatCoins(game.entry)}`;
	$("#activity-balance").textContent = formatCoins(state.balance);
	$("#activity-score-label").textContent = mode === "job" ? "SHIFT SCORE" : "ARCADE SCORE";
	$("#activity-score").textContent = "0";
	$("#activity-progress-label").textContent = `0 OF ${game.rounds}`;
	$("#activity-progress-fill").style.width = "0%";
	$("#activity-feedback").textContent = "";
	$("#activity-reward-preview").textContent = mode === "job" ? `Up to ${formatCoins(job.reward)} coins for a perfect shift.` : `Entry paid: ${formatCoins(game.entry)} coins.`;
	$("#activity-dialog").showModal();
	if (game.type === "memory") {
		const choices = ["☕", "🍵", "🥐", "🧁"];
		activityRound.sequence = Array.from({ length: game.rounds }, () => choices[Math.floor(Math.random() * choices.length)]);
		activityRound.phase = "memorize";
		renderMemoryActivity();
		activityRevealTimer = window.setTimeout(() => {
			if (!activityRound || !$("#activity-dialog").open) return;
			activityRound.phase = "answer";
			renderMemoryActivity();
		}, 1500);
	} else if (game.type === "sorting") {
		const parcels = [{ icon: "🌷", bin: "garden" }, { icon: "📚", bin: "bookshop" }, { icon: "🥐", bin: "cafe" }];
		activityRound.sequence = Array.from({ length: game.rounds }, () => parcels[Math.floor(Math.random() * parcels.length)]);
		activityRound.phase = "answer";
		renderSortingActivity();
	} else {
		activityRound.phase = "catch";
		renderCatchActivity();
		activityTimer = window.setInterval(() => {
			if (!activityRound || activityRound.phase !== "catch") return;
			activityRound.timeLeft -= 1;
			$("#activity-progress-label").textContent = `${activityRound.timeLeft} SECONDS LEFT`;
			if (activityRound.timeLeft <= 0) finishActivity();
		}, 1000);
	}
}

function updateActivityProgress() {
	if (!activityRound) return;
	$("#activity-score").textContent = activityRound.score;
	$("#activity-progress-fill").style.width = `${activityRound.score / activityRound.total * 100}%`;
	if (activityRound.game.type !== "catch") $("#activity-progress-label").textContent = `${activityRound.step} OF ${activityRound.total}`;
}

function renderMemoryActivity() {
	if (!activityRound) return;
	const game = activityRound.game;
	$("#activity-instructions").textContent = activityRound.phase === "memorize" ? "Memorize the order. It will disappear in a moment." : `Order ${activityRound.step + 1}: choose the next item.`;
	if (activityRound.phase === "memorize") {
		$("#activity-board").innerHTML = `<div class="memory-sequence">${activityRound.sequence.map((icon) => `<span>${icon}</span>`).join("")}</div>`;
		$("#activity-feedback").textContent = "Watch carefully…";
		return;
	}
	$("#activity-feedback").textContent = "Repeat the order from memory.";
	$("#activity-board").innerHTML = `<div class="activity-choice-grid">${["☕", "🍵", "🥐", "🧁"].map((icon) => `<button type="button" class="activity-choice" data-memory-choice="${icon}">${icon}</button>`).join("")}</div>`;
	$("#activity-board").querySelectorAll("[data-memory-choice]").forEach((button) => button.addEventListener("click", () => {
		if (!activityRound || activityRound.phase !== "answer") return;
		if (button.dataset.memoryChoice === activityRound.sequence[activityRound.step]) {
			activityRound.score += 1;
			$("#activity-feedback").textContent = "Right order! Keep going.";
		} else $("#activity-feedback").textContent = "Not that one. Try to remember the next spot.";
		activityRound.step += 1;
		updateActivityProgress();
		if (activityRound.step >= game.rounds) finishActivity();
	}));
	updateActivityProgress();
}

function renderSortingActivity() {
	if (!activityRound) return;
	const parcel = activityRound.sequence[activityRound.step];
	$("#activity-instructions").textContent = `Delivery ${activityRound.step + 1} of ${activityRound.total}: choose the right basket.`;
	$("#activity-feedback").textContent = "Sort all five packages to finish the route.";
	$("#activity-board").innerHTML = `<div class="parcel-prompt"><span>${parcel.icon}</span><strong>Where does it go?</strong></div><div class="activity-choice-grid sorting-choice-grid"><button type="button" class="activity-choice" data-bin="garden">🌱<small>Garden</small></button><button type="button" class="activity-choice" data-bin="bookshop">📚<small>Bookshop</small></button><button type="button" class="activity-choice" data-bin="cafe">☕<small>Cafe</small></button></div>`;
	$("#activity-board").querySelectorAll("[data-bin]").forEach((button) => button.addEventListener("click", () => {
		if (!activityRound || activityRound.phase !== "answer") return;
		if (button.dataset.bin === parcel.bin) {
			activityRound.score += 1;
			$("#activity-feedback").textContent = "Correct delivery! On to the next.";
		} else $("#activity-feedback").textContent = `Wrong basket. That ${parcel.icon} parcel belonged elsewhere.`;
		activityRound.step += 1;
		updateActivityProgress();
		if (activityRound.step >= activityRound.total) finishActivity();
		else renderSortingActivity();
	}));
	updateActivityProgress();
}

function renderCatchActivity() {
	if (!activityRound) return;
	$("#activity-instructions").textContent = "Catch six fireflies before the eight-second timer runs out.";
	$("#activity-feedback").textContent = "They move after every catch!";
	$("#activity-board").innerHTML = `<div class="firefly-field"><span class="firefly-glow">✦</span><button type="button" class="firefly-target" style="--firefly-x:${15 + Math.random() * 70}%;--firefly-y:${15 + Math.random() * 62}%" aria-label="Catch firefly">✨</button></div>`;
	$("#activity-board").querySelector(".firefly-target").addEventListener("click", () => {
		if (!activityRound || activityRound.phase !== "catch") return;
		activityRound.score += 1;
		activityRound.step = activityRound.score;
		$("#activity-feedback").textContent = "Caught it! Keep going.";
		updateActivityProgress();
		if (activityRound.score >= activityRound.total) finishActivity();
		else renderCatchActivity();
	});
	$("#activity-progress-label").textContent = `${activityRound.timeLeft} SECONDS LEFT`;
	updateActivityProgress();
}

function finishActivity() {
	if (!activityRound || activityRound.phase === "complete") return;
	if (activityTimer) window.clearInterval(activityTimer);
	if (activityRevealTimer) window.clearTimeout(activityRevealTimer);
	activityTimer = null;
	activityRevealTimer = null;
	const game = activityRound.game;
	const score = activityRound.score;
	const accuracy = score / game.rounds;
	let payout;
	let summary;
	if (activityRound.mode === "job") {
		const job = dailyJobs.find((entry) => entry.id === activityRound.jobId);
		payout = Math.floor(job.reward * (0.35 + accuracy * 0.65));
		state.claimedJobs.push(job.id);
		summary = `${job.title} complete: ${score}/${game.rounds} correct. Shift pay: ${formatCoins(payout)} coins.`;
	} else if (game.id === "cafe-memory") {
		payout = score === 4 ? 130 : score >= 3 ? 65 : 0;
		summary = `Order recall: ${score}/${game.rounds}. ${payout ? `Arcade payout: ${formatCoins(payout)} coins.` : "No payout this round."}`;
	} else if (game.id === "parcel-sort") {
		payout = score === 5 ? 190 : score >= 4 ? 85 : 0;
		summary = `Route sorted: ${score}/${game.rounds}. ${payout ? `Arcade payout: ${formatCoins(payout)} coins.` : "No payout this round."}`;
	} else {
		payout = score >= 6 ? 120 : score >= 4 ? 60 : 0;
		summary = `Fireflies caught: ${score}/${game.rounds}. ${payout ? `Arcade payout: ${formatCoins(payout)} coins.` : "No payout this round."}`;
	}
	state.balance += payout;
	const gain = activityRound.mode === "arcade" ? payout - game.entry : payout;
	state.totalWon += Math.max(0, gain);
	state.bestRun = Math.max(state.bestRun, gain);
	activityRound.phase = "complete";
	saveState();
	render();
	$("#activity-balance").textContent = formatCoins(state.balance);
	$("#activity-feedback").textContent = summary;
	$("#activity-score").textContent = `${score}/${game.rounds}`;
	$("#activity-progress-fill").style.width = `${accuracy * 100}%`;
	$("#activity-progress-label").textContent = activityRound.mode === "job" ? "SHIFT COMPLETE" : `${formatCoins(payout)} COINS PAID OUT`;
	$("#activity-reward-preview").textContent = activityRound.mode === "job" ? `Shift complete · ${formatCoins(payout)} coins earned` : `Entry ${formatCoins(game.entry)} · payout ${formatCoins(payout)} · net ${payout - game.entry >= 0 ? "+" : ""}${formatCoins(payout - game.entry)}`;
	$("#activity-board").innerHTML = `<div class="activity-finish"><span>${accuracy === 1 ? "✦" : "✓"}</span><strong>${accuracy === 1 ? "Perfect run" : "Nice work"}</strong></div>`;
	if (activityRound.mode === "arcade") {
		$("#activity-controls").innerHTML = `<button type="button" class="activity-replay" id="activity-replay">Play again · ${formatCoins(game.entry)} coins</button>`;
		$("#activity-replay").addEventListener("click", () => {
			$("#activity-dialog").close();
			startActivity(game.id, "arcade");
		});
	} else {
		$("#activity-controls").innerHTML = `<button type="button" class="activity-replay" id="activity-done">Back to job board</button>`;
		$("#activity-done").addEventListener("click", () => $("#activity-dialog").close());
	}
}

function handleInvestment(id) {
	const project = investmentProjects.find((entry) => entry.id === id);
	if (!project) return;
	const existing = state.investments.find((entry) => entry.projectId === id);
	if (existing) {
		if (existing.maturesAt > Date.now()) return;
		state.investments = state.investments.filter((entry) => entry !== existing);
		const won = existing.outcomeRoll < project.winChance;
		const changeRate = won ? project.winRate : -project.lossRate;
		const payout = Math.floor(existing.principal * (1 + changeRate));
		state.balance += payout;
		saveState();
		render();
		showToast(won ? "Your project paid off" : "A project setback", won ? `${project.name} returned ${formatCoins(payout)} coins, including ${formatCoins(payout - existing.principal)} in growth.` : `${project.name} returned ${formatCoins(payout)} of your ${formatCoins(existing.principal)}-coin stake. The rest was lost.`, project.icon);
		return;
	}
	if (state.balance < project.minimum) return;
	state.balance -= project.minimum;
	state.investments.push({ projectId: id, principal: project.minimum, maturesAt: Date.now() + project.duration, outcomeRoll: Math.random() });
	saveState();
	render();
	showToast("A little plan is growing", `${project.name} is underway. It has a ${Math.round(project.winChance * 100)}% chance to return ${formatCoins(Math.floor(project.minimum * (1 + project.winRate)))} coins, or a ${Math.round((1 - project.winChance) * 100)}% chance to return ${formatCoins(Math.floor(project.minimum * (1 - project.lossRate)))}.`, project.icon);
}

function resetGame() {
	if (!window.confirm("Start fresh with 500 pretend coins? This clears all saved progress.")) return;
	state = defaultState();
	saveState();
	render();
	setView("play");
}

document.querySelectorAll(".nav-link").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
document.querySelectorAll(".casino-nav-link").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
$("#browse-floor").addEventListener("click", () => $("#games-grid").scrollIntoView({ behavior: "smooth", block: "start" }));
$("#exit-game").addEventListener("click", () => {
	if (isPlaying) return;
	tableRound = null;
	$("#game-dialog").close();
});
$("#activity-exit").addEventListener("click", () => $("#activity-dialog").close());
$("#activity-dialog").addEventListener("close", () => {
	if (activityTimer) window.clearInterval(activityTimer);
	if (activityRevealTimer) window.clearTimeout(activityRevealTimer);
	activityTimer = null;
	activityRevealTimer = null;
});
$("#game-dialog").addEventListener("cancel", (event) => {
	if (isPlaying) event.preventDefault();
	else tableRound = null;
});
$("#game-search").addEventListener("input", renderGameCatalog);
$("#game-search").addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		event.currentTarget.value = "";
		renderGameCatalog();
	}
});
document.addEventListener("keydown", (event) => {
	if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
		event.preventDefault();
		$("#game-search").focus();
	}
});
document.querySelectorAll("[data-wager]").forEach((button) => button.addEventListener("click", () => {
	$("#wager").value = button.dataset.wager === "half" ? Math.floor(state.balance / 2 / 10) * 10 : Math.min(Number(button.dataset.wager), state.balance);
}));
$("#claim-home").addEventListener("click", claimHome);
$("#home-picker").addEventListener("change", (event) => {
	decoratingHomeId = event.currentTarget.value;
	selectedKeepsakeId = null;
	renderHomeDecorator();
});
$("#upgrade-home-room").addEventListener("click", upgradeHomeRoom);
$("#reset-game").addEventListener("click", resetGame);
$("#toast-close").addEventListener("click", () => $("#toast-dialog").close());
$("#wager").addEventListener("input", (event) => {
	const wager = Number(event.target.value);
	const valid = wager >= 10 && wager <= state.balance;
	document.querySelectorAll(".choice-button, .skill-action, .aim-arena").forEach((button) => { button.disabled = !valid || isPlaying; });
});

renderGameCatalog();
render();
window.setInterval(updateInvestmentButtons, 1000);

