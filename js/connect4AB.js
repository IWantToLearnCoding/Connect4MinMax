/**
 * Minimax (+Alpha-Beta) Implementation
 * @plain javascript version
 */
function Game() {
    this.rows = 6; // Height
    this.columns = 7; // Width
    this.status = 0; // 0: running, 1: won, 2: lost, 3: tie
    this.depth = 8; // Search depth
    this.score = 100000, // Win/loss score
    this.round = 0; // 0: Human, 1: Computer
    this.winning_array = []; // Winning (chips) array
    // this.iterations = 0; // Iteration count
    this.roundsFinished = 0;
    this.stopped = false;
    this.rajMsgs = [
        'Wait Raj, I am thinking...',
        'Lemme think, Whats your face...',  
        'hmmm....What am I seeing!!!',
        'You are getting smart Raj ;)',
        'Arguably, that was a Raj play'
    ];
    this.winnningMsgs = [
        'Its not easy to beat me :)',
        'hahahaha....',
        'You got to improve Raj',
        'Need some lessons?!?!... meet me at Grandstand',
        'Come some other day, Raj...'
    ];
    that = this;

    that.init();
}

Game.prototype.init = function() {
    // Generate 'real' board
    // Create 2-dimensional array
    var game_board = new Array(that.rows);
    for (var i = 0; i < game_board.length; i++) {
        game_board[i] = new Array(that.columns);

        for (var j = 0; j < game_board[i].length; j++) {
            game_board[i][j] = null;
        }
    }

    // Create from board object (see board.js)
    this.board = new Board(this, game_board, 0);

    // Generate visual board
    var game_board = "";
    for (var i = 0; i < that.rows; i++) {
        game_board += "<tr>";
        for (var j = 0; j < that.columns; j++) {
            game_board += "<td class='empty'></td>";
        }
        game_board += "</tr>";
    }

    document.getElementById('game_board').innerHTML = game_board;

    // Action listeners
    var td = document.getElementById('game_board').getElementsByTagName("td");

    for (var i = 0; i < td.length; i++) {
        if (td[i].addEventListener) {
            td[i].addEventListener('click', that.act, false);
        } else if (td[i].attachEvent) {
            td[i].attachEvent('click', that.act)
        }
    }
}

/**
 * On-click event
 */
Game.prototype.act = function(e) {
    var element = e.target || window.event.srcElement;

    // Human round
    if (that.round == 0) that.place(element.cellIndex);

    // Computer round
    if (that.round == 1) that.generateComputerDecision();
}

Game.prototype.place = function(column) {
    // If not finished
    if (that.board.score() != that.score && that.board.score() != -that.score && !that.board.isFull()) {
        for (var y = that.rows - 1; y >= 0; y--) {
            if (document.getElementById('game_board').rows[y].cells[column].className == 'empty') {
                if (that.round == 1) {
                    document.getElementById('game_board').rows[y].cells[column].className = 'coin cpu-coin';
                } else {
                    document.getElementById('game_board').rows[y].cells[column].className = 'coin human-coin';
                }
                break;
            }
        }

        if (!that.board.place(column)) {
            return alert("Invalid move!");
        }

        that.round = that.switchRound(that.round);
        that.updateStatus();
    }
}

Game.prototype.generateComputerDecision = function() {
    if(that.roundsFinished === 4) {
        that.depth = 10;
    } else if(that.roundsFinished === 6) {
        that.depth = 12;
    } else if(that.roundsFinished === 12) {
        that.depth = 10;
    } else if(that.roundsFinished === 14) {
        that.depth = 8;
    }
    if (that.board.score() != that.score && that.board.score() != -that.score && !that.board.isFull()) {
        var html = document.getElementById('loading')
        var randomNum = Math.floor(Math.random()*10);
        randomNum = randomNum ? randomNum : randomNum + 1;
        html.innerHTML = that.rajMsgs[Math.abs(randomNum-5)];
        html.style.display = "block"; // Loading message

        // AI is thinking
        setTimeout(function() {

            // Algorithm call
            var ai_move = that.maximizePlay(that.board, that.depth);
            // Place ai decision
            if(that.stopped) {
                that.updateStatus();
                return;
            }

            that.place(ai_move[0]);

            document.getElementById('loading').style.display = "none"; // Remove loading message
        }, 100);
    }
    that.roundsFinished += 1;
}

/**
 * Algorithm
 * Minimax principle
 */
Game.prototype.maximizePlay = function(board, depth, alpha, beta) {
    // Call score of our board
    var score = board.score();

    if(that.stopped === true) return [null, score];

    // Break
    if (board.isFinished(depth, score)) return [null, score];

    // Column, Score
    var max = [null, -99999];

    // For all possible moves
    for (var column = 0; column < that.columns; column++) {
        var new_board = board.copy(); // Create new board

        if (new_board.place(column)) {

            // that.iterations++; // Debug

            var next_move = that.minimizePlay(new_board, depth - 1, alpha, beta); // Recursive calling

            // Evaluate new move
            if (max[0] == null || next_move[1] > max[1]) {
                max[0] = column;
                max[1] = next_move[1];
                alpha = next_move[1];
            }

            if (alpha >= beta) return max;
        }
    }

    return max;
}

Game.prototype.minimizePlay = function(board, depth, alpha, beta) {
    var score = board.score();

    if(that.stopped === true) return [null, score];

    if (board.isFinished(depth, score)) return [null, score];

    // Column, score
    var min = [null, 99999];

    for (var column = 0; column < that.columns; column++) {
        var new_board = board.copy();

        if (new_board.place(column)) {

            // that.iterations++;

            var next_move = that.maximizePlay(new_board, depth - 1, alpha, beta);

            if (min[0] == null || next_move[1] < min[1]) {
                min[0] = column;
                min[1] = next_move[1];
                beta = next_move[1];
            }

            if (alpha >= beta) return min;

        }
    }
    return min;
}

Game.prototype.switchRound = function(round) {
    // 0 Human, 1 Computer
    if (round == 0) {
        return 1;
    } else {
        return 0;
    }
}

Game.prototype.updateStatus = function() {
    // Human won
    if (that.board.score() == -that.score) {
        that.status = 1;
        that.markWin();
        alert("You have won!");
    }

    // Computer won
    if (that.board.score() == that.score) {
        that.status = 2;
        that.markWin();
        var randomNum = Math.floor(Math.random()*10);
        randomNum = randomNum ? randomNum : randomNum + 1;
        alert(that.winnningMsgs[Math.abs(randomNum-5)]);
    }

    // Tie
    if (that.board.isFull()) {
        that.status = 3;
        alert("Tie!");
    }

    if(that.stopped) {
        that.stopped = false;
        alert('stopped');
    }

}

Game.prototype.markWin = function() {
    document.getElementById('game_board').className = "finished";
    for (var i = 0; i < that.winning_array.length; i++) {
        var name = document.getElementById('game_board').rows[that.winning_array[i][0]].cells[that.winning_array[i][1]].className;
        document.getElementById('game_board').rows[that.winning_array[i][0]].cells[that.winning_array[i][1]].className = name + " win";
    }
}

Game.prototype.restartGame = function() {
    if (confirm('Game is going to be restarted.\nAre you sure?')) {
        // Dropdown value
        that.depth = 8;
        that.status = 0;
        that.round = 0;
        that.init();
        that.updateStatus();
    }
}

Game.prototype.stopGame = function () {
    that.stopped = true;
    setTimeout(function(){
        that.depth = 8;
        that.status = 0;
        that.round = 0;
        that.init();
        that.updateStatus();
    }, 100)
};

/**
 * Start game
 */
function Start() {
    window.Game = new Game();
}

window.onload = function() {
    Start()
};
