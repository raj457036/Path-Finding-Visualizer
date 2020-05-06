# PathViz - Graph Path Visualizer
# PATH FINDING VISUALIZER

An easy to use Interactive Graph Path visualizer with batteries included implementing your own Algorithm.

### Try (use Safari or Chorme or Firefox): [Here](https://github.com/raj457036/Path-Finding-Visualizer/)

<img src="src/assets/Screenshot (1).png" align="center" style="max-width: 60%">

## Features

1. Interactive with Touch/Pen Input supported
2. Fully optimized for low-end Mobiles and Tablet devices.
3. Responsive Design
4. All the Basic and Advance Path Finding algorithms
5. Easy to extend API to check your own pathfinding algorithm
6. Fast, Medium, Slow and Step Wise execution for better understanding of Algorithm.
7. Customizable Grid system (Colors, Execution Speed, Pause, Resume, Stop)
8. Some of Maze Generation Algorithms included (more coming soon)

### Note

_Use Latest Chrome/ Chromium Browsers/ Safari (mobile/ Tablets/ Desktop)_

### Implemented Path Finding Algorithms

- [Depth First Search](https://en.wikipedia.org/wiki/Depth-first_search)
- [Breadth First Search](https://en.wikipedia.org/wiki/Breadth-first_search)
- [Bi-Directional Search](https://en.wikipedia.org/wiki/Bidirectional_search)
  - [Depth First Search](https://en.wikipedia.org/wiki/Depth-first_search)
  - [Breadth First Search](https://en.wikipedia.org/wiki/Breadth-first_search)
- [Dijkstra's Algorithm](https://en.wikipedia.org/wiki/Dijkstra's_algorithm)
- [A\* Search Algorithm](https://en.wikipedia.org/wiki/A*_search_algorithm)
  - [Manhattan Heuristic](http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html#diagonal-distance)
  - [Euclidean Heuristic](http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html#euclidean-distance-squared)
  - [Diagonal Heuristic](http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html#diagonal-distance)
    - [Chebyshev distance](http://en.wikipedia.org/wiki/Chebyshev_distance)
    - [Octile distance](https://www.sciencedirect.com/science/article/pii/S1000936116301182)
- [Best First Search](https://en.wikipedia.org/wiki/Best-first_search) (Next Update)

### Implemented Maze Algorithms

- Random Maze Generator
  <!-- - Recursive Division (Update soon) -->

### How To Implement My Own Algorithm

PathViz's all the algorithms are based on Runner class
it's a simple class with three main methods

**Note**
Runner work as a delayed loop (why? to animate the progress and have more control over the process)

Also, it helps in **Step mode** execution (step by step execution)

- **`constructor`**
  - declare all the needed variables here
- **`firstFrame()`**
  - initialize all your variabled (like first step in any recursive function call)
- **`perFrame()`**

  - code for every next iteration
  - if a certain condition met just call `this.done()`
  - `this.done()` will stop the execution and `this.fixedFrame` will be called next

- **`fixedFrame()`**
  - this function run for limited number(upto `this.count`) of count after `this.done()` is called
  - run any other pre-processing test after `this.done` (like tracing a path in a list) and updating `this.count` value

**After you done with your runner's implementation just add it to Runners List in `states` consent and add it to "Algorithm" list in index.html**

```html
<a class="nav-link dropdown-toggle"
  href="#"
  id="algo-choice"
  role="button"
  data-toggle="dropdown"
  title="Change Algorithm"
  aria-haspopup="true"
  aria-expanded="false"
>
  <i class="fa fa-filter"></i> Algorithm
</a>
<ul class="dropdown-menu" aria-labelledby="navbarDropdown">
  <li>
    <a class="dropdown-item algo-selection" data-algo="runner_identifier_as_defined_in_states">
      Your Algorithm Name <------
    </a>
  </li>
  <li>
    <a class="dropdown-item algo-selection" data-algo="dfs"
      >Depth First Search (DFS)
    </a>
  </li>
  ... other runners ...
  </a>

```

### Example

- Implementation of DFS

```javascript
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
```

## Classes

- **Runner** - `runner.js`

  - abstract class to implement runner

- **NodeSetter** - `runner.js`

  - It Extends Runner
  - utility class that enables assignment of `this.startNode` and `this.endNode`
  - every runner should extends `NodeSetter` class (see above example)

- **GraphNode** - `graph.js`
  Base Node class for graphNodes

  - extends this to add more informations (eg. Box class extends GraphNode)
  - property `id` holds unique id of this node (default: uuid4)
  - property `value` holds location of the node in grid
  - property `adjacents` holds adjacents nodes in `Set()`

- **GraphMatrix** - `graph.js`
  Graph Class that creates Grid Structure using GraphNode class

- **Box** - `grid.js`
  Extends GraphNode i.e used by **GraphMatrix** to build Grid system

  - **Methods**
    - `changeText(text)` : used to add text to center of box
    - `resetText()` : used to remove text from the box
    - `setAsStart()`: will set this box as start node (this is called by Grid class for handling states)
    - `removeAsStart()`: will remove this box as start node (called by Grid class)
    - `setAsEnd()`: will set this box as end node (this is called by Grid class for handling states)
    - `removeAsEnd()`: will remove this box as end node (called by Grid class)
    - `setAsBlock()`: create a wall and remove adjacent node connections
    - `setAsClear()`: rejoins the adjacent nodes
    - `setAsTraversed()`: mark box as traversed
    - `setAsPath()`: mark box as path
    - `resetTraversed()`: change traversed/path to clear box

- **Grid** -`grid.js`
  This class is the main class that join all the bits and bytes in PathViz

  - handles events (click, drag, touch, etc.)
  - handles boxes in good manners

  - **Methods**
    - `setAsBlock(row_index, col_index)`: create block/ wall in grid
    - `setAsClear(row_index, col_index)`: join adjacents nodes
    - `resetTraversal()`: reset traversed boxes
    - `clearGrid()`: clear every box in grid (i.e re joins all the node connections)
    - `setRunnerNodes()`: re-assign startNode and endNodes to the connected runner( how? the event calls assign startNode and endNode in Grid and calling `setRunnerNode` will assign these node to runner)
    - `setRunner(runnerCode, extra)`: assign runner to grid
      - `runnerCode`: the key you used for Runner in `states.Runners` Map
      - `extra`: if your Runners Implementation has `extra parameter` (ie. Map for extra information needed) [check A* Runner]
    - `setRunnerSpeed(speed)`: speed enum is defined in `states` object. this method will asign execution speed (i.e `perFrame()` method frequency)
    - `getBox(row_index,col_index)`: returns live box from grid
    - `boxes`: getter to access boxes matrix (2d array)
    - `runner`: getter to access currently assigned runner to grid
    - `startNode` and `endNode`: getters to access StartBox and EndBox respectively
    - `visualize()`: will initiate runner

#### Utility Classes

utility classes and methods are defined in `utility.js`

- **Queue**
- **Stack**
- **LNode** : Doubly LinkedList node used in `Queue` and `Stack`
- **uuidv4()**

#### Globals

- **`processGrid(rowCount, columnCount, width, height, boxSize)`**: will re-paint every thing within confined constraints

* **preset grid`**: resets grid (removes box with traversed/path mark and text on boxes)

- **`init()`**: reinitialize whole page (events, colours, grid, states, etc.)

* **`states`** Object: - `states.js`
  holds states of the app constants, enum, context, elementRef, etc.
  - **Context**
    - **ActiveGrid** : currently active grid object
