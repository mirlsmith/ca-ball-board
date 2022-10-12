'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const PASSAGE = 'PASSAGE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'

const audioEatBall = new Audio('sound/eatball.mp3')
const audioWin = new Audio('sound/win.mp3')


var gTotalBalls = 10
var gBallsOut = 0
var gBallsEaten = 0

var gBallIntervalId

// Model:
var gBoard
var gGamerPos

function onInitGame() {
	gGamerPos = { i: 2, j: 9 }
	gameSetup()
}

function gameSetup() {
	gBoard = buildBoard()
	renderBoard(gBoard)
	//add balls
	gBallIntervalId = setInterval(addRandomBall, 2000)
}

function buildBoard() {
	// Create the Matrix 10 * 12 
	var board = createMat(10, 12)
	var midRow = Math.ceil(board.length / 2)
	var midCol = Math.floor(board[0].length / 2) - 1
	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			board[i][j] = { type: FLOOR, gameElement: null }
			if (i === 0 || i === board.length - 1 ||
				j === 0 || j === board[0].length - 1) {
				//place passages
				if (i === midRow || j === midCol) board[i][j].type = PASSAGE
				else board[i][j].type = WALL
			}

		}
	}

	// Place the gamer
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER

	return board
}

// Render the board to an HTML table
function renderBoard(board) {
	var strHTML = ''
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n'
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j]
			var cellClass = getClassName({ i: i, j: j }) // cell-0-0

			if (currCell.type === FLOOR) cellClass += ' floor'
			else if (currCell.type === WALL) cellClass += ' wall'
			else if (currCell.type === PASSAGE) cellClass += ' passage'

			strHTML += '\t<td class="cell ' + cellClass + '"  onclick="onMoveTo(' + i + ',' + j + ')" >\n'

			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG
			}

			strHTML += '\t</td>\n'
		}
		strHTML += '</tr>\n'
	}

	var elBoard = document.querySelector('.board')
	elBoard.innerHTML = strHTML
}

function addRandomBall() {
	if (gBallsOut === gTotalBalls) {
		clearInterval(gBallIntervalId)
		return
	}

	var placeOpts = []

	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var currCell = gBoard[i][j]
			if (currCell.type === FLOOR && !currCell.gameElement) placeOpts.push({ i: i, j: j })
		}
	}

	var rdnIdx = getRandomInt(0, placeOpts.length - 1)
	var selectedCell = placeOpts[rdnIdx]

	gBoard[selectedCell.i][selectedCell.j].gameElement = BALL
	renderCell(selectedCell, BALL_IMG)
	gBallsOut++
}

// Move the player to a specific location
function onMoveTo(i, j) {

	var targetCell = gBoard[i][j]
	// is WALL
	if (targetCell.type === WALL) return

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i)
	var jAbsDiff = Math.abs(j - gGamerPos.j)

	// is PASSAGE
	if (gBoard[gGamerPos.i][gGamerPos.j].type === PASSAGE) {
		if (gGamerPos.i === 0) {
			if ((i === 1 && jAbsDiff === 0) || (i === gBoard.length - 1 && jAbsDiff === 0))
				move(i, j)
		}
		if (gGamerPos.j === 0) {
			if ((iAbsDiff === 0 && j === 1) || (iAbsDiff === 0 && j === gBoard[0].length - 1))
				move(i, j)
		}
		if (gGamerPos.i === gBoard.length - 1) {
			if ((i === gBoard.length - 2 && jAbsDiff === 0) || (i === 0 && jAbsDiff === 0))
				move(i, j)
		}
		if (gGamerPos.j === gBoard[0].length - 1) {
			if ((iAbsDiff === 0 && j === gBoard[0].length - 2) || (iAbsDiff === 0 && j === 0))
				move(i, j)
		}

		// FLOOR	
		// If the clicked Cell is one of the four allowed
	} else if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
		move(i, j)
	}

	if (gBallsEaten === gTotalBalls) gameOver()
}

function move(i, j) {
	var cell = gBoard[i][j]
	if (cell.gameElement === BALL) {
		audioEatBall.play()
		gBallsEaten++
		document.querySelector('.balls-collected span').innerText = gBallsEaten
	}

	// Move the gamer
	// Moving from current position
	// Update model
	gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
	// Update dom
	renderCell(gGamerPos, '')

	// Moving to selected position
	// Update model
	gGamerPos.i = i
	gGamerPos.j = j
	gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
	// Update dom
	renderCell(gGamerPos, GAMER_IMG)
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector)
	elCell.innerHTML = value
}

// Move the player by keyboard arrows
function onHandleKey(event) {
	var i = gGamerPos.i
	var j = gGamerPos.j

	switch (event.key) {
		case 'ArrowLeft':
			if (j === 0) onMoveTo(i, gBoard[0].length - 1)
			else onMoveTo(i, j - 1)
			break
		case 'ArrowRight':
			if ((j === gBoard[0].length - 1)) onMoveTo(i, 0)
			else onMoveTo(i, j + 1)
			break
		case 'ArrowUp':
			if (i === 0)	onMoveTo(gBoard.length - 1, j)
			else onMoveTo(i - 1, j)
			break
		case 'ArrowDown':
			if (i === gBoard.length - 1)	onMoveTo(0, j)
			else onMoveTo(i + 1, j)
			break
	}
}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j
	return cellClass
}

function gameOver() {
	audioWin.play()
	document.querySelector('.game-over').hidden = false
	gBallsEaten = 0

}

function onPlayAgain() {
	document.querySelector('.game-over').hidden = true
	gBallsOut = 0
	document.querySelector('.balls-collected span').innerText = gBallsEaten
	gameSetup()
}