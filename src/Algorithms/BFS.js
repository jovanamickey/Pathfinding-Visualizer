export function BFS(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  const queue = [startNode];
  startNode.isVisited = true;
  const resetStartWall = startNode.isWall;
  const resetFinishWall = finishNode.isWall;
  startNode.isWall = false;
  finishNode.isWall = false;
  while (queue.length > 0) {
    const currentNode = queue.shift();
    if (currentNode.isWall) continue;
    visitedNodesInOrder.push(currentNode);
    if (currentNode === finishNode) {
      startNode.isWall = resetStartWall;
      finishNode.isWall = resetFinishWall;
      return visitedNodesInOrder;
    }
    updateUnvisitedNeighbors(currentNode, queue, grid);
  }
  startNode.isWall = resetStartWall;
  finishNode.isWall = resetFinishWall;
  return visitedNodesInOrder;
}

function updateUnvisitedNeighbors(node, queue, grid) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    neighbor.previousNode = node;
    neighbor.isVisited = true;
    queue.push(neighbor);
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

export function getNodesInShortestPathOrderBFS(finishNode) {
  const getNodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    getNodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return getNodesInShortestPathOrder;
}
