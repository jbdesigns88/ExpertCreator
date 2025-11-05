export type TopicId =
  | "oauth"
  | "rag"
  | "node"
  | "typescript"
  | "postgres"
  | "webrtc"
  | "sockets"
  | "system";

export interface StudyGuideSection {
  title: string;
  detail: string;
  bullets?: string[];
}

export interface PracticeDrill {
  title: string;
  steps: string[];
}

export interface StudyGuide {
  overview: string;
  objectives: string[];
  sections: StudyGuideSection[];
  practice: PracticeDrill[];
  reflection: string[];
  projectPrompt: string;
}

export interface FocusArea {
  id: string;
  title: string;
  summary: string;
  studyGuide: StudyGuide;
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
        studyGuide: {
          overview:
            "Master the end-to-end dance between public clients, authorization servers, and resource APIs. Learn how code verifiers, consent screens, and token responses work together so you can reason about every redirect and HTTP exchange without relying on external diagrams.",
          objectives: [
            "Map each step in the authorization code flow including error branches and state validation",
            "Explain why PKCE is mandatory for public clients and how verifiers are generated and reused",
            "Instrument logging to trace authorization latency and diagnose misconfigurations"
          ],
          sections: [
            {
              title: "Protocol Walkthrough",
              detail:
                "Trace the sequence from initial authorization request to resource server access. Emphasize the transition from front-channel redirects to back-channel token exchange, highlighting where secrets must be protected and where user interaction occurs.",
              bullets: [
                "Client builds authorization URL with response_type=code, PKCE challenge, state, and scopes",
                "Authorization server authenticates the user, records consent, and redirects with code and state",
                "Client swaps code plus verifier for tokens at the token endpoint over a confidential channel"
              ]
            },
            {
              title: "PKCE Mechanics",
              detail:
                "Reinforce the distinction between the code verifier stored locally and the challenge sent upstream. Show how the token endpoint re-computes the challenge hash to stop interception or replay attacks and what happens when verifiers do not match.",
              bullets: [
                "S256 is preferred so verifiers are never transmitted in plaintext",
                "Verifier entropy must be at least 43 characters to resist brute-force",
                "Authorization server binds the code to the original verifier before issuing tokens"
              ]
            },
            {
              title: "State and Redirect Safety",
              detail:
                "Discuss mitigation strategies for CSRF, open redirects, and consent page tampering. Cover strict redirect URI registration, exact matching policies, and how to record state payloads for later analysis.",
              bullets: [
                "Persist state values server-side with issued_at timestamps",
                "Treat redirect mismatches as security incidents and alert immediately",
                "Document expected redirect URIs per environment (local, staging, production)"
              ]
            }
          ],
          practice: [
            {
              title: "Whiteboard the Authorization Flow",
              steps: [
                "Sketch actors (browser, public client, authorization server, resource API)",
                "Annotate HTTP methods, endpoints, and parameters for each exchange",
                "Highlight where tokens are stored, rotated, or destroyed"
              ]
            },
            {
              title: "Implement PKCE Diagnostics",
              steps: [
                "Instrument your client to log generated verifier, challenge, and state IDs",
                "Capture the authorization redirect payload and validate state immediately",
                "Record token endpoint responses and reconcile with verifier logs to confirm binding"
              ]
            }
          ],
          reflection: [
            "Where can an attacker intercept the code and how does PKCE defeat that attempt?",
            "How would the flow differ if the client were confidential instead of public?",
            "Which monitoring metrics confirm redirect URIs remain locked down across releases?"
          ],
          projectPrompt:
            "Build a minimal OAuth playground that issues authorization requests, captures redirects, and visualizes each payload so teammates can practice debugging real-world login issues."
        },
        resources: [
          { title: "RFC 6749 Section 4.1", url: "https://www.rfc-editor.org/rfc/rfc6749#section-4.1" },
          { title: "oauth.net Guide", url: "https://oauth.net/getting-started/" }
        ]
      },
      {
        id: "client-credentials",
        title: "Client Credentials",
        summary: "Service-to-service access tokens and scopes.",
        studyGuide: {
          overview:
            "Design machine-to-machine integrations that request the minimal scope necessary and rotate secrets safely. This lesson grounds you in the non-interactive grant so you can harden background jobs and API daemons without guesswork.",
          objectives: [
            "Explain when client credentials are appropriate versus resource owner or authorization code flows",
            "Configure least-privilege scopes and understand how they map to downstream authorization decisions",
            "Automate credential rotation, logging, and anomaly detection for service accounts"
          ],
          sections: [
            {
              title: "Grant Characteristics",
              detail:
                "Contrast confidential clients with public ones and emphasize the lack of human interaction. Discuss why this flow should never be used for end-user delegation and how to document dependencies between services.",
              bullets: [
                "Requires a trusted environment capable of protecting a client secret",
                "Ideal for CRON jobs, backend-to-backend APIs, and infrastructure automation",
                "Scopes should align with coarse-grained permissions and be audited quarterly"
              ]
            },
            {
              title: "Token Management",
              detail:
                "Outline strategies for storing secrets, rotating them, and monitoring issuance. Include guidance on using client assertion JWTs when static secrets are disallowed and how to validate token introspection responses.",
              bullets: [
                "Use dedicated secret stores (HSM, Vault) with rotation policies",
                "Prefer short-lived access tokens and avoid refresh tokens for this flow",
                "Record token_id and scope in logs to support forensic analysis"
              ]
            },
            {
              title: "Scope Design",
              detail:
                "Break down how to design scopes that reflect capabilities instead of resources. Provide patterns for multi-tenant APIs and note how to avoid privilege creep when new endpoints are added.",
              bullets: [
                "Use verb-noun scope names (e.g., invoices.read) tied to authorization policies",
                "Document which services may request each scope and approval owners",
                "Add automated tests that fail when undocumented scopes appear"
              ]
            }
          ],
          practice: [
            {
              title: "Secret Rotation Drill",
              steps: [
                "Deploy a sandbox service that authenticates with client credentials",
                "Rotate the client secret and confirm the service updates configuration without downtime",
                "Trigger alerts when old secrets are used to detect drift"
              ]
            },
            {
              title: "Scope Validation Harness",
              steps: [
                "Write integration tests that request tokens for each scope",
                "Call representative API endpoints and assert authorization results",
                "Generate a compliance report mapping scopes to endpoints"
              ]
            }
          ],
          reflection: [
            "How would you detect if a client secret leaked in logs or monitoring dashboards?",
            "What governance process ensures new scopes are reviewed before production rollout?",
            "When would you migrate from shared secrets to client assertion JWTs?"
          ],
          projectPrompt:
            "Stand up a background processing service that ingests invoices from a queue and posts to an accounting API using client credentials, complete with automated rotation and observability dashboards."
        },
        resources: [
          { title: "RFC 6749 Section 4.4", url: "https://www.rfc-editor.org/rfc/rfc6749#section-4.4" },
          { title: "oauth.net Client Credentials", url: "https://oauth.net/2/grant-types/client-credentials/" }
        ]
      },
      {
        id: "security",
        title: "Security Considerations",
        summary: "Threat modeling, PKCE, refresh token rotation, and redirect URI hardening.",
        studyGuide: {
          overview:
            "Codify a comprehensive defense strategy for OAuth integrations. You will learn how to identify the highest risk edges in your ecosystem and respond with layered mitigations that stand even during incident response.",
          objectives: [
            "Enumerate the primary attack surfaces across authorization, token, and resource endpoints",
            "Implement refresh token rotation with automatic revocation and anomaly detection",
            "Design incident response runbooks for redirect URI abuse and consent phishing"
          ],
          sections: [
            {
              title: "Threat Surfaces",
              detail:
                "Use STRIDE to categorize threats at each phase: code interception, CSRF, consent screen spoofing, and token replay. Document which controls exist today and where compensating measures are needed.",
              bullets: [
                "Front-channel redirects require state validation and same-site cookie policies",
                "Token endpoint needs client authentication, rate limiting, and anomaly logging",
                "Resource API must scope tokens and enforce least privilege access checks"
              ]
            },
            {
              title: "Refresh Token Rotation",
              detail:
                "Describe the rotation handshake, how to persist token family identifiers, and when to revoke the chain. Include patterns for detecting reuse, locking the session, and prompting reauthentication.",
              bullets: [
                "Assign a unique family_id to each refresh token lineage",
                "On reuse detection, revoke the family and notify the user",
                "Store rotation metadata (issued_at, client_id, IP) for audits"
              ]
            },
            {
              title: "Redirect URI Governance",
              detail:
                "Establish strict allowlists and environment separation. Cover processes for requesting new redirects, verifying TLS certificates, and performing quarterly reviews of registered URIs.",
              bullets: [
                "Reject wildcard subdomains and query parameters unless explicitly approved",
                "Verify new redirect URIs via automated integration tests before enabling",
                "Provide a self-service request form that triggers security review"
              ]
            }
          ],
          practice: [
            {
              title: "Run a Threat Modeling Workshop",
              steps: [
                "Assemble a data flow diagram covering browser, client, authorization server, and APIs",
                "Identify spoofing, tampering, repudiation, information disclosure, denial, and elevation risks",
                "Document mitigations, responsible owners, and verification tests"
              ]
            },
            {
              title: "Implement Token Reuse Detection",
              steps: [
                "Instrument the token endpoint to persist refresh token fingerprints",
                "Simulate a reuse attempt and confirm the family is revoked",
                "Create an alert workflow that pages on-call engineers with context"
              ]
            }
          ],
          reflection: [
            "Which logs and dashboards will you consult first when investigating suspicious OAuth activity?",
            "How do you educate partner teams about redirect URI best practices without slowing delivery?",
            "What automation will you add to ensure threat models stay current as scopes evolve?"
          ],
          projectPrompt:
            "Publish a living OAuth security playbook that pairs architecture diagrams with incident response checklists, sample alerts, and testing scripts for your organization."
        },
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
        studyGuide: {
          overview:
            "Engineer retrieval layers that consistently surface trustworthy context. You will architect chunking pipelines, embeddings, and ranking heuristics that balance precision with recall for diverse corpora.",
          objectives: [
            "Compare dense, sparse, and hybrid retrieval strategies and know when to deploy each",
            "Design chunking workflows that preserve semantic boundaries while meeting token limits",
            "Instrument retrieval quality metrics such as hit rate, MRR, and coverage"
          ],
          sections: [
            {
              title: "Corpus Preparation",
              detail:
                "Explore document loaders, cleaning pipelines, and metadata enrichment. Highlight the trade-offs between aggressive normalization and preserving authorial voice, plus how metadata filters impact query latency.",
              bullets: [
                "Normalize whitespace and Unicode while retaining headings and hierarchy",
                "Attach metadata like source, section, and published_at to support filters",
                "Persist raw source text for lineage and auditing"
              ]
            },
            {
              title: "Chunking Strategies",
              detail:
                "Model chunk size selection through examples with code or Markdown. Demonstrate sliding windows versus semantic splitting and measure their effect on retrieval hit rates.",
              bullets: [
                "Start with 300-500 token windows and validate with evaluation sets",
                "Use adaptive chunking for tables, code blocks, and FAQ formats",
                "Store overlap metadata to merge adjacent chunks during answer synthesis"
              ]
            },
            {
              title: "Retriever Architectures",
              detail:
                "Compare vector stores (FAISS, Pinecone), BM25 indexes, and hybrid orchestrators. Discuss indexing schedules, batching, and strategies for streaming updates without re-embedding the world.",
              bullets: [
                "Choose embedding models optimized for domain text (code, legal, support)",
                "Build evaluation dashboards tracking recall@k and diversity",
                "Leverage re-ranking models to reorder top-k candidates for answer quality"
              ]
            }
          ],
          practice: [
            {
              title: "Chunking Lab",
              steps: [
                "Load a heterogeneous corpus (docs, transcripts, release notes)",
                "Experiment with fixed window, recursive, and semantic chunkers",
                "Measure retrieval recall using a labeled question set"
              ]
            },
            {
              title: "Hybrid Retrieval Experiment",
              steps: [
                "Implement sparse BM25 and dense embeddings side by side",
                "Blend scores via weighted sums or learned linear models",
                "Graph improvements in recall and latency after tuning"
              ]
            }
          ],
          reflection: [
            "Which corpus segments consistently underperform and why?",
            "How will you keep embeddings fresh as the knowledge base evolves daily?",
            "What monitoring alerts fire when recall or metadata coverage drops?"
          ],
          projectPrompt:
            "Deliver a retriever playbook with code notebooks that benchmark multiple embedding models, chunkers, and hybrid strategies on your team's real documents."
        },
        resources: [
          { title: "LangChain Retriever Docs", url: "https://python.langchain.com/docs/modules/data_connection/retrievers/" },
          { title: "LangChain Vectorstores", url: "https://python.langchain.com/docs/modules/data_connection/vectorstores/" }
        ]
      },
      {
        id: "pipelines",
        title: "Pipeline Orchestration",
        summary: "Prompt templates, chain composition, and response synthesis techniques.",
        studyGuide: {
          overview:
            "Orchestrate retrieval-augmented pipelines that are observable, testable, and resilient. Learn how to compose chains, manage context windows, and deliver deterministic outputs for production workloads.",
          objectives: [
            "Compose multi-step retrieval and generation workflows using declarative graph builders",
            "Design prompt templates that bind retrieved context, instructions, and guardrails",
            "Instrument latency, token usage, and output validation across the pipeline"
          ],
          sections: [
            {
              title: "Chain Topologies",
              detail:
                "Compare sequential, branching, and map-reduce pipelines. Discuss when to parallelize retrieval calls, how to merge outputs, and how to handle partial failures gracefully.",
              bullets: [
                "Map-reduce excels at summarizing large document sets",
                "Router chains route questions to specialized retrievers",
                "Fallback chains protect against empty retrieval results"
              ]
            },
            {
              title: "Prompt Engineering",
              detail:
                "Develop reusable prompt templates that include instructions, citation requirements, and formatting constraints. Show how to inject retrieved snippets with delimiters to reduce hallucinations.",
              bullets: [
                "Reserve tokens for instructions, retrieved context, and examples",
                "Use explicit output schemas or JSON mode when integration requires parsing",
                "Version prompts in source control and add regression tests"
              ]
            },
            {
              title: "Observability & Testing",
              detail:
                "Outline logging, tracing, and evaluation hooks. Explain how to capture intermediate retriever results, LLM responses, and guardrail decisions for debugging and analytics.",
              bullets: [
                "Emit structured logs with trace IDs for each user query",
                "Persist intermediate chain state for replay and failure analysis",
                "Automate golden set evaluations in CI before releasing prompt changes"
              ]
            }
          ],
          practice: [
            {
              title: "Build a Router Chain",
              steps: [
                "Define intent classifiers that direct questions to domain-specific retrievers",
                "Implement fallback behavior when the classifier confidence is low",
                "Capture metrics comparing router accuracy to a monolithic pipeline"
              ]
            },
            {
              title: "Prompt Regression Harness",
              steps: [
                "Create a golden dataset of question-answer pairs with citations",
                "Run the dataset through your pipeline after each prompt change",
                "Analyze failures and update prompts or retrieval filters accordingly"
              ]
            }
          ],
          reflection: [
            "How does your pipeline behave when retrieval returns zero results?",
            "Where can you insert guardrails without over-constraining creativity?",
            "Which stages consume the most tokens and how can you optimize them?"
          ],
          projectPrompt:
            "Implement a complete RAG orchestration service that exposes an API endpoint, integrates observability hooks, and ships with end-to-end regression tests covering prompt, retrieval, and guardrail updates."
        },
        resources: [
          { title: "LangChain Prompt Templates", url: "https://python.langchain.com/docs/modules/model_io/prompts/" },
          { title: "LangChain LCEL", url: "https://python.langchain.com/docs/expression_language/" }
        ]
      },
      {
        id: "evaluation",
        title: "Evaluation & Guardrails",
        summary: "Automated evaluation, hallucination detection, and guardrails for RAG.",
        studyGuide: {
          overview:
            "Build an evaluation harness that keeps your RAG system honest. You will implement offline and online tests, groundedness scoring, and guardrails that reject unsafe or low-confidence answers before users ever see them.",
          objectives: [
            "Differentiate intrinsic model evaluations from task-specific outcome metrics",
            "Implement hallucination detection using groundedness, answer similarity, and citation checks",
            "Deploy guardrails that validate schema, redact secrets, and escalate risky outputs"
          ],
          sections: [
            {
              title: "Evaluation Taxonomy",
              detail:
                "Cover unit-level prompt tests, regression suites, human review loops, and production telemetry. Emphasize building a labeled dataset and benchmarking new prompt or retriever changes before release.",
              bullets: [
                "Track accuracy, groundedness, completeness, and style adherence",
                "Use both automatic metrics (BLEU, ROUGE) and domain-specific scoring",
                "Schedule periodic human audits to capture nuanced failure modes"
              ]
            },
            {
              title: "Guardrail Strategies",
              detail:
                "Show how to apply schema validation, safety classifiers, and profanity filters. Discuss secrets detection, personally identifiable information scanning, and fallback responses when guardrails trigger.",
              bullets: [
                "Define allowlists/denylists for intents your system will or will not answer",
                "Integrate content filters before final delivery to the user",
                "Log guardrail triggers with enough context for follow-up"
              ]
            },
            {
              title: "Online Monitoring",
              detail:
                "Explain how to capture live feedback, implicit signals (rewrites, time-on-page), and incident workflows. Introduce canary releases for prompt updates with automated rollback on regression.",
              bullets: [
                "A/B test prompt variants with evaluation dashboards",
                "Collect thumbs-up/down feedback tied to retrieved context",
                "Alert when guardrail rejection rates or latency spikes exceed thresholds"
              ]
            }
          ],
          practice: [
            {
              title: "Groundedness Scoring Script",
              steps: [
                "Assemble a dataset of user questions with supporting passages",
                "Run answers through a groundedness scorer comparing citations to retrieved chunks",
                "Visualize failure cases and adjust retrieval filters or prompts"
              ]
            },
            {
              title: "Guardrail Fire Drill",
              steps: [
                "Configure schema validation and sensitive data detectors",
                "Simulate adversarial prompts that should be rejected",
                "Document response templates and escalation paths for each guardrail"
              ]
            }
          ],
          reflection: [
            "Which evaluation metrics correlate best with user satisfaction for your domain?",
            "How will you keep test datasets fresh as knowledge and prompts evolve?",
            "What is your rollback plan when a guardrail starts over-blocking legitimate answers?"
          ],
          projectPrompt:
            "Ship an evaluation control center with dashboards, scheduled regression jobs, and a guardrail policy document that your stakeholders can review before approving launches."
        },
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
        studyGuide: {
          overview:
            "Develop an intuition for how Node.js schedules work across the call stack, microtasks, and libuv phases. You will build visual timelines and instrument code to predict how concurrency primitives interact.",
          objectives: [
            "Describe each phase of the event loop and when callbacks execute",
            "Differentiate macrotask queues, microtask queues, and worker threads",
            "Diagnose starvation, blocking I/O, and memory leaks caused by async misuse"
          ],
          sections: [
            {
              title: "Loop Anatomy",
              detail:
                "Break down timers, pending callbacks, idle/prepare, poll, check, and close phases. Use code snippets to illustrate when setTimeout, setImmediate, and process.nextTick fire relative to synchronous work.",
              bullets: [
                "Timers execute once their threshold has elapsed at the start of each iteration",
                "Poll handles I/O callbacks and can block when the queue is empty",
                "Check runs setImmediate callbacks after poll before closing resources"
              ]
            },
            {
              title: "Microtasks vs Macrotasks",
              detail:
                "Explore how Promises enqueue microtasks that run before the event loop continues. Contrast with macrotasks like timers and I/O callbacks to understand ordering guarantees and pitfalls.",
              bullets: [
                "process.nextTick runs before microtasks and should be used sparingly",
                "Heavy microtask chains can starve I/O if not broken up",
                "await yields back to the event loop, resuming after microtasks flush"
              ]
            },
            {
              title: "Concurrency Patterns",
              detail:
                "Demonstrate worker threads, child processes, and asynchronous iteration. Provide heuristics for when to offload CPU-bound tasks and how to coordinate using message passing.",
              bullets: [
                "Use worker threads for CPU-intensive tasks that must share memory",
                "Child processes suit shell commands and isolated V8 instances",
                "Async generators simplify backpressure-aware stream processing"
              ]
            }
          ],
          practice: [
            {
              title: "Event Loop Timeline",
              steps: [
                "Instrument a script with console timestamps for timers, immediates, and nextTicks",
                "Add asynchronous file reads and observe ordering",
                "Visualize the sequence in a Gantt chart to cement mental models"
              ]
            },
            {
              title: "Worker Thread Experiment",
              steps: [
                "Implement a CPU-heavy hash computation in the main thread and measure latency",
                "Port the work to a worker thread communicating via MessageChannel",
                "Benchmark throughput and document when the worker improves responsiveness"
              ]
            }
          ],
          reflection: [
            "Which parts of your stack risk blocking the event loop today?",
            "How can you detect microtask storms in production monitoring?",
            "When would you choose streams over promises for throughput?"
          ],
          projectPrompt:
            "Create an interactive lab (CLI or web) that visualizes Node.js event loop phases with configurable tasks so teammates can rehearse scheduling scenarios."
        },
        resources: [
          { title: "Node.js Event Loop Guide", url: "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick" },
          { title: "Node.js Async Context", url: "https://nodejs.org/api/async_context.html" }
        ]
      },
      {
        id: "http",
        title: "HTTP Servers",
        summary: "Building resilient REST APIs with core http module and Express.",
        studyGuide: {
          overview:
            "Architect Node.js HTTP services from socket handshake to graceful shutdown. You will implement routing, middleware, and resilience patterns that withstand production traffic and failure scenarios.",
          objectives: [
            "Construct REST endpoints with core http and Express while controlling lifecycle hooks",
            "Apply middleware ordering, error handling, and streaming responses",
            "Implement observability, rate limits, and graceful shutdown for zero-downtime deployments"
          ],
          sections: [
            {
              title: "Request Lifecycle",
              detail:
                "Trace how requests flow from TCP sockets through Node's http parser into your handlers. Compare raw http.createServer to Express routers and note where headers, body parsing, and response writing occur.",
              bullets: [
                "Always set timeouts to avoid hanging sockets",
                "Use stream APIs for large payloads to avoid buffering",
                "Normalize URLs and methods before routing"
              ]
            },
            {
              title: "Middleware and Errors",
              detail:
                "Design middleware stacks for logging, authentication, validation, and error formatting. Emphasize the difference between synchronous and asynchronous error propagation and how to avoid double responses.",
              bullets: [
                "Place error-handling middleware last with four arguments",
                "Return next(err) for async failures instead of throwing",
                "Centralize validation errors into consistent problem+json responses"
              ]
            },
            {
              title: "Operational Hardening",
              detail:
                "Address rate limiting, health checks, graceful shutdown, and configuration management. Discuss Blue/Green and rolling deployments with connection draining.",
              bullets: [
                "Expose /healthz and /readyz endpoints tied to real dependencies",
                "Use signal handlers to stop accepting new connections and finish in-flight requests",
                "Instrument structured logs and metrics (latency, error rate, saturation)"
              ]
            }
          ],
          practice: [
            {
              title: "Build a Core HTTP Service",
              steps: [
                "Implement a JSON API with http.createServer without Express",
                "Add request logging, timeout handling, and error serialization",
                "Load test with autocannon and document bottlenecks"
              ]
            },
            {
              title: "Express Middleware Suite",
              steps: [
                "Create routers with parameterized routes and validation",
                "Add authentication, rate limiting, and centralized error handling",
                "Simulate shutdown signals and verify graceful termination"
              ]
            }
          ],
          reflection: [
            "How do you ensure downstream failures surface as actionable errors?",
            "What telemetry tells you when to scale horizontally versus optimize code?",
            "How does your deployment strategy avoid dropping in-flight requests?"
          ],
          projectPrompt:
            "Deliver a production-ready Express starter that bundles middleware, logging, rate limiting, health checks, and deployment runbooks for your team."
        },
        resources: [
          { title: "Node.js HTTP", url: "https://nodejs.org/api/http.html" },
          { title: "Express Guide", url: "https://expressjs.com/en/guide/routing.html" }
        ]
      },
      {
        id: "testing",
        title: "Testing & Tooling",
        summary: "Using Node test runner, diagnostics channel, and best practices.",
        studyGuide: {
          overview:
            "Build a robust testing and diagnostics toolkit that keeps Node services shippable. Combine unit, integration, and smoke tests with runtime instrumentation so regressions are caught before customers notice.",
          objectives: [
            "Leverage the built-in test runner and assertion libraries for fast feedback",
            "Instrument diagnostics_channel to observe internal Node metrics",
            "Establish CI pipelines, coverage goals, and post-deploy smoke tests"
          ],
          sections: [
            {
              title: "Testing Pyramid",
              detail:
                "Define scope for unit, integration, and contract tests. Highlight when to stub dependencies and when to spin up real services such as PostgreSQL or Redis for confidence.",
              bullets: [
                "Favor isolated unit tests for pure logic",
                "Use integration tests for critical I/O paths and error handling",
                "Adopt contract tests for API consumers and providers"
              ]
            },
            {
              title: "Node Test Runner Essentials",
              detail:
                "Show how to structure test files, use describe/test blocks, and enable watch mode. Discuss mocking with test.mock and using test.todo/test.skip to manage backlog.",
              bullets: [
                "Run tests with node --test for zero-dependency setups",
                "Enable --watch for rapid iteration on local development",
                "Combine with --test-name-pattern to focus on failing suites"
              ]
            },
            {
              title: "Diagnostics & Tooling",
              detail:
                "Tap into diagnostics_channel, perf_hooks, and heap snapshots. Explain how to stream metrics to observability stacks and create dashboards for latency, memory, and async hook usage.",
              bullets: [
                "Subscribe to diagnostics_channel events for HTTP servers and DNS",
                "Capture heap snapshots before and after load tests to detect leaks",
                "Automate flamegraph generation for performance regressions"
              ]
            }
          ],
          practice: [
            {
              title: "CI Pipeline Setup",
              steps: [
                "Configure GitHub Actions to run node --test and coverage reports",
                "Seed integration databases and clean between tests",
                "Fail the pipeline when coverage or lint thresholds drop"
              ]
            },
            {
              title: "Diagnostics Capture",
              steps: [
                "Publish diagnostics_channel data to a log sink",
                "Trigger synthetic load and capture perf_hooks metrics",
                "Summarize findings in a health report shared with the team"
              ]
            }
          ],
          reflection: [
            "Where are your current blind spots in test coverage or monitoring?",
            "How quickly can you reproduce production issues locally using these tools?",
            "Which tests run on every commit versus nightly builds, and why?"
          ],
          projectPrompt:
            "Produce a testing handbook with sample configurations, diagnostics scripts, and CI templates tailored to your service architecture."
        },
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
        studyGuide: {
          overview:
            "Internalize how TypeScript reasons about shapes, control flow, and inference. You will write experiments that reveal how unions, intersections, and literal narrowing behave in real projects.",
          objectives: [
            "Differentiate structural typing from nominal systems and predict assignability",
            "Leverage unions, intersections, and literal types to model domain constraints",
            "Use control flow analysis to narrow types safely in complex branches"
          ],
          sections: [
            {
              title: "Structural Typing Basics",
              detail:
                "Explore how TypeScript compares object shapes, optional properties, and index signatures. Discuss excess property checks and how to design interfaces that encourage safe extension.",
              bullets: [
                "Assignments are compatible when required members align regardless of origin",
                "Excess property checks catch typos in object literals",
                "Use readonly modifiers to protect invariants"
              ]
            },
            {
              title: "Union and Intersection Modeling",
              detail:
                "Model domain variations using discriminated unions and intersections. Highlight pattern matching via switch statements and the role of never for exhaustiveness checks.",
              bullets: [
                "Include a discriminant field to simplify narrowing",
                "Intersections merge capabilities but can produce impossible states—watch for never",
                "Prefer type aliases for complex unions to improve readability"
              ]
            },
            {
              title: "Inference & Narrowing",
              detail:
                "Show how TypeScript infers literal versus widened types, when const assertions help, and how type guards enable precise narrowing across branches and async code.",
              bullets: [
                "Use const assertions to retain literal types for configuration objects",
                "Create custom type guards that return value is SomeType",
                "Leverage satisfies to preserve inference while validating shape"
              ]
            }
          ],
          practice: [
            {
              title: "Union Modeling Kata",
              steps: [
                "Model a checkout flow with discriminated unions for each state",
                "Write exhaustive switch statements and enable noFallthroughCasesInSwitch",
                "Refactor to share behavior via intersection helpers"
              ]
            },
            {
              title: "Inference Lab",
              steps: [
                "Create examples showing how const, readonly, and satisfies affect inference",
                "Add failing tests that demonstrate when types widen unexpectedly",
                "Document patterns that keep inference precise in your codebase"
              ]
            }
          ],
          reflection: [
            "Where do implicit any or widened types still sneak into your project?",
            "How can you express invariants as types rather than runtime checks?",
            "Which helper types or utility functions could your team share?"
          ],
          projectPrompt:
            "Publish a type modeling cookbook with examples, utility types, and guard patterns tailored to your domain models."
        },
        resources: [
          { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/2/basic-types.html" },
          { title: "Generics", url: "https://www.typescriptlang.org/docs/handbook/2/generics.html" }
        ]
      },
      {
        id: "tooling",
        title: "Tooling & Config",
        summary: "Compiler options, project references, and build tooling integration.",
        studyGuide: {
          overview:
            "Configure TypeScript projects that scale. You will master tsconfig composition, incremental builds, and editor tooling so contributors experience fast feedback no matter the repository size.",
          objectives: [
            "Select tsconfig options that enforce quality without slowing compilation",
            "Organize monorepos with project references and composite builds",
            "Integrate bundlers, linters, and editors for smooth developer experience"
          ],
          sections: [
            {
              title: "tsconfig Mastery",
              detail:
                "Walk through essential compiler options including strictness flags, module resolution, and emit settings. Explain how extends works and how to share base configs across packages.",
              bullets: [
                "Enable strict, noImplicitAny, and noUnusedLocals for safer code",
                "Use paths and baseUrl for module resolution in monorepos",
                "Toggle declaration and sourceMap outputs per package needs"
              ]
            },
            {
              title: "Project References",
              detail:
                "Illustrate splitting large codebases into buildable units using references. Show how incremental builds reuse .tsbuildinfo artifacts and how to wire commands for watch and CI.",
              bullets: [
                "Mark referenced projects with composite: true",
                "Run tsc -b to build dependency graphs efficiently",
                "Cache tsbuildinfo to speed up CI pipelines"
              ]
            },
            {
              title: "Toolchain Integration",
              detail:
                "Coordinate ESLint, Prettier, bundlers, and testing frameworks. Discuss esbuild, Vite, and SWC integration along with IDE plugins that consume tsconfig for IntelliSense.",
              bullets: [
                "Align ESLint parser options with tsconfig paths",
                "Use type-checking in CI even if bundlers skip it for dev speed",
                "Provide editorconfig and workspace settings to onboard contributors"
              ]
            }
          ],
          practice: [
            {
              title: "Config Refactor",
              steps: [
                "Audit your current tsconfig files and document differences",
                "Extract a shared base config and apply extends across packages",
                "Measure build times before and after enabling incremental options"
              ]
            },
            {
              title: "Build Pipeline Integration",
              steps: [
                "Wire tsc -b into npm scripts, CI workflows, and editor tasks",
                "Set up Vite or esbuild to respect tsconfig paths and aliases",
                "Add lint and type-check stages that run in parallel for speed"
              ]
            }
          ],
          reflection: [
            "Which compiler flags would catch your team's most frequent bugs?",
            "How will you enforce consistent settings across packages or services?",
            "What automation ensures tsbuildinfo caches stay valid and secure?"
          ],
          projectPrompt:
            "Author a TypeScript platform guide that documents shared configs, build commands, and troubleshooting tips for everyone contributing to the repo."
        },
        resources: [
          { title: "tsconfig Reference", url: "https://www.typescriptlang.org/tsconfig" },
          { title: "Project References", url: "https://www.typescriptlang.org/docs/handbook/project-references.html" }
        ]
      },
      {
        id: "advanced",
        title: "Advanced Types",
        summary: "Conditional types, mapped types, and template literal types.",
        studyGuide: {
          overview:
            "Unlock TypeScript's metaprogramming toolbox. You'll craft conditional, mapped, and template literal types that express invariants previously enforced only at runtime.",
          objectives: [
            "Author conditional types that transform shapes based on generic parameters",
            "Use mapped types to derive readonly, partial, and deeply modified structures",
            "Compose template literal types for string validation and API routing"
          ],
          sections: [
            {
              title: "Conditional Type Patterns",
              detail:
                "Explore distributive conditional types, infer clauses, and pattern matching on tuples. Provide recipes for filtering unions, extracting properties, and modeling API responses.",
              bullets: [
                "Wrap types in tuples to control distributivity",
                "Leverage infer to capture subtypes for later reuse",
                "Combine with extends never checks to produce compile-time errors"
              ]
            },
            {
              title: "Mapped Type Transformations",
              detail:
                "Use keyof, in, and remapping syntax to create utilities like DeepPartial, RequiredKeys, and Record remaps. Discuss preserving modifiers and controlling optionality.",
              bullets: [
                "Use as clauses to rename keys during mapping",
                "Distribute modifiers with -? and +? operators",
                "Compose recursive mapped types carefully to avoid cycles"
              ]
            },
            {
              title: "Template Literal Techniques",
              detail:
                "Validate string formats, route parameters, and event names. Show how to pair with intrinsic string manipulation types Uppercase and CamelCase.",
              bullets: [
                "Model API routes like `/users/${string}` for better autocomplete",
                "Enforce configuration keys via unions of template literals",
                "Use satisfies to ensure runtime strings conform to expected formats"
              ]
            }
          ],
          practice: [
            {
              title: "Utility Type Workshop",
              steps: [
                "Implement custom utility types (Mutable, NonNullableProps, AsyncValue)",
                "Write tests using satisfies to confirm behavior",
                "Document usage examples and limitations"
              ]
            },
            {
              title: "Template Literal Validator",
              steps: [
                "Define template literal unions for feature flag keys",
                "Create helper functions that accept only valid combinations",
                "Refactor runtime string builders to leverage these types"
              ]
            }
          ],
          reflection: [
            "Which advanced types could replace runtime validation in your codebase?",
            "How do you balance readability with type-level complexity?",
            "What documentation helps teammates adopt these patterns responsibly?"
          ],
          projectPrompt:
            "Assemble a typed SDK toolkit featuring advanced utility types, template literal helpers, and sample components that demonstrate type-safe APIs."
        },
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
        studyGuide: {
          overview:
            "Read PostgreSQL execution plans like a detective. You will analyze EXPLAIN output, tune indexes, and trace how data flows through each node so slow queries become predictable to optimize.",
          objectives: [
            "Interpret EXPLAIN and EXPLAIN ANALYZE plans including costs and rows",
            "Choose appropriate index types and maintenance strategies",
            "Identify anti-patterns such as sequential scans, sorts, and nested loops gone wrong"
          ],
          sections: [
            {
              title: "Plan Anatomy",
              detail:
                "Walk through plan nodes—Seq Scan, Index Scan, Bitmap Heap Scan, Hash Join, Merge Join. Decode estimated vs actual rows, width, and cost to understand where estimates diverge from reality.",
              bullets: [
                "Look for nodes where actual time greatly exceeds estimated time",
                "Analyze rows removed by filter to gauge predicate selectivity",
                "Use explain (analyze, buffers) to surface I/O pressure"
              ]
            },
            {
              title: "Index Strategy",
              detail:
                "Compare B-tree, GIN, GiST, BRIN, and hash indexes. Detail maintenance considerations like vacuuming and reindexing, and how to monitor bloating.",
              bullets: [
                "B-tree suits equality and range on ordered columns",
                "GIN accelerates full-text and array containment queries",
                "BRIN indexes shine on append-only, naturally ordered data"
              ]
            },
            {
              title: "Performance Tuning Workflow",
              detail:
                "Establish a repeatable process: capture slow queries, inspect plans, test hypotheses, and validate improvements. Highlight the role of pg_stat_statements and auto_explain.",
              bullets: [
                "Capture baselines before changing indexes or configuration",
                "Test with realistic datasets and parameter combinations",
                "Automate regression tests to prevent plan drift"
              ]
            }
          ],
          practice: [
            {
              title: "Plan Reading Lab",
              steps: [
                "Collect slow query samples from pg_stat_statements",
                "Run EXPLAIN ANALYZE with buffers and analyze hotspots",
                "Apply indexing or query rewrites and measure improvements"
              ]
            },
            {
              title: "Index Maintenance Drill",
              steps: [
                "Create example tables covering text search, geo, and time-series data",
                "Design and benchmark appropriate indexes for each workload",
                "Schedule autovacuum and reindex tasks, documenting thresholds"
              ]
            }
          ],
          reflection: [
            "Where do your estimates diverge most from actual rows, and why?",
            "How will you monitor index bloat and vacuum effectiveness?",
            "What automation ensures plan regressions surface before impacting users?"
          ],
          projectPrompt:
            "Compile a performance engineering dossier with annotated plans, index justifications, and tuning scripts for your mission-critical queries."
        },
        resources: [
          { title: "EXPLAIN Documentation", url: "https://www.postgresql.org/docs/current/using-explain.html" },
          { title: "Indexes", url: "https://www.postgresql.org/docs/current/indexes.html" }
        ]
      },
      {
        id: "data-integrity",
        title: "Data Integrity",
        summary: "Constraints, transactions, and isolation levels.",
        studyGuide: {
          overview:
            "Guarantee correctness through constraints and transactional discipline. You will design schemas that prevent invalid states, understand isolation trade-offs, and script migrations with confidence.",
          objectives: [
            "Select appropriate constraints (PRIMARY KEY, UNIQUE, CHECK, FOREIGN KEY) for business rules",
            "Explain transaction isolation levels and their impact on anomalies",
            "Design retry and idempotency strategies to handle serialization failures"
          ],
          sections: [
            {
              title: "Constraint Toolkit",
              detail:
                "Survey each constraint type with examples. Discuss deferred constraints, partial indexes for uniqueness, and how to surface constraint violations as user-friendly errors.",
              bullets: [
                "Combine CHECK constraints with domains for reusable validation",
                "Use DEFERRABLE INITIALLY DEFERRED when batching related inserts",
                "Monitor pg_constraint catalog to audit schema guarantees"
              ]
            },
            {
              title: "Transactions & Isolation",
              detail:
                "Compare READ COMMITTED, REPEATABLE READ, and SERIALIZABLE with concrete scenarios. Highlight phantom reads, write skew, and how PostgreSQL's SSI implementation differs from theory.",
              bullets: [
                "Default READ COMMITTED suits many workloads but allows non-repeatable reads",
                "REPEATABLE READ prevents re-reading anomalies but may see phantoms",
                "SERIALIZABLE detects conflicts and requires retry logic"
              ]
            },
            {
              title: "Idempotency & Retries",
              detail:
                "Provide patterns for handling serialization failures, network retries, and duplicate requests. Discuss advisory locks, unique request IDs, and upsert strategies.",
              bullets: [
                "Wrap critical transactions with retry loops that detect SQLSTATE 40001",
                "Use INSERT ... ON CONFLICT for idempotent operations",
                "Leverage advisory locks sparingly to coordinate distributed jobs"
              ]
            }
          ],
          practice: [
            {
              title: "Constraint Design Workshop",
              steps: [
                "Model a multi-tenant billing schema with appropriate keys and checks",
                "Simulate invalid operations and confirm constraints block them",
                "Expose constraint errors via API responses with actionable messaging"
              ]
            },
            {
              title: "Isolation Simulation",
              steps: [
                "Write concurrent transactions demonstrating anomalies at each isolation level",
                "Enable SERIALIZABLE and implement retry logic",
                "Capture logs to verify retries resolve conflicts"
              ]
            }
          ],
          reflection: [
            "Where does your application currently rely on application logic instead of database guarantees?",
            "How do you communicate isolation requirements to application developers?",
            "What alerts notify you when constraint violations spike?"
          ],
          projectPrompt:
            "Develop a governance guide that documents mandatory constraints, transaction patterns, and retry libraries for your engineering organization."
        },
        resources: [
          { title: "Constraint Documentation", url: "https://www.postgresql.org/docs/current/ddl-constraints.html" },
          { title: "Transaction Isolation", url: "https://www.postgresql.org/docs/current/transaction-iso.html" }
        ]
      },
      {
        id: "extensions",
        title: "Extensions & Advanced Features",
        summary: "Using extensions like PostGIS and logical replication.",
        studyGuide: {
          overview:
            "Extend PostgreSQL with battle-tested add-ons. You will evaluate extension lifecycles, understand logical replication internals, and plan operational playbooks for advanced capabilities.",
          objectives: [
            "Install and manage extensions responsibly across environments",
            "Leverage PostGIS, pg_trgm, and other popular extensions for real use cases",
            "Configure logical replication, publications, and subscriptions with monitoring"
          ],
          sections: [
            {
              title: "Extension Lifecycle",
              detail:
                "Explain CREATE EXTENSION, version upgrades, and schema placement. Discuss compatibility considerations when using managed database services and how to track extension usage.",
              bullets: [
                "Document which extensions are approved for production",
                "Pin versions and plan migrations for upgrades",
                "Audit pg_available_extensions and pg_extension regularly"
              ]
            },
            {
              title: "Feature Deep Dives",
              detail:
                "Showcase PostGIS for geospatial queries, pg_trgm for fuzzy search, and pg_stat_statements for performance insights. Provide schema examples and query patterns.",
              bullets: [
                "PostGIS adds geography types, spatial indexes, and ST_* functions",
                "pg_trgm improves ILIKE searches with similarity operators",
                "pg_stat_statements captures query fingerprints and execution stats"
              ]
            },
            {
              title: "Logical Replication",
              detail:
                "Demystify publications, subscriptions, and replication slots. Outline use cases for read scaling, zero-downtime upgrades, and data pipelines, including conflict handling.",
              bullets: [
                "Choose publication tables carefully to avoid unnecessary load",
                "Monitor replication lag and slot disk usage",
                "Plan conflict resolution strategies for bi-directional replication"
              ]
            }
          ],
          practice: [
            {
              title: "Extension Enablement",
              steps: [
                "Enable PostGIS in a sandbox and load sample geo data",
                "Create spatial indexes and run distance/containment queries",
                "Evaluate performance impact versus plain SQL approaches"
              ]
            },
            {
              title: "Replication Lab",
              steps: [
                "Set up logical replication between two databases",
                "Inject schema changes and observe replication behavior",
                "Simulate failures (network, lag) and rehearse recovery procedures"
              ]
            }
          ],
          reflection: [
            "Which extensions align with your product roadmap and why?",
            "How will you validate extension compatibility during upgrades?",
            "What monitoring ensures replication stays healthy under load?"
          ],
          projectPrompt:
            "Author an extension catalog documenting approved modules, operational runbooks, and replication topologies for your platform."
        },
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
        studyGuide: {
          overview:
            "Understand every byte exchanged before a WebRTC call connects. You'll script signaling negotiations, decode SDP, and troubleshoot ICE flows without needing external cheat sheets.",
          objectives: [
            "Explain the signaling process, SDP structure, and ICE candidate exchange",
            "Implement offer/answer negotiation with renegotiation scenarios",
            "Log and debug signaling failures end-to-end"
          ],
          sections: [
            {
              title: "Offer/Answer Basics",
              detail:
                "Break down createOffer, setLocalDescription, and remote description application. Highlight mandatory SDP fields, codecs negotiation, and bundle policies.",
              bullets: [
                "Always wait for setLocalDescription to resolve before sending SDP",
                "Use unified-plan semantics and transceivers for fine-grained control",
                "Handle rollback for glare (simultaneous offers) gracefully"
              ]
            },
            {
              title: "ICE Candidate Flow",
              detail:
                "Trace candidate gathering, trickle ICE, and connectivity checks. Describe candidate types (host, srflx, relay) and priorities.",
              bullets: [
                "Listen for icecandidate events until null is emitted",
                "Buffer remote candidates until remote description is set",
                "Surface candidate pair selection and failures in logs"
              ]
            },
            {
              title: "Signaling Transport",
              detail:
                "Design the signaling channel using WebSocket or REST fallbacks. Discuss message schemas, retry policies, authentication, and ordering guarantees.",
              bullets: [
                "Include message types (offer, answer, candidate, bye) with correlation IDs",
                "Persist session metadata for reconnects and analytics",
                "Secure signaling with auth tokens and rate limiting"
              ]
            }
          ],
          practice: [
            {
              title: "SDP Dissection",
              steps: [
                "Capture real SDP blobs from a peer connection",
                "Annotate each section (m=, a=) and map to media tracks",
                "Modify codec priorities and observe renegotiation effects"
              ]
            },
            {
              title: "Signaling Simulator",
              steps: [
                "Implement a local signaling server with WebSocket",
                "Add logging and replay features for ICE candidate exchanges",
                "Simulate glare and verify rollback handling"
              ]
            }
          ],
          reflection: [
            "How will you detect and recover from negotiation failures in production?",
            "What happens when peers reconnect mid-call and how do you re-sync state?",
            "Which metrics confirm your signaling channel is reliable under load?"
          ],
          projectPrompt:
            "Deliver a signaling handbook with message schemas, sequence diagrams, and troubleshooting flows for your real-time application."
        },
        resources: [
          { title: "WebRTC Overview", url: "https://webrtc.org/getting-started/overview" },
          { title: "WebRTC SDP", url: "https://webrtc.org/getting-started/learn-webrtc/" }
        ]
      },
      {
        id: "media",
        title: "Media & Data Channels",
        summary: "Tracks, codecs, and data channel reliability modes.",
        studyGuide: {
          overview:
            "Master the APIs that move audio, video, and data. You'll orchestrate tracks, transceivers, and RTCDataChannels while tuning codecs and reliability settings for your use case.",
          objectives: [
            "Manage media tracks, streams, and transceivers for send/receive control",
            "Configure codecs, simulcast, and bandwidth constraints",
            "Design RTCDataChannel usage with appropriate reliability and backpressure handling"
          ],
          sections: [
            {
              title: "Track & Stream Management",
              detail:
                "Clarify the relationship between MediaStream, MediaStreamTrack, and RTCRtpSender/Receiver. Discuss muting, replacing tracks, and reacting to ontrack events.",
              bullets: [
                "Use addTrack/removeTrack or addTransceiver for explicit control",
                "Handle track ended events to update UI gracefully",
                "Leverage getStats to inspect bitrate and packet loss per track"
              ]
            },
            {
              title: "Codec & Bandwidth Tuning",
              detail:
                "Explore SDP munging versus setParameters for codec selection, simulcast layers, and bitrate caps. Emphasize adaptive bitrate strategies for unstable networks.",
              bullets: [
                "Prefer setParameters over SDP munging when supported",
                "Enable simulcast or SVC for multi-resolution streaming",
                "Monitor RTCP feedback to adjust bandwidth dynamically"
              ]
            },
            {
              title: "RTCDataChannel Patterns",
              detail:
                "Design data channels for chat, game state, and file transfer. Explain ordered/unordered and reliable/partial reliability modes and how to avoid overwhelming the send buffer.",
              bullets: [
                "Check bufferedAmount and await bufferedAmountLowThreshold events",
                "Use unordered, unreliable modes for latency-sensitive updates",
                "Serialize messages with schema validation before sending"
              ]
            }
          ],
          practice: [
            {
              title: "Media Dashboard",
              steps: [
                "Build a UI displaying active tracks, codecs, and bitrates",
                "Toggle mute, replace tracks, and observe renegotiation",
                "Simulate bandwidth changes and record adaptive behavior"
              ]
            },
            {
              title: "Data Channel Lab",
              steps: [
                "Create reliable and unreliable data channels",
                "Transfer files, chat messages, and game updates while monitoring bufferedAmount",
                "Implement backpressure handling with queued promises"
              ]
            }
          ],
          reflection: [
            "How will you detect media quality degradation in real time?",
            "Which codecs best serve your audience's devices and bandwidth?",
            "What strategies prevent data channel congestion under heavy load?"
          ],
          projectPrompt:
            "Produce a media operations guide covering track management, codec choices, and data channel conventions for your real-time team."
        },
        resources: [
          { title: "WebRTC Media", url: "https://webrtc.org/getting-started/media-capture-and-production" },
          { title: "RTCDataChannel Spec", url: "https://w3c.github.io/webrtc-pc/#rtcdatachannel" }
        ]
      },
      {
        id: "network",
        title: "Networking & STUN/TURN",
        summary: "NAT traversal, STUN, TURN, and ICE candidate prioritization.",
        studyGuide: {
          overview:
            "Engineer connectivity strategies that thrive behind firewalls and NATs. You'll configure STUN/TURN infrastructure, interpret ICE diagnostics, and harden connectivity monitoring.",
          objectives: [
            "Describe how ICE gathers, prioritizes, and selects candidates",
            "Deploy and tune STUN/TURN servers for global audiences",
            "Monitor connectivity quality and react to network failures"
          ],
          sections: [
            {
              title: "NAT Traversal Fundamentals",
              detail:
                "Review NAT types (full cone, restricted, symmetric) and how STUN discovers public-facing addresses. Explain why TURN relays are necessary in hostile environments.",
              bullets: [
                "STUN provides reflexive candidates but fails on symmetric NAT",
                "TURN relays traffic through publicly reachable servers",
                "ICE prioritizes host > srflx > relay by default"
              ]
            },
            {
              title: "TURN Operations",
              detail:
                "Discuss TURN authentication, allocation lifetimes, and bandwidth planning. Cover HA strategies, geographic distribution, and TLS/DTLS considerations.",
              bullets: [
                "Use long-term credentials with short TTLs for security",
                "Size TURN clusters based on peak relay bandwidth",
                "Enable TCP and TLS relaying for corporate firewall compatibility"
              ]
            },
            {
              title: "Diagnostics & Monitoring",
              detail:
                "Instrument getStats, connectivity events, and TURN usage metrics. Provide troubleshooting checklists for failed ICE states and high packet loss.",
              bullets: [
                "Log iceconnectionstatechange transitions and timestamps",
                "Track relay usage percentage to plan scaling",
                "Alert on sustained packet loss or frequent ICE restarts"
              ]
            }
          ],
          practice: [
            {
              title: "Connectivity Matrix",
              steps: [
                "Test connections across NAT types using open testing tools",
                "Record which candidate pairs succeed and latency observed",
                "Document mitigation steps for failing scenarios"
              ]
            },
            {
              title: "TURN Deployment",
              steps: [
                "Set up coturn with TLS, user quotas, and logging",
                "Simulate load to benchmark relay throughput and latency",
                "Automate health checks and alerts for server outages"
              ]
            }
          ],
          reflection: [
            "What percentage of your sessions rely on TURN today?",
            "How will you detect regional outages or ISP-level blocking?",
            "Which fallbacks exist when ICE fails completely?"
          ],
          projectPrompt:
            "Produce a network resiliency playbook covering STUN/TURN topology, scaling plans, and incident response steps for real-time outages."
        },
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
        studyGuide: {
          overview:
            "Learn the WebSocket protocol from upgrade handshake to frame parsing. You'll dissect headers, opcodes, and backpressure controls while building client and server tooling.",
          objectives: [
            "Perform HTTP upgrade handshakes and validate security requirements",
            "Parse and construct WebSocket frames including control frames",
            "Manage backpressure, heartbeats, and resource cleanup"
          ],
          sections: [
            {
              title: "Handshake Mechanics",
              detail:
                "Detail the client request with Sec-WebSocket-Key, server acceptance with Sec-WebSocket-Accept, and status 101. Discuss origin checks, subprotocols, and extensions.",
              bullets: [
                "Verify origin headers for browser security",
                "Respond with correct Sec-WebSocket-Accept using SHA-1",
                "Negotiate permessage-deflate cautiously due to CPU cost"
              ]
            },
            {
              title: "Frame Lifecycle",
              detail:
                "Explain frame opcodes, masking, fragmentation, and control frame rules. Provide examples for ping/pong, close codes, and binary frames.",
              bullets: [
                "Clients must mask payloads; servers must reject unmasked frames",
                "Close frames include status codes—handle gracefully",
                "Fragmented messages require reassembly before processing"
              ]
            },
            {
              title: "Operational Concerns",
              detail:
                "Discuss connection limits, heartbeats, and backpressure. Show how to integrate with load balancers and gracefully shut down servers without dropping messages.",
              bullets: [
                "Implement ping/pong heartbeats and disconnect idle clients",
                "Monitor bufferedAmount to avoid overwhelming slow clients",
                "Use sticky sessions or consistent hashing when scaling"
              ]
            }
          ],
          practice: [
            {
              title: "Protocol Tracing",
              steps: [
                "Capture handshake requests/responses with a proxy",
                "Decode frames using Wireshark or custom scripts",
                "Simulate protocol violations and observe server defenses"
              ]
            },
            {
              title: "Backpressure Harness",
              steps: [
                "Build a client that reads slowly and observe bufferedAmount",
                "Implement flow control to pause/resume writes",
                "Record metrics on dropped connections or queue growth"
              ]
            }
          ],
          reflection: [
            "How will you detect handshake abuse or origin spoofing attempts?",
            "What instrumentation reveals backpressure issues early?",
            "How do you drain WebSocket connections during deployments?"
          ],
          projectPrompt:
            "Create a WebSocket protocol toolkit featuring handshake validators, frame decoders, and operational dashboards."
        },
        resources: [
          { title: "WHATWG WebSocket API", url: "https://html.spec.whatwg.org/multipage/web-sockets.html" },
          { title: "WebSocket Interface", url: "https://html.spec.whatwg.org/multipage/web-sockets.html#the-websocket-interface" }
        ]
      },
      {
        id: "socketio",
        title: "Socket.IO Patterns",
        summary: "Namespaces, rooms, and event acknowledgement flows.",
        studyGuide: {
          overview:
            "Harness Socket.IO's higher-level abstractions for realtime collaboration. You'll architect namespaces, rooms, and acknowledgements with attention to performance and maintainability.",
          objectives: [
            "Design namespace boundaries and authentication strategies",
            "Leverage rooms for targeted broadcasts and state partitioning",
            "Implement acknowledgement workflows with error handling"
          ],
          sections: [
            {
              title: "Namespaces & Auth",
              detail:
                "Plan namespace usage for multi-tenant apps or feature isolation. Discuss middleware for authentication, authorization, and rate limiting at connection time.",
              bullets: [
                "Use middleware to validate tokens before connection succeeds",
                "Separate admin and public traffic into different namespaces",
                "Log connection/disconnection events with metadata"
              ]
            },
            {
              title: "Rooms & Broadcasts",
              detail:
                "Explain join/leave semantics, adapters, and room-level broadcasting. Cover patterns for presence, ephemeral rooms, and cleanup on disconnect.",
              bullets: [
                "Join rooms based on tenant, document, or game session IDs",
                "Leverage adapters (Redis) for horizontal scalability",
                "Handle disconnect to remove stale membership"
              ]
            },
            {
              title: "Acknowledgements & Reliability",
              detail:
                "Use acknowledgements to confirm delivery and handle errors. Demonstrate emitWithAck, timeout handling, and retry logic for mission-critical events.",
              bullets: [
                "Wrap emitWithAck in promise utilities with timeouts",
                "Return structured error objects from acknowledgements",
                "Record metrics on success/failure rates per event"
              ]
            }
          ],
          practice: [
            {
              title: "Namespace Blueprint",
              steps: [
                "Design namespace hierarchy for an application with admin and user roles",
                "Implement auth middleware and test with invalid tokens",
                "Instrument connection metrics by namespace"
              ]
            },
            {
              title: "Reliable Broadcast",
              steps: [
                "Build a collaborative feature using rooms and acknowledgements",
                "Simulate failures and measure retry effectiveness",
                "Document SLAs for event delivery"
              ]
            }
          ],
          reflection: [
            "How will you scale rooms across clusters while keeping membership in sync?",
            "Which events require acknowledgements and which can be fire-and-forget?",
            "What monitoring ensures namespaces stay healthy and authorized?"
          ],
          projectPrompt:
            "Publish a Socket.IO integration guide covering namespaces, rooms, ack patterns, and operational metrics for your product."
        },
        resources: [
          { title: "Socket.IO Rooms", url: "https://socket.io/docs/v4/rooms" },
          { title: "Socket.IO Emit Cheat Sheet", url: "https://socket.io/docs/v4/emit-cheatsheet" }
        ]
      },
      {
        id: "resilience",
        title: "Resilience & Scaling",
        summary: "Handling reconnection, backpressure, and horizontal scaling.",
        studyGuide: {
          overview:
            "Ship realtime systems that recover gracefully. You'll plan reconnection strategies, coordinate horizontal scaling, and implement observability for socket fleets.",
          objectives: [
            "Implement reconnection policies with jitter and state resynchronization",
            "Scale WebSocket/Socket.IO infrastructure across nodes",
            "Monitor latency, error rates, and fan-out pressure"
          ],
          sections: [
            {
              title: "Reconnection Strategies",
              detail:
                "Design client-side logic with exponential backoff, jitter, and offline detection. Show how to restore state after reconnect and handle missed events.",
              bullets: [
                "Persist pending messages locally during disconnects",
                "Use sequence numbers or timestamps to request deltas",
                "Display user feedback during reconnection attempts"
              ]
            },
            {
              title: "Horizontal Scaling",
              detail:
                "Coordinate socket state across pods using adapters and sticky sessions. Cover load balancer configuration, autoscaling triggers, and cross-region considerations.",
              bullets: [
                "Use Redis or message queues to share room events across nodes",
                "Configure load balancers with session affinity for WebSockets",
                "Replicate presence data to avoid split-brain scenarios"
              ]
            },
            {
              title: "Observability & Incident Response",
              detail:
                "Set up metrics, tracing, and alerting for realtime workloads. Document runbooks for spikes, adapter outages, and cascading disconnects.",
              bullets: [
                "Track connection counts, message throughput, and latencies",
                "Alert on reconnect loops or high error rates",
                "Simulate failovers during game days to validate playbooks"
              ]
            }
          ],
          practice: [
            {
              title: "Chaos Drill",
              steps: [
                "Introduce packet loss and latency via network emulation",
                "Observe client reconnection behavior and adjust backoff",
                "Record metrics to validate resilience objectives"
              ]
            },
            {
              title: "Scaling Experiment",
              steps: [
                "Deploy multiple Socket.IO nodes with Redis adapter",
                "Load test broadcast scenarios and measure propagation time",
                "Tune autoscaling thresholds and connection caps"
              ]
            }
          ],
          reflection: [
            "How will you keep session state consistent when nodes churn?",
            "Which alerts guarantee you're paged before users notice issues?",
            "What documentation teaches on-call engineers to execute playbooks confidently?"
          ],
          projectPrompt:
            "Deliver a realtime resiliency manual with reconnection algorithms, scaling patterns, and dashboards ready for operations teams."
        },
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
        studyGuide: {
          overview:
            "Command the Kubernetes control plane with confidence. You'll map every component, deploy workloads with rollout strategies, and troubleshoot the cluster like an SRE.",
          objectives: [
            "Describe control plane components and how they interact",
            "Deploy workloads using Deployments, StatefulSets, and Jobs appropriately",
            "Observe cluster health and debug scheduling issues"
          ],
          sections: [
            {
              title: "Control Plane Tour",
              detail:
                "Break down kube-apiserver, etcd, controller-manager, scheduler, and kubelet. Explain API requests, reconciliation loops, and admission control.",
              bullets: [
                "API server is the front door secured by RBAC",
                "Controllers drive desired state by watching resources",
                "Scheduler assigns pods based on resource requests and policies"
              ]
            },
            {
              title: "Workload Patterns",
              detail:
                "Compare Deployment rollouts, StatefulSet identity, DaemonSets, and Jobs/CronJobs. Provide guidance on probes, resource requests/limits, and config management.",
              bullets: [
                "Use readiness probes to gate traffic",
                "Set resource requests to inform scheduling and limits to cap usage",
                "Mount ConfigMaps/Secrets for configuration without baking into images"
              ]
            },
            {
              title: "Troubleshooting Toolkit",
              detail:
                "Use kubectl commands, events, and logs to diagnose issues. Introduce metrics-server, kube-state-metrics, and debugging pods with ephemeral containers.",
              bullets: [
                "Check kubectl get events for scheduling failures",
                "Describe pods and nodes to inspect conditions and taints",
                "Use kubectl debug to exec into ephemeral containers for triage"
              ]
            }
          ],
          practice: [
            {
              title: "Rollout Drill",
              steps: [
                "Deploy a sample app with a Deployment",
                "Perform a rolling update with maxUnavailable/maxSurge tuning",
                "Trigger a failed rollout and practice rollback"
              ]
            },
            {
              title: "Scheduler Investigation",
              steps: [
                "Create pods with conflicting resource requests and node selectors",
                "Observe pending pods and analyze scheduler events",
                "Adjust affinities/taints to resolve placement"
              ]
            }
          ],
          reflection: [
            "Which workloads in your org need StatefulSets versus Deployments?",
            "How will you monitor control plane health during incidents?",
            "What automation enforces resource request standards?"
          ],
          projectPrompt:
            "Document a Kubernetes runbook covering architecture diagrams, rollout policies, and debugging commands tailored to your clusters."
        },
        resources: [
          { title: "Kubernetes Components", url: "https://kubernetes.io/docs/concepts/overview/components/" },
          { title: "Deployments", url: "https://kubernetes.io/docs/concepts/workloads/controllers/deployment/" }
        ]
      },
      {
        id: "platform",
        title: "Platform Tooling",
        summary: "Docker, CI/CD on GitHub, and GCP compute services.",
        studyGuide: {
          overview:
            "Build a platform toolbox that ships code from laptop to cloud. You'll standardize Docker images, GitHub Actions workflows, and GCP deployment patterns with detailed runbooks.",
          objectives: [
            "Craft secure, efficient Docker images with layering best practices",
            "Automate CI/CD pipelines on GitHub Actions with testing and deployment gates",
            "Map workloads to the right GCP compute offerings and infrastructure-as-code"
          ],
          sections: [
            {
              title: "Docker Image Engineering",
              detail:
                "Design multi-stage builds, dependency caching, and security scanning. Discuss base image choices, entrypoints, and runtime configuration.",
              bullets: [
                "Use multi-stage builds to keep runtime images slim",
                "Pin image tags and run vulnerability scans (Trivy, GCR scanning)",
                "Inject configuration via environment variables and secrets"
              ]
            },
            {
              title: "CI/CD Pipelines",
              detail:
                "Author GitHub Actions workflows with reusable actions, caching, and environments. Cover branch protections, approvals, and secrets management.",
              bullets: [
                "Cache dependencies with actions/cache to speed builds",
                "Use environments for staging/production with required reviewers",
                "Store secrets in GitHub or GCP Secret Manager, never in repo"
              ]
            },
            {
              title: "GCP Deployment Patterns",
              detail:
                "Evaluate Cloud Run, GKE, and Compute Engine for workloads. Discuss Terraform or Pulumi for reproducible infrastructure and how to integrate with CI/CD.",
              bullets: [
                "Use Cloud Run for stateless HTTP services with autoscaling",
                "Choose GKE for container orchestration with custom networking",
                "Manage infra via Terraform modules committed to source control"
              ]
            }
          ],
          practice: [
            {
              title: "Container Pipeline",
              steps: [
                "Write a multi-stage Dockerfile and build locally",
                "Push to Artifact Registry and scan for vulnerabilities",
                "Deploy to Cloud Run via GitHub Actions with approvals"
              ]
            },
            {
              title: "CI/CD Audit",
              steps: [
                "Review existing workflows for caching, test coverage, and secrets",
                "Add status checks and deployment locks",
                "Document rollback procedures in workflow notes"
              ]
            }
          ],
          reflection: [
            "Where can build times be reduced through caching or parallelization?",
            "How do you enforce security scanning across images and pipelines?",
            "Which GCP services align with your latency, cost, and scalability goals?"
          ],
          projectPrompt:
            "Deliver a platform playbook that includes Docker templates, GitHub Actions examples, and GCP deployment reference architectures."
        },
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
        studyGuide: {
          overview:
            "Design data movement layers that are fast and fault-tolerant. You'll architect messaging topologies, caching hierarchies, and resilience strategies for distributed systems.",
          objectives: [
            "Model event-driven workflows with Pub/Sub semantics and delivery guarantees",
            "Apply caching patterns (read-through, write-through, cache-aside) with Redis",
            "Implement resilience tactics such as circuit breakers, retries, and dead letter queues"
          ],
          sections: [
            {
              title: "Messaging Patterns",
              detail:
                "Survey fan-out, fan-in, request/reply, and event sourcing using Cloud Pub/Sub or similar brokers. Discuss ordering keys, deduplication, and exactly-once aspirations.",
              bullets: [
                "Use ordering keys for per-entity sequencing",
                "Design idempotent consumers to handle at-least-once delivery",
                "Track message age and retry counts for SLOs"
              ]
            },
            {
              title: "Caching Strategies",
              detail:
                "Compare caching patterns and eviction policies. Highlight TTL tuning, cache warming, and invalidation triggers to keep data fresh.",
              bullets: [
                "Cache-aside lets applications control population",
                "Write-through keeps cache and source in sync at cost of latency",
                "Use key namespaces and hashing to avoid collisions"
              ]
            },
            {
              title: "Resilience & Observability",
              detail:
                "Implement retries with exponential backoff, circuit breakers, and dead letter queues. Instrument metrics for throughput, lag, and cache hit rates.",
              bullets: [
                "Set retry policies with jitter to avoid thundering herds",
                "Route poison messages to DLQs with alerting",
                "Monitor cache hit/miss ratios and eviction counts"
              ]
            }
          ],
          practice: [
            {
              title: "Event Pipeline",
              steps: [
                "Publish events to Pub/Sub with ordering keys",
                "Build consumers that checkpoint progress and handle retries",
                "Simulate failures and inspect DLQs"
              ]
            },
            {
              title: "Cache Tuning",
              steps: [
                "Implement cache-aside and write-through for a sample service",
                "Measure latency improvements and hit ratios",
                "Add eviction policies and document invalidation workflows"
              ]
            }
          ],
          reflection: [
            "Which data flows require strong ordering or deduplication?",
            "How will you detect cache stampedes or stale entries?",
            "What runbooks exist for draining DLQs and backfills?"
          ],
          projectPrompt:
            "Author a messaging and caching architecture guide with diagrams, runbooks, and sample code for your services."
        },
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
