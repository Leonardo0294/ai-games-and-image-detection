import { TicTacToe } from "./model.js";

// Ruta del modelo de IA
const MODEL_PATH = "./model/model.json";
// Selección del formulario y el tablero en el DOM
const selectionForm = document.querySelector("form");
const board = document.querySelector("#board");
let model;

const EMPTY = 0;
const HUMAN = -1;
const AI = 1;
let currentPlayer = HUMAN;

// Función para obtener el símbolo del jugador actual
function getSymbolForPlayer(player) {
  const formData = new FormData(selectionForm);
  const symbol = formData.get("selection");
  const otherSymbol = symbol === "X" ? "O" : "X";

  return player === HUMAN ? symbol : otherSymbol;
}

// Función para obtener el símbolo opuesto
function getOppositeSymbol(symbol) {
  return symbol === "X" ? "O" : "X";
}

// Evento que se dispara al cambiar la selección del símbolo en el formulario
selectionForm.addEventListener('input', (e) => {
  if (selectionForm.querySelector('select').value == "") {
    return;
  }

  const numberToSymbol = {
    0: "",
    [HUMAN]: getSymbolForPlayer(HUMAN),
    [AI]: getSymbolForPlayer(AI),
  };

  const game = TicTacToe.initialSymbol(getSymbolForPlayer(HUMAN));

  // Registro de los callbacks de movimiento, victoria y empate
  game.onMove((board) => {
    const transformed = getMovesForSymbolBoard(board, numberToSymbol);
    updateBoard(transformed);
  });

  game.onWin(symbol => {
    const message = getPlayerFromSymbol(symbol, numberToSymbol) === HUMAN ? "¡Ganaste!" : "¡Perdiste!";
    Swal.fire({
      title: message,
      confirmButtonText: "Reiniciar",
    }).then((result) => {
      if (result.isConfirmed) {
        document.location.reload();
      }
    })
  });

  game.onDraw(() => {
    Swal.fire({
      title: "¡Empate!",
      confirmButtonText: "Reiniciar",
    }).then((result) => {
      if (result.isConfirmed) {
        document.location.reload();
      }
    })
  });

  // Oculta el formulario y muestra el tablero
  selectionForm.classList.add('d-none');
  board.classList.remove('d-none');

  const transformed = getMovesForSymbolBoard(TicTacToe.EMPTY_BOARD, numberToSymbol);
  updateBoard(transformed);

  attachListeners(game, numberToSymbol);
});

// Transformar de un array de X y O a un array de objetos con símbolo y clase
function getMovesForSymbolBoard(board, numberToSymbol) {
  return board.flat().map((cell) => {
    return {
      symbol: cell,
      className: cell === EMPTY ? "" : cell,
    };
  });
}

// Obtener el jugador desde el símbolo
function getPlayerFromSymbol(symbol, numberToSymbolMap) {
  const found = Object.entries(numberToSymbolMap).find(([, value]) => value === symbol);
  return parseInt(found[0]);
}

// Cargar el modelo de IA
async function loadModel() {
  const model = await tf.loadLayersModel(MODEL_PATH);
  return model;
}

// Obtener el movimiento de la IA
async function getMoveForAi(board, numberToSymbolMap) {
  if (!model) {
    model = await loadModel();
  }

  const transformed = board.flat().map(symbol => getPlayerFromSymbol(symbol, numberToSymbolMap));
  const boardTensor = tf.tensor(transformed, [1, 9]);
  const prediction = await model.predict(boardTensor);
  const topk = tf.topk(prediction, 9);
  const indices = await topk.indices.data();

  for (const index of indices) {
    const [row, col] = [Math.floor(index / 3), index % 3];
    if (board[row][col] == "") {
      return [row, col];
    }
  };
  throw new Error("No valid move found");
};

// Adjuntar los listeners a las celdas del tablero
function attachListeners(game, numberToSymbolMap) {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    cell.addEventListener('click', async () => {
      const [row, col] = cell.dataset.cell.split("-").map(Number);
      game.makeMove(row, col);
      board.setAttribute("disabled", "disabled");
      currentPlayer = AI;

      if (game.won != "") {
        return;
      }

      const [aiRow, aiCol] = await getMoveForAi(game.board, numberToSymbolMap);

      setTimeout(() => {
        if (game.won != "") {
          return;
        }
        game.makeMove(aiRow, aiCol);
        board.removeAttribute("disabled");
        currentPlayer = HUMAN;
      }, 20);
    })
  });
}

// Actualizar el tablero en el DOM
function updateBoard(boardArray) {
  const cellValues = boardArray.flat();
  const cellsElements = document.querySelectorAll(".cell");
  for (const [index, cell] of cellValues.entries()) {
    cellsElements[index].innerHTML = cell.symbol;
    cellsElements[index].className = `cell ${cell.className}`;
  }
}
