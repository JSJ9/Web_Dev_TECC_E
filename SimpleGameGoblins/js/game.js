//Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

//Background image 
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function() {
    bgReady = true;
};
bgImage.src = "images/background.png";

//Hero Image
var heroReady = false;
var heroImage = new Image();
heroImage.onload = function() {
    heroReady = true;
};
heroImage.src = "images/hero.png";

//Monster image 
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
    monsterReady = true;
};
monsterImage.src = "images/monster.png";

//bomb image
var bombReady = false;
var bombImage = new Image();
bombImage.onload = function () {
    bombReady = true;
};
bombImage.src = "images/bomb.png";

//Game objects
var hero = {
        speed: 256 // movement in pixels per second
};
var monster = {};
var bomb = {
    speed: 125
};
var lives = 3;
var monstersCaught = 0;
var bombsCaught = 0;

//Handle keyboard controls
var keysDown = {};
addEventListener("keydown", function(e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function(e) {
    delete keysDown[e.keyCode];
}, false);

//Reset the game when the player catches a monster
var reset = function() {
    hero.x = canvas.width / 2;
    hero.y = canvas.height /2;
    
    //throw the monster somewhere on the screen randomly
    monster.x = 32 + (Math.random() * (canvas.width - 64));
    monster.y = 32 + (Math.random() * (canvas.height - 64));
    
    bomb.x = 32 + (Math.random() * (canvas.width - 70));
    bomb.y = 32 + (Math.random() * (canvas.width - 70));
    
};

//Update game objects
var update = function (modifier) {
    if(38 in keysDown || 87 in keysDown) { //Player holding up
        hero.y -= hero.speed * modifier;
        bomb.y -= bomb.speed * modifier;
    }
    if(40 in keysDown || 83 in keysDown) { //Player holding down
        hero.y += hero.speed * modifier;
        bomb.y -= bomb.speed * modifier;
    }
    if(37 in keysDown || 65 in keysDown) { //Player holding left
        hero.x -= hero.speed * modifier;
        bomb.x -= bomb.speed * modifier;
    }
    if(39 in keysDown || 68 in keysDown) { //Player holding right
        hero.x += hero.speed * modifier;
        bomb.x += bomb.speed * modifier;
    }
    
    //Are they touching?
    if(
        hero.x <= (monster.x + 32)
        && monster.x <= (hero.x + 32)
        && hero.y <= (monster.y + 32)
        && monster.y <= (hero.y + 32)
    
    ) {
            ++monstersCaught;
            reset();
    }
    
    if(
        hero.x <= (bomb.x + 32)
        && bomb.x <= (bomb.x + 32)
        && hero.y <= (bomb.y + 32)
        && bomb.y <= (hero.y + 32)
    
    ) {
            ++bombsCaught;
            --lives;
            reset();
    }
    
    //still alive?
    if(lives <= 0)
    {
        reset();
        lives = 3;
        monstersCaught= 0;
    }
};

//Draw everything 
var render = function() {
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
    }
    
    if (heroReady) {
        ctx.drawImage(heroImage, hero.x, hero.y);
    }
    
    if(monsterReady) {
        ctx.drawImage(monsterImage, monster.x, monster.y);
    }

    if(bombReady) {
        ctx.drawImage(bombImage, bomb.x, bomb.y);
    }
    
    //Score
    ctx.fillStyle = "rgb(250, 250, 250)";
    ctx.font = "24px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Goblins caught: " + monstersCaught, 32, 32);
    ctx.fillText("Lives left: " + lives, 32, 60);
    
    
    //have hero appear on the other side
    if(hero.x > 512)
            hero.x = 0;
    if(hero.x < 0)
            hero.x = 512;
    if(hero.y > 480)
        hero.y = 0;
    if(hero.y < 0)
        hero.y = 480;
    
    //have bomb appear on the other side
    if(bomb.x > 512)
            bomb.x = 0;
    if(bomb.x < 0)
            bomb.x = 512;
    if(bomb.y > 480)
        bomb.y = 0;
    if(bomb.y < 0)
        bomb.y = 480;
    
};

// The main game loop
var main = function() {
    var now = Date.now();
    var delta = now - then;
    
    update(delta / 1000);
    render();
    
    then = now;
    
    //Request to do this again ASAP
    requestAnimationFrame(main);
};

//Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame ||
    w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

//Lets play this game!
var then = Date.now();
reset();
main();






