let board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];

let currentPlayer = 'X';
let gameStatus = '';

function checkWinner() {
    const lines = [
        [[0, 0], [0, 1], [0, 2]],  // rows
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]],  // columns
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 1], [2, 2]],  // diagonals
        [[0, 2], [1, 1], [2, 0]]
    ];

    for (let line of lines) {
        const [a, b, c] = line;
        if (board[a[0]][a[1]] !== '' && 
            board[a[0]][a[1]] === board[b[0]][b[1]] && 
            board[a[0]][a[1]] === board[c[0]][c[1]]) {
            return board[a[0]][a[1]];
        }
    }

    if (board.flat().every(cell => cell !== '')) {
        return 'tie';
    }

    return null;
}

function playerMove(row, col) {
    if (gameStatus !== '' || board[row][col] !== '') return;

    board[row][col] = currentPlayer;
    document.getElementById(`cell${row}${col}`).textContent = currentPlayer;

    const winner = checkWinner();
    if (winner) {
        gameStatus = (winner === 'tie') ? "¡Empate!" : `¡${winner} gana!`;
        document.getElementById('status').textContent = gameStatus;
    } else {
        currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
        document.getElementById('status').textContent = `Turno de ${currentPlayer}`;
        setTimeout(computerMove, 500); // Simular movimiento de la computadora
    }
}

function computerMove() {
    // Implementar lógica para el movimiento de la computadora (puedes usar TensorFlow.js aquí)
    // Por simplicidad, la computadora elegirá un movimiento aleatorio no ocupado
    const emptyCells = [];
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell === '') {
                emptyCells.push([rowIndex, colIndex]);
            }
        });
    });

    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    playerMove(row, col);
}