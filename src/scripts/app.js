// Runners
class Runner {
  constructor(name) {
    this.name = name;
    this.timer = null;
    this.fixedTimer = null;
    this.finish = null;
    this.count = 0;
    this.onStop = () => {};
    this.onStart = () => {};
    this.onFrame = () => {};
  }

  recall() {
    this.onFrame();
    this.perFrame();
    if (this.finish) {
      this.fixedRecall();
      return;
    }
    this.timer = setTimeout(() => this.recall(), SPEED);
  }

  init() {
    this.onStart();
    this.firstFrame();
    this.timer = setTimeout(() => this.recall(), SPEED);
  }

  fixedRecall() {
    let i = this.count;
    this.fixedTimer = setInterval(() => {
      if (i > 0) {
        this.fixedFrames();
        i--;
      } else {
        clearInterval(this.fixedTimer);
      }
    }, SPEED);
  }

  stop() {
    clearTimeout(this.timer);
    this.onStop();
  }

  firstFrame() {
    throw new Error("need to be implemented");
  }
  perFrame() {
    throw new Error("need to be implemented");
  }
  fixedFrames() {}
}

class NodeSetter extends Runner {
  constructor(name) {
    super(name);
    this.__startNode = null;
    this.__endNode = null;
  }

  setNode(start, end) {
    this.__startNode = start;
    this.__endNode = end;
  }

  get startNode() {
    return this.__startNode;
  }

  get endNode() {
    return this.__endNode;
  }
}
// Depth First Search
class DfsRunner extends NodeSetter {
  constructor() {
    super("Depth First Search");
    this.stack = null;
    this.set = null;
    this.path = null;
    this.parent = null;
  }

  mapPath() {
    this.path = [];
    let i = 0;
    let node = this.endNode;
    while (node != null && i < 1000) {
      this.path.push(node);
      node = this.parent.get(node.id);
      i++;
    }
    this.path.pop();
    this.count = this.path.length;
  }

  firstFrame() {
    this.stack = [];
    this.set = new Set();
    this.parent = new Map();
    this.stack.push(this.startNode);
    this.finish = false;
  }

  perFrame() {
    if (this.stack.length > 0) {
      const node = this.stack.pop();
      if (node.id == this.endNode.id) {
        this.finish = true;
        this.stop();
        this.mapPath();
        return;
      }
      if (!this.set.has(node) && node) {
        this.set.add(node);

        node.id != this.startNode.id ? node.setAsTraversed() : null;
        this.stack.push(...node.adjacents.values());

        node.adjacents.forEach(r => {
          if (!this.set.has(r)) {
            this.parent.set(r.id, node);
          }
        });
      }
    } else {
      this.finish = true;
      this.stop();
      this.mapPath();
      return;
    }
  }

  fixedFrames() {
    const n = this.path.pop();
    n.setAsPath();
  }
}

// Breadth First Search
class BfsRunner extends NodeSetter {
  constructor() {
    super("Breadth First Search");
    this.queue = null;
    this.path = null;
    this.parent = null;
    this.set = null;
  }

  mapPath() {
    this.path = [];
    let i = 0;
    let node = this.endNode;
    while (node != null && i < 1000) {
      this.path.push(node);
      node = this.parent.get(node.id);
      i++;
    }
    this.path.pop();
    this.count = this.path.length;
  }

  firstFrame() {
    this.queue = [];
    this.parent = new Map();
    this.set = new Set();
    this.queue.push(this.startNode);
    this.finish = false;
  }

  perFrame() {
    if (this.queue.length > 0) {
      const node = this.queue.shift();

      if (node.id == this.endNode.id) {
        this.finish = true;
        this.stop();
        this.mapPath();
        return;
      }

      node.id != this.startNode.id ? node.setAsTraversed() : null;
      if (!this.set.has(node)) {
        this.set.add(node);
        this.queue.push(...node.adjacents.values());
        node.adjacents.forEach((r, i) => {
          if (!this.set.has(r)) {
            this.parent.set(r.id, node);
          }
        });
      }
    } else {
      this.finish = true;
      this.stop();
      this.mapPath();
      return;
    }
  }

  fixedFrames() {
    const n = this.path.pop();
    n.setAsPath();
  }
}

// constants
const states = Object.freeze({
  canvas: $("#graph-canvas"),
  rowCountInput: $("#row-count"),
  columnCountInput: $("#column-count"),
  boxSizeInput: $("#box-size"),
  toolModeInput: $("input[name=selectionMode]:radio"),
  clearGraphBtn: $("#clear-graph-btn"),
  startStopBtn: $("#start-stop-btn"),
  width: $("#graph-canvas").width(),
  height: $("#graph-canvas").height(),
  actionPanel: $("#action-panel"),
  algoSelection: $(".algo-selection"),
  algoNameDisplay: $("#selected-algo-name"),
  Runners: {
    dfs: DfsRunner,
    bfs: BfsRunner
  }
});

const COLORS = Object.freeze({
  BOX_BORDER_COLOR: "#192965",
  BOX_TYPE_BLOCK_COLOR: "#192965",
  BOX_TYPE_CLEAR_COLOR: "#fff",
  BOX_TYPE_START_NODE_COLOR: "#007bff",
  BOX_TYPE_END_NODE_COLOR: "#f0134d",
  BOX_TYPE_TRAVERSED_NODE_COLOR: "#c3f0ca",
  BOX_TYPE_PATH_NODE_COLOR: "#3fc5f0",
  BOX_TYPE_ERROR_NODE_COLOR: "#6c757d"
});

const DEFAULT_BOX_SIZE = 30;
const MAX_END_NODE_COUNT = 3;
const DEFAULT_RUNNER_CODE = "dfs";

const BOX_TYPES = Object.freeze({
  BLOCK: 0,
  CLEAR: 1,
  START_NODE: 2,
  END_NODE: 3,
  TRAVERSED_NODE: 4,
  PATH_NODE: 5,
  ERROR_NODE: 6
});

const TOOL_MODE = Object.freeze({
  WALL_NODES: 0,
  START_NODE: 1,
  TARGET_NODE: 2
});

const SPEEDS = Object.freeze({
  FAST: 16,
  MEDIUM: 32,
  SLOW: 64
});

let ACTION_TOOL_MODE = TOOL_MODE.WALL_NODES;
let START_NODE = null;
let END_NODE = null;
let ActiveGrid = null;
let SPEED = SPEEDS.FAST;

// utilities
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
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
    if (node instanceof GraphNode) {
      this.__adjacent.add(node);
    }
  }

  removeAdjacentNode(node) {
    if (node instanceof GraphNode && this.__adjacent.has(node)) {
      this.__adjacent.delete(node);
    }
  }

  get adjacents() {
    return this.__adjacent;
  }
}

class GraphMatrix {
  constructor(rowCount, columnCount, nodeCls) {
    this.rowCount = rowCount;
    this.columnCount = columnCount;
    this.__processed = false;
    this.nodeCls = nodeCls;
    this.__nodes = [];
  }

  generateNodes() {
    for (let r = 0; r < this.rowCount; r++) {
      const temp_row_nodes = [];
      for (let c = 0; c < this.columnCount; c++) {
        const node = new this.nodeCls([r, c]);
        temp_row_nodes.push(node);
      }
      this.__nodes.push(temp_row_nodes);
    }
  }

  joinAdjacent(r, c) {
    const node = this.nodes[r][c];
    const top = r > 0 ? this.nodes[r - 1][c] : null;
    const left = c > 0 ? this.nodes[r][c - 1] : null;
    const bottom = r < this.rowCount - 2 ? this.nodes[r + 1][c] : null;
    const right = c < this.columnCount - 2 ? this.nodes[r][c + 1] : null;
    node.joinAdjacentNode(top);
    node.joinAdjacentNode(left);
    node.joinAdjacentNode(bottom);
    node.joinAdjacentNode(right);
    top != null ? top.joinAdjacentNode(node) : null;
    left != null ? left.joinAdjacentNode(node) : null;
    bottom != null ? bottom.joinAdjacentNode(node) : null;
    right != null ? right.joinAdjacentNode(node) : null;
  }

  removeAdjacent(r, c) {
    const node = this.nodes[r][c];
    const top = r > 0 ? this.nodes[r - 1][c] : null;
    const left = c > 0 ? this.nodes[r][c - 1] : null;
    const bottom = r < this.rowCount - 2 ? this.nodes[r + 1][c] : null;
    const right = c < this.columnCount - 2 ? this.nodes[r][c + 1] : null;
    node.removeAdjacentNode(top);
    node.removeAdjacentNode(left);
    node.removeAdjacentNode(bottom);
    node.removeAdjacentNode(right);
    top != null ? top.removeAdjacentNode(node) : null;
    left != null ? left.removeAdjacentNode(node) : null;
    bottom != null ? bottom.removeAdjacentNode(node) : null;
    right != null ? right.removeAdjacentNode(node) : null;
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
class Box extends GraphNode {
  constructor(value, id) {
    super(value, id);
    this.pointTL = null;
    this.pointBR = null;
    this.nodeType = BOX_TYPES.CLEAR;
    this.__path = null;
  }

  setAsStart() {
    this.nodeType = BOX_TYPES.START_NODE;
    this.__path.fillColor = COLORS.BOX_TYPE_START_NODE_COLOR;
  }

  removeAsStart() {
    if (this.nodeType == BOX_TYPES.START_NODE) {
      this.nodeType = BOX_TYPES.CLEAR;
      this.__path.fillColor = COLORS.BOX_TYPE_CLEAR_COLOR;
    }
  }

  setAsEnd() {
    this.nodeType = BOX_TYPES.END_NODE;
    this.__path.fillColor = COLORS.BOX_TYPE_END_NODE_COLOR;
  }

  removeAsEnd() {
    if (this.nodeType == BOX_TYPES.END_NODE) {
      this.nodeType = BOX_TYPES.CLEAR;
      this.__path.fillColor = COLORS.BOX_TYPE_CLEAR_COLOR;
    }
  }

  setAsClear() {
    this.nodeType = BOX_TYPES.CLEAR;
    this.__path.fillColor = COLORS.BOX_TYPE_CLEAR_COLOR;
  }

  setAsBlock() {
    this.nodeType = BOX_TYPES.BLOCK;
    this.__path.fillColor = COLORS.BOX_TYPE_BLOCK_COLOR;
  }

  setAsTraversed() {
    if (this.nodeType == BOX_TYPES.BLOCK) {
      this.nodeType = BOX_TYPES.ERROR_NODE;
      this.__path.fillColor = COLORS.BOX_TYPE_ERROR_NODE_COLOR;
    } else {
      this.nodeType = BOX_TYPES.TRAVERSED_NODE;
      this.__path.fillColor = COLORS.BOX_TYPE_TRAVERSED_NODE_COLOR;
    }
  }

  setAsPath() {
    if (this.nodeType == BOX_TYPES.TRAVERSED_NODE) {
      this.nodeType = BOX_TYPES.PATH_NODE;
      this.__path.fillColor = COLORS.BOX_TYPE_PATH_NODE_COLOR;
    }
  }

  resetTraversed() {
    if (
      this.nodeType == BOX_TYPES.TRAVERSED_NODE ||
      this.nodeType == BOX_TYPES.PATH_NODE
    ) {
      this.setAsClear();
    }
  }

  setAsFront() {
    this.nodeType = BOX_TYPES.TRAVERSED_NODE;
    this.__path.fillColor = "#000";
  }

  getFillColor() {
    switch (this.nodeType) {
      case BOX_TYPES.BLOCK:
        return COLORS.BOX_TYPE_BLOCK_COLOR;
      case BOX_TYPES.CLEAR:
        return COLORS.BOX_TYPE_CLEAR_COLOR;
      case BOX_TYPES.START_NODE:
        return COLORS.BOX_TYPE_START_NODE_COLOR;
      case BOX_TYPES.END_NODE:
        return COLORS.BOX_TYPE_END_NODE_COLOR[0];
    }
  }

  setPoints(pointTL, pointBR) {
    this.pointTL = pointTL;
    this.pointBR = pointBR;
  }

  draw() {
    this.__path = new Path.Rectangle(this.pointTL, this.pointBR);
    this.__path.strokeColor = COLORS.BOX_BORDER_COLOR;
    this.__path.fillColor = this.getFillColor();
    this.__path.strokeWidth = 0.3;
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
    this.__dragEnabled = false;
    this.__runner = null;
    this.onStartEndSet = () => {};
    this.onRunnerStop = () => {};
    // this.onRunnerStart = () => {};

    this.setRunner(DEFAULT_RUNNER_CODE);
  }

  getBoxSideLength() {
    const area = this.width * this.height;
    const singleBoxArea = area / this.graph.nodeCount;
    const singleBoxSideLength = Math.sqrt(singleBoxArea);
    console.log(singleBoxSideLength);
    return singleBoxSideLength;
  }

  perfromAction(r, c) {
    switch (ACTION_TOOL_MODE) {
      case TOOL_MODE.START_NODE:
        START_NODE = [r, c];
        this.setStart();
        break;
      case TOOL_MODE.TARGET_NODE:
        END_NODE = [r, c];
        this.setEnd();
        break;
      case TOOL_MODE.WALL_NODES:
        if (this.boxes[r][c].nodeType == BOX_TYPES.BLOCK) {
          this.setClear(r, c);
        } else {
          this.setBlock(r, c);
        }
        break;
    }
  }

  addEvents(box, r, c) {
    const self = this;
    box.path.onMouseDown = function(event) {
      self.__dragEnabled = true;
      self.perfromAction(r, c);
    };
    box.path.onMouseUp = function(event) {
      self.__dragEnabled = false;
    };
    box.path.onMouseEnter = function(event) {
      this.selected = true;
      if (self.__dragEnabled) {
        self.perfromAction(r, c);
      }
    };
    box.path.onMouseLeave = function(event) {
      this.selected = false;
    };
  }

  setBlock(r, c) {
    this.graph.removeAdjacent(r, c);
    this.boxes[r][c].setAsBlock();
  }
  setClear(r, c) {
    this.graph.joinAdjacent(r, c);
    this.boxes[r][c].setAsClear();
  }

  setStart() {
    for (let r = 0; r < this.graph.rowCount; r++) {
      for (let c = 0; c < this.graph.columnCount; c++) {
        this.boxes[r][c].removeAsStart();
      }
    }
    this.setClear(...START_NODE);
    this.boxes[START_NODE[0]][START_NODE[1]].setAsStart();
    this.onStartEndSet();
  }

  fixedGrid() {
    for (let r = 0; r < this.graph.rowCount; r++) {
      for (let c = 0; c < this.graph.columnCount; c++) {
        if (this.boxes[r][c].nodeType == BOX_TYPES.BLOCK) {
          this.setBlock(r, c);
        }
      }
    }
    console.log("fixing grid");
  }

  resetTraversal() {
    for (let r = 0; r < this.graph.rowCount; r++) {
      for (let c = 0; c < this.graph.columnCount; c++) {
        this.boxes[r][c].resetTraversed();
      }
    }
  }

  setEnd() {
    for (let r = 0; r < this.graph.rowCount; r++) {
      for (let c = 0; c < this.graph.columnCount; c++) {
        this.boxes[r][c].removeAsEnd();
      }
    }
    this.setClear(...END_NODE);
    this.boxes[END_NODE[0]][END_NODE[1]].setAsEnd();
    this.onStartEndSet();
  }

  clearGrid() {
    for (let r = 0; r < this.graph.rowCount; r++) {
      for (let c = 0; c < this.graph.columnCount; c++) {
        this.setClear(r, c);
      }
    }
    START_NODE = null;
    END_NODE = null;
    this.onStartEndSet();
    this.runner ? this.runner.stop() : null;
  }

  paintGrid() {
    const sideLength = this.boxSize || this.getBoxSideLength();

    for (let r = 0; r < this.graph.rowCount; r++) {
      for (let c = 0; c < this.graph.columnCount; c++) {
        const node = this.graph.nodes[r][c];
        const x1 = sideLength * c;
        const y1 = sideLength * r;
        const x2 = x1 + sideLength;
        const y2 = y1 + sideLength;

        node.setPoints(new Point(x1, y1), new Point(x2, y2));
        node.draw();
        this.addEvents(node, r, c);
      }
    }
  }

  setRunner(runnerCode) {
    this.__runner = new states.Runners[runnerCode]();
  }

  visualize(runnerCode) {
    this.resetTraversal();
    this.fixedGrid();
    this.runner.setNode(this.getBox(...START_NODE), this.getBox(...END_NODE));
    this.runner.init();
    this.runner.onStop = this.onRunnerStop;
    // this.__runner.onStart = this.onRunnerStart;
  }

  getBox(r, c) {
    return this.boxes[r][c];
  }

  get boxes() {
    return this.graph.nodes;
  }

  get boxArea() {
    return this.boxes[0][0].path.area;
  }
  get runner() {
    return this.__runner;
  }
}

function processGrid(rowCount, columnCount, width, height, boxSize) {
  project.clear();
  const graph = new GraphMatrix(rowCount, columnCount, Box);
  graph.process();
  ActiveGrid = new Grid(width, height, graph, boxSize);
  ActiveGrid.paintGrid();

  ActiveGrid.onStartEndSet = function() {
    if (START_NODE != null && END_NODE != null) {
      states.actionPanel.removeClass("invisible");
    } else {
      states.actionPanel.addClass("invisible");
    }
  };

  ActiveGrid.onRunnerStop = function() {
    states.actionPanel.addClass("invisible");
    states.startStopBtn.text("Start").prop("disabled", false);
    // states.toolModeInput.prop("disabled", false);
  };

  // ActiveGrid.onRunnerStart = function() {
  //   states.toolModeInput.prop("disabled", true);
  // };
}

// settings
class StateHandler {
  constructor() {
    this.__activeMode = TOOL_MODE.WALL_NODES;
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
  let boxSize = DEFAULT_BOX_SIZE;
  let columnCount = Math.trunc(states.width / boxSize);
  let rowCount = Math.trunc(states.height / boxSize);

  states.rowCountInput.val(rowCount);
  states.columnCountInput.val(columnCount);
  states.boxSizeInput.val(boxSize);
  states.algoNameDisplay.text("Depth First Search");

  states.rowCountInput.change(function(event) {
    rowCount = parseInt($(this).val()) || Math.trunc(states.height / t);
    processGrid(rowCount, columnCount, states.width, states.height, boxSize);
  });
  states.columnCountInput.change(function(event) {
    columnCount = parseInt($(this).val()) || Math.trunc(states.width / t);
    processGrid(rowCount, columnCount, states.width, states.height, boxSize);
  });
  states.boxSizeInput.change(function(event) {
    boxSize = parseInt($(this).val());
    processGrid(rowCount, columnCount, states.width, states.height, boxSize);
  });
  states.toolModeInput.change(function(event) {
    ACTION_TOOL_MODE = parseInt(this.value);
  });
  states.clearGraphBtn.click(function(event) {
    ActiveGrid.clearGrid();
    states.startStopBtn.text("Start").prop("disabled", false);
  });
  states.startStopBtn.click(function(event) {
    ActiveGrid.visualize();
    $(this)
      .text("Running..")
      .prop("disabled", true);
  });
  states.algoSelection.click(function(event) {
    const algo = event.target.dataset["algo"];
    if (ActiveGrid.runner && !ActiveGrid.runner.finish) {
      ActiveGrid.runner.stop();
    }
    ActiveGrid.setRunner(algo);
    ActiveGrid.resetTraversal();
    if (START_NODE && END_NODE) {
      states.actionPanel.removeClass("invisible");
    }
    states.algoNameDisplay.text(ActiveGrid.runner.name);
  });

  processGrid(rowCount, columnCount, states.width, states.height, boxSize);
};
