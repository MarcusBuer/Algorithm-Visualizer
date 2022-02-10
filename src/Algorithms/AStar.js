import Canvas from 'react-p5'

function AStar(props) {
  const {
    speed = 600,
    columns = 50,
    rows = 50,
    obstaclePercentage = 0.4,
    canWalkDiagonally = true,
    width = 500,
    height = 500
  } = props

  let grid = new Array(columns)
  let cellWidth
  let cellHeight

  let openSet = []
  let closedSet = []
  let path = []
  let startCell
  let currentCell
  let endCell

  class Cell {
    constructor(x, y) {
      this.x = x
      this.y = y
      this.f = 0
      this.g = 0
      this.h = 0
      this.previous = undefined
      this.isObstacle = false
      this.neighborCells = []

      if (Math.random() < obstaclePercentage) {
        this.isObstacle = true
      }

      this.show = (p5, cell) => {
        p5.fill(cell)
        if (this.isObstacle) p5.fill(0)
        p5.rect(this.x * cellWidth, this.y * cellHeight, cellWidth, cellHeight)
      }

      this.showCircle = (p5, cell) => {
        p5.fill(cell)
        p5.circle(this.x * cellWidth + cellWidth / 2, this.y * cellHeight + cellHeight / 2, cellWidth*1.5)
      }

      this.addNeighborCells = () => {
        let x = this.x
        let y = this.y

        if (x < columns - 1) this.neighborCells.push(grid[x + 1][y])
        if (x > 0) this.neighborCells.push(grid[x - 1][y])
        if (y < rows - 1) this.neighborCells.push(grid[x][y + 1])
        if (y > 0) this.neighborCells.push(grid[x][y - 1])
        if (canWalkDiagonally) {
          if (x > 0 && y > 0) this.neighborCells.push(grid[x - 1][y - 1])
          if (x < columns - 1 && y > 0)
            this.neighborCells.push(grid[x + 1][y - 1])
          if (x > 0 && y < rows - 1) this.neighborCells.push(grid[x - 1][y + 1])
          if (x < columns - 1 && y < rows - 1)
            this.neighborCells.push(grid[x + 1][y + 1])
        }
      }
    }
  }

  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function heuristic(p5, a, b) {
    if (canWalkDiagonally) return p5.dist(a.x, a.y, b.x, b.y)
    return p5.abs(a.x - b.x) + p5.abs(a.y - b.y)
  }
  const resetCanvas = () => {
    startCell = undefined
    currentCell = undefined
    endCell = undefined
    openSet = []
    closedSet = []
    path = []
    grid= new Array(columns)

    for (let x = 0; x < columns; x++) {
      grid[x] = new Array(rows)
      for (let y = 0; y < rows; y++) {
        grid[x][y] = new Cell(x, y)
      }
    }

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        grid[x][y].addNeighborCells()
      }
    }

    startCell =
      grid[getRandomIntInclusive(0, columns - 1)][
        getRandomIntInclusive(0, rows - 1)
      ]
    endCell =
      grid[getRandomIntInclusive(0, columns - 1)][
        getRandomIntInclusive(0, rows - 1)
      ]
    startCell.isObstacle = false
    endCell.isObstacle = false

    openSet.push(startCell)
  }

  const setup = (p5, canvasParentRef) => {
    p5.frameRate(speed)
    p5.createCanvas(width, height).parent(canvasParentRef)
    cellWidth = p5.width / columns
    cellHeight = p5.height / rows
    resetCanvas()
  }

  const RenderBackground = p5 => {
    p5.background(0)
  }

  const RenderGrid = p5 => {
    for (let i = 0; i < columns; i++) {
      for (let j = 0; j < rows; j++) {
        p5.stroke(127)
        p5.strokeWeight(0.25)
        grid[i][j].show(p5, p5.color(255))
      }
    }
  }

  const RenderClosedSet = p5 => {
    for (let i = 0; i < closedSet.length; i++) {
      p5.noStroke()
      closedSet[i].show(p5, p5.color(255, 0, 0))
    }
  }

  const RenderOpenSet = p5 => {
    for (let i = 0; i < openSet.length; i++) {
      p5.noStroke()
      openSet[i].show(p5, p5.color(0, 255, 0))
    }
  }

  const RenderPath = p5 => {
    path = []
    let temp = currentCell
    path.push(temp)
    while (temp.previous) {
      path.push(temp.previous)
      temp = temp.previous
    }

    p5.noFill()
    p5.stroke(255)
    p5.beginShape()
    for (let i = 0; i < path.length; i++) {
      p5.strokeWeight(cellWidth / 2)
      p5.vertex(
        path[i].x * cellWidth + cellWidth / 2,
        path[i].y * cellHeight + cellHeight / 2
      )
      // path[i].show(p5, p5.color(0, 0, 255))
    }
    p5.endShape()
  }

  const RenderStart = p5 => {
    p5.noStroke()
    startCell.showCircle(p5, p5.color(0, 65, 255))
  }

  const RenderEnd = p5 => {
    p5.noStroke()
    endCell.showCircle(p5, p5.color(0, 65, 255))
  }

  const draw = p5 => {
    if (openSet.length > 0) {
      let lowestF = 0
      for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestF].f) {
          lowestF = i
        }
      }
      currentCell = openSet[lowestF]
      if (currentCell === endCell) {
        p5.noLoop()
        console.log('Solution found')
      }
      openSet = openSet.filter(cell => cell !== currentCell)
      closedSet.push(currentCell)

      let neighborCells = currentCell.neighborCells
      for (let i = 0; i < neighborCells.length; i++) {
        let neighbor = neighborCells[i]
        if (!closedSet.includes(neighbor) && !neighbor.isObstacle) {
          let tempG = currentCell.g + 1

          let newPath = false
          if (openSet.includes(neighbor)) {
            if (tempG < neighbor.g) {
              neighbor.g = tempG
              newPath = true
            }
          } else {
            neighbor.g = tempG
            newPath = true
            openSet.push(neighbor)
          }

          if (newPath) {
            neighbor.h = heuristic(p5, neighbor, endCell)
            neighbor.f = neighbor.g + neighbor.h
            neighbor.previous = currentCell
          }
        }
      }
    } else {
      p5.noLoop()
      console.log('No solution')
      return
    }

    RenderBackground(p5)
    RenderGrid(p5)
    RenderClosedSet(p5)
    RenderOpenSet(p5)
    RenderPath(p5)
    RenderStart(p5)
    RenderEnd(p5)
  }

  return <Canvas setup={setup} draw={draw} />
}

export default AStar
