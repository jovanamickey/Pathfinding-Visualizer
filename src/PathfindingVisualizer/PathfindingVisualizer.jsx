import React, { Component } from "react";
import Node from "./Node/Node";
import {
  Dijkstra,
  getNodesInShortestPathOrderDijkstra,
} from "../Algorithms/Dijkstra";
import { DFS, getNodesInShortestPathOrderDFS } from "../Algorithms/DFS";
import { BFS, getNodesInShortestPathOrderBFS } from "../Algorithms/BFS";
import { Astar, getNodesInShortestPathOrderAstar } from "../Algorithms/A*";
import { recursiveDivision } from "../Mazes/RecursiveDivision";
import { prims } from "../Mazes/Prims";
import { kruskals } from "../Mazes/Kruskals";
import { random } from "../Mazes/Random";
import "./PathfindingVisualizer.css";

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

const GuideModal = ({ onClose }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>---- Guide ----</h2>
        <p>
          <strong>Symbols</strong>
        </p>
        <div style={{ padding: "3px", marginRight: "20px" }}>
          {<star className="fas fa-star"></star>} Start Node
        </div>
        <div style={{ padding: "3px", marginRight: "12px" }}>
          {<flag className="fas fa-flag-checkered"></flag>} Finish Node
        </div>
        <div style={{ padding: "3px", marginRight: "20px" }}>
          <div
            className="node-wall"
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              marginRight: "8px",
            }}
          ></div>
          Node Wall
        </div>
        <div style={{ padding: "3px", marginLeft: "32px" }}>
          <div
            className="node-shortest-path"
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              marginRight: "8px",
            }}
          ></div>
          Pathfinding Node
        </div>
        <div style={{ padding: "3px", marginRight: "2px" }}>
          <div
            className="node-visited"
            style={{
              display: "inline-block",
              width: "20px",
              height: "20px",
              marginRight: "8px",
            }}
          ></div>
          Visited Node
        </div>
        <p>
          <strong>Navigating the Pathfinding Visualizer</strong>
        </p>
        <ul style={{ textAlign: "left" }}>
          <li>Drag the start and finish nodes to change their positions</li>
          <li>Click on any node in the grid and drag to create custom walls</li>
          <li>Select an algorithm from 'Visualize Algorithms' to view</li>
          <li>Generate a maze by selecting one from 'Generate Mazes'</li>
          <li>Clear the path and visited nodes by clicking 'Clear Path'</li>
          <li>
            Reset the walls and start/finish nodes by clicking 'Reset Board'
          </li>
        </ul>
      </div>
    </div>
  );
};

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      dragNode: null,
      START_NODE_ROW: START_NODE_ROW,
      START_NODE_COL: START_NODE_COL,
      FINISH_NODE_ROW: FINISH_NODE_ROW,
      FINISH_NODE_COL: FINISH_NODE_COL,
      chosenAlgorithm: null,
      click: false,
      DISABLED: false,
      guide: true,
    };
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({ grid });
    window.addEventListener("mousemove", this.handleMouseMove.bind(this));
    window.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("mousemove", this.handleMouseMove.bind(this));
    window.removeEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  handleMouseDown(row, col) {
    const { grid } = this.state;
    const node = grid[row][col];
    if (node.isStart) {
      this.setState({ dragNode: "start", mouseIsPressed: true });
    } else if (node.isFinish) {
      this.setState({ dragNode: "finish", mouseIsPressed: true });
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  }

  handleMouseEnter(row, col) {
    const { mouseIsPressed, dragNode } = this.state;
    if (!mouseIsPressed || dragNode) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid });
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false, dragNode: null });
  }

  handleMouseMove(event) {
    const {
      grid,
      mouseIsPressed,
      dragNode,
      START_NODE_ROW,
      START_NODE_COL,
      FINISH_NODE_ROW,
      FINISH_NODE_COL,
    } = this.state;
    if (!mouseIsPressed || !dragNode) return;

    const nodeElement = event.target.closest(".node");
    if (!nodeElement) return;

    const row = parseInt(nodeElement.getAttribute("row"));
    const col = parseInt(nodeElement.getAttribute("col"));
    if (isNaN(row) || isNaN(col)) return;

    const newGrid = grid.slice();
    const originalNode =
      dragNode === "start"
        ? grid[START_NODE_ROW][START_NODE_COL]
        : grid[FINISH_NODE_ROW][FINISH_NODE_COL];

    const newNode = {
      ...grid[row][col],
      isStart: dragNode === "start",
      isFinish: dragNode === "finish",
    };

    newGrid[originalNode.row][originalNode.col] = {
      ...originalNode,
      isStart: false,
      isFinish: false,
    };

    newGrid[row][col] = newNode;

    if (dragNode === "start") {
      this.setState(
        {
          grid: newGrid,
          START_NODE_ROW: row,
          START_NODE_COL: col,
        },
        this.updatePath
      );
    } else if (dragNode === "finish") {
      this.setState(
        {
          grid: newGrid,
          FINISH_NODE_ROW: row,
          FINISH_NODE_COL: col,
        },
        this.updatePath
      );
    }
  }

  handleOpenGuide = () => {
    this.setState({ guide: true });
  };

  handleCloseGuide = () => {
    this.setState({ guide: false });
  };

  updatePath() {
    this.clearPath(false);
    this.setState({ visitedNodesInOrder: [] }, () => {
      const { chosenAlgorithm } = this.state;
      if (chosenAlgorithm === "Dijkstra") {
        this.visualizeDijkstra();
      } else if (chosenAlgorithm === "DFS") {
        this.visualizeDFS();
      } else if (chosenAlgorithm === "BFS") {
        this.visualizeBFS();
      } else if (chosenAlgorithm === "Astar") {
        this.visualizeAstar();
      }
    });
  }

  animateAlgorithms(visitedNodesInOrder, nodesInShortestPathOrder) {
    const { click } = this.state;
    if (click) {
      for (let i = 0; i <= visitedNodesInOrder.length; i++) {
        if (i === visitedNodesInOrder.length) {
          this.animateShortestPath(nodesInShortestPathOrder);
          return;
        }
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }
    } else {
      for (let i = 0; i <= visitedNodesInOrder.length; i++) {
        if (i === visitedNodesInOrder.length) {
          setTimeout(() => {
            this.animateShortestPath(nodesInShortestPathOrder);
          }, 10 * i);
          return;
        }
        setTimeout(() => {
          const node = visitedNodesInOrder[i];
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-visited";
        }, 10 * i);
      }
    }
  }

  visualizeDijkstra() {
    const {
      grid,
      START_NODE_ROW,
      START_NODE_COL,
      FINISH_NODE_ROW,
      FINISH_NODE_COL,
    } = this.state;
    this.setState({ DISABLED: true });
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = Dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder =
      getNodesInShortestPathOrderDijkstra(finishNode);

    if (!visitedNodesInOrder || !nodesInShortestPathOrder) {
      this.setState({ DISABLED: false });
      return;
    }

    this.animateAlgorithms(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  visualizeDFS() {
    this.setState({ DISABLED: true });
    const {
      grid,
      START_NODE_ROW,
      START_NODE_COL,
      FINISH_NODE_ROW,
      FINISH_NODE_COL,
    } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = DFS(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrderDFS(finishNode);

    if (!visitedNodesInOrder || !nodesInShortestPathOrder) {
      this.setState({ DISABLED: false });
      return;
    }

    this.animateAlgorithms(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  visualizeBFS() {
    this.setState({ DISABLED: true });
    const {
      grid,
      START_NODE_ROW,
      START_NODE_COL,
      FINISH_NODE_ROW,
      FINISH_NODE_COL,
    } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = BFS(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrderBFS(finishNode);

    if (!visitedNodesInOrder || !nodesInShortestPathOrder) {
      this.setState({ DISABLED: false });
      return;
    }
    this.animateAlgorithms(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  visualizeAstar() {
    this.setState({ DISABLED: true });
    const {
      grid,
      START_NODE_ROW,
      START_NODE_COL,
      FINISH_NODE_ROW,
      FINISH_NODE_COL,
    } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = Astar(grid, startNode, finishNode);
    const nodesInShortestPathOrder =
      getNodesInShortestPathOrderAstar(finishNode);

    if (!visitedNodesInOrder || !nodesInShortestPathOrder) {
      this.setState({ DISABLED: false });
      return;
    }

    this.animateAlgorithms(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  animateShortestPath(nodesInShortestPathOrder) {
    const { click } = this.state;
    if (click) {
      for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
      }
      this.setState({ DISABLED: false });
    } else {
      this.setState({ click: true });
      for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
        setTimeout(() => {
          const node = nodesInShortestPathOrder[i];
          document.getElementById(`node-${node.row}-${node.col}`).className =
            "node node-shortest-path";
          if (i === nodesInShortestPathOrder.length - 1) {
            this.setState({ DISABLED: false });
          }
        }, 50 * i);
      }
    }
  }

  async generateRecursiveMaze() {
    const {
      grid,
      START_NODE_ROW,
      START_NODE_COL,
      FINISH_NODE_ROW,
      FINISH_NODE_COL,
    } = this.state;
    await this.resetBoard(false);
    this.setState({ DISABLED: true });

    try {
      await recursiveDivision(
        grid,
        (newGrid) => {
          this.setState({ grid: newGrid });
        },
        grid[START_NODE_ROW][START_NODE_COL],
        grid[FINISH_NODE_ROW][FINISH_NODE_COL]
      );
    } finally {
      this.setState({ DISABLED: false });
    }
  }

  async generatePrimsMaze() {
    const {
      grid,
      START_NODE_ROW,
      START_NODE_COL,
      FINISH_NODE_ROW,
      FINISH_NODE_COL,
    } = this.state;
    await this.resetBoard(false);
    this.setState({ DISABLED: true });

    try {
      await prims(
        grid,
        (newGrid) => {
          this.setState({ grid: newGrid });
        },
        grid[START_NODE_ROW][START_NODE_COL],
        grid[FINISH_NODE_ROW][FINISH_NODE_COL]
      );
    } finally {
      this.setState({ DISABLED: false });
    }
  }

  async generateKruskalsMaze() {
    const {
      grid,
      START_NODE_ROW,
      START_NODE_COL,
      FINISH_NODE_ROW,
      FINISH_NODE_COL,
    } = this.state;
    await this.resetBoard(false);
    this.setState({ DISABLED: true });

    try {
      await kruskals(
        grid,
        (newGrid) => {
          this.setState({ grid: newGrid });
        },
        grid[START_NODE_ROW][START_NODE_COL],
        grid[FINISH_NODE_ROW][FINISH_NODE_COL]
      );
    } finally {
      this.setState({ DISABLED: false });
    }
  }

  async generateRandomMaze() {
    const {
      grid,
      START_NODE_ROW,
      START_NODE_COL,
      FINISH_NODE_ROW,
      FINISH_NODE_COL,
    } = this.state;
    await this.resetBoard(false);
    random(
      grid,
      (newGrid) => {
        this.setState({
          grid: newGrid,
        });
      },
      grid[START_NODE_ROW][START_NODE_COL],
      grid[FINISH_NODE_ROW][FINISH_NODE_COL]
    );
  }

  resetBoard(reset) {
    return new Promise((resolve) => {
      const nodes = document.getElementsByClassName("node");
      for (let node of nodes) {
        node.className = "node";
      }
      const {
        grid,
        START_NODE_ROW,
        START_NODE_COL,
        FINISH_NODE_ROW,
        FINISH_NODE_COL,
      } = this.state;

      const START_ROW = reset ? 10 : START_NODE_ROW;
      const START_COL = reset ? 15 : START_NODE_COL;
      const FINISH_ROW = reset ? 10 : FINISH_NODE_ROW;
      const FINISH_COL = reset ? 35 : FINISH_NODE_COL;

      const newGrid = grid.map((row) =>
        row.map((node) => {
          return {
            ...node,
            isWall: false,
            isVisited: false,
            previousNode: null,
            distance: Infinity,
            isStart: node.row === START_ROW && node.col === START_COL,
            isFinish: node.row === FINISH_ROW && node.col === FINISH_COL,
          };
        })
      );
      const startNode = grid[START_ROW][START_COL];
      const finishNode = grid[FINISH_ROW][FINISH_COL];
      this.setState(
        {
          grid: newGrid,
          chosenAlgorithm: null,
          click: false,
          START_NODE_ROW: START_ROW,
          START_NODE_COL: START_COL,
          FINISH_NODE_ROW: FINISH_ROW,
          FINISH_NODE_COL: FINISH_COL,
        },
        () => {
          resolve();
        }
      );

      document
        .getElementById(`node-${startNode.row}-${startNode.col}`)
        .classList.add("node-start");
      document
        .getElementById(`node-${finishNode.row}-${finishNode.col}`)
        .classList.add("node-finish");
    });
  }

  clearPath(reset) {
    const nodes = document.getElementsByClassName("node");
    for (let node of nodes) {
      if (
        node.classList.contains("node-visited") ||
        node.classList.contains("node-shortest-path")
      ) {
        node.className = "node";
      }
    }
    const {
      grid,
      START_NODE_ROW,
      START_NODE_COL,
      FINISH_NODE_ROW,
      FINISH_NODE_COL,
    } = this.state;
    const newGrid = grid.map((row) =>
      row.map((node) => {
        return {
          ...node,
          isVisited: false,
          previousNode: null,
          distance: Infinity,
        };
      })
    );
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    document
      .getElementById(`node-${startNode.row}-${startNode.col}`)
      .classList.add("node-start");
    document
      .getElementById(`node-${finishNode.row}-${finishNode.col}`)
      .classList.add("node-finish");

    if (this.state.chosenAlgorithm === null) reset = true;

    this.setState({
      grid: newGrid,
      chosenAlgorithm: reset ? null : this.state.chosenAlgorithm,
      click: reset ? false : true,
    });
  }

  render() {
    const { grid, mouseIsPressed, dragNode, DISABLED, guide } = this.state;

    return (
      <>
        <div className="button-bar">
          <button onClick={this.handleOpenGuide}>
            Pathfinding Visualizer Guide
          </button>
          {}
          <select
            value={""}
            onChange={(e) => {
              const chosenAlgorithm = e.target.value;
              this.clearPath(true);
              this.setState({ chosenAlgorithm }, () => {
                if (chosenAlgorithm === "Dijkstra") this.visualizeDijkstra();
                else if (chosenAlgorithm === "DFS") this.visualizeDFS();
                else if (chosenAlgorithm === "BFS") this.visualizeBFS();
                else if (chosenAlgorithm === "Astar") this.visualizeAstar();
              });
            }}
            disabled={DISABLED}
          >
            <option value="" disabled selected>
              Visualize Algorithms
            </option>
            <option value="Dijkstra">Dijkstra's Algorithm</option>
            <option value="DFS">DFS Algorithm</option>
            <option value="BFS">BFS Algorithm</option>
            <option value="Astar">A* Algorithm</option>
          </select>

          {}
          <select
            value={""}
            onChange={(e) => {
              const maze = e.target.value;
              if (maze === "RecursiveDivision") this.generateRecursiveMaze();
              else if (maze === "Prims") this.generatePrimsMaze();
              else if (maze === "Kruskals") this.generateKruskalsMaze();
              else if (maze === "Random") this.generateRandomMaze();
            }}
            disabled={DISABLED}
          >
            <option value="" disabled selected>
              Generate Mazes
            </option>
            <option value="RecursiveDivision">Recursive Division Maze</option>
            <option value="Prims">Prim's Algorithm Maze</option>
            <option value="Kruskals">Kruskal's Algorithm Maze</option>
            <option value="Random">Random Maze</option>
          </select>
          {}
          <button onClick={() => this.resetBoard(true)} disabled={DISABLED}>
            Reset Board
          </button>
          <button onClick={() => this.clearPath(true)} disabled={DISABLED}>
            Clear Path
          </button>
          {guide && <GuideModal onClose={this.handleCloseGuide} />}
        </div>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall } = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      dragNode={dragNode}
                      onMouseDown={() => this.handleMouseDown(row, col)}
                      onMouseEnter={() => this.handleMouseEnter(row, col)}
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
