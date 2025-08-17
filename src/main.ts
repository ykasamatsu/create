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

    exportState() {
        return {
            rows: this.rows,
            cols: this.cols,
            cellStates: this.cellStates,
            horizontalBorders: this.horizontalBorders,
            verticalBorders: this.verticalBorders,
        };
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
        grid = new Grid(newRows, newCols);
        grid.render();
    });

    const exportBtn = document.getElementById('export-btn')!;
    const exportOutput = document.getElementById('export-output') as HTMLTextAreaElement;
    exportBtn.addEventListener('click', () => {
        const state = grid.exportState();
        const jsonString = JSON.stringify(state);
        try {
            const base64String = btoa(jsonString);
            exportOutput.value = base64String;
        } catch (e) {
            console.error("Failed to encode state to Base64:", e);
            exportOutput.value = "Error encoding data.";
        }
    });
}

initialize();
