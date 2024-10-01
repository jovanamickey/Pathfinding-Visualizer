export function Dijkstra(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  const unvisitedNodes = getAllNodes(grid);
  const resetStartWall = startNode.isWall;
  const resetFinishWall = finishNode.isWall;
  startNode.isWall = false;
  finishNode.isWall = false;
  while (!!unvisitedNodes.length) {
    sortNodesByDistance(unvisitedNodes);
    const currentNode = unvisitedNodes.shift();
    if (currentNode.isWall) continue;
    if (currentNode.distance === Infinity) {
      startNode.isWall = resetStartWall;
      finishNode.isWall = resetFinishWall;
      return visitedNodesInOrder;
    }
    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);
    if (currentNode === finishNode) {
      startNode.isWall = resetStartWall;
      finishNode.isWall = resetFinishWall;
      return visitedNodesInOrder;
    }
    updateUnvisitedNeighbors(currentNode, grid);
  }
  startNode.isWall = resetStartWall;
  finishNode.isWall = resetFinishWall;
}

function sortNodesByDistance(unvisitedNodes) {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

function updateUnvisitedNeighbors(node, grid) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + 1;
    neighbor.previousNode = node;
  }
}

function getUnvisitedNeighbors(node, grid) {
  const neighbours = [];
  const { col, row } = node;
  if (row > 0) neighbours.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbours.push(grid[row + 1][col]);
  if (col > 0) neighbours.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbours.push(grid[row][col + 1]);
  return neighbours.filter((neighbor) => !neighbor.isVisited);
}

function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

export function getNodesInShortestPathOrderDijkstra(finishNode) {
  const getNodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    getNodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return getNodesInShortestPathOrder;
}
