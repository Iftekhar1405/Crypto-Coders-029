import Graph from "./graphDataStructure";

const initializeLocationGraph = async () => {
  const graph = new Graph();

  // Add nodes (locations)
  graph.addNode("Delhi");
  graph.addNode("Agra");
  graph.addNode("Jaipur");
  graph.addNode("Mumbai");
  graph.addNode("Goa");

  // Add edges (connections between locations)
  graph.addEdge("   ", "Agra");
  graph.addEdge("Delhi", "Jaipur");
  graph.addEdge("Agra", "Jaipur");
  graph.addEdge("Mumbai", "Goa");

  // Save the graph to Firebase
  await graph.saveToFirebase();
  console.log("Location graph initialized in Firebase");
};

// Run this function once to initialize the graph
// initializeLocationGraph();

export default initializeLocationGraph;
