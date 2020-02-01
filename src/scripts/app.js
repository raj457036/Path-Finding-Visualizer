// constants
const BOX_BORDER_COLOR = "#f8b400";
const BOX_TYPE_BLOCK_COLOR = "#000";
const BOX_TYPE_CLEAR_COLOR = "#fff";
const BOX_TYPE_START_NODE_COLOR = "#61d4b3";
const BOX_TYPE_END_NODE_COLOR = "#fdd365";
const DEFAULT_BOX_SIZE = 50;
const MAX_END_NODE_COUNT = 3;

const BOX_TYPES = Object.freeze({
    "BLOCK": 0,
    "CLEAR": 1,
    "START_NODE": 2,
    "END_NODE": 3,
});

const TOOL_MODE = Object.freeze({
    "BLOCK_NODES": 0,
    "CLEAR_NODES": 1,
    "ADD_START_NODE": 2,
    "ADD_END_NODE": 3,
});

let ACTION_TOOL_MODE = null;
let START_NODE = null;
let END_NODE = null;
let grid = null;
let dragOn = false;

// utilities
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// classes

class GraphNode {
    constructor(value, id = uuidv4()) {
        this.id = id;
        this.value = value;
        this.__adjacent = new Set();
    }

    joinAdjacentNode(node) {
        if (node instanceof Node) {
            this.__adjacent.add(node);
        }
    }

    removeAdjacentNode(node) {
        if (node instanceof Node && this.__adjacent.has(node)) {
            this.__adjacent.delete(node);
        }
    }

    get adjacents() {
        return this.__adjacent;
    };
}

class GraphMatrix {
    constructor(rowCount, columnCount) {
        this.rowCount = rowCount;
        this.columnCount = columnCount;
        this.__processed = false;
        this.__nodes = [];
    }

    generateNodes() {
        for (let r = 0; r < this.rowCount; r++) {
            const temp_row_nodes = [];
            for (let c = 0; c < this.columnCount; c++) {
                const node = new GraphNode([r, c]);
                temp_row_nodes.push(node);
            }
            this.__nodes.push(temp_row_nodes);
        }
    }

    joinAdjacent(r, c) {
        const top = r > 0 ? this.__nodes[r - 1][c] : null;
        const left = c > 0 ? this.__nodes[r][c - 1] : null;
        const bottom = r < this.rowCount - 2 ? this.__nodes[r + 1][c] : null;
        const right = c < this.columnCount - 2 ? this.__nodes[r][c + 1] : null;
        this.__nodes[r][c].joinAdjacentNode(top);
        this.__nodes[r][c].joinAdjacentNode(left);
        this.__nodes[r][c].joinAdjacentNode(bottom);
        this.__nodes[r][c].joinAdjacentNode(right);
    }

    removeAdjacent(r, c) {
        const top = r > 0 ? this.__nodes[r - 1][c] : null;
        const left = c > 0 ? this.__nodes[r][c - 1] : null;
        const bottom = r < this.rowCount - 2 ? this.__nodes[r + 1][c] : null;
        const right = c < this.columnCount - 2 ? this.__nodes[r][c + 1] : null;
        this.__nodes[r][c].removeAdjacentNode(top);
        this.__nodes[r][c].removeAdjacentNode(left);
        this.__nodes[r][c].removeAdjacentNode(bottom);
        this.__nodes[r][c].removeAdjacentNode(right);
    }

    generateMatrix() {
        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.columnCount; c++) {
                this.joinAdjacent(r, c);
            }
        }
    }

    process() {
        this.generateNodes();
        this.generateMatrix();
        this.__processed = true;
    }

    get isProcessed() {
        return this.__processed;
    }

    get nodeCount() {
        return this.rowCount * this.columnCount;
    }

    get nodes() {
        return this.__nodes;
    }


}

// paper js related
class Box {
    constructor(node, pointTL, pointBR) {
        console.assert(node != null, "Node should not be null");
        this.__node = node;
        this.pointTL = pointTL;
        this.pointBR = pointBR;
        this.nodeType = BOX_TYPES.CLEAR;
        this.__path = null;
    }

    setAsStart() {
        this.nodeType = BOX_TYPES.START_NODE;
        this.__path.fillColor = BOX_TYPE_START_NODE_COLOR;
    }

    removeAsStart() {
        if (this.nodeType == BOX_TYPES.START_NODE) {
            this.nodeType = BOX_TYPES.CLEAR;
            this.__path.fillColor = BOX_TYPE_CLEAR_COLOR;
        }
    }

    setAsEnd() {
        this.nodeType = BOX_TYPES.END_NODE;
        this.__path.fillColor = BOX_TYPE_END_NODE_COLOR;
    }

    removeAsEnd() {
        if (this.nodeType == BOX_TYPES.END_NODE) {
            this.nodeType = BOX_TYPES.CLEAR;
            this.__path.fillColor = BOX_TYPE_CLEAR_COLOR;
        }
    }

    setAsClear() {
        this.nodeType = BOX_TYPES.CLEAR;
        this.__path.fillColor = BOX_TYPE_CLEAR_COLOR;
    }

    setAsBlock() {
        this.nodeType = BOX_TYPES.BLOCK;
        this.__path.fillColor = BOX_TYPE_BLOCK_COLOR;
    }

    getFillColor() {
        switch (this.nodeType) {
            case BOX_TYPES.BLOCK:
                return BOX_TYPE_BLOCK_COLOR
            case BOX_TYPES.CLEAR:
                return BOX_TYPE_CLEAR_COLOR;
            case BOX_TYPES.START_NODE:
                return BOX_TYPE_START_NODE_COLOR;
            case BOX_TYPES.END_NODE:
                return BOX_TYPE_END_NODE_COLOR[0];
        }
    }

    draw() {
        this.__path = new Path.Rectangle(this.pointTL, this.pointBR);
        this.__path.strokeColor = BOX_BORDER_COLOR;
        this.__path.fillColor = this.getFillColor();
    }

    get path() {
        return this.__path;
    }


}

class Grid {
    constructor(width, height, graph, boxSize) {
        this.width = width;
        this.height = height;
        this.graph = graph;
        this.boxSize = boxSize;
        this.__boxes = [];
        this.onStartEnd = () => {};
    }

    getBoxSideLength() {
        const area = this.width * this.height;
        const singleBoxArea = area / this.graph.nodeCount;
        const singleBoxSideLength = Math.sqrt(singleBoxArea);
        console.log(singleBoxSideLength);
        return singleBoxSideLength;
    }

    addEvents(box, r, c) {
        const grid = this;
        box.path.onClick = function () {
            switch (ACTION_TOOL_MODE) {
                case TOOL_MODE.BLOCK_NODES:
                    grid.setBlock(r, c);
                    break;
                case TOOL_MODE.CLEAR_NODES:
                    grid.setClear(r, c);
                    break;
                case TOOL_MODE.ADD_START_NODE:
                    START_NODE = [r, c];
                    grid.setStart();
                    break;
                case TOOL_MODE.ADD_END_NODE:
                    END_NODE = [r, c];
                    grid.setEnd();
                    break;
            }

        }
        box.path.onMouseDown = function (event) {
            dragOn = true;
        }
        box.path.onMouseUp = function (event) {
            dragOn = false;
        }
        box.path.onMouseEnter = function (event) {
            this.selected = true;
            if (dragOn) {
                switch (ACTION_TOOL_MODE) {
                    case TOOL_MODE.BLOCK_NODES:
                        grid.setBlock(r, c);
                        break;
                    case TOOL_MODE.CLEAR_NODES:
                        grid.setClear(r, c);
                        break;
                }
            }
        };
        box.path.onMouseLeave = function (event) {
            this.selected = false;
        }
    }

    setBlock(r, c) {
        this.graph.removeAdjacent(r, c);
        this.__boxes[r][c].setAsBlock();
    }
    setClear(r, c) {
        this.graph.joinAdjacent(r, c);
        this.__boxes[r][c].setAsClear();
    }

    setStart() {
        for (let r = 0; r < this.graph.rowCount; r++) {
            for (let c = 0; c < this.graph.columnCount; c++) {
                this.__boxes[r][c].removeAsStart();
            }
        }
        this.__boxes[START_NODE[0]][START_NODE[1]].setAsStart();
        this.onStartEnd();
    }

    setEnd() {
        for (let r = 0; r < this.graph.rowCount; r++) {
            for (let c = 0; c < this.graph.columnCount; c++) {
                this.__boxes[r][c].removeAsEnd();
            }
        }
        this.__boxes[END_NODE[0]][END_NODE[1]].setAsEnd();
        this.onStartEnd();
    }

    clearGrid() {
        for (let r = 0; r < this.graph.rowCount; r++) {
            for (let c = 0; c < this.graph.columnCount; c++) {
                this.setClear(r, c);
            }
        }
        START_NODE = null;
        END_NODE = null;
        this.onStartEnd();
    }

    paintGrid() {
        const sideLength = this.boxSize || this.getBoxSideLength();

        for (let r = 0; r < this.graph.rowCount; r++) {
            const temp_row_boxes = [];
            for (let c = 0; c < this.graph.columnCount; c++) {
                const node = this.graph.nodes[r][c];
                const x1 = sideLength * c;
                const y1 = sideLength * r;
                const x2 = x1 + sideLength;
                const y2 = y1 + sideLength;

                const box = new Box(node, new Point(x1, y1), new Point(x2, y2));
                box.draw();
                this.addEvents(box, r, c);
                temp_row_boxes.push(box);
            }
            this.__boxes.push(temp_row_boxes);
        }
    }

    run(algoName) {
        console.log("running");
    }



    get boxArea() {
        return this.__boxes[0][0].path.area;
    }

}

function processGrid(rowCount, columnCount, width, height, boxSize) {
    project.clear()
    const graph = new GraphMatrix(rowCount, columnCount);
    graph.process();
    grid = new Grid(width, height, graph, boxSize);
    grid.paintGrid();

    grid.onStartEnd = function () {
        console.log("change");
        if (START_NODE != null && END_NODE != null) {
            $("#action-panel").removeClass("invisible");
        } else {
            $("#action-panel").addClass("invisible");
        }
    }
}

// settings

class StateHandler {
    constructor() {
        this.__activeMode = TOOL_MODE.BLOCK_NODES;
        this.__rowCount = null;
        this.__columnCount = null;
        this.__boxSize = null;
        this.__width = null;
        this.__height = null;
    }

    get activeMode() {
        return this.__activeMode;
    }

    get rowCount() {
        return this.__rowCount;
    }

    get columnCount() {
        return this.__columnCount;
    }

    get boxSize() {
        return this.__boxSize;
    }

    get height() {
        return this.__height;
    }
    get width() {
        return this.__width;
    }

    setState(state) {
        this.__activeMode = state.get("activeMode") || this.__activeMode;
        this.__rowCount = state.get("rowCount") || this.__rowCount;
        this.__columnCount = state.get("columnCount") || this.__columnCount;
        this.__activeMode = state.get("activeMode") || this.__activeMode;
        this.__height = state.get("height") || this.__height;
        this.__width = state.get("width") || this.__width;
    }

}

const settings = new StateHandler();

var init = () => {
    const canvas = $("#graph-canvas");
    const rowCountInput = $("#row-count");
    const columnCountInput = $("#column-count");
    const boxSizeInput = $("#box-size");
    const toolModeInput = $("input[name=selectionMode]:radio");
    const clearGraphBtn = $("#clear-graph-btn");
    const startStopBtn = $("#start-stop-btn");

    const width = canvas.width();
    const height = canvas.height();

    let boxSize = DEFAULT_BOX_SIZE;
    let columnCount = Math.trunc(width / boxSize);
    let rowCount = Math.trunc(height / boxSize);

    rowCountInput.val(rowCount);
    columnCountInput.val(columnCount);
    boxSizeInput.val(boxSize);
    ACTION_TOOL_MODE = TOOL_MODE.BLOCK_NODES;



    rowCountInput.change(function (event) {
        rowCount = parseInt($(this).val()) || Math.trunc(height / t);
        processGrid(rowCount, columnCount, width, height, boxSize);
    });
    columnCountInput.change(function (event) {
        columnCount = parseInt($(this).val()) || Math.trunc(width / t);
        processGrid(rowCount, columnCount, width, height, boxSize);
    });
    boxSizeInput.change(function (event) {
        boxSize = parseInt(boxSizeInput.val());
        processGrid(rowCount, columnCount, width, height, boxSize);
    });
    toolModeInput.change(function (event) {
        console.log(this.value);
        ACTION_TOOL_MODE = parseInt(this.value);
    });
    clearGraphBtn.click(function (event) {
        grid.clearGrid();
        startStopBtn.prop("disabled", false);
        startStopBtn.text("Start");
    });
    startStopBtn.click(function (event) {
        grid.run("Algo");
        $(this).prop("disabled", true);
        $(this).text("Running...");
    })

    processGrid(rowCount, columnCount, width, height, boxSize);
}