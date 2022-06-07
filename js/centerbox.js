/**
 * Function for showing the center box. Useful for testing.
 * If you use this, refer to it in your index.html file.
 * 
 * @param {Number} width - pass in COLS for phase 3, WIDTH for phase 3
 * @param {Number} height - pass in ROWS for phase 2, HEIGHT for phase 3
 */ 
function centerBox(width, height) {
    const leftBounds = TILE_DIM*(width - CENTER_BOX.x) / 2;
    const upperBounds = TILE_DIM*(height - CENTER_BOX.y) / 2;

    let w = (CENTER_BOX.x +1 ) * TILE_DIM;
    let h = (CENTER_BOX.y +1 ) * TILE_DIM;

    game.context.beginPath();
    game.context.rect(leftBounds, upperBounds, w, h);

    game.context.strokeStyle = 'navy';
    game.context.lineWidth = 3;
    game.context.stroke();
}