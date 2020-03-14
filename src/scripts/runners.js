// Runners
class Runner {
  constructor(name) {
    this.name = name;
    this.timer = null;
    this.fixedTimer = null;
    this.finish = null;
    this.count = 0;
    this.__speed = 0; // 0 = Max Speed
    this.onStop = null;
    this.onStart = null;
    this.onFrame = null;
    this.__startTime = null;
    this.__endTime = null;
  }

  recall() {
    this.onFrame ? this.onFrame() : null;
    this.perFrame();
    if (this.finish) {
      this.fixedRecall();
      return;
    }
    this.__speed != null
      ? (this.timer = setTimeout(() => this.recall(), this.__speed))
      : null;
  }

  init() {
    this.finish = false;
    this.onStart ? this.onStart() : null;
    this.firstFrame();

    this.__speed != null
      ? (this.timer = setTimeout(() => this.recall(), this.__speed))
      : null;
    this.__startTime = new Date().getTime();
  }

  fixedRecall() {
    if (!this.count) {
      this.onStop ? this.onStop() : null;
    }
    let i =
      this.count > states.MAX_FIXED_FRAME_COUNT
        ? states.MAX_FIXED_FRAME_COUNT
        : this.count;
    this.fixedTimer = setInterval(() => {
      if (i > 0) {
        this.fixedFrames();
        i--;
      } else {
        clearInterval(this.fixedTimer);
        this.fixedTimer = null;
        this.onStop ? this.onStop() : null;
      }
    }, this.__speed);
  }

  nextStep() {
    if (!this.finish) this.recall();
  }

  resume() {
    this.finish = false;
    this.recall();
  }

  done() {
    this.finish = true;
    this.stop();
  }

  stop() {
    clearTimeout(this.timer);
    this.timer = null;
    this.__endTime = new Date().getTime();
    // this.onStop ? this.onStop() : null;
  }

  firstFrame() {
    throw new Error("need to be implemented");
  }
  perFrame() {
    throw new Error("need to be implemented");
  }
  fixedFrames() {}

  set speed(speed) {
    this.__speed = speed;
  }

  get running() {
    return this.timer != null || this.fixedTimer != null ? true : false;
  }

  get speed() {
    return this.__speed;
  }

  get duration() {
    return this.finish ? this.__endTime - this.__startTime : 0;
  }
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
    this.path = null;
    this.visitedNodes = null;
    this.parent = null;
  }

  mapPath() {
    this.path = [];
    let node = this.endNode;
    while (node.id != this.startNode.id) {
      this.path.push(node);
      node = this.parent.get(node.id);
    }

    this.endNode.changeText(this.path.length);
    this.count = this.path.length;
  }

  firstFrame() {
    this.stack = new Stack();
    this.parent = new Map();
    this.visitedNodes = new Set();
    this.stack.push(this.startNode);
  }

  perFrame() {
    if (this.stack.size > 0) {
      let node = this.stack.pop();
      while (node && this.visitedNodes.has(node)) {
        node = this.stack.pop();
      }
      if (!node) {
        this.done();
        return;
      }

      if (node == this.endNode) {
        this.done();
        this.mapPath();
        return;
      }

      node != this.startNode ? node.setAsTraversed() : null;
      this.visitedNodes.add(node);

      node.adjacents.forEach(r => {
        if (!this.visitedNodes.has(r)) {
          this.parent.set(r.id, node);
          this.stack.push(r);
        }
      });
    } else {
      this.done();
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
  }

  mapPath() {
    this.path = [];
    let node = this.endNode;
    while (node.id != this.startNode.id) {
      this.path.push(node);
      node = this.parent.get(node.id);
    }
    this.endNode.changeText(this.path.length);
    this.count = this.path.length;
  }

  firstFrame() {
    this.queue = new Queue();
    this.parent = new Map();
    this.queue.enqueue(this.startNode);
  }

  perFrame() {
    if (this.queue.size > 0) {
      const node = this.queue.dequeue();
      if (!node) {
        this.done();
        return;
      }

      if (node.id == this.endNode.id) {
        this.done();
        this.mapPath();
        return;
      }
      

      node.id != this.startNode.id ? node.setAsTraversed() : null;
      node.adjacents.forEach(r => {
        if (!this.parent.has(r.id)) {
          this.queue.enqueue(r);
          this.parent.set(r.id, node);
        }
      });
    } else {
      this.done();
      this.mapPath();
      return;
    }
  }

  fixedFrames() {
    const n = this.path.pop();
    n.setAsPath();
  }
}

// Bi-Directional Search (BFS)
class BdsRunnerBFS extends NodeSetter {
  constructor() {
    super("Bi-Directional Search (BFS)");
    this.squeue = null;
    this.equeue = null;
    this.parent = null;
    this.eparent = null;
    this.path = null;
    this.meetingNode = null;
  }

  mapPath() {
    const pathA = [];
    let node = this.meetingNode;

    while (node != this.startNode) {
      pathA.push(node);
      node = this.sparent.get(node.id);
    }

    const pathB = [];
    node = this.meetingNode;

    while (node && node != this.endNode) {
      pathB.push(node);
      node = this.eparent.get(node.id);
    }

    this.path = [...pathB.reverse(), ...pathA];

    this.endNode.changeText(this.path.length);
    this.count = this.path.length;
  }

  firstFrame() {
    this.meetingNode = null;
    this.squeue = new Queue();
    this.equeue = new Queue();
    this.sparent = new Map();
    this.eparent = new Map();
    this.squeue.enqueue(this.startNode);
    this.equeue.enqueue(this.endNode);
  }

  perFrame() {
    if (this.squeue.size > 0 && this.equeue.size > 0) {
      const snode = this.squeue.dequeue();
      const enode = this.equeue.dequeue();

      snode != this.startNode ? snode.setAsTraversed() : null;
      enode != this.endNode ? enode.setAsTraversed() : null;

      if (this.sparent.has(enode.id) && !this.eparent.has(snode.id)) {
        this.meetingNode = enode;
      } else if (this.eparent.has(snode.id) && !this.sparent.has(enode.id)) {
        this.meetingNode = snode;
      }

      if (this.meetingNode) {
        this.done();
        this.mapPath();
        return;
      }

      snode.adjacents.forEach(r => {
        if (!this.sparent.has(r.id)) {
          this.sparent.set(r.id, snode);
          this.squeue.enqueue(r);
        }
      });

      enode.adjacents.forEach(r => {
        if (!this.eparent.has(r.id)) {
          this.eparent.set(r.id, enode);
          this.equeue.enqueue(r);
        }
      });
    } else {
      this.done();
      return;
    }
  }

  fixedFrames() {
    const n = this.path.pop();
    n.setAsPath();
  }
}

// Bi-Directional Search (DFS)
class BdsRunnerDFS extends NodeSetter {
  constructor() {
    super("Bi-Directional Search (DFS)");
    this.sstack = null;
    this.estack = null;
    this.sVisitedNodes = null;
    this.eVisitedNodes = null;
    this.parent = null;
    this.eparent = null;
    this.path = null;
    this.meetingNode = null;
  }

  mapPath() {
    const pathA = [];
    let node = this.meetingNode;

    while (node != this.startNode) {
      pathA.push(node);
      node = this.sparent.get(node.id);
    }

    const pathB = [];
    node = this.meetingNode;

    while (node && node != this.endNode) {
      pathB.push(node);
      node = this.eparent.get(node.id);
    }

    this.path = [...pathB.reverse(), ...pathA];

    this.endNode.changeText(this.path.length);
    this.count = this.path.length;
  }

  firstFrame() {
    this.meetingNode = null;
    this.sstack = new Stack();
    this.estack = new Stack();
    this.eVisitedNodes = new Set();
    this.sVisitedNodes = new Set();
    this.sparent = new Map();
    this.eparent = new Map();
    this.sstack.push(this.startNode);
    this.estack.push(this.endNode);
  }

  perFrame() {
    if (this.sstack.size > 0 && this.estack.size > 0) {
      let snode = this.sstack.pop();
      let enode = this.estack.pop();

      while (snode && this.sVisitedNodes.has(snode)) {
        snode = this.sstack.pop();
      }
      while (enode && this.eVisitedNodes.has(enode)) {
        enode = this.estack.pop();
      }
      if (!enode || !snode) {
        this.done();
        return;
      }

      snode != this.startNode ? snode.setAsTraversed() : null;
      enode != this.endNode ? enode.setAsTraversed() : null;

      if (this.sVisitedNodes.has(enode) && !this.eVisitedNodes.has(snode)) {
        this.meetingNode = enode;
      } else if (
        this.eVisitedNodes.has(snode) &&
        !this.sVisitedNodes.has(enode)
      ) {
        this.meetingNode = snode;
      }

      if (this.meetingNode) {
        this.done();
        this.mapPath();
        return;
      }

      this.sVisitedNodes.add(snode);
      this.eVisitedNodes.add(enode);

      snode.adjacents.forEach(node => {
        if (!this.sVisitedNodes.has(node)) {
          this.sstack.push(node);
          this.sparent.set(node.id, snode);
        }
      });

      enode.adjacents.forEach(node => {
        if (!this.eVisitedNodes.has(node)) {
          this.eparent.set(node.id, enode);
          this.estack.push(node);
        }
      });
    } else {
      this.done();
      return;
    }
  }

  fixedFrames() {
    const n = this.path.pop();
    n.setAsPath();
  }
}

// Dijkstra's Single Source shortest path
class DijkstraRunner extends NodeSetter {
  constructor() {
    super("Dijkstra's Algorithm");
    this.visitedNodes = null;
    this.notVisitedNodes = null;
    this.distance = null;
    this.path = null;
    this.parent = null;
  }

  getMinDistNode() {
    let min = Infinity;
    let min_node = null;
    this.distance.forEach((distance, node) => {
      if (distance < min && !this.visitedNodes.has(node)) {
        min = distance;
        min_node = node;
      }
    });

    return [min, min_node];
  }

  mapPath() {
    this.path = [];

    let node = this.endNode;

    while (node && node != this.startNode) {
      this.path.push(node);
      node = this.parent.get(node.id);
    }
    this.count = this.path.length;
  }

  firstFrame() {
    this.visitedNodes = new Set();
    this.notVisitedNodes = new Set([this.startNode]);
    this.distance = new Map();
    this.distance.set(this.startNode, 0);
    this.parent = new Map();
  }

  perFrame() {
    const [min_dist, min_node] = this.getMinDistNode();
    this.visitedNodes.add(min_node);
    min_node ? min_node.changeText(min_dist) : null;
    if (!min_node) {
      this.done();
      return;
    }
    if (min_node == this.endNode) {
      this.done();
      this.mapPath();
      return;
    }
    this.notVisitedNodes.delete(min_node);
    min_node.adjacents.forEach(n => this.notVisitedNodes.add(n));

    min_node != this.startNode && min_node != this.endNode
      ? min_node.setAsTraversed()
      : null;

    this.notVisitedNodes.forEach(node => {
      const dist = this.distance.get(node) || Infinity;

      if (!this.visitedNodes.has(node) && dist > min_dist + 1) {
        this.distance.set(node, min_dist + 1);
        this.parent.set(node.id, min_node);
      }
    });
  }

  fixedFrames() {
    const u = this.path.pop();
    u.setAsPath();
  }
}

// A* Algorithm
function getName(h) {
  switch (h) {
    case "manhattan":
      return "A* Algorithm (Manhattan Heuristic)";
    case "euclidean":
      return "A* Algorithm (Euclidean Heuristic)";
    case "diagonal":
      return "A* Algorithm (Diagonal Heuristics)";
  }
}

class AstarRunner extends NodeSetter {
  constructor(extra) {
    super(getName(extra.h));
    this.hMap = null;
    this.gMap = null;
    this.fMap = null;
    this.openSet = null;
    this.closeSet = null;
    this.parent = null;
    this.extra = extra;
  }

  manhattanH(n) {
    return (
      Math.abs(n.value[0] - this.endNode.value[0]) +
      Math.abs(n.value[1] - this.endNode.value[1])
    );
  }

  euclideanH(n) {
    return Math.sqrt(
      Math.pow(n.value[0] - this.endNode.value[0], 2) +
        Math.pow(n.value[1] - this.endNode.value[1], 2)
    );
  }

  diagonalH(n) {
    const dx = Math.abs(n.value[0] - this.endNode.value[0]);
    const dy = Math.abs(n.value[1] - this.endNode.value[1]);
    const D = 1;
    const D2 = this.extra.d == 2 ? Math.sqrt(2) : 1;

    return D * (dx + dy) + (D2 - 2 * D) * Math.min(dx, dy);
  }

  g(n) {
    return this.gMap.get(n);
  }

  h(n) {
    switch (this.extra.h) {
      case "manhattan":
        return states.Context.AdmissibleValue * this.manhattanH(n);
      case "euclidean":
        return states.Context.AdmissibleValue * this.euclideanH(n);
      case "diagonal":
        return states.Context.AdmissibleValue * this.diagonalH(n);
    }
  }

  f(n) {
    const fScore = this.fMap.get(n);

    if (fScore != null) {
      return fScore;
    }
    return Infinity;
  }

  getLeastFNode() {
    let min_fScore = Infinity;
    let min_fScore_node = null;

    this.openSet.forEach(node => {
      const fScore = this.f(node);
      if (fScore < min_fScore) {
        min_fScore = fScore;
        min_fScore_node = node;
      }
    });

    return min_fScore_node;
  }

  mapPath() {
    this.path = [];

    let node = this.endNode;

    while (node && node != this.startNode) {
      this.path.push(node);
      node = this.parent.get(node.id);
    }
    this.count = this.path.length;
  }

  firstFrame() {
    this.gMap = new Map();
    this.fMap = new Map();
    this.closeSet = new Set();
    this.openSet = new Set([this.startNode]);
    this.gMap.set(this.startNode, 0);
    this.fMap.set(this.startNode, this.h(this.startNode));
    this.parent = new Map();
  }

  perFrame() {
    if (this.openSet.size > 0) {
      const current_node = this.getLeastFNode();

      current_node.changeText(this.g(current_node));

      if (current_node == this.endNode) {
        this.done();
        this.mapPath();
        return;
      }

      current_node != this.startNode ? current_node.setAsTraversed() : null;

      this.closeSet.add(current_node);
      this.openSet.delete(current_node);

      current_node.adjacents.forEach(node => {
        if (!this.closeSet.has(node)) {
          const gScore = this.g(current_node) + 1;
          if (!this.openSet.has(node)) {
            this.parent.set(node.id, current_node);
            this.gMap.set(node, gScore);
            this.fMap.set(node, gScore + this.h(node));
            this.openSet.add(node);
          } else {
            if (gScore < this.g(node)) {
              this.parent.set(node.id, current_node);
              this.gMap.set(node, this.g(current_node) + 1);
              this.fMap.set(node, this.g(node) + this.h(node));
            }
          }
        }
      });
    } else {
      this.done();
      return;
    }
  }

  fixedFrames() {
    const n = this.path.pop();
    n.setAsPath();
  }
}

// unknown
class UnknownRunner extends NodeSetter {
  constructor() {
    super("Unknown Algoritm");
  }

  mapPath() {
    this.path = [];

    let node = this.endNode;

    while (node && node != this.startNode) {
      this.path.push(node);
      node = this.parent.get(node.id);
    }
    this.count = this.path.length;
  }

  firstFrame() {
    this.gMap = new Map();
    this.fMap = new Map();
    this.closeSet = new Set();
    this.openSet = new Set([this.startNode]);
    this.gMap.set(this.startNode, 0);
    this.fMap.set(this.startNode, this.h(this.startNode));
    this.parent = new Map();
  }

  perFrame() {
    if (this.openSet.size > 0) {
      const current_node = this.getLeastFNode();

      current_node.changeText(this.g(current_node));

      if (current_node == this.endNode) {
        this.done();
        this.mapPath();
        return;
      }

      current_node != this.startNode ? current_node.setAsTraversed() : null;

      this.closeSet.add(current_node);
      this.openSet.delete(current_node);

      current_node.adjacents.forEach(node => {
        if (!this.closeSet.has(node)) {
          const gScore = this.g(current_node) + 1;
          if (!this.openSet.has(node)) {
            this.parent.set(node.id, current_node);
            this.gMap.set(node, gScore);
            this.fMap.set(node, this.h(node) + gScore);
            this.openSet.add(node);
          } else {
            if (gScore < this.g(node)) {
              this.parent.set(node.id, current_node);
              this.gMap.set(node, this.g(current_node) + 1);
              this.fMap.set(node, this.h(node) + this.g(node));
            }
          }
        }
      });
    } else {
      this.done();
      return;
    }
  }

  fixedFrames() {
    const n = this.path.pop();
    n.setAsPath();
  }
}
