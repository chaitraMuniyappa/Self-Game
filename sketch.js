const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Constraint = Matter.Constraint;
var canvas, backgroundImage;
var rand;

var gameState = "round4";
var engine, world, s1;
var block2 = [], block1 = [], stand1, stand2;
var slingCounter = 0;
var whipCounter;
var const1;
var circles = [];

var s1_dead, s1_shooting, s2_dead, s2_shooting;
var jet, jetImg, jet2Img, heliImg;
var jetGroup, heliGroup;
var score;
var bullet, bulletImg, bullet2Img, bomb1, bomb2, bom1Img, bomb2Img, blockImg;
var fire;
var music1, music2, music3, music4
var stand1;
var edges;
var portalGroup, portal, enemy_group;
var isEndTimmerStarted = false;
var enemyNumber=null;
var alloted=false;
var GENEMY=0;



function preload() {
  bg = loadImage("images/sky.jpg");
  s1_shooting = loadImage("images/shooting_1.png");
  s1_dead = loadImage("images/destroyed_1.png");
  s2_shooting = loadImage("images/shooting_2.png");
  s2_dead = loadImage("images/falling_2.png");
  jetImg = loadImage("images/jet (2).png")
  jet2Img = loadImage("images/jet (3).png");
  heliImg = loadImage("images/helicopter.png")
  heli2Img = loadImage("images/helic.png");
  bulletImg = loadImage("images/bullet_1.png");
  tankImg = loadImage("images/tank.png")
  blockImg = loadImage("images/block.png");
  portalImg = loadImage("images/portal.png");

  fire = loadSound("sounds/machine_gun.mp3");
  swing = loadSound("sounds/axe_swing.mp3");
  explosion = loadSound("sounds/explosion.mp3");
  music1 = loadSound("sounds/war_music.mp3");
  whip = loadSound("sounds/whip.mp3")
}
function setup() {
  engine = Engine.create();
  world = engine.world
  canvas = createCanvas(1550, 800);

  soldier1 = createSprite(300, 570);
  soldier1.addImage(s1_shooting);
  soldier1.scale = .15;

  //creating chain of circles for level 3
  var prev = null;
  for (var i = 800; i < 1000; i += 20) {
    var circle = new Circle(i, 140, 20);
    circles.push(circle);
    Matter.Body.setStatic(circles[0].body, true);
    if (prev) {
      var options = {
        bodyA: circle.body,
        bodyB: prev.body,
        length: 40,
        stiffness: 0.4
      }
      var constraint = Constraint.create(options);
      World.add(world, constraint);
    }
    prev = circle;
  }
  whipCounter = 0;

  stand1 = new Stand(400, 340, 250, 10);
  stand2 = new Stand(1300, 340, 250, 10);
  bomb1 = new Bomb1(400, 400, 60, 60);
  sling1 = new Slingshot2({ x: 400, y: 450 }, bomb1.body);
  //stack for round 2
  for (var j = 1200; j <= 1400; j = j + 45) {
    block1.push(new Block(j, 330, blockImg));
  }
  for (var j = 1220; j <= 1380; j = j + 45) {
    block1.push(new Block(j, 300, blockImg));
  }

  // These are for round 3
  for (var j = 1200; j <= 1400; j = j + 45) {
    block2.push(new Block(j, 330, s2_shooting));
  }
  for (var j = 1220; j <= 1380; j = j + 45) {
    block2.push(new Block(j, 300, s2_shooting));
  }
  for (var j = 300; j <= 500; j = j + 45) {
    block2.push(new Block(j, 330, s2_shooting));
  }
  for (var j = 320; j <= 500; j = j + 45) {
    block2.push(new Block(j, 300, s2_shooting));
  }

  jetGroup = new Group();
  heliGroup = new Group();
  bulletGroup = new Group();
  enemy_group = new Group();

  score = 0;
  music1.loop();
  edges = createEdgeSprites();
  portalGroup = new Group();
  setInterval(spawnPortal, 10000);  //this is for creating

}

function startEndTimmer() {
  // console.log("Started now")
  setInterval(destroyPortal, 10001);// this is for destroying

}

function draw() {
  Engine.update(engine)
  background(bg);

  fill("Black")
  textSize(20)
  text("Score:" + score, width - 400, 50);

  if (keyDown(RIGHT_ARROW)) {
    soldier1.x = soldier1.x + 10
  }
  if (keyDown(LEFT_ARROW)) {
    soldier1.x = soldier1.x - 10
  }
  soldier1.collide(edges);

  if (gameState === "start") {
    textSize(25);
    fill("brown");
    textFont("Impact");
    text("Level 1", 700, 150);
    textSize(20);
    text("Press 'S' to start the level", 700, 200);
    text("Press '1' to shoot the enemies ", 700, 250);
    text("Use LEFT and RIGHT arrow keys to move the player", 700, 300)
    stroke(Math.round(random(0, 255)), Math.round(random(0, 255)), Math.round(random(0, 255)));
    text("Path to next level: Reach score of 5 quickly!", 700, 350);
  }
  if (keyDown("s") && gameState === "start") {
    gameState = "play";
  }
  if (gameState === "play") {
    if (keyDown("1") && frameCount % 15 === 0) {
      spawnbullet();
      fire.play();
    }
    //destroy the respective bullet , jet and helicopter touching each other
    bulletGroup.collide(jetGroup, jetHit);
    bulletGroup.collide(heliGroup, heliHit);

    //destroys bullets going out of screen
    for (var p = 0; p < bulletGroup.length; p++) {
      if (bulletGroup[p].y < 0) {
        bulletGroup[p].destroy();
        p--;
      }
    }

    if (bulletGroup.isTouching(heliGroup)) {
      bulletGroup.destroyEach();
      heliGroup.destroyEach();
      score = score + 1
    }

    if (frameCount >= 5000) {
      gameState = "start";
    }
    spawnObs();
    if (score === 5) {
      gameState = "intermission";
    }

  }
  if (gameState === "intermission") {
    jetGroup.destroyEach();
    heliGroup.destroyEach();

    textSize(25);
    fill("brown");
    textFont("Impact");
    text("ROUND 2", 700, 200);
    textSize(20);
    text("Press 'R' to start", 700, 250)
    text("Press space to attach the bomb back", 700, 300);
    stroke(Math.round(random(0, 255)), Math.round(random(0, 255)), Math.round(random(0, 255)));
    text("Path to next level, destroy the stacks within 4 swings", 700, 350);
  }
  if (keyDown("R") && gameState === "intermission") {
    gameState = "round2"
    slingCounter = 0;
  }
  if (gameState === "round2") {
    bomb1.display();
    stand2.display();
    sling1.display();

    for (var i = 0; i < block1.length; i++) {
      block1[i].display();
      block1[i].score();
    }

    if (slingCounter > 4) {
      gameState = "fail1"
    }
    if (score === 27) {
      gameState = "intermission2"
    }
  }

  if (gameState === "fail1") {
    text("You passed four swings, you failed the level!", 700, 200)
    text("Press 'F' to continue", 700, 250);

    if (keyDown("F")) {
      gameState = "start"
      score = 0
    }
  }

  if (gameState === "intermission2") {
    //World.remove(world,block2)
    World.remove(world, bomb1.body)
    textSize(25);
    fill("brown");
    textFont("Impact");
    text("ROUND 3", 700, 200)
    text("Press 'L' to start", 700, 250);
    stroke(Math.round(random(0, 255)), Math.round(random(0, 255)), Math.round(random(0, 255)));
    text("Path to next Level , destroy the stack less than 4 attempts", 700, 300);
    text("Press 'Space' key to attach the bomb after releasing", 700, 350);
    if (keyDown('L')) {
      gameState = "round3"
    }
  }

  if (gameState === "round3") {
    stand2.display();
    stand1.display();
    for (var i = 0; i < block2.length; i++) {
      block2[i].display();
      block2[i].score();
    }

    for (var i = 0; i < circles.length; i++) {
      circles[i].display();
    }
    if (keyDown(RIGHT_ARROW)) {
      Matter.Body.applyForce(circles[circles.length / 2 - 1].body, { x: 0, y: 0 }, { x: 0.05, y: 0 });
    }
    if (keyDown(LEFT_ARROW)) {
      Matter.Body.applyForce(circles[circles.length / 2 - 1].body, { x: -.05, y: 0 }, { x: -0.05, y: 0 });
    }
    if (keyDown(LEFT_ARROW) && frameCount % 15 === 0) {
      whipCounter++;
      whip.play();
    }
    if (keyDown(RIGHT_ARROW) && frameCount % 15 === 0) {
      whipCounter++;
      whip.play();
    }
    if (score >= 60) {
      gameState = "intermission3"
    }
    if (whipCounter > 25) {
      gameState = "fail2"
    }

    text("Whip count :" + whipCounter, 870, 50)

  }

  if (gameState === "intermission3") {
    score = 0
    fill("red");
    textSize(20)
    text("ROUND 4", 700, 200)
    text("Press 4 to start", 700, 250)
    text("In level 4, elude and destroy the homing enemies, and get to the portal before it disappears", 700, 300);
    if (keyDown('4')) {
      gameState = "round4"
    }
  }
  if (gameState === "round4") {
    fill("red");
    textSize(20);
    text("ROUND 4 has started", 700, 200);
    soldier1.x = mouseX;
    soldier1.y = mouseY;
    if (!enemy_group[0]) {
      createEnemy();
    }
    if (frameCount % 250 === 0) {
      enemyNumber = Math.round(random(0, enemy_group.length - 1));
    }
    if (enemy_group[enemyNumber] && soldier1.y - enemy_group[enemyNumber].y > 100) {
      enemyFollowingPlayer(enemyNumber);
      if(enemy_group[enemyNumber].y > 500 || enemy_group[enemyNumber].y< -10){
        enemy_group[enemyNumber].destroy();
      }
    }
  }
  drawSprites();
}


function spawnObs() {
  if (frameCount % 250 === 0) {
    jet = createSprite(-50, 250, 100);
    jet.y = Math.round(random(0, 300))
    jet.addImage(jetImg)
    jet.scale = .5
    jet.velocityX = 3;
    jetGroup.add(jet);
  }
  if (frameCount % 200 === 0) {
    heli = createSprite(1600, 250, 100);
    heli.y = Math.round(random(0, 300));
    heli.addImage(heliImg);
    heli.velocityX = -(4 + score / 2);
    heli.scale = .3
    heliGroup.add(heli)
  }
}

function spawnbullet() {
  bullet = createSprite(300, 570);
  bullet.x = soldier1.x + 20
  bullet.y = soldier1.y - 10
  bullet.addImage(bulletImg);
  bullet.scale = .08
  bullet.setVelocity(4, -4);
  bullet.rotation = 60
  bulletGroup.add(bullet)
}

function jetHit(bullet, jet) {
  jet.destroy();
  bullet.destroy();
  score = score + 1
  explosion.play();
}

function heliHit(bullet, heli2) {
  heli2.destroy();
  bullet.destroy();
  score = score + 1;
  explosion.play();
}

function mouseDragged() {
  // Matter.Body.setPosition(bomb2.body, {x: mouseX , y: mouseY});
  Matter.Body.setPosition(bomb1.body, { x: mouseX, y: mouseY });
}

function mouseReleased() {
  sling1.fly();
  swing.play();
  slingCounter++;
}

function keyPressed() {
  if (keyCode === 32) {
    Matter.Body.setPosition(bomb1.body, { x: 400, y: 400 })
    sling1.attach(bomb1.body)
  }
}
//round4 functions
function spawnPortal() {
  if (gameState == "round4") {
    // console.log("spawn")
    portal = createSprite(Math.round(random(50, 1000), Math.round(random(200, 700))), 35, 35)
    portal.addImage(portalImg)
    portal.scale = .3
    portalGroup.add(portal);
    if (!isEndTimmerStarted) {
      startEndTimmer();
      isEndTimmerStarted = true;
    }
    //console.log(portal.x + " " + portal.y)
  }
}
function destroyPortal() {
  // console.log("destroyed")
  portalGroup[0].destroy();
}

function createEnemy() {
  for (var i = 1; i <= 7; i++) {
    var enemy = createSprite(150 * i, 150);
    // enemy.addImage("enemy");
    enemy.scale = 0.25;
    enemy_group.add(enemy);
  }
}
function enemyFollowingPlayer(enemyNumber) {
  enemy_group[enemyNumber].pointTo(soldier1.x, soldier1.y);
  enemy_group[enemyNumber].rotation = enemy_group[enemyNumber].rotation + 90;
  enemy_group[enemyNumber].setSpeedAndDirection(9, enemy_group[enemyNumber].rotation - 90);
  console.log("enemy following the player" + enemyNumber);
}