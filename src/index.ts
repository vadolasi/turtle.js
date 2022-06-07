import { G, Polygon, SVG } from "@svgdotjs/svg.js"

export class Turtle {
  angle: number = 0
  position: [number, number] = [0, 0]
  group: G
  turtle: Polygon
  isPenDown: boolean = true
  draw = SVG().addTo("#turtle")

  constructor() {
    this.group = this.draw.group()
    this.turtle = this.group.polygon("0,0 0,15 15,7.5")
  }

  private drawLine(xMove: number, yMove: number) {
    this.draw
      .line(
        this.position[0],
        this.position[1],
        this.position[0],
        this.position[1]
      )
      .stroke({ width: 1, color: "black" })
      .animate()
      .plot(
        this.position[0],
        this.position[1],
        this.position[0] + xMove,
        this.position[1] - yMove
      )
  }

  async forward(distance: number) {
    const xMove = distance * Math.cos((this.angle * Math.PI) / 180)
    const yMove = distance * Math.sin((this.angle * Math.PI) / 180)

    if (this.isPenDown) {
      this.drawLine(xMove, yMove)
    }

    await new Promise((resolve) => {
      this.group
        .animate()
        .center(this.position[0] + xMove, this.position[1] - yMove)
        .after(resolve)
    })
    this.position[0] += xMove
    this.position[1] -= yMove
  }

  fd = this.forward

  async backward(distance: number) {
    await this.forward(-distance)
  }

  bk = this.backward
  back = this.backward

  right(angle: number) {
    this.angle = (this.angle + angle) % 360
    this.turtle.rotate(-angle)
  }

  rt = this.right

  left(angle: number) {
    this.angle = (this.angle - angle) % 360
    this.turtle.rotate(angle)
  }

  lt = this.left

  penDown() {
    this.isPenDown = true
  }

  pd = this.penDown
  down = this.penDown

  penUp() {
    this.isPenDown = false
  }

  pu = this.penUp
  up = this.penUp
}
