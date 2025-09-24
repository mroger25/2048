class Game {
  constructor() {
    this.score = 0;
    this.gameBoard = [];
    this.board = document.getElementById("board");
    this.scoreDisplay = document.getElementById("score");
    this.gameOverDisplay = document.getElementById("game-over");
    this.newGameBtn = document.getElementById("new-game");

    this.initializeGame();
    this.addEventListeners();
  }

  initializeGame() {
    this.gameOverDisplay.style.visibility = "hidden";
    this.score = 0;
    this.gameBoard = Array(4)
      .fill()
      .map(() => Array(4).fill(null));
    console.log(this.gameBoard);
    this.renderBoard();
    this.addNewTile();
    this.addNewTile();
  }

  addNewTile() {
    const emptyTiles = this.getEmptyTiles();

    if (emptyTiles.length > 0) {
      const { x, y } =
        emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
      this.gameBoard[y][x] = Math.random() < 0.9 ? 2 : 4;
      this.updateTile(x, y);
    }
  }

  getEmptyTiles() {
    const emptyTiles = [];
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (!this.gameBoard[y][x]) {
          emptyTiles.push({ x, y });
        }
      }
    }

    return emptyTiles;
  }

  renderBoard() {
    this.board.innerHTML = "";

    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const tileValue = this.gameBoard[y][x];
        const value = tileValue === null ? "" : tileValue;
        const tile = document.createElement("div");
        tile.classList.add("tile", `tile-${value}`);
        tile.textContent = value;
        tile.style.backgroundColor = this.getTileColor(tileValue);
        this.board.appendChild(tile);
      }
    }

    this.scoreDisplay.textContent = "Score: " + this.score;
  }

  updateTile(x, y) {
    const tile = this.board.children[y * 4 + x];
    const tileValue = this.gameBoard[y][x];
    tile.textContent = tileValue === null ? "" : tileValue;
    tile.style.backgroundColor = this.getTileColor(tileValue);
  }

  getTileColor(value) {
    switch (value) {
      case 2:
        return "#eee4da";
      case 4:
        return "#ede0c8";
      case 8:
        return "#f2b179";
      case 16:
        return "#f59563";
      case 32:
        return "#f67c5f";
      case 64:
        return "#f65e3b";
      case 128:
        return "#edcf72";
      case 256:
        return "#edcc61";
      case 512:
        return "#edc850";
      case 1024:
        return "#edc53f";
      case 2048:
        return "#edc22e";
      default:
        return "#ccc0b3";
    }
  }

  movesAvailable() {
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (!this.gameBoard[y][x]) return true;

        const tile = this.gameBoard[y][x];
        if (x < 3 && tile === this.gameBoard[y][x + 1]) return true;
        if (y < 3 && tile === this.gameBoard[y + 1][x]) return true;
      }
    }
    return false;
  }

  handlerInputs(event) {
    const direction = event.key;
    console.log(`handlerInputs -> ${direction}`);
    const directions = {
      ArrowLeft: 0,
      ArrowUp: 1,
      ArrowRight: 2,
      ArrowDown: 3,
    };

    if (directions[direction] >= 0) {
      console.log(`moving -> ${direction}`);
      this.move(directions[direction]);
    }
  }

  move(direction) {
    const moved = this.mergeTiles.bind(this)(false, direction);

    if (moved) {
      this.addNewTile();
      this.renderBoard();
      if (!this.movesAvailable()) {
        this.gameOverDisplay.style.visibility = "visible";
      }
    }
  }

  mergeTiles(moved, direction) {
    const vector = this.getVector.bind(this)(direction);
    const traversals = this.buildTraversals.bind(this)(vector);
    moved = false;
    traversals.y.forEach((y) => {
      traversals.x.forEach((x) => {
        const tileValue = this.cellContent({ x, y });
        if (tileValue) {
          let farthest;
          let next = { x, y };
          do {
            farthest = next;
            next = { x: farthest.x + vector.x, y: farthest.y + vector.y };
          } while (this.withinBounds(next) && this.cellAvailable(next));

          // Mova o bloco se a posição mais distante for diferente da original
          if (farthest.x !== x || farthest.y !== y) {
            this.gameBoard[farthest.y][farthest.x] = tileValue;
            this.gameBoard[y][x] = null;
            moved = true;
          }

          let nextValue = this.cellContent(next);
          if (nextValue && tileValue === nextValue) {
            this.gameBoard[next.y][next.x] = tileValue * 2;
            this.gameBoard[farthest.y][farthest.x] = null; // Use a posição mais distante aqui
            this.score += tileValue * 2;
            moved = true;
          }
        }
      });
    });

    return moved;
  }

  cellContent({ x, y }) {
    return this.withinBounds({ x, y }) ? this.gameBoard[y][x] : null;
  }

  cellOccupied(e) {
    return !!this.cellContent(e);
  }

  cellAvailable(e) {
    return !this.cellOccupied(e);
  }

  withinBounds({ x, y }) {
    return x >= 0 && x < 4 && y >= 0 && y < 4;
  }

  buildTraversals(vector) {
    const traversals = { x: [], y: [] };
    for (let i = 0; i < 4; i++) {
      traversals.x.push(i);
      traversals.y.push(i);
    }
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();
    return traversals;
  }

  getVector(direction) {
    const vectors = {
      0: { x: -1, y: 0 },
      1: { x: 0, y: -1 },
      2: { x: 1, y: 0 },
      3: { x: 0, y: 1 },
    };

    return vectors[direction];
  }

  addEventListeners() {
    this.newGameBtn.addEventListener("click", this.initializeGame.bind(this));

    document.addEventListener("keydown", this.handlerInputs.bind(this));
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const game = new Game();
});
