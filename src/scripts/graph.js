// class GraphNodeEdge {
//   constructor(nodeA, nodeB, weight = 1) {
//     this.__nodeA = nodeA;
//     this.__nodeB = nodeB;
//     this.__weight = weight;
//   }

//   get nodeA() {
//     return this.__nodeA;
//   }

//   get nodeB() {
//     return this.__nodeB;
//   }

//   get weight() {
//     return this.__weight;
//   }
// }

class GraphNode {
  constructor(value, id = uuidv4()) {
    this.id = id;
    this.value = value;
    this.__adjacent = new Set();
  }

  joinAdjacentNode(node) {
    node ? this.__adjacent.add(node) : null;
  }

  removeAdjacentNode(node) {
    this.__adjacent.delete(node);
  }

  setAdjacents(...nodes) {
    this.__adjacent = new Set(nodes);
    this.__adjacent.delete(null);
  }

  removeAdjacents() {
    this.__adjacent.clear();
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

    node.setAdjacents(top, left, bottom, right);
    node.adjacents.forEach(adj_node => adj_node.joinAdjacentNode(node));
  }

  removeAdjacent(r, c) {
    const node = this.nodes[r][c];
    node.adjacents.forEach(adjNode => {
      adjNode.removeAdjacentNode(node);
    });
    node.removeAdjacents();
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
