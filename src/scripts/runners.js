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
    this.timer = setTimeout(() => this.recall(), this.__speed);
  }

  init() {
    this.finish = false;
    this.onStart ? this.onStart() : null;
    this.firstFrame();
    this.timer = setTimeout(() => this.recall(), this.__speed);
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
    super("Bi-Directional Search(BFS)");
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
