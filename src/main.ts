const gameWrapper = document.getElementById('game-wrapper')!;
const gameContainer = document.getElementById('game')!;
const rowsInput = document.getElementById('rows') as HTMLInputElement;
const colsInput = document.getElementById('cols') as HTMLInputElement;

const CELL_SIZE = 40;

enum CellState {
    EMPTY,
    RED,
    WHITE
}

class Grid {
    rows: number;
    cols: number;
    cellStates: CellState[][];
    horizontalBorders: boolean[][];
    verticalBorders: boolean[][];
    isDragging = false;
    dragState: CellState | null = null;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.cellStates = Array(rows).fill(null).map(() => Array(cols).fill(CellState.EMPTY));
        this.horizontalBorders = Array(rows + 1).fill(null).map(() => Array(cols).fill(false));
        this.verticalBorders = Array(rows).fill(null).map(() => Array(cols + 1).fill(false));

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.dragState = null;
        });
    }

    updateCell(row: number, col: number, cellElement: HTMLElement) {
        const state = this.cellStates[row][col];
        cellElement.classList.remove('red', 'white');
        if (state === CellState.RED) {
            cellElement.classList.add('red');
        } else if (state === CellState.WHITE) {
            cellElement.classList.add('white');
        }
    }

    handleCellMouseDown(row: number, col: number, cellElement: HTMLElement) {
        this.isDragging = true;
        const currentState = this.cellStates[row][col];
        const nextState = (currentState + 1) % 3;
        this.cellStates[row][col] = nextState;
        this.dragState = nextState;
        this.updateCell(row, col, cellElement);
    }

    handleCellMouseOver(row: number, col: number, cellElement: HTMLElement) {
        if (this.isDragging && this.dragState !== null) {
            this.cellStates[row][col] = this.dragState;
            this.updateCell(row, col, cellElement);
        }
    }

    render() {
        gameContainer.innerHTML = '';
        // Clear previous borders if any
        const existingBorders = gameWrapper.querySelectorAll('.border-h, .border-v');
        existingBorders.forEach(border => border.remove());

        gameContainer.style.setProperty('--grid-rows', String(this.rows));
        gameContainer.style.setProperty('--grid-cols', String(this.cols));

        // Render Cells
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = String(i);
                cell.dataset.col = String(j);
                cell.addEventListener('mousedown', () => this.handleCellMouseDown(i, j, cell));
                cell.addEventListener('mouseover', () => this.handleCellMouseOver(i, j, cell));
                cell.addEventListener('dragstart', (e) => e.preventDefault());
                this.updateCell(i, j, cell);
                gameContainer.appendChild(cell);
            }
        }

        // Render Horizontal Borders
        for (let i = 0; i < this.rows + 1; i++) {
            for (let j = 0; j < this.cols; j++) {
                const border = document.createElement('div');
                border.classList.add('border-h');
                border.style.top = `${i * CELL_SIZE - 1}px`;
                border.style.left = `${j * CELL_SIZE}px`;
                border.style.width = `${CELL_SIZE}px`;
                if (this.horizontalBorders[i][j]) {
                    border.classList.add('thick');
                }
                border.addEventListener('click', () => {
                    this.horizontalBorders[i][j] = !this.horizontalBorders[i][j];
                    border.classList.toggle('thick');
                });
                gameWrapper.appendChild(border);
            }
        }

        // Render Vertical Borders
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols + 1; j++) {
                const border = document.createElement('div');
                border.classList.add('border-v');
                border.style.top = `${i * CELL_SIZE}px`;
                border.style.left = `${j * CELL_SIZE - 1}px`;
                border.style.height = `${CELL_SIZE}px`;
                if (this.verticalBorders[i][j]) {
                    border.classList.add('thick');
                }
                border.addEventListener('click', () => {
                    this.verticalBorders[i][j] = !this.verticalBorders[i][j];
                    border.classList.toggle('thick');
                });
                gameWrapper.appendChild(border);
            }
        }
    }

    resize(newRows: number, newCols: number) {
        const newCellStates = Array(newRows).fill(null).map(() => Array(newCols).fill(CellState.EMPTY));
        const newHorizontalBorders = Array(newRows + 1).fill(null).map(() => Array(newCols).fill(false));
        const newVerticalBorders = Array(newRows).fill(null).map(() => Array(newCols + 1).fill(false));

        const rowsToCopy = Math.min(this.rows, newRows);
        const colsToCopy = Math.min(this.cols, newCols);

        // Copy cell states
        for (let i = 0; i < rowsToCopy; i++) {
            for (let j = 0; j < colsToCopy; j++) {
                newCellStates[i][j] = this.cellStates[i][j];
            }
        }

        // Copy horizontal borders
        for (let i = 0; i < Math.min(this.rows + 1, newRows + 1); i++) {
            for (let j = 0; j < colsToCopy; j++) {
                newHorizontalBorders[i][j] = this.horizontalBorders[i][j];
            }
        }

        // Copy vertical borders
        for (let i = 0; i < rowsToCopy; i++) {
            for (let j = 0; j < Math.min(this.cols + 1, newCols + 1); j++) {
                newVerticalBorders[i][j] = this.verticalBorders[i][j];
            }
        }

        this.rows = newRows;
        this.cols = newCols;
        this.cellStates = newCellStates;
        this.horizontalBorders = newHorizontalBorders;
        this.verticalBorders = newVerticalBorders;

        this.render();
    }

    exportState(): Uint8Array {
        const cellDataSize = Math.ceil((this.rows * this.cols) / 4);
        const hBorderDataSize = Math.ceil(((this.rows + 1) * this.cols) / 8);
        const vBorderDataSize = Math.ceil((this.rows * (this.cols + 1)) / 8);

        const buffer = new Uint8Array(2 + cellDataSize + hBorderDataSize + vBorderDataSize);
        let offset = 0;

        // Header
        buffer[offset++] = this.rows;
        buffer[offset++] = this.cols;

        // Cell states (2 bits per cell)
        let currentByte = 0;
        let bitPosition = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                currentByte |= (this.cellStates[i][j] << bitPosition);
                bitPosition += 2;
                if (bitPosition >= 8) {
                    buffer[offset++] = currentByte;
                    currentByte = 0;
                    bitPosition = 0;
                }
            }
        }
        if (bitPosition > 0) {
            buffer[offset++] = currentByte;
        }

        // Horizontal borders (1 bit per border)
        currentByte = 0;
        bitPosition = 0;
        for (let i = 0; i < this.rows + 1; i++) {
            for (let j = 0; j < this.cols; j++) {
                currentByte |= ((this.horizontalBorders[i][j] ? 1 : 0) << bitPosition);
                bitPosition += 1;
                if (bitPosition >= 8) {
                    buffer[offset++] = currentByte;
                    currentByte = 0;
                    bitPosition = 0;
                }
            }
        }
        if (bitPosition > 0) {
            buffer[offset++] = currentByte;
        }

        // Vertical borders (1 bit per border)
        currentByte = 0;
        bitPosition = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols + 1; j++) {
                currentByte |= ((this.verticalBorders[i][j] ? 1 : 0) << bitPosition);
                bitPosition += 1;
                if (bitPosition >= 8) {
                    buffer[offset++] = currentByte;
                    currentByte = 0;
                    bitPosition = 0;
                }
            }
        }
        if (bitPosition > 0) {
            buffer[offset++] = currentByte;
        }

        return buffer;
    }
}

let grid: Grid;

function initialize() {
    const initialRows = parseInt(rowsInput.value, 10);
    const initialCols = parseInt(colsInput.value, 10);
    grid = new Grid(initialRows, initialCols);
    grid.render();

    const resizeBtn = document.getElementById('resize-btn')!;
    resizeBtn.addEventListener('click', () => {
        const newRows = parseInt(rowsInput.value, 10);
        const newCols = parseInt(colsInput.value, 10);
        grid.resize(newRows, newCols);
    });

    const exportBtn = document.getElementById('export-btn')!;
    const exportOutput = document.getElementById('export-output') as HTMLTextAreaElement;
    exportBtn.addEventListener('click', () => {
        const binaryData = grid.exportState();
        let binaryString = '';
        binaryData.forEach((byte) => {
            binaryString += String.fromCharCode(byte);
        });

        try {
            const base64String = btoa(binaryString);
            exportOutput.value = base64String;
        } catch (e) {
            console.error("Failed to encode state to Base64:", e);
            exportOutput.value = "Error encoding data.";
        }
    });
}

initialize();
