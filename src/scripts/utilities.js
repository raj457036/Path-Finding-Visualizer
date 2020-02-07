// utilities
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function openFullscreen() {
  if (window.innerHeight == screen.height) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE/Edge */
      document.msExitFullscreen();
    }
  } else {
    const elem = document.getElementById("home");
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
  }
}

class LNode {
  constructor(value) {
    this.__next = null;
    this.__value = value;
    this.__prev = null;
  }

  set next(node) {
    this.__next = node;
  }

  set prev(node) {
    this.__prev = node;
  }

  set value(value) {
    this.__value = value;
  }

  get value() {
    return this.__value;
  }

  get next() {
    return this.__next;
  }

  get prev() {
    return this.__prev;
  }
}
class Queue {
  constructor() {
    this.__head = null;
    this.__tail = null;
    this.__size = 0;
  }

  enqueue(...values) {
    for (let i = 0; i < values.length; i++) {
      const node = new LNode(values[i]);

      if (!this.__head) {
        this.__head = node;
        this.__tail = this.__head;
      } else {
        this.__tail.next = node;
        this.__tail = this.__tail.next;
      }

      this.__size++;
    }
  }

  dequeue() {
    if (this.__head) {
      const temp_node = this.head.value;
      this.__head = this.__head.next;
      this.__size--;
      return temp_node;
    } else return null;
  }

  get size() {
    return this.__size;
  }

  get tail() {
    return this.__tail;
  }

  get head() {
    return this.__head;
  }
}

class Stack {
  constructor() {
    this.__head = null;
    this.__tail = null;
    this.__size = 0;
  }

  push(...values) {
    for (let i = 0; i < values.length; i++) {
      const node = new LNode(values[i]);

      if (!this.__head) {
        this.__head = node;
        this.__tail = this.__head;
      } else {
        node.prev = this.__tail;
        this.__tail.next = node;
        this.__tail = this.__tail.next;
      }

      this.__size++;
    }
  }

  pop() {
    if (this.__tail) {
      const temp_node = this.__tail.value;

      if (this.__head == this.__tail) {
        this.__head = null;
      }
      this.__tail = this.__tail.prev;
      this.__size--;
      return temp_node;
    } else return null;
  }

  peek() {
    if (this.__tail) {
      return this.__tail.value;
    }
  }

  get size() {
    return this.__size;
  }
}

function getRowColumnCount(boxSize) {
  const row = Math.trunc(states.height / boxSize);
  const column = Math.trunc(states.width / boxSize);
  return [row, column];
}
