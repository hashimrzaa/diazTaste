/** Everything the scroll timeline can drive. Values are targets — the stage
 *  eases towards them every frame, so scrubbing always feels buttery. */
export interface StageState {
  x: number // jar offset as a fraction of viewport width
  y: number // jar offset as a fraction of viewport height
  scale: number
  spin: number // extra rotation around the jar axis (rad)
  tilt: number // lean (rad)
  cap: number // 0 closed → 1 unscrewed & floating
  flavour: number // float index into the product list
  lineup: number // 0 single hero jar → 1 five-jar lineup
  pan: number // lineup camera pan, -1 … 1
  spread: number // ingredient cloud expansion
  ingredients: number // ingredient visibility
  opacity: number // whole canvas visibility
  idle: number // amount of idle spin/bob
  mix: number // 0 ingredients orbit → 1 they have dropped into the jar
  push: number // camera dolly-in, 0 … 1
}

export const defaultState = (): StageState => ({
  x: 0,
  y: 0,
  scale: 1,
  spin: 0,
  tilt: 0,
  cap: 0,
  flavour: 0,
  lineup: 0,
  pan: 0,
  spread: 0,
  ingredients: 1,
  opacity: 1,
  idle: 1,
  mix: 0,
  push: 0,
})

