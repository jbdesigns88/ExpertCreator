export type TopicId =
  | "oauth"
  | "rag"
  | "node"
  | "typescript"
  | "postgres"
  | "webrtc"
  | "sockets"
  | "system";

export interface FocusArea {
  id: string;
  title: string;
  summary: string;
  resources: { title: string; url: string }[];
}

export interface QuizTemplate {
  id: string;
  focusId: string;
  question: string;
  options: string[];
  answerIndex: number;
  rationale: string;
  docLink: string;
}

export interface TopicConfig {
  id: TopicId;
  title: string;
  description: string;
  focusAreas: FocusArea[];
  quizBank: QuizTemplate[];
}

export const topics: TopicConfig[] = [
  {
    id: "oauth",
    title: "OAuth",
    description: "Modern delegated authorization flows and security considerations.",
    focusAreas: [
      {
        id: "authorization-code",
        title: "Authorization Code Flow",
        summary: "Deep dive into RFC 6749 authorization code exchange and PKCE.",
        resources: [
          { title: "RFC 6749 Section 4.1", url: "https://www.rfc-editor.org/rfc/rfc6749#section-4.1" },
          { title: "oauth.net Guide", url: "https://oauth.net/getting-started/" }
        ]
      },
      {
        id: "client-credentials",
        title: "Client Credentials",
        summary: "Service-to-service access tokens and scopes.",
        resources: [
          { title: "RFC 6749 Section 4.4", url: "https://www.rfc-editor.org/rfc/rfc6749#section-4.4" },
          { title: "oauth.net Client Credentials", url: "https://oauth.net/2/grant-types/client-credentials/" }
        ]
      },
      {
        id: "security",
        title: "Security Considerations",
        summary: "Threat modeling, PKCE, refresh token rotation, and redirect URI hardening.",
        resources: [
          { title: "RFC 6749 Section 10", url: "https://www.rfc-editor.org/rfc/rfc6749#section-10" },
          { title: "OAuth Security BCP", url: "https://oauth.net/articles/oauth-2.0-security-best-practices/" }
        ]
      }
    ],
    quizBank: [
      {
        id: "oauth-q1",
        focusId: "authorization-code",
        question: "Why is PKCE recommended when using the authorization code grant with public clients?",
        options: [
          "It reduces token lifetime by default",
          "It prevents code interception attacks by binding the code to the initial client verifier",
          "It allows refresh tokens to be requested without scopes",
          "It lets the client skip redirect URIs"
        ],
        answerIndex: 1,
        rationale:
          "PKCE creates a verifier and challenge pair that ensures the authorization code cannot be reused by an attacker because the token endpoint validates the original verifier.",
        docLink: "https://www.rfc-editor.org/rfc/rfc7636"
      },
      {
        id: "oauth-q2",
        focusId: "authorization-code",
        question: "Which response type MUST be used by a confidential client performing the authorization code flow?",
        options: ["token", "code", "id_token", "code token"],
        answerIndex: 1,
        rationale: "RFC 6749 specifies that the authorization code grant uses response_type=code.",
        docLink: "https://www.rfc-editor.org/rfc/rfc6749#section-4.1.1"
      },
      {
        id: "oauth-q3",
        focusId: "client-credentials",
        question: "What scope considerations apply to the client credentials grant?",
        options: [
          "It ignores scopes entirely",
          "The client requests scopes pre-approved for its credentials",
          "Scopes are defined by the resource server dynamically",
          "Only the openid scope is valid"
        ],
        answerIndex: 1,
        rationale:
          "The authorization server may allow the client to request scopes that have been configured ahead of time for its credentials.",
        docLink: "https://www.rfc-editor.org/rfc/rfc6749#section-4.4.2"
      },
      {
        id: "oauth-q4",
        focusId: "client-credentials",
        question: "When should a client credentials grant be preferred?",
        options: [
          "When acting on behalf of an end user",
          "For server-to-server communication without user context",
          "When using a mobile application",
          "For SPAs needing implicit flows"
        ],
        answerIndex: 1,
        rationale:
          "The client credentials flow is suited for service accounts where no user context is required.",
        docLink: "https://oauth.net/2/grant-types/client-credentials/"
      },
      {
        id: "oauth-q5",
        focusId: "security",
        question: "Which redirect URI policy reduces open redirect attacks?",
        options: [
          "Allowing wildcard subdomains",
          "Requiring exact string matches",
          "Allowing HTTP for local development",
          "Using hash fragments for state"
        ],
        answerIndex: 1,
        rationale:
          "RFC 6749 Section 3.1.2.3 recommends exact redirect URI matching to avoid attacker-controlled redirects.",
        docLink: "https://www.rfc-editor.org/rfc/rfc6749#section-3.1.2.3"
      },
      {
        id: "oauth-q6",
        focusId: "security",
        question: "How should refresh tokens be handled to mitigate replay?",
        options: [
          "Store them in browser localStorage",
          "Rotate refresh tokens and detect reuse",
          "Never issue refresh tokens",
          "Use the implicit flow instead"
        ],
        answerIndex: 1,
        rationale:
          "Rotating refresh tokens and revoking on reuse protects against compromised tokens as described in the OAuth security best current practice.",
        docLink: "https://oauth.net/articles/oauth-2-0-security-best-practices/"
      }
    ]
  },
  {
    id: "rag",
    title: "AI Engineering (RAG)",
    description: "Retrieval augmented generation system design patterns and evaluation.",
    focusAreas: [
      {
        id: "retrievers",
        title: "Retriever Architectures",
        summary: "Vector stores, hybrid search, and document chunking strategies for RAG.",
        resources: [
          { title: "LangChain Retriever Docs", url: "https://python.langchain.com/docs/modules/data_connection/retrievers/" },
          { title: "LangChain Vectorstores", url: "https://python.langchain.com/docs/modules/data_connection/vectorstores/" }
        ]
      },
      {
        id: "pipelines",
        title: "Pipeline Orchestration",
        summary: "Prompt templates, chain composition, and response synthesis techniques.",
        resources: [
          { title: "LangChain Prompt Templates", url: "https://python.langchain.com/docs/modules/model_io/prompts/" },
          { title: "LangChain LCEL", url: "https://python.langchain.com/docs/expression_language/" }
        ]
      },
      {
        id: "evaluation",
        title: "Evaluation & Guardrails",
        summary: "Automated evaluation, hallucination detection, and guardrails for RAG.",
        resources: [
          { title: "LangChain Evaluation", url: "https://python.langchain.com/docs/guides/evaluation/" },
          { title: "LangChain Guardrails", url: "https://python.langchain.com/docs/guides/safety/guardrails" }
        ]
      }
    ],
    quizBank: [
      {
        id: "rag-q1",
        focusId: "retrievers",
        question: "What advantage does hybrid search provide over pure vector similarity in RAG?",
        options: [
          "It ignores embeddings and relies only on BM25",
          "It combines lexical and semantic signals to improve recall",
          "It reduces infrastructure cost by using a single index",
          "It guarantees deterministic responses"
        ],
        answerIndex: 1,
        rationale:
          "Hybrid search mixes dense and sparse retrieval to capture both semantic meaning and exact keyword matches, increasing recall.",
        docLink: "https://python.langchain.com/docs/modules/data_connection/retrievers/" 
      },
      {
        id: "rag-q2",
        focusId: "retrievers",
        question: "Why is chunk size important when preparing documents for retrieval?",
        options: [
          "Smaller chunks slow retrieval",
          "Chunk size balances context completeness with embedding quality",
          "Chunks only matter for question generation",
          "Chunking is unnecessary for PDFs"
        ],
        answerIndex: 1,
        rationale:
          "Appropriate chunk sizes retain enough context for answers while keeping embeddings focused and retrievable.",
        docLink: "https://python.langchain.com/docs/modules/data_connection/document_loaders/how_to/document_transformers/" 
      },
      {
        id: "rag-q3",
        focusId: "pipelines",
        question: "What is the purpose of LangChain Expression Language (LCEL) in RAG pipelines?",
        options: [
          "To render UI components",
          "To declaratively compose chains and manage async execution",
          "To manage vector store scaling",
          "To provision GPUs"
        ],
        answerIndex: 1,
        rationale:
          "LCEL provides a concise syntax for composing retrieval and generation steps with built-in streaming and retry behavior.",
        docLink: "https://python.langchain.com/docs/expression_language/"
      },
      {
        id: "rag-q4",
        focusId: "pipelines",
        question: "How can prompt templates improve RAG answer quality?",
        options: [
          "By minimizing the number of tokens",
          "By structuring retrieved context and instructions for the model",
          "By caching model responses",
          "By handling rate limits"
        ],
        answerIndex: 1,
        rationale:
          "Prompt templates standardize how context and instructions are combined, leading to more consistent completions.",
        docLink: "https://python.langchain.com/docs/modules/model_io/prompts/"
      },
      {
        id: "rag-q5",
        focusId: "evaluation",
        question: "Which metric helps detect hallucinations in RAG systems?",
        options: ["Latency", "BLEU", "Faithfulness or groundedness scoring", "Token cost"],
        answerIndex: 2,
        rationale:
          "Faithfulness metrics compare answers to retrieved sources to flag unsupported claims.",
        docLink: "https://python.langchain.com/docs/guides/evaluation/"
      },
      {
        id: "rag-q6",
        focusId: "evaluation",
        question: "What guardrail can enforce allowed response formats?",
        options: [
          "Vector similarity threshold",
          "Structured output parser validation",
          "Increasing context window",
          "Elastic cache"
        ],
        answerIndex: 1,
        rationale:
          "Guardrails can include schema validators that ensure the model outputs match required formats before returning to the user.",
        docLink: "https://python.langchain.com/docs/guides/safety/guardrails"
      }
    ]
  },
  {
    id: "node",
    title: "Node.js",
    description: "Event-driven runtime, module system, and server patterns on Node.js.",
    focusAreas: [
      {
        id: "event-loop",
        title: "Event Loop & Concurrency",
        summary: "Understanding libuv phases, task queues, and async patterns.",
        resources: [
          { title: "Node.js Event Loop Guide", url: "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick" },
          { title: "Node.js Async Context", url: "https://nodejs.org/api/async_context.html" }
        ]
      },
      {
        id: "http",
        title: "HTTP Servers",
        summary: "Building resilient REST APIs with core http module and Express.",
        resources: [
          { title: "Node.js HTTP", url: "https://nodejs.org/api/http.html" },
          { title: "Express Guide", url: "https://expressjs.com/en/guide/routing.html" }
        ]
      },
      {
        id: "testing",
        title: "Testing & Tooling",
        summary: "Using Node test runner, diagnostics channel, and best practices.",
        resources: [
          { title: "Node.js Test Runner", url: "https://nodejs.org/api/test.html" },
          { title: "Node.js Diagnostics", url: "https://nodejs.org/api/diagnostics_channel.html" }
        ]
      }
    ],
    quizBank: [
      {
        id: "node-q1",
        focusId: "event-loop",
        question: "Which phase of the Node.js event loop executes timers scheduled with setTimeout?",
        options: ["poll", "timers", "check", "close callbacks"],
        answerIndex: 1,
        rationale: "The timers phase executes callbacks scheduled by setTimeout and setInterval once their threshold has elapsed.",
        docLink: "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick"
      },
      {
        id: "node-q2",
        focusId: "event-loop",
        question: "What is the purpose of process.nextTick()?",
        options: [
          "Schedule code to run in the next macrotask",
          "Defer execution until I/O completes",
          "Queue a callback to run immediately after the current call stack before the event loop continues",
          "Block the event loop"
        ],
        answerIndex: 2,
        rationale:
          "process.nextTick queues a microtask that runs before the event loop continues to the next phase.",
        docLink: "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick"
      },
      {
        id: "node-q3",
        focusId: "http",
        question: "Which Express feature handles route parameters like /users/:id?",
        options: ["Routers", "Middleware", "Template engines", "Error handlers"],
        answerIndex: 0,
        rationale:
          "Express Router defines parameterized paths and extracts parameters on req.params.",
        docLink: "https://expressjs.com/en/guide/routing.html"
      },
      {
        id: "node-q4",
        focusId: "http",
        question: "What header enables persistent connections in Node's http module?",
        options: ["Connection: keep-alive", "Upgrade", "Accept", "Content-Length"],
        answerIndex: 0,
        rationale:
          "Setting Connection: keep-alive allows multiple requests on the same TCP connection.",
        docLink: "https://nodejs.org/api/http.html#requestsetheadername-value"
      },
      {
        id: "node-q5",
        focusId: "testing",
        question: "How do you run the built-in Node.js test runner?",
        options: ["node --test", "npm test", "node test.js", "npx run test"],
        answerIndex: 0,
        rationale: "Node 20+ ships with node --test CLI for executing tests.",
        docLink: "https://nodejs.org/api/test.html"
      },
      {
        id: "node-q6",
        focusId: "testing",
        question: "What does the diagnostics_channel module provide?",
        options: [
          "OpenTelemetry tracing",
          "An API to subscribe to diagnostic data from Node internals",
          "A debugging REPL",
          "A profiler"
        ],
        answerIndex: 1,
        rationale:
          "diagnostics_channel allows libraries to publish diagnostic events to subscribers for observability.",
        docLink: "https://nodejs.org/api/diagnostics_channel.html"
      }
    ]
  },
  {
    id: "typescript",
    title: "TypeScript",
    description: "Type system, tooling, and language services for TypeScript projects.",
    focusAreas: [
      {
        id: "types",
        title: "Type System Foundations",
        summary: "Structural typing, unions, intersections, and inference heuristics.",
        resources: [
          { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/2/basic-types.html" },
          { title: "Generics", url: "https://www.typescriptlang.org/docs/handbook/2/generics.html" }
        ]
      },
      {
        id: "tooling",
        title: "Tooling & Config",
        summary: "Compiler options, project references, and build tooling integration.",
        resources: [
          { title: "tsconfig Reference", url: "https://www.typescriptlang.org/tsconfig" },
          { title: "Project References", url: "https://www.typescriptlang.org/docs/handbook/project-references.html" }
        ]
      },
      {
        id: "advanced",
        title: "Advanced Types",
        summary: "Conditional types, mapped types, and template literal types.",
        resources: [
          { title: "Conditional Types", url: "https://www.typescriptlang.org/docs/handbook/2/conditional-types.html" },
          { title: "Template Literal Types", url: "https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html" }
        ]
      }
    ],
    quizBank: [
      {
        id: "ts-q1",
        focusId: "types",
        question: "What describes TypeScript's type system?",
        options: ["Nominal", "Structural", "Duck and nominal", "Dynamic"],
        answerIndex: 1,
        rationale: "TypeScript uses structural typing meaning compatibility is determined by members.",
        docLink: "https://www.typescriptlang.org/docs/handbook/type-compatibility.html"
      },
      {
        id: "ts-q2",
        focusId: "types",
        question: "Which keyword creates a union type?",
        options: ["&", "|", "extends", "infer"],
        answerIndex: 1,
        rationale: "The pipe (|) operator composes union types in TypeScript.",
        docLink: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#union-types"
      },
      {
        id: "ts-q3",
        focusId: "tooling",
        question: "What does the incremental compiler option enable?",
        options: [
          "JavaScript emit",
          "Reuse of build information to speed up subsequent builds",
          "Automatic ESLint fixes",
          "Bundling"
        ],
        answerIndex: 1,
        rationale:
          "incremental stores .tsbuildinfo files that TypeScript reuses on future builds to skip unchanged work.",
        docLink: "https://www.typescriptlang.org/tsconfig#incremental"
      },
      {
        id: "ts-q4",
        focusId: "tooling",
        question: "Which tsconfig option controls module resolution strategy?",
        options: ["module", "target", "moduleResolution", "allowSyntheticDefaultImports"],
        answerIndex: 2,
        rationale: "moduleResolution chooses between classic and node style resolution.",
        docLink: "https://www.typescriptlang.org/tsconfig#moduleResolution"
      },
      {
        id: "ts-q5",
        focusId: "advanced",
        question: "What does infer allow inside conditional types?",
        options: [
          "Declare namespaces",
          "Introduce a type variable from part of another type",
          "Import modules",
          "Check runtime values"
        ],
        answerIndex: 1,
        rationale: "infer lets conditional types capture a type from the extends clause for reuse.",
        docLink: "https://www.typescriptlang.org/docs/handbook/2/conditional-types.html"
      },
      {
        id: "ts-q6",
        focusId: "advanced",
        question: "Which mapped type utility makes all properties optional?",
        options: ["Required", "Readonly", "Partial", "Pick"],
        answerIndex: 2,
        rationale: "Partial<T> constructs a type with all properties optional.",
        docLink: "https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype"
      }
    ]
  },
  {
    id: "postgres",
    title: "PostgreSQL",
    description: "Relational modeling, performance tuning, and SQL features in PostgreSQL.",
    focusAreas: [
      {
        id: "query-planning",
        title: "Query Planning",
        summary: "Explain plans, indexes, and analyzing performance.",
        resources: [
          { title: "EXPLAIN Documentation", url: "https://www.postgresql.org/docs/current/using-explain.html" },
          { title: "Indexes", url: "https://www.postgresql.org/docs/current/indexes.html" }
        ]
      },
      {
        id: "data-integrity",
        title: "Data Integrity",
        summary: "Constraints, transactions, and isolation levels.",
        resources: [
          { title: "Constraint Documentation", url: "https://www.postgresql.org/docs/current/ddl-constraints.html" },
          { title: "Transaction Isolation", url: "https://www.postgresql.org/docs/current/transaction-iso.html" }
        ]
      },
      {
        id: "extensions",
        title: "Extensions & Advanced Features",
        summary: "Using extensions like PostGIS and logical replication.",
        resources: [
          { title: "Extensions", url: "https://www.postgresql.org/docs/current/extend-extensions.html" },
          { title: "Logical Replication", url: "https://www.postgresql.org/docs/current/logical-replication.html" }
        ]
      }
    ],
    quizBank: [
      {
        id: "pg-q1",
        focusId: "query-planning",
        question: "Which command helps inspect the execution plan of a SQL query?",
        options: ["DESCRIBE", "EXPLAIN", "SHOW PLAN", "TRACE"],
        answerIndex: 1,
        rationale: "PostgreSQL uses EXPLAIN and EXPLAIN ANALYZE to display execution plans.",
        docLink: "https://www.postgresql.org/docs/current/using-explain.html"
      },
      {
        id: "pg-q2",
        focusId: "query-planning",
        question: "What index type is preferred for range queries on ordered data?",
        options: ["GIN", "GiST", "BRIN", "B-tree"],
        answerIndex: 3,
        rationale: "B-tree indexes efficiently handle equality and range queries on ordered columns.",
        docLink: "https://www.postgresql.org/docs/current/indexes-types.html"
      },
      {
        id: "pg-q3",
        focusId: "data-integrity",
        question: "Which isolation level prevents non-repeatable reads but allows phantom reads?",
        options: ["Read Uncommitted", "Read Committed", "Repeatable Read", "Serializable"],
        answerIndex: 2,
        rationale: "Repeatable Read disallows non-repeatable reads but may still allow phantoms in PostgreSQL's implementation.",
        docLink: "https://www.postgresql.org/docs/current/transaction-iso.html"
      },
      {
        id: "pg-q4",
        focusId: "data-integrity",
        question: "What constraint ensures column values are unique but allows NULL?",
        options: ["PRIMARY KEY", "UNIQUE", "CHECK", "EXCLUDE"],
        answerIndex: 1,
        rationale: "UNIQUE constraints enforce uniqueness while permitting NULL by SQL standard.",
        docLink: "https://www.postgresql.org/docs/current/ddl-constraints.html"
      },
      {
        id: "pg-q5",
        focusId: "extensions",
        question: "Which extension adds geospatial types and functions?",
        options: ["pg_stat_statements", "pg_trgm", "PostGIS", "pgcrypto"],
        answerIndex: 2,
        rationale: "PostGIS adds spatial types and functions for geographic queries.",
        docLink: "https://postgis.net/documentation/"
      },
      {
        id: "pg-q6",
        focusId: "extensions",
        question: "What does logical replication enable?",
        options: [
          "Block-level file copying",
          "Streaming WAL to subscribers for selective data replication",
          "Only backup management",
          "Automatic failover"
        ],
        answerIndex: 1,
        rationale: "Logical replication publishes WAL changes allowing subscribers to receive chosen tables.",
        docLink: "https://www.postgresql.org/docs/current/logical-replication.html"
      }
    ]
  },
  {
    id: "webrtc",
    title: "WebRTC",
    description: "Real-time peer-to-peer media transport with WebRTC APIs.",
    focusAreas: [
      {
        id: "signaling",
        title: "Signaling & Negotiation",
        summary: "SDP offers, ICE candidates, and negotiation flows.",
        resources: [
          { title: "WebRTC Overview", url: "https://webrtc.org/getting-started/overview" },
          { title: "WebRTC SDP", url: "https://webrtc.org/getting-started/learn-webrtc/" }
        ]
      },
      {
        id: "media",
        title: "Media & Data Channels",
        summary: "Tracks, codecs, and data channel reliability modes.",
        resources: [
          { title: "WebRTC Media", url: "https://webrtc.org/getting-started/media-capture-and-production" },
          { title: "RTCDataChannel Spec", url: "https://w3c.github.io/webrtc-pc/#rtcdatachannel" }
        ]
      },
      {
        id: "network",
        title: "Networking & STUN/TURN",
        summary: "NAT traversal, STUN, TURN, and ICE candidate prioritization.",
        resources: [
          { title: "ICE Overview", url: "https://webrtc.org/getting-started/turn-server" },
          { title: "STUN/TURN Guidance", url: "https://webrtc.org/getting-started/faq" }
        ]
      }
    ],
    quizBank: [
      {
        id: "webrtc-q1",
        focusId: "signaling",
        question: "What does the signaling process exchange between peers?",
        options: ["Media streams", "SDP descriptions and ICE candidates", "TURN credentials", "Certificates"],
        answerIndex: 1,
        rationale:
          "Signaling transports SDP offers/answers and ICE candidates via an external channel before the peer connection is established.",
        docLink: "https://webrtc.org/getting-started/overview"
      },
      {
        id: "webrtc-q2",
        focusId: "signaling",
        question: "Why is an external signaling server required?",
        options: [
          "WebRTC mandates HTTP",
          "Browsers cannot directly exchange SDP without an initial channel",
          "ICE cannot gather candidates otherwise",
          "Media must be proxied"
        ],
        answerIndex: 1,
        rationale: "Browsers need a separate channel (like WebSocket) to exchange SDP/ICE metadata before establishing peer connections.",
        docLink: "https://webrtc.org/getting-started/overview"
      },
      {
        id: "webrtc-q3",
        focusId: "media",
        question: "Which API sends arbitrary data messages over WebRTC?",
        options: ["MediaStream", "RTCPeerConnection", "RTCDataChannel", "RTCRtpSender"],
        answerIndex: 2,
        rationale: "RTCDataChannel provides reliable or unreliable messaging over SCTP.",
        docLink: "https://w3c.github.io/webrtc-pc/#rtcdatachannel"
      },
      {
        id: "webrtc-q4",
        focusId: "media",
        question: "How do you add a media track to a connection?",
        options: ["createOffer", "addTrack", "setLocalDescription", "addIceCandidate"],
        answerIndex: 1,
        rationale: "RTCPeerConnection.addTrack attaches a MediaStreamTrack for transmission.",
        docLink: "https://webrtc.org/getting-started/media-capture-and-production"
      },
      {
        id: "webrtc-q5",
        focusId: "network",
        question: "What is the role of a TURN server?",
        options: [
          "Provide codec negotiation",
          "Relay media when direct peer-to-peer connections fail",
          "Issue TLS certificates",
          "Negotiate SDP"
        ],
        answerIndex: 1,
        rationale:
          "TURN relays media through a publicly reachable server when NAT traversal prevents direct connectivity.",
        docLink: "https://webrtc.org/getting-started/turn-server"
      },
      {
        id: "webrtc-q6",
        focusId: "network",
        question: "How does ICE prioritize candidates?",
        options: [
          "Random order",
          "Based on foundation only",
          "By type preference (host, srflx, relay) and local network cost",
          "Lexicographically"
        ],
        answerIndex: 2,
        rationale:
          "ICE assigns priorities considering candidate type and network cost to select the best path.",
        docLink: "https://webrtc.org/getting-started/faq"
      }
    ]
  },
  {
    id: "sockets",
    title: "Sockets",
    description: "Realtime communication patterns with WebSocket and Socket.IO.",
    focusAreas: [
      {
        id: "websocket",
        title: "WebSocket Protocol",
        summary: "Handshake, frames, and WHATWG WebSocket API.",
        resources: [
          { title: "WHATWG WebSocket API", url: "https://html.spec.whatwg.org/multipage/web-sockets.html" },
          { title: "WebSocket Interface", url: "https://html.spec.whatwg.org/multipage/web-sockets.html#the-websocket-interface" }
        ]
      },
      {
        id: "socketio",
        title: "Socket.IO Patterns",
        summary: "Namespaces, rooms, and event acknowledgement flows.",
        resources: [
          { title: "Socket.IO Rooms", url: "https://socket.io/docs/v4/rooms" },
          { title: "Socket.IO Emit Cheat Sheet", url: "https://socket.io/docs/v4/emit-cheatsheet" }
        ]
      },
      {
        id: "resilience",
        title: "Resilience & Scaling",
        summary: "Handling reconnection, backpressure, and horizontal scaling.",
        resources: [
          { title: "Socket.IO Scaling", url: "https://socket.io/docs/v4/using-multiple-nodes" },
          { title: "WebSocket Backpressure", url: "https://html.spec.whatwg.org/multipage/web-sockets.html#feedback-from-the-protocol" }
        ]
      }
    ],
    quizBank: [
      {
        id: "sock-q1",
        focusId: "websocket",
        question: "Which HTTP status code indicates a successful WebSocket handshake upgrade?",
        options: ["200", "101", "204", "307"],
        answerIndex: 1,
        rationale: "The server responds with 101 Switching Protocols during a successful WebSocket upgrade.",
        docLink: "https://html.spec.whatwg.org/multipage/web-sockets.html#network"
      },
      {
        id: "sock-q2",
        focusId: "websocket",
        question: "What frame opcode represents a text message?",
        options: ["0x0", "0x1", "0x2", "0x8"],
        answerIndex: 1,
        rationale: "Opcode 0x1 indicates a text frame per the WebSocket spec.",
        docLink: "https://html.spec.whatwg.org/multipage/web-sockets.html#concept-websocket-opcode"
      },
      {
        id: "sock-q3",
        focusId: "socketio",
        question: "How do Socket.IO rooms help scalability?",
        options: [
          "They shard the database",
          "They allow targeted broadcast to subsets of clients",
          "They provide HTTP caching",
          "They store binary data"
        ],
        answerIndex: 1,
        rationale:
          "Rooms group sockets so events can be efficiently broadcast to interested subscribers only.",
        docLink: "https://socket.io/docs/v4/rooms"
      },
      {
        id: "sock-q4",
        focusId: "socketio",
        question: "Which method sends an acknowledgement callback to the event emitter?",
        options: ["emit", "emitWithAck", "broadcast", "to"],
        answerIndex: 1,
        rationale:
          "Socket.IO v4 exposes emitWithAck for awaiting acknowledgement values from receivers.",
        docLink: "https://socket.io/docs/v4/emit-cheatsheet"
      },
      {
        id: "sock-q5",
        focusId: "resilience",
        question: "What is a recommended reconnection strategy for WebSocket clients?",
        options: [
          "Immediate retries",
          "Exponential backoff with jitter",
          "Single retry",
          "No retries"
        ],
        answerIndex: 1,
        rationale:
          "Using exponential backoff with jitter avoids overload when many clients reconnect simultaneously.",
        docLink: "https://socket.io/docs/v4/client-initialization"
      },
      {
        id: "sock-q6",
        focusId: "resilience",
        question: "How can Socket.IO scale horizontally across nodes?",
        options: [
          "By using sticky sessions only",
          "By configuring the Redis adapter to share events",
          "By using WebRTC",
          "By disabling heartbeat"
        ],
        answerIndex: 1,
        rationale: "The Redis adapter propagates events between Socket.IO instances running on multiple nodes.",
        docLink: "https://socket.io/docs/v4/using-multiple-nodes"
      }
    ]
  },
  {
    id: "system",
    title: "System Design & Architecture",
    description: "Distributed systems primitives and platform engineering.",
    focusAreas: [
      {
        id: "kubernetes",
        title: "Kubernetes Orchestration",
        summary: "Cluster components, deployments, and workload patterns.",
        resources: [
          { title: "Kubernetes Components", url: "https://kubernetes.io/docs/concepts/overview/components/" },
          { title: "Deployments", url: "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/" }
        ]
      },
      {
        id: "platform",
        title: "Platform Tooling",
        summary: "Docker, CI/CD on GitHub, and GCP compute services.",
        resources: [
          { title: "Docker Docs", url: "https://docs.docker.com/engine/" },
          { title: "GitHub Actions", url: "https://docs.github.com/actions" },
          { title: "GCP Compute Options", url: "https://cloud.google.com/docs/overview" }
        ]
      },
      {
        id: "data",
        title: "Messaging & Caching",
        summary: "Pub/Sub design, Redis caching, and resilience patterns.",
        resources: [
          { title: "Cloud Pub/Sub", url: "https://cloud.google.com/pubsub/docs/overview" },
          { title: "Redis Data Structures", url: "https://redis.io/docs/latest/develop/data-types/" }
        ]
      }
    ],
    quizBank: [
      {
        id: "sys-q1",
        focusId: "kubernetes",
        question: "Which component schedules Pods onto Nodes?",
        options: ["kube-apiserver", "kube-scheduler", "kubelet", "controller-manager"],
        answerIndex: 1,
        rationale: "The kube-scheduler assigns Pods to nodes based on resource requests and policies.",
        docLink: "https://kubernetes.io/docs/concepts/overview/components/"
      },
      {
        id: "sys-q2",
        focusId: "kubernetes",
        question: "What feature lets Kubernetes roll out changes gradually with rollback support?",
        options: ["DaemonSets", "Jobs", "Deployments", "ConfigMaps"],
        answerIndex: 2,
        rationale: "Deployments manage ReplicaSets and support rolling updates and rollbacks.",
        docLink: "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/"
      },
      {
        id: "sys-q3",
        focusId: "platform",
        question: "Which Dockerfile instruction defines the default executable?",
        options: ["RUN", "CMD", "FROM", "ENV"],
        answerIndex: 1,
        rationale: "CMD specifies the default command when a container starts.",
        docLink: "https://docs.docker.com/engine/reference/builder/"
      },
      {
        id: "sys-q4",
        focusId: "platform",
        question: "What GitHub Actions file controls workflow definition?",
        options: [".gitmodules", "workflow.yml", "Dockerfile", "package.json"],
        answerIndex: 1,
        rationale: "Workflows are defined in YAML files under .github/workflows/.",
        docLink: "https://docs.github.com/actions/using-workflows/about-workflows"
      },
      {
        id: "sys-q5",
        focusId: "data",
        question: "What delivery guarantee does Cloud Pub/Sub provide by default?",
        options: ["At-most-once", "Exactly-once", "At-least-once", "Best effort"],
        answerIndex: 2,
        rationale: "Cloud Pub/Sub delivers messages at-least-once unless you implement deduplication.",
        docLink: "https://cloud.google.com/pubsub/docs/overview"
      },
      {
        id: "sys-q6",
        focusId: "data",
        question: "Which Redis data structure suits pub/sub fanout?",
        options: ["Strings", "Lists", "Streams", "Sets"],
        answerIndex: 2,
        rationale: "Redis Streams provide persistent log-based messaging for fanout and replay.",
        docLink: "https://redis.io/docs/latest/develop/data-types/streams/"
      }
    ]
  }
];

export function getTopicConfig(id: TopicId) {
  return topics.find((topic) => topic.id === id);
}
