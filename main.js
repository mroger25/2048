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

  initializeGame = () => {
    this.gameOverDisplay.style.visibility = "hidden";
    this.score = 0;
    this.gameBoard = Array(4)
      .fill()
      .map(() => Array(4).fill(0));
    this.renderBoard();
    this.addNewTile();
    this.addNewTile();
  };

  addNewTile = () => {
    const emptyTiles = this.getEmptyTiles();

    if (emptyTiles.length > 0) {
      const { x, y } =
        emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
      this.gameBoard[x][y] = Math.random() < 0.9 ? 2 : 4;
      this.updateTile(x, y);
    }
  };

  getEmptyTiles = () => {
    const emptyTiles = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.gameBoard[i][j] === 0) {
          emptyTiles.push({ x: i, y: j });
        }
      }
    }

    return emptyTiles;
  };

  renderBoard = () => {
    this.board.innerHTML = "";

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const tileValue = this.gameBoard[i][j];
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.textContent = tileValue > 0 ? tileValue : "";
        tile.style.backgroundColor = this.getTileColor(tileValue);
        this.board.appendChild(tile);
      }
    }

    this.scoreDisplay.textContent = "Score: " + this.score;
  };

  updateTile = (x, y) => {
    const tile = this.board.children[x * 4 + y];
    const tileValue = this.gameBoard[x][y];
    tile.textContent = tileValue > 0 ? tileValue : "";
    tile.style.backgroundColor = this.getTileColor(tileValue);
  };

  getTileColor = (value) => {
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
  };

  isGameOver = () => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (this.gameBoard[i][j] === 0) {
          return false;
        }
        if (
          (j < 3 && this.gameBoard[i][j] === this.gameBoard[i][j + 1]) ||
          (i < 3 && this.gameBoard[i][j] === this.gameBoard[i + 1][j])
        ) {
          return false;
        }
      }
    }
    return true;
  };

  moveTiles = (direction) => {
    let moved = false;

    switch (direction) {
      case "up":
        moved = this.mergeTiles(moved, 0, -1);
        break;

      case "down":
        moved = this.mergeTiles(moved, 0, 1);
        break;

      case "left":
        moved = this.mergeTiles(moved, -1, 0);
        break;

      case "right":
        moved = this.mergeTiles(moved, 1, 0);
        break;

      default:
        break;
    }

    if (moved) {
      this.addNewTile();
      this.renderBoard();
      if (this.isGameOver()) {
        this.gameOverDisplay.style.visibility = "visible";
      }
    }
  };

  mergeTiles = (moved, stepX, stepY) => {
    for (
      let i = stepY === 0 ? 0 : stepY > 0 ? 2 : 1;
      stepY === 0 ? i < 4 : stepY > 0 ? i >= 0 : i < 4;
      i += stepY === 0 ? 1 : stepY > 0 ? -1 : 1
    ) {
      for (
        let j = stepX === 0 ? 0 : stepX > 0 ? 2 : 1;
        stepX === 0 ? j < 4 : stepX > 0 ? j >= 0 : j < 4;
        j += stepX === 0 ? 1 : stepX > 0 ? -1 : 1
      ) {
        if (this.gameBoard[i][j] !== 0) {
          let rowOrCol = stepY === 0 ? j : i;

          while (
            (stepX > 0 || stepY > 0 ? rowOrCol < 3 : rowOrCol > 0) &&
            this.gameBoard[stepY === 0 ? i : rowOrCol + stepY][
              stepX === 0 ? j : rowOrCol + stepX
            ] === 0
          ) {
            this.gameBoard[stepY === 0 ? i : rowOrCol + stepY][
              stepX === 0 ? j : rowOrCol + stepX
            ] =
              this.gameBoard[stepY === 0 ? i : rowOrCol][
                stepX === 0 ? j : rowOrCol
              ];
            this.gameBoard[stepY === 0 ? i : rowOrCol][
              stepX === 0 ? j : rowOrCol
            ] = 0;
            rowOrCol += stepX > 0 || stepY > 0 ? 1 : -1;
            moved = true;
          }

          if (
            (stepX > 0 || stepY > 0 ? rowOrCol < 3 : rowOrCol > 0) &&
            this.gameBoard[stepY === 0 ? i : rowOrCol + stepY][
              stepX === 0 ? j : rowOrCol + stepX
            ] ===
              this.gameBoard[stepY === 0 ? i : rowOrCol][
                stepX === 0 ? j : rowOrCol
              ]
          ) {
            this.gameBoard[stepY === 0 ? i : rowOrCol + stepY][
              stepX === 0 ? j : rowOrCol + stepX
            ] *= 2;
            this.score +=
              this.gameBoard[stepY === 0 ? i : rowOrCol + stepY][
                stepX === 0 ? j : rowOrCol + stepX
              ];
            this.gameBoard[stepY === 0 ? i : rowOrCol][
              stepX === 0 ? j : rowOrCol
            ] = 0;
            moved = true;
          }
        }
      }
    }
    return moved;
  };

  addEventListeners() {
    this.newGameBtn.addEventListener("click", this.initializeGame);

    document.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          this.moveTiles("up");
          break;
        case "ArrowDown":
          event.preventDefault();
          this.moveTiles("down");
          break;
        case "ArrowLeft":
          event.preventDefault();
          this.moveTiles("left");
          break;
        case "ArrowRight":
          event.preventDefault();
          this.moveTiles("right");
          break;

        default:
          break;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const game = new Game();
});
