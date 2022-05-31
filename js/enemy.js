
/**
 * Creates a new enemy. 
 * @class
 * 
 * @property {Number} health
 * @property {Object} coords
 * @property {Number} damage
 */
class Enemy {
   constructor(health, coords, damage) {
      this.health = health;
      this.coords = coords;
      this.damage = damage;
   }
}


/**
 * @param {Number} amount
 */
function generateEnemies(amount) {
   for (var i = 0; i < amount; i++) {
      // generate valid coordinates.
      let coords = generateValidCoords();

      let health = pickRandom(ENEMIES_HEALTH);

      let damage = pickRandom(ENEMIES_DAMAGE);

      let enemy = new Enemy(health, coords, damage);

      game.enemies.push(enemy);

      addObjToMap(coords, ENEMY_CODE);
   }
}

function checkEnemy(x,y) {
    const matching_coords = (enemy) => {
        return enemy.coords.x == x && enemy.coords.y == y;
    }
    let enemy = game.enemies.find(matching_coords);

    if (enemy) {
        fightEnemy(enemy);
    }
}
function fightEnemy(enemy) {
   if (player.health - enemy.damage <= 0) {
      gameOver();
      return;
   }
   if (enemy.health - player.weapon.damage <= 0) {
      enemyDefeated(enemy);
   } else {
      enemy.health -= player.weapon.damage;
   }
   player.health -= enemy.damage;
   updateStats();
}

function enemyDefeated(enemy) {

   // remove enemy from  2D array
   removeObjFromMap(enemy.coords.x, enemy.coords.y);

   let left = enemy.coords.x - 1;
   let top = enemy.coords.y - 1
   let right = enemy.coords.x + 1;
   let bot = enemy.coords.y + 1;
   // remove ane enemy from the visible map.
   drawMap(left, top, right, bot);

   // add experience points
   player.xp += Math.round((enemy.damage + enemy.health) / 2);

   // calculate the level in points. Level 1 has no experience so machine-wise it is level 0.
   let level_in_points = POINTS_PER_LEVEL * (player.level - 1)

   // level up if needed.
   if (player.xp - level_in_points >= POINTS_PER_LEVEL) {

      player.level++;
   }

   // remove enemy from enemies array
   let e_idx = game.enemies.indexOf(enemy);

   // remove enemy from array
   game.enemies.splice(e_idx, 1);

   // update stats
   updateStats();

   checkForWin();

   // if no enemies, user wins
  
}