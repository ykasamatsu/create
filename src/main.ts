const gameWrapper = document.getElementById('game-wrapper')!;
const gameContainer = document.getElementById('game')!;

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

    addRow(position: 'top' | 'bottom') {
        this.rows++;
        const newCellRow = Array(this.cols).fill(CellState.EMPTY);
        const newHorizontalBorderRow = Array(this.cols).fill(false);
        const newVerticalBorderRow = Array(this.cols + 1).fill(false);

        if (position === 'top') {
            this.cellStates.unshift(newCellRow);
            this.horizontalBorders.unshift(newHorizontalBorderRow);
            this.verticalBorders.unshift(newVerticalBorderRow);
        } else { // bottom
            this.cellStates.push(newCellRow);
            this.horizontalBorders.push(newHorizontalBorderRow);
            this.verticalBorders.push(newVerticalBorderRow);
        }
        this.render();
    }

    removeRow(position: 'top' | 'bottom') {
        if (this.rows <= 1) return;
        this.rows--;
        if (position === 'top') {
            this.cellStates.shift();
            this.horizontalBorders.shift();
            this.verticalBorders.shift();
        } else { // bottom
            this.cellStates.pop();
            this.horizontalBorders.pop();
            this.verticalBorders.pop();
        }
        this.render();
    }

    addCol(position: 'left' | 'right') {
        this.cols++;
        if (position === 'left') {
            this.cellStates.forEach(row => row.unshift(CellState.EMPTY));
            this.horizontalBorders.forEach(row => row.unshift(false));
            this.verticalBorders.forEach(row => row.unshift(false));
        } else { // right
            this.cellStates.forEach(row => row.push(CellState.EMPTY));
            this.horizontalBorders.forEach(row => row.push(false));
            this.verticalBorders.forEach(row => row.push(false));
        }
        this.render();
    }

    removeCol(position: 'left' | 'right') {
        if (this.cols <= 1) return;
        this.cols--;
        if (position === 'left') {
            this.cellStates.forEach(row => row.shift());
            this.horizontalBorders.forEach(row => row.shift());
            this.verticalBorders.forEach(row => row.shift());
        } else { // right
            this.cellStates.forEach(row => row.pop());
            this.horizontalBorders.forEach(row => row.pop());
            this.verticalBorders.forEach(row => row.pop());
        }
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

    importState(binaryString: string) {
        try {
            const buffer = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                buffer[i] = binaryString.charCodeAt(i);
            }

            let offset = 0;
            const rows = buffer[offset++];
            const cols = buffer[offset++];

            const newCellStates = Array(rows).fill(null).map(() => Array(cols).fill(CellState.EMPTY));
            const newHorizontalBorders = Array(rows + 1).fill(null).map(() => Array(cols).fill(false));
            const newVerticalBorders = Array(rows).fill(null).map(() => Array(cols + 1).fill(false));

            // Unpack Cell states
            let currentByte = buffer[offset++];
            let bitPosition = 0;
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    newCellStates[i][j] = (currentByte >> bitPosition) & 0b11; // Get 2 bits
                    bitPosition += 2;
                    if (bitPosition >= 8) {
                        currentByte = buffer[offset++];
                        bitPosition = 0;
                    }
                }
            }

            // Unpack Horizontal borders
            if (offset < buffer.length) {
                currentByte = buffer[offset++];
                bitPosition = 0;
                for (let i = 0; i < rows + 1; i++) {
                    for (let j = 0; j < cols; j++) {
                        if(bitPosition >= 8) {
                            currentByte = buffer[offset++];
                            bitPosition = 0;
                        }
                        if (currentByte !== undefined) {
                            newHorizontalBorders[i][j] = ((currentByte >> bitPosition) & 1) === 1;
                        }
                        bitPosition += 1;
                    }
                }
            }

            // Unpack Vertical borders
            if (offset < buffer.length) {
                currentByte = buffer[offset++];
                bitPosition = 0;
                for (let i = 0; i < rows; i++) {
                    for (let j = 0; j < cols + 1; j++) {
                        if(bitPosition >= 8) {
                            currentByte = buffer[offset++];
                            bitPosition = 0;
                        }
                        if (currentByte !== undefined) {
                            newVerticalBorders[i][j] = ((currentByte >> bitPosition) & 1) === 1;
                        }
                        bitPosition += 1;
                    }
                }
            }

            this.rows = rows;
            this.cols = cols;
            this.cellStates = newCellStates;
            this.horizontalBorders = newHorizontalBorders;
            this.verticalBorders = newVerticalBorders;

            this.render();
        } catch (e) {
            console.error("Failed to import state:", e);
            alert("無効な盤面データです。");
        }
    }
}

let grid: Grid;

function initialize() {
    grid = new Grid(10, 10); // Start with a default 10x10 grid
    grid.render();

    // Add/Remove Row buttons
    document.getElementById('add-row-top')!.addEventListener('click', () => grid.addRow('top'));
    document.getElementById('remove-row-top')!.addEventListener('click', () => grid.removeRow('top'));
    document.getElementById('add-row-bottom')!.addEventListener('click', () => grid.addRow('bottom'));
    document.getElementById('remove-row-bottom')!.addEventListener('click', () => grid.removeRow('bottom'));

    // Add/Remove Col buttons
    document.getElementById('add-col-left')!.addEventListener('click', () => grid.addCol('left'));
    document.getElementById('remove-col-left')!.addEventListener('click', () => grid.removeCol('left'));
    document.getElementById('add-col-right')!.addEventListener('click', () => grid.addCol('right'));
    document.getElementById('remove-col-right')!.addEventListener('click', () => grid.removeCol('right'));


    const exportBtn = document.getElementById('export-btn')!;
    const exportOutput = document.getElementById('export-output') as HTMLTextAreaElement;
    const preBase64Output = document.getElementById('pre-base64-output') as HTMLTextAreaElement;
    exportBtn.addEventListener('click', () => {
        const binaryData = grid.exportState();
        let binaryString = '';
        binaryData.forEach((byte) => {
            binaryString += String.fromCharCode(byte);
        });

        preBase64Output.value = binaryString;

        try {
            const base64String = btoa(binaryString);
            exportOutput.value = base64String;
        } catch (e) {
            console.error("Failed to encode state to Base64:", e);
            exportOutput.value = "Error encoding data.";
        }
    });

    const importBtn = document.getElementById('import-btn')!;
    const importInput = document.getElementById('import-input') as HTMLTextAreaElement;
    importBtn.addEventListener('click', () => {
        const base64String = importInput.value;
        if (!base64String) return;

        try {
            const binaryString = atob(base64String);
            grid.importState(binaryString);
        } catch (e) {
            console.error("Failed to import state from Base64:", e);
            alert("無効なBase64データです。");
        }
    });
}

initialize();
