import { G, Polygon, SVG } from "@svgdotjs/svg.js"

export class Turtle {
  angle: number = 0
  position: [number, number] = [0, 0]
  private group: G
  turtle: Polygon
  isPenDown: boolean = true
  private draw = SVG().addTo("#turtle").viewbox("-256 -256 512 512")
  private stamps: { [key: number]: Polygon } = {}
  private nextStampId: number = 1
  private speedNormalize = 3
  private _speed = 6

  constructor() {
    this.group = this.draw.group()
    this.turtle = this.group.polygon("0,0 4,7.5 0,15 15,7.5").center(0, 0)
  }

  private drawLine(x: number, y: number) {
    const distance = Math.sqrt(
      Math.pow(x - this.position[0], 2) + Math.pow(y - this.position[1], 2)
    )

    this.draw
      .line(
        this.position[0],
        this.position[1],
        this.position[0],
        this.position[1]
      )
      .stroke({ width: 1, color: "black" })
      .animate((distance / this._speed) * this.speedNormalize)
      .plot(this.position[0], this.position[1], x, y)
  }

  private async move(x: number, y: number) {
    if (this.isPenDown) {
      this.drawLine(x, y)
    }

    await new Promise((resolve) => {
      const distance = Math.sqrt(
        Math.pow(x - this.position[0], 2) + Math.pow(y - this.position[1], 2)
      )

      this.group
        .animate((distance / this._speed) * this.speedNormalize)
        .center(x, y)
        .after(resolve)
    })
    this.position[0] = x
    this.position[1] = y
  }

  async forward(distance: number) {
    const xMove = distance * Math.cos((this.angle * Math.PI) / 180)
    const yMove = distance * Math.sin((this.angle * Math.PI) / 180)

    await this.move(this.position[0] + xMove, this.position[1] - yMove)
  }

  fd = this.forward

  async backward(distance: number) {
    await this.forward(-distance)
  }

  bk = this.backward
  back = this.backward

  async right(angle: number) {
    this.angle = (this.angle + angle) % 360
    await new Promise((resolve) =>
      this.turtle
        .animate((Math.abs(angle) / this._speed) * this.speedNormalize)
        // @ts-ignore
        .rotate(-angle)
        .after(resolve)
    )
  }

  rt = this.right

  async left(angle: number) {
    await this.right(-angle)
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

  async goto(x: number, y: number) {
    await this.move(x, y)
  }

  setpos = this.goto
  setposition = this.goto

  async setx(x: number) {
    await this.move(x, this.position[1])
  }

  async sety(y: number) {
    await this.move(this.position[0], y)
  }

  async setheading(angle: number) {
    await this.right(angle - this.angle)
  }

  seth = this.setheading

  async home() {
    await this.goto(0, 0)
  }

  async circle(
    radius: number,
    extent: number = 360,
    steps: number | null = null
  ) {
    const circlePrecision = 10

    if (steps === null) {
      steps = Math.ceil(Math.abs(extent) / circlePrecision)
    }
    const angle = extent / steps
    for (let i = 0; i < steps; i++) {
      await this.forward(radius * Math.sin((angle * Math.PI) / 180))
      await this.right(angle)
    }
  }

  dot(size: number = 1, color: string = "black") {
    this.draw
      .circle(size)
      .fill(color)
      .center(this.position[0] + 15, this.position[1] + 7.5)
  }

  stamp() {
    const id = this.nextStampId
    const polygon = this.draw
      .polygon("0,0 4,7.5 0,15 15,7.5")
      .center(this.position[0], this.position[1])
      .rotate(-this.angle)

    this.stamps[id] = polygon

    this.nextStampId++

    return id
  }

  clearstemp(id: number) {
    this.stamps[id].remove()
    delete this.stamps[id]
  }

  clearstamps(quantity: number | null = null) {
    if (quantity === null) {
      quantity = Object.keys(this.stamps).length
    }

    const ids = Object.keys(this.stamps)

    if (quantity > 0) {
      for (let i = 0; i < quantity; i++) {
        if (ids.length > 0) {
          this.clearstemp(Number(ids[0]))
          ids.splice(0, 1)
        } else {
          break
        }
      }
    } else {
      for (let i = ids.length - 1; i >= -quantity; i--) {
        if (ids.length > 0) {
          this.clearstemp(Number(ids[i]))
          ids.slice(i, 1)
        } else {
          break
        }
      }
    }
  }

  // TODO: implement this function
  async undo(quantity: number | null = null) {}

  speed(): number
  speed(speed: number): void
  speed(speed: number | null = null) {
    if (speed === null) {
      return this._speed
    } else {
      this._speed = speed
    }
  }
}
