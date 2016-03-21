/**
 * @param obj
 * @param grid
 * @returns {Array}
 */
function getAdjacentSquares(obj, grid) {
        var cell,
            x = obj.x,
            y = obj.y,
            mY = grid.length - 1,
            mX = grid[0].length - 1;

    //  0  1  2
    //  3  .  4
    //  5  6  7
    var results = [];

    for (var i = Math.max(0,y-1); i <= Math.min(mY,y+1); i++) {
        for (var j =  Math.max(0,x-1); j <= Math.min(mX,x+1); j++) {
            if (i != y || j != x) {
                cell = grid[i][j];
                if (cell) results.push(cell);
            }
        }
    }

    return results;
}

/**
 * Touch all adjacent squares (there are 8)
 * Setting to either a number OR open state
 * If adjacent square results in OPEN state: TOUCH it also
 * @param cell
 * @param grid
 * @returns {*}
 */
function touchAdjacent(cell, grid) {
    var stack = [];

    stack.push(cell);

    while (stack.length > 0) {
        var squares,
            num_mines = 0,
            curCell = stack.pop(),
            i,
            sq;

        squares = getAdjacentSquares(curCell, grid);

        // calc # of mines
        for (i = 0; i < squares.length; i++) {
            sq = squares[i];
            if (sq.mine) {
                num_mines += 1;
            }
        }
        curCell.number = num_mines;
        if (num_mines > 0) {
            curCell.state = 'number';
        }
        else {
            curCell.state = 'open';
            for (i = 0; i < squares.length; i++) {
                sq = squares[i];
                if (sq.state !== 'open' && sq.state !== 'number') {
                    stack.push(sq);
                }
            }
        }
    }
}

function minesweeperCalculateWin(grid,mines) {
    var closed_cells = 0,
        cell;

    for (var y = 0; y < grid.length; y++) {
        for (var x = 0; x < grid[0].length; x++) {
            cell = grid[y][x];
            if (!(cell.state === 'open' || cell.state === 'number')) {
                closed_cells += 1;
            }
        }
    }

    return (mines === closed_cells);
}

if (this.document === undefined) {
    onmessage = function (p){
        var data = JSON.parse(p.data),
            grid = data.grid,
            resp = {};
        resp.type = data.type;
        if (data.type === 'calc_win') {
            resp.win = minesweeperCalculateWin(grid,data.mines);
        }
        else {
            var cell = grid[data.y][data.x];
            if (data.type === 'touch_adjacent') {
            // This takes 1-2 seconds
            // After work is finished pass the grid state back to main
                touchAdjacent(cell, grid);
            }
            else if (data.type === 'get_adjacent') {
                var squares = getAdjacentSquares(cell, grid);
                var nrFlag = 0;
                for (var i = 0 ; i < squares.length; i++) {
                    var sq = squares[i];
                    if (sq.state == 'flagged') nrFlag++;
                }
                if (nrFlag == cell.number) {
                    for (var i = 0 ; i < squares.length; i++) {
                        var sq = squares[i];
                        if (sq.mine) {
                            if(sq.state != 'flagged') {
                                resp.type = 'explode';
                                resp.cell = sq;
                                break;
                            }
                        }
                        else {
                            touchAdjacent(sq, grid);
                        }
                    }
                }
            }
            resp.grid = grid;
        }
        postMessage(JSON.stringify(resp));
    }
}
