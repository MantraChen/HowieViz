import type { QuizQuestion } from '@/types'

export const ARRAY_QUIZ: QuizQuestion[] = [
  {
    id: 'arr-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the time complexity of accessing an element by index in an array?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correct: 'O(1)',
    explanation: 'Arrays store elements in contiguous memory. The address of element i is base + i × size, computed in constant time regardless of array length.',
    relatedLine: 12,
  },
  {
    id: 'arr-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the time complexity of appending (push) to the end of a dynamic array?',
    options: ['O(1) amortized', 'O(log n)', 'O(n)', 'O(n²)'],
    correct: 'O(1) amortized',
    explanation: 'Most pushes are O(1). Occasionally the backing array must be resized (O(n)), but doubling the capacity means this happens infrequently — amortized cost is O(1).',
    relatedLine: 2,
  },
  {
    id: 'arr-3', type: 'true_false', difficulty: 'medium',
    question: 'True or False: Inserting at index 0 of an array is O(1).',
    correct: 'False',
    explanation: 'Inserting at the front requires shifting all existing elements one position right, which is O(n). Only appending to the end is O(1) amortized.',
    relatedLine: 6,
  },
  {
    id: 'arr-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'After push(3), push(1), push(4), pop(), push(5) — what value does pop() return next?',
    options: ['3', '4', '5', '1'],
    correct: '5',
    explanation: 'After the operations the array is [3, 1, 5]. pop() removes from the end, returning 5.',
  },
  {
    id: 'arr-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the worst-case time complexity of a single push() call on a dynamic array?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correct: 'O(n)',
    explanation: 'When the backing array is full, all n elements must be copied to a newly allocated array of double the size — O(n). This is rare, so amortized cost is O(1).',
  },
  {
    id: 'arr-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the space complexity of an in-place array reversal?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correct: 'O(1)',
    explanation: 'Swapping elements in-place uses only a single temporary variable regardless of array size.',
  },
]

export const STACK_QUIZ: QuizQuestion[] = [
  {
    id: 'stk-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What does LIFO stand for?',
    options: ['Last In, First Out', 'Least Indexed, First Out', 'Last Index, First Operation', 'Linear In, Fast Out'],
    correct: 'Last In, First Out',
    explanation: 'LIFO means the most recently pushed element is the first one to be popped — like a stack of plates.',
  },
  {
    id: 'stk-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'Which operation removes and returns the top element of a stack?',
    options: ['pop()', 'peek()', 'dequeue()', 'extract()'],
    correct: 'pop()',
    explanation: 'pop() removes and returns the element at the top. peek() (or top()) only reads it without removing.',
  },
  {
    id: 'stk-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'Given push(1), push(2), push(3), pop() — what does peek() return?',
    options: ['1', '2', '3', 'undefined'],
    correct: '2',
    explanation: 'After push(1), push(2), push(3) the stack is [1,2,3] (top=3). pop() removes 3. peek() on [1,2] returns 2.',
  },
  {
    id: 'stk-4', type: 'true_false', difficulty: 'medium',
    question: 'True or False: A stack can be used to check if parentheses in an expression are balanced.',
    correct: 'True',
    explanation: 'Push opening brackets; when a closing bracket is encountered, pop and check if it matches. An empty stack at the end means balanced.',
  },
  {
    id: 'stk-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the time complexity of all basic stack operations (push, pop, peek)?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correct: 'O(1)',
    explanation: 'All stack operations act only on the top element and take constant time regardless of stack size.',
  },
  {
    id: 'stk-6', type: 'true_false', difficulty: 'hard',
    question: 'True or False: A stack can be implemented using a single queue.',
    correct: 'True',
    explanation: 'Yes — to simulate pop(), dequeue all but the last element and re-enqueue them. Push is O(1); pop is O(n).',
  },
]

export const QUEUE_QUIZ: QuizQuestion[] = [
  {
    id: 'q-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What does FIFO stand for?',
    options: ['First In, First Out', 'Fast Index, First Out', 'First Index, Full Operation', 'Front In, Final Out'],
    correct: 'First In, First Out',
    explanation: 'FIFO means the element enqueued earliest is the first to be dequeued — like a line at a store.',
  },
  {
    id: 'q-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'Which graph traversal algorithm uses a queue?',
    options: ['BFS', 'DFS', 'Dijkstra', 'Bellman-Ford'],
    correct: 'BFS',
    explanation: 'Breadth-First Search uses a queue to process nodes level by level, ensuring nodes are visited in order of discovery.',
  },
  {
    id: 'q-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'After enqueue(5), enqueue(3), dequeue(), enqueue(7) — what is at the front of the queue?',
    options: ['5', '3', '7', 'empty'],
    correct: '3',
    explanation: 'enqueue(5) → [5], enqueue(3) → [5,3], dequeue() removes 5 → [3], enqueue(7) → [3,7]. Front is 3.',
  },
  {
    id: 'q-4', type: 'true_false', difficulty: 'medium',
    question: 'True or False: A queue can be implemented using two stacks with O(1) amortized enqueue and dequeue.',
    correct: 'True',
    explanation: 'Use a "inbox" stack for enqueue and "outbox" stack for dequeue. When outbox is empty, pour inbox into it. Each element is moved at most twice — O(1) amortized.',
  },
  {
    id: 'q-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the time complexity of enqueue and dequeue in a queue backed by a singly linked list?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correct: 'O(1)',
    explanation: 'With head and tail pointers, enqueue appends to tail (O(1)) and dequeue removes from head (O(1)).',
  },
  {
    id: 'q-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'Which of the following is NOT a common application of queues?',
    options: ['Function call management', 'CPU scheduling', 'Print spooling', 'Level-order tree traversal'],
    correct: 'Function call management',
    explanation: 'Function call management uses a stack (LIFO). CPU scheduling, print spooling, and level-order traversal all use queues (FIFO).',
  },
]

export const LINKED_LIST_QUIZ: QuizQuestion[] = [
  {
    id: 'll-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the time complexity of accessing the kth element in a singly linked list?',
    options: ['O(k)', 'O(1)', 'O(log n)', 'O(n²)'],
    correct: 'O(k)',
    explanation: 'Unlike arrays, linked lists have no index. You must follow next pointers from the head, taking k steps — O(k) or O(n) in the worst case.',
  },
  {
    id: 'll-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the time complexity of inserting a node at the head of a linked list?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correct: 'O(1)',
    explanation: 'Inserting at the head only requires updating the new node\'s next pointer and the head pointer — two constant-time operations.',
  },
  {
    id: 'll-3', type: 'true_false', difficulty: 'medium',
    question: 'True or False: Linked lists use contiguous memory.',
    correct: 'False',
    explanation: 'Linked list nodes can be scattered anywhere in memory. Each node holds a pointer to the next node to link them together.',
  },
  {
    id: 'll-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of deleting a node by value from a linked list (worst case)?',
    options: ['O(n)', 'O(1)', 'O(log n)', 'O(n log n)'],
    correct: 'O(n)',
    explanation: 'You must traverse up to n nodes to find the target value before you can delete it.',
  },
  {
    id: 'll-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the time complexity of reversing a singly linked list in-place?',
    options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    correct: 'O(n)',
    explanation: 'Reversing requires visiting each node exactly once to redirect its next pointer, making it O(n) with O(1) extra space.',
  },
  {
    id: 'll-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'To detect a cycle in a linked list efficiently, which algorithm is used?',
    options: ["Floyd's Tortoise and Hare", 'Binary search', 'Merge sort', 'Union-Find'],
    correct: "Floyd's Tortoise and Hare",
    explanation: 'Use two pointers: slow (moves 1 step) and fast (moves 2 steps). If they meet, there is a cycle. Time O(n), space O(1).',
  },
]

export const DOUBLY_LINKED_LIST_QUIZ: QuizQuestion[] = [
  {
    id: 'dll-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What additional pointer does a doubly linked list node have compared to a singly linked list node?',
    options: ['A pointer to the previous node', 'A pointer to the head', 'A pointer to the tail', 'A pointer to the middle node'],
    correct: 'A pointer to the previous node',
    explanation: 'Each DLL node stores both next and prev pointers, enabling traversal in both directions.',
  },
  {
    id: 'dll-2', type: 'true_false', difficulty: 'easy',
    question: 'True or False: A doubly linked list requires more memory per node than a singly linked list.',
    correct: 'True',
    explanation: 'Each DLL node stores an extra prev pointer, consuming additional memory compared to a singly linked list node.',
  },
  {
    id: 'dll-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of deleting a node given a direct pointer to it in a doubly linked list?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correct: 'O(1)',
    explanation: 'With prev and next pointers available, you can directly update neighbors without traversal — O(1).',
  },
  {
    id: 'dll-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'Which real-world data structure typically uses a doubly linked list internally?',
    options: ['Browser history (forward/back)', 'Call stack', 'Hash table', 'Priority queue'],
    correct: 'Browser history (forward/back)',
    explanation: 'The back/forward navigation in browsers needs bidirectional traversal, making a DLL a natural choice.',
  },
  {
    id: 'dll-5', type: 'true_false', difficulty: 'hard',
    question: 'True or False: Deleting from the tail of a doubly linked list is O(1) if you maintain a tail pointer.',
    correct: 'True',
    explanation: 'With a tail pointer, access the tail in O(1), update tail.prev.next = null and tail = tail.prev — constant time.',
  },
  {
    id: 'dll-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'A doubly linked list is the underlying structure for which cache eviction policy?',
    options: ['LRU Cache', 'FIFO Cache', 'Random Cache', 'Clock Cache'],
    correct: 'LRU Cache',
    explanation: 'LRU Cache combines a hash map (O(1) lookup) with a DLL (O(1) move-to-front/delete) to achieve O(1) get and put.',
  },
]

export const CIRCULAR_QUEUE_QUIZ: QuizQuestion[] = [
  {
    id: 'cq-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What problem does a circular queue solve that a simple array-based queue does not?',
    options: ['Wasted space from dequeued elements', 'Slow enqueue', 'Inability to store duplicates', 'Lack of FIFO ordering'],
    correct: 'Wasted space from dequeued elements',
    explanation: 'In a simple queue, front advances and the vacated slots cannot be reused. A circular queue wraps the rear around to reuse those slots.',
  },
  {
    id: 'cq-2', type: 'true_false', difficulty: 'easy',
    question: 'True or False: In a circular queue, after rear reaches the end of the array it wraps to index 0.',
    correct: 'True',
    explanation: 'Rear is updated as (rear + 1) % capacity, allowing it to wrap around and reuse slots vacated by dequeues.',
  },
  {
    id: 'cq-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'How do you distinguish a full circular queue from an empty one when using only front and rear pointers?',
    options: ['Use a separate size counter', 'It is impossible', 'Check if front equals rear always', 'Only track rear'],
    correct: 'Use a separate size counter',
    explanation: 'front == rear is ambiguous (could be empty or full). A common fix is maintaining a count variable, or leaving one slot always empty.',
  },
  {
    id: 'cq-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of enqueue and dequeue in a circular queue?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correct: 'O(1)',
    explanation: 'Both operations update only the front or rear pointer using modular arithmetic — constant time.',
  },
  {
    id: 'cq-5', type: 'true_false', difficulty: 'hard',
    question: 'True or False: A circular queue of capacity k can hold k elements.',
    correct: 'True',
    explanation: 'With a size counter approach, all k slots can be used. If using the "leave one slot empty" trick, only k-1 elements fit — but the capacity is then set to k+1.',
  },
  {
    id: 'cq-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'In a circular queue with capacity 5, if front=3 and rear=1, how many elements are currently stored (using size counter approach)?',
    options: ['3', '2', '4', '5'],
    correct: '3',
    explanation: 'Elements occupy indices 3, 4, 0 (wrapping around). That is 3 elements: 5-3+1=3 using (rear - front + capacity) % capacity = (1-3+5)%5 = 3.',
  },
]

export const DEQUE_QUIZ: QuizQuestion[] = [
  {
    id: 'dq-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What does "Deque" stand for?',
    options: ['Double-Ended Queue', 'Delayed Queue', 'Distributed Queue', 'Dynamic Queue'],
    correct: 'Double-Ended Queue',
    explanation: 'A deque allows insertions and deletions at both the front and the back, unlike a regular queue which only allows one end per operation.',
  },
  {
    id: 'dq-2', type: 'true_false', difficulty: 'easy',
    question: 'True or False: A deque can function as both a stack and a queue.',
    correct: 'True',
    explanation: 'Use only the back for push/pop to get stack (LIFO) behavior, or add to back and remove from front for queue (FIFO) behavior.',
  },
  {
    id: 'dq-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of all basic deque operations (push/pop front and back)?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correct: 'O(1)',
    explanation: 'A well-implemented deque (e.g., using a doubly linked list or a circular buffer) performs all four operations in O(1).',
  },
  {
    id: 'dq-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'A monotonic deque is commonly used to solve which type of problem efficiently?',
    options: ['Sliding window maximum/minimum', 'Shortest path', 'String matching', 'Sorting'],
    correct: 'Sliding window maximum/minimum',
    explanation: 'A monotonic deque maintains elements in sorted order and discards elements that can no longer be the max/min as the window slides, achieving O(n) overall.',
  },
  {
    id: 'dq-5', type: 'true_false', difficulty: 'hard',
    question: 'True or False: Java\'s ArrayDeque is generally faster than LinkedList for deque operations.',
    correct: 'True',
    explanation: 'ArrayDeque uses a resizable circular array with better cache locality than a linked list, making it faster in practice despite the same asymptotic complexity.',
  },
  {
    id: 'dq-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'For the sliding window maximum of [3,1,2,5,0] with window size 3, what is the sequence of maximums?',
    options: ['[3, 5, 5]', '[3, 2, 5]', '[3, 3, 5]', '[1, 5, 5]'],
    correct: '[3, 5, 5]',
    explanation: 'Windows: [3,1,2]→3, [1,2,5]→5, [2,5,0]→5. A monotonic deque yields [3,5,5].',
  },
]

export const BST_QUIZ: QuizQuestion[] = [
  {
    id: 'bst-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'In a BST, where are values smaller than the root stored?',
    options: ['Left subtree', 'Right subtree', 'At the root', 'Randomly distributed'],
    correct: 'Left subtree',
    explanation: 'BST property: all keys in the left subtree are smaller than the root; all keys in the right subtree are larger.',
  },
  {
    id: 'bst-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What traversal of a BST yields elements in sorted (ascending) order?',
    options: ['In-order', 'Pre-order', 'Post-order', 'Level-order'],
    correct: 'In-order',
    explanation: 'In-order traversal visits left subtree, then root, then right subtree — which produces keys in ascending order for a BST.',
  },
  {
    id: 'bst-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'After inserting 5, 3, 7, 1, 4 into an empty BST, what is the in-order traversal?',
    options: ['1, 3, 4, 5, 7', '5, 3, 7, 1, 4', '1, 4, 3, 7, 5', '7, 5, 4, 3, 1'],
    correct: '1, 3, 4, 5, 7',
    explanation: 'The BST in-order always yields sorted order: 1 < 3 < 4 < 5 < 7.',
  },
  {
    id: 'bst-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the worst-case time complexity of BST search?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
    correct: 'O(n)',
    explanation: 'If elements are inserted in sorted order, the BST degenerates into a linked list (height = n), making search O(n).',
  },
  {
    id: 'bst-5', type: 'true_false', difficulty: 'hard',
    question: 'True or False: A BST with n nodes always has O(log n) height.',
    correct: 'False',
    explanation: 'Only a balanced BST guarantees O(log n) height. An unbalanced BST can have height O(n) in the worst case.',
  },
  {
    id: 'bst-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'When deleting a node with two children from a BST, which node replaces it?',
    options: ['In-order successor or predecessor', 'Left child', 'Right child', 'Parent node'],
    correct: 'In-order successor or predecessor',
    explanation: 'The in-order successor (smallest in right subtree) or predecessor (largest in left subtree) maintains BST ordering after deletion.',
  },
]

export const AVL_QUIZ: QuizQuestion[] = [
  {
    id: 'avl-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the balance factor of a node in an AVL tree?',
    options: ['Height of left subtree minus height of right subtree', 'Height of right minus left', 'Number of children', 'Depth of the node'],
    correct: 'Height of left subtree minus height of right subtree',
    explanation: 'Balance factor = height(left) - height(right). A node is balanced if its balance factor is -1, 0, or +1.',
  },
  {
    id: 'avl-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'Which rotation fixes a right-right (RR) imbalance in an AVL tree?',
    options: ['Left rotation', 'Right rotation', 'Left-Right rotation', 'Right-Left rotation'],
    correct: 'Left rotation',
    explanation: 'An RR imbalance (heavy on the right-right side) is fixed by a single left rotation on the unbalanced node.',
  },
  {
    id: 'avl-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of insertion into an AVL tree?',
    options: ['O(log n)', 'O(1)', 'O(n)', 'O(n log n)'],
    correct: 'O(log n)',
    explanation: 'AVL trees maintain O(log n) height. Insertion traverses the height once (O(log n)) and does at most a constant number of rotations.',
  },
  {
    id: 'avl-4', type: 'true_false', difficulty: 'medium',
    question: 'True or False: After inserting 1, 2, 3 into an empty AVL tree, a left rotation is performed.',
    correct: 'True',
    explanation: 'Inserting 1, 2, 3 creates an RR imbalance at node 1. A left rotation at node 1 produces a balanced tree with 2 as root.',
  },
  {
    id: 'avl-5', type: 'true_false', difficulty: 'hard',
    question: 'True or False: An AVL tree is always perfectly balanced (all leaves at the same depth).',
    correct: 'False',
    explanation: 'AVL trees are height-balanced (balance factor ≤ 1 everywhere), but leaves can be at different depths. Perfect balance is stricter.',
  },
  {
    id: 'avl-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the maximum height of an AVL tree with n nodes?',
    options: ['1.44 log₂(n)', 'log₂(n)', '2 log₂(n)', 'n/2'],
    correct: '1.44 log₂(n)',
    explanation: 'The worst-case AVL height is ≈ 1.44 log₂(n+2), achieved by Fibonacci-like trees. This is still O(log n).',
  },
]

export const HEAP_QUIZ: QuizQuestion[] = [
  {
    id: 'hp-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'In a min-heap, which element is always at the root?',
    options: ['The minimum element', 'The maximum element', 'The median element', 'The most recently inserted element'],
    correct: 'The minimum element',
    explanation: 'Min-heap property: every parent is ≤ its children. The root has no parent so it must be the global minimum.',
  },
  {
    id: 'hp-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'How is a binary heap typically stored in memory?',
    options: ['As an array', 'As a linked list', 'As a hash table', 'As a balanced BST'],
    correct: 'As an array',
    explanation: 'A binary heap is a complete binary tree. This shape maps perfectly to an array: node at index i has children at 2i+1 and 2i+2 (0-indexed).',
  },
  {
    id: 'hp-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of inserting an element into a binary heap?',
    options: ['O(log n)', 'O(1)', 'O(n)', 'O(n log n)'],
    correct: 'O(log n)',
    explanation: 'Insertion appends to the end then "bubbles up" (sifts up) by swapping with parents. The heap height is O(log n).',
  },
  {
    id: 'hp-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'For a node at index i (1-indexed) in a binary heap array, what is the index of its left child?',
    options: ['2i', '2i+1', 'i+1', 'i/2'],
    correct: '2i',
    explanation: 'With 1-based indexing: left child = 2i, right child = 2i+1, parent = floor(i/2). With 0-based: left = 2i+1, right = 2i+2.',
  },
  {
    id: 'hp-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the time complexity of building a heap from an unsorted array of n elements?',
    options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'],
    correct: 'O(n)',
    explanation: 'Heapify starting from the last internal node and working up: most nodes are near the bottom and travel a short distance. The total work sums to O(n).',
  },
  {
    id: 'hp-6', type: 'true_false', difficulty: 'hard',
    question: 'True or False: A heap supports O(log n) search for an arbitrary element.',
    correct: 'False',
    explanation: 'Heaps only guarantee the root\'s value. Finding an arbitrary element requires scanning all n elements — O(n). Use a hash map + heap for O(1) lookup.',
  },
]

export const GRAPH_QUIZ: QuizQuestion[] = [
  {
    id: 'gr-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'Which data structure does BFS (Breadth-First Search) use?',
    options: ['Queue', 'Stack', 'Priority queue', 'Set'],
    correct: 'Queue',
    explanation: 'BFS uses a FIFO queue to visit nodes level by level, ensuring all nodes at distance k are visited before nodes at distance k+1.',
  },
  {
    id: 'gr-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'Which data structure does DFS (Depth-First Search) use?',
    options: ['Stack (or call stack)', 'Queue', 'Priority queue', 'Heap'],
    correct: 'Stack (or call stack)',
    explanation: 'DFS uses a LIFO stack (or recursion, which uses the call stack) to explore as deep as possible before backtracking.',
  },
  {
    id: 'gr-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of BFS on a graph with V vertices and E edges?',
    options: ['O(V + E)', 'O(V²)', 'O(V log V)', 'O(E log E)'],
    correct: 'O(V + E)',
    explanation: 'Each vertex is enqueued once (O(V)) and each edge is examined once (O(E)), giving O(V + E) total.',
  },
  {
    id: 'gr-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'Which algorithm finds the shortest path in an unweighted graph?',
    options: ['BFS', 'DFS', 'Dijkstra', 'Bellman-Ford'],
    correct: 'BFS',
    explanation: 'BFS explores nodes in order of distance from the source. The first time a node is reached, that path is the shortest in terms of edge count.',
  },
  {
    id: 'gr-5', type: 'true_false', difficulty: 'hard',
    question: 'True or False: DFS always finds the shortest path in an unweighted graph.',
    correct: 'False',
    explanation: 'DFS can explore a long path before trying a shorter one. It finds A path but not necessarily the shortest. Use BFS for shortest paths in unweighted graphs.',
  },
  {
    id: 'gr-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the space complexity of BFS in the worst case?',
    options: ['O(V)', 'O(E)', 'O(V + E)', 'O(1)'],
    correct: 'O(V)',
    explanation: 'The BFS queue can hold at most V vertices (one per vertex in the graph), plus the visited array — O(V) total space.',
  },
]

export const DIJKSTRA_QUIZ: QuizQuestion[] = [
  {
    id: 'dijk-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What does Dijkstra\'s algorithm compute?',
    options: ['Shortest paths from a source to all vertices', 'Minimum spanning tree', 'Topological order', 'Maximum flow'],
    correct: 'Shortest paths from a source to all vertices',
    explanation: 'Dijkstra\'s finds the shortest (minimum weight) path from a single source vertex to all other vertices in a weighted graph.',
  },
  {
    id: 'dijk-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What data structure enables the most efficient implementation of Dijkstra\'s algorithm?',
    options: ['Min-heap / Priority queue', 'Stack', 'Linked list', 'Hash set'],
    correct: 'Min-heap / Priority queue',
    explanation: 'A min-heap allows extracting the unvisited vertex with the smallest tentative distance in O(log V), giving O((V+E) log V) overall.',
  },
  {
    id: 'dijk-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'Why does Dijkstra\'s algorithm fail with negative edge weights?',
    options: ['It assumes a settled node has its final shortest distance', 'It cannot handle cycles', 'It requires directed graphs', 'It needs a DAG'],
    correct: 'It assumes a settled node has its final shortest distance',
    explanation: 'Once a node is "settled", Dijkstra never updates it. Negative edges can create shorter paths through settled nodes discovered later, making the assumption invalid.',
  },
  {
    id: 'dijk-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the initial distance assigned to all non-source vertices in Dijkstra\'s algorithm?',
    options: ['Infinity (∞)', '0', '-1', 'The edge weight from source'],
    correct: 'Infinity (∞)',
    explanation: 'All distances start at ∞ except the source (distance 0). As shorter paths are found, distances are relaxed downward.',
  },
  {
    id: 'dijk-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the time complexity of Dijkstra\'s with a binary heap on a graph with V vertices and E edges?',
    options: ['O((V + E) log V)', 'O(V²)', 'O(E log E)', 'O(V log V)'],
    correct: 'O((V + E) log V)',
    explanation: 'Each vertex is extracted once (O(V log V)) and each edge relaxation is O(log V) for heap decrease-key — total O((V+E) log V).',
  },
  {
    id: 'dijk-6', type: 'true_false', difficulty: 'hard',
    question: 'True or False: Dijkstra\'s algorithm is correct when all edge weights are non-negative.',
    correct: 'True',
    explanation: 'With non-negative weights, the greedy choice (always process the minimum-distance unvisited vertex) is optimal, and Dijkstra\'s guarantees correct shortest paths.',
  },
]

export const BELLMAN_FORD_QUIZ: QuizQuestion[] = [
  {
    id: 'bf-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the key advantage of Bellman-Ford over Dijkstra\'s algorithm?',
    options: ['Handles negative edge weights', 'Faster on sparse graphs', 'Uses less memory', 'Works on undirected graphs only'],
    correct: 'Handles negative edge weights',
    explanation: 'Bellman-Ford relaxes all edges V-1 times, correctly computing shortest paths even when some edge weights are negative.',
  },
  {
    id: 'bf-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'How many relaxation rounds does Bellman-Ford perform on a graph with V vertices?',
    options: ['V - 1', 'V', 'V + 1', 'V²'],
    correct: 'V - 1',
    explanation: 'The shortest simple path visits at most V-1 edges. V-1 rounds of relaxing all edges guarantees convergence.',
  },
  {
    id: 'bf-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of Bellman-Ford?',
    options: ['O(V × E)', 'O((V + E) log V)', 'O(V²)', 'O(E log E)'],
    correct: 'O(V × E)',
    explanation: 'V-1 rounds × relaxing all E edges per round = O(V × E).',
  },
  {
    id: 'bf-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'How does Bellman-Ford detect a negative cycle?',
    options: ['Run a Vth relaxation round; if any distance updates, a negative cycle exists', 'Check if any edge weight is negative', 'Look for cycles in the graph', 'Compare distances with DFS'],
    correct: 'Run a Vth relaxation round; if any distance updates, a negative cycle exists',
    explanation: 'After V-1 rounds, no shortest path should change. A Vth round that still updates distances means a negative cycle is reachable from the source.',
  },
  {
    id: 'bf-5', type: 'true_false', difficulty: 'hard',
    question: 'True or False: Bellman-Ford is more efficient than Dijkstra for dense graphs with no negative weights.',
    correct: 'False',
    explanation: 'Dijkstra with a binary heap is O((V+E) log V), better than Bellman-Ford\'s O(VE) for dense graphs. Use Dijkstra when weights are non-negative.',
  },
  {
    id: 'bf-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the space complexity of Bellman-Ford?',
    options: ['O(V)', 'O(E)', 'O(V + E)', 'O(V²)'],
    correct: 'O(V)',
    explanation: 'Bellman-Ford stores a distance array of size V (one entry per vertex). The graph itself is O(V+E) but the algorithm\'s extra space is O(V).',
  },
]

export const FLOYD_WARSHALL_QUIZ: QuizQuestion[] = [
  {
    id: 'fw-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What does Floyd-Warshall compute?',
    options: ['Shortest paths between ALL pairs of vertices', 'Shortest path from one source', 'Minimum spanning tree', 'Topological ordering'],
    correct: 'Shortest paths between ALL pairs of vertices',
    explanation: 'Floyd-Warshall solves the all-pairs shortest path problem, computing shortest distances between every pair of vertices in one run.',
  },
  {
    id: 'fw-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the time complexity of Floyd-Warshall?',
    options: ['O(V³)', 'O(V² log V)', 'O(V²)', 'O(VE)'],
    correct: 'O(V³)',
    explanation: 'Three nested loops each run V times: for each intermediate vertex k, for each source i, for each destination j — O(V³).',
  },
  {
    id: 'fw-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the space complexity of Floyd-Warshall?',
    options: ['O(V²)', 'O(V)', 'O(V³)', 'O(E)'],
    correct: 'O(V²)',
    explanation: 'Floyd-Warshall maintains a V×V distance matrix where dist[i][j] stores the shortest known path from i to j.',
  },
  {
    id: 'fw-4', type: 'true_false', difficulty: 'medium',
    question: 'True or False: Floyd-Warshall can detect negative cycles.',
    correct: 'True',
    explanation: 'After running Floyd-Warshall, a negative value on the diagonal (dist[i][i] < 0) indicates a negative cycle passing through vertex i.',
  },
  {
    id: 'fw-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'In Floyd-Warshall\'s DP recurrence, what does dist[i][j][k] represent?',
    options: ['Shortest path from i to j using only vertices 1..k as intermediates', 'Shortest path from i to k', 'Number of edges from i to j', 'kth shortest path from i to j'],
    correct: 'Shortest path from i to j using only vertices 1..k as intermediates',
    explanation: 'The recurrence is: dist[i][j][k] = min(dist[i][j][k-1], dist[i][k][k-1] + dist[k][j][k-1]). The final k=V gives all-pairs shortest paths.',
  },
  {
    id: 'fw-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'For V=4 vertices, how many cells does the Floyd-Warshall distance matrix contain?',
    options: ['16', '4', '8', '12'],
    correct: '16',
    explanation: 'The distance matrix is V×V = 4×4 = 16 cells, storing shortest distances for all ordered pairs (i,j) including self-distances on the diagonal.',
  },
]

export const KRUSKALS_QUIZ: QuizQuestion[] = [
  {
    id: 'kr-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What does Kruskal\'s algorithm find?',
    options: ['Minimum Spanning Tree (MST)', 'Shortest path', 'Maximum flow', 'Topological order'],
    correct: 'Minimum Spanning Tree (MST)',
    explanation: 'Kruskal\'s builds the MST — a spanning tree connecting all vertices with minimum total edge weight.',
  },
  {
    id: 'kr-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'In what order does Kruskal\'s algorithm process edges?',
    options: ['Sorted by weight ascending', 'Sorted by weight descending', 'BFS order', 'DFS order'],
    correct: 'Sorted by weight ascending',
    explanation: 'Kruskal\'s greedily picks the smallest available edge that does not form a cycle with already selected edges.',
  },
  {
    id: 'kr-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What data structure does Kruskal\'s use for cycle detection?',
    options: ['Union-Find (Disjoint Set Union)', 'Visited array', 'BFS queue', 'DFS stack'],
    correct: 'Union-Find (Disjoint Set Union)',
    explanation: 'Union-Find efficiently checks whether two vertices belong to the same component (forming a cycle) in nearly O(1) amortized time.',
  },
  {
    id: 'kr-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of Kruskal\'s algorithm?',
    options: ['O(E log E)', 'O(V²)', 'O(V log V)', 'O(VE)'],
    correct: 'O(E log E)',
    explanation: 'Sorting edges takes O(E log E). Union-Find operations are nearly O(1) each, so the total is dominated by sorting.',
  },
  {
    id: 'kr-5', type: 'true_false', difficulty: 'hard',
    question: 'True or False: Kruskal\'s algorithm always produces a unique MST.',
    correct: 'False',
    explanation: 'If multiple edges have equal weight, different tie-breaking choices produce different MSTs with the same total weight. Uniqueness is only guaranteed when all edge weights are distinct.',
  },
  {
    id: 'kr-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'For a connected graph with V vertices, how many edges does the MST contain?',
    options: ['V - 1', 'V', 'V + 1', 'E'],
    correct: 'V - 1',
    explanation: 'Any spanning tree of a connected graph with V vertices has exactly V-1 edges — the minimum to connect all vertices without cycles.',
  },
]

export const PRIMS_QUIZ: QuizQuestion[] = [
  {
    id: 'pr-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What does Prim\'s algorithm build?',
    options: ['Minimum Spanning Tree', 'Shortest path tree', 'Maximum spanning tree', 'Topological ordering'],
    correct: 'Minimum Spanning Tree',
    explanation: 'Prim\'s grows the MST vertex by vertex, always adding the minimum-weight edge that connects the current tree to a new vertex.',
  },
  {
    id: 'pr-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'How does Prim\'s algorithm grow the MST?',
    options: ['Add minimum weight edge from tree to non-tree vertex', 'Sort all edges and pick smallest', 'BFS from source', 'DFS from source'],
    correct: 'Add minimum weight edge from tree to non-tree vertex',
    explanation: 'Prim\'s maintains a growing tree and at each step adds the cheapest edge connecting tree vertices to non-tree vertices.',
  },
  {
    id: 'pr-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of Prim\'s with a binary heap?',
    options: ['O((V + E) log V)', 'O(V²)', 'O(E log E)', 'O(VE)'],
    correct: 'O((V + E) log V)',
    explanation: 'With a min-heap: each vertex is extracted once (V × log V) and each edge triggers a possible key-decrease (E × log V) — total O((V+E) log V).',
  },
  {
    id: 'pr-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the main difference between Prim\'s and Kruskal\'s?',
    options: ["Prim's grows one tree; Kruskal's grows a forest", "Prim's sorts edges; Kruskal's doesn't", "Kruskal's starts from all vertices; Prim's doesn't", 'They are identical algorithms'],
    correct: "Prim's grows one tree; Kruskal's grows a forest",
    explanation: "Prim's starts from one vertex and grows a single tree. Kruskal's adds edges globally, initially creating many small trees that merge into one.",
  },
  {
    id: 'pr-5', type: 'true_false', difficulty: 'hard',
    question: "True or False: Prim's and Kruskal's always produce the same MST.",
    correct: 'False',
    explanation: 'When edges have equal weights, the two algorithms may select different edges (both valid MSTs with the same total weight).',
  },
  {
    id: 'pr-6', type: 'multiple_choice', difficulty: 'hard',
    question: "For dense graphs (E ≈ V²), which MST algorithm is typically more efficient?",
    options: ["Prim's with adjacency matrix O(V²)", "Kruskal's O(E log E)", "Both are equal", "Bellman-Ford"],
    correct: "Prim's with adjacency matrix O(V²)",
    explanation: "For dense graphs, Prim's with an adjacency matrix runs in O(V²) which is better than Kruskal's O(E log E) ≈ O(V² log V) for dense E.",
  },
]

export const TOPO_SORT_QUIZ: QuizQuestion[] = [
  {
    id: 'ts-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What type of graph is required for topological sorting?',
    options: ['Directed Acyclic Graph (DAG)', 'Undirected graph', 'Weighted graph', 'Complete graph'],
    correct: 'Directed Acyclic Graph (DAG)',
    explanation: 'Topological sort requires a DAG. Cycles make it impossible — if A→B→A, neither can come before the other.',
  },
  {
    id: 'ts-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'In a topological ordering, for every edge u→v, vertex u appears...',
    options: ['Before v', 'After v', 'At the same position as v', 'The ordering is undefined'],
    correct: 'Before v',
    explanation: 'Topological sort guarantees that if there is a directed edge from u to v, u comes before v in the ordering.',
  },
  {
    id: 'ts-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of topological sort?',
    options: ['O(V + E)', 'O(V²)', 'O(E log E)', 'O(V log V)'],
    correct: 'O(V + E)',
    explanation: 'Both DFS-based topological sort and Kahn\'s (BFS with in-degree counts) run in O(V + E).',
  },
  {
    id: 'ts-4', type: 'true_false', difficulty: 'medium',
    question: 'True or False: A DAG has exactly one valid topological ordering.',
    correct: 'False',
    explanation: 'Many DAGs have multiple valid topological orderings. Only a DAG that is a simple path (linear chain) has exactly one.',
  },
  {
    id: 'ts-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'In Kahn\'s algorithm, what does it mean if the output ordering has fewer than V vertices?',
    options: ['The graph has a cycle', 'The graph is disconnected', 'The graph has negative weights', 'The source vertex was wrong'],
    correct: 'The graph has a cycle',
    explanation: 'If vertices remain with non-zero in-degree after the algorithm, they are part of a cycle and cannot be appended to the topological order.',
  },
  {
    id: 'ts-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'Which real-world problem uses topological sorting?',
    options: ['Build/task dependency resolution', 'Finding shortest paths', 'Network routing', 'Image compression'],
    correct: 'Build/task dependency resolution',
    explanation: 'Build systems (like Make) use topological sort to determine the order to compile files/tasks respecting their dependencies.',
  },
]

export const BINARY_SEARCH_QUIZ: QuizQuestion[] = [
  {
    id: 'bs-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the time complexity of binary search?',
    options: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'],
    correct: 'O(log n)',
    explanation: 'Binary search halves the search space at each step. After k steps, remaining elements ≈ n/2^k. When that reaches 1, k ≈ log₂ n.',
  },
  {
    id: 'bs-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What precondition must be met for binary search to work correctly?',
    options: ['The array must be sorted', 'The array must have unique elements', 'The array must have even length', 'The target must be in the array'],
    correct: 'The array must be sorted',
    explanation: 'Binary search relies on comparing the middle element and discarding half the array. This only works correctly if elements are in order.',
  },
  {
    id: 'bs-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'How many comparisons does binary search need to find 7 in [1, 3, 5, 7, 9, 11]?',
    options: ['2', '1', '3', '4'],
    correct: '2',
    explanation: 'mid index 2 (value 5): 7 > 5 → search right half [7,9,11]. mid index 4 (value 7): found! 2 comparisons.',
  },
  {
    id: 'bs-4', type: 'true_false', difficulty: 'medium',
    question: 'True or False: Binary search can be applied to a singly linked list with O(log n) time complexity.',
    correct: 'False',
    explanation: 'Linked lists do not support O(1) random access. Reaching the middle requires traversal (O(n)), making binary search O(n log n) on linked lists — worse than linear search.',
  },
  {
    id: 'bs-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the space complexity of recursive binary search?',
    options: ['O(log n)', 'O(1)', 'O(n)', 'O(n log n)'],
    correct: 'O(log n)',
    explanation: 'Recursive binary search creates a call stack of depth O(log n). Iterative binary search uses O(1) space.',
  },
  {
    id: 'bs-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'For a sorted array of 1024 elements, what is the maximum number of comparisons binary search makes?',
    options: ['10', '5', '20', '512'],
    correct: '10',
    explanation: 'log₂(1024) = 10. Binary search needs at most ⌈log₂ n⌉ comparisons, which is 10 for n = 1024.',
  },
]

export const LINEAR_SEARCH_QUIZ: QuizQuestion[] = [
  {
    id: 'ls-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the worst-case time complexity of linear search?',
    options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
    correct: 'O(n)',
    explanation: 'In the worst case (target not found or at the last position), linear search checks all n elements.',
  },
  {
    id: 'ls-2', type: 'true_false', difficulty: 'easy',
    question: 'True or False: Linear search requires the array to be sorted.',
    correct: 'False',
    explanation: 'Linear search checks elements one by one and works on any array, sorted or unsorted.',
  },
  {
    id: 'ls-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the best-case time complexity of linear search?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correct: 'O(1)',
    explanation: 'Best case is when the target is the first element checked — found immediately in O(1).',
  },
  {
    id: 'ls-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'In what scenario is linear search preferable to binary search?',
    options: ['Small or unsorted arrays', 'Large sorted arrays', 'When memory is limited', 'When duplicates exist'],
    correct: 'Small or unsorted arrays',
    explanation: 'Sorting before binary search takes O(n log n). For small n or already-unsorted data, linear search is simpler and avoids sorting overhead.',
  },
  {
    id: 'ls-5', type: 'true_false', difficulty: 'hard',
    question: 'True or False: Linear search can find all occurrences of a value in O(n) time.',
    correct: 'True',
    explanation: 'By continuing past the first match instead of stopping, linear search can collect all occurrences in a single O(n) pass.',
  },
  {
    id: 'ls-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the average-case number of comparisons for a successful linear search in an array of n elements?',
    options: ['(n + 1) / 2', 'n', 'n / 4', 'log₂ n'],
    correct: '(n + 1) / 2',
    explanation: 'Assuming the target is equally likely to be at any position, the average position is the middle: (1 + 2 + … + n) / n = (n+1)/2.',
  },
]

export const BUBBLE_SORT_QUIZ: QuizQuestion[] = [
  {
    id: 'bb-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the best-case time complexity of bubble sort (with early exit optimization)?',
    options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
    correct: 'O(n)',
    explanation: 'With early exit: if no swaps occur in a pass, the array is already sorted. For a sorted array, one pass with 0 swaps exits in O(n).',
  },
  {
    id: 'bb-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the worst-case time complexity of bubble sort?',
    options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(log n)'],
    correct: 'O(n²)',
    explanation: 'Worst case (reverse-sorted array): n-1 passes, each doing up to n-1 comparisons → O(n²).',
  },
  {
    id: 'bb-3', type: 'true_false', difficulty: 'medium',
    question: 'True or False: Bubble sort is a stable sorting algorithm.',
    correct: 'True',
    explanation: 'Bubble sort only swaps adjacent elements when the left is strictly greater than the right, preserving the relative order of equal elements.',
  },
  {
    id: 'bb-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'After one complete pass of bubble sort on [5, 3, 1, 4, 2], what is the array state?',
    options: ['[3, 1, 4, 2, 5]', '[1, 3, 5, 4, 2]', '[3, 5, 1, 4, 2]', '[1, 2, 3, 4, 5]'],
    correct: '[3, 1, 4, 2, 5]',
    explanation: 'One pass bubbles the maximum (5) to the end: 5>3 swap→[3,5,1,4,2]; 5>1 swap→[3,1,5,4,2]; 5>4 swap→[3,1,4,5,2]; 5>2 swap→[3,1,4,2,5].',
  },
  {
    id: 'bb-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the space complexity of bubble sort?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correct: 'O(1)',
    explanation: 'Bubble sort sorts in-place using only a constant amount of extra space (a temp variable for swapping).',
  },
  {
    id: 'bb-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'How many passes does bubble sort guarantee to sort an array of n elements?',
    options: ['n - 1', 'n', 'n / 2', 'log₂ n'],
    correct: 'n - 1',
    explanation: 'Each pass places at least one element in its final position. After n-1 passes, all n elements are correctly placed.',
  },
]

export const INSERTION_SORT_QUIZ: QuizQuestion[] = [
  {
    id: 'is-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the best-case time complexity of insertion sort?',
    options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
    correct: 'O(n)',
    explanation: 'For an already-sorted array, each element is inserted in its correct position immediately — one comparison per element → O(n).',
  },
  {
    id: 'is-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'On what type of data does insertion sort perform best?',
    options: ['Nearly sorted data', 'Reverse-sorted data', 'Random data', 'Data with many duplicates'],
    correct: 'Nearly sorted data',
    explanation: 'When most elements are already in place, each insertion requires only a few shifts — very efficient for nearly sorted inputs.',
  },
  {
    id: 'is-3', type: 'true_false', difficulty: 'medium',
    question: 'True or False: Insertion sort is a stable sorting algorithm.',
    correct: 'True',
    explanation: 'Insertion sort shifts elements rightward but only when strictly greater, so equal elements maintain their original relative order.',
  },
  {
    id: 'is-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the worst-case time complexity of insertion sort?',
    options: ['O(n²)', 'O(n)', 'O(n log n)', 'O(log n)'],
    correct: 'O(n²)',
    explanation: 'For a reverse-sorted array, each element must be shifted past all previous elements: 0+1+2+…+(n-1) = n(n-1)/2 shifts → O(n²).',
  },
  {
    id: 'is-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the space complexity of insertion sort?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correct: 'O(1)',
    explanation: 'Insertion sort is in-place. Only a constant amount of extra space is used for the current element being inserted.',
  },
  {
    id: 'is-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'Shell sort is a generalization of which algorithm?',
    options: ['Insertion sort', 'Bubble sort', 'Selection sort', 'Merge sort'],
    correct: 'Insertion sort',
    explanation: 'Shell sort runs insertion sort on elements separated by a gap, then reduces the gap — it generalizes insertion sort for better performance.',
  },
]

export const MERGE_SORT_QUIZ: QuizQuestion[] = [
  {
    id: 'ms-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the time complexity of merge sort in all cases (best, average, worst)?',
    options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
    correct: 'O(n log n)',
    explanation: 'Merge sort always divides into two halves (log n levels) and merges (O(n) per level) regardless of input order → O(n log n) in all cases.',
  },
  {
    id: 'ms-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'Which algorithmic paradigm does merge sort use?',
    options: ['Divide and conquer', 'Greedy', 'Dynamic programming', 'Backtracking'],
    correct: 'Divide and conquer',
    explanation: 'Merge sort divides the array in half recursively, sorts each half, and conquers by merging the sorted halves.',
  },
  {
    id: 'ms-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the space complexity of the standard merge sort?',
    options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'],
    correct: 'O(n)',
    explanation: 'The merge step requires a temporary array of size n to hold merged results before copying back. Call stack adds O(log n) which is dominated.',
  },
  {
    id: 'ms-4', type: 'true_false', difficulty: 'medium',
    question: 'True or False: Merge sort is a stable sorting algorithm.',
    correct: 'True',
    explanation: 'When merging, equal elements from the left half are placed before equal elements from the right half — preserving original order.',
  },
  {
    id: 'ms-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the recursion depth of merge sort on an array of 8 elements?',
    options: ['3', '4', '8', '2'],
    correct: '3',
    explanation: 'Each level halves the problem: 8 → 4 → 2 → 1. That is 3 levels of recursion (log₂ 8 = 3).',
  },
  {
    id: 'ms-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'Why is merge sort preferred over quicksort for sorting linked lists?',
    options: ['No need for random access; merge is O(n) for linked lists', 'Merge sort is faster asymptotically', 'Merge sort uses less memory on linked lists', 'Quicksort cannot sort linked lists'],
    correct: 'No need for random access; merge is O(n) for linked lists',
    explanation: 'Quicksort relies on O(1) index access for partitioning (inefficient on linked lists). Merge sort only needs sequential access — efficient on linked lists.',
  },
]

export const QUICKSORT_QUIZ: QuizQuestion[] = [
  {
    id: 'qs-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the average-case time complexity of quicksort?',
    options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
    correct: 'O(n log n)',
    explanation: 'With a good pivot, quicksort partitions roughly in half each time: log n levels × O(n) work per level = O(n log n) on average.',
  },
  {
    id: 'qs-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the worst-case time complexity of quicksort?',
    options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'],
    correct: 'O(n²)',
    explanation: 'Worst case occurs when the pivot always splits into sizes 0 and n-1 (e.g., always picking smallest/largest). This gives n levels × O(n) = O(n²).',
  },
  {
    id: 'qs-3', type: 'true_false', difficulty: 'medium',
    question: 'True or False: Quicksort is a stable sorting algorithm.',
    correct: 'False',
    explanation: 'Quicksort\'s partitioning step can change the relative order of equal elements. Stability requires equal elements to preserve their original order.',
  },
  {
    id: 'qs-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'Which pivot selection strategy reduces the probability of worst-case behavior?',
    options: ['Median-of-three or random pivot', 'Always pick first element', 'Always pick last element', 'Always pick middle element'],
    correct: 'Median-of-three or random pivot',
    explanation: 'Median-of-three picks the median of first, middle, and last elements, avoiding consistently poor pivots. Random pivot makes worst case extremely unlikely.',
  },
  {
    id: 'qs-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the average-case space complexity of quicksort?',
    options: ['O(log n)', 'O(1)', 'O(n)', 'O(n log n)'],
    correct: 'O(log n)',
    explanation: 'Quicksort is in-place for data movement but uses O(log n) call stack depth on average for recursion. Worst case stack depth is O(n).',
  },
  {
    id: 'qs-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'On which input does the "always pick first element as pivot" strategy perform worst?',
    options: ['Already sorted or reverse-sorted array', 'Random array', 'Array of all equal elements', 'Array with two distinct values'],
    correct: 'Already sorted or reverse-sorted array',
    explanation: 'For a sorted array with first-element pivot, each partition produces sizes 0 and n-1 — n levels of O(n) work → O(n²).',
  },
]

export const HEAP_SORT_QUIZ: QuizQuestion[] = [
  {
    id: 'hps-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What data structure does heap sort use?',
    options: ['Max-heap', 'Min-heap', 'BST', 'AVL tree'],
    correct: 'Max-heap',
    explanation: 'Heap sort builds a max-heap so that the largest element is at the root, then extracts it repeatedly to sort in ascending order.',
  },
  {
    id: 'hps-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the time complexity of heap sort in all cases?',
    options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
    correct: 'O(n log n)',
    explanation: 'Building the max-heap is O(n). Each of the n extract-max operations is O(log n). Total: O(n) + O(n log n) = O(n log n).',
  },
  {
    id: 'hps-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the space complexity of heap sort?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correct: 'O(1)',
    explanation: 'Heap sort sorts in-place within the input array — the heap is stored in the same array. Only constant extra space is used.',
  },
  {
    id: 'hps-4', type: 'true_false', difficulty: 'medium',
    question: 'True or False: Heap sort is a stable sorting algorithm.',
    correct: 'False',
    explanation: 'The extract-max step moves the last heap element to the root and sifts it down, potentially reordering equal elements. Heap sort is not stable.',
  },
  {
    id: 'hps-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What are the two phases of heap sort?',
    options: ['Build max-heap, then repeatedly extract max', 'Sort then heapify', 'Partition then merge', 'Insert then delete'],
    correct: 'Build max-heap, then repeatedly extract max',
    explanation: 'Phase 1: heapify the array into a max-heap in O(n). Phase 2: swap root (max) with last element, reduce heap size, and sift down — repeated n times.',
  },
  {
    id: 'hps-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'Why is heap sort rarely used in practice despite its O(n log n) guarantee?',
    options: ['Poor cache performance due to non-sequential memory access', 'Higher time complexity than merge sort', 'It cannot sort integers', 'It is not in-place'],
    correct: 'Poor cache performance due to non-sequential memory access',
    explanation: 'Heap operations jump across large index distances in the array, causing many cache misses. Quicksort and merge sort have much better locality.',
  },
]

export const COUNTING_SORT_QUIZ: QuizQuestion[] = [
  {
    id: 'cs-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the time complexity of counting sort?',
    options: ['O(n + k)', 'O(n log n)', 'O(n²)', 'O(k log k)'],
    correct: 'O(n + k)',
    explanation: 'Counting sort iterates over n elements to count and k possible values to build the output — total O(n + k).',
  },
  {
    id: 'cs-2', type: 'true_false', difficulty: 'easy',
    question: 'True or False: Counting sort is a comparison-based sorting algorithm.',
    correct: 'False',
    explanation: 'Counting sort never compares elements against each other. It counts occurrences and uses arithmetic to place elements — it is non-comparison based.',
  },
  {
    id: 'cs-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the space complexity of counting sort?',
    options: ['O(k)', 'O(n)', 'O(n + k)', 'O(1)'],
    correct: 'O(k)',
    explanation: 'Counting sort needs a count array of size k (the range of values). The output array is O(n) but is often considered output space.',
  },
  {
    id: 'cs-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'When is counting sort more efficient than comparison-based sorts?',
    options: ['When k (the range) is small relative to n', 'When n is small', 'When data is already sorted', 'When data has many duplicates'],
    correct: 'When k (the range) is small relative to n',
    explanation: 'If k = O(n), counting sort is O(n) — better than O(n log n). For large k (e.g., sorting 32-bit integers), counting sort is impractical.',
  },
  {
    id: 'cs-5', type: 'true_false', difficulty: 'hard',
    question: 'True or False: Counting sort is stable.',
    correct: 'True',
    explanation: 'The standard counting sort implementation (using prefix sums and iterating input right-to-left) preserves relative order of equal elements — it is stable.',
  },
  {
    id: 'cs-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'Counting sort is used as a subroutine in which other sorting algorithm?',
    options: ['Radix sort', 'Merge sort', 'Quicksort', 'Heap sort'],
    correct: 'Radix sort',
    explanation: 'Radix sort processes digits one at a time. It uses a stable sort (typically counting sort) for each digit position to achieve O(d × (n + k)) overall.',
  },
]

export const RADIX_SORT_QUIZ: QuizQuestion[] = [
  {
    id: 'rx-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the time complexity of radix sort (LSD)?',
    options: ['O(d × (n + k))', 'O(n log n)', 'O(n²)', 'O(dk²)'],
    correct: 'O(d × (n + k))',
    explanation: 'Radix sort does d passes (one per digit), each using a stable sort costing O(n + k) where k is the base (radix). Total: O(d(n + k)).',
  },
  {
    id: 'rx-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'In LSD radix sort, which digit is processed first?',
    options: ['Least significant digit', 'Most significant digit', 'Median digit', 'Largest digit'],
    correct: 'Least significant digit',
    explanation: 'LSD (Least Significant Digit) radix sort processes digits from the rightmost (least significant) to the leftmost (most significant).',
  },
  {
    id: 'rx-3', type: 'true_false', difficulty: 'medium',
    question: 'True or False: Radix sort is a comparison-based sorting algorithm.',
    correct: 'False',
    explanation: 'Radix sort never compares two elements against each other. It distributes elements into buckets based on each digit.',
  },
  {
    id: 'rx-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'Which sorting algorithm is used within each pass of radix sort to maintain stability?',
    options: ['Counting sort', 'Quicksort', 'Bubble sort', 'Selection sort'],
    correct: 'Counting sort',
    explanation: 'Each radix sort pass must be stable (equal digits preserve original order). Counting sort is stable and runs in O(n + k) — ideal for each pass.',
  },
  {
    id: 'rx-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the space complexity of radix sort?',
    options: ['O(n + k)', 'O(1)', 'O(n log n)', 'O(k)'],
    correct: 'O(n + k)',
    explanation: 'Radix sort needs O(n) for the output array during each pass and O(k) for the count array — total O(n + k) extra space.',
  },
  {
    id: 'rx-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'For sorting 32-bit integers using base 256 (k=256), how many passes does radix sort make?',
    options: ['4', '32', '256', '8'],
    correct: '4',
    explanation: '32 bits / 8 bits per byte = 4 bytes = 4 passes. Each pass processes one byte (d=4, k=256).',
  },
]

export const FIBONACCI_QUIZ: QuizQuestion[] = [
  {
    id: 'fib-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What are fib(0) and fib(1)?',
    options: ['0 and 1', '1 and 1', '0 and 0', '1 and 2'],
    correct: '0 and 1',
    explanation: 'The standard definition: fib(0) = 0, fib(1) = 1, fib(n) = fib(n-1) + fib(n-2) for n ≥ 2.',
  },
  {
    id: 'fib-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the time complexity of the naive recursive Fibonacci?',
    options: ['O(2ⁿ)', 'O(n)', 'O(n²)', 'O(n log n)'],
    correct: 'O(2ⁿ)',
    explanation: 'Each call branches into two sub-calls, forming a binary tree of depth n. The number of nodes is exponential: O(2ⁿ).',
  },
  {
    id: 'fib-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'With memoization (top-down DP), what is the time complexity of computing fib(n)?',
    options: ['O(n)', 'O(n²)', 'O(2ⁿ)', 'O(log n)'],
    correct: 'O(n)',
    explanation: 'Each subproblem fib(k) is computed once and cached. There are n+1 unique subproblems → O(n) time, O(n) space.',
  },
  {
    id: 'fib-4', type: 'true_false', difficulty: 'medium',
    question: 'True or False: The Fibonacci sequence demonstrates the principle of overlapping subproblems.',
    correct: 'True',
    explanation: 'fib(n) calls fib(n-1) and fib(n-2), both of which call fib(n-2), fib(n-3), etc. These subproblems are computed repeatedly — the hallmark of overlapping subproblems.',
  },
  {
    id: 'fib-5', type: 'fill_in', difficulty: 'hard',
    question: 'What is fib(10)?',
    correct: '55',
    explanation: 'fib sequence: 0,1,1,2,3,5,8,13,21,34,55. fib(10) = 55.',
  },
  {
    id: 'fib-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the most efficient known time complexity for computing fib(n)?',
    options: ['O(log n)', 'O(1)', 'O(n)', 'O(√n)'],
    correct: 'O(log n)',
    explanation: 'Using matrix exponentiation: [[1,1],[1,0]]^n gives fib(n+1) in O(log n) time using fast matrix power.',
  },
]

export const EDIT_DISTANCE_QUIZ: QuizQuestion[] = [
  {
    id: 'ed-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What does the edit distance (Levenshtein distance) measure?',
    options: ['Minimum operations to transform one string to another', 'Length of longest common substring', 'Number of differing characters', 'Position of first difference'],
    correct: 'Minimum operations to transform one string to another',
    explanation: 'Edit distance counts the minimum number of single-character insertions, deletions, and substitutions to change one string into another.',
  },
  {
    id: 'ed-2', type: 'fill_in', difficulty: 'easy',
    question: 'What is the edit distance between "cat" and "cat"?',
    correct: '0',
    explanation: 'Identical strings require 0 operations to transform one into the other.',
  },
  {
    id: 'ed-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of the DP solution for edit distance between strings of length m and n?',
    options: ['O(m × n)', 'O(m + n)', 'O(m² × n)', 'O(2^(m+n))'],
    correct: 'O(m × n)',
    explanation: 'The DP table has m+1 rows and n+1 columns. Each cell is computed in O(1) → total O(m × n).',
  },
  {
    id: 'ed-4', type: 'true_false', difficulty: 'medium',
    question: 'True or False: Edit distance is symmetric — dist("abc", "xyz") = dist("xyz", "abc").',
    correct: 'True',
    explanation: 'Any sequence of operations transforming A to B can be reversed to transform B to A with the same cost. Edit distance is symmetric.',
  },
  {
    id: 'ed-5', type: 'fill_in', difficulty: 'hard',
    question: 'What is the edit distance between an empty string "" and a string of length n?',
    correct: 'n',
    explanation: 'To turn "" into a string of length n, you must insert n characters (or delete n from the other direction). Edit distance = n.',
  },
  {
    id: 'ed-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the edit distance between "kitten" and "sitting"?',
    options: ['3', '2', '4', '5'],
    correct: '3',
    explanation: 'kitten → sitten (substitute k→s), sitten → sittin (substitute e→i), sittin → sitting (insert g). 3 operations.',
  },
]

export const LCS_QUIZ: QuizQuestion[] = [
  {
    id: 'lcs-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What does LCS find?',
    options: ['Longest common subsequence', 'Longest common substring', 'Least common string', 'Largest contiguous segment'],
    correct: 'Longest common subsequence',
    explanation: 'LCS finds the longest sequence of characters that appears in both strings in the same order, but not necessarily contiguous.',
  },
  {
    id: 'lcs-2', type: 'true_false', difficulty: 'easy',
    question: 'True or False: A subsequence must consist of contiguous characters.',
    correct: 'False',
    explanation: 'A subsequence preserves order but can skip characters. "ace" is a subsequence of "abcde". A substring must be contiguous.',
  },
  {
    id: 'lcs-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of the DP solution for LCS of strings of length m and n?',
    options: ['O(m × n)', 'O(m + n)', 'O(2^(m+n))', 'O(m log n)'],
    correct: 'O(m × n)',
    explanation: 'The DP table has m × n cells, each computed in O(1) time.',
  },
  {
    id: 'lcs-4', type: 'true_false', difficulty: 'medium',
    question: 'True or False: The LCS of two strings is always unique.',
    correct: 'False',
    explanation: 'Multiple LCS of the same maximum length may exist. E.g., LCS("ABCBDAB", "BDCABA") could be "BCBA" or "BDAB" (both length 4).',
  },
  {
    id: 'lcs-5', type: 'fill_in', difficulty: 'hard',
    question: 'What is the length of the LCS of "AGGTAB" and "GXTXAYB"?',
    correct: '4',
    explanation: 'LCS is "GTAB" (length 4): G from AGGTAB, T, A, B align with GXTXAYB.',
  },
  {
    id: 'lcs-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'The LCS length relates to edit distance (insert/delete only). If LCS(A,B) = L, what is the edit distance?',
    options: ['|A| + |B| - 2L', '|A| - |B|', 'L', '2L'],
    correct: '|A| + |B| - 2L',
    explanation: 'To transform A into B using only insertions and deletions: delete |A| - L characters from A and insert |B| - L characters → |A| + |B| - 2L operations.',
  },
]

export const KNAPSACK_QUIZ: QuizQuestion[] = [
  {
    id: 'kp-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What distinguishes the 0/1 knapsack from the fractional knapsack?',
    options: ['Each item is either fully included or excluded (no fractions)', 'Items can be split into fractions', 'Only one item type is allowed', 'Items have equal weights'],
    correct: 'Each item is either fully included or excluded (no fractions)',
    explanation: 'In 0/1 knapsack, you take 0 or 1 copy of each item. In fractional knapsack you can take a fraction (solved greedily in O(n log n)).',
  },
  {
    id: 'kp-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What are the inputs to the 0/1 knapsack problem?',
    options: ['Item weights, item values, and capacity W', 'Only item weights and capacity', 'Item values and capacity', 'Number of items and capacity'],
    correct: 'Item weights, item values, and capacity W',
    explanation: 'Given n items each with a weight and value, and a knapsack of capacity W, maximize total value without exceeding W.',
  },
  {
    id: 'kp-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of the DP solution for 0/1 knapsack with n items and capacity W?',
    options: ['O(n × W)', 'O(n log W)', 'O(2ⁿ)', 'O(n + W)'],
    correct: 'O(n × W)',
    explanation: 'The DP table is n × W. Each cell is filled in O(1) → total O(n × W).',
  },
  {
    id: 'kp-4', type: 'true_false', difficulty: 'medium',
    question: 'True or False: The fractional knapsack problem can be solved optimally with a greedy algorithm.',
    correct: 'True',
    explanation: 'Sort items by value/weight ratio and greedily take as much of the highest-ratio item as possible. This is optimal for fractional knapsack.',
  },
  {
    id: 'kp-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'Why is 0/1 knapsack considered pseudo-polynomial time?',
    options: ['Complexity depends on W which is not bounded by input size', 'It always runs in polynomial time', 'It uses exponential space', 'It has non-deterministic steps'],
    correct: 'Complexity depends on W which is not bounded by input size',
    explanation: 'O(nW) is polynomial in n and W, but W can be exponentially large relative to the number of bits needed to represent it. True polynomial time would depend only on input length.',
  },
  {
    id: 'kp-6', type: 'fill_in', difficulty: 'hard',
    question: 'Items: (w=2, v=3), (w=3, v=4), (w=4, v=5). Capacity W=5. What is the maximum value?',
    correct: '7',
    explanation: 'Taking items 1 (w=2,v=3) and 2 (w=3,v=4): total weight = 5 ≤ 5, total value = 7. No other combination fits and achieves more.',
  },
]

export const TRIE_QUIZ: QuizQuestion[] = [
  {
    id: 'tr-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is a Trie primarily used for?',
    options: ['Storing and searching strings efficiently', 'Shortest path in graphs', 'Sorting integers', 'Balancing binary trees'],
    correct: 'Storing and searching strings efficiently',
    explanation: 'A Trie stores strings by sharing common prefixes. Each path from root to a marked node represents a stored string.',
  },
  {
    id: 'tr-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the time complexity of searching for a word of length k in a Trie?',
    options: ['O(k)', 'O(n)', 'O(log n)', 'O(k log n)'],
    correct: 'O(k)',
    explanation: 'Searching a Trie follows exactly k edges (one per character). Time depends only on the word length, not the number of stored words.',
  },
  {
    id: 'tr-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'How many children can each Trie node have for lowercase English letters?',
    options: ['26', '52', '128', '256'],
    correct: '26',
    explanation: 'One child slot per letter a–z. Each node has an array of 26 pointers (most are null).',
  },
  {
    id: 'tr-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the advantage of a Trie over a hash table for autocomplete?',
    options: ['Trie supports prefix queries efficiently', 'Trie uses less memory', 'Trie has O(1) exact lookup', 'Trie supports range queries'],
    correct: 'Trie supports prefix queries efficiently',
    explanation: 'Finding all words with a given prefix takes O(prefix length + results) in a Trie. Hash tables would need to scan all stored words.',
  },
  {
    id: 'tr-5', type: 'true_false', difficulty: 'hard',
    question: 'True or False: A compressed Trie (Patricia tree) uses less memory than a standard Trie.',
    correct: 'True',
    explanation: 'A compressed Trie merges chains of single-child nodes into single edges. This reduces the number of nodes significantly for sparse tries.',
  },
  {
    id: 'tr-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the space complexity of a Trie storing n words of average length k?',
    options: ['O(n × k)', 'O(n)', 'O(k)', 'O(n + k)'],
    correct: 'O(n × k)',
    explanation: 'In the worst case (no shared prefixes), each word takes k nodes → O(n × k) total. With shared prefixes, space can be much less.',
  },
]

export const SEGMENT_TREE_QUIZ: QuizQuestion[] = [
  {
    id: 'seg-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is the time complexity of a range query on a segment tree?',
    options: ['O(log n)', 'O(n)', 'O(1)', 'O(n log n)'],
    correct: 'O(log n)',
    explanation: 'A segment tree query visits at most O(log n) nodes — the query range aligns with O(log n) segments in the tree.',
  },
  {
    id: 'seg-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'Which of the following can a segment tree efficiently answer?',
    options: ['Range sum / min / max queries', 'Shortest path', 'Sorting', 'String matching'],
    correct: 'Range sum / min / max queries',
    explanation: 'Segment trees are designed for range queries (sum, min, max, GCD, etc.) and point/range updates on arrays.',
  },
  {
    id: 'seg-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of a single-point update in a segment tree?',
    options: ['O(log n)', 'O(1)', 'O(n)', 'O(n log n)'],
    correct: 'O(log n)',
    explanation: 'A point update propagates changes up the tree from a leaf to the root, touching O(log n) nodes.',
  },
  {
    id: 'seg-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the space complexity of a segment tree on n elements?',
    options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'],
    correct: 'O(n)',
    explanation: 'A segment tree has at most 4n nodes (commonly stored in an array of size 4n) — O(n) space.',
  },
  {
    id: 'seg-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the time complexity of building a segment tree from an array of n elements?',
    options: ['O(n)', 'O(n log n)', 'O(log n)', 'O(n²)'],
    correct: 'O(n)',
    explanation: 'Building visits all 2n-1 internal nodes once each, performing O(1) work per node → O(n) total.',
  },
  {
    id: 'seg-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'What optimization does lazy propagation add to a segment tree?',
    options: ['Efficient range updates by deferring changes', 'Faster point queries', 'Reduced space usage', 'Parallel range queries'],
    correct: 'Efficient range updates by deferring changes',
    explanation: 'Without lazy propagation, a range update is O(n). Lazy propagation marks nodes and defers updates to children until needed — O(log n) range update.',
  },
]

export const FENWICK_QUIZ: QuizQuestion[] = [
  {
    id: 'fen-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What is another name for a Fenwick tree?',
    options: ['Binary Indexed Tree (BIT)', 'Segment tree', 'AVL tree', 'B-tree'],
    correct: 'Binary Indexed Tree (BIT)',
    explanation: 'Fenwick tree and Binary Indexed Tree (BIT) are the same data structure, named after Peter Fenwick.',
  },
  {
    id: 'fen-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What type of queries does a Fenwick tree natively support?',
    options: ['Prefix sum queries', 'Range min/max queries', 'Successor queries', 'Nearest neighbor queries'],
    correct: 'Prefix sum queries',
    explanation: 'A Fenwick tree efficiently computes prefix sums (sum of elements from index 1 to i) and supports point updates in O(log n).',
  },
  {
    id: 'fen-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of update and prefix-sum query in a Fenwick tree?',
    options: ['O(log n)', 'O(1)', 'O(n)', 'O(√n)'],
    correct: 'O(log n)',
    explanation: 'Both operations traverse O(log n) nodes by repeatedly adding or removing the lowest set bit of the index.',
  },
  {
    id: 'fen-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'Which bit operation is used to navigate to the parent in a Fenwick tree update?',
    options: ['i += i & (-i)', 'i -= i & (-i)', 'i >>= 1', 'i ^= 1'],
    correct: 'i += i & (-i)',
    explanation: 'i & (-i) isolates the lowest set bit of i. Adding it to i moves to the next responsible index during update.',
  },
  {
    id: 'fen-5', type: 'true_false', difficulty: 'hard',
    question: 'True or False: A Fenwick tree can be extended to support 2D prefix sums.',
    correct: 'True',
    explanation: 'A 2D Fenwick tree stores a 2D grid and supports O(log m × log n) 2D prefix-sum queries and updates.',
  },
  {
    id: 'fen-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'Compared to a segment tree, what is the main advantage of a Fenwick tree?',
    options: ['Simpler implementation and smaller constant factors', 'Supports range updates natively', 'O(1) queries', 'Less memory than O(n)'],
    correct: 'Simpler implementation and smaller constant factors',
    explanation: 'Fenwick trees have a very compact implementation (a few lines) and tight constants. Segment trees are more powerful (range queries/updates) but more complex.',
  },
]

export const UNION_FIND_QUIZ: QuizQuestion[] = [
  {
    id: 'uf-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'What problem does Union-Find solve?',
    options: ['Tracking and merging disjoint sets / connected components', 'Shortest paths', 'Sorting', 'String matching'],
    correct: 'Tracking and merging disjoint sets / connected components',
    explanation: 'Union-Find (Disjoint Set Union) maintains a partition of elements into disjoint sets, supporting efficient union and find operations.',
  },
  {
    id: 'uf-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What two operations does Union-Find support?',
    options: ['Find (which set) and Union (merge two sets)', 'Insert and Delete', 'Push and Pop', 'Enqueue and Dequeue'],
    correct: 'Find (which set) and Union (merge two sets)',
    explanation: 'Find(x) returns the representative (root) of x\'s set. Union(x, y) merges the sets containing x and y.',
  },
  {
    id: 'uf-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'Which optimization makes Find nearly O(1) amortized?',
    options: ['Path compression', 'Union by rank', 'Lazy evaluation', 'Memoization'],
    correct: 'Path compression',
    explanation: 'Path compression flattens the tree during Find by making every node on the path point directly to the root — subsequent finds are O(1).',
  },
  {
    id: 'uf-4', type: 'multiple_choice', difficulty: 'medium',
    question: 'With path compression AND union by rank, what is the amortized time per operation?',
    options: ['O(α(n)) — inverse Ackermann, effectively O(1)', 'O(log n)', 'O(1) exactly', 'O(n)'],
    correct: 'O(α(n)) — inverse Ackermann, effectively O(1)',
    explanation: 'Combined, path compression and union by rank give amortized O(α(n)) per operation. α(n) ≤ 4 for any practical n, essentially constant.',
  },
  {
    id: 'uf-5', type: 'true_false', difficulty: 'hard',
    question: 'True or False: Union-Find can detect cycles in an undirected graph.',
    correct: 'True',
    explanation: 'Add edges one by one. If Find(u) == Find(v) before Union(u,v), edge (u,v) forms a cycle. This is exactly how Kruskal\'s detects cycles.',
  },
  {
    id: 'uf-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'What is the space complexity of Union-Find for n elements?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correct: 'O(n)',
    explanation: 'Union-Find stores a parent array and a rank array, each of size n — O(n) total space.',
  },
]

export const RB_TREE_QUIZ: QuizQuestion[] = [
  {
    id: 'rb-1', type: 'multiple_choice', difficulty: 'easy',
    question: 'How many colors can a node in a red-black tree have?',
    options: ['2 (red or black)', '3 (red, black, or white)', '4', 'Unlimited'],
    correct: '2 (red or black)',
    explanation: 'Every node in a red-black tree is colored either red or black. This coloring encodes balance information.',
  },
  {
    id: 'rb-2', type: 'multiple_choice', difficulty: 'easy',
    question: 'What color is the root of a red-black tree always?',
    options: ['Black', 'Red', 'Either color', 'Depends on tree size'],
    correct: 'Black',
    explanation: 'Red-black property: the root is always black. If a red node becomes root during operations, it is recolored black.',
  },
  {
    id: 'rb-3', type: 'multiple_choice', difficulty: 'medium',
    question: 'What is the time complexity of search, insert, and delete in a red-black tree?',
    options: ['O(log n)', 'O(1)', 'O(n)', 'O(n log n)'],
    correct: 'O(log n)',
    explanation: 'Red-black trees are approximately balanced with height ≤ 2 log₂(n+1). All BST operations are O(height) = O(log n).',
  },
  {
    id: 'rb-4', type: 'true_false', difficulty: 'medium',
    question: 'True or False: A red-black tree can have two consecutive red nodes on any root-to-leaf path.',
    correct: 'False',
    explanation: 'Red-black property: if a node is red, both its children must be black (no two consecutive reds). This prevents excessively long paths.',
  },
  {
    id: 'rb-5', type: 'multiple_choice', difficulty: 'hard',
    question: 'What property guarantees that a red-black tree is approximately balanced?',
    options: ['Every root-to-null path has the same number of black nodes', 'Every node has exactly 2 children', 'Tree height equals log n exactly', 'All leaves are at the same depth'],
    correct: 'Every root-to-null path has the same number of black nodes',
    explanation: 'Equal black height on all paths (combined with the no-consecutive-reds rule) bounds the height within factor 2 of the minimum — O(log n).',
  },
  {
    id: 'rb-6', type: 'multiple_choice', difficulty: 'hard',
    question: 'Which language\'s built-in map/set typically uses a red-black tree?',
    options: ["C++ std::map / Java TreeMap", 'Python dict', 'JavaScript Map', 'Go map'],
    correct: "C++ std::map / Java TreeMap",
    explanation: 'C++ std::map, std::set and Java TreeMap, TreeSet use red-black trees for O(log n) ordered operations. Python dict and JS Map use hash tables.',
  },
]
