
var game;
var player;
var platforms;
var items;
var dvdLogo;
var cursors;
var jumpButton;
var text;
var winningMessage;
var deathMessage;
var levelMessage;
var controlsMessage;
var restartKey;
var currentScore = 0;
var levelScore = 0;
var currentLevel = 0;
var won = false;
var hasDied = false;
var levelComplete = false;
var hazards = [];
var hazardStartScale = 0.02;
var hazardMaxScale = 0.12;
var hazardGrowDuration = 20;
var deathRarity = "";
var touchControls = { left: false, right: false, jump: false };

document.querySelectorAll('[data-touch-control]').forEach(function(button) {
    var control = button.getAttribute('data-touch-control');
    var release = function(event) {
        if (event) event.preventDefault();
        touchControls[control] = false;
        button.classList.remove('pressed');
    };
    button.addEventListener('pointerdown', function(event) {
        event.preventDefault();
        touchControls[control] = true;
        button.classList.add('pressed');
        if (button.setPointerCapture && event.isTrusted) button.setPointerCapture(event.pointerId);
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
});

window.addEventListener('blur', function() {
    touchControls.left = false;
    touchControls.right = false;
    touchControls.jump = false;
    document.querySelectorAll('[data-touch-control]').forEach(function(button) {
        button.classList.remove('pressed');
    });
});

var levels = [
    {
        name: "Sunny Meadow",
        goal: 40,
        background: "#5db1ad",
        hazardSpeed: 260,
        hazardCount: 1,
        star: { x: 1000, y: 10 },
        platforms: [
            [0, 700, "platform"], [240, 630, "platform"], [480, 560, "platform2"],
            [720, 490, "platform"], [960, 420, "platform2"], [720, 350, "platform"],
            [480, 280, "platform2"], [240, 220, "platform"], [480, 170, "platform2"],
            [720, 120, "platform"], [960, 70, "platform2"]
        ]
    },
    {
        name: "Crystal Cavern",
        goal: 50,
        background: "#473b70",
        hazardSpeed: 330,
        hazardCount: 2,
        star: { x: 1000, y: 40 },
        platforms: [
            [0, 700, "platform2"], [290, 640, "platform"], [590, 580, "platform2"],
            [890, 520, "platform"], [690, 450, "platform2"], [390, 380, "platform"],
            [90, 310, "platform2"], [340, 240, "platform"], [640, 170, "platform2"],
            [940, 100, "platform"]
        ]
    },
    {
        name: "Cloudtop Run",
        goal: 60,
        background: "#286b91",
        hazardSpeed: 390,
        hazardCount: 3,
        star: { x: 930, y: 0 },
        platforms: [
            [0, 700, "platform"], [180, 640, "platform2"], [420, 580, "platform"],
            [680, 520, "platform2"], [920, 460, "platform"], [760, 400, "platform2"],
            [520, 340, "platform"], [280, 280, "platform"], [80, 220, "platform2"],
            [320, 160, "platform"], [600, 100, "platform2"], [880, 60, "platform"]
        ]
    },
    {
        name: "Lava Foundry",
        goal: 70,
        background: "#9b493b",
        hazardSpeed: 340,
        hazardCount: 2,
        star: { x: 1000, y: 40 },
        platforms: [
            [0, 700, "platform2"], [260, 640, "platform"], [520, 580, "platform2"],
            [780, 520, "platform"], [960, 460, "platform2"], [700, 400, "platform"],
            [440, 340, "platform2"], [180, 280, "platform"], [400, 220, "platform2"],
            [660, 160, "platform"], [920, 100, "platform2"]
        ]
    },
    {
        name: "Frostbite Peak",
        goal: 80,
        background: "#497d9c",
        hazardSpeed: 370,
        hazardCount: 3,
        star: { x: 100, y: 0 },
        platforms: [
            [0, 700, "platform"], [120, 620, "platform2"], [360, 550, "platform"],
            [600, 480, "platform"], [840, 410, "platform2"], [960, 340, "platform"],
            [760, 270, "platform2"], [520, 200, "platform"], [280, 130, "platform2"],
            [40, 60, "platform"]
        ]
    },
    {
        name: "Neon Skyway",
        goal: 90,
        background: "#293b75",
        hazardSpeed: 400,
        hazardCount: 4,
        star: { x: 750, y: 40 },
        platforms: [
            [0, 700, "platform2"], [300, 640, "platform2"], [600, 580, "platform"],
            [900, 520, "platform2"], [700, 460, "platform"], [400, 400, "platform2"],
            [100, 340, "platform"], [350, 280, "platform2"], [650, 220, "platform"],
            [950, 160, "platform2"], [700, 100, "platform"]
        ]
    }
];

// The original messages are the common pool.
var deathMessages = [
    "chicken tenders ohh so slender i wonder what the gender but i put it in my blender",
    "Womp Womp!",
    "Womp Womp!",
    "Womp Womp!",
    "Womp Womp!",
    "Womp Womp!",
    "Womp Womp!",
    "Womp Womp!",
    "Womp Womp!",
    "Womp Womp!",
    "Womp Womp!",
    "Womp Womp!",
    "Womp Womp!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",

    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",

    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "Looks like you need to practice!",
    "That DVD logo is sneaky!",


    "That DVD logo is sneaky!",
    "That DVD logo is sneaky!",
    "That DVD logo is sneaky!",

    "That DVD logo is sneaky!",
    "That DVD logo is sneaky!",

    "That DVD logo is sneaky!",
    "That DVD logo is sneaky!",
    "That DVD logo is sneaky!",
    "That DVD logo is sneaky!",
    "That DVD logo is sneaky!",
    "That DVD logo is sneaky!",

    "That DVD logo is sneaky!",
    "That DVD logo is sneaky!",
    "That DVD logo is sneaky!",
    "That DVD logo is sneaky!",

    "Dora says you need to get better. can you get better",
    "Dora says you need to get better. can you get better",
    "Dora says you need to get better. can you get better",
    "Dora says you need to get better. can you get better",
    "Dora says you need to get better. can you get better",
    "Dora says you need to get better. can you get better",
    "Dora says you need to get better. can you get better",
    "Dora says you need to get better. can you get better",

    "Dora says you need to get better. can you get better",
    "Dora says you need to get better. can you get better",
    "More lost then the kids in my basement",
    "More lost then the kids in my basement",
    "More lost then the kids in my basement",
    "More lost then the kids in my basement",
    "More lost then the kids in my basement",
    "More lost then the kids in my basement",
    "More lost then the kids in my basement",
    "More lost then the kids in my basement",
    "More lost then the kids in my basement",
    "More lost then the kids in my basement",
    "More lost then the kids in my basement",
    "atempt 8478744934" ,
    "atempt 8478744934" ,
    "atempt 8478744934" ,
    "atempt 8478744934" ,
    "atempt 8478744934" ,

    "rarer than you winning",
    "Might as well watch it insted of wasting time",
    "Might as well watch it insted of wasting time",
    "Might as well watch it insted of wasting time",


    "Might as well watch it insted of wasting time",
    "I am the globaglob shobawobasibiglob ",
    "I am the globaglob shobawobasibiglob ",
    "I am the globaglob shobawobasibiglob ",
    "I am the globaglob shobawobasibiglob ",
    "I am the globaglob shobawobasibiglob ",
    "I am the globaglob shobawobasibiglob ",
    "I am the globaglob shobawobasibiglob ",
    "I am the globaglob shobawobasibiglob ",
    "I am the globaglob shobawobasibiglob ",
    "I am the globaglob shobawobasibiglob ",
    "I am the globaglob shobawobasibiglob ",
    "I am the globaglob shobawobasibiglob ",
    "I am the globaglob shobawobasibiglob ",
    "is this fun",
    "is this fun",
    "is this fun",
    "is this fun",
    "is this fun",
    "is this fun",
    "is this fun",
    "is this fun",
    "is this fun",
    "is this fun",
    "is this fun",
    "is this fun",
    "is this fun",
    "is this fun",
    "is this fun",
    "is this fun",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",

    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",


    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "more lost than a kid eating lunchly listening to talk tauh and the thick of it",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "i bet 50 million on your adoption and lost 50 mill that day",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "Gordon Ramsey",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LOST IN A 7ELEVEN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",

    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",
    "LONG BEFORE TIME YOU DIDN'T WIN",


    // Add more death messages as needed...
];

var rareDeathMessages = [
    { rarity: "UNCOMMON", chance: 17, color: "#8cff9b", messages: [
        "The DVD has your number!",
        "One more jump would have done it!",
        "That logo has excellent aim."
    ] },
    { rarity: "RARE", chance: 6, color: "#63c9ff", messages: [
        "Rare replay! The DVD wins this round.",
        "A one-in-a-million bonk!",
        "The logo bounced straight into legend."
    ] },
    { rarity: "EPIC", chance: 1.8, color: "#d58cff", messages: [
        "EPIC WIPEOUT! The crowd goes wild.",
        "The DVD found its perfect corner.",
        "That was an all-time bounce."
    ] },
    { rarity: "LEGENDARY", chance: 0.2, color: "#ffd85c", messages: [
        "LEGENDARY BONK! A tale for the ages.",
        "The golden DVD bounce has been witnessed!",
        "One in five hundred! The logo is unstoppable."
    ] }
];

function chooseDeathMessage() {
    var roll = Math.random() * 100;
    var rarityStart = 75;
    if (roll < rarityStart) {
        return {
            rarity: "COMMON",
            color: "#ffffff",
            message: deathMessages[Math.floor(Math.random() * deathMessages.length)]
        };
    }

    for (var i = 0; i < rareDeathMessages.length; i++) {
        var rarity = rareDeathMessages[i];
        rarityStart += rarity.chance;
        if (roll < rarityStart) {
            return {
                rarity: rarity.rarity,
                color: rarity.color,
                message: rarity.messages[Math.floor(Math.random() * rarity.messages.length)]
            };
        }
    }

    var lastRarity = rareDeathMessages[rareDeathMessages.length - 1];
    return {
        rarity: lastRarity.rarity,
        color: lastRarity.color,
        message: lastRarity.messages[Math.floor(Math.random() * lastRarity.messages.length)]
    };
}

function addPlatforms() {
    platforms = game.add.physicsGroup();
    levels[currentLevel].platforms.forEach(function(platformData) {
        platforms.create(platformData[0], platformData[1], platformData[2]);
    });
    platforms.setAll('body.immovable', true);
}

function addItems() {
    items = game.add.physicsGroup();

    platforms.forEach(function(platform) {
        createItem(platform.x + 30, platform.y - 60, 'coin');
        createItem(platform.x + platform.width - 30, platform.y - 60, 'poison');
    });

    var star = levels[currentLevel].star;
    createItem(star.x, star.y, 'star');
}

function createItem(left, top, image) {
    var item = items.create(left, top, image);
    item.animations.add('spin');
    item.animations.play('spin', 10, true);
}

function createDVDLogo(x, y, speed, direction) {
    var logo = game.add.sprite(x, y, 'dvdLogo');
    logo.scale.set(hazardStartScale);
    game.physics.arcade.enable(logo);
    logo.body.velocity.x = speed * direction;
    logo.body.velocity.y = speed * 0.57;
    logo.body.bounce.set(1);
    logo.body.collideWorldBounds = true;
    logo.growthTime = 0;
    hazards.push(logo);
}

function addHazards() {
    hazards = [];
    var level = levels[currentLevel];
    for (var i = 0; i < level.hazardCount; i++) {
        createDVDLogo(250 + i * 300, 70 + i * 65, level.hazardSpeed, i % 2 === 0 ? 1 : -1);
    }
}

function itemHandler(player, item) {
    item.kill();
    switch (item.key) {
        case 'coin':
            currentScore += 10;
            levelScore += 10;
            break;
        case 'poison':
            currentScore -= 10;
            levelScore = Math.max(0, levelScore - 10);
            break;
        case 'star':
            currentScore += 25;
            levelScore += 25;
            break;
    }

    if (levelScore >= levels[currentLevel].goal) {
        levelComplete = true;
    }
}

function dvdLogoHandler() {
    if (!hasDied && !won) {
        hasDied = true;
        player.body.velocity.set(0);
        player.body.allowGravity = false;
        var result = chooseDeathMessage();
        deathRarity = result.rarity;
        deathMessage.fill = result.color;
        deathMessage.text = result.rarity + "!\n" + result.message + "\nPress R to try again.";
        deathMessage.visible = true;
        controlsMessage.visible = false;
    }
}

function clearLevel() {
    platforms.destroy(true);
    items.destroy(true);
    hazards.forEach(function(hazard) {
        hazard.destroy();
    });
    hazards = [];
}

function loadLevel() {
    var level = levels[currentLevel];
    game.stage.backgroundColor = level.background;
    levelScore = 0;
    levelComplete = false;
    player.reset(50, 600);
    player.body.allowGravity = true;
    player.body.velocity.set(0);
    addPlatforms();
    addItems();
    addHazards();
    winningMessage.text = "";
    deathMessage.visible = false;
    controlsMessage.visible = true;
    updateHud();
}

function updateHud() {
    var level = levels[currentLevel];
    text.text = "SCORE: " + currentScore + "    LEVEL: " + (currentLevel + 1) + "/" + levels.length;
    levelMessage.text = level.name + "  |  Goal: " + levelScore + "/" + level.goal;
}

function updatePauseButton(button) {
    button.textContent = game.paused ? "Resume" : "Pause";
    button.setAttribute('aria-pressed', game.paused ? "true" : "false");
}

function restartGame() {
    game.paused = false;
    clearLevel();
    currentScore = 0;
    currentLevel = 0;
    won = false;
    hasDied = false;
    loadLevel();
}

function advanceLevel() {
    if (currentLevel === levels.length - 1) {
        won = true;
        player.body.velocity.set(0);
        player.body.allowGravity = false;
        winningMessage.text = "YOU WIN! Final score: " + currentScore + "\nPress R to play again";
        controlsMessage.visible = false;
        return;
    }

    clearLevel();
    currentLevel += 1;
    loadLevel();
}

window.onload = function () {
    game = new Phaser.Game(1200, 800, Phaser.AUTO, 'game-canvas', { preload: preload, create: create, update: update });

    function preload() {
        game.stage.backgroundColor = levels[0].background;
        game.load.image('platform', 'platform_1.png');
        game.load.image('platform2', 'platform_2.png');
        game.load.spritesheet('player', 'chalkers.png', 48, 62);
        game.load.spritesheet('coin', 'coin.png', 36, 44);
        game.load.spritesheet('poison', 'poison.png', 32, 32);
        game.load.spritesheet('star', 'star.png', 32, 32);
        game.load.image('dvdLogo', 'DVD_VIDEO_logo.png');
    }

    function create() {
        var pauseButton = document.getElementById('pause-button');
        var restartButton = document.getElementById('restart-button');
        pauseButton.addEventListener('click', function() {
            game.paused = !game.paused;
            updatePauseButton(pauseButton);
        });
        restartButton.addEventListener('click', function() {
            restartGame();
            updatePauseButton(pauseButton);
        });

        player = game.add.sprite(50, 600, 'player');
        player.animations.add('walk');
        player.anchor.setTo(0.5, 1);
        game.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;
        player.body.gravity.y = 500;

        cursors = game.input.keyboard.createCursorKeys();
        jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        restartKey = game.input.keyboard.addKey(Phaser.Keyboard.R);
        text = game.add.text(16, 16, "", { font: "bold 24px Arial", fill: "white" });
        levelMessage = game.add.text(16, 50, "", { font: "bold 20px Arial", fill: "white" });
        controlsMessage = game.add.text(16, 770, "Move: arrows or A/D    Jump: Space or Up    Restart: R", {
            font: "bold 18px Arial",
            fill: "white"
        });
        winningMessage = game.add.text(game.world.centerX, 280, "", {
            font: "bold 42px Arial",
            fill: "white",
            align: "center",
            stroke: "#222222",
            strokeThickness: 5
        });
        winningMessage.anchor.setTo(0.5, 0.5);
        deathMessage = game.add.text(game.world.centerX, game.world.centerY, "", {
            font: "bold 34px Arial",
            fill: "white",
            align: "center",
            stroke: "#222222",
            strokeThickness: 5
        });
        deathMessage.anchor.setTo(0.5, 0.5);
        deathMessage.visible = false;

        loadLevel();
    }

    function update() {
        if ((hasDied || won) && restartKey.justDown) {
            restartGame();
            return;
        }
        if (hasDied || won) {
            return;
        }

        game.physics.arcade.collide(player, platforms);
        game.physics.arcade.overlap(player, items, itemHandler);
        hazards.forEach(function(hazard) {
            hazard.growthTime += game.time.physicsElapsed;
            var growth = Math.min(hazard.growthTime / hazardGrowDuration, 1);
            var scale = hazardStartScale + (hazardMaxScale - hazardStartScale) * growth;
            hazard.scale.set(scale);
            game.physics.arcade.overlap(player, hazard, dvdLogoHandler);
        });

        if (levelComplete) {
            advanceLevel();
            return;
        }

        player.body.velocity.x = 0;
        var movingLeft = cursors.left.isDown || game.input.keyboard.isDown(Phaser.Keyboard.A) || touchControls.left;
        var movingRight = cursors.right.isDown || game.input.keyboard.isDown(Phaser.Keyboard.D) || touchControls.right;
        var jumping = jumpButton.isDown || cursors.up.isDown || touchControls.jump;

        if (movingLeft) {
            player.body.velocity.x = -300;
            player.scale.x = -1;
            player.animations.play('walk', 10, true);
        } else if (movingRight) {
            player.body.velocity.x = 300;
            player.scale.x = 1;
            player.animations.play('walk', 10, true);
        } else {
            player.animations.stop();
        }

        if (jumping && player.body.touching.down) {
            player.body.velocity.y = -400;
        }

        updateHud();
    }
};
