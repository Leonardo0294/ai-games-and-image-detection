export class TicTacToe {
    constructor(board, currentSymbol = "X") {
        // Constructor de la clase TicTacToe
        // Inicializa el tablero y el símbolo actual
        this.board = board ?? TicTacToe.EMPTY_BOARD; // Si no se proporciona un tablero, usa uno vacío
        this.currentSymbol = currentSymbol; // Símbolo actual (por defecto 'X')
        this.initialSymbolValue = currentSymbol; // Guarda el valor inicial del símbolo
        this.won = ""; // Guarda el símbolo del jugador que ganó (si hubo ganador)
    }

    // Getter para comprobar si el juego terminó en empate
    get isDraw() {
        return this.board.flat().every(cell => cell !== ""); // Devuelve true si todas las celdas están llenas y no hay ganador
    }

    // Tablero vacío inicial
    static EMPTY_BOARD = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
    ]

    // Reinicia el juego al estado inicial
    reset() {
        this.board = TicTacToe.EMPTY_BOARD; // Reinicia el tablero
        this.currentSymbol = this.initialSymbolValue; // Restaura el símbolo actual al valor inicial
    }

    // Crea una instancia de TicTacToe con un símbolo inicial dado
    static initialSymbol(currentSymbol) {
        return new TicTacToe(TicTacToe.EMPTY_BOARD, currentSymbol);
    }

    // Establece una función de devolución de llamada para cuando el juego termine en empate
    onDraw(cb) {
        this.onDrawCallback = cb;
    }

    // Realiza un movimiento en el tablero en la posición dada
    makeMove(row, col) {
        // Verifica si la celda ya está ocupada
        if (this.board[row][col] != "") {
            return; // Si la celda ya está ocupada, no se puede realizar el movimiento
        }
        // Registra el movimiento en el tablero
        this.board[row][col] = this.currentSymbol;
        // Verifica si el jugador actual ha ganado después del movimiento
        if (this.hasWon()) {
            // Si hay un ganador, llama a la función de devolución de llamada de victoria (si está definida)
            this.onWinCallback ? this.onWinCallback(this.currentSymbol) : null;
            // Llama a la función de devolución de llamada de movimiento (si está definida)
            this.moveCallback ? this.moveCallback(this.board, row, col) : null;
            // Actualiza el símbolo del jugador que ganó
            this.won = this.currentSymbol;
            return; // Termina la función después de encontrar un ganador
        }
        // Verifica si el juego terminó en empate después del movimiento
        if (this.isDraw) {
            // Si hay empate, llama a la función de devolución de llamada de empate (si está definida)
            this.onDrawCallback ? this.onDrawCallback() : null;
            // Llama a la función de devolución de llamada de movimiento (si está definida)
            this.moveCallback ? this.moveCallback(this.board, row, col) : null;
            return; // Termina la función después de encontrar un empate
        };
        // Si el juego no ha terminado, cambia al siguiente jugador y llama a la función de devolución de llamada de movimiento
        this.moveCallback ? this.moveCallback(this.board, row, col) : null;
        this.currentSymbol = this.currentSymbol === "X" ? "O" : "X"; // Cambia al siguiente símbolo
    }

    // Verifica si hay un ganador en el tablero actual
    hasWon() {
        const b = this.board;
        // Función auxiliar para verificar si hay 3 símbolos iguales en una fila, columna o diagonal
        const check = (a, b, c) => a === b && b === c && a !== "";
        // Verifica todas las filas y columnas
        for (let i = 0; i < 3; i++) {
            if (check(b[i][0], b[i][1], b[i][2]) || check(b[0][i], b[1][i], b[2][i])) {
                return true; // Si hay un ganador en una fila o columna, devuelve true
            }
        }
        // Verifica las diagonales
        return check(b[0][0], b[1][1], b[2][2]) || check(b[0][2], b[1][1], b[2][0]); // Si hay un ganador en una diagonal, devuelve true
    }

    // Establece una función de devolución de llamada para cada movimiento realizado
    onMove(cb) {
        this.moveCallback = cb;
    }

    // Establece una función de devolución de llamada para cuando un jugador gane
    onWin(cb) {
        this.onWinCallback = cb;
    }
}
