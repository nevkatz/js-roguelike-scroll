/**
 *  Game Constants
 * 
 */ 
// dimensions
const COLS = 80;
const ROWS = 60;

const WIDTH = 50;
const HEIGHT = 30;
const TILE_DIM = 10;

const STATIC_DIM = {
   x:12,
   y:12
}
/**
 * If abs player position.y is > 10 cols or < 70 rows 
 * If abs.player position.x is > 10 cols or < 50 rows
 * 
 */ 
const DEBUG = true;
const OUTER_LIMIT = 3;
const SHADOW_CODE = 0;
const VISIBLE_CODE = 1;

const WALL_CODE = 0;
const FLOOR_CODE = 1;
const PLAYER_CODE = 2;
const ENEMY_CODE = 3;
const POTION_CODE = 4;
const WEAPON_CODE = 5;
const RELIC_CODE = 6;

const POTIONS = [10, 20, 30, 40, 50];

// possible health that enemies can have
const ENEMIES_HEALTH = [30, 30, 30, 30, 40, 40, 60, 80];

// possible damage thatxenemies can inflict
const ENEMIES_DAMAGE = [30, 30, 30, 30, 40, 40, 60, 80];

const POINTS_PER_LEVEL = 100;

// the visible area
const VISIBILITY = 3;

const TOTAL_ENEMIES = 15;
const STARTING_POTIONS_AMOUNT = 10;
const STARTING_WEAPONS_AMOUNT = 10;

const TILE_COLORS = [
   // wall
   'grey',
   // floor
   'white',
   // player
   'blue',
   // enemy
   'red',
   // health drop
   'green',
   // weapon
   'orange',

   // relic
   '#a117f2'
];


/**
 * Classes 
 */

/**
 * Creates a new player. 
 * @class
 * 
 * @property {number} level - starts at one and progresses
 * @property {number} health - keep this above zero
 * @property {string} weapon - ties to an object with a damage rating
 * @property {object} coords - location on the grid
 * @property {number} xp - experience points
 * @property {relics} relics - relics collected
 */
class Player {
   constructor(level, health, weapon, coords, xp, relics) {
      this.level = level;
      this.health = health;
      this.weapon = weapon;
      this.coords = coords;
      this.relics = relics;
      this.xp = xp;
   }
}


/**
 * Constants
 */
const WEAPONS = [{
      name: "Dagger",
      damage: 15
   },
   {
      name: "Sword",
      damage: 30
   },
   {
      name: "Hammer",
      damage: 60
   },
   {
      name: "Axe",
      damage: 100
   }
];

// game object

/**
 * 
 * @param {Sring} label - the visible label of the stat
 * @param {HTMLElement} container - the parent container we add it to
 */
function addStat(label, container) {
   let el = document.createElement('li');
   let id = label.toLowerCase();
   let value = '0';
   el.innerHTML = `<label>${label}</label>: <span id="${id}">${value}</span>`
   container.appendChild(el);
   return container;
}

function createDOM() {

   let container = document.getElementById('container');

   let hud = document.createElement('ul');

   hud.id = 'hud';

   let labels = ['XP', 'Level', 'Health', 'Weapon', 'Damage', 'Enemies','Relics'];

   for (var label of labels) {
      hud = addStat(label, hud);
   }
   container.appendChild(hud);

   // add canvas
   let canvas = document.createElement('canvas');
   canvas.id = 'grid';

   canvas.height = HEIGHT * TILE_DIM;
   canvas.width = WIDTH * TILE_DIM;

   container.appendChild(canvas);

   // create the button
   let btn = document.createElement('button');
   btn.className = 'toggle';
   btn.textContent = 'Toggle Shadow';

   container.appendChild(btn);

   btn.addEventListener('click', toggleShadow);
}

function toggleShadow() {
   game.isShadowToggled = !game.isShadowToggled;
   drawMap(0, 0, COLS, ROWS);

   if (game.offset.y != 0 || game.offset.x != 0) {
      drawOffsetRegion();
   }
}

/**
 *  HTML5 Canvas
 */
var game = null;
var player = null;

function init() {
   createDOM();
   game = new Game();
   game.canvas = document.getElementById("grid");
   game.context = game.canvas.getContext("2d");
   startGame();
   document.addEventListener('keydown', checkDirection);

}
init();


/**
 * Start Game
 */


function startGame() {

  let ready = sequentialRooms();

  if (ready) {
     generatePlayer();
     generateShadow();
     generateItems(STARTING_WEAPONS_AMOUNT, WEAPON_CODE);
     generateItems(STARTING_POTIONS_AMOUNT, POTION_CODE);
     generateEnemies(TOTAL_ENEMIES);
     updateStats();
     centerPlayer();
     drawMap(0, 0, COLS, ROWS);

     if (game.offset.y != 0 || game.offset.x != 0) {
        drawOffsetRegion();
     }

  }
}



/**
 * @param {Number} quantity - the number of items to generate
 * @param {Number} tileCode - corresponds to a constant, such as POTION_CODE.
 *                            used to index into the TILE_COLORS array
 */
function generateItems(quantity, tileCode) {
   for (var i = 0; i < quantity; i++) {

      let coords = generateValidCoords();

      placeItem(coords,tileCode);
   }
}
function placeItem(coords,tileCode) {
   
   addObjToMap(coords, tileCode);

   if (tileCode == PLAYER_CODE || 
       !game.isShadowToggled ||
        game.shadow[coords.y][coords.x] == VISIBLE_CODE) {
         let color = TILE_COLORS[tileCode];
         drawObject(coords.x, coords.y, color);
   }
}

/**
 * 
 * @TODO: Update so it's pure javaScript
 * use an array for the first three
 * use standalone functions for the others
 */
function updateStats() {

   let player_props = ['xp', 'level', 'health'];

   for (var prop of player_props) {
      let el = document.getElementById(prop);

      el.textContent = player[prop];
   }
   let el = document.getElementById('relics');

   el.textContent = `${player.relics}/${game.relics}`;

   let weapon_props = [{
         domId: 'weapon',
         key: 'name',
      },
      {
         domId: 'damage',
         key: 'damage'
      }
   ];

   for (var prop of weapon_props) {

      let {
         domId,
         key
      } = prop;

      let el = document.getElementById(domId);

      el.textContent = player.weapon[key];
   }


   let stats = document.getElementById('enemies');

   stats.textContent = game.enemies.length;

  
}


/**
 *
 * @param {Number} startX
 * @param {Number} startY
 * @param {Number} endX
 * @param {Number} endY
 * 
 */
function drawMap(startX, startY, endX, endY) {

   // loop through all cells of the map
   for (var row = startY; row < endY; row++) {

      for (var col = startX; col < endX; col++) {

         let color = null;

         // if shadow is on and the shadow is down....

         if (game.isShadowToggled && game.shadow[row] && game.shadow[row][col] == SHADOW_CODE) {
            // simply draw black.
            color = '#000';

         } else {
            let c_idx = game.map[row][col];

            color = TILE_COLORS[c_idx];
         }
         drawObject(col, row, color);

      } // end loop
   }
}

/**
 * Coordinate Helper Functions
 */

function generateValidCoords() {

   var x=null, y=null;

   let turns = 0,
      limit = 100;

   do {
      x = Math.floor(Math.random() * COLS);
      y = Math.floor(Math.random() * ROWS);
      turns++;
   }
   while (game.map[y][x] != FLOOR_CODE && turns < limit);

   return {x,y};

}

function pickRandom(arr) {
   let idx = Math.floor(Math.random() * arr.length);

   return arr[idx];
}


function generatePlayer() {

   //let coords = generateValidCoords();

   let coords = {
      x: COLS / 2,
      y: ROWS / 2
   };

   // level, health, weapon, coords, xp
   player = new Player(1, 100, WEAPONS[0], coords, 30, 0);

   addObjToMap(player.coords, PLAYER_CODE);
}

// add given coords to map 
// make the coords and neighbors busy
// and draw object with given color
function addObjToMap(coords, tileCode) {
   game.map[coords.y][coords.x] = tileCode;
}

/**
 * @param {Number} x
 * @param {Number} y
 * @param {String} color
 * @param {Static} flag for not using offset
 */
function drawObject(x, y, color) {

   y = y + game.offset.y;
   x = x + game.offset.x;

   game.context.beginPath();
   game.context.rect(x * TILE_DIM, y * TILE_DIM, TILE_DIM, TILE_DIM);
   game.context.fillStyle = color;
   game.context.fill();
}






function checkForWin() {

   if (game.enemies.length == 0 && 
      game.itemsLeft(RELIC_CODE)==0) {
      userWins();
   }
}





function userWins() {
   alert("YOU CONQUERED THE DUNGEON!");
   game.reset();
   startGame();
};

function gameOver() {
   alert("GAME OVER");
   game.reset();
   startGame();
};

function removeObjFromMap(x, y) {
   // make this a floor coordinate
   game.map[y][x] = FLOOR_CODE;
};


/**
 * Generates a shadow in the 2D array based on the player's position.
 */
function generateShadow() {

   game.shadow = [];
   let start = {},
      end = {};

   let left_edge = player.coords.x - VISIBILITY;
   let top_edge = player.coords.y - VISIBILITY;

   start.x = left_edge < 0 ? 0 : left_edge;
   start.y = top_edge < 0 ? 0 : top_edge;

   let right_edge = player.coords.x + VISIBILITY;
   let bot_edge = player.coords.y + VISIBILITY;

   end.x = right_edge >= COLS ? COLS - 1 : right_edge;
   end.y = bot_edge >= ROWS ? ROWS - 1 : bot_edge;

   // iterate through all squares on the map
   for (var row = 0; row < ROWS; row++) {
      game.shadow.push([]);
      for (var col = 0; col < COLS; col++) {
         // if this falls within visible doorTiles, push 1
         if (row >= start.y && row <= end.y && col >= start.x && col <= end.x) {
            game.shadow[row].push(VISIBLE_CODE);
            // else, push 0
         } else {
            game.shadow[row].push(SHADOW_CODE);
         }
      }
   }
}

/**
 * Removes old player square from map
 * Adds new square
 * resets shadow
 * @param {Number} oldX
 * @param {Number} oldY
 * @param {Number} newX
 * @param {Number} newY
 */
function updatePlayerPosition(oldX, oldY, newX, newY) {
   removeObjFromMap(oldX, oldY);

   // set this as the player
   game.map[newY][newX] = PLAYER_CODE;

   player.coords = {
      x: newX,
      y: newY 
   };

   let start = {},
      end = {};

   // if player is going right and down
   let old_left = oldX - VISIBILITY;
   let old_top = oldY - VISIBILITY;

   start.x = old_left < 0 ? 0 : old_left;
   start.y = old_top < 0 ? 0 : old_top;

   let new_right = newX + VISIBILITY;
   let new_bot = newY + VISIBILITY;

   end.x = new_right >= COLS ? COLS - 1 : new_right;
   end.y = new_bot >= ROWS ? ROWS - 1 : new_bot;

   // if player is moving left
   if (oldX > newX) {
      // use newX rather than oldX as the left edge of the square.
      start.x = newX - VISIBILITY;
      // make sure to turn the right part of the square black
      // the right edge of the square is more to the right.
      end.x = oldX + VISIBILITY;
   }
   // if player is moving up
   if (oldY > newY) {
      // newY is less so it's better to use it than oldY
      // the top edge of the rendering area is higher
      // make sure that you re-render the squares that have to change above the player
      start.y = newY - VISIBILITY;
      // the bottom edge is lower
      end.y = oldY + VISIBILITY;
   }

   for (var row = start.y; row <= end.y; row++) {
      for (var col = start.x; col <= end.x; col++) {

         if (row >= newY - VISIBILITY &&
            row <= newY + VISIBILITY &&
            col >= newX - VISIBILITY &&
            col <= newX + VISIBILITY) {
            // show shadow
            game.shadow[row][col] = VISIBLE_CODE;
         } else {
            // no shadow
            game.shadow[row][col] = SHADOW_CODE;
         }
      }
   }
}

/**
 * Code from this phase
 */ 
// key down events

function checkDirection(e) {
    // prevent the default action (scroll / move caret)
    e.preventDefault();

    let {x,y} = player.coords;

    let offset = {
        x: 0,
        y: 0
    };
    let absPos = {
        x: x + game.offset.x,
        y: y + game.offset.y
    };
    switch (e.which) {
        case 37: // left
            x--;
            if (absPos.x < (WIDTH - STATIC_DIM.x) / 2) {
                offset.x = 1;
            }
            break;
        case 38: // up
            y--;
            if (absPos.y < (HEIGHT - STATIC_DIM.y) / 2) {
                offset.y = 1;
            }
            break;
        case 39: // right
            x++;
            if (absPos.x > (WIDTH + STATIC_DIM.x) / 2) {
                offset.x = -1;
            }
            break;
        case 40: // down
            y++;
            if (absPos.y > (HEIGHT + STATIC_DIM.y) / 2) {
                offset.y = -1;
            }
            break;
        default:
            return; // exit this handler for other keys
    }
    if (game.map[y][x] == ENEMY_CODE) {

        checkEnemy(x, y);

    } else if (game.map[y][x] != WALL_CODE) {

        game.offset.y += offset.y;
        game.offset.x += offset.x;

        movePlayer(x, y, offset);
    }
}

function movePlayer(x, y, offset) {
    // if next spot is potion
    if (game.map[y][x] == POTION_CODE) {

        player.health += pickRandom(POTIONS);

        removeObjFromMap(x, y);
        generateItems(1, POTION_CODE);
        // if next spot is weapon
    } else if (game.map[y][x] == WEAPON_CODE) {

        player.weapon = pickRandom(WEAPONS);

        removeObjFromMap(x, y);
        generateItems(1, WEAPON_CODE);
    } else if (game.map[y][x] == RELIC_CODE) {
        player.relics++;
        const maxValue = 10;
        player.xp += Math.round(Math.random() * maxValue);
        removeObjFromMap(x, y);
        checkForWin();
    }
    let {
        x: oldX,
        y: oldY
    } = player.coords;
    // update player position
    updatePlayerPosition(oldX, oldY, x, y);

    updateStats();

    if (offset.x != 0 || offset.y != 0) {
        drawMap(0, 0, COLS, ROWS);
        drawOffsetRegion();
    } else {
        let left = oldX - VISIBILITY - 1;
        let top = oldY - VISIBILITY - 1;
        let right = x + VISIBILITY + 2;
        let bot = y + VISIBILITY + 2;
        drawMap(left, top, right, bot);
    }
}

function centerPlayer() {
   let { coords } = player;

   game.offset.x = -1*coords.x + WIDTH/2;

   game.offset.y = -1*coords.y + HEIGHT/2;

}
function drawOffsetRegion() {
   let shadowColor = '#000', wallColor = TILE_COLORS[WALL_CODE];
   
   let color = (game.isShadowToggled) ? shadowColor : wallColor;

   game.context.fillStyle = color;

   let vertRegion = {
     x:0,
     y:0,
     width: Math.abs(game.offset.x),
     height: ROWS 
   }
       // for vert region
   if (game.offset.x < 0) {
        vertRegion.x = COLS - vertRegion.width
   }

   let horizRegion = {
    x:0,
    y:0,
    width: COLS,
    height: Math.abs(game.offset.y)
   }

    // for horiz region
    if (game.offset.y < 0) {
        horizRegion.y = ROWS - horizRegion.height
    }
    const drawRegion = (region) => {
        let x = region.x * TILE_DIM;
        let y = region.y * TILE_DIM;
        let w = region.width * TILE_DIM;
        let h = region.height * TILE_DIM;
        game.context.rect(x, y, w, h);
    };

    game.context.beginPath();
    drawRegion(vertRegion);
    drawRegion(horizRegion);
    game.context.fill();


}