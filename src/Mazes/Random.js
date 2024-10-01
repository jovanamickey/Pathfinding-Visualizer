export function random(grid, setGrid, startNode, finishNode) {
  const newGrid = [...grid];

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      if (
        newGrid[row][col] === newGrid[startNode.row][startNode.col] ||
        newGrid[row][col] === newGrid[finishNode.row][finishNode.col]
      ) {
        continue;
      }
      newGrid[row][col].isWall = Math.random() < 0.3;
    }
  }
  setGrid(newGrid);
}
