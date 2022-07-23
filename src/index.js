// Youtube: https://www.youtube.com/watch?v=qCBiKJbLcFI

// To do:
// - make a noise for getting double shooter
// - show an image for getting ||
// - why is it that when you restart the game the timer doesn't show up?
// - create level 4 - 10 signs for beginning of level
// - indicate that enemy hasn't died even tho you shot it
// - need a way to pass double shooter variable to new levels
// - add a ship for number 4 and 8
// - add to instructions - press a random number to use a mystery ship
// - implement challenging level:
//    - instructions: if you think you're hot sh%#, press h for a challenge version
//    - have to earn double shooting
//    - add 4 more levels
//    - new enemy capabilities:
//        - have to shoot twice to kill
//        - shoot more bullets

import EnemyController from "/src/enemyController.js";
import Player from "/src/player.js";
import BulletController from "/src/bulletController.js";
import showStartScreenF from "/src/startScreens.js";
import showInstructionsF from "/src/instructionsScreen.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const GAME_STATE = {
  STARTSCREEN: 0,
  RUNNING: 1,
  INSTRUCTIONS: 2
};
let gameState = GAME_STATE.STARTSCREEN;
let current_level = 1;
let shipNum = 1;
let isDoubleShooter = false;
let isChallenging = false;

let isGameOver = false;
let didWin = false;

canvas.width = 600;
canvas.height = 625;

// #region Images and Audio
const background = new Image();
background.src = "/src/images/pixel_stars.jpg";
const hyperionTitle = new Image();
hyperionTitle.src = "/src/images/hyperion.png";
const hyperionMoon = new Image();
hyperionMoon.src = "/src/images/hyperion_moon.jpg";
const hyperionMoonBurning = new Image();
hyperionMoonBurning.src = "/src/images/hyperion_moon_burning.png";
const hyperionMoonHappy = new Image();
hyperionMoonHappy.src = "/src/images/hyperion_moon_happy.png";
const enemy2 = new Image();
enemy2.src = "/src/images/pixel_enemy_2.png";
const enemy4 = new Image();
enemy4.src = "/src/images/pixel_enemy_4.png";
const enemy6 = new Image();
enemy6.src = "/src/images/pixel_enemy_6.png";

const ship1 = new Image();
ship1.src = "/src/images/pixel_ship_1.png";
const ship2 = new Image();
ship2.src = "/src/images/pixel_ship_2.png";
const ship3 = new Image();
ship3.src = "/src/images/pixel_ship_3.png";

const gameStartAudio = new Audio("src/audio/computerNoise_000.ogg");
gameStartAudio.volume = 0.022;
const levelUpSound = new Audio("/src/audio/level-up.wav");
levelUpSound.volume = 0.35;
const playerWinSound = new Audio("/src/audio/small-win.wav");
playerWinSound.volume = 0.25;
const playerDeathSound = new Audio("/src/audio/fast-game-over.wav");
playerDeathSound.volume = 0.15;

const gasolina = new Audio("src/audio/Gasolina.mp3");
gasolina.volume = 0.45;
const vocalFunction = new Audio("src/audio/VocalFunction.mp3");
vocalFunction.volume = 0.45;
const inDaClub = new Audio("src/audio/InDaClub.mp3");
inDaClub.volume = 0.45;
const runIt = new Audio("src/audio/runIt.mp3");
runIt.volume = 0.45;
const byeByeBye = new Audio("src/audio/byeByeBye.mp3");
byeByeBye.volume = 0.45;
const pony = new Audio("src/audio/pony.mp3");
pony.volume = 0.45;
const oldTownRoad = new Audio("src/audio/oldTownRoad.mp3");
oldTownRoad.volume = 0.45;
const donlimma = new Audio("src/audio/Donlimma.mp3");
donlimma.volume = 0.45;
const rage = new Audio("src/audio/GuerrillaRadio.mp3");
rage.volume = 0.45;
const dropTop = new Audio("src/audio/Droptop.mp3");
dropTop.volume = 0.45;
const zeze = new Audio("src/audio/Zeze.mp3");
zeze.volume = 0.45;
const loveScars = new Audio("src/audio/LoveScars.mp3");
loveScars.volume = 0.45;

// timer for how long until to show the next rage photo
let rageNum = 1;
let nextRagePhotoTimer = 100;
let showRagePhoto = false;
let ragePhotoTimer = 40;
let rage_photo = new Image();
rage_photo.src = `/src/images/rage_${rageNum}.png`;

let levelUpTextTimer = 40;
const level1Image = new Image("/src/images/level_1.png");
const level2Image = new Image("/src/images/level_2.png");
const level3Image = new Image("/src/images/level_3.png");
const level4Image = new Image("/src/images/level_4.png");
const level5Image = new Image("/src/images/level_5.png");
const level6Image = new Image("/src/images/level_6.png");
const level7Image = new Image("/src/images/level_7.png");
const level8Image = new Image("/src/images/level_8.png");
const level9Image = new Image("/src/images/level_9.png");
const level10Image = new Image("/src/images/level_10.png");

// #endregion

// event listener arrow function
let startGame = (event) => {
  if (gameState === GAME_STATE.STARTSCREEN && event.code === "KeyI") {
    donlimma.currentTime = 0;
    donlimma.play();
    gameState = GAME_STATE.INSTRUCTIONS;
  } else if (gameState === GAME_STATE.INSTRUCTIONS && event.code === "Escape") {
    donlimma.pause();
    gameState = GAME_STATE.STARTSCREEN;
  } else if (gameState === GAME_STATE.RUNNING && isGameOver) {
    if (event.code === "Escape") {
      inDaClub.pause();
      rage.pause();
      oldTownRoad.pause();
      dropTop.pause();
      gameState = GAME_STATE.STARTSCREEN;
    } else if (event.code === "Space") {
      if (!didWin) {
        resetAllVariables();
        gameState = GAME_STATE.RUNNING;
        gameStartAudio.play();
        if (shipNum === 4) {
          oldTownRoad.currentTime = 0;
          oldTownRoad.play();
        } else if (shipNum === 9) {
          rage.currentTime = 0;
          rage.play();
        } else {
          inDaClub.pause();
          gasolina.currentTime = 0;
          gasolina.play();
        }
      }
    }
  } else if (
    gameState === GAME_STATE.STARTSCREEN &&
    (event.code === "Digit1" ||
      event.code === "Digit2" ||
      event.code === "Digit3" ||
      event.code === "Digit5" ||
      event.code === "Digit6" ||
      event.code === "Digit7" ||
      event.code === "Digit9" ||
      event.code === "KeyH")
  ) {
    if (event.code === "Digit1") {
      shipNum = 1;
      newPlayer(shipNum);
    } else if (event.code === "Digit2") {
      shipNum = 2;
      newPlayer(shipNum);
    } else if (event.code === "Digit3") {
      shipNum = 3;
      newPlayer(shipNum);
    } else if (event.code === "Digit5") {
      shipNum = 5;
      newPlayer(shipNum);
    } else if (event.code === "Digit6") {
      shipNum = 6;
      newPlayer(shipNum);
    } else if (event.code === "Digit7") {
      shipNum = 7;
      newPlayer(shipNum);
    } else if (event.code === "Digit9") {
      shipNum = 9;
      newPlayer(shipNum);
    } else if (event.code === "KeyH") {
      isChallenging = true;
      shipNum = 10;
      newPlayer(shipNum);
    }
    if (isGameOver) {
      resetAllVariables();
    }
    gameState = GAME_STATE.RUNNING;
    gameStartAudio.play();
    if (shipNum === 7) {
      oldTownRoad.currentTime = 0;
      oldTownRoad.play();
    } else if (shipNum === 9) {
      rage.currentTime = 0;
      rage.play();
    } else {
      inDaClub.pause();
      gasolina.currentTime = 0;
      gasolina.play();
    }
  }
};

document.addEventListener("keydown", startGame);

// #region Initiate Variables
let playerBulletController = new BulletController(
  canvas,
  "#9df716",
  "player",
  current_level,
  shipNum,
  isDoubleShooter,
  isChallenging
);
let enemyBulletController = new BulletController(
  canvas,
  "red",
  "enemy",
  current_level,
  shipNum,
  false,
  isChallenging
);

let enemyController = new EnemyController(
  canvas,
  enemyBulletController,
  playerBulletController,
  current_level,
  isChallenging
);

let player = new Player(canvas, 18, playerBulletController, shipNum);
// #endregion

// game loop
function game() {
  if (gameState === GAME_STATE.STARTSCREEN) {
    showStartScreenF(
      ctx,
      canvas,
      background,
      hyperionTitle,
      ship1,
      ship2,
      ship3
    );
  } else if (gameState === GAME_STATE.INSTRUCTIONS) {
    // showInstructions(ctx);
    showInstructionsF(ctx, canvas, background, hyperionTitle, ship1, enemy2);
  } else if (gameState === GAME_STATE.RUNNING) {
    checkGameOver();
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    displayGameOver();
    if (!isGameOver) {
      enemyController.draw(ctx);
      player.draw(ctx);
      // shows the Current Level Image, allows bullets to pass over
      drawLevelUp();
      // for ship #9 (middle finger, show images on an interval)
      drawRagePhotos();

      playerBulletController.draw(ctx);
      enemyBulletController.draw(ctx);
    }
  }
}

function newPlayer(shipNum) {
  playerBulletController = new BulletController(
    canvas,
    "#9df716",
    "player",
    current_level,
    shipNum,
    isDoubleShooter,
    isChallenging
  );
  enemyController = new EnemyController(
    canvas,
    enemyBulletController,
    playerBulletController,
    current_level,
    isChallenging
  );
  player = new Player(canvas, 18, playerBulletController, shipNum);
}

function drawRagePhotos() {
  if (shipNum === 9 && rageNum <= 4) {
    if (nextRagePhotoTimer <= 0) {
      nextRagePhotoTimer = 100;
      showRagePhoto = true;
    }
    if (showRagePhoto && ragePhotoTimer > 0) {
      ctx.drawImage(rage_photo, 80, 100, 450, 300);
      ragePhotoTimer--;
    }
    if (showRagePhoto && ragePhotoTimer === 0) {
      showRagePhoto = false;
      ragePhotoTimer = 40;
      if (rageNum === 4) {
        rageNum = 1;
      } else {
        rageNum++;
      }
      rage_photo.src = `/src/images/rage_${rageNum}.png`;
    } else {
      nextRagePhotoTimer--;
    }
  }
}

function resetAllVariables() {
  current_level = 1;
  isGameOver = false;
  didWin = false;
  isDoubleShooter = false;
  isChallenging = false;
  levelUpTextTimer = 40;
  rageNum = 1;
  nextRagePhotoTimer = 100;
  showRagePhoto = false;
  ragePhotoTimer = 40;

  playerBulletController = new BulletController(
    canvas,
    "#9df716",
    "player",
    current_level,
    shipNum,
    isDoubleShooter,
    isChallenging
  );
  enemyBulletController = new BulletController(
    canvas,
    "red",
    "enemy",
    current_level,
    shipNum,
    false,
    isChallenging
  );

  enemyController = new EnemyController(
    canvas,
    enemyBulletController,
    playerBulletController,
    current_level,
    isChallenging
  );
  player = new Player(canvas, 18, playerBulletController, shipNum);
}

function levelUp() {
  levelUpTextTimer = 40;
  isDoubleShooter = playerBulletController.isDoubleShooter;

  playerBulletController = new BulletController(
    canvas,
    "#9df716",
    "player",
    current_level,
    shipNum,
    isDoubleShooter,
    isChallenging
  );
  enemyBulletController = new BulletController(
    canvas,
    "red",
    "enemy",
    current_level,
    shipNum,
    false,
    isChallenging
  );
  enemyController = new EnemyController(
    canvas,
    enemyBulletController,
    playerBulletController,
    current_level,
    isChallenging
  );
  player = new Player(canvas, 18, playerBulletController, shipNum);

  levelUpSound.play();
}

function drawLevelUp() {
  if (levelUpTextTimer >= 0) {
    if (current_level === 1) {
      console.log("draw image!");
      ctx.drawImage(level1Image, 200, 300, 186, 48);
    } else if (current_level === 2) {
      ctx.drawImage(level2Image, 200, 300, 186, 48);
    } else if (current_level === 3) {
      ctx.drawImage(level3Image, 200, 300, 186, 48);
    } else if (current_level === 4) {
      ctx.drawImage(level4Image, 200, 300, 186, 48);
    } else if (current_level === 5) {
      ctx.drawImage(level5Image, 200, 300, 186, 48);
    } else if (current_level === 6) {
      ctx.drawImage(level6Image, 200, 300, 186, 48);
    } else if (current_level === 7) {
      ctx.drawImage(level7Image, 200, 300, 186, 48);
    } else if (current_level === 8) {
      ctx.drawImage(level8Image, 200, 300, 186, 48);
    } else if (current_level === 9) {
      ctx.drawImage(level9Image, 200, 300, 186, 48);
    } else if (current_level === 10) {
      ctx.drawImage(level10Image, 200, 300, 186, 48);
    }
    levelUpTextTimer--;
  }
}

function checkGameOver() {
  if (isGameOver) {
    return;
  }
  if (
    enemyBulletController.collideWith(player) ||
    enemyController.collideWith(player)
  ) {
    isGameOver = true;
    oldTownRoad.pause();
    gasolina.pause();
    vocalFunction.pause();
    inDaClub.pause();
    rage.pause();
    dropTop.pause();
    playerDeathSound.play();
  }
  if (enemyController.enemyRows.length > 0) {
    const bottomMostEnemy =
      enemyController.enemyRows[enemyController.enemyRows.length - 1][0];
    if (bottomMostEnemy.y + bottomMostEnemy.height >= canvas.height) {
      isGameOver = true;
      playerDeathSound.play();
    }
  }
  if (enemyController.enemyRows.length === 0) {
    if (current_level === 1) {
      current_level = 2;
      if (shipNum !== 7 && shipNum !== 9) {
        gasolina.pause();
        vocalFunction.currentTime = 0;
        vocalFunction.play();
      }
      levelUp();
      return;
    } else if (current_level === 2) {
      current_level = 3;
      if (shipNum !== 7 && shipNum !== 9) {
        vocalFunction.pause();
        inDaClub.currentTime = 0;
        inDaClub.play();
      }
      levelUp();
      return;
    } else if (current_level === 3 && !isChallenging) {
      didWin = true;
      isGameOver = true;
      playerWinSound.play();
    }
    // #region challenging levels
    else if (current_level === 3 && isChallenging) {
      current_level = 4;
      gasolina.pause();
      inDaClub.pause();
      dropTop.currentTime = 0;
      dropTop.play();
      levelUp();
    } else if (current_level === 4 && isChallenging) {
      current_level = 5;
      gasolina.pause();
      dropTop.pause();
      zeze.currentTime = 0;
      zeze.play();
      levelUp();
    } else if (current_level === 5 && isChallenging) {
      current_level = 6;
      zeze.pause();
      loveScars.currentTime = 0;
      loveScars.play();
      levelUp();
    } else if (current_level === 6 && isChallenging) {
      current_level = 7;
      // dropTop.pause();
      // zeze.currentTime = 0;
      // zeze.play();
      levelUp();
    } else if (current_level === 7 && isChallenging) {
      current_level = 8;
      // dropTop.pause();
      // zeze.currentTime = 0;
      // zeze.play();
      levelUp();
    } else if (current_level === 8 && isChallenging) {
      current_level = 9;
      // dropTop.pause();
      // zeze.currentTime = 0;
      // zeze.play();
      levelUp();
    } else if (current_level === 9 && isChallenging) {
      current_level = 10;
      // dropTop.pause();
      // zeze.currentTime = 0;
      // zeze.play();
      levelUp();
    } else if (current_level === 10 && isChallenging) {
      didWin = true;
      isGameOver = true;
      playerWinSound.play();
    }
    // #endregion
  }
}

function displayGameOver() {
  if (isGameOver) {
    // you won!
    if (didWin) {
      const textOriginX = 50;
      const textOriginY = 100;
      let text = "You Saved Hyperion!";
      ctx.fillStyle = "white";
      ctx.font = "45px Courier New";
      ctx.fillText(text, textOriginX, textOriginY);

      ctx.drawImage(
        hyperionMoonHappy,
        textOriginX + 20,
        textOriginY + 90,
        325,
        275
      );
      const currShip = new Image();
      currShip.src = `/src/images/pixel_ship_${shipNum}.png`;
      ctx.drawImage(currShip, textOriginX + 390, textOriginY + 325, 53, 53);
      const enemyDeath = new Image();
      enemyDeath.src = "/src/images/pixel_enemy_death.png";
      ctx.drawImage(enemyDeath, textOriginX + 390, textOriginY + 105, 53, 53);

      let text2 = "Hit ESC to go back to Start Screen";
      ctx.font = "bold 24px Courier New";
      ctx.fillText(text2, textOriginX + 5, textOriginY + 450);

      ctx.fillStyle = "#9df716";
      ctx.fillRect(textOriginX + 412, textOriginY + 200, 3.75, 15);

      const mittens = new Image();
      mittens.src = "/src/images/pixel_ship_6.png";
      ctx.drawImage(mittens, textOriginX + 150, textOriginY + 70, 53, 53);

      ctx.font = "15px Courier New";
      let text3 = "The secret word is: 'Mittens'";
      ctx.fillText(text3, textOriginX + 210, textOriginY + 60);
    }
    // you lost :(
    else {
      const textOriginX = 100;
      const textOriginY = 100;
      let text = "Game Over!";
      ctx.fillStyle = "white";
      ctx.font = "70px Courier New";
      ctx.fillText(text, textOriginX, textOriginY);

      ctx.drawImage(
        hyperionMoonBurning,
        textOriginX + 80,
        textOriginY + 80,
        250,
        250
      );
      ctx.drawImage(enemy2, textOriginX + 30, textOriginY + 80, 50, 50);
      ctx.drawImage(enemy2, textOriginX + 50, textOriginY + 280, 50, 50);
      ctx.drawImage(enemy2, textOriginX + 340, textOriginY + 230, 50, 50);
      ctx.drawImage(enemy4, textOriginX + 332, textOriginY + 100, 50, 50);
      ctx.drawImage(enemy4, textOriginX + 160, textOriginY + 340, 50, 50);
      ctx.drawImage(enemy4, textOriginX + 20, textOriginY + 180, 50, 50);
      ctx.drawImage(enemy6, textOriginX + 170, textOriginY + 20, 50, 50);
      ctx.drawImage(enemy6, textOriginX + 280, textOriginY + 330, 50, 50);

      let text2 = "Press Space Bar to Restart";
      ctx.font = "bold 24px Courier New";
      ctx.fillText(text2, textOriginX + 20, textOriginY + 445);

      ctx.font = "16px Courier New";
      let text3 = "or hit ESC to choose new ship.";
      ctx.fillText(text3, textOriginX + 60, textOriginY + 485);
    }
  }
}

setInterval(game, 1000 / 20);
