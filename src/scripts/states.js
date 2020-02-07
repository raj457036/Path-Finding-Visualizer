const states = Object.freeze({
  canvas: $("#graph-canvas"),
  rowCountInput: $("#row-count"),
  columnCountInput: $("#column-count"),
  boxSizeInput: $("#box-size"),
  toolModeInput: $("input[name=selectionMode]:radio"),
  clearGraphBtn: $("#clear-graph-btn"),
  resetGraphBtn: $("#reset-graph-btn"),
  startStopBtn: $(".start-stop-btn"),
  width: $("#graph-canvas").width(),
  height: $("#graph-canvas").height(),
  actionPanel: $(".action-panel"),
  algoSelection: $(".algo-selection"),
  speedSelection: $(".speed-selection"),
  algoNameDisplay: $("#selected-algo-name"),
  speedNameDisplay: $("#selected-speed-name"),
  runnerDuration: $("#runner-duration"),
  nextStepBtn: $(".next-step"),
  admissibleValue: $("#admissible-value"),
  admissibleValueDisplay: $("#admissibleValueDisplay"),
  DEFAULT_RUNNER_CODE: "dfs",
  MAX_END_NODE_COUNT: 3,
  MAX_FIXED_FRAME_COUNT: 400,
  DEFAULT_BOX_SIZE: window.innerWidth > 600 ? 40 : 30,
  COLORS: Object.freeze({
    BOX_BORDER_COLOR: "#192965",
    BOX_TYPE_BLOCK_COLORS: ["#00bf8f", "#102d58"],
    BOX_TYPE_CLEAR_COLOR: "#fff",
    BOX_TYPE_START_NODE_COLORS: ["#00c6ff", "#0072ff"],
    BOX_TYPE_END_NODE_COLORS: ["#fe8c00", "#f83600"],
    BOX_TYPE_TRAVERSED_NODE_COLORS: ["#134E5E", "lightgreen"],
    BOX_TYPE_PATH_NODE_COLORS: ["#FF8008", "#FFC837"],
    BOX_TYPE_ERROR_NODE_COLOR: "#6c757d"
  }),
  TOOL_MODE: Object.freeze({
    WALL_NODES: 0,
    START_NODE: 1,
    TARGET_NODE: 2
  }),
  BOX_TYPES: Object.freeze({
    BLOCK: 0,
    CLEAR: 1,
    START_NODE: 2,
    END_NODE: 3,
    TRAVERSED_NODE: 4,
    PATH_NODE: 5,
    ERROR_NODE: 6
  }),
  RunnerSpeeds: Object.freeze({
    Fast: 0,
    Medium: 128,
    Slow: 512,
    Step: null
  }),
  Runners: Object.freeze({
    dfs: DfsRunner,
    bfs: BfsRunner,
    bdsBFS: BdsRunnerBFS,
    bdsDFS: BdsRunnerDFS,
    dijkstra: DijkstraRunner,
    astar: AstarRunner
    // unknown: UnknownRunner,
    // maze runners
    // dfsMaze: DfsMazeRunner
  }),
  Context: {
    ActiveGrid: null,
    RunnerSpeed: 0,
    AdmissibleValue: 1
  }
});
