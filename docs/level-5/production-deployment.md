---
sidebar_position: 7
title: 프로덕션 배포
description: Claude 기반 AI 시스템을 프로덕션 환경에 안전하고 안정적으로 배포하기 위한 아키텍처, 모니터링, 운영 전략을 다룹니다.
---

# 프로덕션 배포

Claude 기반 시스템을 프로덕션에 배포하는 것은 일반 소프트웨어 배포보다 고려할 사항이 많습니다. **비결정적 응답, 비용, API 안정성, 응답 속도** 등 AI 특유의 도전 과제를 다룹니다.

## 프로덕션 아키텍처

```
[클라이언트]
     ↓
[API Gateway] — 인증, Rate Limit, 로깅
     ↓
[AI Middleware Layer]
  ├── 프롬프트 템플릿 관리
  ├── 캐시 레이어 (Redis)
  ├── 큐 (Bull/BullMQ)
  └── 비용 추적
     ↓
[Anthropic API] — Claude 모델
     ↓
[응답 후처리]
  ├── 출력 검증
  ├── 포맷 변환
  └── 로그 저장
```

## 환경 변수 관리

```bash
# .env.production
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-6
CLAUDE_MAX_TOKENS=4096
CLAUDE_TIMEOUT_MS=30000
CLAUDE_MAX_RETRIES=3

# 비용 제한
DAILY_BUDGET_USD=100
MONTHLY_BUDGET_USD=2000

# 캐싱
REDIS_URL=redis://...
CACHE_TTL_SECONDS=3600
```

```typescript
// config.ts
export const config = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
    maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS || "4096"),
    timeoutMs: parseInt(process.env.CLAUDE_TIMEOUT_MS || "30000"),
    maxRetries: parseInt(process.env.CLAUDE_MAX_RETRIES || "3")
  },
  budget: {
    dailyUsd: parseFloat(process.env.DAILY_BUDGET_USD || "100"),
    monthlyUsd: parseFloat(process.env.MONTHLY_BUDGET_USD || "2000")
  }
};
```

## 응답 캐싱

동일한 요청에 대한 중복 API 호출 방지:

```typescript
import { Redis } from "ioredis";
import Anthropic from "@anthropic-ai/sdk";
import crypto from "crypto";

const redis = new Redis(process.env.REDIS_URL);
const client = new Anthropic();

function getCacheKey(prompt: string, model: string): string {
  return `claude:${crypto
    .createHash("sha256")
    .update(`${model}:${prompt}`)
    .digest("hex")}`;
}

async function cachedQuery(
  prompt: string,
  ttlSeconds = 3600
): Promise<string> {
  const cacheKey = getCacheKey(prompt, config.anthropic.model);

  // 캐시 확인
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log("✅ 캐시 히트");
    return cached;
  }

  // API 호출
  const response = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: config.anthropic.maxTokens,
    messages: [{ role: "user", content: prompt }]
  });

  const text = response.content[0].type === "text"
    ? response.content[0].text
    : "";

  // 캐시 저장
  await redis.setex(cacheKey, ttlSeconds, text);
  return text;
}
```

## 비용 모니터링

```typescript
import Anthropic from "@anthropic-ai/sdk";

interface UsageRecord {
  timestamp: Date;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  requestId: string;
}

// 모델별 토큰당 비용 (USD per 1M tokens, 2026년 기준)
const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  "claude-opus-4-6": { input: 15, output: 75 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-5": { input: 0.25, output: 1.25 }
};

function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = TOKEN_COSTS[model] || TOKEN_COSTS["claude-sonnet-4-6"];
  return (inputTokens * costs.input + outputTokens * costs.output) / 1_000_000;
}

class CostTracker {
  private records: UsageRecord[] = [];
  private dailyTotal = 0;

  async track(
    response: Anthropic.Message,
    requestId: string
  ): Promise<void> {
    const cost = calculateCost(
      response.model,
      response.usage.input_tokens,
      response.usage.output_tokens
    );

    const record: UsageRecord = {
      timestamp: new Date(),
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      estimatedCostUsd: cost,
      requestId
    };

    this.records.push(record);
    this.dailyTotal += cost;

    // 일일 예산 초과 경고
    if (this.dailyTotal > config.budget.dailyUsd * 0.8) {
      console.warn(`⚠️ 일일 예산의 80% 초과: $${this.dailyTotal.toFixed(2)}`);
    }

    // 실제로는 DB에 저장
    await this.saveToDatabase(record);
  }

  getDailyTotal(): number {
    return this.dailyTotal;
  }

  private async saveToDatabase(record: UsageRecord) {
    // DB 저장 로직
  }
}
```

## 큐 기반 처리

대량 요청을 큐로 안정적으로 처리:

```typescript
import Bull from "bull";
import Anthropic from "@anthropic-ai/sdk";

const aiQueue = new Bull("ai-tasks", {
  redis: process.env.REDIS_URL,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false
  }
});

// 워커 정의
aiQueue.process(3, async (job) => { // 최대 3개 동시 처리
  const { prompt, userId, requestId } = job.data;

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }]
    });

    const text = response.content[0].type === "text"
      ? response.content[0].text
      : "";

    // 결과 저장 (웹소켓으로 클라이언트에게 알림 등)
    await notifyUser(userId, requestId, text);
    return text;
  } catch (error) {
    console.error(`요청 실패 [${requestId}]:`, error);
    throw error; // Bull이 재시도
  }
});

// 이벤트 핸들러
aiQueue.on("completed", (job) => {
  console.log(`✅ 완료: ${job.id}`);
});

aiQueue.on("failed", (job, err) => {
  console.error(`❌ 실패: ${job.id} - ${err.message}`);
});

// 작업 추가
async function submitAITask(prompt: string, userId: string) {
  const requestId = crypto.randomUUID();
  await aiQueue.add({ prompt, userId, requestId });
  return requestId;
}
```

## 관찰 가능성 (Observability)

```typescript
import { trace, context, SpanStatusCode } from "@opentelemetry/api";

const tracer = trace.getTracer("claude-service");

async function tracedClaudeCall(prompt: string): Promise<string> {
  return tracer.startActiveSpan("claude.messages.create", async (span) => {
    try {
      span.setAttributes({
        "claude.model": config.anthropic.model,
        "claude.prompt_length": prompt.length,
        "user.id": getCurrentUserId()
      });

      const client = new Anthropic();
      const response = await client.messages.create({
        model: config.anthropic.model,
        max_tokens: config.anthropic.maxTokens,
        messages: [{ role: "user", content: prompt }]
      });

      span.setAttributes({
        "claude.input_tokens": response.usage.input_tokens,
        "claude.output_tokens": response.usage.output_tokens,
        "claude.stop_reason": response.stop_reason
      });
      span.setStatus({ code: SpanStatusCode.OK });

      return response.content[0].type === "text"
        ? response.content[0].text
        : "";
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message
      });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

## 헬스체크 및 알림

```typescript
import express from "express";

const app = express();

// 헬스체크 엔드포인트
app.get("/health", async (req, res) => {
  const checks = {
    api: false,
    redis: false,
    queue: false
  };

  // Anthropic API 연결 확인
  try {
    const client = new Anthropic();
    await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 10,
      messages: [{ role: "user", content: "ping" }]
    });
    checks.api = true;
  } catch {}

  // Redis 연결 확인
  try {
    await redis.ping();
    checks.redis = true;
  } catch {}

  // 큐 상태 확인
  try {
    const waiting = await aiQueue.getWaitingCount();
    checks.queue = waiting < 1000; // 1000개 이상이면 이상
  } catch {}

  const allHealthy = Object.values(checks).every(Boolean);
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "healthy" : "degraded",
    checks,
    timestamp: new Date().toISOString()
  });
});
```

## 프로덕션 배포 체크리스트

:::tip 배포 전 확인사항
**보안**
- [ ] API 키가 환경 변수로만 관리되고 코드에 없음
- [ ] 입력 검증으로 프롬프트 인젝션 방어
- [ ] 출력 sanitization (XSS 방지)
- [ ] 요청별 사용자 인증/인가 확인

**안정성**
- [ ] 재시도 로직 (지수 백오프)
- [ ] 타임아웃 설정
- [ ] 서킷 브레이커 패턴 적용
- [ ] 큐로 급격한 트래픽 처리

**비용**
- [ ] 일일/월별 예산 알림 설정
- [ ] 토큰 사용량 추적
- [ ] 캐싱으로 중복 요청 방지
- [ ] 작업별 적합한 모델 선택

**관찰 가능성**
- [ ] 분산 트레이싱 (OpenTelemetry)
- [ ] 메트릭 대시보드 (Grafana/Datadog)
- [ ] 에러 알림 (PagerDuty/Slack)
- [ ] 응답 품질 모니터링
:::

---

다음 단계: [캡스톤 — 기업 팀 에이전트 구축 →](/docs/capstone/overview)
