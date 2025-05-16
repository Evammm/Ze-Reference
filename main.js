/*
Evan's overview
--------SYNTAX-------
<tr> : sets up a row for a table or column - used in : Windows 98 sylte in BuildTable(), 
sizeLookup : uses object properties to translate a board size to a bomb number and size of board
[x]Image : looks up image in CS file (NOT INLCUDED) to come up with images for each state of cell
colors : uses object properties to give each number a place to lookup its colour in the object
------FUNCTIONS------
addBombs() {
  looks up SIZE on SIZELOOKUP to find TOTALBOMBS
  generates a random column and row to place a bomb, given it isnt already a bomb (!currentcell.bomb) and decreases TOTALBOMBS
  ends when TOTALBOMBS = 0
}
createResetListener() {
  uses html and a click listener to rerender the game fully to reset it
}
boardE1eventlistener {
  returns if you hit a bomb or won with the click
  parses information from the cell you clicked
  if it is in fact a cell it sets a timer if there is none and parses integers corresponding to its coordinates in the grid
  if you are holding shif and click, as long as there are still bombs left, you place a flag
  if you aren't, it reveals the cell
  if you reveal a bomb, it resets the timer and loses you
  it rerenders the game and runs GETWINNER()
}
getWinner() {
  it checks every row and column with for loops
  if any of these cells are not revealed and not a bomb, it returns false
  if no cells are not revealed and not a bomb, it returns true
}

eventlistenersizebuttons {
  when clicking a size button, sets the size to be that button
}

setTimer {
  makes a the var TIMERID an interval that adds 1 to the timer and updates the html every second
}

revealAll {
  for each row and cell in row it calls for CELL.REVEAL
}

buildTable {
  uses SIZE to format a CSS table to look like the window 98 asthetic
  initializes CREATERESETLISTENER and initalizes the var CELL and initializes the queries for finding a cell in the grid
}

buildArrays {
  makes the array ARR with the size as the var SIZE and returns ARR to be used later
}

buildCells {
  for each row in ARR it takes every column and assigns it a cell with coordinates and logic for being inside of the board
  runs ADDBOMBS()
  tells each cell to calculate adjacent bombs with CELL.CALCADJBOMBS() inside of RUNCODEFORALLCELLS
}

runCodeForAllCells{
  takes every row and every column in each row and runs code specified in funcion
}

getBombCount {
  uses var COUNT to check every cell in every row for CELL.BOMB and then add every bomb together
  returns COUNT
}

render{

}

init{
builds table using BUILDTABLE
builds array using BUILDARRAY
builds cells using BUILDCELLS
sets var bombcount to GETBOMBCOUNT
sets ELASPEDTIME to 0
clears any TIMER
sets HITBOMB and WINNER to FALSE
}

*/


/*----- constants -----*/
var bombImage = '<img src="images/bomb.png">';
var flagImage = '<img src="images/flag.png">';
var wrongBombImage = '<img src="images/wrong-bomb.png">';
var sizeLookup = {
  '9': {totalBombs: 10, tableWidth: '245px'},
  '16': {totalBombs: 40, tableWidth: '420px'},
  '30': {totalBombs: 160, tableWidth: '794px'}
};
var colors = [
  '',
  '#0000FA',
  '#4B802D',
  '#DB1300',
  '#202081',
  '#690400',
  '#457A7A',
  '#1B1B1B',
  '#7A7A7A',
];

/*----- app's state (variables) -----*/
var size = 16;
var board;
var bombCount;
var timeElapsed;
var adjBombs;
var hitBomb;
var elapsedTime;
var timerId;
var winner;

/*----- cached element references -----*/
var boardEl = document.getElementById('board');

/*----- event listeners -----*/
document.getElementById('size-btns').addEventListener('click', function(e) {
  size = parseInt(e.target.id.replace('size-', ''));
  init();
  render();
});

boardEl.addEventListener('click', function(e) {
  if (winner || hitBomb) return;
  var clickedEl;
  clickedEl = e.target.tagName.toLowerCase() === 'img' ? e.target.parentElement : e.target;
  if (clickedEl.classList.contains('game-cell')) {
    if (!timerId) setTimer();
    var row = parseInt(clickedEl.dataset.row);
    var col = parseInt(clickedEl.dataset.col);
    var cell = board[row][col];
    if (e.shiftKey && !cell.revealed && bombCount > 0) {
      bombCount += cell.flag() ? -1 : 1;
    } else {
      hitBomb = cell.reveal();
      if (hitBomb) {
        revealAll();
        clearInterval(timerId);
        e.target.style.backgroundColor = 'red';
      }
    }
    winner = getWinner();
    render();
  }
});

function createResetListener() { 
  document.getElementById('reset').addEventListener('click', function() {
    init();
    render();
  });
}

/*----- functions -----*/
function setTimer () {
  timerId = setInterval(function(){
    elapsedTime += 1;
    document.getElementById('timer').innerText = elapsedTime.toString().padStart(3, '0');
  }, 1000);
};

function revealAll() {
  board.forEach(function(rowArr) {
    rowArr.forEach(function(cell) {
      cell.reveal();
    });
  });
};


// this function is used to set up the old window 98 style boarder
function buildTable() {
  var topRow = `
  <tr>
    <td class="menu" id="window-title-bar" colspan="${size}">
      <div id="window-title"><img src="images/mine-menu-icon.png"> Minesweeper</div>
      <div id="window-controls"><img src="images/window-controls.png"></div>
    </td>
  <tr>
    <td class="menu" id="folder-bar" colspan="${size}">
      <div id="folder1"><a href="https://github.com/nickarocho/minesweeper/blob/master/readme.md" target="blank">Read Me </a></div>
      <div id="folder2"><a href="https://github.com/nickarocho/minesweeper" target="blank">Source Code</a></div>
    </td>
  </tr>
  </tr>
    <tr>
      <td class="menu" colspan="${size}">
          <section id="status-bar">
            <div id="bomb-counter">000</div>
            <div id="reset"><img src="images/smiley-face.png"></div>
            <div id="timer">000</div>
          </section>
      </td>
    </tr>
    `;
  boardEl.innerHTML = topRow + `<tr>${'<td class="game-cell"></td>'.repeat(size)}</tr>`.repeat(size);
  boardEl.style.width = sizeLookup[size].tableWidth;
  createResetListener();
  var cells = Array.from(document.querySelectorAll('td:not(.menu)'));
  cells.forEach(function(cell, idx) {
    cell.setAttribute('data-row', Math.floor(idx / size));
    cell.setAttribute('data-col', idx % size);
  });
}

function buildArrays() {
  var arr = Array(size).fill(null);
  arr = arr.map(function() {
    return new Array(size).fill(null);
  });
  return arr;
};

function buildCells(){
  board.forEach(function(rowArr, rowIdx) {
    rowArr.forEach(function(slot, colIdx) {
      board[rowIdx][colIdx] = new Cell(rowIdx, colIdx, board);
    });
  });
  addBombs();
  runCodeForAllCells(function(cell){
    cell.calcAdjBombs();
  });
};

function init() {
  buildTable();
  board = buildArrays();
  buildCells();
  bombCount = getBombCount();
  elapsedTime = 0;
  clearInterval(timerId);
  timerId = null;
  hitBomb = false;
  winner = false;
};

function getBombCount() {
  var count = 0;
  board.forEach(function(row){
    count += row.filter(function(cell) {
      return cell.bomb;
    }).length
  });
  return count;
};

function addBombs() {
  var currentTotalBombs = sizeLookup[`${size}`].totalBombs;
  while (currentTotalBombs !== 0) {
    var row = Math.floor(Math.random() * size);
    var col = Math.floor(Math.random() * size);
    var currentCell = board[row][col]
    if (!currentCell.bomb){
      currentCell.bomb = true
      currentTotalBombs -= 1
    }
  }
};

function getWinner() {
  for (var row = 0; row<board.length; row++) {
    for (var col = 0; col<board[0].length; col++) {
      var cell = board[row][col];
      if (!cell.revealed && !cell.bomb) return false;
    }
  } 
  return true;
};

function render() {
  document.getElementById('bomb-counter').innerText = bombCount.toString().padStart(3, '0');
  var seconds = timeElapsed % 60;
  var tdList = Array.from(document.querySelectorAll('[data-row]'));
  tdList.forEach(function(td) {
    var rowIdx = parseInt(td.getAttribute('data-row'));
    var colIdx = parseInt(td.getAttribute('data-col'));
    var cell = board[rowIdx][colIdx];
    if (cell.flagged) {
      td.innerHTML = flagImage;
    } else if (cell.revealed) {
      if (cell.bomb) {
        td.innerHTML = bombImage;
      } else if (cell.adjBombs) {
        td.className = 'revealed'
        td.style.color = colors[cell.adjBombs];
        td.textContent = cell.adjBombs;
      } else {
        td.className = 'revealed'
      }
    } else {
      td.innerHTML = '';
    }
  });
  if (hitBomb) {
    document.getElementById('reset').innerHTML = '<img src=images/dead-face.png>';
    runCodeForAllCells(function(cell) {
      if (!cell.bomb && cell.flagged) {
        var td = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
        td.innerHTML = wrongBombImage;
      }
    });
  } else if (winner) {
    document.getElementById('reset').innerHTML = '<img src=images/cool-face.png>';
    clearInterval(timerId);
  }
};

function runCodeForAllCells(cb) {
  board.forEach(function(rowArr) {
    rowArr.forEach(function(cell) {
      cb(cell);
    });
  });
}

init();
render();