// Variables that will allow us to know when the game starts or when there is a GAME OVER
var GAME_START = false;
var GAME_OVER = false;

// Game Size (mode portrait)
const width = 1080;
const height = 1775;

// Phaser
var game = new Phaser.Game(width, height, Phaser.AUTO, 'timberman');
game.transparent = true;

// We declare an object that will contain the states "load" and "main"
var gameState = {};
gameState.load = function() { };
gameState.main = function() { };

// Will contain the code that will load resources
gameState.load.prototype = {
	preload: function() {
        
		// Loading the background image
		game.load.image('background', 'img/background.png');
		// Loading Character - PNG and JSON
		game.load.atlas('man', 'img/man.png', 'data/man.json');
		// Tree
		game.load.image('trunk1', 'img/trunk1.png');
		game.load.image('trunk2', 'img/trunk2.png');
		game.load.image('branchLeft', 'img/branch1.png');
		game.load.image('branchRight', 'img/branch2.png');
		game.load.image('stump', 'img/stump.png');
		// Scoring figures
		game.load.atlas('numbers', 'img/numbers.png', 'data/numbers.json');
		// Time
		game.load.image('timeContainer', 'img/time-container.png');
		game.load.image('timeBar', 'img/time-bar.png');
		// Levels
		game.load.atlas('levelNumbers', 'img/levelNumbers.png', 'data/numbers.json');
		game.load.image('level', 'img/level.png');
		// Falls R.I.P.
		game.load.image('rip', 'img/rip.png');

		/**** SOUNDS *****/
		// Axe Blow
		game.load.audio('soundCut', ['sons/cut.mp3']);
		// Background Music
		game.load.audio('soundTheme', ['sons/theme.mp3']);
		// Death of Character
		game.load.audio('soundDeath', ['sons/death.wav']);
	},

	create: function() {
		game.state.start('main');
	}
};

// Will contain the heart of the game
gameState.main.prototype = {
	create: function() {
		// Physics
		game.physics.startSystem(Phaser.Physics.ARCADE);

		// We make the game resize according to the size of the screen (For PCs)
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.setShowAll();
		window.addEventListener('resize', function () {
			game.scale.refresh();
		});
		game.scale.refresh();

		// Creating the background in the Canvas
		this.background = game.add.sprite(0, 0, 'background');
		this.background.width = game.width;
		this.background.height = game.height;

		// ---- TREE
		// Stump
		this.stump = game.add.sprite(0, 0, 'stump');
		this.stump.x = 352;
		this.stump.y = 1394;
		// Construction of the tree
		this.HEIGHT_TRUNK = 243;
		this.constructTree();
		this.canCut = true;

		// ---- WOODCUTTER
		// Creation of the woodcutter
		this.man = game.add.sprite(0, 1070, 'man');
		// We add the animation of the breath (uses the JSON)
		this.man.animations.add('breath', [0,1]);
		// We add the animation of the cut (uses the JSON)
		this.man.animations.add('cut', [1,2,3,4]);
		// The animation is started with 3 frames per second and repeated in a loop
		this.man.animations.play('breath', 3, true);
		// Position of the woodcutter
		this.manPosition = 'left';

		// At the click, the function "listener ()"
		game.input.onDown.add(this.listener, this);

		// ---- SCORE
		this.currentScore = 0;
		// We create the sprite of the score
		var spriteScoreNumber = game.add.sprite(game.width / 2, 440, 'numbers');
		// We display the score at 0 by adding the JSON "number" to the animations of "spriteScoreNumber"
		spriteScoreNumber.animations.add('number');
		spriteScoreNumber.animations.frame = this.currentScore;
		// We center the score
		spriteScoreNumber.x -= spriteScoreNumber.width / 2;
		// "this.spritesScoreNumbers" will contain the sprites of the digits that make up the score
		this.spritesScoreNumbers = new Array();
		this.spritesScoreNumbers.push(spriteScoreNumber);

		// ---- BAR OF TIME
		// Container
		this.timeContainer = game.add.sprite(0, 100, 'timeContainer');
		// Center
		this.timeContainer.x = game.width / 2 - this.timeContainer.width / 2;
		// Bar
		this.timeBar = game.add.sprite(0, 130, 'timeBar');
		// Center
		this.timeBar.x = game.width / 2 - this.timeBar.width / 2;
		this.timeBarWidth = this.timeBar.width / 2;
		// We cut the bar to halve it
		var cropRect = new Phaser.Rectangle(0, 0, this.timeBarWidth, this.timeBar.height);
		this.timeBar.crop(cropRect);
		this.timeBar.updateCrop();

		// ---- LEVEL
		// Level
		this.currentLevel = 1;
		var levelPosY = 290;
		// Sprite "Level"
		this.intituleLevel = game.add.sprite(0, levelPosY, 'level');
		this.intituleLevel.alpha = 0;
		// Sprite "Level Number"
		var spriteLevelNumber = game.add.sprite(0, levelPosY, 'levelNumbers');
		spriteLevelNumber.alpha = 0;
		// Change the animation of the sprite to select the sprite of the current level (here, level 1)
		spriteLevelNumber.animations.add('number');
		spriteLevelNumber.animations.frame = this.currentLevel;
		this.spritesLevelNumbers = new Array();
		this.spritesLevelNumbers.push(spriteLevelNumber);

		// ---- SOUNDS
		this.soundCut = game.add.audio('soundCut', 1);
		this.soundTheme = game.add.audio('soundTheme', 0.5, true);
		this.soundDeath = game.add.audio('soundDeath', 1);
	},

	update: function() {
		// If the game has started (player's first action)
		if(GAME_START) {
			// If time remains, update the time bar
			if(this.timeBarWidth > 0) {
				// The time bar is decreased according to the level
				this.timeBarWidth -= (0.6 + 0.1 * this.currentLevel);
				var cropRect = new Phaser.Rectangle(0, 0, this.timeBarWidth, this.timeBar.height);
				this.timeBar.crop(cropRect);
				this.timeBar.updateCrop();
			// Otherwise, the character dies
			} else {
				this.death();
			}
		}
		// If the game is not over
		if(!GAME_OVER) {
			// Detecting the left and right keys on the keyboard
			if (game.input.keyboard.justPressed(Phaser.Keyboard.LEFT))
		        this.listener('left');
		    else if (game.input.keyboard.justPressed(Phaser.Keyboard.RIGHT)) {
		        this.listener('right');
		    }
		}
	},

	listener: function(action) {

		if(this.canCut) {

			// The first action of the user triggers the start of the game
			if(!GAME_START) {
				GAME_START = true;
				// Activate background music
				this.soundTheme.play();
			}
			
			// We check if the action of the player is a click
			var isClick = action instanceof Phaser.Pointer;

			// If the left directional key is pressed or if there is a click in the left half of the game
			if(action == 'left' || (isClick && game.input.activePointer.x <= game.width / 2)) {
				// We put the character to the left of the tree and in the direction of departure
				this.man.anchor.setTo(0, 0);
				this.man.scale.x = 1;
				this.man.x = 0;
				this.manPosition = 'left';
			// If the right arrow key is pressed or if there is a click in the right half of the game
			} else {
				// The character's direction is reversed to the right of the tree
				this.man.anchor.setTo(1, 0);
				this.man.scale.x = -1;
				this.man.x = game.width - Math.abs(this.man.width);
				this.manPosition = 'right';
			}

			// Stop breathing animation
			this.man.animations.stop('breath', true);
			// To start the animation of the cut, only once and with 3 frames per second
			var animationCut = this.man.animations.play('cut', 15);
			// Once the animation of the cut is finished, we resume the animation of the breath
			animationCut.onComplete.add(function() {
				this.man.animations.play('breath', 3, true);
			}, this);

			// Name of trunk to be cut
			var nameTrunkToCut = this.tree.getAt(0).key;
			// Name of the trunk that lies just above the trunk "nameTrunkToCut"
			var nameTrunkJustAfter = this.tree.getAt(1).key;

			// If the character strikes a branch while it has changed sides
			if(nameTrunkToCut == 'branchLeft' && this.manPosition == 'left' || nameTrunkToCut == 'branchRight' && this.manPosition == 'right') {
				// Game Over
				this.death();
			// If all goes well, the character cuts the trunk
			} else {
				this.man.animations.stop('breath', true);
				// The animation is started with 3 frames per second
				var animationCut = this.man.animations.play('cut', 15);
				animationCut.onComplete.add(function() {
					this.man.animations.play('breath', 3, true);
				}, this);

				this.cutTrunk();

				// Once the trunk is cut, we check if the falling trunk is not a branch that could strike the character
				if(nameTrunkJustAfter == 'branchLeft' && this.manPosition == 'left' || nameTrunkJustAfter == 'branchRight' && this.manPosition == 'right') {
					// Game Over
					this.death();
				}
			}
		}
	},

	cutTrunk: function() {
		
		// We activate the sound of ax against the wood
		this.soundCut.play();

		// The score is incremented
		this.increaseScore();

		// A trunk or branch is added		
		this.addTrunk();

		// A copy of the piece of the tree to be cut is created
		var trunkCut = game.add.sprite(37, 1151, this.tree.getAt(0).key);
		// And we delete the piece belonging to the tree 
		this.tree.remove(this.tree.getAt(0));
		// We activate the system of physics on this sprite
		game.physics.enable(trunkCut, Phaser.Physics.ARCADE);
		// We move the center of gravity of the sprite in its middle, which will allow us to make it rotate on itself
		trunkCut.anchor.setTo(0.5, 0.5);
		trunkCut.x += trunkCut.width / 2;
		trunkCut.y += trunkCut.height / 2;

		var angle = 0;
		// If the character is on the left, the piece of wood is sent to the right
		if(this.manPosition == 'left') {
			trunkCut.body.velocity.x = 1300;
			angle = -400;
		// Otherwise, it is sent to the left
		} else {
			trunkCut.body.velocity.x = -1300;
			angle = 400;
		}
		// Creates a gravity effect
		// At first, the piece of wood is propelled into the air
		trunkCut.body.velocity.y = -800;
		// And in a second time, it falls
		trunkCut.body.gravity.y = 2000;

		// A rotating animation is added to the piece of cut wood
		game.add.tween(trunkCut).to({angle: trunkCut.angle + angle}, 1000, Phaser.Easing.Linear.None,true);

		// A new cut is prevented
		this.canCut = false;

		var self = this;
		// For each piece (trunks and branches) of the tree, it is added a animation of fall.
		// Gives the impression that all the tree falls to clog the hole left by the cut piece.
		this.tree.forEach(function(trunk) {
			var tween = game.add.tween(trunk).to({y: trunk.y + self.HEIGHT_TRUNK}, 100, Phaser.Easing.Linear.None,true);
			tween.onComplete.add(function() {
				// Once the tree has finished its animation, we give again the possibility of cutting
				self.canCut = true;
			}, self);
		});
	},

	constructTree: function() {
		// We build the group this.tree which will contain all the parts of the tree (simple trunks and branches)
		this.tree = game.add.group();
		// The first 2 trunks are simple trunks
		this.tree.create(37, 1151, 'trunk1');
		this.tree.create(37, 1151 - this.HEIGHT_TRUNK, 'trunk2');

		// The rest of the tree
		for(var i = 0; i < 4; i++) {
			this.addTrunk();
		}
	},

	addTrunk: function() {
		var trunks = ['trunk1', 'trunk2'];
		var branchs = ['branchLeft', 'branchRight'];
		// If the last trunk of this.tree group is not a branch
		if(branchs.indexOf(this.tree.getAt(this.tree.length - 1).key) == -1) {
			// 1 chance of 4 to place a trunk without branch
			if(Math.random() * 4 <= 1)
				this.tree.create(37, this.stump.y - this.HEIGHT_TRUNK * (this.tree.length + 1), trunks[Math.floor(Math.random() * 2)]);
			// 3 out of 4 chances to place a branch
			else	
				this.tree.create(37, this.stump.y - this.HEIGHT_TRUNK * (this.tree.length + 1), branchs[Math.floor(Math.random() * 2)]);
		}
		// If the preceding trunk is a branch, we place a simple trunk
		else
			this.tree.create(37, this.stump.y - this.HEIGHT_TRUNK * (this.tree.length + 1), trunks[Math.floor(Math.random() * 2)]);
	},

	increaseScore: function() {
		this.currentScore++;

		// Every 20 points increases the level
		if(this.currentScore % 20 == 0)
			this.increaseLevel();

		// We add a little extra time
		this.timeBarWidth += 12;

		// On "kill" each sprite (each digit) that composes the score
		for(var j = 0; j < this.spritesScoreNumbers.length; j++)
			this.spritesScoreNumbers[j].kill();
		this.spritesScoreNumbers = new Array();
		
		// We recreate the sprites that will compose the score
		this.spritesScoreNumbers = this.createSpritesNumbers(this.currentScore, 'numbers', 440, 1);
	},

	createSpritesNumbers: function(number /* Number to create in sprite */, imgRef /* Image to use to create the score */, posY, alpha) {
		// The number is divided into individual digits
		var digits = number.toString().split('');
		var widthNumbers = 0;

		var arraySpritesNumbers = new Array();
		
		// The number is sized with the sprites
		for(var i = 0; i < digits.length; i++) {
			var spaceBetweenNumbers = 0;
			if(i > 0)
				spaceBetweenNumbers = 5;
			var spriteNumber = game.add.sprite(widthNumbers + spaceBetweenNumbers, posY, imgRef);
			spriteNumber.alpha = alpha;
			// We add the JSON of the numbers in the animation of "spriteNumber"
			spriteNumber.animations.add('number');
			// The frame number "digits [i]" is selected in the JSON
			spriteNumber.animations.frame = +digits[i];
			arraySpritesNumbers.push(spriteNumber);
			// We calculate the total width of the score sprite
			widthNumbers += spriteNumber.width + spaceBetweenNumbers;
		}

		// We add the sprites of the score in the group "numbersGroup" in order to center the whole
		var numbersGroup = game.add.group();
		for(var i = 0; i < arraySpritesNumbers.length; i++)
			numbersGroup.add(arraySpritesNumbers[i]);
		// Center horizontally
		numbersGroup.x = game.width / 2 - numbersGroup.width / 2;

		return arraySpritesNumbers;
	},

	increaseLevel: function() {
		// The current level is incremented
		this.currentLevel++;

		// On "kill" each sprite (each digit) of the number of the previous level
		for(var j = 0; j < this.spritesLevelNumbers.length; j++)
			this.spritesLevelNumbers[j].kill();
		this.spritesLevelNumbers = new Array();

		// We create the sprites (sprites of the digits) of the current level
		this.spritesLevelNumbers = this.createSpritesNumbers(this.currentLevel, 'levelNumbers', this.intituleLevel.y, 0);

		// Position the level number (composed of different sprites) behind the sprite "level"
		this.intituleLevel.x = 0;
		for(var i = 0; i < this.spritesLevelNumbers.length; i++) {
			if(i == 0)
				this.spritesLevelNumbers[i].x = this.intituleLevel.width + 20;
			else
				this.spritesLevelNumbers[i].x = this.intituleLevel.width + 20 + this.spritesLevelNumbers[i - 1].width;
		}
		// We add the whole to a group in order to center everything
		var levelGroup = game.add.group();
		levelGroup.add(this.intituleLevel);
		for(var i = 0; i < this.spritesLevelNumbers.length; i++)
			levelGroup.add(this.spritesLevelNumbers[i]);
		levelGroup.x = game.width / 2 - levelGroup.width / 2;

		// The sprite "level" and the level number are displayed at the same time
		for(var i = 0; i < this.spritesLevelNumbers.length; i++) {
			game.add.tween(this.spritesLevelNumbers[i]).to({alpha: 1}, 300, Phaser.Easing.Linear.None,true);
		}
		game.add.tween(this.intituleLevel).to({alpha: 1}, 300, Phaser.Easing.Linear.None,true);

		// After about 1.5 seconds
		var self = this;
		setTimeout(function() {
			for(var i = 0; i < self.spritesLevelNumbers.length; i++) {
				game.add.tween(self.spritesLevelNumbers[i]).to({alpha: 0}, 300, Phaser.Easing.Linear.None,true);
			}
			game.add.tween(self.intituleLevel).to({alpha: 0}, 300, Phaser.Easing.Linear.None,true);
		}, 1500);
	},

	death: function() {
		// We play the sound of the death of the character
		this.soundDeath.play();
		// And we stop the background music
		this.soundTheme.stop();

		// Any action by the player
		GAME_START = false;
		GAME_OVER = true;
		this.canCut = false;
		game.input.onDown.removeAll();

		var self = this;
		// The character disappears
		var ripTween = game.add.tween(this.man).to({alpha: 0}, 300, Phaser.Easing.Linear.None,true);
		// Once the complete disappearance
		ripTween.onComplete.add(function() {
			// The tomb is shown in place of the character
			self.rip = game.add.sprite(0, 0, 'rip');
			self.rip.alpha = 0;
			game.add.tween(self.rip).to({alpha: 1}, 300, Phaser.Easing.Linear.None,true);
			self.rip.x = (this.manPosition == 'left') ? (this.man.x + 50) : (this.man.x + 200);
			self.rip.y = this.man.y + this.man.height - self.rip.height;
			// After 1 second, the function "gameFinish ()"
			setTimeout(function() {self.gameFinish()}, 1000);
		}, this);
	},

	gameFinish: function() {
		// Restart the game
		GAME_START = false;
		GAME_OVER = false;
		game.state.start('main');
	}
};

function change() {
    document.getElementById("splash_page").style.display="none";
}


// We add the 2 functions "gameState.load" and "gameState.main" to our Phaser object
game.state.add('load', gameState.load);
game.state.add('main', gameState.main);
// Run the state "load"
game.state.start('load');