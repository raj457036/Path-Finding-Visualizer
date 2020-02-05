// Runners
class Runner {
  constructor(name, speed) {
    this.name = name;
    this.timer = null;
    this.fixedTimer = null;
    this.finish = null;
    this.count = 0;
    this.__speed = speed || 16; // ~60fps
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
    let i = this.count;
    this.fixedTimer = setInterval(() => {
      if (i > 0) {
        this.fixedFrames();
        i--;
      } else {
        clearInterval(this.fixedTimer);
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
    this.onStop ? this.onStop() : null;
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
    return this.timer != null ? true : false;
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
    this.parent = null;
  }

  mapPath() {
    this.path = [];
    let node = this.endNode;
    while (node.id != this.startNode.id) {
      this.path.push(node);
      node = this.parent.get(node.id);
    }
    this.count = this.path.length;
  }

  firstFrame() {
    this.stack = new Stack();
    this.parent = new Map();
    this.stack.push(this.startNode);
  }

  perFrame() {
    if (this.stack.size > 0) {
      const node = this.stack.pop();
      if (node.id == this.endNode.id) {
        this.done();
        this.mapPath();
        return;
      }
      node.id != this.startNode.id ? node.setAsTraversed() : null;

      node.adjacents.forEach(r => {
        if (!this.parent.has(r.id)) {
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

    this.count = this.path.length;
  }

  firstFrame() {
    this.meetingNode = null;
    this.sstack = new Stack();
    this.estack = new Stack();
    this.sparent = new Map();
    this.eparent = new Map();
    this.sstack.push(this.startNode);
    this.estack.push(this.endNode);
  }

  perFrame() {
    if (this.sstack.size > 0 && this.estack.size > 0) {
      const snode = this.sstack.pop();
      const enode = this.estack.pop();

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
          this.sstack.push(r);
        }
      });

      enode.adjacents.forEach(r => {
        if (!this.eparent.has(r.id)) {
          this.eparent.set(r.id, enode);
          this.estack.push(r);
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
class AstarRunner extends NodeSetter {
  constructor() {
    super("A* Algoritm");
    this.hMap = null;
    this.gMap = null;
    this.fMap = null;
    this.openSet = null;
    this.closeSet = null;
    this.parent = null;
  }

  g(n) {
    return this.gMap.get(n);
  }

  h(n) {
    const dist =
      Math.abs(this.endNode.value[0] - n.value[0]) +
      Math.abs(this.endNode.value[1] - n.value[1]);
    return 5 * dist;
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

    return [min_fScore, min_fScore_node];
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
      const [current_score, current_node] = this.getLeastFNode();

      if (current_node == this.endNode) {
        this.done();
        this.mapPath();
        return;
      }
      current_node != this.startNode ? current_node.setAsTraversed() : null;

      current_node.changeText(Math.round(current_score));

      this.closeSet.add(current_node);
      this.openSet.delete(current_node);

      current_node.adjacents.forEach(node => {
        const gScore = this.g(current_node) + 1;

        if (gScore < this.g(node) || Infinity) {
          this.gMap.set(node, gScore);
          this.fMap.set(node, gScore + this.h(node));

          if (!this.closeSet.has(node)) {
            this.openSet.add(node);
            this.parent.set(node.id, current_node);
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
    this.visitedNodes = null;
    this.notVisitedNodes = null;
    this.weights = null;
    this.parent = null;
    this.path = null;
  }

  g(n) {
    const cost = this.weights.get(n);
    if (cost != null) {
      return cost;
    }

    return Infinity;
  }

  h(n) {
    if (this.endNode.value[0] > this.endNode.value[1]) {
      return Math.abs(this.endNode.value[0] - n.value[0]);
    } else {
      return Math.abs(this.endNode.value[1] - n.value[1]);
    }
  }

  f(n) {
    return this.h(n) - this.g(n);
  }

  getLeastFNode() {
    let min = Infinity;
    let min_node = null;
    this.notVisitedNodes.forEach(node => {
      const cost = this.f(node);

      if (cost < min) {
        min = cost;
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
    console.log(this.path.length);
    this.count = this.path.length;
  }

  firstFrame() {
    this.visitedNodes = new Set();
    this.notVisitedNodes = new Set([this.startNode]);
    this.weights = new Map();
    this.weights.set(this.startNode, 0);
    this.parent = new Map();
  }

  perFrame() {
    if (this.notVisitedNodes.size > 0) {
      const [cost, least_f_node] = this.getLeastFNode();

      this.visitedNodes.add(least_f_node);
      this.notVisitedNodes.delete(least_f_node);

      if (!least_f_node || least_f_node == this.endNode) {
        this.done();
        this.mapPath();
        return;
      }

      least_f_node != this.startNode ? least_f_node.setAsTraversed() : null;
      least_f_node.changeText(Math.round(cost));

      least_f_node.adjacents.forEach(node => {
        const wt = this.weights.get(node) || Infinity;
        if (wt > cost + 1 && !this.visitedNodes.has(node)) {
          this.weights.set(node, cost + 1);
          this.notVisitedNodes.add(node);
          this.parent.set(node.id, least_f_node);
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
