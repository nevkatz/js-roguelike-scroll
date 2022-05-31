

function labelRooms() {
    game.context.fillStyle = 'black';
    game.context.font = '15px Arial';
    game.rooms.forEach(function(room) {

        let txt = `r${room.id} (${room.start.x},${room.start.y})`;

        game.context.fillText(txt, (room.start.x + 1) * TILE_DIM, room.center.y * TILE_DIM);
    });
}
/**
 * Randomly generates a set of dimensions.
 * 
 */
function genDim(baseDim, added, roomType) {
    const BASE_DIM = baseDim || 6;

    let width, height;

    width = height = BASE_DIM;

    const EXTRA_RANGE = 5;

    let additional = added || Math.round(Math.random() * EXTRA_RANGE);

    if (!roomType) {
        roomType = Math.random() < 0.5 ? 'tall' : 'wide';
    }

    if (roomType == 'tall') {
        height += additional;
    } else {
        width += additional;
    }
    return {
        width,
        height
    };
}

/**
 * 
 * @param {Object} center
 * @param {Number} height
 * @param {Number} width
 * 
 */
function setRoomCoords(center, width, height) {


    let halfW = Math.round(width / 2);
    let halfH = Math.round(height / 2);

    let start = {
        x: center.x - halfW,
        y: center.y - halfH
    };

    let end = {
        x: center.x + halfW,
        y: center.y + halfH
    };

    return {
        start,
        end
    };
}
/**
 * Generates one room based on a center point.
 * @param {Object} center {x,y}
 */
function generateRoom(center, width, height) {

    // get coordinates based on width and height
    let {
        start,
        end
    } = setRoomCoords(center, width, height);

    let room = new Room(center, start, end);

    room.id = game.curRoomId;

    return room;

}

function addRoom(coords, baseDim, additional, roomType) {

    let { width,height} = genDim(baseDim, additional, roomType);

    const genCenterCoord = (maxCells, dim) => {
        // get limit on either side based on outer limit and a room dimension - width or height
        let limit = OUTER_LIMIT + Math.round(dim / 2);

        // get range based on cells in array - limit on either side.
        let range = maxCells - 2 * limit;

        // get a random  number within 
        return limit + Math.round(Math.random() * range);
    }

    coords = coords || {
        x: genCenterCoord(COLS, width),
        y: genCenterCoord(ROWS, height)
    }

    let room = generateRoom(coords, width, height);

    for (var gameRoom of game.rooms) {

        if (room.overlaps(gameRoom, 1)) {
            return null;
        }

    }
    game.curRoomId++;
    game.roomToMap(room);
    game.rooms.push(room);
    return room;

}
function printNeighbors() {
    for (var room of game.rooms) {
        let ids = room.neighbors.map(x => x.id);

    }
}
