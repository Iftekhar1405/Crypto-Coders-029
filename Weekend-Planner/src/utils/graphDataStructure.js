class Graph {
  constructor() {
    this.adjacencyList = new Map();
  }

  addVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, new Set());
    }
  }

  addEdge(vertex1, vertex2) {
    this.addVertex(vertex1);
    this.addVertex(vertex2);
    this.adjacencyList.get(vertex1).add(vertex2);
    this.adjacencyList.get(vertex2).add(vertex1);
  }

  removeEdge(vertex1, vertex2) {
    this.adjacencyList.get(vertex1).delete(vertex2);
    this.adjacencyList.get(vertex2).delete(vertex1);
  }

  removeVertex(vertex) {
    if (!this.adjacencyList.has(vertex)) return;

    for (let adjacentVertex of this.adjacencyList.get(vertex)) {
      this.removeEdge(vertex, adjacentVertex);
    }
    this.adjacencyList.delete(vertex);
  }

  depthFirstSearch(start) {
    const visited = new Set();
    const result = [];

    const dfs = (vertex) => {
      if (!vertex) return null;

      visited.add(vertex);
      result.push(vertex);

      this.adjacencyList.get(vertex).forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          return dfs(neighbor);
        }
      });
    };

    dfs(start);
    return result;
  }

  breadthFirstSearch(start) {
    const queue = [start];
    const result = [];
    const visited = new Set();
    visited.add(start);

    while (queue.length) {
      let vertex = queue.shift();
      result.push(vertex);

      this.adjacencyList.get(vertex).forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      });
    }
    return result;
  }

  findShortestPath(start, end) {
    const queue = [[start]];
    const visited = new Set();

    while (queue.length > 0) {
      const path = queue.shift();
      const vertex = path[path.length - 1];

      if (vertex === end) {
        return path;
      }

      if (!visited.has(vertex)) {
        for (let neighbor of this.adjacencyList.get(vertex)) {
          const newPath = [...path, neighbor];
          queue.push(newPath);
        }
        visited.add(vertex);
      }
    }
    return null; // Path not found
  }
}

export default Graph;
