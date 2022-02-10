import React from 'react'
import AStar from '../Algorithms/AStar'

export default function Home() {
  const [speed, setSpeed] = React.useState(10)

  return (
    <>
      <h1>A* Pathfinding Algorithm</h1>
      <AStar speed={speed} />
    </>
  )
}
