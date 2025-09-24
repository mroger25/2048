class Game {
  constructor() {
    this.score = 0;
    this.gameBoard = []; // Guarda os valores (ex: 2, 4, 8)
    this.board = document.getElementById("board");
    this.scoreDisplay = document.getElementById("score");
    this.gameOverDisplay = document.getElementById("game-over");
    this.newGameBtn = document.getElementById("new-game");
    this.isMoving = false; // Controla se uma animação está em andamento

    this.initializeGame();
    this.addEventListeners();
  }

  initializeGame() {
    this.gameOverDisplay.style.visibility = "hidden";
    this.score = 0;
    this.gameBoard = Array(4)
      .fill()
      .map(() => Array(4).fill(null));

    this.setupBoardUI();
    this.addNewTile();
    this.addNewTile();
    this.updateScore();
  }

  // Prepara a interface do tabuleiro (células de fundo e tiles)
  setupBoardUI() {
    this.board.innerHTML = "";
    // Adiciona as células de fundo
    for (let i = 0; i < 16; i++) {
      const cell = document.createElement("div");
      cell.classList.add("grid-cell");
      this.board.appendChild(cell);
    }
  }

  addNewTile() {
    const emptyTiles = this.getEmptyTiles();
    if (emptyTiles.length > 0) {
      const { x, y } =
        emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
      const value = Math.random() < 0.9 ? 2 : 4;
      this.gameBoard[y][x] = {
        value: value,
        element: this.createTileElement(x, y, value, true),
      };
    }
  }

  createTileElement(x, y, value, isNew = false) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    if (isNew) {
      tile.classList.add("tile-new");
      tile.addEventListener(
        "animationend",
        () => tile.classList.remove("tile-new"),
        { once: true }
      );
    }
    tile.textContent = value;
    tile.style.backgroundColor = this.getTileColor(value);
    this.updateTilePosition(tile, x, y);
    this.board.appendChild(tile);
    return tile;
  }

  updateTilePosition(tile, x, y) {
    const newX = x * 100;
    const newY = y * 100;
    tile.style.transform = `translate(${newX}px, ${newY}px)`;
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

  updateScore() {
    this.scoreDisplay.textContent = "Score: " + this.score;
  }

  handlerInputs(event) {
    if (this.isMoving) return; // Impede novos movimentos durante a animação

    const direction = event.key;
    const directions = {
      ArrowLeft: 0,
      ArrowUp: 1,
      ArrowRight: 2,
      ArrowDown: 3,
    };

    if (Object.keys(directions).includes(direction)) {
      event.preventDefault();
      this.move(directions[direction]);
    }
  }

  async move(direction) {
    this.isMoving = true;
    const vector = this.getVector(direction);
    const traversals = this.buildTraversals(vector);
    let moved = false;
    let promises = []; // Para esperar as animações terminarem

    traversals.y.forEach((y) => {
      traversals.x.forEach((x) => {
        const currentCell = { x, y };
        const tile = this.gameBoard[y][x];

        if (tile) {
          // Encontra a posição mais distante que a peça pode ir
          let previousPosition;
          let currentPosition = currentCell;

          do {
            previousPosition = currentPosition;
            currentPosition = {
              x: previousPosition.x + vector.x,
              y: previousPosition.y + vector.y,
            };
          } while (
            this.withinBounds(currentPosition) &&
            !this.gameBoard[currentPosition.y][currentPosition.x]
          );

          const newPosition = previousPosition; // A última posição válida

          // Verifica se uma fusão é possível na próxima posição
          const nextPosition = {
            x: newPosition.x + vector.x,
            y: newPosition.y + vector.y,
          };
          const tileToMergeWith = this.withinBounds(nextPosition)
            ? this.gameBoard[nextPosition.y][nextPosition.x]
            : null;

          if (
            tileToMergeWith &&
            tileToMergeWith.value === tile.value &&
            !tileToMergeWith.merged
          ) {
            // Fusão
            const mergedTile = tileToMergeWith;
            mergedTile.value *= 2;
            mergedTile.merged = true; // Marca como já fundido nesta jogada

            this.gameBoard[y][x] = null; // Esvazia a posição original
            this.score += mergedTile.value;

            // Animação
            promises.push(
              this.animateMove(tile, nextPosition, true, mergedTile)
            );
            moved = true;
          } else if (newPosition.x !== x || newPosition.y !== y) {
            // Movimento
            this.gameBoard[newPosition.y][newPosition.x] = tile;
            this.gameBoard[y][x] = null;

            // Animação
            promises.push(this.animateMove(tile, newPosition));
            moved = true;
          }
        }
      });
    });

    await Promise.all(promises); // Espera todas as animações

    // Limpa a marcação de 'merged'
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        if (this.gameBoard[y][x]) {
          this.gameBoard[y][x].merged = false;
        }
      }
    }

    if (moved) {
      this.updateScore();
      this.addNewTile();
      if (!this.movesAvailable()) {
        this.gameOverDisplay.style.visibility = "visible";
      }
    }

    this.isMoving = false;
  }

  animateMove(tile, position, isMerging = false, targetTile = null) {
    return new Promise((resolve) => {
      this.updateTilePosition(tile.element, position.x, position.y);

      // Ouve o final da transição
      tile.element.addEventListener(
        "transitionend",
        () => {
          if (isMerging) {
            // Atualiza o valor do tile que recebeu a fusão
            targetTile.element.textContent = targetTile.value;
            targetTile.element.style.backgroundColor = this.getTileColor(
              targetTile.value
            );
            targetTile.element.classList.add("tile-merged");
            targetTile.element.addEventListener(
              "animationend",
              () => targetTile.element.classList.remove("tile-merged"),
              { once: true }
            );

            // Remove o tile que se moveu
            tile.element.remove();
          }
          resolve();
        },
        { once: true }
      );
    });
  }

  // --- Funções Auxiliares (sem alterações) ---
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
        const tile = this.gameBoard[y][x].value;
        if (
          x < 3 &&
          this.gameBoard[y][x + 1] &&
          tile === this.gameBoard[y][x + 1].value
        )
          return true;
        if (
          y < 3 &&
          this.gameBoard[y + 1][x] &&
          tile === this.gameBoard[y + 1][x].value
        )
          return true;
      }
    }
    return false;
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
