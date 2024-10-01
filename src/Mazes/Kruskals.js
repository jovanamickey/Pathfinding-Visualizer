class DisjointSet {
  constructor() {
    this.parent = {};
    this.rank = {};
  }
  makeSet(x) {
    if (!(x in this.parent)) {
      this.parent[x] = x;
      this.rank[x] = 0;
    }
  }
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]);
      return this.parent[x];
    } else {
      return x;
    }
  }
  union(x, y) {
    x = this.find(x);
    y = this.find(y);
    if (x == y) return;
    if (this.rank[x] < this.rank[y]) {
      [x, y] = [y, x];
    }
    this.parent[y] = x;
    if (this.rank[x] == this.rank[y]) {
      this.rank[x] = this.rank[x] + 1;
    }
  }
}

export async function kruskals(grid, setGrid, startNode, finishNode) {
  const rows = grid.length;
  const cols = grid[0].length;
  const disjointSet = new DisjointSet();
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
  for (let row = 0; row < rows; row += 2) {
    for (let col = 0; col < cols; col += 2) {
      disjointSet.makeSet(`${row}-${col}`);
    }
  }
  const walls = [];
  for (let row = 0; row < rows; row += 2) {
    for (let col = 0; col < cols; col += 2) {
      walls.push(...getWalls({ row, col }, rows, cols));
    }
  }
  shuffle(walls);
  for (const wall of walls) {
    const cell1 = `${wall.row}-${wall.col}`;
    const cell2 = `${wall.neighborCellRow}-${wall.neighborCellCol}`;

    if (disjointSet.find(cell1) !== disjointSet.find(cell2)) {
      disjointSet.union(cell1, cell2);
      newGrid[wall.row][wall.col].isWall = false;
      newGrid[wall.wallRow][wall.wallCol].isWall = false;
      newGrid[wall.neighborCellRow][wall.neighborCellCol].isWall = false;
      await sleep(20);
      setGrid([...newGrid]);
    }
  }
  newGrid[startNode.row][startNode.col].isWall = false;
  newGrid[finishNode.row][finishNode.col].isWall = false;
  setGrid(newGrid);
}

function shuffle(array) {
  //Fisher-Yates shuffle Algorithm
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getWalls(cell, rows, cols) {
  const walls = [];
  const { row, col } = cell;
  if (col < cols - 2) {
    walls.push({
      direction: "right",
      row,
      col,
      wallRow: row,
      wallCol: col + 1,
      neighborCellRow: row,
      neighborCellCol: col + 2,
    });
  }
  if (col > 0) {
    walls.push({
      direction: "left",
      row,
      col,
      wallRow: row,
      wallCol: col - 1,
      neighborCellRow: row,
      neighborCellCol: col - 2,
    });
  }
  if (row < rows - 2) {
    walls.push({
      direction: "down",
      row,
      col,
      wallRow: row + 1,
      wallCol: col,
      neighborCellRow: row + 2,
      neighborCellCol: col,
    });
  }
  if (row > 0) {
    walls.push({
      direction: "up",
      row,
      col,
      wallRow: row - 1,
      wallCol: col,
      neighborCellRow: row - 2,
      neighborCellCol: col,
    });
  }
  return walls;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
