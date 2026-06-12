import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { AnimationSpeed } from '@/types'

export type RBColor = 'red' | 'black'
export type RBHighlight = 'default' | 'traversing' | 'found' | 'notFound' | 'inserted' | 'deleted' | 'rotating' | 'recoloring'

export interface RBNode {
  id: string
  value: number
  color: RBColor
  left: string | null
  right: string | null
  parent: string | null
  highlight: RBHighlight
  isNil: boolean
}

export type RBNodeMap = Record<string, RBNode>

interface Snap {
  nodes: RBNodeMap
  rootId: string | null
  rotationLabel?: string
}

const SPEED_DELAY: Record<AnimationSpeed, number> = { slow: 700, normal: 350, fast: 130 }
let animTimers: ReturnType<typeof setTimeout>[] = []
let animGen = 0

function cancelAnim() {
  animTimers.forEach(clearTimeout)
  animTimers = []
  animGen++
}

function makeNil(): RBNode {
  return { id: nanoid(), value: 0, color: 'black', left: null, right: null, parent: null, highlight: 'default', isNil: true }
}

function makeNode(value: number, nilId: string): RBNode {
  return { id: nanoid(), value, color: 'red', left: nilId, right: nilId, parent: null, highlight: 'default', isNil: false }
}

function cloneNodes(nodes: RBNodeMap, hl: RBHighlight = 'default'): RBNodeMap {
  const out: RBNodeMap = {}
  for (const id in nodes) out[id] = { ...nodes[id], highlight: hl }
  return out
}

function countReal(nodes: RBNodeMap, id: string | null): number {
  if (id === null) return 0
  const n = nodes[id]
  if (n.isNil) return 0
  return 1 + countReal(nodes, n.left) + countReal(nodes, n.right)
}

// RB-Tree operations (classic iterative with sentinel nil)
class RBTree {
  nodes: RBNodeMap = {}
  rootId: string | null = null
  nilId: string

  constructor(existing?: { nodes: RBNodeMap; rootId: string | null; nilId: string }) {
    if (existing) {
      this.nodes = { ...existing.nodes }
      this.rootId = existing.rootId
      this.nilId = existing.nilId
    } else {
      const nil = makeNil()
      this.nilId = nil.id
      this.nodes[nil.id] = nil
    }
  }

  isNil(id: string | null): boolean {
    return id === null || id === this.nilId
  }

  rotateLeft(xId: string): string {
    const x = this.nodes[xId]
    const yId = x.right!
    const y = this.nodes[yId]
    const yLeftId = y.left!

    this.nodes[xId] = { ...x, right: yLeftId }
    if (!this.isNil(yLeftId)) {
      this.nodes[yLeftId] = { ...this.nodes[yLeftId], parent: xId }
    }
    this.nodes[yId] = { ...y, parent: x.parent, left: xId }
    this.nodes[xId] = { ...this.nodes[xId], parent: yId }

    if (x.parent === null) {
      this.rootId = yId
    } else {
      const p = this.nodes[x.parent!]
      if (p.left === xId) {
        this.nodes[x.parent!] = { ...p, left: yId }
      } else {
        this.nodes[x.parent!] = { ...p, right: yId }
      }
    }
    return yId
  }

  rotateRight(yId: string): string {
    const y = this.nodes[yId]
    const xId = y.left!
    const x = this.nodes[xId]
    const xRightId = x.right!

    this.nodes[yId] = { ...y, right: xRightId }
    if (!this.isNil(xRightId)) {
      this.nodes[xRightId] = { ...this.nodes[xRightId], parent: yId }
    }
    this.nodes[xId] = { ...x, parent: y.parent, right: yId }
    this.nodes[yId] = { ...this.nodes[yId], parent: xId }

    if (y.parent === null) {
      this.rootId = xId
    } else {
      const p = this.nodes[y.parent!]
      if (p.left === yId) {
        this.nodes[y.parent!] = { ...p, left: xId }
      } else {
        this.nodes[y.parent!] = { ...p, right: xId }
      }
    }
    return xId
  }

  snapshot(hl: RBHighlight = 'default', label?: string): Snap {
    return { nodes: cloneNodes(this.nodes, hl), rootId: this.rootId, rotationLabel: label }
  }

  insert(value: number): Snap[] {
    const snaps: Snap[] = []

    // Traversal animation
    const path: string[] = []
    let cur: string | null = this.rootId
    while (cur !== null && !this.nodes[cur].isNil) {
      if (this.nodes[cur].value === value) return []
      path.push(cur)
      cur = value < this.nodes[cur].value ? this.nodes[cur].left : this.nodes[cur].right
    }

    for (let i = 0; i < path.length; i++) {
      const snap = cloneNodes(this.nodes)
      for (let j = 0; j <= i; j++) snap[path[j]] = { ...snap[path[j]], highlight: 'traversing' }
      snaps.push({ nodes: snap, rootId: this.rootId })
    }

    // Insert new node
    const newNode = makeNode(value, this.nilId)
    this.nodes[newNode.id] = newNode

    if (this.rootId === null) {
      this.rootId = newNode.id
      this.nodes[newNode.id] = { ...this.nodes[newNode.id], parent: null }
    } else {
      let pId = path[path.length - 1]
      this.nodes[newNode.id] = { ...this.nodes[newNode.id], parent: pId }
      if (value < this.nodes[pId].value) {
        this.nodes[pId] = { ...this.nodes[pId], left: newNode.id }
      } else {
        this.nodes[pId] = { ...this.nodes[pId], right: newNode.id }
      }
    }

    const insSnap = cloneNodes(this.nodes)
    insSnap[newNode.id] = { ...insSnap[newNode.id], highlight: 'inserted' }
    snaps.push({ nodes: insSnap, rootId: this.rootId })

    // Fix violations
    snaps.push(...this.fixInsert(newNode.id))
    snaps.push(this.snapshot())
    return snaps
  }

  fixInsert(zId: string): Snap[] {
    const snaps: Snap[] = []
    let z = zId

    while (!this.isNil(this.nodes[z].parent ?? null) && this.nodes[this.nodes[z].parent!].color === 'red') {
      const parent = this.nodes[z].parent!
      const grandparent = this.nodes[parent].parent!

      if (parent === this.nodes[grandparent].left) {
        const uncle = this.nodes[grandparent].right!
        if (!this.isNil(uncle) && this.nodes[uncle].color === 'red') {
          // Case 1: Recolor
          const recolorSnap = cloneNodes(this.nodes)
          recolorSnap[parent] = { ...recolorSnap[parent], highlight: 'recoloring' }
          recolorSnap[uncle] = { ...recolorSnap[uncle], highlight: 'recoloring' }
          recolorSnap[grandparent] = { ...recolorSnap[grandparent], highlight: 'recoloring' }
          snaps.push({ nodes: recolorSnap, rootId: this.rootId, rotationLabel: 'Recolor' })

          this.nodes[parent] = { ...this.nodes[parent], color: 'black' }
          this.nodes[uncle] = { ...this.nodes[uncle], color: 'black' }
          this.nodes[grandparent] = { ...this.nodes[grandparent], color: 'red' }
          snaps.push(this.snapshot('default', 'Recolor'))
          z = grandparent
        } else {
          if (z === this.nodes[parent].right) {
            // Case 2: Left rotate
            const rotSnap = cloneNodes(this.nodes)
            rotSnap[z] = { ...rotSnap[z], highlight: 'rotating' }
            rotSnap[parent] = { ...rotSnap[parent], highlight: 'rotating' }
            snaps.push({ nodes: rotSnap, rootId: this.rootId, rotationLabel: 'Left Rotation' })
            z = parent
            this.rotateLeft(z)
            snaps.push(this.snapshot('default', 'Left Rotation'))
          }
          // Case 3: Right rotate
          const parent2 = this.nodes[z].parent!
          const grandparent2 = this.nodes[parent2].parent!
          this.nodes[parent2] = { ...this.nodes[parent2], color: 'black' }
          this.nodes[grandparent2] = { ...this.nodes[grandparent2], color: 'red' }
          const rotSnap2 = cloneNodes(this.nodes)
          rotSnap2[parent2] = { ...rotSnap2[parent2], highlight: 'rotating' }
          rotSnap2[grandparent2] = { ...rotSnap2[grandparent2], highlight: 'rotating' }
          snaps.push({ nodes: rotSnap2, rootId: this.rootId, rotationLabel: 'Right Rotation' })
          this.rotateRight(grandparent2)
          snaps.push(this.snapshot('default', 'Right Rotation'))
        }
      } else {
        const uncle = this.nodes[grandparent].left!
        if (!this.isNil(uncle) && this.nodes[uncle].color === 'red') {
          // Case 1 mirror: Recolor
          const recolorSnap = cloneNodes(this.nodes)
          recolorSnap[parent] = { ...recolorSnap[parent], highlight: 'recoloring' }
          recolorSnap[uncle] = { ...recolorSnap[uncle], highlight: 'recoloring' }
          recolorSnap[grandparent] = { ...recolorSnap[grandparent], highlight: 'recoloring' }
          snaps.push({ nodes: recolorSnap, rootId: this.rootId, rotationLabel: 'Recolor' })

          this.nodes[parent] = { ...this.nodes[parent], color: 'black' }
          this.nodes[uncle] = { ...this.nodes[uncle], color: 'black' }
          this.nodes[grandparent] = { ...this.nodes[grandparent], color: 'red' }
          snaps.push(this.snapshot('default', 'Recolor'))
          z = grandparent
        } else {
          if (z === this.nodes[parent].left) {
            // Case 2 mirror: Right rotate
            const rotSnap = cloneNodes(this.nodes)
            rotSnap[z] = { ...rotSnap[z], highlight: 'rotating' }
            rotSnap[parent] = { ...rotSnap[parent], highlight: 'rotating' }
            snaps.push({ nodes: rotSnap, rootId: this.rootId, rotationLabel: 'Right Rotation' })
            z = parent
            this.rotateRight(z)
            snaps.push(this.snapshot('default', 'Right Rotation'))
          }
          // Case 3 mirror: Left rotate
          const parent2 = this.nodes[z].parent!
          const grandparent2 = this.nodes[parent2].parent!
          this.nodes[parent2] = { ...this.nodes[parent2], color: 'black' }
          this.nodes[grandparent2] = { ...this.nodes[grandparent2], color: 'red' }
          const rotSnap2 = cloneNodes(this.nodes)
          rotSnap2[parent2] = { ...rotSnap2[parent2], highlight: 'rotating' }
          rotSnap2[grandparent2] = { ...rotSnap2[grandparent2], highlight: 'rotating' }
          snaps.push({ nodes: rotSnap2, rootId: this.rootId, rotationLabel: 'Left Rotation' })
          this.rotateLeft(grandparent2)
          snaps.push(this.snapshot('default', 'Left Rotation'))
        }
      }
      if (this.rootId === null) break
    }

    if (this.rootId !== null) {
      this.nodes[this.rootId] = { ...this.nodes[this.rootId], color: 'black' }
    }
    return snaps
  }

  search(value: number): Snap[] {
    const snaps: Snap[] = []
    const visited: string[] = []
    let cur: string | null = this.rootId

    while (cur !== null && !this.nodes[cur].isNil) {
      visited.push(cur)
      const snap = cloneNodes(this.nodes)
      for (const id of visited) snap[id] = { ...snap[id], highlight: 'traversing' }
      snaps.push({ nodes: snap, rootId: this.rootId })

      const node = this.nodes[cur]
      if (value === node.value) {
        const fs = cloneNodes(this.nodes)
        for (const id of visited.slice(0, -1)) fs[id] = { ...fs[id], highlight: 'traversing' }
        fs[cur] = { ...fs[cur], highlight: 'found' }
        snaps.push({ nodes: fs, rootId: this.rootId })
        break
      }
      cur = value < node.value ? node.left : node.right
    }

    if (cur === null || this.nodes[cur]?.isNil) {
      const nfs = cloneNodes(this.nodes)
      if (visited.length > 0) {
        const last = visited[visited.length - 1]
        for (const id of visited.slice(0, -1)) nfs[id] = { ...nfs[id], highlight: 'traversing' }
        nfs[last] = { ...nfs[last], highlight: 'notFound' }
        snaps.push({ nodes: nfs, rootId: this.rootId })
      }
    }

    snaps.push(this.snapshot())
    return snaps
  }
}

function buildInitial(): { nodes: RBNodeMap; rootId: string | null; nilId: string } {
  const tree = new RBTree()
  for (const v of [20, 10, 30, 5, 15, 25, 35]) {
    tree.insert(v)
  }
  return { nodes: tree.nodes, rootId: tree.rootId, nilId: tree.nilId }
}

const INITIAL = buildInitial()

function scheduleSnaps(snaps: Snap[], delay: number) {
  const gen = ++animGen
  useRBTreeStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      useRBTreeStore.setState({
        nodes: snap.nodes,
        rootId: snap.rootId,
        rotationLabel: snap.rotationLabel ?? '',
        isAnimating: i < snaps.length - 1,
      })
    }, i * delay)
    animTimers.push(t)
  })
}

interface RBTreeStore {
  nodes: RBNodeMap
  rootId: string | null
  nilId: string
  speed: AnimationSpeed
  inputValue: string
  isAnimating: boolean
  rotationLabel: string
  setInputValue: (v: string) => void
  setSpeed: (s: AnimationSpeed) => void
  insert: (value: number) => void
  search: (value: number) => void
  reset: () => void
}

export const useRBTreeStore = create<RBTreeStore>((set, get) => ({
  nodes: cloneNodes(INITIAL.nodes),
  rootId: INITIAL.rootId,
  nilId: INITIAL.nilId,
  speed: 'normal',
  inputValue: '',
  isAnimating: false,
  rotationLabel: '',

  setInputValue: v => set({ inputValue: v }),
  setSpeed: s => set({ speed: s }),

  reset: () => {
    cancelAnim()
    const fresh = buildInitial()
    set({ nodes: cloneNodes(fresh.nodes), rootId: fresh.rootId, nilId: fresh.nilId, isAnimating: false, rotationLabel: '' })
  },

  search: value => {
    cancelAnim()
    const { nodes, rootId, nilId, speed } = get()
    const tree = new RBTree({ nodes: cloneNodes(nodes), rootId, nilId })
    const snaps = tree.search(value)
    scheduleSnaps(snaps, SPEED_DELAY[speed])
  },

  insert: value => {
    cancelAnim()
    const { nodes, rootId, nilId, speed } = get()
    if (countReal(nodes, rootId) >= 31) return
    const tree = new RBTree({ nodes: cloneNodes(nodes), rootId, nilId })
    const snaps = tree.insert(value)
    if (snaps.length === 0) return
    // Append final authoritative state from tree
    snaps.push({ nodes: cloneNodes(tree.nodes), rootId: tree.rootId })
    scheduleSnaps(snaps, SPEED_DELAY[speed])
  },
}))
