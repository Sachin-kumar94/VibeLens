export interface SeedQuestion {
  category: string;
  subCategory?: string;
  role: string;
  roles: string[];
  interviewTypes: string[];
  difficulty: "Easy" | "Intermediate" | "Advanced" | "Expert";
  tags: string[];
  skills: string[];
  question: string;
  criteria: string;
  whyThisQuestion: string;
  timeTargetMin: number;
  timeTargetMax: number;
  expectedConcepts: string[];
  acceptableConcepts: string[];
  commonMistakes: string[];
  referenceAnswer: string;
  followUpTemplates: string[];
  hints: string[];
  rubric: {
    structure: number;
    relevance: number;
    clarity: number;
    delivery: number;
    evidence: number;
    methodology: "STAR" | "TECHNICAL_DESIGN" | "LEADERSHIP_ALIGNMENT" | "PRODUCT_TRADEOFF" | "GENERAL_COMMUNICATION";
  };
}

export const SYSTEM_QUESTION_BANK: SeedQuestion[] = [
  // ==========================================
  // 1. TECHNICAL FUNDAMENTALS (SQL, DBMS, JS, NETWORKS, OS)
  // ==========================================
  {
    category: "Technical Fundamentals",
    subCategory: "Databases & SQL",
    role: "Backend Developer",
    roles: ["Backend Developer", "Software Engineer", "Full Stack Developer", "Data Engineer"],
    interviewTypes: ["Technical", "Problem Solving"],
    difficulty: "Intermediate",
    tags: ["sql", "join", "union", "rdbms", "relational"],
    skills: ["SQL", "Relational Database Design"],
    question: "What is the difference between SQL JOIN and UNION?",
    criteria: "Clarifies horizontal combination of tables vs vertical combination of result sets, specifies join conditions vs column projection compatibility.",
    whyThisQuestion: "Tests core relational algebra fundamentals and whether candidate distinguishes row-level entity relationships from set operations.",
    timeTargetMin: 60,
    timeTargetMax: 90,
    expectedConcepts: [
      "JOIN combines related rows horizontally from multiple tables based on a join condition or relationship",
      "UNION combines result sets vertically from multiple SELECT queries into one consolidated result set",
      "UNION requires matching column counts and compatible data types across projections",
      "UNION removes duplicates by default, whereas UNION ALL preserves duplicates"
    ],
    acceptableConcepts: [
      "Inner join, left join, right join variations",
      "Cartesian product / cross join comparison",
      "UNION ALL having superior performance due to omitting deduplication sort"
    ],
    commonMistakes: [
      "Stating that UNION joins tables using a primary key or foreign key",
      "Confusing vertical concatenation with horizontal record merging",
      "Believing UNION can join dissimilar tables without matching column signatures"
    ],
    referenceAnswer: "A SQL JOIN combines columns from two or more tables horizontally based on a related key or join condition. A UNION combines the result sets of two SELECT queries vertically into a single result set, provided both queries project the same number of columns with compatible data types. By default, UNION deduplicates rows, whereas UNION ALL retains duplicates with lower CPU overhead.",
    followUpTemplates: [
      "When would you strictly prefer UNION ALL over UNION, and what are the performance implications?",
      "How does a FULL OUTER JOIN differ from combining a LEFT JOIN and a RIGHT JOIN with UNION?"
    ],
    hints: [
      "Think about horizontal (columns side-by-side) versus vertical (stacking rows).",
      "Consider what constraints apply to the SELECT clauses when performing a UNION."
    ],
    rubric: {
      structure: 25,
      relevance: 30,
      clarity: 25,
      delivery: 10,
      evidence: 10,
      methodology: "TECHNICAL_DESIGN"
    }
  },
  {
    category: "Technical Fundamentals",
    subCategory: "Database Indexing",
    role: "Backend Developer",
    roles: ["Backend Developer", "Software Engineer", "Full Stack Developer", "Data Engineer"],
    interviewTypes: ["Technical", "System Design"],
    difficulty: "Advanced",
    tags: ["sql", "indexing", "b-tree", "database-performance", "rdbms"],
    skills: ["SQL", "Database Optimization", "Data Structures"],
    question: "How does a B-Tree index work in a relational database, and when can an index degrade write performance?",
    criteria: "Explains self-balancing multi-way search tree mechanics, logarithmic lookup, leaf node pointer traversal, and the trade-off of maintaining index pages during INSERT/UPDATE/DELETE.",
    whyThisQuestion: "Evaluates deep mechanical sympathy for storage engines rather than treating databases as a black box.",
    timeTargetMin: 75,
    timeTargetMax: 105,
    expectedConcepts: [
      "B-Tree is a balanced multi-way search tree keeping data sorted for logarithmic O(log N) search, insertion, and range scans",
      "Internal nodes store keys and page pointers, while leaf nodes contain row pointers or clustered table data linked sequentially",
      "Every INSERT, UPDATE to indexed columns, or DELETE forces page split reorganizations and tree rebalancing",
      "Excessive indexes increase transaction latency and storage overhead on high-write systems"
    ],
    acceptableConcepts: [
      "Clustered index vs secondary non-clustered index",
      "Index page splits and fragmented leaf node allocation",
      "Write amplification in write-heavy workloads"
    ],
    commonMistakes: [
      "Assuming indexes speed up both read and write operations equally",
      "Confusing B-Tree with a binary search tree (O(log2 N) vs wide fanout)",
      "Believing indexes automatically prevent duplicate values unless declared UNIQUE"
    ],
    referenceAnswer: "A B-Tree index organizes table keys into a balanced multi-way tree with wide fanout, allowing point lookups and range scans to execute in O(log N) disk reads. Leaf nodes hold key values linked sequentially for fast range iteration. While reads accelerate dramatically, every INSERT, DELETE, or update to indexed columns requires the database engine to locate the key in the tree, modify index pages, and potentially perform page splits, directly degrading write throughput and increasing I/O overhead.",
    followUpTemplates: [
      "What is a composite index and how does the leftmost prefix rule affect query planning?",
      "Under what write volume or workload profile would you consider an LSM-tree (Log-Structured Merge-tree) over a B-Tree?"
    ],
    hints: [
      "Explain the tree structure (root, branch, leaf) and page I/O.",
      "Think about what work the storage engine must execute when a new row is inserted."
    ],
    rubric: {
      structure: 25,
      relevance: 25,
      clarity: 25,
      delivery: 15,
      evidence: 10,
      methodology: "TECHNICAL_DESIGN"
    }
  },
  {
    category: "Technical Fundamentals",
    subCategory: "Asynchronous JavaScript",
    role: "Frontend Developer",
    roles: ["Frontend Developer", "Full Stack Developer", "Software Engineer"],
    interviewTypes: ["Technical"],
    difficulty: "Intermediate",
    tags: ["javascript", "event-loop", "promises", "concurrency", "async"],
    skills: ["JavaScript", "Event Loop", "Browser Architecture"],
    question: "Explain the JavaScript Event Loop, microtasks, and macrotasks. In what order do Promise.then and setTimeout execute?",
    criteria: "Articulates call stack, Web APIs, microtask queue (Promises, MutationObserver), macrotask queue (setTimeout, setInterval), and priority execution order.",
    whyThisQuestion: "Determines whether candidate understands browser single-threaded concurrency and non-blocking I/O execution order.",
    timeTargetMin: 60,
    timeTargetMax: 90,
    expectedConcepts: [
      "JavaScript has a single-threaded call stack that executes synchronous code to completion",
      "Asynchronous tasks delegate to browser Web APIs and enqueue callbacks into task queues",
      "Microtask queue (Promise.then, queueMicrotask) has strict execution priority over the macrotask queue",
      "All microtasks must drain completely before the event loop processes the next macrotask (setTimeout)",
      "Promise.then executes before setTimeout(fn, 0)"
    ],
    acceptableConcepts: [
      "requestAnimationFrame timing relative to rendering and task queues",
      "Process.nextTick prioritization in Node.js runtime",
      "Starvation of the macrotask queue if microtasks continuously enqueue"
    ],
    commonMistakes: [
      "Claiming setTimeout with 0ms executes immediately on the main stack",
      "Believing Promise callbacks and setTimeout share the same task queue",
      "Stating JavaScript is multi-threaded because of asynchronous functions"
    ],
    referenceAnswer: "JavaScript executes synchronous code on a single call stack. When asynchronous operations resolve, their callbacks enter specific queues. Microtasks, such as Promise.then and queueMicrotask, have top priority: once the synchronous call stack empties, the event loop drains the entire microtask queue before picking a single task from the macrotask queue (such as setTimeout, setInterval, or I/O events). Therefore, Promise.then callbacks always execute before setTimeout callbacks scheduled in the same frame.",
    followUpTemplates: [
      "What happens to browser rendering if a microtask recursively enqueues another microtask?",
      "How does async/await syntax map to Promise and microtask queue mechanics under the hood?"
    ],
    hints: [
      "Distinguish the Call Stack, Web APIs, Microtask Queue, and Task Queue.",
      "Trace a snippet containing synchronous console.log, setTimeout(0), and Promise.resolve().then()."
    ],
    rubric: {
      structure: 25,
      relevance: 30,
      clarity: 25,
      delivery: 10,
      evidence: 10,
      methodology: "TECHNICAL_DESIGN"
    }
  },
  {
    category: "Technical Fundamentals",
    subCategory: "Networking & Security",
    role: "Full Stack Developer",
    roles: ["Full Stack Developer", "Backend Developer", "DevOps Engineer", "Software Engineer"],
    interviewTypes: ["Technical"],
    difficulty: "Advanced",
    tags: ["networking", "http", "https", "tls", "tcp", "security"],
    skills: ["Computer Networks", "Web Security", "Transport Layer Security"],
    question: "Walk through what happens during a TLS 1.3 handshake, and explain why HTTPS is not always slower than plaintext HTTP today.",
    criteria: "Details key exchange, asymmetric to symmetric transition, 1-RTT latency reduction in TLS 1.3, session resumption, and HTTP/2 or HTTP/3 protocol multiplexing.",
    whyThisQuestion: "Validates modern network protocol fluency and dispels outdated myths about cryptographic overhead.",
    timeTargetMin: 75,
    timeTargetMax: 105,
    expectedConcepts: [
      "TLS 1.3 reduced handshake latency to 1-RTT (one round trip) by combining key share and cipher suite negotiation in ClientHello",
      "Diffie-Hellman key exchange establishes a shared ephemeral session key for fast symmetric encryption (AES-GCM or ChaCha20)",
      "Server presents a digital certificate verified against trusted root Certificate Authorities (PKI)",
      "Modern hardware features dedicated AES-NI CPU instructions making cryptographic computation negligible",
      "HTTPS enables HTTP/2 and HTTP/3 which use multiplexing and header compression, often outperforming plaintext HTTP/1.1"
    ],
    acceptableConcepts: [
      "0-RTT early data resumption with pre-shared keys",
      "Forward secrecy preventing historical decryption if server key is compromised",
      "QUIC / UDP transport layer in HTTP/3"
    ],
    commonMistakes: [
      "Claiming HTTPS encrypts data continuously with RSA asymmetric keys throughout the entire session",
      "Stating plaintext HTTP is always faster under modern web workloads without considering HTTP/2 multiplexing",
      "Confusing TCP 3-way handshake with the TLS cryptographic negotiation"
    ],
    referenceAnswer: "In TLS 1.3, the client sends a ClientHello containing supported cipher suites and a Diffie-Hellman key share in a single round trip (1-RTT). The server responds with its key share, digital certificate, and finishes authentication. They derive an ephemeral symmetric encryption key (like AES-GCM) with perfect forward secrecy. Modern CPU AES-NI instructions make symmetric encryption computationally negligible, while HTTPS enables HTTP/2 and HTTP/3 multiplexing, which often loads modern multi-asset applications faster than unencrypted HTTP/1.1.",
    followUpTemplates: [
      "What security risks arise with TLS 1.3 0-RTT early data (replay attacks), and how are they mitigated?",
      "How does Mutual TLS (mTLS) differ from standard one-way TLS in microservice architectures?"
    ],
    hints: [
      "Separate the asymmetric handshake from the symmetric session encryption.",
      "Think about HTTP/2 and HTTP/3 multiplexing versus HTTP/1.1 head-of-line blocking."
    ],
    rubric: {
      structure: 25,
      relevance: 25,
      clarity: 25,
      delivery: 15,
      evidence: 10,
      methodology: "TECHNICAL_DESIGN"
    }
  },
  {
    category: "Technical Fundamentals",
    subCategory: "Operating Systems & Concurrency",
    role: "Software Engineer",
    roles: ["Software Engineer", "Backend Developer", "DevOps Engineer"],
    interviewTypes: ["Technical"],
    difficulty: "Advanced",
    tags: ["os", "concurrency", "threads", "deadlock", "memory"],
    skills: ["Operating Systems", "Concurrency", "Multithreading"],
    question: "What are the four necessary conditions for a deadlock to occur, and how do modern systems prevent or recover from them?",
    criteria: "Accurately names Coffman conditions (Mutual exclusion, Hold and wait, No preemption, Circular wait) and presents practical prevention/detection strategies.",
    whyThisQuestion: "Tests concurrency theory and the candidate's ability to reason about shared resource contention.",
    timeTargetMin: 60,
    timeTargetMax: 90,
    expectedConcepts: [
      "Mutual Exclusion: at least one resource must be held in a non-shareable mode",
      "Hold and Wait: a process holding resources is actively requesting additional resources",
      "No Preemption: resources cannot be forcibly taken from a process holding them",
      "Circular Wait: a closed chain of processes exists where each process holds resources needed by the next",
      "Prevention by breaking any one condition (e.g. strict resource ordering to eliminate circular wait, timeouts, lock preemption)"
    ],
    acceptableConcepts: [
      "Banker's Algorithm for safe state allocation",
      "Lock hierarchy and ordered acquisition protocols",
      "Deadlock detection via directed Wait-For Graphs and cycle detection"
    ],
    commonMistakes: [
      "Confusing deadlock with livelock or thread starvation",
      "Believing adding more locks or threads resolves deadlocks",
      "Failing to articulate how strict resource ordering breaks circular wait"
    ],
    referenceAnswer: "Deadlock requires all four Coffman conditions simultaneously: mutual exclusion, hold and wait, no preemption, and circular wait. In production engineering, the most reliable prevention strategy is enforcing strict resource ordering—ensuring every service or thread acquires locks in the exact same global sequence, which mathematically eliminates circular wait. Systems also employ lock timeouts, optimistic concurrency with retries, and wait-for graph cycle detection to abort and roll back deadlocked transactions.",
    followUpTemplates: [
      "How does a distributed lock in Redis (Redlock) handle network partitions or process pauses?",
      "What is the difference between deadlock and livelock, and how does exponential backoff address livelock?"
    ],
    hints: [
      "Recall the four Coffman conditions.",
      "Think about lock acquisition ordering or lock timeouts as practical engineering remedies."
    ],
    rubric: {
      structure: 30,
      relevance: 25,
      clarity: 25,
      delivery: 10,
      evidence: 10,
      methodology: "TECHNICAL_DESIGN"
    }
  },

  // ==========================================
  // 2. SYSTEM DESIGN (SCALE, RELIABILITY, ARCHITECTURE)
  // ==========================================
  {
    category: "System Design",
    subCategory: "Distributed Architecture",
    role: "Backend Developer",
    roles: ["Backend Developer", "Full Stack Developer", "Software Engineer"],
    interviewTypes: ["System Design", "Technical"],
    difficulty: "Advanced",
    tags: ["system-design", "url-shortener", "base62", "redis", "scalability"],
    skills: ["System Design", "Distributed Systems", "API Design", "Caching"],
    question: "How would you design a scalable URL shortener like TinyURL that handles 100 million writes and 1 billion reads per month?",
    criteria: "Covers functional/non-functional requirements, unique ID generation (Snowflake or pre-allocated ranges), Base62 encoding, caching with Redis, 301 vs 302 redirects, and database sharding.",
    whyThisQuestion: "Standard baseline system design question testing end-to-end architecture, capacity estimation, and trade-off articulation.",
    timeTargetMin: 90,
    timeTargetMax: 150,
    expectedConcepts: [
      "Unique ID generation using 64-bit distributed counters (Twitter Snowflake or ZooKeeper token ranges)",
      "Base62 encoding (a-z, A-Z, 0-9) converting numeric 64-bit IDs into concise 7-character tokens",
      "Read-heavy caching strategy using Redis cluster storing top 20% most accessed URLs (80/20 rule)",
      "Database schema with primary key index on short token and target URL, partitioned by hash of short token",
      "HTTP 301 Permanent Redirect (efficient browser cache) vs HTTP 302 Temporary Redirect (allows server-side click analytics)"
    ],
    acceptableConcepts: [
      "Bloom filters to eliminate unnecessary database lookups for nonexistent tokens",
      "Rate limiting per API key or client IP using Token Bucket algorithm",
      "Active-active multi-region replication with asynchronous replica read replicas"
    ],
    commonMistakes: [
      "Generating short URLs by hashing the long URL with MD5/SHA256 and taking first 6 chars without handling hash collisions",
      "Overlooking the distinction between 301 and 302 redirect tracking implications",
      "Failing to size cache memory based on read traffic estimates"
    ],
    referenceAnswer: "I design TinyURL with an API gateway, stateless application workers, a distributed ID generator (Snowflake or token-range DB), a Redis cache cluster, and a sharded NoSQL or PostgreSQL store. When writing, workers generate an auto-incrementing 64-bit integer, encode it to Base62 (yielding a 7-character string supporting 3.5 trillion URLs), and persist the mapping. On reads, workers check Redis first; on cache miss, they fetch from DB and backfill the cache. I use HTTP 302 redirects to ensure every click reaches our servers for analytics logging.",
    followUpTemplates: [
      "What happens if your Redis cache cluster crashes entirely under peak traffic?",
      "How would you handle URL expiration and automated cleanup without blocking live queries?"
    ],
    hints: [
      "Establish functional requirements, then estimate read/write throughput.",
      "Discuss how you generate unique 7-character codes without collision bottlenecks.",
      "Contrast 301 permanent redirect vs 302 temporary redirect."
    ],
    rubric: {
      structure: 25,
      relevance: 25,
      clarity: 20,
      delivery: 15,
      evidence: 15,
      methodology: "TECHNICAL_DESIGN"
    }
  },
  {
    category: "System Design",
    subCategory: "Rate Limiting",
    role: "Backend Developer",
    roles: ["Backend Developer", "DevOps Engineer", "Software Engineer"],
    interviewTypes: ["System Design", "Technical"],
    difficulty: "Advanced",
    tags: ["rate-limiting", "token-bucket", "redis", "distributed-systems", "api-gateway"],
    skills: ["System Design", "Rate Limiting", "Redis", "Resilience"],
    question: "How would you design a distributed rate limiter for a public API handling 50,000 requests per second?",
    criteria: "Compares algorithms (Token Bucket, Leaky Bucket, Sliding Window Log, Sliding Window Counter), explains distributed state with Redis and Lua scripts, and addresses race conditions.",
    whyThisQuestion: "Evaluates concurrency handling, atomicity in distributed stores, and defense against abusive traffic.",
    timeTargetMin: 90,
    timeTargetMax: 120,
    expectedConcepts: [
      "Selection of Token Bucket or Sliding Window Counter algorithm balancing accuracy and memory footprint",
      "Centralized distributed storage using Redis cluster partitioned by client identifier (API key or IP)",
      "Atomic execution using Redis Lua scripts or MULTI/EXEC to prevent read-modify-write race conditions",
      "Standard HTTP 429 Too Many Requests response headers (Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining)",
      "Fail-open vs fail-close resilience strategy if rate-limiting infrastructure experiences degraded connectivity"
    ],
    acceptableConcepts: [
      "Local in-memory token buffering on API gateway instances with periodic background synchronization",
      "Graceful degradation and tiered rate limits for authenticated vs unauthenticated traffic",
      "Handling clock drift across multi-node servers"
    ],
    commonMistakes: [
      "Using simple GET and SET operations in Redis, creating concurrency race conditions under high traffic",
      "Proposing Sliding Window Log without realizing memory overhead balloons with 50,000 requests/second",
      "Failing to define client response headers when requests are throttled"
    ],
    referenceAnswer: "I implement an API gateway rate limiter using the Sliding Window Counter algorithm backed by Redis. To avoid race conditions, token evaluation and increment operations execute atomically inside Redis via a single Lua script. Keys are hashed by client API key or IP. When limits are exceeded, the gateway immediately returns HTTP 429 with Retry-After and X-RateLimit headers. In the event of a total Redis outage, the gateway is configured to fail open with alert triggering to prevent taking down valid user traffic.",
    followUpTemplates: [
      "How would you optimize this if Redis network round-trips add too much latency to incoming API requests?",
      "How do you protect against distributed denial-of-service (DDoS) where attackers rotate IPs across thousands of nodes?"
    ],
    hints: [
      "Compare Token Bucket vs Sliding Window Counter.",
      "Explain how you prevent race conditions when hundreds of requests arrive at the same millisecond."
    ],
    rubric: {
      structure: 25,
      relevance: 25,
      clarity: 25,
      delivery: 15,
      evidence: 10,
      methodology: "TECHNICAL_DESIGN"
    }
  },
  {
    category: "System Design",
    subCategory: "Streaming & Messaging",
    role: "Data Engineer",
    roles: ["Data Engineer", "Backend Developer", "Software Engineer"],
    interviewTypes: ["System Design", "Technical"],
    difficulty: "Expert",
    tags: ["kafka", "event-streaming", "partitioning", "message-queue", "distributed-systems"],
    skills: ["Apache Kafka", "Event-Driven Architecture", "Distributed Systems"],
    question: "How does Apache Kafka achieve high throughput and fault tolerance, and how do consumer groups guarantee order?",
    criteria: "Covers sequential append-only log, page cache utilization, zero-copy OS transfers, partition-level ordering, and consumer rebalancing.",
    whyThisQuestion: "Tests distributed event stream architecture, disk I/O optimization, and horizontal scaling mechanics.",
    timeTargetMin: 90,
    timeTargetMax: 135,
    expectedConcepts: [
      "Append-only sequential commit log avoiding random disk seek latency",
      "Zero-copy network transfer using OS sendfile syscall bypassing user-space buffer copying",
      "OS kernel PageCache utilization rather than JVM heap management to prevent GC pauses",
      "Partitioning: messages with the same partition key are strictly ordered within that partition",
      "Consumer groups: each partition in a topic is consumed by exactly one consumer within a group at any given time"
    ],
    acceptableConcepts: [
      "ISR (In-Sync Replicas) quorum commit mechanics and acks=all semantics",
      "Consumer offset management stored in internal __consumer_offsets topic",
      "Rebalance protocol: Eager vs Cooperative Sticky Rebalance"
    ],
    commonMistakes: [
      "Believing Kafka guarantees global message ordering across an entire topic with multiple partitions",
      "Thinking multiple consumers from the same consumer group can read the same partition in parallel",
      "Assuming Kafka stores all messages in JVM RAM rather than disk-backed sequential logs"
    ],
    referenceAnswer: "Kafka achieves immense throughput by treating topics as append-only disk logs, turning random disk I/O into fast sequential writes. It relies heavily on OS PageCache and leverages Linux zero-copy (sendfile) to transfer data directly from page cache to socket buffers without JVM memory overhead. Ordering is strictly guaranteed per partition, not across the whole topic. Consumer groups assign each partition to exactly one consumer instance, allowing parallel consumption across partitions while preserving message order within each partition.",
    followUpTemplates: [
      "What happens during consumer rebalancing, and how does Cooperative Sticky Rebalance reduce stop-the-world pauses?",
      "How do you achieve exactly-once processing (EOS) semantics across a read-process-write pipeline?"
    ],
    hints: [
      "Explain the sequential write benefit and zero-copy transfer.",
      "Clarify that order is maintained per partition, not globally across the entire topic."
    ],
    rubric: {
      structure: 25,
      relevance: 25,
      clarity: 25,
      delivery: 15,
      evidence: 10,
      methodology: "TECHNICAL_DESIGN"
    }
  },

  // ==========================================
  // 3. FRONTEND DEVELOPER ARCHITECTURE
  // ==========================================
  {
    category: "Technical Fundamentals",
    subCategory: "React Internals",
    role: "Frontend Developer",
    roles: ["Frontend Developer", "Full Stack Developer", "Software Engineer"],
    interviewTypes: ["Technical"],
    difficulty: "Advanced",
    tags: ["react", "fiber", "reconciliation", "rendering-performance", "virtual-dom"],
    skills: ["React.js", "Frontend Performance", "Virtual DOM"],
    question: "How does React Fiber reconciliation work, and how does it prevent long-running tasks from freezing the browser UI?",
    criteria: "Contrasts the old Stack reconciler with the Fiber architecture, explains cooperative scheduling, requestIdleCallback/MessageChannel, work units, and the two-phase commit model.",
    whyThisQuestion: "Determines whether the frontend engineer understands React runtime scheduling and user perceptual performance.",
    timeTargetMin: 75,
    timeTargetMax: 105,
    expectedConcepts: [
      "Old Stack reconciler executed recursive tree diffing synchronously, blocking the main thread on deep component trees",
      "Fiber represents component nodes as linked list units of work with return, sibling, and child pointers",
      "Fiber enables time-slicing: breaking work into chunks and yielding control back to the browser between frames (16.6ms budget)",
      "Two-phase lifecycle: Render/Reconciliation phase (asynchronous, interruptible, priority-based) and Commit phase (synchronous DOM mutations)"
    ],
    acceptableConcepts: [
      "Concurrent Mode and transitions (useTransition, useDeferredValue)",
      "Lane-based priority model replacing expiration times",
      "MessageChannel polyfill for scheduling micro/macro frame yields"
    ],
    commonMistakes: [
      "Assuming the Virtual DOM is faster than direct native DOM manipulation in all simple scenarios",
      "Thinking the Commit phase can be paused or interrupted midway",
      "Believing React Fiber is a multi-threaded web worker architecture"
    ],
    referenceAnswer: "Prior to Fiber, React's Stack reconciler used synchronous recursive diffing, which could block the main JavaScript thread on complex updates. Fiber rebuilt reconciliation as a linked-list work tree. This enables time-slicing: React processes units of work and yields to the browser event loop using a scheduler to keep frames responsive at 60fps. Updates execute in two phases: an interruptible render phase where virtual changes are calculated by priority, followed by a synchronous, uninterruptible commit phase that applies mutations to the real DOM.",
    followUpTemplates: [
      "How do useMemo and useCallback interact with Fiber work, and when can premature memoization hurt performance?",
      "How does React 18's useTransition prioritize user keystrokes over heavy list filtering?"
    ],
    hints: [
      "Contrast synchronous recursion (Stack) with linked list work units (Fiber).",
      "Explain the two phases: interruptible Render phase vs atomic Commit phase."
    ],
    rubric: {
      structure: 25,
      relevance: 25,
      clarity: 25,
      delivery: 15,
      evidence: 10,
      methodology: "TECHNICAL_DESIGN"
    }
  },
  {
    category: "Technical Fundamentals",
    subCategory: "Frontend Performance & Web Vitals",
    role: "Frontend Developer",
    roles: ["Frontend Developer", "Full Stack Developer", "Product Engineer"],
    interviewTypes: ["Technical", "Product"],
    difficulty: "Intermediate",
    tags: ["web-vitals", "lcp", "cls", "inp", "frontend-performance"],
    skills: ["Core Web Vitals", "Performance Optimization", "Web Architecture"],
    question: "Explain the three Core Web Vitals (LCP, INP, CLS) and how you diagnose and resolve poor scores on a production web app.",
    criteria: "Defines Largest Contentful Paint, Interaction to Next Paint, Cumulative Layout Shift, and provides specific engineering remediations for each.",
    whyThisQuestion: "Validates practical experience shipping fast, stable consumer web applications measured by modern standards.",
    timeTargetMin: 75,
    timeTargetMax: 105,
    expectedConcepts: [
      "LCP (Largest Contentful Paint) measures perceptual loading speed; optimized via image preloading, CDN caching, SSR/SSG, and eliminating render-blocking CSS/JS",
      "INP (Interaction to Next Paint) measures overall UI responsiveness to clicks/taps; improved by breaking long tasks, yield points, and deferring non-urgent work",
      "CLS (Cumulative Layout Shift) measures visual stability; eliminated by setting explicit width/height aspect ratios on images/embeds and avoiding layout injection above the fold"
    ],
    acceptableConcepts: [
      "PerformanceObserver API for in-field real user monitoring (RUM)",
      "Font display swap causing layout shifts (FOIT/FOUT)",
      "Critical rendering path optimization"
    ],
    commonMistakes: [
      "Referencing First Input Delay (FID) as the primary responsiveness metric instead of the current Interaction to Next Paint (INP)",
      "Believing gzip compression alone fixes LCP without addressing server response time or asset dimensions",
      "Overlooking missing aspect-ratio CSS tags as the primary root cause of CLS"
    ],
    referenceAnswer: "Core Web Vitals measure user experience across loading, interactivity, and visual stability. LCP measures when the main hero asset renders; I optimize it with CDN asset hosting, image preloading, and reducing render-blocking JavaScript. INP replaced FID to measure end-to-end responsiveness across all user clicks; I resolve high INP by breaking long tasks with scheduler yields and web workers. CLS tracks sudden visual jumps; I fix it by declaring explicit width and height dimensions on all media and avoiding dynamic DOM insertions above existing content.",
    followUpTemplates: [
      "How do font loading strategies (font-display: optional vs swap) affect both LCP and CLS?",
      "How would you set up Real User Monitoring (RUM) in production to capture telemetry on low-end mobile devices?"
    ],
    hints: [
      "Break down each of the three metrics: LCP (loading), INP (interaction responsiveness), CLS (visual stability).",
      "Provide concrete technical fixes for each."
    ],
    rubric: {
      structure: 25,
      relevance: 30,
      clarity: 25,
      delivery: 10,
      evidence: 10,
      methodology: "TECHNICAL_DESIGN"
    }
  },

  // ==========================================
  // 4. BACKEND & FULL STACK DEVELOPER
  // ==========================================
  {
    category: "Technical Fundamentals",
    subCategory: "Authentication & Security",
    role: "Full Stack Developer",
    roles: ["Full Stack Developer", "Backend Developer", "Software Engineer"],
    interviewTypes: ["Technical", "System Design"],
    difficulty: "Advanced",
    tags: ["auth", "jwt", "cookies", "security", "csrf", "xss"],
    skills: ["Authentication Architecture", "Web Security", "Session Management"],
    question: "Compare JSON Web Tokens (JWT) in localStorage versus HttpOnly SameSite cookies for session management. What are the security trade-offs?",
    criteria: "Exposes XSS vulnerability of localStorage, CSRF vulnerability of cookies with mitigations (SameSite, Anti-CSRF tokens), revocation challenges of stateless JWTs, and token refresh strategies.",
    whyThisQuestion: "Evaluates security architecture maturity and whether the engineer can defend user sessions against realistic web threats.",
    timeTargetMin: 75,
    timeTargetMax: 105,
    expectedConcepts: [
      "localStorage is accessible to any JavaScript running on the origin, making JWTs immediately extractable via Cross-Site Scripting (XSS)",
      "HttpOnly cookies cannot be read by JavaScript, completely neutralizing direct credential theft via XSS",
      "Cookies are automatically sent by browsers on cross-origin requests, requiring SameSite=Lax/Strict and CSRF tokens to prevent Cross-Site Request Forgery",
      "Stateless JWTs cannot be instantly revoked before expiration without maintaining a server-side blacklist",
      "Recommended architecture: short-lived access tokens paired with HttpOnly refresh tokens or server-backed session stores"
    ],
    acceptableConcepts: [
      "Token rotation and refresh token reuse detection",
      "Content Security Policy (CSP) mitigating XSS injection vectors",
      "Distributed cache session verification (Redis session store)"
    ],
    commonMistakes: [
      "Believing storing JWTs in localStorage is secure if the payload is encrypted",
      "Claiming cookies are completely immune to vulnerabilities without addressing CSRF",
      "Stating stateless JWTs are universally superior to stateful sessions without addressing immediate revocation"
    ],
    referenceAnswer: "Storing JWTs in localStorage exposes tokens to immediate extraction by any malicious script injected via an XSS flaw. In contrast, HttpOnly cookies prevent JavaScript access, eliminating token theft via XSS. However, cookies are susceptible to Cross-Site Request Forgery (CSRF), which must be mitigated using SameSite=Lax or Strict flags along with CSRF tokens. Additionally, pure stateless JWTs cannot be immediately revoked if compromised. The most resilient pattern is an HttpOnly, Secure, SameSite refresh cookie paired with short-lived memory access tokens.",
    followUpTemplates: [
      "How do you implement immediate token revocation across distributed servers when a user clicks 'Log out of all devices'?",
      "How does OAuth2 PKCE (Proof Key for Code Exchange) safeguard single-page applications against authorization code interception?"
    ],
    hints: [
      "Focus on XSS exposure for localStorage versus CSRF exposure for cookies.",
      "Consider how each approach handles immediate token revocation."
    ],
    rubric: {
      structure: 25,
      relevance: 30,
      clarity: 25,
      delivery: 10,
      evidence: 10,
      methodology: "TECHNICAL_DESIGN"
    }
  },

  // ==========================================
  // 5. DATA ENGINEER (PIPELINES, DATA WAREHOUSE, STREAMING)
  // ==========================================
  {
    category: "Technical Fundamentals",
    subCategory: "ETL vs ELT Architecture",
    role: "Data Engineer",
    roles: ["Data Engineer", "Backend Developer", "Software Engineer"],
    interviewTypes: ["Technical", "System Design"],
    difficulty: "Intermediate",
    tags: ["data-engineering", "etl", "elt", "bigquery", "snowflake", "data-warehouse"],
    skills: ["Data Pipelines", "Data Warehousing", "Distributed Query Processing"],
    question: "What is the difference between ETL and ELT, and why has cloud data warehousing driven the shift toward ELT?",
    criteria: "Differentiates compute transformation placement (dedicated pipeline cluster vs warehouse query engine), data lakes, modern MPP cloud data warehouses (BigQuery/Snowflake), and schema-on-read vs schema-on-write.",
    whyThisQuestion: "Validates knowledge of modern data stack evolution and distributed MPP analytical processing.",
    timeTargetMin: 60,
    timeTargetMax: 90,
    expectedConcepts: [
      "ETL transforms data on a separate processing server before loading into the destination storage, bound by schema-on-write",
      "ELT extracts raw data and loads directly into scalable cloud object storage or staging tables, transforming data inside the warehouse using SQL",
      "Modern cloud data warehouses (Snowflake, BigQuery) decouple compute from storage and scale massively in parallel (MPP)",
      "ELT preserves raw historical source data, allowing idempotent transformations and retrospective analysis without re-ingesting",
      "Tooling like dbt empowers analysts to define modular, version-controlled transformations natively in SQL"
    ],
    acceptableConcepts: [
      "Data privacy/compliance where PII must be masked before loading into storage (reverse ETL / hybrid)",
      "Cost considerations: warehouse compute credits vs dedicated Spark cluster compute",
      "Medallion architecture: Bronze (raw), Silver (cleaned), Gold (aggregated)"
    ],
    commonMistakes: [
      "Claiming ETL is strictly obsolete without recognizing compliance and edge preprocessing use cases",
      "Failing to mention the separation of storage and compute that enabled scalable ELT",
      "Confusing transaction OLTP databases with analytical OLAP data warehouses"
    ],
    referenceAnswer: "In traditional ETL, data is transformed by an intermediate processing cluster before being loaded into a rigid database schema. In modern ELT, raw data is loaded directly into scalable cloud storage or warehouse staging tables, with transformations executed natively inside the data warehouse using tools like dbt. This shift is driven by cloud data warehouses (BigQuery, Snowflake) that decouple compute from storage and scale MPP queries cost-effectively, preserving immutable raw data for retrospective analysis.",
    followUpTemplates: [
      "How do you handle schema drift or unexpected breaking column changes in an automated ELT pipeline?",
      "Under what security or compliance circumstances would you be forced to revert to an ETL model to mask PII?"
    ],
    hints: [
      "Where does the transformation compute happen in each approach?",
      "Mention the separation of compute and storage in modern cloud warehouses."
    ],
    rubric: {
      structure: 25,
      relevance: 30,
      clarity: 25,
      delivery: 10,
      evidence: 10,
      methodology: "TECHNICAL_DESIGN"
    }
  },

  // ==========================================
  // 6. DEVOPS ENGINEER (CONTAINERS, K8S, CI/CD, CLOUD)
  // ==========================================
  {
    category: "Technical Fundamentals",
    subCategory: "Container Orchestration",
    role: "DevOps Engineer",
    roles: ["DevOps Engineer", "Backend Developer", "Software Engineer"],
    interviewTypes: ["Technical", "System Design"],
    difficulty: "Advanced",
    tags: ["devops", "kubernetes", "containers", "deployment", "zero-downtime"],
    skills: ["Kubernetes", "Container Orchestration", "CI/CD Deployment"],
    question: "How do Kubernetes Readiness and Liveness Probes differ, and how do you ensure zero-downtime rolling deployments without dropped traffic?",
    criteria: "Differentiates traffic routing (Readiness) from container restarts (Liveness), explains rolling update strategy, preStop lifecycle hooks, and connection draining.",
    whyThisQuestion: "Tests production deployment reliability, graceful shutdown mechanics, and container orchestration safety.",
    timeTargetMin: 75,
    timeTargetMax: 105,
    expectedConcepts: [
      "Liveness probes detect container deadlocks and trigger kubelet pod restarts when unresponsive",
      "Readiness probes determine when a pod is ready to accept traffic; failure temporarily removes the pod IP from the Service endpoints without restarting it",
      "During rolling updates, maxSurge and maxUnavailable configure incremental pod substitution",
      "Graceful termination requires a preStop hook and handling SIGTERM in the application to drain in-flight HTTP connections before SIGKILL",
      "Without readiness delays or preStop sleeping, ingress controllers may route traffic to terminating pods, causing 502 Bad Gateway errors"
    ],
    acceptableConcepts: [
      "Startup probes preventing aggressive liveness kills on slow-starting containers",
      "PodDisruptionBudgets (PDB) safeguarding minimum availability during cluster upgrades",
      "Service mesh (Istio/Linkerd) traffic shifting and circuit breaking"
    ],
    commonMistakes: [
      "Using identical health endpoints for both Liveness and Readiness probes, causing cascading pod restart loops when downstream DB is down",
      "Assuming Kubernetes automatically waits for existing HTTP requests to complete without configuring SIGTERM handling or preStop hooks",
      "Setting zero initialDelaySeconds causing immediate crash loops"
    ],
    referenceAnswer: "A Liveness probe detects fatal deadlocks and commands the kubelet to restart the container. A Readiness probe checks if the pod is prepared to serve traffic; if it fails, the pod is removed from Service endpoint routing without being killed. For zero-downtime rolling updates, I configure maxSurge=25% and maxUnavailable=0, ensure readiness checks only succeed after dependencies connect, and implement a preStop hook with SIGTERM handling so the pod completes in-flight requests while kube-proxy updates endpoint tables.",
    followUpTemplates: [
      "Why is it dangerous for a liveness probe to check an external dependency like a database?",
      "How does Blue-Green deployment differ from Canary deployment in risk profile and infrastructure cost?"
    ],
    hints: [
      "Readiness determines whether traffic is routed; Liveness determines whether the container is killed.",
      "Describe how in-flight requests are drained during pod termination."
    ],
    rubric: {
      structure: 25,
      relevance: 25,
      clarity: 25,
      delivery: 15,
      evidence: 10,
      methodology: "TECHNICAL_DESIGN"
    }
  },

  // ==========================================
  // 7. BEHAVIORAL RESILIENCE & OWNERSHIP (STAR)
  // ==========================================
  {
    category: "Behavioral Resilience",
    subCategory: "Ownership & Production Incident",
    role: "Software Engineer",
    roles: ["Software Engineer", "Backend Developer", "Frontend Developer", "Full Stack Developer", "Data Engineer", "DevOps Engineer", "Product Engineer"],
    interviewTypes: ["Behavioral", "Problem Solving"],
    difficulty: "Intermediate",
    tags: ["behavioral", "star", "incident", "ownership", "postmortem"],
    skills: ["Incident Management", "Accountability", "Communication", "Blameless Postmortem"],
    question: "Tell me about a time you introduced a critical bug or production incident. How did you handle mitigation and post-mortem communication?",
    criteria: "Demonstrates psychological safety, immediate accountability, structured mitigation over finger-pointing, blameless post-mortem analysis, and automated preventive measures.",
    whyThisQuestion: "Evaluates intellectual honesty, crisis composure, and the capacity to convert failure into systemic engineering improvements.",
    timeTargetMin: 75,
    timeTargetMax: 120,
    expectedConcepts: [
      "Situation & Task: Clearly describes the production context and the direct impact of the bug (e.g. error rate, downtime, affected users)",
      "Action: Immediate transparent ownership, rolling back or hotfixing to restore user stability before deep debugging",
      "Communication: Kept stakeholders informed with objective status updates throughout mitigation",
      "Result & Learning: Conducted a blameless post-mortem identifying systemic root causes (missing CI automated test, lack of canary deployment)",
      "Long-term fix: Implemented preventative safeguards so the specific class of failure cannot recur"
    ],
    acceptableConcepts: [
      "Feature flag kill switch utilization",
      "Automated canary rollback trigger",
      "Runbook documentation updates"
    ],
    commonMistakes: [
      "Claiming never to have caused a production bug (indicates lack of real experience or dishonesty)",
      "Deflecting blame onto QA, colleagues, or ambiguous product requirements",
      "Failing to articulate what automated or procedural safeguards were permanently put in place"
    ],
    referenceAnswer: "Early in my career, I deployed an unindexed database migration that caused connection pool exhaustion and a 12-minute API outage. I immediately notified our incident channel, assumed ownership, and executed a fast rollback to restore service. In our blameless post-mortem, I demonstrated how the query behaved on empty test data vs production volume. To ensure it couldn't recur, I added automated query execution plan analysis to our CI pipeline and established a requirement that all migration scripts run against production-sized staging replicas.",
    followUpTemplates: [
      "How did you rebuild trust with executive stakeholders or team members who were affected by the outage?",
      "If a similar issue happened during an off-hours on-call shift, how would your incident escalation procedure change?"
    ],
    hints: [
      "Follow the STAR methodology (Situation, Task, Action, Result).",
      "Emphasize transparency, fast remediation, and the systemic prevention implemented."
    ],
    rubric: {
      structure: 30,
      relevance: 25,
      clarity: 20,
      delivery: 15,
      evidence: 10,
      methodology: "STAR"
    }
  },
  {
    category: "Behavioral Resilience",
    subCategory: "Technical Disagreement & Influence",
    role: "Product Engineer",
    roles: ["Product Engineer", "Software Engineer", "Backend Developer", "Frontend Developer", "Executive Leadership"],
    interviewTypes: ["Behavioral", "Leadership"],
    difficulty: "Advanced",
    tags: ["behavioral", "star", "conflict-resolution", "consensus", "influence"],
    skills: ["Conflict Resolution", "Technical Trade-offs", "Cross-Functional Collaboration"],
    question: "Describe a situation where you had a strong technical disagreement with a team member or architect. How did you resolve it?",
    criteria: "Demonstrates empirical decision-making over ego, active listening, respectful framing, testing assumptions through prototypes or data, and committing once a decision was made.",
    whyThisQuestion: "Evaluates emotional intelligence, constructive debate, and commitment to collective team outcomes.",
    timeTargetMin: 75,
    timeTargetMax: 120,
    expectedConcepts: [
      "Situation: Specific architectural or technical fork with legitimate arguments on both sides",
      "Task: The objective necessity of reaching a high-confidence consensus without lingering friction",
      "Action: Grounded the debate in data, benchmarks, or rapid proof-of-concept prototypes rather than opinion",
      "Action: Listened actively to understand the other engineer's underlying operational or maintenance concerns",
      "Result: Achieved mutual alignment or successfully practiced 'disagree and commit' with wholehearted execution"
    ],
    acceptableConcepts: [
      "RFC (Request for Comments) documentation process",
      "Inviting neutral senior engineer arbitration",
      "Pre-mortem risk assessment exercise"
    ],
    commonMistakes: [
      "Framing the story as 'I was completely right and they were completely wrong'",
      "Describing unresolved hostility or escalating unilaterally to management",
      "Focusing purely on personal emotion rather than business or technical trade-offs"
    ],
    referenceAnswer: "When redesigning our notification service, an architect wanted a custom in-memory queue while I advocated for Amazon SQS. Rather than debating theoretically, I built a 1-day benchmark comparing operational maintenance, dead-letter queue resilience, and delivery guarantees under simulated network failures. The data showed that while the in-memory queue offered slightly lower latency, SQS prevented catastrophic message loss during pod crashes. We reviewed the findings together, and my colleague agreed SQS aligned with our reliability SLA.",
    followUpTemplates: [
      "What would you have done if the team decided against your proposal despite your benchmark data?",
      "How do you distinguish between a technical trade-off worth debating vs bike-shedding on trivial preferences?"
    ],
    hints: [
      "Show how you brought empirical evidence or prototyping into the conversation.",
      "Highlight respect for the other perspective and commitment to the final decision."
    ],
    rubric: {
      structure: 30,
      relevance: 25,
      clarity: 20,
      delivery: 15,
      evidence: 10,
      methodology: "STAR"
    }
  },

  // ==========================================
  // 8. PROJECT DISCUSSION & DEEP DIVE
  // ==========================================
  {
    category: "Project Discussion",
    subCategory: "Architecture & Trade-offs",
    role: "Full Stack Developer",
    roles: ["Full Stack Developer", "Software Engineer", "Backend Developer", "Frontend Developer", "Data Engineer"],
    interviewTypes: ["Project", "Technical"],
    difficulty: "Intermediate",
    tags: ["project", "architecture", "trade-offs", "engineering-decisions"],
    skills: ["System Architecture", "Trade-Off Analysis", "Technical Articulation"],
    question: "Walk me through the architecture of your most critical full-stack project. What were the key trade-offs you evaluated, and what would you change today?",
    criteria: "Presents clear modular breakdown, articulates concrete technical trade-offs, highlights personal contributions, and exhibits reflective engineering maturity.",
    whyThisQuestion: "Reveals genuine ownership, ability to communicate complex systems simply, and continuous learning from past decisions.",
    timeTargetMin: 90,
    timeTargetMax: 150,
    expectedConcepts: [
      "System Overview: Concise high-level summary of the business problem, user scale, and tech stack components",
      "Architecture: Explains data flow from frontend client through API gateway, business logic services, and persistence layers",
      "Trade-offs: Explicitly compares alternatives (e.g. relational vs document store, monorepo vs microservices, client-side rendering vs SSR)",
      "Ownership: Identifies specific modules designed and built by the candidate personally",
      "Retrospective: Honest identification of technical debt or bottlenecks they would redesign with current knowledge"
    ],
    acceptableConcepts: [
      "Caching layers and cache invalidation strategies",
      "CI/CD pipeline and automated testing coverage",
      "Monitoring, logging, and observability instrumentation"
    ],
    commonMistakes: [
      "Describing only what the application does from a user perspective without explaining how the technical architecture works",
      "Using 'we' exclusively without clarifying personal individual contributions",
      "Claiming the project had zero trade-offs and was 100% flawless"
    ],
    referenceAnswer: "I architected an analytics dashboard processing 5 million daily events. The stack paired a React/TypeScript frontend with Node.js microservices and PostgreSQL. Our primary trade-off was choosing between PostgreSQL with TimescaleDB extensions versus ClickHouse. Given our team's existing relational fluency and budget constraints, TimescaleDB minimized operational complexity while meeting our sub-second query SLA. In hindsight, I would decouple analytical ingestion from transactional reporting earlier using an event broker like Kafka to prevent write spikes from impacting dashboard query latencies.",
    followUpTemplates: [
      "What was the most difficult unexpected production bottleneck you encountered after launching this system?",
      "How did you test this system before deploying to production to ensure data integrity?"
    ],
    hints: [
      "Structure your response: Problem Context → Architecture → Your Individual Role → Key Trade-offs → What you'd change.",
      "Quantify your metrics (users, requests, data size) where possible."
    ],
    rubric: {
      structure: 25,
      relevance: 25,
      clarity: 20,
      delivery: 15,
      evidence: 15,
      methodology: "TECHNICAL_DESIGN"
    }
  },

  // ==========================================
  // 9. HR / GENERAL & COMMUNICATION
  // ==========================================
  {
    category: "HR / General",
    subCategory: "Career Trajectory & Motivation",
    role: "Software Engineer",
    roles: ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Engineer", "DevOps Engineer", "Product Engineer", "Executive Leadership"],
    interviewTypes: ["HR", "Communication"],
    difficulty: "Easy",
    tags: ["hr", "self-introduction", "elevator-pitch", "career-story"],
    skills: ["Professional Communication", "Storytelling", "Career Vision"],
    question: "Tell me about yourself, your recent focus areas, and what excites you about the next phase of your engineering career.",
    criteria: "Concise chronological narrative (Present, Past, Future), highlights core technical strengths, demonstrates self-awareness, and maintains natural professional poise.",
    whyThisQuestion: "Sets the stage for the interview; evaluates concise storytelling and alignment with engineering roles.",
    timeTargetMin: 60,
    timeTargetMax: 90,
    expectedConcepts: [
      "Present: Current technical role, primary tech stack, and high-impact recent focus areas",
      "Past: Key formative experiences, major challenges tackled, and engineering progression",
      "Future: What motivates the candidate next (complex distributed problems, mentorship, architectural ownership), linking to the opportunity",
      "Concise pacing: Keeps summary within 60-90 seconds without reciting every line of a resume"
    ],
    acceptableConcepts: [
      "Open source contributions or passion engineering projects",
      "Cross-functional leadership or mentorship track record",
      "Domain specialization (fintech, developer tooling, cloud infrastructure)"
    ],
    commonMistakes: [
      "Reciting the entire resume line-by-line starting from high school",
      "Speaking for over 3 minutes without a clear narrative structure",
      "Focusing solely on personal life or hobbies without tying into engineering craft"
    ],
    referenceAnswer: "I'm a full-stack software engineer with five years of experience building scalable web applications and distributed backend services, primarily using TypeScript, Node.js, and PostgreSQL. Most recently at FinTrakr, I led the redesign of our ledger transaction engine, reducing latency by 45% while handling thousands of concurrent writes. Throughout my career, I've loved operating at the intersection of robust systems engineering and clean user experiences. Looking ahead, I'm excited to take on deeper architectural ownership solving high-throughput distributed systems challenges.",
    followUpTemplates: [
      "What is one technical skill or domain you are actively learning right now outside your daily work?",
      "What type of engineering culture or team environment brings out your highest performance?"
    ],
    hints: [
      "Use the Present → Past → Future formula.",
      "Aim for a concise 60 to 90 second elevator summary."
    ],
    rubric: {
      structure: 30,
      relevance: 25,
      clarity: 25,
      delivery: 10,
      evidence: 10,
      methodology: "GENERAL_COMMUNICATION"
    }
  },
  {
    category: "HR / General",
    subCategory: "Strengths & Constructive Feedback",
    role: "Software Engineer",
    roles: ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Engineer", "DevOps Engineer", "Product Engineer", "Executive Leadership"],
    interviewTypes: ["HR", "Behavioral"],
    difficulty: "Intermediate",
    tags: ["hr", "feedback", "growth-mindset", "self-awareness"],
    skills: ["Self-Awareness", "Receptivity to Critique", "Continuous Learning"],
    question: "What is an area of constructive feedback you have received from a manager or peer, and how have you actively worked to improve it?",
    criteria: "Genuine, non-cliché area of improvement, articulates concrete behavioral changes, and demonstrates an active growth mindset.",
    whyThisQuestion: "Evaluates self-awareness and whether candidate takes feedback constructively rather than defensively.",
    timeTargetMin: 60,
    timeTargetMax: 90,
    expectedConcepts: [
      "Identifies a genuine, realistic developmental area rather than a disguised humble-brag ('I work too hard')",
      "Context: Describes the scenario where the feedback was delivered objectively",
      "Action: Concrete habit changes, tools, or techniques adopted to address the feedback",
      "Measurable Growth: Shows evidence of improvement confirmed by peers or subsequent reviews"
    ],
    acceptableConcepts: [
      "Transition from individual contributor coding to delegating and mentoring",
      "Improving verbal communication during incident triage",
      "Balancing perfectionism against rapid product iteration deadlines"
    ],
    commonMistakes: [
      "Giving a cliché non-weakness such as 'I am too perfectionist' or 'I care too much'",
      "Claiming never to have received constructive feedback",
      "Describing a severe fundamental flaw without showing any active improvement"
    ],
    referenceAnswer: "Earlier in my career, my manager pointed out that I tended to dive into code immediately before thoroughly aligning on edge cases with cross-functional stakeholders, which occasionally led to scope rework late in sprints. I took that feedback seriously and adopted a lightweight RFC (Request for Comments) workflow. Now, for any non-trivial feature, I draft a one-page design covering user assumptions, data models, and edge cases, sharing it with product and design before writing code. This practice has reduced sprint rework by over 30% and improved our sprint velocity.",
    followUpTemplates: [
      "How do you typically deliver tough, constructive feedback to a teammate whose pull request isn't meeting engineering standards?",
      "How do you handle situations where you receive conflicting feedback from two different senior leaders?"
    ],
    hints: [
      "Choose a genuine, professional feedback theme.",
      "Focus 70% of your time on the concrete steps you implemented to grow."
    ],
    rubric: {
      structure: 25,
      relevance: 30,
      clarity: 25,
      delivery: 10,
      evidence: 10,
      methodology: "GENERAL_COMMUNICATION"
    }
  },

  // ==========================================
  // 10. EXECUTIVE LEADERSHIP
  // ==========================================
  {
    category: "Executive Leadership",
    subCategory: "Organizational Strategy",
    role: "Executive Leadership",
    roles: ["Executive Leadership", "Product Engineer"],
    interviewTypes: ["Leadership", "Behavioral"],
    difficulty: "Expert",
    tags: ["leadership", "strategy", "change-management", "executive-presence"],
    skills: ["Executive Strategy", "Organizational Leadership", "Crisis Communication"],
    question: "How do you lead and communicate a major technological or organizational pivot to an engineering organization experiencing change fatigue?",
    criteria: "Transparency, empathetic narrative clarity, acknowledgment of past contributions, clear milestone roadmaps, and alignment across engineering management tiers.",
    whyThisQuestion: "Tests executive presence, emotional intelligence, and ability to prevent cynicism during corporate pivots.",
    timeTargetMin: 90,
    timeTargetMax: 120,
    expectedConcepts: [
      "Transparent 'Why': Ground the pivot in undeniable business realities and user data rather than arbitrary top-down mandates",
      "Acknowledge & Honor: Validate the hard work invested in the previous direction to prevent team cynicism and demoralization",
      "Empower Middle Management: Align engineering managers and staff engineers first with private Q&A so they can lead locally",
      "Phased Milestones: Break the daunting pivot into bite-sized 30/60/90-day checkpoints with clear definition of done",
      "Continuous Feedback Loops: Establish office hours and anonymous feedback channels to catch operational friction early"
    ],
    acceptableConcepts: [
      "Sunset and migration strategy for legacy systems",
      "Retraining and upskilling opportunities for affected engineers",
      "Celebrating early small wins to build momentum"
    ],
    commonMistakes: [
      "Delivering a blunt mandate without explaining the strategic context or business necessity",
      "Dismissing prior engineering efforts as wasted time",
      "Failing to provide a clear transition roadmap or support for staff experiencing burnout"
    ],
    referenceAnswer: "When leading an organization through a pivot during change fatigue, I start by sharing the unvarnished business context with radical transparency—explaining why the current trajectory is unsustainable and how the new path secures our future. Crucially, I honor the prior effort: the old architecture wasn't a mistake; it got us here, but our operating constraints have evolved. I empower engineering leads first so they can support their teams with answers. Finally, I replace abstract visions with concrete 30-day milestones and host weekly open forums to listen, celebrate early wins, and alleviate anxiety.",
    followUpTemplates: [
      "How do you handle a high-performing senior engineer or manager who actively resists the new direction?",
      "How do you balance maintaining critical legacy revenue systems while shifting the majority of talent to the new initiative?"
    ],
    hints: [
      "Address both the rational business logic and the emotional human toll of change fatigue.",
      "Highlight how you enlist engineering leads and provide tangible short-term milestones."
    ],
    rubric: {
      structure: 30,
      relevance: 25,
      clarity: 20,
      delivery: 15,
      evidence: 10,
      methodology: "LEADERSHIP_ALIGNMENT"
    }
  }
];
