// paper js related
class Box extends GraphNode {
  constructor(value, id) {
    super(value, id);
    this.pointTL = null;
    this.pointBR = null;
    this.nodeType = states.BOX_TYPES.CLEAR;
    this.__path = null;
  }

  setAsStart() {
    this.nodeType = states.BOX_TYPES.START_NODE;
    this.__path.fillColor = {
      gradient: {
        stops: states.COLORS.BOX_TYPE_START_NODE_COLORS
      },
      origin: this.path.bounds.topLeft,
      destination: this.path.bounds.bottomRight
    };
  }

  removeAsStart() {
    if (this.nodeType == states.BOX_TYPES.START_NODE) {
      this.setAsClear();
    }
  }

  setAsEnd() {
    this.nodeType = states.BOX_TYPES.END_NODE;
    this.__path.fillColor = {
      gradient: {
        stops: states.COLORS.BOX_TYPE_END_NODE_COLORS
      },
      origin: this.path.bounds.topLeft,
      destination: this.path.bounds.rightCenter
    };
  }

  removeAsEnd() {
    if (this.nodeType == states.BOX_TYPES.END_NODE) {
      this.setAsClear();
    }
  }

  setAsClear() {
    this.nodeType = states.BOX_TYPES.CLEAR;
    this.__path.fillColor = states.COLORS.BOX_TYPE_CLEAR_COLOR;
  }

  setAsBlock() {
    this.nodeType = states.BOX_TYPES.BLOCK;
    this.path.tween(
      {
        fillColor: states.COLORS.BOX_TYPE_BLOCK_COLORS[0]
      },
      {
        fillColor: states.COLORS.BOX_TYPE_BLOCK_COLORS[1]
      },
      600
    );
  }

  setAsTraversed() {
    if (this.nodeType == states.BOX_TYPES.BLOCK) {
      this.nodeType = states.BOX_TYPES.ERROR_NODE;
      this.__path.fillColor = states.COLORS.BOX_TYPE_ERROR_NODE_COLOR;
    } else {
      this.nodeType = states.BOX_TYPES.TRAVERSED_NODE;
      this.path.tween(
        {
          fillColor: states.COLORS.BOX_TYPE_TRAVERSED_NODE_COLORS[0]
        },
        {
          fillColor: states.COLORS.BOX_TYPE_TRAVERSED_NODE_COLORS[1]
        },
        200
      );
    }
  }

  setAsPath() {
    if (this.nodeType == states.BOX_TYPES.TRAVERSED_NODE) {
      this.nodeType = states.BOX_TYPES.PATH_NODE;
      this.path.tween(
        {
          fillColor: states.COLORS.BOX_TYPE_PATH_NODE_COLORS[0]
        },
        {
          fillColor: states.COLORS.BOX_TYPE_PATH_NODE_COLORS[1]
        },
        300
      );
    }
  }

  resetTraversed() {
    if (
      this.nodeType == states.BOX_TYPES.TRAVERSED_NODE ||
      this.nodeType == states.BOX_TYPES.PATH_NODE
    ) {
      this.setAsClear();
    }
  }

  getFillColor() {
    switch (this.nodeType) {
      case states.BOX_TYPES.BLOCK:
        return states.COLORS.BOX_TYPE_BLOCK_COLOR;
      case states.BOX_TYPES.CLEAR:
        return states.COLORS.BOX_TYPE_CLEAR_COLOR;
      case states.BOX_TYPES.START_NODE:
        return states.COLORS.BOX_TYPE_START_NODE_COLOR;
      case states.BOX_TYPES.END_NODE:
        return states.COLORS.BOX_TYPE_END_NODE_COLORS[0];
    }
  }

  setPoints(pointTL, pointBR) {
    this.pointTL = pointTL;
    this.pointBR = pointBR;
  }

  draw() {
    this.__path = new paper.Path.Rectangle({
      from: this.pointTL,
      to: this.pointBR,
      strokeColor: states.COLORS.BOX_BORDER_COLOR,
      strokeWidth: 0.3,
      fillColor: this.getFillColor()
    });
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
    this.__start_node = null;
    this.__end_node = null;
    this.__action_mode = states.TOOL_MODE.WALL_NODES;
    this.onStartEndSet = () => {};
    this.onRunnerStop = () => {};
    this.onRunnerStart = () => {};

    this.setRunner(states.DEFAULT_RUNNER_CODE);
  }

  getBoxSideLength() {
    const area = this.width * this.height;
    const singleBoxArea = area / this.graph.nodeCount;
    const singleBoxSideLength = Math.sqrt(singleBoxArea);
    console.log(singleBoxSideLength);
    return singleBoxSideLength;
  }

  perfromAction(r, c) {
    const box = this.boxes[r][c];

    switch (this.__action_mode) {
      case states.TOOL_MODE.START_NODE:
        if (!this.runner.running) {
          this.__start_node = box;
          this.setStart();
        }
        break;
      case states.TOOL_MODE.TARGET_NODE:
        if (!this.runner.running) {
          this.__end_node = box;
          this.setEnd();
        }
        break;
      case states.TOOL_MODE.WALL_NODES:
        if (
          this.runner.running &&
          (box == this.__start_node ||
            box == this.__end_node ||
            box.nodeType == states.BOX_TYPES.TRAVERSED_NODE ||
            box.nodeType == states.BOX_TYPES.PATH_NODE)
        ) {
          return;
        }
        if (box.nodeType == states.BOX_TYPES.BLOCK) {
          this.setClear(r, c);
        } else {
          this.setBlock(r, c);
        }
        break;
    }
  }

  addEvents(box, r, c) {
    const self = this;
    box.path.onMouseEnter = function(e) {
      if (self.__dragEnabled) {
        self.perfromAction(r, c);
      }
    };

    box.path.onMouseDown = function(event) {
      event.preventDefault();
      self.__dragEnabled = true;
      self.perfromAction(r, c);
    };
    box.path.onMouseUp = function(event) {
      self.__dragEnabled = false;
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
    this.setClear(...this.startNode.value);
    this.startNode.setAsStart();
    this.onStartEndSet();
    this.setRunnerNodes();
  }

  fixedGrid() {
    for (let r = 0; r < this.graph.rowCount; r++) {
      for (let c = 0; c < this.graph.columnCount; c++) {
        if (
          this.boxes[r][c].nodeType == states.BOX_TYPES.BLOCK ||
          this.boxes[r][c].nodeType == states.BOX_TYPES.ERROR_NODE
        ) {
          this.setBlock(r, c);
        }
      }
    }
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
    this.setClear(...this.__end_node.value);
    this.__end_node.setAsEnd();
    this.onStartEndSet();
    this.setRunnerNodes();

    // if(this.)
  }

  clearGrid() {
    this.__start_node = null;
    this.__end_node = null;
    this.onStartEndSet();
    this.runner ? this.runner.stop() : null;

    setTimeout(() => {
      for (let r = 0; r < this.graph.rowCount; r++) {
        for (let c = 0; c < this.graph.columnCount; c++) {
          this.setClear(r, c);
        }
      }
    }, 300);
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

  setRunnerNodes() {
    this.runner.setNode(this.__start_node, this.__end_node);
  }

  setRunner(runnerCode) {
    this.__runner = new states.Runners[runnerCode](states.RunnerSpeeds.Fast);
  }

  setRunnerSpeed(speed) {
    this.__runner.speed = speed;
  }

  visualize() {
    this.setRunnerNodes();
    this.resetTraversal();
    this.fixedGrid();
    this.__runner.onStart = this.onRunnerStart;
    this.__runner.onStop = this.onRunnerStop;
    this.__runner.init();
  }

  getBox(r, c) {
    return this.boxes[r][c];
  }

  set actionMode(mode) {
    this.__action_mode = mode;
  }

  get actionMode() {
    return this.__action_mode;
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

  get startNode() {
    return this.__start_node;
  }

  get endNode() {
    return this.__end_node;
  }
}

function processGrid(rowCount, columnCount, width, height, boxSize) {
  project.clear();
  const graph = new GraphMatrix(rowCount, columnCount, Box);
  graph.process();
  states.Context.ActiveGrid = new Grid(width, height, graph, boxSize);
  states.Context.ActiveGrid.paintGrid();

  states.Context.ActiveGrid.onStartEndSet = function() {
    states.Context.ActiveGrid.resetTraversal();
    if (
      states.Context.ActiveGrid.startNode != null &&
      states.Context.ActiveGrid.endNode != null
    ) {
      states.actionPanel.removeClass("d-none");
    } else {
      states.actionPanel.addClass("d-none");
    }
  };

  states.Context.ActiveGrid.onRunnerStop = function() {
    // states.actionPanel.addClass("d-none");
    states.startStopBtn.text("Start").prop("disabled", false);
    states.resetGraphBtn.show();
    states.clearGraphBtn.show();
    states.runnerDuration.text(
      `${states.Context.ActiveGrid.runner.duration} ms`
    );
    // states.toolModeInput.prop("disabled", false);
    console.log(states.Context.ActiveGrid.runner.duration);
  };
  states.algoNameDisplay.text(states.Context.ActiveGrid.runner.name);
}

function init() {
  let boxSize = states.DEFAULT_BOX_SIZE;
  let columnCount = Math.trunc(states.width / boxSize);
  let rowCount = Math.trunc(states.height / boxSize);

  states.rowCountInput.val(rowCount);
  states.columnCountInput.val(columnCount);
  states.boxSizeInput.val(boxSize);
  states.resetGraphBtn.hide();

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
    states.Context.ActiveGrid.actionMode = states.TOOL_MODE[this.value];
  });
  states.clearGraphBtn.click(function(event) {
    states.Context.ActiveGrid.clearGrid();
    states.startStopBtn.text("Visualize").prop("disabled", false);
  });
  states.resetGraphBtn.click(function(event) {
    states.Context.ActiveGrid.resetTraversal();
  });
  states.startStopBtn.click(function(event) {
    states.Context.ActiveGrid.visualize();
    states.startStopBtn.text("Running..").prop("disabled", true);
    states.runnerDuration.text("...");
    states.resetGraphBtn.hide();
    states.clearGraphBtn.hide();
  });
  states.algoSelection.click(function(event) {
    const algo = event.target.dataset["algo"];
    if (
      states.Context.ActiveGrid.runner &&
      !states.Context.ActiveGrid.runner.finish
    ) {
      states.Context.ActiveGrid.runner.stop();
    }
    states.Context.ActiveGrid.setRunner(algo);
    states.Context.ActiveGrid.resetTraversal();
    if (
      states.Context.ActiveGrid.startNode &&
      states.Context.ActiveGrid.endNode
    ) {
      states.actionPanel.removeClass("invisible");
    }
    states.algoNameDisplay.text(states.Context.ActiveGrid.runner.name);
  });

  states.speedSelection.click(function(event) {
    const speed = event.target.dataset["speed"];
    states.Context.ActiveGrid.setRunnerSpeed(states.RunnerSpeeds[speed]);
    states.speedNameDisplay.text(speed);
  });

  processGrid(rowCount, columnCount, states.width, states.height, boxSize);
}

paper.install(window);
$(document).ready(function(_) {
  paper.setup("graph-canvas");
  init();
});

$(function() {
  $('[data-toggle="tooltip"]').tooltip();
});
