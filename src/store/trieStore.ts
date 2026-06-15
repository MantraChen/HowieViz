import { create } from 'zustand'
import { nanoid } from 'nanoid'

export type TrieNodeHL = 'default' | 'traversing' | 'found' | 'notFound' | 'inserted' | 'deleted'

export interface TrieNode {
  id: string
  char: string
  isEnd: boolean
  children: Record<string, string>  // char -> child node id
  highlight: TrieNodeHL
}

interface TrieSnap {
  nodes: Record<string, TrieNode>
  rootId: string
  message: string
  currentLine?: number
}

let animTimers: ReturnType<typeof setTimeout>[] = []
let animGen = 0

function cancelAnim() {
  animTimers.forEach(clearTimeout)
  animTimers = []
  animGen++
}

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const DEFAULT_WORDS = ['apple', 'app', 'apply', 'apt', 'bat', 'ball']

function buildTrie(words: string[]): { nodes: Record<string, TrieNode>; rootId: string } {
  const root: TrieNode = { id: nanoid(), char: '', isEnd: false, children: {}, highlight: 'default' }
  const nodes: Record<string, TrieNode> = { [root.id]: root }

  for (const word of words) {
    let cur = root.id
    for (const ch of word) {
      if (!nodes[cur].children[ch]) {
        const newNode: TrieNode = { id: nanoid(), char: ch, isEnd: false, children: {}, highlight: 'default' }
        nodes[newNode.id] = newNode
        nodes[cur] = { ...nodes[cur], children: { ...nodes[cur].children, [ch]: newNode.id } }
        cur = newNode.id
      } else {
        cur = nodes[cur].children[ch]
      }
    }
    nodes[cur] = { ...nodes[cur], isEnd: true }
  }

  return { nodes, rootId: root.id }
}

function deepCopyNodes(nodes: Record<string, TrieNode>): Record<string, TrieNode> {
  const copy: Record<string, TrieNode> = {}
  for (const id in nodes) copy[id] = { ...nodes[id], children: { ...nodes[id].children } }
  return copy
}

function resetHL(nodes: Record<string, TrieNode>): Record<string, TrieNode> {
  const copy = deepCopyNodes(nodes)
  for (const id in copy) copy[id] = { ...copy[id], highlight: 'default' }
  return copy
}

function scheduleSnaps(snaps: TrieSnap[], delay: number, finalStatus: string) {
  const gen = ++animGen
  useTrieStore.setState({ isAnimating: true })
  snaps.forEach((snap, i) => {
    const t = setTimeout(() => {
      if (animGen !== gen) return
      const isLast = i === snaps.length - 1
      useTrieStore.setState({
        nodes: snap.nodes,
        message: snap.message,
        currentLine: snap.currentLine ?? 0,
        isAnimating: !isLast,
        ...(isLast ? { statusText: finalStatus } : {}),
      })
    }, i * delay)
    animTimers.push(t)
  })
}

const SPEED_DELAY = { slow: 700, normal: 350, fast: 130 }

const INITIAL = buildTrie(DEFAULT_WORDS)

interface TrieStore {
  nodes: Record<string, TrieNode>
  rootId: string
  message: string
  isAnimating: boolean
  wordInput: string
  speed: 'slow' | 'normal' | 'fast'
  statusText: string
  currentLine: number
  steps: { time: string; text: string }[]

  setWordInput: (v: string) => void
  setSpeed: (s: 'slow' | 'normal' | 'fast') => void
  insert: (word: string) => void
  search: (word: string) => void
  deleteTrie: (word: string) => void
  reset: () => void
  clearSteps: () => void
  loadFromCSV: (csv: string) => void
}

export const useTrieStore = create<TrieStore>((set, get) => ({
  nodes: deepCopyNodes(INITIAL.nodes),
  rootId: INITIAL.rootId,
  message: '',
  isAnimating: false,
  wordInput: '',
  speed: 'normal',
  statusText: 'Ready — use controls to interact.',
  currentLine: 0,
  steps: [],

  setWordInput: v => set({ wordInput: v }),
  setSpeed: s => set({ speed: s }),
  clearSteps: () => set({ steps: [] }),

  insert: (word: string) => {
    cancelAnim()
    if (!word) return
    const { nodes: rawNodes, rootId, speed, steps } = get()
    const snaps: TrieSnap[] = []
    const nodes = resetHL(rawNodes)

    let cur = rootId
    for (let i = 0; i < word.length; i++) {
      const ch = word[i]
      const n = deepCopyNodes(nodes)
      if (!n[cur].children[ch]) {
        const newNode: TrieNode = { id: nanoid(), char: ch, isEnd: false, children: {}, highlight: 'inserted' }
        n[newNode.id] = newNode
        n[cur] = { ...n[cur], children: { ...n[cur].children, [ch]: newNode.id }, highlight: 'traversing' }
        for (const id in n) nodes[id] = { ...n[id], highlight: 'default' }
        nodes[newNode.id] = { ...newNode, highlight: 'default' }
        nodes[cur] = { ...nodes[cur], children: { ...nodes[cur].children, [ch]: newNode.id } }
        cur = newNode.id
        snaps.push({ nodes: deepCopyNodes(n), rootId, message: `Inserting '${word}': created node '${ch}'`, currentLine: 4 })
      } else {
        n[cur] = { ...n[cur], highlight: 'traversing' }
        cur = n[cur].children[ch]
        n[cur] = { ...n[cur], highlight: 'traversing' }
        snaps.push({ nodes: deepCopyNodes(n), rootId, message: `Inserting '${word}': following '${ch}'`, currentLine: 6 })
      }
    }

    nodes[cur] = { ...nodes[cur], isEnd: true }
    const final = deepCopyNodes(nodes)
    final[cur] = { ...final[cur], highlight: 'inserted', isEnd: true }
    snaps.push({ nodes: final, rootId, message: `Inserted '${word}' ✓`, currentLine: 7 })

    const done = deepCopyNodes(nodes)
    snaps.push({ nodes: done, rootId, message: `'${word}' is now in the trie`, currentLine: 7 })

    set({ steps: [...steps, { time: nowTime(), text: `Insert: "${word}" added to trie` }] })
    scheduleSnaps(snaps, SPEED_DELAY[speed], `Inserted "${word}"`)
  },

  search: (word: string) => {
    cancelAnim()
    if (!word) return
    const { nodes: rawNodes, rootId, speed, steps } = get()
    const snaps: TrieSnap[] = []
    const nodes = resetHL(rawNodes)

    let cur = rootId
    let found = true

    for (let i = 0; i < word.length; i++) {
      const ch = word[i]
      const n = deepCopyNodes(nodes)
      n[cur] = { ...n[cur], highlight: 'traversing' }

      if (!n[cur].children[ch]) {
        n[cur] = { ...n[cur], highlight: 'notFound' }
        snaps.push({ nodes: n, rootId, message: `Search '${word}': '${ch}' not found`, currentLine: 11 })
        found = false
        break
      }

      const nextId = n[cur].children[ch]
      n[nextId] = { ...n[nextId], highlight: 'traversing' }
      snaps.push({ nodes: n, rootId, message: `Search '${word}': found '${ch}'`, currentLine: 12 })
      cur = nextId
    }

    let isWord = false
    if (found) {
      isWord = nodes[cur].isEnd
      const n = deepCopyNodes(nodes)
      n[cur] = { ...n[cur], highlight: isWord ? 'found' : 'notFound' }
      snaps.push({
        nodes: n, rootId,
        message: isWord ? `'${word}' found in trie ✓` : `'${word}' is a prefix but not a complete word`,
        currentLine: 13,
      })
    }

    const done = deepCopyNodes(nodes)
    snaps.push({ nodes: done, rootId, message: snaps[snaps.length - 1]?.message ?? '', currentLine: 13 })

    const finalStatus = found && isWord ? `Found "${word}"` : `"${word}" not found`
    const stepText = found && isWord ? `Search: "${word}" found` : `Search: "${word}" not found`
    set({ steps: [...steps, { time: nowTime(), text: stepText }] })
    scheduleSnaps(snaps, SPEED_DELAY[speed], finalStatus)
  },

  deleteTrie: (word: string) => {
    cancelAnim()
    if (!word) return
    const { nodes: rawNodes, rootId, speed, steps } = get()
    const snaps: TrieSnap[] = []
    const nodes = resetHL(rawNodes)

    const path: string[] = [rootId]
    let cur = rootId
    let found = true

    for (const ch of word) {
      if (!nodes[cur].children[ch]) { found = false; break }
      cur = nodes[cur].children[ch]
      path.push(cur)
    }

    if (!found || !nodes[cur].isEnd) {
      const n = deepCopyNodes(nodes)
      snaps.push({ nodes: n, rootId, message: `'${word}' not found in trie` })
      set({ steps: [...steps, { time: nowTime(), text: `Delete: "${word}" not found` }] })
      scheduleSnaps(snaps, SPEED_DELAY[speed], `"${word}" not found`)
      return
    }

    const n1 = deepCopyNodes(nodes)
    for (const id of path) n1[id] = { ...n1[id], highlight: 'traversing' }
    snaps.push({ nodes: n1, rootId, message: `Found '${word}', marking for deletion` })

    nodes[cur] = { ...nodes[cur], isEnd: false }

    const chars = Array.from(word)
    for (let i = path.length - 1; i >= 1; i--) {
      const nodeId = path[i]
      const parentId = path[i - 1]
      if (Object.keys(nodes[nodeId].children).length === 0 && !nodes[nodeId].isEnd) {
        const n2 = deepCopyNodes(nodes)
        n2[nodeId] = { ...n2[nodeId], highlight: 'deleted' }
        snaps.push({ nodes: n2, rootId, message: `Removing node '${chars[i - 1]}'` })
        delete nodes[nodeId]
        const parentChildren = { ...nodes[parentId].children }
        delete parentChildren[chars[i - 1]]
        nodes[parentId] = { ...nodes[parentId], children: parentChildren }
      } else {
        break
      }
    }

    const done = deepCopyNodes(nodes)
    snaps.push({ nodes: done, rootId, message: `'${word}' deleted from trie` })

    set({ steps: [...steps, { time: nowTime(), text: `Delete: "${word}" removed from trie` }] })
    scheduleSnaps(snaps, SPEED_DELAY[speed], `Deleted "${word}"`)
  },

  reset: () => {
    cancelAnim()
    const fresh = buildTrie(DEFAULT_WORDS)
    set({ nodes: deepCopyNodes(fresh.nodes), rootId: fresh.rootId, message: '', isAnimating: false, statusText: 'Trie reset to default.' })
  },

  loadFromCSV: (csv: string) => {
    cancelAnim()
    const words = csv.split(',').map(s => s.trim().toLowerCase().replace(/[^a-z]/g, '')).filter(w => w.length > 0)
    if (words.length === 0) return
    const fresh = buildTrie(words)
    set({ nodes: deepCopyNodes(fresh.nodes), rootId: fresh.rootId, message: '', isAnimating: false, statusText: `Loaded ${words.length} words` })
  },
}))
