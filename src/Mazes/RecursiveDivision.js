export async function recursiveDivision(grid, setGrid, startNode, finishNode) {
  const newGrid = grid.map((row) => {
    return row.map((node) => {
      return {
        ...node,
        isWall: false,
        isVisited: false,
      };
    });
  });

  setGrid(newGrid);
  await outline(newGrid, setGrid);
  await divide(
    newGrid,
    setGrid,
    startNode,
    finishNode,
    1,
    grid.length - 2,
    1,
    grid[0].length - 2,
    new Set(),
    new Set(),
    new Set(),
    new Set()
  );
}

async function outline(grid, setGrid) {
  for (let col = 0; col < grid[0].length; col++) {
    await sleep(1 * col);
    grid[0][col] = {
      ...grid[0][col],
      isWall: true,
    };
    grid[grid.length - 1][col] = {
      ...grid[grid.length - 1][col],
      isWall: true,
    };
    setGrid([...grid]);
  }
  for (let row = 0; row < grid.length; row++) {
    await sleep(2 * row);
    grid[row][0] = {
      ...grid[row][0],
      isWall: true,
    };
    grid[row][grid[0].length - 1] = {
      ...grid[row][grid[0].length - 1],
      isWall: true,
    };
    setGrid([...grid]);
  }
}

async function divide(
  grid,
  setGrid,
  startNode,
  finishNode,
  startX,
  endX,
  startY,
  endY,
  horizontalVisited,
  verticalVisited,
  passageXVisited,
  passageYVisited
) {
  const width = endX - startX + 1;
  const height = endY - startY + 1;
  let orientation = Math.random() < 0.5 ? "horizontal" : "vertical";
  if (width > height) {
    orientation = "vertical";
  } else if (width < height) {
    orientation = "horizontal";
  }
  if (orientation === "horizontal") {
    const possibleWallYs = [];
    for (let wallY = startY + 1; wallY <= endY - 1; wallY++) {
      possibleWallYs.push(wallY);
    }
    if (possibleWallYs.length > 0) {
      const wallY =
        possibleWallYs[Math.floor(Math.random() * possibleWallYs.length)];
      const passageX = startX + Math.floor(Math.random() * (width - 1));

      for (let row = startX; row <= endX; row++) {
        const key = `${row}-${wallY}`;
        if (
          `${startNode.row}-${startNode.col}` === key ||
          `${finishNode.row}-${finishNode.col}` === key
        )
          continue;
        if (row === passageX) {
          passageXVisited.add(`${row}-${wallY - 1}`);
          passageXVisited.add(`${row}-${wallY + 1}`);
        } else if (!horizontalVisited.has(key) && !passageYVisited.has(key)) {
          grid[row][wallY] = {
            ...grid[row][wallY],
            isWall: true,
          };
          horizontalVisited.add(key);
          await sleep(20);
          setGrid([...grid]);
        }
      }
      await divide(
        grid,
        setGrid,
        startNode,
        finishNode,
        startX,
        endX,
        startY,
        wallY - 1,
        horizontalVisited,
        verticalVisited,
        passageXVisited,
        passageYVisited
      );
      await divide(
        grid,
        setGrid,
        startNode,
        finishNode,
        startX,
        endX,
        wallY + 1,
        endY,
        horizontalVisited,
        verticalVisited,
        passageXVisited,
        passageYVisited
      );
    }
  } else if (orientation === "vertical") {
    const possibleWallXs = [];
    for (let wallX = startX + 1; wallX <= endX - 1; wallX++) {
      possibleWallXs.push(wallX);
    }
    if (possibleWallXs.length > 0) {
      const wallX =
        possibleWallXs[Math.floor(Math.random() * possibleWallXs.length)];
      const passageY = startY + Math.floor(Math.random() * (height - 1));

      for (let col = startY; col <= endY; col++) {
        const key = `${wallX}-${col}`;
        if (
          `${startNode.row}-${startNode.col}` === key ||
          `${finishNode.row}-${finishNode.col}` === key
        )
          continue;
        if (col === passageY) {
          passageYVisited.add(`${wallX - 1}-${col}`);
          passageYVisited.add(`${wallX + 1}-${col}`);
        } else if (!verticalVisited.has(key) && !passageXVisited.has(key)) {
          grid[wallX][col] = {
            ...grid[wallX][col],
            isWall: true,
          };
          verticalVisited.add(key);
          await sleep(20);
          setGrid([...grid]);
        }
      }
      await divide(
        grid,
        setGrid,
        startNode,
        finishNode,
        startX,
        wallX - 1,
        startY,
        endY,
        horizontalVisited,
        verticalVisited,
        passageXVisited,
        passageYVisited
      );
      await divide(
        grid,
        setGrid,
        startNode,
        finishNode,
        wallX + 1,
        endX,
        startY,
        endY,
        horizontalVisited,
        verticalVisited,
        passageXVisited,
        passageYVisited
      );
    }
  }
  setGrid([...grid]);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
