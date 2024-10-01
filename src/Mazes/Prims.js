export async function prims(grid, setGrid, startNode, finishNode) {
  const newGrid = grid.map((row) => {
    return row.map((node) => {
      return {
        ...node,
        isWall: true,
        isVisited: false,
      };
    });
  });
  setGrid(newGrid);
  let randomCell =
    newGrid[Math.floor(Math.random() * (grid.length - 1))][
      Math.floor(Math.random() * (grid[0].length - 1))
    ];
  randomCell.isWall = false;
  randomCell.isVisited = true;
  let wallList = [];
  getUnvisitedNeighbors(randomCell, newGrid, wallList);
  while (wallList.length > 0) {
    const randomWall = Math.floor(Math.random() * wallList.length);
    const [row, col, adjRow, adjCol] = wallList[randomWall];
    const wall = newGrid[row][col];
    const adjCell = newGrid[adjRow][adjCol];

    if (!adjCell.isVisited) {
      wall.isWall = false;
      adjCell.isWall = false;
      adjCell.isVisited = true;

      getUnvisitedNeighbors(adjCell, newGrid, wallList);
    }
    wallList.splice(randomWall, 1);

    await sleep(20);
    setGrid([...newGrid]);
  }
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      newGrid[row][col].isVisited = false;
    }
  }
  newGrid[startNode.row][startNode.col].isWall = false;
  newGrid[finishNode.row][finishNode.col].isWall = false;

  setGrid(newGrid);
}

function getUnvisitedNeighbors(node, grid, wallList) {
  const { col, row } = node;
  const neighbors = [];

  if (row > 1) neighbors.push([row - 2, col, row - 1, col]);
  if (row < grid.length - 2) neighbors.push([row + 2, col, row + 1, col]);
  if (col > 1) neighbors.push([row, col - 2, row, col - 1]);
  if (col < grid[0].length - 2) neighbors.push([row, col + 2, row, col + 1]);

  neighbors.forEach(([adjRow, adjCol, wallRow, wallCol]) => {
    const neighborCell = grid[adjRow][adjCol];
    if (neighborCell.isWall) {
      wallList.push([wallRow, wallCol, adjRow, adjCol]);
    }
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
