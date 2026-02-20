---
sidebar_position: 3
title: Agent SDK 심화
description: Agent SDK의 스트리밍, 에러 핸들링, 상태 관리 등 고급 패턴으로 프로덕션 수준의 에이전트 시스템을 구축합니다.
---

# Agent SDK 심화

레벨 4에서 `query()` 기본 사용법을 배웠다면, 여기서는 **프로덕션 수준의 에이전트 시스템**에 필요한 심화 패턴을 다룹니다.

## 스트리밍 처리

긴 작업을 실시간으로 사용자에게 보여주기:

```typescript
import { query, SDKMessage } from "@anthropic-ai/claude-code";

async function streamingQuery(prompt: string) {
  const messages: SDKMessage[] = [];

  for await (const message of query({
    prompt,
    options: { maxTurns: 10 }
  })) {
    messages.push(message);

    // 실시간 출력
    if (message.type === "assistant") {
      for (const block of message.content) {
        if (block.type === "text") {
          process.stdout.write(block.text);
        }
      }
    }

    // 도구 사용 현황 추적
    if (message.type === "tool_use") {
      console.log(`\n🔧 도구 사용: ${message.name}`);
    }
  }

  return messages;
}
```

## 고급 에러 핸들링

### 재시도 로직

```typescript
import { query } from "@anthropic-ai/claude-code";

interface RetryOptions {
  maxRetries: number;
  backoffMs: number;
  onRetry?: (attempt: number, error: Error) => void;
}

async function queryWithRetry(
  prompt: string,
  retryOptions: RetryOptions = { maxRetries: 3, backoffMs: 1000 }
): Promise<any[]> {
  let lastError: Error;

  for (let attempt = 1; attempt <= retryOptions.maxRetries; attempt++) {
    try {
      const messages: any[] = [];
      for await (const msg of query({ prompt, options: { maxTurns: 15 } })) {
        messages.push(msg);
      }
      return messages;
    } catch (error) {
      lastError = error as Error;
      retryOptions.onRetry?.(attempt, lastError);

      if (attempt < retryOptions.maxRetries) {
        const delay = retryOptions.backoffMs * Math.pow(2, attempt - 1);
        console.log(`⏳ ${delay}ms 후 재시도 (${attempt}/${retryOptions.maxRetries})...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  throw new Error(`${retryOptions.maxRetries}번 시도 후 실패: ${lastError!.message}`);
}
```

### 타임아웃 처리

```typescript
async function queryWithTimeout(
  prompt: string,
  timeoutMs: number = 60000
): Promise<any[]> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`타임아웃: ${timeoutMs}ms 초과`)), timeoutMs);
  });

  const queryPromise = (async () => {
    const messages: any[] = [];
    for await (const msg of query({ prompt, options: { maxTurns: 20 } })) {
      messages.push(msg);
    }
    return messages;
  })();

  return Promise.race([queryPromise, timeoutPromise]);
}
```

## 상태 관리 패턴

### 에이전트 세션 관리

```typescript
import { query } from "@anthropic-ai/claude-code";

interface AgentSession {
  id: string;
  history: Array<{ prompt: string; result: string; timestamp: Date }>;
  context: Record<string, any>;
}

class AgentSessionManager {
  private sessions = new Map<string, AgentSession>();

  createSession(id: string): AgentSession {
    const session: AgentSession = {
      id,
      history: [],
      context: {}
    };
    this.sessions.set(id, session);
    return session;
  }

  async runWithSession(sessionId: string, prompt: string): Promise<string> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`세션 없음: ${sessionId}`);

    // 이전 컨텍스트 포함
    const contextSummary = session.history.length > 0
      ? `이전 작업 요약:\n${session.history
          .slice(-3) // 최근 3개만
          .map(h => `- ${h.prompt}: ${h.result.slice(0, 100)}...`)
          .join("\n")}\n\n`
      : "";

    const fullPrompt = contextSummary + prompt;

    const messages: any[] = [];
    for await (const msg of query({ prompt: fullPrompt, options: { maxTurns: 15 } })) {
      messages.push(msg);
    }

    const result = extractText(messages);

    // 히스토리 업데이트
    session.history.push({
      prompt,
      result,
      timestamp: new Date()
    });

    return result;
  }

  getSession(id: string): AgentSession | undefined {
    return this.sessions.get(id);
  }
}

// 사용
const manager = new AgentSessionManager();
const session = manager.createSession("project-alpha");
await manager.runWithSession("project-alpha", "src/ 폴더 구조 분석해줘");
await manager.runWithSession("project-alpha", "발견한 이슈들을 수정해줘");
```

## 동적 도구 제어

작업 단계별로 허용 도구를 동적으로 변경:

```typescript
import { query } from "@anthropic-ai/claude-code";

const TOOL_PRESETS = {
  readOnly: ["Read", "Glob", "Grep"],
  analyze: ["Read", "Glob", "Grep", "Bash"],
  write: ["Read", "Edit", "Write", "Bash"],
  full: ["Read", "Edit", "Write", "Bash", "Glob", "Grep"]
} as const;

async function phaseBasedExecution(codebase: string) {
  // Phase 1: 읽기 전용으로 분석
  console.log("Phase 1: 코드베이스 분석 (읽기 전용)");
  const analysis = await query({
    prompt: `${codebase}를 분석해서 개선이 필요한 파일 목록을 JSON으로 출력해줘`,
    options: {
      allowedTools: [...TOOL_PRESETS.readOnly],
      maxTurns: 10
    }
  });

  // Phase 2: 실제 수정
  console.log("Phase 2: 코드 수정 (쓰기 허용)");
  const fixes = await query({
    prompt: `다음 분석 결과를 바탕으로 수정을 진행해줘:\n${extractText(analysis)}`,
    options: {
      allowedTools: [...TOOL_PRESETS.write],
      maxTurns: 30
    }
  });

  return extractText(fixes);
}
```

## 메트릭 수집

에이전트 성능 측정:

```typescript
interface AgentMetrics {
  totalTurns: number;
  toolsUsed: Record<string, number>;
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
}

async function queryWithMetrics(
  prompt: string
): Promise<{ result: string; metrics: AgentMetrics }> {
  const startTime = Date.now();
  const metrics: AgentMetrics = {
    totalTurns: 0,
    toolsUsed: {},
    durationMs: 0,
    inputTokens: 0,
    outputTokens: 0
  };
  const messages: any[] = [];

  for await (const msg of query({ prompt, options: { maxTurns: 20 } })) {
    messages.push(msg);

    if (msg.type === "assistant") {
      metrics.totalTurns++;
    }
    if (msg.type === "tool_use") {
      metrics.toolsUsed[msg.name] = (metrics.toolsUsed[msg.name] || 0) + 1;
    }
    // 토큰 사용량 (usage 필드가 있는 경우)
    if (msg.usage) {
      metrics.inputTokens += msg.usage.input_tokens || 0;
      metrics.outputTokens += msg.usage.output_tokens || 0;
    }
  }

  metrics.durationMs = Date.now() - startTime;

  return {
    result: extractText(messages),
    metrics
  };
}

// 사용
const { result, metrics } = await queryWithMetrics("src/ 전체 코드 리뷰해줘");
console.log(`완료: ${metrics.durationMs}ms, ${metrics.totalTurns}턴, 도구: ${JSON.stringify(metrics.toolsUsed)}`);
```

## 큐 기반 작업 관리

대량 작업을 큐로 처리:

```typescript
import { query } from "@anthropic-ai/claude-code";

class AgentQueue {
  private queue: Array<{ prompt: string; resolve: Function; reject: Function }> = [];
  private running = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  async add(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.queue.push({ prompt, resolve, reject });
      this.process();
    });
  }

  private async process() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) return;

    const task = this.queue.shift()!;
    this.running++;

    try {
      const messages: any[] = [];
      for await (const msg of query({ prompt: task.prompt, options: { maxTurns: 15 } })) {
        messages.push(msg);
      }
      task.resolve(extractText(messages));
    } catch (err) {
      task.reject(err);
    } finally {
      this.running--;
      this.process(); // 다음 태스크 처리
    }
  }
}

// 사용: 최대 3개 동시 실행
const agentQueue = new AgentQueue(3);
const tasks = files.map(file =>
  agentQueue.add(`${file} 파일의 버그를 찾아줘`)
);
const results = await Promise.all(tasks);
```

:::tip 프로덕션 체크리스트
- [ ] 모든 에러에 재시도 로직 적용
- [ ] 타임아웃으로 무한 대기 방지
- [ ] 메트릭 수집으로 비용 추적
- [ ] 큐로 동시 실행 수 제한 (API 속도 제한 대비)
- [ ] 로그에 세션 ID 포함 (추적 가능성)
:::

---

다음 챕터: [커스텀 서브에이전트 →](/docs/level-5/custom-subagents)
