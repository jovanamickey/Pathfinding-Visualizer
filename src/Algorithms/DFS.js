export function DFS(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  const stack = [startNode];
  const resetStartWall = startNode.isWall;
  const resetFinishWall = finishNode.isWall;
  startNode.isWall = false;
  finishNode.isWall = false;
  while (stack.length !== 0) {
    const currentNode = stack.pop();
    if (currentNode.isWall || currentNode.isVisited) continue;
    currentNode.isVisited = true;
    visitedNodesInOrder.push(currentNode);
    if (currentNode === finishNode) {
      startNode.isWall = resetStartWall;
      finishNode.isWall = resetFinishWall;
      return visitedNodesInOrder;
    }
    updateUnvisitedNeighbors(currentNode, stack, grid);
  }
  startNode.isWall = resetStartWall;
  finishNode.isWall = resetFinishWall;
  return visitedNodesInOrder;
}

function updateUnvisitedNeighbors(node, stack, grid) {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    neighbor.previousNode = node;
    stack.push(neighbor);
  }
}

function getUnvisitedNeighbors(node, grid) {
  const neighbours = [];
  const { col, row } = node;
  if (col > 0) neighbours.push(grid[row][col - 1]);
  if (row < grid.length - 1) neighbours.push(grid[row + 1][col]);
  if (col < grid[0].length - 1) neighbours.push(grid[row][col + 1]);
  if (row > 0) neighbours.push(grid[row - 1][col]);
  return neighbours.filter((neighbor) => !neighbor.isVisited);
}

export function getNodesInShortestPathOrderDFS(finishNode) {
  const getNodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    getNodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return getNodesInShortestPathOrder;
}
