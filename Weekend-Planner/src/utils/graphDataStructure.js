import { database } from "./firebase";
import { ref, set, get } from "firebase/database";

class Graph {
  constructor() {
    this.nodes = new Map();
  }

  addNode(key, value = {}) {
    const sanitizedKey = this.sanitizeKey(key);
    if (!this.nodes.has(sanitizedKey)) {
      this.nodes.set(sanitizedKey, { value, edges: new Set() });
    }
  }

  addEdge(node1, node2) {
    const sanitizedNode1 = this.sanitizeKey(node1);
    const sanitizedNode2 = this.sanitizeKey(node2);
    this.addNode(sanitizedNode1);
    this.addNode(sanitizedNode2);
    this.nodes.get(sanitizedNode1).edges.add(sanitizedNode2);
    this.nodes.get(sanitizedNode2).edges.add(sanitizedNode1);
  }

  getRelatedLocations(key) {
    const sanitizedKey = this.sanitizeKey(key);
    const node = this.nodes.get(sanitizedKey);
    return node ? Array.from(node.edges) : [];
  }

  sanitizeKey(key) {
    // Remove any invalid characters and trim the key
    return key.replace(/[.#$\/\[\]]/g, "_").trim();
  }

  async saveToFirebase() {
    const graphData = {};
    this.nodes.forEach((node, key) => {
      graphData[key] = {
        value: node.value,
        connectedLocations: Array.from(node.edges).reduce((acc, edge) => {
          acc[edge] = true;
          return acc;
        }, {}),
      };
    });

    const graphRef = ref(database, "locationGraph");
    await set(graphRef, graphData);
  }

  async loadFromFirebase() {
    const graphRef = ref(database, "locationGraph");
    const snapshot = await get(graphRef);
    const data = snapshot.val();

    if (data) {
      Object.entries(data).forEach(([key, { value, connectedLocations }]) => {
        this.addNode(key, value);
        Object.keys(connectedLocations).forEach((connectedLocation) => {
          this.addEdge(key, connectedLocation);
        });
      });
    }
  }
}

export default Graph;
