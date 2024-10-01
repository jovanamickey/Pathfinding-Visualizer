export function Astar(grid, startNode, finishNode) {
  const openList = [startNode];
  const closedList = new Set();
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  startNode.totalDistance = 0;
  const resetStartWall = startNode.isWall;
  const resetFinishWall = finishNode.isWall;
  startNode.isWall = false;
  finishNode.isWall = false;
  while (!!openList.length) {
    sortNodesByCost(openList);
    const currentNode = openList.shift();
    if (currentNode === startNode && currentNode.isWall) {
      currentNode.isWall = false;
    }
    if (currentNode.isWall) continue;
    closedList.add(currentNode);
    visitedNodesInOrder.push(currentNode);
    if (currentNode === finishNode) {
      startNode.isWall = resetStartWall;
      finishNode.isWall = resetFinishWall;
      return getNodesInShortestPathOrderAstar(finishNode);
    }
    updateUnvisitedNeighbors(currentNode, openList, finishNode, grid);
  }
  startNode.isWall = resetStartWall;
  finishNode.isWall = resetFinishWall;

  return visitedNodesInOrder;
}

function heuristic(node, finishNode) {
  const x =
    Math.abs(node.row - finishNode.row) + Math.abs(node.col - finishNode.col);
  return x;
}

function sortNodesByCost(unvisitedNodes) {
  unvisitedNodes.sort(
    (nodeA, nodeB) => nodeA.totalDistance - nodeB.totalDistance
  );
}

function updateUnvisitedNeighbors(node, openList, finishNode, grid) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    const tentative = node.distance + 1;
    if (tentative < neighbor.distance) {
      neighbor.distance = tentative;
      neighbor.totalDistance =
        neighbor.distance + heuristic(neighbor, finishNode);
      neighbor.previousNode = node;
      if (!openList.includes(neighbor)) {
        openList.push(neighbor);
      }
    }
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

export function getNodesInShortestPathOrderAstar(finishNode) {
  const getNodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    getNodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return getNodesInShortestPathOrder;
}
